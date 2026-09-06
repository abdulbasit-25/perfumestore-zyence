Do not create mock/demo data and do not duplicate existing business logic. Reuse the existing MongoDB models, authentication, permissions, order infrastructure, product infrastructure, API patterns, UI components, and styling wherever applicable. Every new module must be fully connected to the existing database and admin navigation.

Never import Node-only modules such as mongodb, stream, fs, crypto, or other server-only dependencies into browser/client modules at module scope. Keep server-only dependencies behind server-function boundaries. Verify the production browser bundle after each phase.

# Sorrel Ops V2 - Production Operations Modules

## Implementation Prompt

Extend the existing Sorrel e-commerce application into a production-ready operations dashboard.

## Existing Functionality - Do Not Rebuild

These modules already exist and are out of scope:

- Admin Overview
- Admin Orders
- Admin Products
- Admin Categories
- Admin Customers
- Authentication and admin authorization
- MongoDB connection utilities
- Existing product and order server functions
- Existing admin shell and data table components

Do not replace, duplicate, or regress these modules. Reuse their components, server-function conventions, authentication checks, MongoDB connection, styling, and existing data models.

The current project uses TanStack Start, React, TypeScript, React Query, MongoDB, Zod, Tailwind CSS, and Vitest.

## Important Rules

1. Inspect the existing code before editing.
2. Use real MongoDB persistence for every new module.
3. Do not use mock arrays, fake records, localStorage, or frontend-only state as production data.
4. Every admin server function must verify the JWT and require the admin role.
5. Keep MongoDB and Node-only imports server-side. They must never leak into browser bundles.
6. Use stable IDs and references, never customer names or emails as relationships.
7. Reuse the existing `AdminShell`, `DataTable`, order types, product types, and status patterns.
8. Add loading, empty, error, validation, and permission-denied states.
9. Do not add dependencies unless the current project cannot solve the requirement.
10. Do not change unrelated storefront or authentication behavior.

## Phase 1 - Inventory

Create a real admin Inventory module backed by the existing products collection.

Route:

- `/admin/inventory`

Sidebar group:

- Operations > Inventory

Features:

- Show product name, SKU, category, current stock, price, inventory value, and status.
- Support low-stock and out-of-stock filters.
- Add a configurable `restockThreshold` to products, defaulting safely for existing records.
- Add stock adjustment with quantity, increase/decrease mode, reason, and admin note.
- Prevent stock from becoming negative.
- Store every adjustment in an `inventory_movements` collection with product ID, previous quantity, new quantity, delta, reason, admin ID, and timestamp.
- Show adjustment history for each product.
- Use atomic MongoDB updates so concurrent adjustments cannot corrupt stock.
- Add indexes for product ID and creation date.
- Update product stock used by checkout so inventory remains consistent.

## Phase 2 - Shipments

Create a shipment/fulfillment module connected to orders by order ID.

Route:

- `/admin/shipments`

Features:

- List orders requiring fulfillment.
- Track fulfillment status: Pending, Confirmed, Packed, Shipped, Delivered, Failed, RTO.
- Store courier, tracking number, shipping fee, expected delivery date, delivery notes, and timestamps.
- Allow admins to update shipment status with a status history.
- Display customer address and order items using existing order references.
- Do not duplicate the order as a separate customer record.
- Preserve existing order status behavior and add shipment data compatibly.
- Add filters for status, courier, date, and tracking number.

## Phase 3 - Returns and Refunds

Create a return request and refund workflow backed by MongoDB.

Routes:

- `/admin/returns`
- `/admin/refunds`

Features:

- Create return requests linked to order ID, user ID, and order item/product ID.
- Store reason, quantity, requested amount, customer notes, optional image URLs, admin notes, and timestamps.
- Return states: Requested, Approved, Rejected, Received, Refunded, Exchanged.
- Allow admin actions with validation and status history.
- Prevent refund amounts from exceeding the eligible order amount.
- Store refund records with amount, method, payment status, processed-by admin ID, and processed date.
- Keep returns and refunds linked to real orders and users.
- Show return/refund information in the existing order and customer details views where practical.

## Phase 4 - Coupons and Discounts

Create a real coupon management module.

Route:

- `/admin/coupons`

Coupon fields:

- Unique code
- Discount type: percentage, fixed amount, or free shipping
- Value
- Minimum order amount
- Maximum discount amount
- Product or category restrictions
- First-order-only flag
- Usage limit
- Per-customer usage limit
- Starts at and expires at
- Active status
- Created and updated timestamps

