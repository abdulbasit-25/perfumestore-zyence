import { createServerFn } from "@tanstack/react-start";
import type { OrderStatus } from "@/lib/catalog-types";
import type { PageResult } from "@/lib/pagination";
import { readPage } from "@/lib/pagination";

export type ShipmentStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "OutForDelivery"
  | "Delivered"
  | "Failed"
  | "RTO";
export type Shipment = {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  address: string;
  total: number;
  orderStatus: OrderStatus;
  status: ShipmentStatus;
  courier: string;
  trackingNumber: string;
  expectedDelivery: string;
  deliveryNotes: string;
  updatedAt: string;
};

const statuses: ShipmentStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Failed",
  "RTO",
];
const isId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export const shipmentOrderStatus: Record<ShipmentStatus, OrderStatus | null> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Packed: "Confirmed",
  Shipped: "Shipped",
  OutForDelivery: "Shipped",
  Delivered: "Delivered",
  Failed: "Shipped",
  RTO: "Cancelled",
};

const allowedShipmentTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  Pending: ["Pending", "Confirmed"],
  Confirmed: ["Confirmed", "Packed"],
  Packed: ["Packed", "Shipped"],
  Shipped: ["Shipped", "OutForDelivery", "Failed"],
  OutForDelivery: ["OutForDelivery", "Delivered", "Failed", "RTO"],
  Delivered: ["Delivered"],
  Failed: ["Failed", "Shipped"],
  RTO: ["RTO"],
};

async function adminDb(token: string) {
  const { requirePermission } = await import("@/lib/authorization-server");
  const { db } = await requirePermission(token, "manageShipments");
  const { ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  await ensureCollection(db, "shipments");
  await ensureIndex(db, "shipments", { orderId: 1 }, { unique: true });
  await ensureIndex(db, "shipments", { status: 1, updatedAt: -1 });
  return db;
}

function toShipment(doc: Record<string, unknown>, order?: Record<string, unknown>): Shipment {
  const customer = (order?.["customer"] ?? {}) as Record<string, unknown>;
  const address = (order?.["shippingAddress"] ?? {}) as Record<string, unknown>;
  const updatedAt =
    doc["updatedAt"] instanceof Date
      ? doc["updatedAt"]
      : new Date(String(doc["updatedAt"] ?? order?.["updatedAt"]));
  return {
    id: String(doc["_id"] ?? ""),
    orderId: String(doc["orderId"] ?? order?.["orderNumber"] ?? ""),
    customerName: String(customer["name"] ?? ""),
    customerEmail: String(customer["email"] ?? ""),
    address: `${String(address["address"] ?? "")}, ${String(address["city"] ?? "")}`,
    total: Number(order?.["total"] ?? 0),
    orderStatus: String(order?.["status"] ?? "Pending") as OrderStatus,
    status: String(doc["status"] ?? "Pending") as ShipmentStatus,
    courier: String(doc["courier"] ?? ""),
    trackingNumber: String(doc["trackingNumber"] ?? ""),
    expectedDelivery: String(doc["expectedDelivery"] ?? ""),
    deliveryNotes: String(doc["deliveryNotes"] ?? ""),
    updatedAt: Number.isNaN(updatedAt.getTime()) ? "" : updatedAt.toISOString(),
  };
}

export const getShipments = createServerFn({ method: "GET" })
  .validator(
    (data: { token: string; status?: ShipmentStatus; page?: number; pageSize?: number }) => data,
  )
  .handler(async ({ data }): Promise<PageResult<Shipment>> => {
    const db = await adminDb(data.token);
    const pagination = readPage(data.page, data.pageSize);
    let orders: Record<string, unknown>[];
    let docs: Record<string, unknown>[];
    let total: number;
    if (data.status) {
      total = await db.collection("shipments").countDocuments({ status: data.status });
      docs = await db
        .collection("shipments")
        .find({ status: data.status })
        .sort({ updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .toArray();
      const orderIds = docs.map((doc) => String(doc["orderId"] ?? ""));
      orders = await db
        .collection("orders")
        .find({ orderNumber: { $in: orderIds } })
        .toArray();
    } else {
      total = await db.collection("orders").countDocuments({});
      orders = await db
        .collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .toArray();
      const orderIds = orders.map((order) => String(order["orderNumber"] ?? ""));
      docs = await db
        .collection("shipments")
        .find({ orderId: { $in: orderIds } })
        .toArray();
    }
    const byOrder = new Map(docs.map((doc) => [String(doc["orderId"]), doc]));
    const items = orders.map((order) =>
      toShipment(
        byOrder.get(String(order["orderNumber"])) ?? {
          orderId: order["orderNumber"],
          status: "Pending",
          updatedAt: order["updatedAt"],
        },
        order,
      ),
    );
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  });

export const updateShipment = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      orderId: string;
      status: ShipmentStatus;
      courier?: string;
      trackingNumber?: string;
      expectedDelivery?: string;
      deliveryNotes?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!statuses.includes(data.status))
      return { success: false, message: "Invalid shipment status" };
    const db = await adminDb(data.token);
    const order = await db.collection("orders").findOne({ orderNumber: data.orderId });
    if (!order) return { success: false, message: "Order not found" };
    const existingShipment = await db.collection("shipments").findOne({ orderId: data.orderId });
    const currentStatus = String(existingShipment?.["status"] ?? "Pending") as ShipmentStatus;
    if (!allowedShipmentTransitions[currentStatus]?.includes(data.status)) {
      return {
        success: false,
        message: `Shipment cannot move from ${currentStatus} to ${data.status}`,
      };
    }
    const now = new Date();
    const nextOrderStatus = shipmentOrderStatus[data.status];
    const update = await db.collection("shipments").findOneAndUpdate(
      { orderId: data.orderId },
      {
        $set: {
          orderId: data.orderId,
          status: data.status,
          courier: data.courier?.trim() ?? "",
          trackingNumber: data.trackingNumber?.trim() ?? "",
          expectedDelivery: data.expectedDelivery ?? "",
          deliveryNotes: data.deliveryNotes?.trim() ?? "",
          updatedAt: now,
        },
        $push: { statusHistory: { status: data.status, at: now } },
      },
      { upsert: true, returnDocument: "after" },
    );
    const updatedOrder = { ...order };
    if (nextOrderStatus && order["status"] !== "Cancelled") {
      updatedOrder["status"] = nextOrderStatus;
      updatedOrder["updatedAt"] = now;
      await db.collection("orders").updateOne(
        { _id: order["_id"] },
        {
          $set: { status: nextOrderStatus, updatedAt: now },
          $push: {
            statusHistory: {
              status: nextOrderStatus,
              timestamp: now,
              note: `Shipment status changed to ${data.status}`,
            },
          },
        },
      );
    }
    return { success: true, shipment: update ? toShipment(update, updatedOrder) : undefined };
  });
