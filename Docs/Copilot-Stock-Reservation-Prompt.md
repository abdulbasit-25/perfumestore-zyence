# Implement Atomic Stock Reservation / Decrement During Checkout

You are working on the **Sorrel E-Commerce Store** using:

- TanStack Start
- React + TypeScript
- MongoDB Atlas
- Zustand
- Zod
- TanStack Router
- Existing JWT authentication
- MongoDB-backed products
- MongoDB-backed orders

## Objective

Implement **atomic stock reservation/decrement during checkout**.

The critical requirement is:

> Two customers must never be able to successfully purchase more units of a product than are actually available.

Stock validation and decrement must happen **server-side and atomically in MongoDB**.

Do NOT implement frontend-only stock management.

Do NOT trust stock quantities sent by the browser.

---

# 1. Inspect Existing Architecture First

Before changing anything, inspect:

```text
src/routes/checkout.tsx
src/lib/order-server.ts
src/lib/product-server.ts
src/lib/mongodb.ts
src/lib/catalog-types.ts
src/lib/store.ts
src/routes/product.$slug.tsx
src/routes/shop.tsx
```

Also inspect:

- existing product MongoDB structure
- existing product seed/migration scripts
- existing order schema/types
- existing checkout validation
- existing authentication implementation
- existing MongoDB connection helper
- existing admin product management

Determine exactly where:

- product stock is stored
- product price is stored
- product ID is represented
- checkout currently creates orders
- order items are structured

Reuse the existing architecture instead of creating a parallel system.

---

# 2. Server Must Be the Source of Truth

The browser should only send something equivalent to:

```ts
{
  productId: string,
  quantity: number
}
```

Do NOT trust the browser for:

```text
price
stock
subtotal
shipping
total
product name
SKU
```

The server must retrieve authoritative product information from MongoDB.

Checkout flow should become:

```text
Customer
   ↓
Checkout
   ↓
createOrder()
   ↓
Authenticate user
   ↓
Validate request
   ↓
Load products from MongoDB
   ↓
Atomically reserve/decrement stock
   ↓
Calculate authoritative totals
   ↓
Create order
   ↓
Return order
```

---

# 3. Implement Atomic Stock Decrement

Use MongoDB's atomic conditional update mechanism.

For each product, stock must only be decremented when enough stock exists.

Conceptually:

```ts
await products.updateOne(
  {
    _id: productId,
    stock: { $gte: quantity }
  },
  {
    $inc: {
      stock: -quantity
    }
  }
)
```

The important condition is:

```text
stock >= requested quantity
```

combined with:

```text
$inc: { stock: -quantity }
```

This must happen in **one atomic database operation**.

Do NOT implement:

```text
1. find product
2. check stock
3. wait
4. update stock
```

because that creates a race condition.

---

# 4. Handle Multiple Products Correctly

An order can contain multiple products.

Example:

```text
Product A → quantity 2
Product B → quantity 1
Product C → quantity 4
```

All requested quantities must be validated and reserved safely.

If one product cannot satisfy the requested quantity:

```text
Product A → reserved
Product B → insufficient stock
```

DO NOT leave Product A permanently decremented.

The operation must be **all-or-nothing**.

---

# 5. Use MongoDB Transactions Where Supported

For multi-product checkout, use a MongoDB transaction/session where the existing deployment configuration supports transactions.

Preferred flow:

```text
Start MongoDB session
        ↓
Start transaction
        ↓
Validate authenticated user
        ↓
Load authoritative products
        ↓
Atomically decrement Product A
        ↓
Atomically decrement Product B
        ↓
Atomically decrement Product C
        ↓
Create order
        ↓
Commit transaction
```

If any step fails:

```text
Abort transaction
        ↓
No stock changes remain
        ↓
No order is created
```

Do not silently implement a non-transactional multi-product reservation if the existing MongoDB deployment supports transactions.

If transactions are unavailable in the current development environment, clearly report that limitation rather than pretending the operation is fully atomic across multiple products.

---

# 6. Prevent Negative Stock

It must be impossible for checkout to produce:

```text
stock < 0
```

For every product:

```text
requestedQuantity > 0
```

and:

```text
currentStock >= requestedQuantity
```

must be enforced server-side.

Never perform:

