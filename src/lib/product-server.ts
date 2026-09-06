import { createServerFn } from "@tanstack/react-start";
import { ObjectId } from "mongodb";
import { z } from "zod";
import type { Product, ProductImage, ProductInput } from "@/lib/catalog-types";

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().min(1),
});

const productSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1),
  price: z.number().finite().nonnegative(),
  sku: z.string().trim().min(1),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().refine(ObjectId.isValid, "Invalid category"),
  images: z.array(imageSchema).min(1),
  isActive: z.boolean().optional(),
  rating: z.number().finite().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
});

type ProductFilters = {
  category?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

async function database() {
  const { ensureIndex, getMongoDb } = await import("@/lib/mongodb");
  const db = await getMongoDb();
  await Promise.all([
    ensureIndex(db, "products", { slug: 1 }, { unique: true }),
    ensureIndex(db, "products", { sku: 1 }, { unique: true }),
    ensureIndex(db, "products", { categoryId: 1 }),
    ensureIndex(db, "products", { createdAt: -1 }),
  ]);
  return db;
}

async function requireAdmin(token: string | undefined) {
  const db = await database();
  const { requirePermission } = await import("@/lib/authorization-server");
  return (await requirePermission(token, "manageProducts")).db;
}

export const getProducts = createServerFn({ method: "GET" })
  .validator((data?: ProductFilters) => data)
  .handler(async ({ data: filters }): Promise<Product[]> => {
    const db = await database();
    const query: Record<string, unknown> = { isActive: true };
    const categoryValue = filters?.categoryId ?? filters?.category;
    if (categoryValue) {
      const categoryId = ObjectId.isValid(categoryValue)
        ? new ObjectId(categoryValue)
        : (await db.collection("categories").findOne({ slug: categoryValue }))?._id;
      if (categoryId) query["categoryId"] = categoryId;
    }
    if (filters?.inStock) query["stock"] = { $gt: 0 };
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query["price"] = {
        ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
      };
    }
    if (filters?.search?.trim()) {
      const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query["$or"] = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }
    const products = await db.collection("products").find(query).sort({ createdAt: -1 }).toArray();
    return products.map(mongoToProduct);
  });

export const searchProducts = getProducts;

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Product | null> => {
    const db = await database();
    const product = await db.collection("products").findOne({ slug, isActive: true });
    return product ? mongoToProduct(product) : null;
  });

export const getProductById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<Product | null> => {
    if (!ObjectId.isValid(id)) return null;
    const db = await database();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id), isActive: true });
    return product ? mongoToProduct(product) : null;
  });

export const getProductsByIds = createServerFn({ method: "POST" })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }): Promise<Product[]> => {
    const validIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));
    if (validIds.length === 0) return [];
    const db = await database();
    const products = await db
      .collection("products")
      .find({ _id: { $in: validIds }, isActive: true })
      .toArray();
    return products.map(mongoToProduct);
  });

