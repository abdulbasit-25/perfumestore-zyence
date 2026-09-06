import { createServerFn } from "@tanstack/react-start";
import type { Document, UpdateFilter } from "mongodb";
import { z } from "zod";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/catalog-types";
import type { PageResult } from "@/lib/pagination";
import { readPage } from "@/lib/pagination";

export const orderInputSchema = z.object({
  token: z.string().min(1).optional(),
  customer: z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Valid email is required"),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number is required")
      .max(30)
      .regex(/^[+\d][\d\s().-]{6,29}$/, "Valid phone number is required"),
  }),
  shippingAddress: z.object({
    address: z.string().trim().min(6, "Street address is required"),
    address2: z.string().trim().max(120).optional(),
    city: z.string().trim().min(2, "City is required"),
    province: z.string().trim().min(2, "Province/state is required"),
    postalCode: z.string().trim().min(3, "Postal or ZIP code is required"),
    country: z.string().trim().min(2, "Country is required"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().refine(isObjectId),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  couponCode: z.string().trim().min(3).max(32).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

async function database() {
  const { ensureCollection, ensureIndex, getMongoDb } = await import("@/lib/mongodb");
  const db = await getMongoDb();
  await ensureCollection(db, "orders");
  await Promise.all([
    ensureIndex(db, "orders", { orderNumber: 1 }, { unique: true }),
    ensureIndex(db, "orders", { userId: 1, createdAt: -1 }),
    ensureIndex(db, "orders", { status: 1 }),
    ensureIndex(db, "orders", { paymentStatus: 1 }),
    ensureIndex(db, "orders", { createdAt: -1 }),
  ]);
  return db;
}

export async function authenticatedUser(token: string | undefined, adminOnly = false) {
  const { ObjectId } = await import("mongodb");
  if (!token) {
    const { getCookie } = await import("@tanstack/start-server-core");
    token = getCookie("auth-token");
  }
  if (!token) throw new Error("UNAUTHORIZED");
  const { verifyToken } = await import("@/lib/auth");
  const tokenUser = verifyToken(token);
  if (!tokenUser || !isObjectId(tokenUser.id)) throw new Error("UNAUTHORIZED");
  const db = await database();
  const user = await db.collection("users").findOne({ _id: new ObjectId(tokenUser.id) });
  if (!user || user["status"] === "disabled") throw new Error("UNAUTHORIZED");
  if (adminOnly && user["role"] !== "admin" && user["role"] !== "manager") {
    throw new Error("FORBIDDEN");
  }
  return { db, user };
}

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => orderInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    const { db, user } = await authenticatedUser(data.token);
    const { getMongoClient } = await import("@/lib/mongodb");
    const client = await getMongoClient();
    const quantities = new Map<string, number>();
    for (const item of data.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    const productIds = [...quantities.keys()].map((id) => new ObjectId(id));
    const session = client.startSession();
    try {
      let savedOrder: Record<string, unknown> | null = null;
      await session.withTransaction(async () => {
        const products = await db
          .collection("products")
          .find({ _id: { $in: productIds }, isActive: true }, { session })
          .toArray();
        const byId = new Map(products.map((product) => [product._id.toString(), product]));
        const resolvedItems = [];

        for (const [productId, quantity] of quantities) {
          const product = byId.get(productId);
          if (!product) throw new Error("PRODUCT_NOT_FOUND");
          const reserved = await db
            .collection("products")
            .updateOne(
              { _id: product._id, isActive: true, stock: { $gte: quantity } },
              { $inc: { stock: -quantity } },
              { session },
            );
          if (reserved.modifiedCount !== 1) throw new Error("INSUFFICIENT_STOCK");
          resolvedItems.push({
            productId: product._id,
            name: String(product["name"]),
            slug: String(product["slug"]),
            sku: String(product["sku"]),
            price: Number(product["price"]),
            quantity,
            image: Array.isArray(product["images"])
              ? String((product["images"] as { url?: unknown }[])[0]?.url ?? "")
              : "",
          });
        }

        const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 200 ? 0 : 12;
        let discount = 0;
        let couponCode: string | undefined;
        if (data.couponCode) {
          const { calculateCouponDiscount, validateCouponForOrder } =
            await import("@/lib/coupon-server");
          const coupon = await validateCouponForOrder(db, data.couponCode, subtotal, session);
          discount = calculateCouponDiscount(
            {
              discountType: coupon["discountType"] as "percentage" | "fixed" | "free_shipping",
              value: Number(coupon["value"] ?? 0),
            },
            subtotal,
            shipping,
          );
          const usage = await db.collection("coupons").updateOne(
            {
              _id: coupon["_id"],
              active: { $ne: false },
              $or: [
                { usageLimit: null },
                { usageLimit: { $gt: Number(coupon["usageCount"] ?? 0) } },
              ],
            },
            { $inc: { usageCount: 1 } },
            { session },
          );
          if (usage.modifiedCount !== 1) throw new Error("COUPON_USAGE_LIMIT");
          couponCode = String(coupon["code"]);
        }
        const now = new Date();
        const order = {
          orderNumber: await nextOrderNumber(db, session),
          userId: user["_id"],
          customer: {
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
          },
          shippingAddress: data.shippingAddress,
          items: resolvedItems,
          subtotal,
          shipping,
          ...(couponCode ? { couponCode, discount } : {}),
          total: subtotal + shipping - discount,
          paymentMethod: "COD" as const,
          paymentStatus: "unpaid" as const,
          status: "Pending" as const,
          statusHistory: [{ status: "Pending" as const, timestamp: now }],
          ...(data.notes ? { notes: data.notes } : {}),
          createdAt: now,
          updatedAt: now,
        };
        const result = await db.collection("orders").insertOne(order, { session });
        savedOrder = await db.collection("orders").findOne({ _id: result.insertedId }, { session });
      });
      return { success: true, order: savedOrder ? mongoToOrder(savedOrder) : undefined };
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return { success: false, message: "Some items are no longer available" };
      }
      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        return {
          success: false,
          message: "Some items are no longer available in the requested quantity",
        };
      }
      if (error instanceof Error && error.message === "INVALID_COUPON") {
        return { success: false, message: "That coupon is not valid" };
      }
      if (error instanceof Error && error.message === "EXPIRED_COUPON") {
        return { success: false, message: "That coupon has expired or is not active yet" };
      }
      if (error instanceof Error && error.message === "COUPON_MINIMUM") {
        return { success: false, message: "Your order does not meet the coupon minimum" };
      }
      if (error instanceof Error && error.message === "COUPON_USAGE_LIMIT") {
        return { success: false, message: "That coupon has reached its usage limit" };
      }
      console.error("Create order error:", error);
      return { success: false, message: "Unable to place your order" };
    } finally {
      await session.endSession();
    }
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const { db, user } = await authenticatedUser(token);
    const orders = await db
      .collection("orders")
      .find({ userId: user["_id"] })
      .sort({ createdAt: -1 })
      .toArray();
    return orders.map(mongoToOrder);
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .validator(
    (data: { token: string; status?: OrderStatus; page?: number; pageSize?: number }) => data,
  )
  .handler(async ({ data }): Promise<PageResult<Order>> => {
    const { db } = await authenticatedUser(data.token, true);
    const query = data.status ? { status: data.status } : {};
    const pagination = readPage(data.page, data.pageSize);
    const total = await db.collection("orders").countDocuments(query);
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();
    return {
      items: orders.map(mongoToOrder),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  });

export type RevenuePoint = {
  month: string;
  revenue: number;
  orders: number;
};

export const getAdminRevenue = createServerFn({ method: "GET" })
  .validator((data: { token: string; months?: number }) => data)
  .handler(async ({ data }): Promise<RevenuePoint[]> => {
    const { db } = await authenticatedUser(data.token, true);
    const monthCount = Math.min(Math.max(data.months ?? 6, 1), 24);
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthCount + 1, 1));
    const monthKeys = Array.from({ length: monthCount }, (_, index) => {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthCount + 1 + index, 1),
      );
      return {
        key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
      };
    });
    const grouped = await db
      .collection("orders")
      .aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: { createdAt: { $gte: start }, status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } },
            revenue: { $sum: { $ifNull: ["$total", 0] } },
            orders: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const byMonth = new Map(grouped.map((entry) => [entry._id, entry]));
    return monthKeys.map(({ key, label }) => ({
      month: label,
      revenue: Number(byMonth.get(key)?.revenue ?? 0),
      orders: Number(byMonth.get(key)?.orders ?? 0),
    }));
  });

