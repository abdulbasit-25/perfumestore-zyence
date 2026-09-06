import type { Db } from "mongodb";
import type { SessionUser } from "@/lib/auth-types";
import { hasPermission, type Permission, type UserRole } from "@/lib/permissions";

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export async function requirePermission(
  token: string | undefined,
  permission: Permission,
): Promise<{ db: Db; user: SessionUser; role: UserRole }> {
  const { verifyToken } = await import("@/lib/auth");
  const { getMongoDb } = await import("@/lib/mongodb");
  const { ObjectId } = await import("mongodb");
  if (!token) {
    const { getCookie } = await import("@tanstack/start-server-core");
    token = getCookie("auth-token");
  }
  if (!token) throw new Error("UNAUTHORIZED");
  const tokenUser = verifyToken(token);
  if (!tokenUser || !isObjectId(tokenUser.id)) throw new Error("UNAUTHORIZED");
  const db = await getMongoDb();
  const account = await db.collection("users").findOne({ _id: new ObjectId(tokenUser.id) });
  const role = String(account?.["role"] ?? "customer") as UserRole;
  if (!account || account["status"] === "disabled") throw new Error("UNAUTHORIZED");
  if (!hasPermission(role, permission)) throw new Error("FORBIDDEN");
  return { db, user: { ...tokenUser, role }, role };
}

export async function requireAuthenticatedUser(token: string | undefined) {
  const { verifyToken } = await import("@/lib/auth");
  const { getMongoDb } = await import("@/lib/mongodb");
  const { ObjectId } = await import("mongodb");
  if (!token) {
    const { getCookie } = await import("@tanstack/start-server-core");
    token = getCookie("auth-token");
  }
  if (!token) throw new Error("UNAUTHORIZED");
  const tokenUser = verifyToken(token);
  if (!tokenUser || !isObjectId(tokenUser.id)) throw new Error("UNAUTHORIZED");
  const db = await getMongoDb();
  const account = await db.collection("users").findOne({ _id: new ObjectId(tokenUser.id) });
  if (!account || account["status"] === "disabled") throw new Error("UNAUTHORIZED");
  return {
    db,
    user: { ...tokenUser, role: String(account["role"] ?? "customer") as UserRole },
    account,
  };
}
