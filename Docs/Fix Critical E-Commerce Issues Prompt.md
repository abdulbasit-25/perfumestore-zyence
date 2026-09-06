# Fix Critical E-Commerce Issues

Work directly on the existing E-Commerce Store project.

The project audit identified four important issues that need to be fixed:

1. Admin sales/revenue chart uses mock data.
2. Chatbot order lookup uses static/mock order data.
3. Checkout needs stronger validation and edge-case protection.
4. Permission/security testing needs broader coverage.

## IMPORTANT

Do not rewrite the project or replace working functionality.

First inspect the existing implementation and understand the current architecture.

Reuse the existing MongoDB, server functions, authentication, authorization, TypeScript types, and project conventions.

After implementing each fix, test the affected functionality and make sure existing features continue working.

---

# 1. Replace Admin Sales Chart Mock Data

### Current problem

The admin dashboard revenue chart uses static `salesByMonth` data from:

`src/lib/mock-data.ts`

This must be removed from the dashboard.

### Requirements

Find the existing admin dashboard implementation, especially:

`src/routes/admin.index.tsx`

and the order server layer:

`src/lib/order-server.ts`

Create a proper server-side aggregation/query that calculates real monthly revenue from MongoDB orders.

The chart should use actual order records.

Calculate at minimum:

- Month
- Total revenue
- Number of orders

Use the project's existing order schema and status/payment conventions.

### Important

Do NOT simply calculate fake values on the frontend.

The preferred flow is:

```text
MongoDB Orders
      ↓
Server-side aggregation
      ↓
Admin server function/API
      ↓
Admin dashboard
      ↓
Revenue chart
```

Make sure:

- Current month's data is accurate.
- Previous months are accurate.
- Months with zero orders are represented correctly if the chart expects continuous months.
- Cancelled/invalid orders are handled according to the project's existing business rules.
- Revenue uses the actual stored order totals.
- Currency formatting remains consistent with the existing UI.

Remove the dependency on `salesByMonth` from `mock-data.ts` for the admin dashboard.

---

# 2. Fix Chatbot Order Lookup

### Current problem

The chatbot in:

`src/lib/chatbot.ts`

appears to use static/mock order data.

Replace this with a real MongoDB-backed order lookup.

### Requirements

Trace the existing chatbot flow first.

Determine how the chatbot receives:

- User ID
- Order ID
- Order number
- Customer identity

Then connect the lookup to:

`src/lib/order-server.ts`

or an appropriate server-side order function.

The chatbot must retrieve the customer's real orders.

### Security requirement

A customer must NEVER be able to retrieve another customer's order.

The lookup must verify ownership server-side.

Do not trust:

- Frontend user IDs
- LocalStorage
- Client-provided customer IDs
- Hidden UI fields

The server should determine the authenticated user.

Expected flow:

```text
Authenticated User
       ↓
Chatbot request
       ↓
Server authentication
       ↓
User ID from authenticated session
       ↓
MongoDB order query
       ↓
Only user's order
       ↓
Chatbot response
```

Remove static/mock order data from the chatbot's production lookup path.

Keep fixture data only if it is genuinely required for automated tests.

---

# 3. Strengthen Checkout Validation

Audit:

`src/routes/checkout.tsx`

and:

`src/lib/order-server.ts`

The checkout must not trust important values supplied by the client.

## Validate server-side

At minimum verify:

### Customer

- Authenticated user where required
- Name
- Email
- Phone
- Shipping address

### Products

For every cart item:

- Product exists
- Product is active/available
- Product ID is valid
- Quantity is valid
- Quantity is greater than zero
- Quantity is an integer
- Requested quantity does not exceed available stock

### Price

IMPORTANT:

Never trust the client-provided product price.

The server should retrieve the current product price from MongoDB.

Calculate:

```text
Product price × quantity
```

on the server.

Then calculate:

```text
Subtotal
+ shipping
- valid discount
= final total
```

Do not trust a client-provided:

- subtotal
- discount
- total
- product price
- shipping cost

unless the existing architecture explicitly requires it and the value is independently validated.

---

# 4. Coupon Validation

Inspect:

`src/lib/coupon-server.ts`

and checkout integration.

Ensure coupons are validated server-side for:

- Existence
- Active status
- Expiration
- Minimum order value
- Usage limits
- Discount type
- Discount amount
- Maximum discount if applicable

The final discount must be calculated by the server.

A customer should not be able to manipulate the request and receive an arbitrary discount.

Add tests for:

- Valid coupon
- Expired coupon
- Invalid coupon
- Minimum order failure
- Maximum usage reached
- Percentage discount
- Fixed discount
- Excessive discount

---

# 5. Prevent Stock/Race-Condition Problems

Inspect the current stock deduction implementation.

Do not rely only on:

```text
Check stock
↓
Create order
↓
Decrease stock
```

because two simultaneous checkout requests could potentially purchase the same inventory.

