/// <reference types="node" />
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

import { ensureIndex, getMongoDb } from "../src/lib/mongodb";

// Zyence fragrance product data
const zyenceProducts = [
  {
    name: "Amber Oud EDP",
    slug: "amber-oud-edp",
    description:
      "A rich composition of dark oud, warm amber, and subtle musk. Long-lasting, complex, and deeply sensual. Perfect for evening wear. 50ml.",
    price: 92.0,
    categorySlug: "eau-de-parfum",
    stock: 18,
    sku: "ZYE-EDP-001",
    isActive: true,
    rating: 4.8,
    fragrance: {
      concentration: "EDP",
      volumeMl: 50,
      longevity: "8–10 hours",
      sillage: "Moderate-heavy",
      notes: { top: ["bergamot", "pink pepper"], heart: ["oud", "rose"], base: ["amber", "musk"] },
    },
    createdAt: "2026-02-11",
  },
  {
    name: "Rose Attar",
    slug: "rose-attar",
    description:
      "Bulgarian rose macerated in golden carrier oil with undertones of saffron and vetiver. A luxe, concentrated oil fragrance. 5ml.",
    price: 78.0,
    categorySlug: "attars-oils",
    stock: 24,
    sku: "ZYE-ATT-001",
    isActive: true,
    rating: 4.9,
    fragrance: {
      concentration: "Attar",
      volumeMl: 5,
      longevity: "10+ hours",
      sillage: "Close",
      notes: { top: ["saffron"], heart: ["rose"], base: ["vetiver", "golden oil"] },
    },
    createdAt: "2026-03-02",
  },
  {
    name: "Fig & Vetiver EDP",
    slug: "fig-vetiver-edp",
    description:
      "Fresh fig leaf, roasted vetiver root, and creamy sandalwood create a balanced, sophisticated scent. Daytime elegance. 50ml.",
    price: 88.0,
    categorySlug: "eau-de-parfum",
    stock: 12,
    sku: "ZYE-EDP-002",
    isActive: true,
    rating: 4.7,
    fragrance: {
      concentration: "EDP",
      volumeMl: 50,
      longevity: "6–8 hours",
      sillage: "Moderate",
      notes: { top: ["fig leaf"], heart: ["vetiver"], base: ["sandalwood"] },
    },
    createdAt: "2026-01-19",
  },
  {
    name: "Sandalwood Diffuser",
    slug: "sandalwood-diffuser",
    description:
      "Warm Indian sandalwood with burnished cedar and a hint of vanilla. Creates a calm, inviting atmosphere in any room. 100ml.",
    price: 65.0,
    categorySlug: "home-fragrance",
    stock: 21,
    sku: "ZYE-HOM-001",
    isActive: true,
    rating: 4.6,
    fragrance: {
      concentration: "Home fragrance",
      volumeMl: 100,
      longevity: "Up to 12 weeks",
      sillage: "Ambient",
      notes: { top: ["vanilla"], heart: ["cedar"], base: ["sandalwood"] },
    },
    createdAt: "2026-02-27",
  },
  {
    name: "Discovery Set — 5x5ml",
    slug: "discovery-set",
    description:
      "Five 5ml vials: Amber Oud, Fig & Vetiver, Rose Attar, Bergamot Vetiver, and Oud & Leather. Perfect for fragrance exploration.",
    price: 89.0,
    categorySlug: "gift-sets",
    stock: 0,
    sku: "ZYE-SET-001",
    isActive: true,
    rating: 4.8,
    fragrance: {
      concentration: "Discovery set",
      volumeMl: 25,
      longevity: "Varies by composition",
      sillage: "Varies by composition",
      notes: { top: ["bergamot"], heart: ["rose", "fig"], base: ["oud", "musk"] },
    },
    createdAt: "2026-03-14",
  },
  {
    name: "Bergamot Vetiver EDP",
    slug: "bergamot-vetiver-edp",
    description:
      "Bright Sicilian bergamot paired with earthy vetiver and white musk. A timeless, wearable composition. Unisex. 50ml.",
    price: 92.0,
    categorySlug: "eau-de-parfum",
    stock: 15,
    sku: "ZYE-EDP-003",
    isActive: true,
    rating: 4.8,
    fragrance: {
      concentration: "EDP",
      volumeMl: 50,
      longevity: "6–8 hours",
      sillage: "Moderate",
      notes: { top: ["bergamot"], heart: ["vetiver"], base: ["white musk"] },
    },
    createdAt: "2026-01-08",
  },
  {
    name: "Oud & Leather EDP",
    slug: "oud-leather-edp",
    description:
      "Deep oud distillate blended with leather accords and warm woods. A bold, confident fragrance for those who embrace depth. 50ml.",
    price: 105.0,
    categorySlug: "eau-de-parfum",
    stock: 8,
    sku: "ZYE-EDP-004",
    isActive: true,
    rating: 4.9,
    fragrance: {
      concentration: "EDP",
      volumeMl: 50,
      longevity: "8–10 hours",
      sillage: "Heavy",
      notes: { top: ["oud"], heart: ["leather accord"], base: ["warm woods"] },
    },
    createdAt: "2026-02-05",
  },
  {
    name: "Lavender Sleep Oil",
    slug: "lavender-sleep-oil",
    description:
      "Pure lavender, chamomile, and cedarwood in a premium carrier oil. Roll onto pulse points for a restful evening. 10ml.",
    price: 38.0,
    categorySlug: "attars-oils",
    stock: 30,
    sku: "ZYE-ACC-001",
    isActive: true,
    rating: 4.7,
    fragrance: {
      concentration: "Perfume oil",
      volumeMl: 10,
      longevity: "6–8 hours",
      sillage: "Close",
      notes: { top: ["lavender"], heart: ["chamomile"], base: ["cedarwood"] },
    },
    createdAt: "2026-03-10",
  },
];

