import { createServerFn } from "@tanstack/react-start";
import type { SessionUser } from "@/lib/auth-types";
import { loginUser as authenticateUser, registerUser as createUser } from "@/lib/auth-api";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d][\d\s().-]{6,29}$/, "Enter a valid phone number")
    .or(z.literal("")),
  avatarUrl: z.string().max(2_000_000, "Profile photo is too large").or(z.literal("")),
});

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const result = await authenticateUser(data.email, data.password);
    if (result.success && result.token) {
      const { setCookie } = await import("@tanstack/start-server-core");
      const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
      setCookie("auth-token", result.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: Boolean(secure),
      });
    }
    return result.success && result.user
      ? { success: true, user: result.user }
      : { success: false, message: result.message };
  });

export const registerUser = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => createUser(data.name, data.email, data.password));

// Server function to get current user
export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const { verifyToken } = await import("@/lib/auth");
      const { getCookie } = await import("@tanstack/start-server-core");
      const token = getCookie("auth-token");
      if (!token) return null;
      const tokenUser = verifyToken(token);
      if (!tokenUser) return null;
      const { getMongoDb } = await import("@/lib/mongodb");
      const { ObjectId } = await import("mongodb");
      if (!ObjectId.isValid(tokenUser.id)) return null;
      const user = await (
        await getMongoDb()
      )
        .collection("users")
        .findOne({ _id: new ObjectId(tokenUser.id) });
      if (!user || user["status"] === "disabled") return null;
      return {
        ...tokenUser,
        name: String(user["name"] ?? tokenUser.name),
        email: String(user["email"] ?? tokenUser.email),
        role: (user["role"] as SessionUser["role"]) ?? tokenUser.role,
        status: "active",
        ...(typeof user["phone"] === "string" ? { phone: user["phone"] } : {}),
        ...(typeof user["avatarUrl"] === "string" ? { avatarUrl: user["avatarUrl"] } : {}),
      };
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },
);

export const updateProfile = createServerFn({ method: "POST" })
  .validator((data: { token?: string; profile: unknown }) => data)
  .handler(async ({ data }) => {
    const parsed = profileSchema.safeParse(data.profile);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid profile" };
    }
    try {
      const { db, user, account } = await (async () => {
        const { requireAuthenticatedUser } = await import("@/lib/authorization-server");
        return requireAuthenticatedUser(data.token);
      })();
      const now = new Date();
      await db.collection("users").updateOne(
        { _id: account["_id"] },
        {
          $set: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            avatarUrl: parsed.data.avatarUrl,
            updatedAt: now,
          },
        },
      );
      return {
        success: true,
        user: {
          id: String(account["_id"]),
          name: parsed.data.name,
          email: String(user["email"]),
          role: String(user["role"] ?? "customer") as SessionUser["role"],
          status: "active" as const,
          phone: parsed.data.phone,
          avatarUrl: parsed.data.avatarUrl,
        },
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "Unable to update your profile right now." };
    }
  });

// Server function for logout
export const logoutUser = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const { deleteCookie } = await import("@tanstack/start-server-core");
    deleteCookie("auth-token", { path: "/" });
    return { success: true };
  },
);
