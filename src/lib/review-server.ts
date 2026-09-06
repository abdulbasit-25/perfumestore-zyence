import { createServerFn } from "@tanstack/react-start";
import { normalizeReviewStatus, validateReviewContent } from "@/lib/review-utils";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewCreatedBy = "customer" | "admin";

export type ProductReview = {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
};

export type ProductReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type AdminReview = ProductReview & {
  productId: string;
  productName: string;
  customerId: string;
  orderId: string;
  status: ReviewStatus;
  createdBy: ReviewCreatedBy;
  featured: boolean;
};

export type EligibleReviewProduct = {
  productId: string;
  productName: string;
  productSlug: string;
  orderId: string;
  orderNumber: string;
  reviewStatus: ReviewStatus | null;
};

const statuses: ReviewStatus[] = ["pending", "approved", "rejected"];
const isId = (value: string) => /^[a-f\d]{24}$/i.test(value);

async function reviewsDb() {
  const { getMongoDb, ensureCollection, ensureIndex } = await import("@/lib/mongodb");
  const db = await getMongoDb();
  await ensureCollection(db, "reviews");
  await Promise.all([
    ensureIndex(db, "reviews", { productId: 1, status: 1 }),
    ensureIndex(db, "reviews", { customerId: 1, createdAt: -1 }),
    ensureIndex(db, "reviews", { orderId: 1, productId: 1 }),
  ]);
  return db;
}

async function authenticatedUser(token: string | undefined, adminOnly = false) {
  const { ObjectId } = await import("mongodb");
  const { verifyToken } = await import("@/lib/auth");
  if (!token) {
    const { getCookie } = await import("@tanstack/start-server-core");
    token = getCookie("auth-token");
  }
  const user = token ? verifyToken(token) : null;
  if (!user || !ObjectId.isValid(user.id)) throw new Error("UNAUTHORIZED");
  const db = await reviewsDb();
  const account = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
  if (!account || account["status"] === "disabled") throw new Error("UNAUTHORIZED");
  if (adminOnly && account["role"] !== "admin" && account["role"] !== "manager") {
    throw new Error("FORBIDDEN");
  }
  return { db, user, account };
}

function dateString(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toAdminReview(doc: Record<string, unknown>): AdminReview {
  return {
    id: String(doc["_id"] ?? ""),
    productId: String(doc["productId"] ?? ""),
    productName: String(doc["productName"] ?? ""),
    customerId: String(doc["customerId"] ?? doc["userId"] ?? ""),
    orderId: String(doc["orderId"] ?? ""),
    customerName: String(doc["customerName"] ?? ""),
    rating: Number(doc["rating"] ?? 0),
    title: String(doc["title"] ?? ""),
    comment: String(doc["comment"] ?? doc["body"] ?? ""),
    status: normalizeReviewStatus(doc["status"]),
    createdBy: doc["createdBy"] === "admin" ? "admin" : "customer",
    isVerifiedPurchase: doc["isVerifiedPurchase"] === true,
    featured: doc["featured"] === true,
    createdAt: dateString(doc["createdAt"]),
  };
}

function toProductReview(doc: Record<string, unknown>): ProductReview {
  const review = toAdminReview(doc);
  return {
    id: review.id,
    customerName: review.customerName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    createdAt: review.createdAt,
    isVerifiedPurchase: review.isVerifiedPurchase,
  };
}

function emptyDistribution(): ProductReviewSummary["distribution"] {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

export const getProductReviewSummary = createServerFn({ method: "GET" })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }): Promise<ProductReviewSummary> => {
    if (!isId(productId)) {
      return { averageRating: 0, totalReviews: 0, distribution: emptyDistribution() };
    }
    const db = await reviewsDb();
    const rows = await db
      .collection("reviews")
      .aggregate([
        { $match: { productId, status: { $in: ["approved", "Published"] } } },
        { $group: { _id: "$rating", count: { $sum: 1 }, total: { $sum: "$rating" } } },
      ])
      .toArray();
    const distribution = emptyDistribution();
    let totalReviews = 0;
    let totalRating = 0;
    for (const row of rows) {
      const rating = Number(row["_id"]);
      const count = Number(row["count"]);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as 1 | 2 | 3 | 4 | 5] = count;
        totalReviews += count;
        totalRating += Number(row["total"]);
      }
    }
    return {
      averageRating: totalReviews ? Math.round((totalRating / totalReviews) * 10) / 10 : 0,
      totalReviews,
      distribution,
    };
  });

