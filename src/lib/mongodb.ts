import type { CreateIndexesOptions, Db, IndexDescription, MongoClient } from "mongodb";

let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;
const indexInitialization = new WeakMap<Db, Map<string, Promise<void>>>();
const collectionInitialization = new WeakMap<Db, Map<string, Promise<void>>>();

export async function getMongoDb(): Promise<Db> {
  if (typeof window !== "undefined") {
    throw new Error("MongoDB access is only allowed on the server.");
  }

  if (cachedDb) {
    return cachedDb;
  }

  const { MongoClient } = await import("mongodb");
  const mongoUri = process.env["MONGODB_URI"];
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    const client = new MongoClient(mongoUri, {
      retryWrites: true,
      w: "majority",
    });

    await client.connect();
    cachedClient = client;
    cachedDb = client.db("zyence");

    console.log("Connected to MongoDB");
    return cachedDb;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  await getMongoDb();
  if (!cachedClient) throw new Error("MongoDB client is not initialized");
  return cachedClient;
}

export async function closeMongoDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedDb = null;
    cachedClient = null;
    console.log("Disconnected from MongoDB");
  }
}

export async function ensureIndex(
  db: Db,
  collectionName: string,
  key: IndexDescription["key"],
  options: CreateIndexesOptions = {},
): Promise<void> {
  let initialized = indexInitialization.get(db);
  if (!initialized) {
    initialized = new Map();
    indexInitialization.set(db, initialized);
  }
  const cacheKey = `${collectionName}:${JSON.stringify(key)}:${JSON.stringify(options)}`;
  const existingPromise = initialized.get(cacheKey);
  if (existingPromise) return existingPromise;
  const initialization = ensureIndexOnce(db, collectionName, key, options);
  initialized.set(cacheKey, initialization);
  try {
    await initialization;
  } catch (error) {
    initialized.delete(cacheKey);
    throw error;
  }
}

async function ensureIndexOnce(
  db: Db,
  collectionName: string,
  key: IndexDescription["key"],
  options: CreateIndexesOptions,
): Promise<void> {
  const collection = db.collection(collectionName);
  const indexes = await collection.listIndexes().toArray();
  const requestedKey = JSON.stringify(key);
  const existing = indexes.find((index) => JSON.stringify(index.key) === requestedKey);

  if (existing) {
    const sameOptions =
      Boolean(existing.unique) === Boolean(options.unique) &&
      Boolean(existing.sparse) === Boolean(options.sparse);
    if (sameOptions) return;
    if (existing.name) await collection.dropIndex(existing.name);
  }

  await collection.createIndex(key, options);
}

export async function ensureCollection(db: Db, collectionName: string): Promise<void> {
  let initialized = collectionInitialization.get(db);
  if (!initialized) {
    initialized = new Map();
    collectionInitialization.set(db, initialized);
  }
  const existingPromise = initialized.get(collectionName);
  if (existingPromise) return existingPromise;
  const initialization = (async () => {
    const existing = await db
      .listCollections({ name: collectionName }, { nameOnly: true })
      .hasNext();
    if (!existing) {
      try {
        await db.createCollection(collectionName);
      } catch (error) {
        if (!(
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 48
        )) {
          throw error;
        }
      }
    }
  })();
  initialized.set(collectionName, initialization);
  try {
    await initialization;
  } catch (error) {
    initialized.delete(collectionName);
    throw error;
  }
}
