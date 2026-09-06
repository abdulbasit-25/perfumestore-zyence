import { createServerFn } from "@tanstack/react-start";

type InventoryFilter = "all" | "low" | "out";

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  restockThreshold: number;
  inventoryValue: number;
  status: "In stock" | "Low stock" | "Out of stock";
};

export type InventoryMovement = {
  id: string;
  productId: string;
  delta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  note: string;
  adminId: string;
  createdAt: string;
};

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

async function adminDatabase(token: string) {
  const { requirePermission } = await import("@/lib/authorization-server");
  const { db, user } = await requirePermission(token, "manageInventory");
  const { ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  await ensureCollection(db, "inventory_movements");
  await Promise.all([
    ensureIndex(db, "inventory_movements", { productId: 1, createdAt: -1 }),
    ensureIndex(db, "inventory_movements", { adminId: 1, createdAt: -1 }),
  ]);
  return { db, adminId: user.id };
}

function toInventoryItem(product: Record<string, unknown>, category: string): InventoryItem {
  const stock = Number(product["stock"] ?? 0);
  const restockThreshold = Number(product["restockThreshold"] ?? 5);
  return {
    id: String(product["_id"] ?? ""),
    name: String(product["name"] ?? "Unnamed product"),
    sku: String(product["sku"] ?? ""),
    category,
    price: Number(product["price"] ?? 0),
    stock,
    restockThreshold,
    inventoryValue: stock * Number(product["price"] ?? 0),
    status: stock === 0 ? "Out of stock" : stock <= restockThreshold ? "Low stock" : "In stock",
  };
}

function toMovement(document: Record<string, unknown>): InventoryMovement {
  const date =
    document["createdAt"] instanceof Date
      ? document["createdAt"]
      : new Date(String(document["createdAt"]));
  return {
    id: String(document["_id"] ?? ""),
    productId: String(document["productId"] ?? ""),
    delta: Number(document["delta"] ?? 0),
    previousStock: Number(document["previousStock"] ?? 0),
    newStock: Number(document["newStock"] ?? 0),
    reason: String(document["reason"] ?? "Adjustment"),
    note: String(document["note"] ?? ""),
    adminId: String(document["adminId"] ?? ""),
    createdAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
  };
}

export const getInventory = createServerFn({ method: "GET" })
  .validator((data: { token: string; filter?: InventoryFilter }) => data)
  .handler(async ({ data }) => {
    const { db } = await adminDatabase(data.token);
    const [products, categories] = await Promise.all([
      db.collection("products").find({ isActive: true }).sort({ stock: 1, name: 1 }).toArray(),
      db.collection("categories").find({}).toArray(),
    ]);
    const categoryNames = new Map(
      categories.map((category) => [String(category._id), String(category.name ?? "—")]),
    );
    return products
      .map((product) =>
        toInventoryItem(product, categoryNames.get(String(product["categoryId"])) ?? "—"),
      )
      .filter((item) =>
        data.filter === "out"
          ? item.stock === 0
          : data.filter === "low"
            ? item.stock > 0 && item.stock <= item.restockThreshold
            : true,
      );
  });

export const getInventoryMovements = createServerFn({ method: "GET" })
  .validator((data: { token: string; productId: string }) => data)
  .handler(async ({ data }) => {
    if (!isObjectId(data.productId)) return [];
    const { db } = await adminDatabase(data.token);
    const movements = await db
      .collection("inventory_movements")
      .find({ productId: data.productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return movements.map(toMovement);
  });

export const adjustInventory = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      productId: string;
      delta: number;
      reason: string;
      note?: string;
      restockThreshold?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!isObjectId(data.productId) || !Number.isInteger(data.delta) || data.delta === 0) {
      return { success: false, message: "Enter a valid stock adjustment" };
    }
    if (!data.reason.trim()) return { success: false, message: "A reason is required" };
    if (
      data.restockThreshold !== undefined &&
      (!Number.isInteger(data.restockThreshold) || data.restockThreshold < 0)
    ) {
      return { success: false, message: "Restock threshold must be a non-negative whole number" };
    }
    const { ObjectId } = await import("mongodb");
    const { db, adminId } = await adminDatabase(data.token);
    const productId = new ObjectId(data.productId);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await db.collection("products").findOne({ _id: productId, isActive: true });
      if (!current) return { success: false, message: "Product not found" };
      const previousStock = Number(current["stock"] ?? 0);
      const newStock = previousStock + data.delta;
      if (newStock < 0) return { success: false, message: "Stock cannot become negative" };
      const update = await db.collection("products").findOneAndUpdate(
        { _id: productId, isActive: true, stock: previousStock },
        {
          $inc: { stock: data.delta },
          ...(data.restockThreshold !== undefined
            ? { $set: { restockThreshold: data.restockThreshold } }
            : {}),
        },
        { returnDocument: "after" },
      );
      if (!update) continue;
      const now = new Date();
      await db.collection("inventory_movements").insertOne({
        productId: data.productId,
        delta: data.delta,
        previousStock,
        newStock,
        reason: data.reason.trim(),
        note: data.note?.trim() ?? "",
        adminId,
        createdAt: now,
      });
      return { success: true, item: toInventoryItem(update, "—") };
    }
    return { success: false, message: "Inventory changed while saving. Please try again." };
  });