export const getProductReviews = createServerFn({ method: "GET" })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }): Promise<ProductReview[]> => {
    if (!isId(productId)) return [];
    const db = await reviewsDb();
    return (
      await db
        .collection("reviews")
        .find({ productId, status: { $in: ["approved", "Published"] } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()
    ).map(toProductReview);
  });

export const getApprovedReviews = createServerFn({ method: "GET" })
  .validator((data?: { limit?: number }) => ({ limit: Number(data?.limit ?? 3) }))
  .handler(async ({ data }): Promise<(ProductReview & { productName?: string })[]> => {
    const db = await reviewsDb();
    const limit = Number.isFinite(data?.limit) ? Number(data.limit) : 3;
    const safeLimit = Math.max(1, Math.min(12, Math.round(limit)));
    const reviews = await db
      .collection("reviews")
      .find({ status: { $in: ["approved", "Published"] } })
      .sort({ featured: -1, createdAt: -1 })
      .limit(safeLimit)
      .toArray();

    return reviews.map((doc) => ({
      ...toProductReview(doc),
      productName: String(doc["productName"] ?? "Zyence fragrance"),
    }));
  });

export const getEligibleReviewProducts = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }): Promise<EligibleReviewProduct[]> => {
    const { ObjectId } = await import("mongodb");
    const { db, user } = await authenticatedUser(token);
    const orders = await db
      .collection("orders")
      .find({ userId: new ObjectId(user.id), status: "Delivered" })
      .sort({ createdAt: -1 })
      .toArray();
    const reviewKeys: { customerId: string; orderId: string; productId: string }[] = [];
    for (const order of orders) {
      const items = Array.isArray(order["items"])
        ? (order["items"] as Record<string, unknown>[])
        : [];
      for (const item of items) {
        const productId = String(item["productId"] ?? "");
        const orderId = String(order["_id"] ?? "");
        if (productId && orderId) reviewKeys.push({ customerId: user.id, orderId, productId });
      }
    }
    const existingReviews = reviewKeys.length
      ? await db
          .collection("reviews")
          .find({
            $or: reviewKeys.flatMap(({ customerId, orderId, productId }) => [
              { customerId, orderId, productId },
              { userId: customerId, orderId, productId },
            ]),
          })
          .toArray()
      : [];
    const reviewByKey = new Map(
      existingReviews.map((review) => [
        `${String(review["orderId"])}:${String(review["productId"])}`,
        review,
      ]),
    );
    const eligible: EligibleReviewProduct[] = [];
    for (const order of orders) {
      const items = Array.isArray(order["items"])
        ? (order["items"] as Record<string, unknown>[])
        : [];
      for (const item of items) {
        const productId = String(item["productId"] ?? "");
        const orderId = String(order["_id"] ?? "");
        if (!productId || !orderId) continue;
        const existing = reviewByKey.get(`${orderId}:${productId}`);
        eligible.push({
          productId,
          productName: String(item["name"] ?? "Product"),
          productSlug: String(item["slug"] ?? ""),
          orderId,
          orderNumber: String(order["orderNumber"] ?? ""),
          reviewStatus: existing ? normalizeReviewStatus(existing["status"]) : null,
        });
      }
    }
    return eligible;
  });

