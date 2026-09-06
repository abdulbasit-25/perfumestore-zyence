# SSR Trace Report

**Captured:** 2026-09-06
**Route:** `GET /`
**Deployment:** `https://e-comerce-store-two.vercel.app/`
**Repository:** `https://github.com/abdulbasit-25/E-Comerce-Store.git`

## Conclusion

The deployed response was a generic Vercel HTTP 500, so the exact production exception is not available from the browser response alone. The strongest failure boundary in the original homepage SSR path is:

```text
src/routes/index.tsx:50
  await getProducts({ data: {} })
    -> src/lib/product-server.ts:59
      await database()
        -> src/lib/product-server.ts:40
          await getMongoDb()
            -> src/lib/mongodb.ts:29
              await client.connect()
```

The equivalent categories path is:

```text
src/routes/index.tsx:66
  await getCategories()
    -> src/lib/category-server.ts:30
      await database()
        -> src/lib/category-server.ts:17
          await getMongoDb()
            -> src/lib/mongodb.ts:29
              await client.connect()
```

If Production `MONGODB_URI` is missing, the exact throw is `src/lib/mongodb.ts:20`:

```ts
throw new Error("MONGODB_URI environment variable is not set");
```

If the variable exists but Atlas/network/authentication fails, the rejection occurs at `src/lib/mongodb.ts:29` and is rethrown at `src/lib/mongodb.ts:37`. The repository has no Vercel function log proving which of these occurred. After the homepage change, both query functions have `enabled: typeof window !== "undefined"`, so these loaders no longer execute during SSR; they execute in the browser and catch their own errors.

## Homepage Loaders

Source: `src/routes/index.tsx`

1. `Home()` is registered as the `/` route component.
2. Product loader:
   - Query key: `home-products`.
   - SSR gate: `enabled: typeof window !== "undefined"`.
   - Calls `getProducts({ data: {} })` at line 50.
   - Catches client-side loader failures, logs `Unable to load homepage products:`, and returns `[]`.
3. Category loader:
   - Query key: `home-categories`.
   - SSR gate: `enabled: typeof window !== "undefined"`.
   - Calls `getCategories()` at line 66.
   - Catches client-side loader failures, logs `Unable to load homepage categories:`, and returns `[]`.
4. Product results are sliced into featured products and sorted by rating for best sellers.
5. Categories render only when the query is no longer pending and has no error.
6. Product cards render only when the product query is no longer pending and has no error.

The loader guards were introduced in the last-30-commit range. Before that change, both server functions were eligible to run during SSR and a MongoDB failure could fail the root render.

## SSR Call Graph

```text
GET /
  -> src/server.ts:82 getServerEntry()
  -> TanStack Start server entry
  -> route component Home()
     -> product React Query loader
        -> getProducts({ data: {} })
           -> product-server database()
              -> dynamic import mongodb.ts
              -> getMongoDb()
                 -> dynamic import mongodb
                 -> read process.env.MONGODB_URI
                 -> MongoClient.connect()
              -> Promise.all(product ensureIndex calls)
           -> products.find(...).sort(...).toArray()
     -> category React Query loader
        -> getCategories()
           -> category-server database()
              -> dynamic import mongodb.ts
              -> getMongoDb()
              -> ensureIndex(categories.slug)
           -> categories.find(...).sort(...).toArray()
  -> render HTML
  -> normalizeCatastrophicSsrResponse()
```

## All Await Calls in the Trace Files

This is the complete numbered scan for `await` in the homepage route, its product/category/database modules, and both server entry files. Some entries belong to mutations or secondary APIs in the same module and are included because the request asked for all await sites in these trace files.

### `src/routes/index.tsx`

```text
50  return await getProducts({ data: {} });
66  return await getCategories();
```

### `src/lib/product-server.ts`

```text
39  const { ensureIndex, getMongoDb } = await import("@/lib/mongodb");
40  const db = await getMongoDb();
41  await Promise.all([...product index initialization...]);
51  const db = await database();
52  const { requirePermission } = await import("@/lib/authorization-server");
53  return (await requirePermission(token, "manageProducts")).db;
59  const db = await database();
65  await db.collection("categories").findOne({ slug: categoryValue });
82  const products = await db.collection("products").find(query).sort(...).toArray();
91  const db = await database();
92  const product = await db.collection("products").findOne(...);
100 const db = await database();
101 const product = await db.collection("products").findOne(...);
112 const db = await database();
113 const products = await db.collection("products").find(...).toArray();
123 await requireAdmin(data.token);
124 const { uploadProductImage: upload } = await import("@/lib/cloudinary");
125 const result = await upload(...);
132 const db = await requireAdmin(data.token);
135 const category = await db.collection("categories").findOne(...);
141 const result = await db.collection("products").insertOne(...);
147 const product = await db.collection("products").findOne(...);
159 const db = await requireAdmin(data.token);
161 const current = await db.collection("products").findOne(...);
166 const category = await db.collection("categories").findOne(...);
177 const result = await db.collection("products").findOneAndUpdate(...);
191 const { deleteProductImage } = await import("@/lib/cloudinary");
192 await deleteProductImage(publicId);
211 const { requirePermission } = await import("@/lib/authorization-server");
212 const db = (await requirePermission(data.token, "deleteData")).db;
214 const product = await db.collection("products").findOne(...);
218 const { deleteProductImage } = await import("@/lib/cloudinary");
219 await deleteProductImage(image.publicId);
221 await db.collection("products").deleteOne(...);
```