async function seedZyenceProducts() {
  try {
    const db = await getMongoDb();
    const productsCollection = db.collection("products");
    const categoriesCollection = db.collection("categories");

    // Ensure indexes
    await ensureIndex(db, "categories", { slug: 1 }, { unique: true });
    await ensureIndex(db, "products", { sku: 1 }, { unique: true });
    await ensureIndex(db, "products", { slug: 1 }, { unique: true });
    await ensureIndex(db, "products", { categoryId: 1 });
    await ensureIndex(db, "products", { createdAt: -1 });

    // Create or update Zyence categories
    const categoryIds = new Map<string, unknown>();
    const zyenceCategories = [
      ["eau-de-parfum", "Eau de Parfum"],
      ["attars-oils", "Attars / Oils"],
      ["home-fragrance", "Home Fragrance"],
      ["gift-sets", "Gift Sets"],
    ];

    for (const [slug, name] of zyenceCategories) {
      const result = await categoriesCollection.findOneAndUpdate(
        { slug },
        {
          $setOnInsert: {
            name,
            slug,
            description: `${name} collection from Zyence`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" },
      );
      if (result) categoryIds.set(slug, result._id);
    }

    console.log("✓ Zyence categories created/verified");

    // Placeholder image for all Zyence products (since we can't upload real ones)
    const placeholderImage = {
      url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=60",
      publicId: "zyence/placeholder-fragrance",
      alt: "Zyence fragrance product",
    };

    // Seed products
    let createdCount = 0;
    for (const product of zyenceProducts) {
      // Check if product already exists
      const existing = await productsCollection.findOne({ sku: product.sku });

      const now = new Date();
      const document = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        sku: product.sku,
        stock: product.stock,
        categoryId: categoryIds.get(product.categorySlug),
        images: existing?.images?.length
          ? existing.images
          : [{ ...placeholderImage, alt: product.name }],
        isActive: product.isActive,
        rating: product.rating,
        reviewCount: existing?.reviewCount ?? 0,
        fragrance: product.fragrance,
        createdAt: existing?.createdAt ?? new Date(product.createdAt),
        updatedAt: now,
      };

      await productsCollection.updateOne(
        { sku: product.sku },
        { $set: document },
        { upsert: true },
      );
      createdCount++;
      console.log(`${existing ? "✓ Updated" : "✓ Created"}: ${product.name}`);
    }

    console.log(`\n✓ Zyence seed complete: ${createdCount} products created`);
  } catch (error) {
    console.error("Error seeding Zyence products:", error);
    process.exit(1);
  }
}

seedZyenceProducts();