export const createReview = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      productId: string;
      rating: number;
      comment?: string;
      body?: string;
      title?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    const { db, user } = await authenticatedUser(data.token);
    const comment = (data.comment ?? data.body ?? "").trim();
    if (!isId(data.productId)) return { success: false, message: "Invalid product." };
    const validationMessage = validateReviewContent(data.rating, comment);
    if (validationMessage) return { success: false, message: validationMessage };
    const order = await db.collection("orders").findOne({
      userId: new ObjectId(user.id),
      status: "Delivered",
      "items.productId": new ObjectId(data.productId),
    });
    if (!order) return { success: false, message: "You can review products after delivery." };
    const orderId = String(order["_id"]);
    const duplicate = await db.collection("reviews").findOne({
      $or: [
        { customerId: user.id, orderId, productId: data.productId },
        { userId: user.id, orderId, productId: data.productId },
      ],
    });
    if (duplicate) return { success: false, message: "You already reviewed this product." };
    const item = (order["items"] as Record<string, unknown>[]).find(
      (entry) => String(entry["productId"]) === data.productId,
    );
    const result = await db.collection("reviews").insertOne({
      productId: data.productId,
      customerId: user.id,
      orderId,
      productName: String(item?.["name"] ?? ""),
      customerName: user.name,
      rating: data.rating,
      title: (data.title ?? "Customer review").trim().slice(0, 120),
      comment,
      status: "pending",
      isVerifiedPurchase: true,
      createdBy: "customer",
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: result.insertedId.toString() };
  });

export const getReviews = createServerFn({ method: "GET" })
  .validator((data: { token: string; status?: ReviewStatus }) => data)
  .handler(async ({ data }) => {
    const { db } = await authenticatedUser(data.token, true);
    const query = data.status
      ? {
          status: {
            $in:
              data.status === "approved"
                ? ["approved", "Published"]
                : data.status === "pending"
                  ? ["pending", "Pending"]
                  : ["rejected", "Rejected"],
          },
        }
      : {};
    return (
      await db.collection("reviews").find(query).sort({ createdAt: -1 }).limit(500).toArray()
    ).map(toAdminReview);
  });

export const createAdminReview = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      productId: string;
      customerName?: string;
      rating: number;
      comment: string;
      title?: string;
      status: ReviewStatus;
      isVerifiedPurchase: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { ObjectId } = await import("mongodb");
    const { db } = await authenticatedUser(data.token, true);
    const comment = data.comment.trim();
    if (!isId(data.productId) || !statuses.includes(data.status)) {
      return { success: false, message: "Invalid review details." };
    }
    const validationMessage = validateReviewContent(data.rating, comment);
    if (validationMessage) return { success: false, message: validationMessage };
    const product = await db.collection("products").findOne({ _id: new ObjectId(data.productId) });
    if (!product) return { success: false, message: "Product not found." };
    const result = await db.collection("reviews").insertOne({
      productId: data.productId,
      productName: String(product["name"] ?? ""),
      customerName: (data.customerName ?? "Store team").trim().slice(0, 120),
      rating: data.rating,
      title: (data.title ?? "Customer review").trim().slice(0, 120),
      comment,
      status: data.status,
      isVerifiedPurchase: data.isVerifiedPurchase,
      createdBy: "admin",
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: result.insertedId.toString() };
  });

export const moderateReview = createServerFn({ method: "POST" })
  .validator(
    (data: { token: string; id: string; status: ReviewStatus; featured?: boolean }) => data,
  )
  .handler(async ({ data }) => {
    if (!isId(data.id) || !statuses.includes(data.status))
      return { success: false, message: "Invalid review" };
    const { ObjectId } = await import("mongodb");
    const { db } = await authenticatedUser(data.token, true);
    const result = await db.collection("reviews").findOneAndUpdate(
      { _id: new ObjectId(data.id) },
      {
        $set: {
          status: data.status,
          featured: data.featured === true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    return result
      ? { success: true, review: toAdminReview(result) }
      : { success: false, message: "Review not found" };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!isId(data.id)) return { success: false, message: "Invalid review" };
    const { ObjectId } = await import("mongodb");
    const { requirePermission } = await import("@/lib/authorization-server");
    const { db } = await requirePermission(data.token, "deleteData");
    const result = await db.collection("reviews").deleteOne({ _id: new ObjectId(data.id) });
    return result.deletedCount
      ? { success: true }
      : { success: false, message: "Review not found" };
  });
