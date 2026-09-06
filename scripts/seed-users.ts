import { getMongoDb, closeMongoDb } from "../src/lib/mongodb";
import { hashPassword } from "../src/lib/auth";
import { normalizeEmail } from "../src/lib/auth-validation";

async function seedUsers() {
  console.log("Starting user seed...");

  try {
    const db = await getMongoDb();
    const usersCollection = db.collection("users");

    // Create unique email index
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Admin user
    const adminEmail = normalizeEmail("admin@zyence.local");
    const adminPasswordHash = await hashPassword("Admin@12345");

    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await usersCollection.insertOne({
        name: "Zyence Administrator",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Admin user created (admin@zyence.local)");
    } else {
      console.log("✓ Admin user already exists");
    }

    // Customer user
    const customerEmail = normalizeEmail("customer@zyence.local");
    const customerPasswordHash = await hashPassword("Customer@12345");

    const existingCustomer = await usersCollection.findOne({ email: customerEmail });
    if (!existingCustomer) {
      await usersCollection.insertOne({
        name: "Demo Customer",
        email: customerEmail,
        passwordHash: customerPasswordHash,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Customer user created (customer@zyence.local)");
    } else {
      console.log("✓ Customer user already exists");
    }

    console.log("User seed completed successfully!");
  } catch (error) {
    console.error("Error during seed:", error);
    process.exit(1);
  } finally {
    await closeMongoDb();
  }
}

seedUsers();