### `src/lib/category-server.ts`

```text
16 const { ensureIndex, getMongoDb } = await import("@/lib/mongodb");
17 const db = await getMongoDb();
18 await ensureIndex(db, "categories", { slug: 1 }, { unique: true });
23 const db = await database();
24 const { requirePermission } = await import("@/lib/authorization-server");
25 return (await requirePermission(token, "manageCategories")).db;
30 const db = await database();
31 const categories = await db.collection("categories").find(...).sort(...).toArray();
52 const { requirePermission } = await import("@/lib/authorization-server");
53 const db = (await requirePermission(data.token, "manageCategories")).db;
58 const result = await db.collection("categories").insertOne(...);
74 const db = await requireAdmin(data.token);
76 const productCount = await db.collection("products").countDocuments(...);
82 const result = await db.collection("categories").deleteOne(...);
```

### `src/lib/mongodb.ts`

```text
17 const { MongoClient } = await import("mongodb");
29 await client.connect();
42 await getMongoDb();
49 await cachedClient.close();
73 await initialization;
87 const indexes = await collection.listIndexes().toArray();
96 await collection.dropIndex(existing.name);
99 await collection.createIndex(key, options);
111 const existing = await db.listCollections(...).hasNext();
116 await db.createCollection(collectionName);
131 await initialization;
```

### `src/server.ts`

```text
28 const body = await response.clone().text();
48 const { handleLoginRequest } = await import("@/lib/auth-api");
54 const payload = await request.json();
55 const { registerUser } = await import("@/lib/auth-api");
56 const result = await registerUser(...);
82 const handler = await getServerEntry();
83 const response = await handler.fetch(request, env, ctx);
84 return await normalizeCatastrophicSsrResponse(response);
```

### `src/start.ts`

```text
8   return await next();
33  const payload = await request.json();
38  const { registerUser } = await import("./lib/auth-api");
39  const result = await registerUser(...);
56  const { handleLoginRequest } = await import("./lib/auth-api");
```

## Explicit Throw Sites

### `src/lib/mongodb.ts`

```text
10  throw new Error("MongoDB access is only allowed on the server.");
20  throw new Error("MONGODB_URI environment variable is not set");
37  throw error;
43  if (!cachedClient) throw new Error("MongoDB client is not initialized");
76  throw error;
124 throw error;
134 throw error;
```

### `src/start.ts`

```text
11  throw error;
```

No `throw new Error` appears in `src/routes/index.tsx`, `src/lib/product-server.ts`, `src/lib/category-server.ts`, or `src/server.ts`.

## Failure Interpretation

| Trace point             | Meaning                                           | Production implication                                                                                                                       |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `mongodb.ts:10`         | A database helper was reached in a browser bundle | Indicates server/client boundary violation or an unexpected client invocation. The current server function architecture should prevent this. |
| `mongodb.ts:20`         | `MONGODB_URI` is absent or empty                  | Most direct configuration failure. Check Vercel Production environment variables.                                                            |
| `mongodb.ts:29`         | MongoDB connection failed or timed out            | Check Atlas network access, credentials, TLS, DNS, region, and connection limits.                                                            |
| `mongodb.ts:37`         | MongoDB connection error is logged and rethrown   | The upstream SSR/server-function handler receives the rejection.                                                                             |
| `mongodb.ts:73`, `:76`  | Product index setup failed                        | Check index permissions, duplicate existing indexes, or Atlas availability.                                                                  |
| `product-server.ts:82`  | Product query failed                              | Check collection access, database name `sorrel`, and MongoDB connectivity.                                                                   |
| `category-server.ts:31` | Category query failed                             | Same connection/collection checks for `categories`.                                                                                          |
| `server.ts:83-84`       | TanStack request failed or normalization ran      | This is the outer response boundary, not the root database cause.                                                                            |

## Last 30 Commits