Features:

- Admin CRUD with Zod validation.
- Prevent duplicate coupon codes.
- Validate coupons during checkout on the server.
- Enforce expiry, usage limits, minimum order, and product/category restrictions server-side.
- Increment usage atomically after a successful order.
- Never trust discount totals supplied by the browser.
- Add indexes for code, active status, and expiry date.

## Phase 5 - Reviews

Create review moderation backed by MongoDB.

Route:

- `/admin/reviews`

Features:

- Link reviews to product ID, user ID, and order ID where available.
- States: Pending, Published, Flagged, Rejected.
- Show rating, title, body, customer, product, creation date, and moderation state.
- Admin actions: approve, reject, flag, delete, feature, and reply if the data model supports replies.
- Do not allow a customer to review a product without a valid completed order unless the existing business rules explicitly allow it.
- Show approved reviews on the storefront only.
- Add indexes for product, user, status, and creation date.

## Phase 6 - Analytics and Reports

Improve the existing Overview with real MongoDB-derived metrics without replacing its current layout unnecessarily.

Add:

- Revenue today, this week, this month, and this year.
- Order count and average order value.
- Paid versus unpaid orders.
- Units sold.
- Revenue over time.
- Orders over time.
- Sales by product and category.
- New and returning customers.
- Customer lifetime value.
- Low-stock and out-of-stock counts.
- Top and underperforming products.

Requirements:

- Create admin-only server functions for aggregate queries.
- Use MongoDB aggregation pipelines rather than loading all orders into the browser.
- Support date range filters.
- Handle no data and database errors cleanly.
- Add tests for totals, date boundaries, and empty collections.

## Phase 7 - Activity Log

Create an append-only admin activity log.

Route:

- `/admin/activity`

Record:

- Admin user ID and email
- Action name
- Entity type and entity ID
- Previous value when appropriate
- New value when appropriate
- Timestamp
- Request metadata only if safely available

Log important mutations including product changes, stock adjustments, order status changes, shipment updates, return decisions, refunds, coupon changes, review moderation, and settings changes.

Features:

- Paginated activity list.
- Filters by admin, action, entity, and date.
- Never expose passwords, password hashes, JWTs, or payment secrets in logs.
- Do not allow normal admins to edit or delete activity records.

## Phase 8 - Settings and Team Roles

Add the minimum settings and permissions system needed for multiple operators.

Routes:

- `/admin/settings`
- `/admin/team`

Features:

- Store safe store settings in MongoDB: store name, currency, low-stock default, shipping fee, and operational settings.
- Add team members using existing users, without creating a second authentication system.
- Support roles such as Owner, Admin, Manager, Order Manager, Inventory Manager, Support, and Marketing.
- Define server-side permissions for each module.
- Enforce permissions inside server functions, not only by hiding buttons.
- Protect owner/settings operations from lower roles.
- Do not display or edit password hashes.

## Navigation

Extend the current admin sidebar with grouped navigation:

- Core: Overview, Orders, Products, Categories, Customers
- Operations: Inventory, Shipments, Returns
- Growth: Coupons, Reviews
- Insights: Analytics, Reports
- System: Activity Log, Team, Settings

Only add links for routes that are implemented. Avoid dead navigation links.

## Testing Requirements

Add focused Vitest coverage for:

- Admin authorization and permission failures.
- Stock adjustment atomicity and negative-stock prevention.
- Shipment state transitions.
- Return/refund validation.
- Coupon validation and atomic usage limits.
- Review moderation permissions.
- Analytics totals and date ranges.
- Activity log redaction.

Run after each phase:

```text
npm run lint
npm run test
npm run build
```

Also verify manually:

1. Sign in as an admin.
2. Confirm each new module loads from MongoDB.
3. Confirm empty collections show professional empty states.
4. Create and update real records.
5. Refresh the browser and confirm persistence.
6. Sign in as a non-admin and confirm protected server functions reject access.
7. Confirm no fake data is rendered.
8. Confirm the browser build has no MongoDB, `stream`, or Node-only module errors.

Implement in this order:

1. Inventory
2. Shipments
3. Returns and Refunds
4. Coupons
5. Reviews
6. Analytics and Reports
7. Activity Log
8. Team and Settings

At the end, report the files changed, MongoDB collections and indexes added, tests run, and any remaining limitations.
