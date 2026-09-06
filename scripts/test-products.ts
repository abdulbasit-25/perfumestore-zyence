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

async function testProducts() {
  try {
    const { getMongoDb } = await import("../src/lib/mongodb");
    const db = await getMongoDb();

    console.log("✓ Connected to MongoDB");

    // Get all products
    const products = await db.collection("products").find({ isActive: true }).toArray();
    console.log(`✓ Found ${products.length} active products in MongoDB`);

    if (products.length > 0) {
      console.log("\nProduct list:");
      products.forEach((p, i: number) => {
        console.log(`  ${i + 1}. ${p.name} - $${p.price} (${p.stock} in stock)`);
      });
    }

    // Test filtering
    console.log("\nTesting filters:");

    // Test category filter
    const furniture = await db
      .collection("products")
      .find({
        isActive: true,
        categorySlug: "furniture",
      })
      .toArray();
    console.log(`✓ Found ${furniture.length} products in 'furniture' category`);

    // Test search filter
    const linen = await db
      .collection("products")
      .find({
        isActive: true,
        name: { $regex: "linen", $options: "i" },
      })
      .toArray();
    console.log(`✓ Found ${linen.length} products matching 'linen'`);

    // Test price filter
    const affordable = await db
      .collection("products")
      .find({
        isActive: true,
        price: { $lte: 150 },
      })
      .toArray();
    console.log(`✓ Found ${affordable.length} products under $150`);

    // Test in-stock filter
    const inStock = await db
      .collection("products")
      .find({
        isActive: true,
        stock: { $gt: 0 },
      })
      .toArray();
    console.log(`✓ Found ${inStock.length} products in stock`);

    console.log("\n✓ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testProducts();
