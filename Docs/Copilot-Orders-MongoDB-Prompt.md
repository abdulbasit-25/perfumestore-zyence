# Move Orders from Zustand to MongoDB — Sorrel E-Commerce Store

You are working on the **Sorrel E-Commerce Store**, built with:

- TanStack Start
- React + TypeScript
- MongoDB Atlas
- Zustand
- Zod
- TanStack Router
- Existing JWT authentication
- Existing admin/customer order UI

## Objective

Move **orders from the frontend Zustand store to MongoDB**.

MongoDB must become the **single source of truth for orders**.

Do NOT redesign the UI. Do NOT remove existing order functionality. Preserve the current user experience while replacing the frontend-only order persistence with a proper server/database architecture.

---

# 1. Analyze Existing Order Architecture First

Before modifying code, inspect:

- `src/lib/store.ts`
- `src/routes/checkout.tsx`
- `src/routes/account.tsx`
- `src/routes/admin.orders.tsx`
- `src/routes/admin.tsx`
- `src/lib/auth.ts`
- `src/lib/auth-server.ts`
- `src/lib/mongodb.ts`
- `src/lib/product-server.ts`
- Existing Zod schemas
- Existing server functions/API patterns
- Existing `mock-data.ts`
- Existing product types
- Existing user types

Identify:

1. How `useOrders` currently stores orders.
2. How checkout creates orders.
3. How account page retrieves orders.
4. How admin orders retrieves and modifies orders.
5. Existing authentication/session/JWT flow.
6. Existing MongoDB connection pattern.
7. Existing TypeScript order types.
8. Existing order statuses and status history structure.

Do not blindly rewrite the architecture. Reuse existing project conventions where appropriate.

---

# 2. Create MongoDB Orders Collection

Create a proper MongoDB-backed `orders` collection.

Use the existing MongoDB connection helper instead of creating a second database connection system.

Suggested order structure:

```ts
{
  _id: ObjectId,

  orderNumber: string,

  userId: ObjectId | string,

  customer: {
    name: string,
    email: string,
    phone?: string
  },

  shippingAddress: {
    address: string,
    city: string,
    postalCode?: string,
    country?: string
  },

  items: [
    {
      productId: ObjectId | string,
      name: string,
      slug?: string,
      sku?: string,
      price: number,
      quantity: number,
      image?: string
    }
  ],

  subtotal: number,
  shipping: number,
  total: number,

  paymentMethod: "COD",
  paymentStatus: "unpaid" | "paid",

  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",

  statusHistory: [
    {
      status: string,
      timestamp: Date,
      note?: string
    }
  ],

  notes?: string,

  createdAt: Date,
  updatedAt: Date
}
```

Adapt the structure if the project already has an established order type.

Do not duplicate fields unnecessarily.

---

# 3. Add Order Validation

Create a dedicated order validation/schema module if one does not already exist.

Use Zod for server-side validation.

Validate:

- customer information
- shipping address
- order items
- product IDs
- quantities
- prices
- subtotal
- shipping
- total
- payment method
- notes

Never trust totals, prices, quantities, or user identity coming from the browser.

The server should determine the authenticated user from the JWT/session rather than accepting an arbitrary `userId` from the client.

---

# 4. Implement Server-Side Order Functions

Create an organized server-side order module following the existing TanStack Start architecture.

For example:

```text
src/lib/order-server.ts
```

or the project's existing server/API organization if a better convention already exists.

Implement at minimum:

### createOrder

Creates an order in MongoDB.

Requirements:

- Require authenticated user.
- Get user identity from JWT/session.
- Validate request with Zod.
- Validate order items.
- Generate a unique order number.
- Calculate totals server-side.
- Set initial status to `pending`.
- Create initial status history entry.
- Store timestamps.
- Insert into MongoDB.
- Return a safe order response.

---

### getMyOrders

Returns orders belonging ONLY to the authenticated customer.

Query:

```text
orders.userId === authenticatedUser.id
```

Never allow the client to supply another user's ID to retrieve orders.

Sort newest orders first.

---

### getOrderById

Allow an authenticated customer to retrieve their own order.

Rules:

- Customer can only access their own order.
- Admin can access any order.
- Never expose another customer's order to a normal customer.

---

### getAdminOrders

Admin-only.

Requirements:

- Authenticate JWT.
- Verify MongoDB user exists.
- Verify `role === "admin"`.
- Return orders with pagination.
- Support useful filters where practical:
  - status
  - paymentStatus
  - search
  - date range

Do not rely on frontend role checks.

---

### updateOrderStatus

Admin-only.

Allow:

```text
pending
confirmed
shipped
delivered
cancelled
```

When status changes:

1. Update `status`.
2. Add an entry to `statusHistory`.
3. Update `updatedAt`.

Do not overwrite existing status history.

---

### updatePaymentStatus

Admin-only.

Allow:

```text
unpaid
paid
```