```ts
$inc: { stock: -quantity }
```

without a stock condition.

---

# 7. Recalculate Order Totals Server-Side

While processing checkout:

1. Load each product from MongoDB.
2. Read current authoritative price.
3. Read current stock.
4. Validate quantity.
5. Atomically decrement stock.
6. Calculate line total.
7. Calculate subtotal.
8. Calculate shipping.
9. Calculate final total.
10. Create the order.

Example:

```text
Product price = $100
Requested quantity = 2

Line total = $200
```

The client cannot manipulate this by sending:

```text
price = $1
```

or:

```text
total = $2
```

---

# 8. Prevent Duplicate Product Lines

Before processing checkout, normalize the cart items.

If the browser sends:

```text
Product A × 2
Product A × 3
```

combine them into:

```text
Product A × 5
```

before stock reservation.

Do not perform separate stock operations for duplicate product IDs.

---

# 9. Validate Product Existence

If a product no longer exists:

```text
POST checkout
↓
Product lookup fails
↓
Reject checkout
↓
No order created
↓
No stock permanently changed
```

Return a safe user-facing error.

Do not silently skip missing products.

---

# 10. Validate Product Availability

Reject checkout when:

```text
stock === 0
```

or:

```text
requestedQuantity > stock
```

Use a clear message such as:

```text
"Some items are no longer available in the requested quantity."
```

Do not expose internal MongoDB errors.

---

# 11. Handle Race Conditions

This is one of the most important requirements.

Example:

```text
Stock = 5

Customer A requests 4
Customer B requests 4
```

Expected result:

```text
Customer A → succeeds
Customer B → fails
```

NOT:

```text
Customer A → succeeds
Customer B → succeeds
Stock → -3
```

Test this behavior explicitly.

The database operation must determine whether stock was successfully reserved.

Do not rely on a frontend check.

---

# 12. Integrate With Existing `createOrder`

The existing:

```text
src/lib/order-server.ts
```

should become the central checkout/order creation path.

Do not create a second competing checkout implementation.

Update `createOrder()` so it:

1. authenticates the user
2. validates input
3. starts transaction/session if supported
4. loads products
5. validates quantities
6. atomically decrements stock
7. calculates totals
8. creates order
9. commits transaction
10. returns created order

---

# 13. Order Item Snapshot

When creating the order, store the product information needed for historical accuracy:

```ts
{
  productId,
  name,
  slug,
  sku,
  price,
  quantity,
  image
}
```

The order must preserve the price at the time of purchase.

If a product price changes later:

```text
Existing order → old price
New order → new price
```

Do not dynamically calculate historical order totals from the current product price.

---

# 14. Checkout UI Updates

Update:

```text
src/routes/checkout.tsx
```

to correctly handle stock-related failures.

Example:

```text
Customer clicks Place Order
        ↓
Server checks stock
        ↓
Insufficient stock
        ↓
Show error
        ↓
Keep cart intact
        ↓
Do NOT create order
```

If checkout succeeds:

```text
Stock reserved
        ↓
Order created
        ↓
Cart cleared
        ↓
Success confirmation
```

The cart must only be cleared **after successful order creation**.

---

# 15. Prevent Double Checkout Submission

During checkout:

- disable the submit button while the request is running
- prevent multiple simultaneous client submissions
- show a loading state
- do not create duplicate orders from rapid clicking

If the existing architecture supports idempotency keys safely, implement them.

Otherwise, at minimum implement client submission protection and ensure the server architecture does not create duplicate orders from a single intended checkout.

---

# 16. Stock Failure Must Roll Back Everything

If an order contains:

```text
Product A → available
Product B → insufficient stock
```

the final result must be:

```text
Product A stock → unchanged
Product B stock → unchanged
Order → NOT created
```

If using MongoDB transactions, rely on transaction rollback.

Do not manually attempt fragile rollback logic when a proper MongoDB transaction can handle it.

---

# 17. Order Creation and Stock Decrement Must Be Consistent

Never allow:

```text
Stock decremented
Order creation fails
Stock remains permanently reduced
```

or:

```text
Order created
Stock decrement fails
```

The preferred transaction guarantees:

```text
Stock update + Order creation
```

are committed together.

---

