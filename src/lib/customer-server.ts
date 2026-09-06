import { createServerFn } from "@tanstack/react-start";
import type { Order } from "@/lib/catalog-types";
import type { PageResult } from "@/lib/pagination";
import { readPage } from "@/lib/pagination";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  createdAt: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrder: string | null;
  lastOrder: string | null;
};

export type AdminCustomerDetails = AdminCustomer & { orders: Order[] };

function dateValue(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function customerFromDocument(
  user: Record<string, unknown>,
  orders: Order[],
  latestAddress: string,
): AdminCustomer {
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  return {
    id: String(user["_id"] ?? ""),
    name: String(user["name"] ?? "Unnamed customer"),
    email: String(user["email"] ?? ""),
    phone: String(user["phone"] ?? ""),
    status: user["status"] === "inactive" ? "Inactive" : "Active",
    createdAt: dateValue(user["createdAt"]) ?? "",
    address: latestAddress,
    orderCount: orders.length,
    totalSpent,
    averageOrderValue: orders.length ? totalSpent / orders.length : 0,
    firstOrder: orders.at(-1)?.createdAt ?? null,
    lastOrder: orders[0]?.createdAt ?? null,
  };
}

async function customerData(token: string, customerId?: string, page?: number, pageSize?: number) {
  const { ObjectId } = await import("mongodb");
  const { authenticatedUser, mongoToOrder } = await import("@/lib/order-server");
  if (customerId && !ObjectId.isValid(customerId)) return [];
  const { db } = await authenticatedUser(token, true);
  const userFilter = customerId
    ? { _id: new ObjectId(customerId), role: "customer" }
    : { role: "customer" };
  const pagination = readPage(page, pageSize);
  const total = await db.collection("users").countDocuments(userFilter);
  const users = await db
    .collection("users")
    .find(userFilter)
    .sort({ createdAt: -1 })
    .skip(customerId ? 0 : pagination.skip)
    .limit(customerId ? 1 : pagination.pageSize)
    .toArray();
  const userIds = users.map((user) => user._id);
  const orderDocuments = await db
    .collection("orders")
    .find({ userId: { $in: userIds } })
    .sort({ createdAt: -1 })
    .toArray();
  const ordersByUser = new Map<string, Order[]>();
  for (const document of orderDocuments) {
    const userId = String(document["userId"] ?? "");
    const orders = ordersByUser.get(userId) ?? [];
    orders.push(mongoToOrder(document));
    ordersByUser.set(userId, orders);
  }

  const records = users.map((user) => {
    const orders = ordersByUser.get(String(user._id)) ?? [];
    return {
      customer: customerFromDocument(user, orders, orders[0]?.shippingAddress ?? ""),
      orders,
    };
  });
  return { records, total };
}

export const getAdminCustomers = createServerFn({ method: "GET" })
  .validator((data: { token: string; page?: number; pageSize?: number }) => data)
  .handler(async ({ data }): Promise<PageResult<AdminCustomer>> => {
    const records = await customerData(data.token, undefined, data.page, data.pageSize);
    const pagination = readPage(data.page, data.pageSize);
    return {
      items: records.records.map(({ customer }) => customer),
      total: records.total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  });

export const getAdminCustomer = createServerFn({ method: "GET" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const { records } = await customerData(data.token, data.id);
    const [record] = records;
    return record ? { ...record.customer, orders: record.orders } : null;
  });
