import { createServerFn } from "@tanstack/react-start";
import { ObjectId } from "mongodb";
import { z } from "zod";
import type { Category } from "@/lib/catalog-types";

const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().optional(),
});

async function database() {
  const { ensureIndex, getMongoDb } = await import("@/lib/mongodb");
  const db = await getMongoDb();
  await ensureIndex(db, "categories", { slug: 1 }, { unique: true });
  return db;
}

async function requireAdmin(token: string | undefined) {
  const db = await database();
  const { requirePermission } = await import("@/lib/authorization-server");
  return (await requirePermission(token, "manageCategories")).db;
}

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const db = await database();
    const categories = await db.collection("categories").find({}).sort({ name: 1 }).toArray();
    return categories.map((category) => {
      const record = category as unknown as {
        _id: ObjectId;
        name: unknown;
        slug: unknown;
        description?: unknown;
      };
      return {
        id: record._id.toString(),
        name: String(record.name),
        slug: String(record.slug),
        description: record.description ? String(record.description) : "",
      };
    });
  },
);

export const createCategory = createServerFn({ method: "POST" })
  .validator((data: { token: string; category: Omit<Category, "id"> }) => data)
  .handler(async ({ data }) => {
    const { requirePermission } = await import("@/lib/authorization-server");
    const db = (await requirePermission(data.token, "manageCategories")).db;
    const parsed = categorySchema.safeParse(data.category);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message };
    const now = new Date();
    try {
      const result = await db
        .collection("categories")
        .insertOne({ ...parsed.data, createdAt: now, updatedAt: now });
      return { success: true, id: result.insertedId.toString() };
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return { success: false, message: "Category slug already exists" };
      }
      console.error("Create category error:", error);
      return { success: false, message: "Failed to create category" };
    }
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const db = await requireAdmin(data.token);
    if (!ObjectId.isValid(data.id)) return { success: false, message: "Category not found" };
    const productCount = await db
      .collection("products")
      .countDocuments({ categoryId: new ObjectId(data.id) });
    if (productCount > 0) {
      return { success: false, message: "Cannot delete a category that has products" };
    }
    const result = await db.collection("categories").deleteOne({ _id: new ObjectId(data.id) });
    return result.deletedCount === 1
      ? { success: true }
      : { success: false, message: "Category not found" };
  });
