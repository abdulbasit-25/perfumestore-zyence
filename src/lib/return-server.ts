import { createServerFn } from "@tanstack/react-start";
import type { PageResult } from "@/lib/pagination";
import { readPage } from "@/lib/pagination";

export type ReturnStatus =
  "Requested" | "Approved" | "Rejected" | "Received" | "Refunded" | "Exchanged";
export type ReturnRequest = {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  customerName: string;
  productName: string;
  quantity: number;
  requestedAmount: number;
  reason: string;
  status: ReturnStatus;
  adminNotes: string;
  createdAt: string;
};
const statuses: ReturnStatus[] = [
  "Requested",
  "Approved",
  "Rejected",
  "Received",
  "Refunded",
  "Exchanged",
];
const isId = (value: string) => /^[a-f\d]{24}$/i.test(value);

async function adminDb(token: string) {
  const { requirePermission } = await import("@/lib/authorization-server");
  const { db, user } = await requirePermission(token, "manageOrders");
  const { ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  await ensureCollection(db, "return_requests");
  await ensureCollection(db, "refunds");
  await Promise.all([
    ensureIndex(db, "return_requests", { orderId: 1, createdAt: -1 }),
    ensureIndex(db, "return_requests", { status: 1, createdAt: -1 }),
    ensureIndex(db, "refunds", { returnId: 1 }, { unique: true }),
  ]);
  return { db, adminId: user.id };
}

async function customerDb(token: string | undefined) {
  const { requireAuthenticatedUser } = await import("@/lib/authorization-server");
  const { db, user, account } = await requireAuthenticatedUser(token);
  const { ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  await ensureCollection(db, "return_requests");
  await ensureIndex(db, "return_requests", { userId: 1, createdAt: -1 });
  return { db, user, account };
}

function toReturn(doc: Record<string, unknown>): ReturnRequest {
  const date =
    doc["createdAt"] instanceof Date ? doc["createdAt"] : new Date(String(doc["createdAt"]));
  return {
    id: String(doc["_id"] ?? ""),
    orderId: String(doc["orderId"] ?? ""),
    userId: String(doc["userId"] ?? ""),
    productId: String(doc["productId"] ?? ""),
    customerName: String(doc["customerName"] ?? ""),
    productName: String(doc["productName"] ?? ""),
    quantity: Number(doc["quantity"] ?? 0),
    requestedAmount: Number(doc["requestedAmount"] ?? 0),
    reason: String(doc["reason"] ?? ""),
    status: String(doc["status"] ?? "Requested") as ReturnStatus,
    adminNotes: String(doc["adminNotes"] ?? ""),
    createdAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
  };
}

export const getMyReturns = createServerFn({ method: "GET" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    const { db, account } = await customerDb(data.token);
    return (
      await db
        .collection("return_requests")
        .find({ userId: account["_id"] })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()
    ).map(toReturn);
  });

export const createReturnRequest = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token?: string;
      orderId: string;
      productId: string;
      quantity: number;
      reason: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!isId(data.productId) || !Number.isInteger(data.quantity) || data.quantity < 1) {
      return { success: false, message: "Choose a valid item and quantity" };
    }
    const reason = data.reason.trim();
    if (reason.length < 10 || reason.length > 1000) {
      return { success: false, message: "Please provide a reason between 10 and 1000 characters" };
    }
    const { db, user, account } = await customerDb(data.token);
    const { ObjectId } = await import("mongodb");
    const order = await db.collection("orders").findOne({
      $and: [
        { userId: account["_id"] },
        { status: "Delivered" },
        isId(data.orderId)
          ? { _id: new ObjectId(data.orderId) }
          : { orderNumber: data.orderId.trim().toUpperCase() },
      ],
    });
    if (!order) return { success: false, message: "Only delivered orders can be returned" };

    const deliveredEntry = Array.isArray(order["statusHistory"])
      ? (order["statusHistory"] as Record<string, unknown>[]).find(
          (entry) => entry["status"] === "Delivered",
        )
      : undefined;
    const deliveredAt = new Date(
      String(
        deliveredEntry?.["timestamp"] ??
          deliveredEntry?.["at"] ??
          order["updatedAt"] ??
          order["createdAt"],
      ),
    );
    if (Number.isNaN(deliveredAt.getTime()) || Date.now() - deliveredAt.getTime() > 14 * 86400000) {
      return { success: false, message: "This order is outside the 14-day return window" };
    }

    const item = (Array.isArray(order["items"]) ? order["items"] : []).find(
      (entry) => String((entry as Record<string, unknown>)["productId"]) === data.productId,
    ) as Record<string, unknown> | undefined;
    if (!item) return { success: false, message: "That item is not part of this order" };
    const orderedQuantity = Number(item["quantity"] ?? item["qty"] ?? 0);
    if (data.quantity > orderedQuantity) {
      return { success: false, message: "Return quantity exceeds the purchased quantity" };
    }
    const existing = await db.collection("return_requests").findOne({
      userId: account["_id"],
      orderId: String(order["orderNumber"] ?? data.orderId),
      productId: new ObjectId(data.productId),
      status: { $nin: ["Rejected"] },
    });
    if (existing)
      return { success: false, message: "A return request already exists for this item" };

    const now = new Date();
    const request = {
      orderId: String(order["orderNumber"] ?? data.orderId),
      userId: user["_id"],
      productId: new ObjectId(data.productId),
      customerName: String(
        (order["customer"] as Record<string, unknown> | undefined)?.["name"] ?? user.name,
      ),
      productName: String(item["name"] ?? "Product"),
      quantity: data.quantity,
      requestedAmount: Number(item["price"] ?? item["priceAtPurchase"] ?? 0) * data.quantity,
      reason,
      status: "Requested" as const,
      adminNotes: "",
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: "Requested", at: now }],
    };
    const result = await db.collection("return_requests").insertOne(request);
    return { success: true, request: toReturn({ ...request, _id: result.insertedId }) };
  });