export const getOrderById = createServerFn({ method: "GET" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    const { db, user } = await authenticatedUser(data.token);
    const orderFilter = isObjectId(data.id)
      ? { _id: new ObjectId(data.id) }
      : { orderNumber: data.id };
    const query = user["role"] === "admin" ? orderFilter : { ...orderFilter, userId: user["_id"] };
    const order = await db.collection("orders").findOne(query);
    return order ? mongoToOrder(order) : null;
  });

export const getMyOrderForChatbot = createServerFn({ method: "GET" })
  .validator((data: { token: string; orderNumber: string }) => data)
  .handler(async ({ data }) => {
    const { db, user } = await authenticatedUser(data.token);
    const order = await db.collection("orders").findOne({
      orderNumber: data.orderNumber.trim().toUpperCase(),
      userId: user["_id"],
    });
    return order ? mongoToOrder(order) : null;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; status: OrderStatus; note?: string }) => data)
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    if (!statuses.includes(data.status)) return { success: false, message: "Invalid order status" };
    const { db } = await authenticatedUser(data.token, true);
    const now = new Date();
    const filter = isObjectId(data.id) ? { _id: new ObjectId(data.id) } : { orderNumber: data.id };
    const statusUpdate = {
      $set: { status: data.status, updatedAt: now },
      $push: {
        statusHistory: {
          status: data.status,
          timestamp: now,
          ...(data.note ? { note: data.note } : {}),
        },
      },
    } as unknown as UpdateFilter<Document>;
    const update = await db.collection("orders").updateOne(filter, statusUpdate);
    const result = update.modifiedCount ? await db.collection("orders").findOne(filter) : null;
    return result
      ? { success: true, order: mongoToOrder(result) }
      : { success: false, message: "Order not found" };
  });

