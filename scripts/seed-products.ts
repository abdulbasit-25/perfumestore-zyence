/// <reference types="node" />
import * as fs from "fs";
import * as path from "path";
import { uploadProductImage } from "../src/lib/cloudinary";

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

// Mock product data to seed
const mockProducts = [
  {
    id: "p1",
    name: "Oversized Linen Shirt",
    slug: "oversized-linen-shirt",
    description:
      "Cut from washed European linen with a relaxed shoulder and a single patch pocket. Softens with every wear.",
    price: 148,
    image: "/p-linen-shirt.jpg",
    categorySlug: "apparel",
    stock: 24,
    sku: "SRL-AP-001",
    isActive: true,
    rating: 4.8,
    createdAt: "2026-02-11",
  },
  {
    id: "p2",
    name: "Olive Stoneware Vase",
    slug: "olive-stoneware-vase",
    description:
      "Thrown by hand and finished in a matte olive glaze. Each piece varies slightly in tone and height.",
    price: 96,
    image: "/p-vase.jpg",
    categorySlug: "ceramics",
    stock: 7,
    sku: "SRL-CE-014",
    isActive: true,
    rating: 4.9,
    createdAt: "2026-03-02",
  },
  {
    id: "p3",
    name: "Fringed Wool Throw",
    slug: "fringed-wool-throw",
    description:
      "Waffle-woven lambswool with hand-knotted fringe. Woven in a family mill in Portugal.",
    price: 220,
    image: "/p-throw.jpg",
    categorySlug: "textiles",
    stock: 3,
    sku: "SRL-TX-007",
    isActive: true,
    rating: 4.7,
    createdAt: "2026-01-19",
  },
  {
    id: "p4",
    name: "Everyday Leather Tote",
    slug: "everyday-leather-tote",
    description:
      "Vegetable-tanned leather, unlined, with a structured base. Ages into a deep patina.",
    price: 310,
    image: "/p-tote.jpg",
    categorySlug: "objects",
    stock: 12,
    sku: "SRL-OB-021",
    isActive: true,
    rating: 4.6,
    createdAt: "2026-02-27",
  },
  {
    id: "p5",
    name: "Cream Mug, Pair",
    slug: "cream-mug-pair",
    description: "A pair of softly rounded mugs in a satin cream glaze. Dishwasher safe.",
    price: 64,
    image: "/p-mugs.jpg",
    categorySlug: "ceramics",
    stock: 41,
    sku: "SRL-CE-002",
    isActive: true,
    rating: 4.5,
    createdAt: "2026-03-14",
  },
  {
    id: "p6",
    name: "Heavyweight Knit Sweater",
    slug: "heavyweight-knit-sweater",
    description: "Chunky organic cotton knit with ribbed cuffs and a dropped shoulder.",
    price: 185,
    image: "/p-sweater.jpg",
    categorySlug: "apparel",
    stock: 0,
    sku: "SRL-AP-030",
    isActive: true,
    rating: 4.8,
    createdAt: "2026-01-08",
  },
  {
    id: "p7",
    name: "Brass & Walnut Lamp",
    slug: "brass-walnut-lamp",
    description: "A domed brass shade over a turned walnut column. Warm, low, and even light.",
    price: 275,
    image: "/p-lamp.jpg",
    categorySlug: "objects",
    stock: 9,
    sku: "SRL-OB-005",
    isActive: true,
    rating: 4.9,
    createdAt: "2026-02-05",
  },
];

async function seedProducts() {
  try {
    const db = await getMongoDb();
    const productsCollection = db.collection("products");

    const categoriesCollection = db.collection("categories");
    await ensureIndex(db, "categories", { slug: 1 }, { unique: true });
    await ensureIndex(db, "products", { sku: 1 }, { unique: true });
    await ensureIndex(db, "products", { slug: 1 }, { unique: true });
    await ensureIndex(db, "products", { categoryId: 1 });
    await ensureIndex(db, "products", { createdAt: -1 });

    const categoryIds = new Map<string, unknown>();
    for (const category of [
      ["apparel", "Apparel"],
      ["ceramics", "Ceramics"],
      ["textiles", "Textiles"],
      ["objects", "Objects"],
    ]) {
      const result = await categoriesCollection.findOneAndUpdate(
        { slug: category[0] },
        {
          $setOnInsert: {
            name: category[1],
            slug: category[0],
            description: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" },
      );
      if (result) categoryIds.set(category[0], result._id);
    }

    for (const product of mockProducts) {
      // Check if product already exists
      const existing = await productsCollection.findOne({ id: product.id });

      if (existing?.images?.length) {
        console.log(`Product ${product.name} already exists, skipping...`);
      } else {
        const sourceImage = path.resolve(process.cwd(), "src", "assets", product.image.slice(1));
        const image = await uploadProductImage(
          fs.readFileSync(sourceImage),
          product.id,
          path.basename(sourceImage),
        );
        const now = new Date();
        const document = {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          sku: product.sku,
          stock: product.stock,
          categoryId: categoryIds.get(product.categorySlug),
          images: [{ ...image, alt: product.name }],
          isActive: product.isActive,
          rating: product.rating,
          reviewCount: 0,
          createdAt: existing?.createdAt
            ? new Date(existing.createdAt)
            : new Date(product.createdAt),
          updatedAt: now,
        };
        await productsCollection.updateOne(
          { sku: product.sku },
          { $set: document, $unset: { image: "", categorySlug: "", id: "" } },
          { upsert: true },
        );
        console.log(`✓ Migrated product to MongoDB + Cloudinary: ${product.name}`);
      }
    }

    console.log("\n✓ Product seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