Update `updatedAt`.

---

# 5. Generate Proper Order Numbers

Replace the current frontend-only order creation behavior.

The server should generate the order number.

Preserve the existing Sorrel convention:

```text
SRL-XXXX
```

However, ensure uniqueness.

Do NOT rely solely on random generation.

Create a unique MongoDB index for `orderNumber`.

If necessary, use a stronger format such as:

```text
SRL-2026-XXXXXX
```

but preserve the existing UI expectations if possible.

---

# 6. Update Checkout

Modify:

```text
src/routes/checkout.tsx
```

so checkout no longer creates an order exclusively inside Zustand.

Current flow:

```text
Checkout
→ Zustand
→ localStorage
```

Replace it with:

```text
Checkout
→ authenticated server function
→ MongoDB
→ returned order
→ success UI
→ account/order history
```

Requirements:

- Validate checkout form.
- Verify user authentication.
- Send checkout data to the server.
- Server creates MongoDB order.
- Receive the created order/order number.
- Show successful confirmation.
- Clear cart ONLY after successful database order creation.
- Do not clear the cart if order creation fails.
- Prevent duplicate submissions.
- Handle server errors gracefully.

Do not allow users to create orders if MongoDB insertion fails.

---

# 7. Update Customer Account Page

Modify:

```text
src/routes/account.tsx
```

Remove dependency on mock/Zustand orders as the source of truth.

Customer order history should come from MongoDB.

Flow:

```text
Account
→ getMyOrders()
→ MongoDB
→ authenticated customer's orders
```

Requirements:

- Show only the current user's orders.
- Display order number.
- Date.
- Items.
- Total.
- Payment status.
- Order status.
- Status history where the current UI supports it.
- Show proper loading state.
- Show proper empty state.
- Handle API/database errors.

Do not expose another customer's orders.

---

# 8. Update Admin Orders

Modify:

```text
src/routes/admin.orders.tsx
```

Replace Zustand/mock orders with MongoDB data.

Admin flow:

```text
Admin Orders
→ getAdminOrders()
→ MongoDB
```

Status updates:

```text
Admin UI
→ updateOrderStatus()
→ MongoDB
→ refresh/revalidate orders
```

Payment updates:

```text
Admin UI
→ updatePaymentStatus()
→ MongoDB
→ refresh/revalidate orders
```

Preserve the existing table, sidebar, status selector, payment toggle, and UI styling.

Do not rewrite the UI unnecessarily.

---

# 9. Remove Orders From Mock Data

Inspect:

```text
src/lib/mock-data.ts
```

The existing generated mock orders should no longer be used by production order flows.

Do NOT immediately delete mock data if other UI components still depend on it.

Instead:

1. Identify every import of mock orders.
2. Replace production order consumers with MongoDB.
3. Remove obsolete order-generation code once nothing depends on it.
4. Keep seed/demo functionality only if it is genuinely useful.

The application must not silently fall back to mock orders.

---

# 10. Refactor Zustand `useOrders`

Inspect:

```text
src/lib/store.ts
```

Remove `useOrders` as the persistent source of truth.

Do not break unrelated Zustand stores such as:

- cart
- theme
- other legitimate client state

If some temporary client-side order state is still required for UI purposes, keep it minimal and derived from server data.

The database must be authoritative.

Do NOT store the complete order collection in localStorage.

---

# 11. Add Database Indexes

Create appropriate indexes for the orders collection.

At minimum consider:

```text
orderNumber
userId
createdAt
status
paymentStatus
```

Create a unique index for:

```text
orderNumber
```

Also consider a compound index for common customer/admin queries, such as:

```text
userId + createdAt
```

Avoid unnecessary indexes.

---

# 12. Authentication and Authorization

This is critical.

Every order server function must enforce authorization server-side.

### Customer

Can:

- create their own order
- view their own orders
- view their own order details

Cannot:

- view another user's orders
- modify order status
- modify payment status
- access admin order data

### Admin

Can:

- view all orders
- view any order
- update order status
- update payment status

Do NOT trust:

```ts
user.role
```

from Zustand/localStorage.

Do NOT accept arbitrary user IDs from the browser for authorization.

Use the existing JWT/server authentication implementation.

---

# 13. Protect Against Price Manipulation

Do not trust product prices sent from the frontend.

When creating an order:

```text
client sends productId + quantity
        ↓
server loads product from MongoDB
        ↓
server obtains authoritative price
        ↓
server calculates line totals
        ↓
server calculates subtotal
        ↓
server calculates shipping
        ↓
server calculates final total
        ↓
MongoDB order
```

This prevents users from modifying prices through browser requests.

If the existing product system supports MongoDB products, use those records.

---

# 14. Stock Validation

Before creating the order:

- Verify each product exists.
- Verify requested quantity is available.
- Reject unavailable products.
- Reject quantities <= 0.

If stock decrement is already supported safely, implement it.