# 18. Add Database Indexes Where Appropriate

Inspect the existing product indexes.

Ensure product lookup by `_id` is efficient.

Do not add unnecessary indexes.

The main atomic stock operation should use the product's indexed `_id`.

---

# 19. Testing Requirements

Add tests using the existing Vitest setup.

At minimum test:

### Successful purchase

```text
Initial stock = 10
Quantity = 3

Expected:
stock = 7
order created
```

### Exact stock purchase

```text
Initial stock = 5
Quantity = 5

Expected:
stock = 0
order created
```

### Insufficient stock

```text
Initial stock = 5
Quantity = 6

Expected:
order rejected
stock remains 5
```

### Zero quantity

```text
Quantity = 0

Expected:
request rejected
```

### Negative quantity

```text
Quantity = -1

Expected:
request rejected
```

### Missing product

```text
Invalid product ID

Expected:
checkout rejected
no order created
no stock modified
```

### Multiple products

```text
Product A = 10
Product B = 5

Request:
A × 2
B × 3

Expected:
A = 8
B = 2
order created
```

### Multi-product failure

```text
Product A = 10
Product B = 2

Request:
A × 2
B × 5

Expected:
transaction fails
A = 10
B = 2
no order created
```

### Concurrent checkout

Simulate two checkout attempts against limited stock.

Example:

```text
Stock = 5

Request A = 4
Request B = 4
```

Expected:

```text
Exactly one succeeds.
Exactly one fails.
Final stock = 1.
```

This test is especially important.

---

# 20. Admin Inventory

Inspect the existing admin product management.

After checkout, the admin product page should reflect the updated stock from MongoDB.

Do NOT update admin stock through Zustand.

MongoDB remains authoritative.

If the admin product UI currently uses local state, update it only as necessary to refresh/re-fetch the database-backed product data.

Do not redesign the admin interface.

---

# 21. Remove Obsolete Frontend Stock Logic

Search for:

```text
useCatalog
mock stock
seedProducts
product.stock
localStorage stock
```

Determine whether each usage is legitimate.

Production checkout must not depend on frontend stock values for authorization.

Frontend stock may be displayed as UI information, but the server decides whether the purchase is valid.

---

# 22. Error Handling

Handle these cases safely:

- insufficient stock
- product not found
- invalid quantity
- invalid product ID
- transaction failure
- MongoDB connection failure
- duplicate order attempt
- authentication failure
- authorization failure

Use meaningful user-facing messages.

Never expose:

- MongoDB connection strings
- JWT secrets
- stack traces
- internal database details

---

# 23. Do NOT Implement Unrelated Features

This task is ONLY:

> Atomic stock reservation/decrement during checkout.

Do NOT implement:

- Stripe
- PayPal
- email notifications
- wishlist
- coupons
- reviews
- shipping APIs
- recommendations
- analytics
- password reset
- unrelated UI redesigns

---

# 24. Final Verification

Run:

```bash
npm run build
npm run test
```

Also run existing lint/typecheck commands if available.

Then verify manually:

```text
Login
↓
Shop
↓
Product
↓
Add quantity
↓
Checkout
↓
Place order
↓
MongoDB order created
↓
MongoDB product stock decreased
↓
Account shows order
↓
Admin sees updated stock
```

Also verify:

```text
Insufficient stock
↓
Checkout rejected
↓
Cart remains intact
↓
No order created
↓
Stock unchanged
```

And:

```text
Two users buy the last few units simultaneously
↓
Only available quantity can be sold
↓
Stock never becomes negative
```

---

# Final Deliverables

When finished, report:

1. Files created.
2. Files modified.
3. Files removed, if any.
4. MongoDB transaction/session implementation.
5. Atomic stock update implementation.
6. Changes to `createOrder()`.
7. Checkout changes.
8. Stock validation rules.
9. Tests added.
10. Build/test results.
11. Any MongoDB deployment limitations.
12. Any remaining limitations.

## Critical Rule

The implementation is NOT complete if the frontend merely checks stock before calling the server.

The actual guarantee must be enforced by MongoDB:

```text
atomic stock condition
+
atomic stock decrement
+
atomic order creation
```

For multi-product orders, use a MongoDB transaction so **stock reservation and order creation succeed together or fail together**.