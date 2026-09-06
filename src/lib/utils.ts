import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate email format — shared by forms so validation logic stays consistent
 * between client and server imports that can't reach @/lib/auth.
 */
export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export const currency = (value: number) => `$${value.toFixed(2)}`;
