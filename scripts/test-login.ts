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

async function testLogin() {
  try {
    const { getMongoDb } = await import("../src/lib/mongodb");
    const { verifyPassword, normalizeEmail } = await import("../src/lib/auth");

    const db = await getMongoDb();
    const usersCollection = db.collection("users");

    console.log("Testing login credentials...\n");

    // Test admin login
    const adminEmail = normalizeEmail("admin@sorrel.local");
    const adminUser = await usersCollection.findOne({ email: adminEmail });

    if (adminUser) {
      console.log("✓ Admin user found:", adminUser.email);
      const isValidPassword = await verifyPassword("Admin@12345", adminUser.passwordHash as string);
      console.log(`  Password valid: ${isValidPassword ? "✓ YES" : "✗ NO"}`);
      console.log(`  Role: ${adminUser.role}`);
    } else {
      console.log("✗ Admin user not found");
    }

    console.log();

    // Test customer login
    const customerEmail = normalizeEmail("customer@sorrel.local");
    const customerUser = await usersCollection.findOne({ email: customerEmail });

    if (customerUser) {
      console.log("✓ Customer user found:", customerUser.email);
      const isValidPassword = await verifyPassword(
        "Customer@12345",
        customerUser.passwordHash as string,
      );
      console.log(`  Password valid: ${isValidPassword ? "✓ YES" : "✗ NO"}`);
      console.log(`  Role: ${customerUser.role}`);
    } else {
      console.log("✗ Customer user not found");
    }

    console.log("\n📝 Login Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email:    admin@sorrel.local");
    console.log("  Password: Admin@12345");
    console.log("  Redirects to: /admin");
    console.log();
    console.log("Customer:");
    console.log("  Email:    customer@sorrel.local");
    console.log("  Password: Customer@12345");
    console.log("  Redirects to: /account");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testLogin();
