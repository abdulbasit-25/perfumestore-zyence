import { createServerFn } from "@tanstack/react-start";
import type { ClientSession, Db } from "mongodb";
import { z } from "zod";

export type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumOrderAmount: number;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .transform((value) => value.toUpperCase()),
  discountType: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().finite().positive(),
  minimumOrderAmount: z.number().finite().nonnegative(),
  usageLimit: z.number().int().positive().nullable(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  active: z.boolean(),
});

const isId = (value: string) => /^[a-f\d]{24}$/i.test(value);

async function adminDb(token: string) {
  const { requirePermission } = await import("@/lib/authorization-server");
  const { db } = await requirePermission(token, "manageCoupons");
  const { ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  await ensureCollection(db, "coupons");
  await Promise.all([
    ensureIndex(db, "coupons", { code: 1 }, { unique: true }),
    ensureIndex(db, "coupons", { active: 1, expiresAt: 1 }),
  ]);
  return db;
}

function toCoupon(doc: Record<string, unknown>): Coupon {
  const date = (value: unknown) =>
    value instanceof Date ? value.toISOString() : String(value ?? "");
  return {
    id: String(doc["_id"] ?? ""),
    code: String(doc["code"] ?? ""),
    discountType: doc["discountType"] as Coupon["discountType"],
    value: Number(doc["value"] ?? 0),
    minimumOrderAmount: Number(doc["minimumOrderAmount"] ?? 0),
    usageLimit: doc["usageLimit"] == null ? null : Number(doc["usageLimit"]),
    usageCount: Number(doc["usageCount"] ?? 0),
    startsAt: date(doc["startsAt"]),
    expiresAt: date(doc["expiresAt"]),
    active: doc["active"] !== false,
  };
}

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "discountType" | "value">,
  subtotal: number,
  shipping: number,
) {
  if (coupon.discountType === "free_shipping") return shipping;
  const requested =
    coupon.discountType === "percentage" ? subtotal * (coupon.value / 100) : coupon.value;
  return Math.min(Math.max(requested, 0), subtotal + shipping);
}

export async function validateCouponForOrder(
  db: Db,
  code: string,
  subtotal: number,
  session?: ClientSession,
) {
  const coupon = await db
    .collection("coupons")
    .findOne({ code: code.trim().toUpperCase() }, session ? { session } : undefined);
  if (!coupon || coupon["active"] === false) throw new Error("INVALID_COUPON");
  const now = new Date();
  const startsAt = new Date(String(coupon["startsAt"]));
  const expiresAt = new Date(String(coupon["expiresAt"]));
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(expiresAt.getTime()) ||
    now < startsAt ||
    now >= expiresAt
  ) {
    throw new Error("EXPIRED_COUPON");
  }
  const usageLimit = coupon["usageLimit"] == null ? null : Number(coupon["usageLimit"]);
  if (usageLimit !== null && Number(coupon["usageCount"] ?? 0) >= usageLimit) {
    throw new Error("COUPON_USAGE_LIMIT");
  }
  if (subtotal < Number(coupon["minimumOrderAmount"] ?? 0)) throw new Error("COUPON_MINIMUM");
  return coupon;
}

export const previewCoupon = createServerFn({ method: "POST" })
  .validator((data: { code: string; subtotal: number; shipping: number }) => data)
  .handler(async ({ data }) => {
    if (!Number.isFinite(data.subtotal) || data.subtotal < 0 || !Number.isFinite(data.shipping)) {
      return { success: false, message: "Invalid order total" };
    }
    try {
      const { getMongoDb } = await import("@/lib/mongodb");
      const db = await getMongoDb();
      const coupon = await validateCouponForOrder(db, data.code, data.subtotal);
      const discount = calculateCouponDiscount(
        {
          discountType: coupon["discountType"] as Coupon["discountType"],
          value: Number(coupon["value"] ?? 0),
        },
        data.subtotal,
        data.shipping,
      );
      return {
        success: true,
        code: String(coupon["code"]),
        discount,
        total: data.subtotal + data.shipping - discount,
        discountType: coupon["discountType"] as Coupon["discountType"],
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message === "COUPON_MINIMUM"
          ? "Your order does not meet the coupon minimum"
          : error instanceof Error && error.message === "EXPIRED_COUPON"
            ? "That coupon has expired or is not active yet"
            : error instanceof Error && error.message === "COUPON_USAGE_LIMIT"
              ? "That coupon has reached its usage limit"
              : "That coupon is not valid";
      return { success: false, message };
    }
  });

export const getCoupons = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const db = await adminDb(data.token);
    return (await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray()).map(
      toCoupon,
    );
  });

export const saveCoupon = createServerFn({ method: "POST" })
  .validator((data: { token: string; id?: string; coupon: z.input<typeof schema> }) => data)
  .handler(async ({ data }) => {
    const parsed = schema.safeParse(data.coupon);
    if (!parsed.success)
      return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid coupon" };
    if (parsed.data.discountType === "percentage" && parsed.data.value > 100)
      return { success: false, message: "Percentage cannot exceed 100" };
    if (new Date(parsed.data.expiresAt) <= new Date(parsed.data.startsAt))
      return { success: false, message: "Expiry must be after start" };
    const db = await adminDb(data.token);
    const document = {
      ...parsed.data,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      const result =
        data.id && isId(data.id)
          ? await db
              .collection("coupons")
              .findOneAndUpdate(
                { _id: (await import("mongodb")).ObjectId.createFromHexString(data.id) },
                { $set: { ...parsed.data, updatedAt: new Date() } },
                { returnDocument: "after" },
              )
          : await db.collection("coupons").insertOne(document);
      const coupon = data.id
        ? result
        : await db.collection("coupons").findOne({ _id: result.insertedId });
      return {
        success: true,
        coupon: coupon ? toCoupon(coupon as Record<string, unknown>) : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          typeof error === "object" && error !== null && "code" in error && error.code === 11000
            ? "Coupon code already exists"
            : "Unable to save coupon",
      };
    }
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!isId(data.id)) return { success: false, message: "Coupon not found" };
    const { requirePermission } = await import("@/lib/authorization-server");
    const db = (await requirePermission(data.token, "deleteData")).db;
    const { ObjectId } = await import("mongodb");
    const result = await db.collection("coupons").deleteOne({ _id: new ObjectId(data.id) });
    return result.deletedCount
      ? { success: true }
      : { success: false, message: "Coupon not found" };
  });