Where practical, use an atomic MongoDB update or transaction pattern.

The operation should ensure:

```text
stock >= requestedQuantity
```

before deducting inventory.

If stock is insufficient, the order must fail safely.

Do not create an order with insufficient inventory.

Add tests for this scenario.

---

# 6. Order Creation Safety

Review the entire order creation flow.

Make sure:

- Invalid cart items are rejected.
- Missing products are rejected.
- Invalid quantities are rejected.
- Prices are recalculated.
- Discounts are recalculated.
- Stock is verified.
- Order totals are calculated server-side.
- User identity comes from authentication.
- Customer cannot create an order for another user.
- Failed order creation does not leave inventory incorrectly deducted.

Return useful errors without exposing sensitive backend information.

---

# 7. Expand Permission & Security Tests

Existing permission logic is in:

`src/lib/permissions.ts`

and:

`src/lib/authorization-server.ts`

Existing tests include:

`src/lib/permissions.test.ts`

Expand the tests significantly.

Test at least:

### Admin

- Admin can access admin resources.
- Admin can create products.
- Admin can update products.
- Admin can manage orders.
- Admin can manage users.
- Admin can manage reviews.

### Customer

- Customer can access their own orders.
- Customer can NOT access another customer's orders.
- Customer can NOT modify another customer's order.
- Customer can NOT access admin resources.
- Customer can NOT modify products.
- Customer can NOT modify users.

### Unauthenticated user

Verify that protected operations reject unauthenticated requests.

### Invalid/manipulated identity

Test cases where a request attempts to provide:

- Another user's ID
- Another customer's order ID
- Fake role
- Fake admin flag
- Modified authorization data

The server must reject unauthorized requests.

---

# 8. Audit Every Protected Server Function

Do not only test the existing permission helper.

Inspect actual server functions in:

- `src/lib/user-server.ts`
- `src/lib/order-server.ts`
- `src/lib/product-server.ts`
- `src/lib/category-server.ts`
- `src/lib/review-server.ts`
- `src/lib/coupon-server.ts`
- `src/lib/shipment-server.ts`
- `src/lib/return-server.ts`
- `src/lib/authorization-server.ts`

For every sensitive operation, verify:

```text
Authentication
+
Authorization
+
Resource ownership
+
Input validation
```

are enforced at the server boundary.

---

# 9. Add High-Value Tests

Add tests for:

### Orders

- Valid order
- Empty cart
- Invalid quantity
- Non-existent product
- Insufficient stock
- Manipulated price
- Manipulated total
- Unauthorized order access

### Checkout

- Missing customer information
- Invalid email
- Invalid phone
- Missing address
- Invalid product
- Invalid quantity
- Out-of-stock product

### Authorization

- Admin access
- Customer access
- Unauthorized access
- Cross-user access
- Invalid role
- Missing authentication

### Coupons

- Valid
- Invalid
- Expired
- Minimum order
- Usage limit
- Discount calculation

---

# 10. Remove Only Production Mock Dependencies

After fixing the above:

Search the project again for:

- `mock-data`
- `salesByMonth`
- mock orders
- fake order arrays
- hardcoded revenue
- hardcoded customer/order data

Do NOT blindly delete `src/lib/mock-data.ts`.

Some static content such as FAQ or Instagram marketing content may intentionally remain static.

Instead:

- Remove mock data where real database data should exist.
- Keep intentional static marketing content if appropriate.
- Clearly separate test fixtures from production data.

---

# 11. Regression Check

After implementation, verify that these still work:

- Login
- Logout
- Product browsing
- Product search
- Categories
- Cart
- Checkout
- Order creation
- Customer order history
- Admin orders
- Admin customers
- Admin products
- Reviews
- Permissions
- Authentication

Fix any regressions introduced by the changes.

---

# 12. Update Progress.md

After completing the work, update:

`Progress.md`

Mark the four original issues as resolved if they are actually fixed.

Add:

- What was changed
- Files modified
- New server functions/API logic
- Tests added
- Security improvements
- Any remaining issues
- Any items that still require manual verification

Do not mark something as fixed if it was only partially implemented.

---

# Final Requirements

At the end:

1. Run the project's available tests.
2. Run TypeScript/type checking if available.
3. Run the production/build command if available.
4. Fix errors caused by your changes.
5. Check `git diff`.
6. Ensure no accidental mock data was introduced.
7. Ensure no secrets or credentials were added.
8. Ensure no existing working functionality was removed.

Finally provide a concise summary:

```text
FIXED:
- Admin revenue chart → MongoDB
- Chatbot order lookup → MongoDB
- Checkout validation → strengthened
- Permission/security tests → expanded

TESTS:
- Passed: X
- Failed: X

FILES CHANGED:
- ...

REMAINING:
- ...

PROGRESS.md:
- Updated
```

Do not stop at analysis. **Actually implement the fixes in the project.**