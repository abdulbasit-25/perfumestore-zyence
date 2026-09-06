import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SessionUser } from "@/lib/auth-types";
export type { SessionUser } from "@/lib/auth-types";

function jwtSecret() {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET must be configured");
  return secret;
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Create a JWT token for a user
 */
export function createToken(user: SessionUser): string {
  return jwt.sign(user, jwtSecret(), { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, jwtSecret()) as SessionUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Normalize email for storage (lowercase)
 */