export const uploadProductImage = createServerFn({ method: "POST" })
  .validator((data: { token: string; productId: string; fileName: string; base64: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { uploadProductImage: upload } = await import("@/lib/cloudinary");
    const result = await upload(Buffer.from(data.base64, "base64"), data.productId, data.fileName);
    return { success: true, ...result };
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: { token: string; product: ProductInput }) => data)
  .handler(async ({ data }) => {
    const db = await requireAdmin(data.token);
    const parsed = productSchema.safeParse(data.product);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message };
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(parsed.data.categoryId) });
    if (!category) return { success: false, message: "Category not found" };
    const now = new Date();
    try {
      const result = await db.collection("products").insertOne({
        ...parsed.data,
        categoryId: new ObjectId(parsed.data.categoryId),
        createdAt: now,
        updatedAt: now,
      });
      const product = await db.collection("products").findOne({ _id: result.insertedId });
      return { success: true, product: product ? mongoToProduct(product) : undefined };
    } catch (error) {
      if (isDuplicateKey(error)) return { success: false, message: "SKU or slug already exists" };
      console.error("Create product error:", error);
      return { success: false, message: "Failed to create product" };
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; updates: Partial<ProductInput> }) => data)
  .handler(async ({ data }) => {
    const db = await requireAdmin(data.token);
    if (!ObjectId.isValid(data.id)) return { success: false, message: "Product not found" };
    const current = await db.collection("products").findOne({ _id: new ObjectId(data.id) });
    if (!current) return { success: false, message: "Product not found" };
    const parsed = productSchema.partial().safeParse(data.updates);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message };
    if (parsed.data.categoryId) {
      const category = await db
        .collection("categories")
        .findOne({ _id: new ObjectId(parsed.data.categoryId) });
      if (!category) return { success: false, message: "Category not found" };
    }
    const updates = {
      ...parsed.data,
      ...(parsed.data.categoryId ? { categoryId: new ObjectId(parsed.data.categoryId) } : {}),
      updatedAt: new Date(),
    };
    try {
      const result = await db
        .collection("products")
        .findOneAndUpdate(
          { _id: new ObjectId(data.id) },
          { $set: updates },
          { returnDocument: "after" },
        );
      if (!result) return { success: false, message: "Product not found" };
      const previousImages = (current["images"] as ProductImage[] | undefined) ?? [];
      const nextImages = (result["images"] as ProductImage[] | undefined) ?? [];
      const replacedPublicIds = previousImages
        .map((image) => image.publicId)
        .filter((publicId) => !nextImages.some((image) => image.publicId === publicId));
      if (replacedPublicIds.length > 0) {
        const { deleteProductImage } = await import("@/lib/cloudinary");
        for (const publicId of replacedPublicIds) await deleteProductImage(publicId);
      }
      return { success: true, product: mongoToProduct(result) };
    } catch (error) {
      if (isDuplicateKey(error)) return { success: false, message: "SKU or slug already exists" };
      console.error("Update product error:", error);
      return { success: false, message: "Failed to update product" };
    }
  });

export const updateProductStock = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; stock: number }) => data)
  .handler(async ({ data }) =>
    updateProduct({ data: { token: data.token, id: data.id, updates: { stock: data.stock } } }),
  );

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const { requirePermission } = await import("@/lib/authorization-server");
    const db = (await requirePermission(data.token, "deleteData")).db;
    if (!ObjectId.isValid(data.id)) return { success: false, message: "Product not found" };
    const product = await db.collection("products").findOne({ _id: new ObjectId(data.id) });
    if (!product) return { success: false, message: "Product not found" };
    const images = (product["images"] as ProductImage[] | undefined) ?? [];
    if (images.length > 0) {
      const { deleteProductImage } = await import("@/lib/cloudinary");
      for (const image of images) await deleteProductImage(image.publicId);
    }
    await db.collection("products").deleteOne({ _id: new ObjectId(data.id) });
    return { success: true };
  });

function isDuplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function mongoToProduct(doc: Record<string, unknown>): Product {
  const id = doc["_id"] instanceof ObjectId ? doc["_id"].toString() : "";
  const images = Array.isArray(doc["images"]) ? (doc["images"] as ProductImage[]) : [];
  const createdAt =
    doc["createdAt"] instanceof Date ? doc["createdAt"] : new Date(String(doc["createdAt"]));
  const updatedAt =
    doc["updatedAt"] instanceof Date
      ? doc["updatedAt"]
      : new Date(String(doc["updatedAt"] ?? doc["createdAt"]));
  return {
    id,
    name: String(doc["name"] ?? ""),
    slug: String(doc["slug"] ?? ""),
    description: String(doc["description"] ?? ""),
    price: Number(doc["price"] ?? 0),
    sku: String(doc["sku"] ?? ""),
    stock: Number(doc["stock"] ?? 0),
    categoryId:
      doc["categoryId"] instanceof ObjectId
        ? doc["categoryId"].toString()
        : String(doc["categoryId"] ?? ""),
    categorySlug: String(doc["categorySlug"] ?? ""),
    images,
    image: images[0]?.url ?? "",
    isActive: doc["isActive"] !== false,
    rating: Number(doc["rating"] ?? 0),
    reviewCount: Number(doc["reviewCount"] ?? 0),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
