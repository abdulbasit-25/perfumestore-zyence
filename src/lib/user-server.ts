import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { validatePassword } from "@/lib/auth-validation";
import type { PageResult } from "@/lib/pagination";
import { readPage } from "@/lib/pagination";

export type ManagedRole = "customer" | "manager" | "admin";
export type ManagedStatus = "active" | "disabled";
export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: ManagedRole;
  status: ManagedStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

const roleSchema = z.enum(["customer", "manager", "admin"]);
const idPattern = /^[a-f\d]{24}$/i;

async function adminDatabase(token: string) {
  const { requirePermission } = await import("@/lib/authorization-server");
  return (await requirePermission(token, "manageUsers")).db;
}

function dateValue(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toManagedUser(doc: Record<string, unknown>): ManagedUser {
  return {
    id: String(doc["_id"] ?? ""),
    name: String(doc["name"] ?? ""),
    email: String(doc["email"] ?? ""),
    role: roleSchema.safeParse(doc["role"]).success ? (doc["role"] as ManagedRole) : "customer",
    status: doc["status"] === "disabled" ? "disabled" : "active",
    createdAt: dateValue(doc["createdAt"]) ?? "",
    lastLoginAt: dateValue(doc["lastLoginAt"]),
  };
}

export const getManagedUsers = createServerFn({ method: "GET" })
  .validator((data: { token: string; page?: number; pageSize?: number }) => data)
  .handler(async ({ data }): Promise<PageResult<ManagedUser>> => {
    const db = await adminDatabase(data.token);
    const pagination = readPage(data.page, data.pageSize);
    const total = await db.collection("users").countDocuments({});
    const users = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();
    return {
      items: users.map(toManagedUser),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  });

export const createManagedUser = createServerFn({ method: "POST" })
  .validator(
    (data: { token: string; name: string; email: string; password: string; role: ManagedRole }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { canAssignRole } = await import("@/lib/permissions");
    const { hashPassword, isValidEmail, normalizeEmail } = await import("@/lib/auth");
    const { getMongoDb } = await import("@/lib/mongodb");
    const { requirePermission } = await import("@/lib/authorization-server");
    const { role } = await requirePermission(data.token, "createUsers");
    const name = data.name.trim();
    const email = normalizeEmail(data.email);
    if (!name) return { success: false, message: "Name is required." };
    if (!isValidEmail(email)) return { success: false, message: "Enter a valid email address." };
    if (!canAssignRole(role, data.role))
      return { success: false, message: "You cannot assign that role." };
    const passwordMessage = validatePassword(data.password);
    if (passwordMessage) return { success: false, message: passwordMessage };
    const db = await getMongoDb();
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    try {
      await db.collection("users").insertOne({
        name,
        email,
        passwordHash: await hashPassword(data.password),
        role: data.role,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return { success: false, message: "An account with this email already exists." };
      }
      console.error("Create managed user error:", error);
      return { success: false, message: "Unable to create user." };
    }
  });

export const updateManagedUser = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      id: string;
      role?: ManagedRole;
      status?: ManagedStatus;
      name?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!idPattern.test(data.id)) return { success: false, message: "User not found." };
    const { canAssignRole } = await import("@/lib/permissions");
    const { ObjectId } = await import("mongodb");
    const { db, user, role } = await (async () => {
      const { requirePermission } = await import("@/lib/authorization-server");
      return requirePermission(data.token, "manageUsers");
    })();
    const target = await db.collection("users").findOne({ _id: new ObjectId(data.id) });
    if (!target) return { success: false, message: "User not found." };
    const targetRole = String(target["role"] ?? "customer") as ManagedRole;
    if (data.role && !canAssignRole(role, data.role)) {
      return { success: false, message: "You cannot assign that role." };
    }
    if (role !== "admin" && targetRole === "admin") {
      return { success: false, message: "Managers cannot modify admin accounts." };
    }
    if (data.role === "admin" && role !== "admin") {
      return { success: false, message: "Only admins can assign admin privileges." };
    }
    if (data.status === "disabled" && targetRole === "admin") {
      return { success: false, message: "Admin accounts cannot be disabled here." };
    }
    if (data.role && targetRole === "admin" && data.role !== "admin") {
      const admins = await db
        .collection("users")
        .countDocuments({ role: "admin", status: { $ne: "disabled" } });
      if (admins <= 1)
        return { success: false, message: "The last active admin cannot be demoted." };
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name?.trim()) update["name"] = data.name.trim();
    if (data.role) update["role"] = data.role;
    if (data.status) update["status"] = data.status;
    await db.collection("users").updateOne({ _id: new ObjectId(data.id) }, { $set: update });
    return { success: true };
  });

export const deleteManagedUser = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!idPattern.test(data.id)) return { success: false, message: "User not found." };
    const { ObjectId } = await import("mongodb");
    const { db, user } = await (async () => {
      const { requirePermission } = await import("@/lib/authorization-server");
      return requirePermission(data.token, "deleteUsers");
    })();
    if (user.id === data.id)
      return { success: false, message: "You cannot delete your own account." };
    const target = await db.collection("users").findOne({ _id: new ObjectId(data.id) });
    if (!target) return { success: false, message: "User not found." };
    if (target["role"] === "admin") {
      const adminCount = await db
        .collection("users")
        .countDocuments({ role: "admin", status: { $ne: "disabled" } });
      if (adminCount <= 1) return { success: false, message: "The last admin cannot be deleted." };
    }
    await db.collection("users").deleteOne({ _id: new ObjectId(data.id) });
    return { success: true };
  });