export const getReturns = createServerFn({ method: "GET" })
  .validator((data: { token: string; page?: number; pageSize?: number }) => data)
  .handler(async ({ data }): Promise<PageResult<ReturnRequest>> => {
    const { db } = await adminDb(data.token);
    const pagination = readPage(data.page, data.pageSize);
    const total = await db.collection("return_requests").countDocuments({});
    const requests = await db
      .collection("return_requests")
      .find({})
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();
    return {
      items: requests.map(toReturn),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  });

export const updateReturn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      id: string;
      status: ReturnStatus;
      adminNotes?: string;
      refundAmount?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!isId(data.id) || !statuses.includes(data.status))
      return { success: false, message: "Invalid return request" };
    const { db, adminId } = await adminDb(data.token);
    const { ObjectId } = await import("mongodb");
    const request = await db.collection("return_requests").findOne({ _id: new ObjectId(data.id) });
    if (!request) return { success: false, message: "Return not found" };
    const amount = data.refundAmount ?? Number(request["requestedAmount"] ?? 0);
    if (amount < 0 || amount > Number(request["requestedAmount"] ?? 0))
      return { success: false, message: "Refund exceeds the eligible amount" };
    const now = new Date();
    const result = await db.collection("return_requests").findOneAndUpdate(
      { _id: new ObjectId(data.id) },
      {
        $set: { status: data.status, adminNotes: data.adminNotes?.trim() ?? "", updatedAt: now },
        $push: { statusHistory: { status: data.status, at: now, adminId } },
      },
      { returnDocument: "after" },
    );
    if (data.status === "Refunded")
      await db.collection("refunds").updateOne(
        { returnId: data.id },
        {
          $set: {
            returnId: data.id,
            orderId: request["orderId"],
            userId: request["userId"],
            amount,
            method: "COD",
            paymentStatus: "pending",
            processedBy: adminId,
            processedAt: now,
          },
        },
        { upsert: true },
      );
    return { success: true, request: result ? toReturn(result) : undefined };
  });