If atomic inventory decrement is not yet implemented, do NOT create an unsafe stock system.

At minimum, prevent checkout against nonexistent/out-of-stock products.

Keep stock decrement as a clearly isolated follow-up if necessary.

---

# 15. Error Handling

Handle:

- unauthenticated user
- unauthorized user
- invalid order payload
- nonexistent product
- insufficient stock
- MongoDB connection failure
- duplicate order number
- database insertion failure
- order not found
- unauthorized order access

Return safe user-facing errors.

Do not expose:

- MongoDB connection strings
- JWT secrets
- stack traces
- internal database errors
- sensitive server information

---

# 16. Loading and Empty States

Preserve the existing UI behavior.

Add/maintain:

### Loading

```text
Loading orders...
```

or existing skeleton components.

### Empty

```text
No orders yet.
```

### Error

A useful retry/error message.

Do not display fake orders while MongoDB is loading.

---

# 17. Prevent Duplicate Orders

Checkout must prevent accidental duplicate submissions.

Implement:

- disabled submit button while processing
- server-side order creation protection where practical
- appropriate error handling

If an idempotency strategy is practical within the existing architecture, implement it.

Do not create duplicate orders from double-clicking the checkout button.

---

# 18. TypeScript Requirements

Maintain strict typing.

Do not introduce:

```ts
any
```

unless absolutely unavoidable.

Create/reuse proper types for:

- Order
- OrderItem
- OrderStatus
- PaymentStatus
- StatusHistoryEntry
- CreateOrderInput
- UpdateOrderStatusInput

Keep client/server types consistent.

---

# 19. Testing

Add tests for the new order functionality.

At minimum test:

### Customer

- authenticated customer can create order
- unauthenticated user cannot create order
- customer can retrieve own orders
- customer cannot retrieve another user's order

### Admin

- admin can retrieve all orders
- admin can update order status
- admin can update payment status
- non-admin cannot update order status

### Validation

- invalid quantity rejected
- nonexistent product rejected
- insufficient stock rejected
- manipulated price rejected

### Checkout

- successful checkout creates MongoDB order
- failed checkout does NOT clear cart
- successful checkout clears cart

Use the existing Vitest/testing setup.

---

# 20. Do Not Over-Implement

This task is specifically:

> Move orders from Zustand to MongoDB.

Do NOT implement unrelated features such as:

- Stripe
- PayPal
- email notifications
- password reset
- wishlist
- coupons
- reviews
- shipping APIs
- analytics
- recommendation engine

Those are separate tasks.

---

# 21. Migration / Seed Support

If useful, create:

```text
scripts/seed-orders.ts
```

for development/demo orders.

Seed orders should reference real seeded users/products where possible.

Do not use fake orders automatically in production.

Add an npm script only if consistent with the existing project:

```json
"seed:orders": "..."
```

---

# 22. Final Cleanup

After implementation:

Search the entire project for:

```text
useOrders
mock orders
makeOrder
seedOrders
mock-data orders
localStorage orders
```

Determine which references are still legitimate.

Production customer/admin order flows must no longer depend on mock/Zustand orders.

---

# 23. Verify Everything

Run:

```bash
npm run build
npm run test
```

Also run the appropriate lint/typecheck commands if available.

Verify:

### Customer flow

```text
Login
→ Shop
→ Product
→ Add to Cart
→ Checkout
→ Create MongoDB Order
→ Account
→ Order appears
```

### Admin flow

```text
Admin Login
→ Admin Orders
→ MongoDB orders appear
→ Change status
→ MongoDB updates
→ Status history updates
→ Change payment status
→ MongoDB updates
```

### Security flow

```text
Customer A
→ cannot access Customer B's orders

Customer
→ cannot update order status

Customer
→ cannot access admin order data

Non-authenticated user
→ cannot create/read protected orders
```

---

# Important Implementation Rules

1. **MongoDB is now the source of truth for orders.**
2. **Zustand must not remain the authoritative order database.**
3. **Do not trust frontend prices or user IDs.**
4. **Authorization must happen server-side.**
5. **Preserve the existing UI.**
6. **Reuse existing MongoDB and authentication infrastructure.**
7. **Use Zod for server-side validation.**
8. **Use proper TypeScript types.**
9. **Do not introduce unrelated features.**
10. **Do not delete working functionality unnecessarily.**
11. **Do not silently fall back to mock orders.**
12. **Do not store the complete order collection in localStorage.**

## Deliverables

When finished, provide:

1. Files created.
2. Files modified.
3. Files removed, if any.
4. MongoDB collections/indexes introduced.
5. Server functions/API endpoints introduced.
6. Zustand order logic removed/reduced.
7. Authentication/authorization changes.
8. Tests added.
9. Commands executed and their results.
10. Any remaining limitations.

Do not claim the migration is complete unless the actual checkout, customer account, and admin order flows are all using MongoDB.