```text
8cb9836  2026-09-06  ReadME
84073c1  2026-09-06  ReadME
16e48ec  2026-09-06  Update Vitest configuration
43b9176  2026-09-06  Update async hooks polyfill
94d4c77  2026-09-06  Update tooltip component
343fee1  2026-09-06  Update FAQ section
c0622a3  2026-09-06  Update product test script
3e0a6f3  2026-09-06  Update ESLint configuration
70a05a0  2026-09-06  Add shipment tests
f8b3056  2026-09-06  Add pagination utilities
edc9c18  2026-09-06  Add mock data documentation
7217436  2026-09-06  Add project progress documentation
1300aa3  2026-09-06  Update TanStack Start configuration
0ca80e6  2026-09-06  Update server configuration
bbee597  2026-09-06  Update product detail route
acbd7d1  2026-09-06  Update login flow
b32a057  2026-09-06  Update checkout flow
4b332d7  2026-09-06  Update admin users
8ab1168  2026-09-06  Update admin layout
328891c  2026-09-06  Update admin shipments
ea4ef42  2026-09-06  Update admin reviews
3bd5d30  2026-09-06  Update admin returns
6cac383  2026-09-06  Update admin products
6162801  2026-09-06  Update admin orders
a8957fe  2026-09-06  Update admin inventory
27bfc64  2026-09-06  Update admin dashboard
a30f7ab  2026-09-06  Update admin customers
0b046f7  2026-09-06  Update admin coupons
33c9c0c  2026-09-06  Update admin categories
c3b17c9  2026-09-06  Update account route
```

### Aggregate diff for the last 30 commits

Command used:

```text
git diff HEAD~30..HEAD
```

Aggregate result:

```text
29 files changed
677 insertions(+)
409 deletions(-)
```

Changed files:

```text
A Docs/Progress 6 9 2026.md
A MOcdata.md
M eslint.config.js
M scripts/test-products.ts
M src/components/storefront/home/faq-section.tsx
M src/components/ui/tooltip.tsx
M src/lib/async-hooks-polyfill.ts
A src/lib/pagination.ts
A src/lib/shipment.test.ts
M src/routes/account.tsx
M src/routes/admin.categories.tsx
M src/routes/admin.coupons.tsx
M src/routes/admin.customers.tsx
M src/routes/admin.index.tsx
M src/routes/admin.inventory.tsx
M src/routes/admin.orders.tsx
M src/routes/admin.products.tsx
M src/routes/admin.returns.tsx
M src/routes/admin.reviews.tsx
M src/routes/admin.shipments.tsx
M src/routes/admin.tsx
M src/routes/admin.users.tsx
M src/routes/checkout.tsx
M src/routes/index.tsx
M src/routes/login.tsx
M src/routes/product.$slug.tsx
M src/server.ts
M src/start.ts
M vitest.config.ts
```

### SSR-relevant diff from the last 30 commits

```diff
diff --git a/src/routes/index.tsx b/src/routes/index.tsx
@@
   } = useQuery({
     queryKey: ["home-products"],
-    queryFn: () => getProducts({ data: {} }),
+    enabled: typeof window !== "undefined",
+    queryFn: async () => {
+      try {
+        return await getProducts({ data: {} });
+      } catch (error) {
+        console.error("Unable to load homepage products:", error);
+        return [];
+      }
+    },
@@
   } = useQuery({
     queryKey: ["home-categories"],
-    queryFn: () => getCategories(),
+    enabled: typeof window !== "undefined",
+    queryFn: async () => {
+      try {
+        return await getCategories();
+      } catch (error) {
+        console.error("Unable to load homepage categories:", error);
+        return [];
+      }
+    },
```

The same 30-commit diff removed duplicated login implementations from `src/server.ts` and `src/start.ts`, delegating to `src/lib/auth-api.ts`. No MongoDB implementation file changed in this 30-commit range; the homepage route change is the relevant SSR behavior change.

## Verification Status

- `npm run build`: passed with exit code 0 before this report was generated.
- Local configured dev server: `GET /` returned HTTP 200.
- Local no-database check: `GET /` returned HTTP 200 after the homepage SSR guard.
- Deployed endpoint: returned HTTP 500 with Vercel's generic error page.
- Vercel function logs: unavailable from this workspace.
- Exact production cause: not provable from the generic response; check the Vercel function log for the first error emitted before the 500.

## Next Diagnostic Command

After deploying the current commit, run:

```text
curl.exe -i https://e-comerce-store-two.vercel.app/
```

Then inspect the Vercel Function Logs. The first matching message should identify one of:

```text
MONGODB_URI environment variable is not set
Failed to connect to MongoDB
MongoServerError / MongoNetworkError / MongoServerSelectionError
```

Do not paste secret-bearing environment values into this report or into issue comments.