export const updatePaymentStatus = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; paymentStatus: PaymentStatus }) => data)
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    if (!["unpaid", "paid"].includes(data.paymentStatus))
      return { success: false, message: "Invalid payment status" };
    const { db } = await authenticatedUser(data.token, true);
    const filter = isObjectId(data.id) ? { _id: new ObjectId(data.id) } : { orderNumber: data.id };
    const update = await db.collection("orders").updateOne(filter, {
      $set: { paymentStatus: data.paymentStatus, updatedAt: new Date() },
    });
    const result = update.matchedCount ? await db.collection("orders").findOne(filter) : null;
    return result
      ? { success: true, order: mongoToOrder(result) }
      : { success: false, message: "Order not found" };
  });

async function nextOrderNumber(
  db: Awaited<ReturnType<typeof database>>,
  session?: import("mongodb").ClientSession,
): Promise<string> {
  const orderNumber = `SRL-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
  const existing = await db
    .collection("orders")
    .findOne({ orderNumber }, session ? { session } : {});
  return existing ? nextOrderNumber(db, session) : orderNumber;
}

export function mongoToOrder(doc: Record<string, unknown>): Order {
  const statusHistory = Array.isArray(doc["statusHistory"])
    ? (doc["statusHistory"] as Record<string, unknown>[])
    : [];
  const customer = (doc["customer"] ?? {}) as Record<string, unknown>;
  const shippingAddress = (doc["shippingAddress"] ?? {}) as Record<string, unknown>;
  const items = Array.isArray(doc["items"]) ? (doc["items"] as Record<string, unknown>[]) : [];
  const addressLine = String(shippingAddress["address"] ?? "");
  const address2Line = String(shippingAddress["address2"] ?? "");
  const cityLine = String(shippingAddress["city"] ?? "");
  const provinceLine = String(shippingAddress["province"] ?? "");
  const postalLine = String(shippingAddress["postalCode"] ?? "");
  const countryLine = String(shippingAddress["country"] ?? "");
  const shippingText = [
    addressLine,
    address2Line,
    [cityLine, provinceLine, postalLine].filter(Boolean).join(", "),
    countryLine,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: String(doc["orderNumber"] ?? doc["_id"] ?? ""),
    customerId: String(doc["userId"] ?? ""),
    customerName: String(customer["name"] ?? ""),
    customerEmail: String(customer["email"] ?? ""),
    customerPhone: String(customer["phone"] ?? ""),
    items: items.map((item) => ({
      productId: String(item["productId"]),
      name: String(item["name"]),
      qty: Number(item["quantity"]),
      priceAtPurchase: Number(item["price"]),
    })),
    shippingAddress: shippingText,
    shippingAddressDetails: {
      address: addressLine,
      ...(address2Line ? { address2: address2Line } : {}),
      city: cityLine,
      ...(provinceLine ? { province: provinceLine } : {}),
      ...(postalLine ? { postalCode: postalLine } : {}),
      ...(countryLine ? { country: countryLine } : {}),
    },
    status: String(doc["status"] ?? "Pending") as OrderStatus,
    totalAmount: Number(doc["total"] ?? 0),
    paymentMethod: "COD",
    paid: doc["paymentStatus"] === "paid",
    ...(doc["notes"] ? { notes: String(doc["notes"]) } : {}),
    statusHistory: statusHistory.map((entry) => ({
      status: String(entry["status"]) as OrderStatus,
      at: new Date(String(entry["timestamp"])).toISOString().slice(0, 10),
    })),
    createdAt: new Date(String(doc["createdAt"])).toISOString().slice(0, 10),
  };
}
