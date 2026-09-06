# E-Commerce Store - Project Progress & Audit

Audit date: 2026-09-06

## Overall Status

The project is a functional TanStack Start e-commerce application with MongoDB-backed products, categories, users, orders, inventory, coupons, reviews, returns, and shipments. Core product browsing, authentication, checkout, order persistence, stock reservation, coupon validation, and admin CRUD paths are implemented. It is not production-ready because the application still contains runtime fixture content, a browser-only profile editor, a broken manager category-create permission, an incomplete customer returns workflow, duplicated login implementations, and client-side JWT storage.

Live MongoDB contents, deployed environment variables, browser-level workflows, Cloudinary configuration, and production cookie/security behavior need verification against the target deployment.

---

## Executive Summary

### Working

- Product listing, product detail, product CRUD, and product filtering use MongoDB through `src/lib/product-server.ts`.
- Checkout uses `createOrder` in `src/lib/order-server.ts`; it authenticates the user, re-reads product prices, atomically reserves stock, validates coupons, and persists COD orders.
- Customer order reads are scoped to the authenticated user's MongoDB `_id`.
- Admin order, inventory, coupon, customer, user, review, return, and shipment server handlers perform server-side permission checks.
- Authentication hashes passwords with bcrypt and signs JWTs. Registration validates names, email, password policy, and duplicate email addresses.
- Existing tests pass: 5 test files and 21 tests.
- Production build succeeds.

### Incomplete or risky

- `src/lib/mock-data.ts` remains in the project with generated products, customers, orders, sales, FAQ, and Instagram fixtures. FAQ and Instagram fixtures are still rendered on the homepage; the other business fixtures are primarily dead or seed-like runtime leftovers.
- `useAuth` in `src/lib/store.ts` is explicitly a frontend-only mock auth store and can disagree with the server JWT session.
- `ProfilePanel` updates Zustand/local storage only. The successful profile message does not persist name, phone, or avatar to MongoDB.
- `createCategory` checks `deleteData` rather than `manageCategories`, so a manager with the documented category permission cannot create a category.
- Customer returns cannot be requested from the storefront/account; only admin listing and update handlers are present.
- Shipment status is persisted separately and does not update the related order status.
- JWTs are stored in `localStorage`, and login code is duplicated in `src/server.ts` and `src/start.ts`.
- Demo fallback users use non-Mongo IDs, so their tokens cannot pass server authorization for order/account/admin operations when MongoDB is unavailable.

### Verification limits

No live database query, deployed environment check, browser automation, payment provider test, Cloudinary upload test, rate-limit test, or concurrent checkout test was performed. These items are marked Needs verification below rather than assumed to work.

---

# 1. Mock / Fake Data

| Location                                                                               | Data                                                        | Current Problem                                                                                                                                           | Real Source                                                           | Priority |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| `src/lib/mock-data.ts`                                                                 | `products`, `customers`, generated `orders`, `salesByMonth` | Static business fixtures remain alongside MongoDB models. Product/order/customer exports are not the authoritative source and can be accidentally reused. | MongoDB collections via server functions                              | High     |
| `src/routes/index.tsx` and `src/components/storefront/home/faq-section.tsx`            | `faqEntries`                                                | Homepage FAQ is hardcoded content, not CMS/database data. This is acceptable only if intentionally static.                                                | CMS/configuration if content must be managed                          | Low      |
| `src/routes/index.tsx` and `src/components/storefront/home/instagram-feed-section.tsx` | `instagramPosts`                                            | Homepage social feed is static local image/content data, not a live Instagram integration.                                                                | Explicit CMS/social integration or clearly labelled editorial content | Medium   |
| `src/lib/store.ts`                                                                     | `useAuth`                                                   | Frontend-only auth user IDs (`admin-1`, `u-me`) and role inference can diverge from the JWT/server account.                                               | Authenticated server session/user record                              | Critical |
| `src/server.ts`, `src/start.ts`, `src/routes/login.tsx`                                | Demo accounts and fallback login                            | Demo credentials are available as a fallback when MongoDB is unavailable. Fallback IDs are incompatible with server ObjectId authorization.               | Seeded MongoDB users, disabled in production                          | Critical |
| `scripts/seed-products.ts`                                                             | Product seed records                                        | Correct for setup, but must not be imported by runtime cart/order code.                                                                                   | MongoDB after seeding                                                 | Medium   |

Confirmed primary mock/fallback sources: 4 (fixture module, frontend auth store, duplicated demo fallback paths counted as one behavior, static homepage social/FAQ content). The fixture module contains multiple exports.

---

# 2. Broken Features

| Feature                          | Location                                                           | Problem                                                                                                                 | Expected Behavior                                                                               | Priority |
| -------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| Manager category creation        | `src/lib/category-server.ts`, `createCategory`                     | Requires `deleteData`, which managers do not receive in `src/lib/permissions.ts`; category creation fails for managers. | Require `manageCategories`, matching delete/list UI permissions.                                | High     |
| Profile save                     | `src/components/account/profile-panel.tsx`, `ProfilePanel.save`    | Calls the Zustand `updateProfile` callback only. No server update exists, but UI displays `Profile updated`.            | Validate and persist profile fields server-side, then refresh the authenticated user.           | High     |
| Logout invalidation/cleanup      | `src/routes/account.tsx`, `handleSignOut`                          | Clears Zustand state but does not remove `auth-token` from `localStorage`; the JWT remains usable until expiry.         | Clear the token and frontend session, and use a revocable/session-cookie design where required. | High     |
| Demo fallback account operations | `src/server.ts`, `src/start.ts`, `src/lib/authorization-server.ts` | `demo-admin` and `demo-customer` fail ObjectId validation in protected server functions.                                | Demo fallback should be disabled or backed by real seeded users with valid IDs.                 | High     |

---

# 3. Partially Implemented Features

| Feature           | Current State                                                                                                                 | Missing Pieces                                                                                                            | Priority |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| Customer returns  | Admin `getReturns`/`updateReturn` and refund record creation exist in `src/lib/return-server.ts`.                             | No customer create/list/cancel request path; no storefront form or eligibility enforcement.                               | High     |
| Shipments         | Admin shipment records can be listed and updated in `src/lib/shipment-server.ts`; missing records are virtualized as Pending. | Shipment changes do not synchronize order status; customer shipment view is absent.                                       | Medium   |
| Account profile   | Frontend editing, local avatar data URL preview, and toast feedback exist.                                                    | MongoDB persistence, upload limits/storage, profile reload, and server validation are missing.                            | High     |
| Addresses         | Account displays the latest order address.                                                                                    | No saved-address entity, CRUD, selection, or validation lifecycle.                                                        | Medium   |
| Admin overview    | Orders, revenue aggregation, products, low stock, and top products are database-derived.                                      | Order list is capped at 500; overview has limited error/loading states; metrics lack explicit date/filter context.        | Medium   |
| Reviews           | Review eligibility is restricted to delivered orders and duplicate reviews are checked.                                       | Live MongoDB/concurrency behavior and moderation workflow require verification; eligible-product lookup has an N+1 query. | Medium   |
| Authentication    | MongoDB login/registration and server permission checks exist.                                                                | Duplicate login implementations, localStorage JWTs, no visible rate limiting, and frontend/server session drift remain.   | Critical |
| Categories        | Read and delete paths are implemented with MongoDB.                                                                           | Manager create permission bug and live seeded category state need verification.                                           | High     |
| Password security | Password hashing and login validation exist.                                                                                  | Password change/reset/recovery workflow is not implemented.                                                               | Medium   |

---

# 4. Working Features

Based on code tracing and static validation, the following appear properly connected to real server/database sources:

- MongoDB connection caching and server-only database access in `src/lib/mongodb.ts`.
- Product reads by list, slug, ID, and batch IDs in `src/lib/product-server.ts`.
- Admin product create/update/delete with validation and permission checks.
- Product detail, shop filters, cart product refresh, and checkout product refresh.
- Order creation with server-authoritative prices, stock checks, coupon checks, and transaction usage in `src/lib/order-server.ts`.
- Customer order history and ownership-scoped order lookup.
- Admin order status and payment status updates.
- Admin inventory reads and inventory adjustments.
- Coupon CRUD and order-time coupon validation/usage counting.
- Review reads, delivered-order eligibility, duplicate prevention, and admin moderation handlers.
- Admin customer aggregation from users and orders.
- Managed user CRUD with role assignment restrictions.
- Server-side permission checks in protected mutation handlers.
- CSRF middleware for TanStack server functions in `src/start.ts`.

Needs verification: actual MongoDB connectivity, indexes in the deployed database, seeded records, transaction support on the MongoDB deployment, and end-to-end browser behavior.

---

# 5. Admin Panel Audit

## Dashboard

Live order and revenue data comes from `getAdminOrders` and `getAdminRevenue`; products come from `getProducts`. Revenue aggregation excludes cancelled orders. The order query is limited to 500 and the UI does not expose query errors clearly. The retained `salesByMonth` fixture is not used by the current dashboard.

## Customers

`getAdminCustomers` aggregates customer users and their orders from MongoDB. It calculates order count, total spent, average value, first order, last order, and latest address. Needs verification against real records and pagination requirements.

## Users

`src/lib/user-server.ts` provides server-side permission checks and role assignment rules. Needs verification for UI error states and disabled-user behavior in browser flows.

## Products

MongoDB-backed CRUD and validation are implemented. Product image upload behavior through Cloudinary needs verification.

## Categories

Reads and deletes use MongoDB. Manager category creation is broken because `createCategory` requires `deleteData` instead of `manageCategories`.

## Orders

Admin reads are permission-protected and capped at 500. Status and payment updates persist. Needs verification for audit requirements around allowed status transitions and cancelled-order stock/refund behavior.

## Inventory

Inventory reads and adjustments are server-backed and permission-protected. Needs verification for adjustment history display, negative-stock prevention, and concurrent admin adjustments.

## Coupons

CRUD and server-side order validation are present. Needs verification for UI coverage of all rules, date/time-zone boundaries, and high-concurrency usage limits.

## Reviews

Admin review list/update paths and customer eligibility logic exist. Eligible review lookup issues one review query per delivered item, creating an N+1 pattern.

## Returns

Admin review/update/refund-record paths exist. Customer return-request creation is missing.

## Shipments

Admin shipment list/update paths exist. Shipment records are joined in memory against up to 500 orders, and shipment status does not update the order status.

---

# 6. Storefront Audit

## Homepage

Products and categories are fetched from MongoDB. FAQ and Instagram sections use static fixture data. Product/category failures often render empty sections rather than visible error states.

## Product Listing

`src/routes/shop.tsx` uses `getProducts` and supports server-backed filters. Needs browser and live-database verification.

## Product Details

`src/routes/product.$slug.tsx` uses `getProductBySlug` and related product queries. Needs verification for missing/deactivated products and image data.

## Search

Search is implemented through product filtering. Needs verification for normalization, special characters, and empty results UX.

## Categories

Category reads use MongoDB. Admin creation has the permission defect described above.

## Cart

Cart lines persist in Zustand/local storage and product snapshots are refreshed from MongoDB. Quantity and stock are authoritative only at checkout; cart UI should surface stale/deactivated items more explicitly.

## Checkout

Client and server schemas validate inputs. Server recalculates prices/shipping, reserves stock transactionally, validates coupons, and persists COD orders. Payment provider integration is not implemented; payment is COD only.

## Reviews

Product review display and customer eligibility/create paths are present. Needs live database/browser verification and improved query batching.

## Customer Account

Orders are server-backed and user-scoped. Profile editing is local-only, address management is latest-order display only, and password change/reset is absent.

---

# 7. Authentication & Authorization

- Authentication: MongoDB users, bcrypt password hashes, JWT creation/verification, registration, login, and disabled-user checks are implemented.
- Authorization: server-side permission checks are used by major admin mutations; `requirePermission` re-reads the current account role from MongoDB instead of trusting only the token role.
- Protected routes: admin/account UI redirects exist, but UI checks are not the security boundary. Server functions generally enforce access.
- Main issues: JWT in `localStorage`, predictable development fallback secret if production configuration is wrong, duplicated `/api/login` implementations, demo fallback IDs that fail ObjectId checks, and no visible rate limiting/lockout.
- Logout: frontend state is cleared, but the stored token is not removed by `handleSignOut`.
- Needs verification: deployment cookie policy, `JWT_SECRET` configuration, TLS, proxy behavior, rate limiting, and browser CSRF behavior.

---

# 8. Database & API Audit

- MongoDB integration is centralized in `src/lib/mongodb.ts` and server modules use collections for users, products, categories, orders, inventory movements, coupons, reviews, return requests, refunds, and shipments.
- Product and order paths use MongoDB data rather than the legacy product/order fixtures.
- Checkout uses transaction-scoped stock and coupon updates, but transaction support and replica-set configuration require deployment verification.
- Query limits of 500 occur in admin orders, users/customers-related views, returns, and shipments; pagination is not consistently exposed.
- `ensureIndex` is called from request paths in multiple server modules, which adds avoidable index checks to ordinary requests.
- Shipment and return data are separate from order status and need explicit consistency rules.
- No conventional REST API is required by the current architecture; TanStack server functions are the RPC boundary.

---

# 9. Security Issues

| Issue                                   | Location                                                | Risk                                                                                       | Recommendation                                                                                                   | Priority |
| --------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| JWT in localStorage                     | `src/routes/login.tsx`, `src/lib/store.ts`              | XSS can read the token and impersonate the user.                                           | Use secure, HttpOnly, SameSite cookies and server session handling.                                              | Critical |
| Predictable JWT fallback secret         | `src/lib/auth.ts`                                       | A misconfigured deployment may accept forged tokens signed with `development-only-secret`. | Fail closed whenever `JWT_SECRET` is absent, including non-development deployments.                              | Critical |
| Demo credentials/fallback               | `src/server.ts`, `src/start.ts`, `src/routes/login.tsx` | Unintended access path and inconsistent authorization behavior.                            | Remove from production builds or require explicit development flag; use real seeded IDs.                         | Critical |
| Duplicate login handlers                | `src/server.ts`, `src/start.ts`                         | Security fixes can be applied to one path but not the other.                               | Keep one login implementation and one validation/authentication policy.                                          | High     |
| No visible login throttling             | Login handlers                                          | Brute-force risk.                                                                          | Add IP/account rate limiting, backoff, monitoring, and generic responses.                                        | High     |
| Profile is not server-persisted         | `src/components/account/profile-panel.tsx`              | User may believe sensitive delivery data was updated when it was not.                      | Add authenticated server update with validation and auditability.                                                | High     |
| Client auth state is trusted for UX     | `src/lib/store.ts`                                      | UI can look authenticated while server rejects the token.                                  | Hydrate auth from server session and clear stale local state on unauthorized responses.                          | High     |
| Client-controlled order identity fields | `src/lib/order-server.ts`                               | Customer name/email can differ from account identity in the saved order.                   | Decide whether checkout permits overrides; otherwise derive identity from the authenticated account server-side. | Medium   |

No confirmed injection or cross-user order read was found in the inspected handlers; server-side ownership checks are present. This is not a substitute for penetration testing.

---

# 10. UI/UX Improvements

| Area                 | Current Problem                                                                    | Suggested Improvement                                                        | Priority |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| Homepage errors      | Product/category failures can render empty areas.                                  | Add visible, retryable error states and meaningful empty states.             | Medium   |
| Authentication       | Local store and server token can disagree.                                         | Use a single session source and handle 401 responses globally.               | High     |
| Profile              | Save toast implies persistence.                                                    | Show saving/error states and confirm server persistence.                     | High     |
| Returns              | Account has no request workflow.                                                   | Add eligible-order/item selection, reason, validation, and status tracking.  | High     |
| Admin tables         | Several APIs cap data at 500.                                                      | Add server pagination, filters, and total counts.                            | Medium   |
| Checkout coupons     | Discount is only validated at submission.                                          | Add an explicit apply/validation interaction while keeping server authority. | Medium   |
| Cart                 | Stale or removed products can disappear from totals without clear explanation.     | Show unavailable lines and offer removal/refresh actions.                    | Medium   |
| Accessibility        | Needs browser review for dialogs, table labels, keyboard flow, and image alt text. | Run automated and manual accessibility checks.                               | Medium   |
| Loading/error states | Some admin queries lack explicit pending/error rendering.                          | Add consistent query states and retry controls.                              | Medium   |

---

# 11. Code Quality

- Duplicate login logic in `src/server.ts` and `src/start.ts` is the largest maintainability issue.
- `src/lib/store.ts` combines theme, frontend auth, cart, and hydration concerns; separating the server session boundary would reduce drift.
- Legacy fixture data remains in `src/lib/mock-data.ts` after product persistence migration and can mislead future development.
- Request-time index checks are repeated across server modules and should be moved to startup/migration/initialization where supported.
- Several server modules convert loosely typed MongoDB documents with `Record<string, unknown>`; stronger collection document types would reduce runtime shape errors.
- `getEligibleReviewProducts` has an N+1 query pattern.
- `getShipments` joins up to 500 orders and shipment records in application memory.
- Existing code has no reported lint errors in the observed run. Build and tests pass.

---

# 12. Performance

- Admin orders, returns, shipments, and users use fixed limits of 500 rather than scalable pagination.
- Shipment retrieval loads orders and joins shipment documents in memory.
- Review eligibility performs one review lookup per delivered order item.
- Repeated `ensureIndex` checks on request paths add latency and should be measured/moved.
- Product/cart batch fetching is present and preferable to one request per cart line.
- The production bundle includes large client dependencies such as MongoDB-related server output and Recharts; deployment splitting appears to work, but browser bundle size should be measured with a real performance budget.

---

# 13. Testing

## Existing tests

- `src/lib/auth.test.ts`
- `src/lib/coupon.test.ts`
- `src/lib/chatbot.test.ts`
- `src/lib/permissions.test.ts`
- `src/lib/review-utils.test.ts`

Observed result: 5 files passed, 21 tests passed.

## Missing high-value tests

- MongoDB-backed product/category/order CRUD integration tests.
- Server authorization tests for every mutation and manager/admin boundary.
- Order ownership and cross-user access tests.
- Transactional stock reservation and concurrent checkout tests.
- Coupon usage-limit concurrency and date-boundary tests.
- Profile persistence tests once the endpoint exists.
- Return creation, eligibility, refund amount, and refund idempotency tests.
- Shipment/order status consistency tests.
- Login fallback disabled-in-production tests and token cleanup/logout tests.
- Browser tests for login, registration, cart, checkout, admin permissions, and mobile layouts.

---

# 14. Recommended Development Roadmap

## Critical

1. Remove or hard-disable demo fallback credentials outside explicit development mode.
2. Replace localStorage JWT storage with secure HttpOnly session cookies.
3. Make missing production JWT configuration fail closed.
4. Unify the duplicated login handlers.
5. Replace frontend-only auth state with a server-backed session source.
6. Add tests for order ownership, protected mutations, checkout concurrency, and authentication boundaries.

## High Priority

1. Fix `createCategory` to require `manageCategories`.
2. Implement server-persisted profile updates and clear the token on logout.
3. Implement customer return requests with ownership and eligibility checks.
4. Remove runtime business fixtures or isolate them as development-only seed/content data.
5. Add rate limiting and monitoring to authentication endpoints.
6. Define and enforce order/shipment/return status consistency rules.

## Medium Priority

1. Add pagination to admin collections and APIs.
2. Batch review eligibility queries.
3. Move index initialization out of hot request paths.
4. Improve loading, error, retry, empty, and stale-cart states.
5. Add password change/reset and saved-address management.
6. Add integration and browser tests for core workflows.

## Low Priority

1. Replace static Instagram/FAQ content with a managed content source if operational editing is required.
2. Add performance budgets and bundle monitoring.
3. Improve admin analytics filters and date-range controls.
4. Add deployment monitoring, backups, and database health checks.

---

# 15. Detailed TODO Checklist

- [ ] Remove or feature-flag demo login fallback in production.
- [ ] Replace localStorage JWTs with secure HttpOnly cookies.
- [ ] Fail closed when `JWT_SECRET` is absent outside local development.
- [ ] Consolidate login implementation in `src/server.ts` and `src/start.ts`.
- [ ] Hydrate frontend auth from the server session.
- [ ] Clear `auth-token` during logout and handle expired sessions globally.
- [ ] Change `createCategory` to require `manageCategories`.
- [ ] Add authenticated server profile update and persistence.
- [ ] Add customer return-request creation and account status tracking.
- [ ] Synchronize shipment status transitions with order status where appropriate.
- [ ] Remove or isolate unused business fixtures in `src/lib/mock-data.ts`.
- [ ] Add pagination to admin orders, users, customers, returns, and shipments.
- [ ] Batch review eligibility queries.
- [ ] Move request-time index checks to initialization/migrations.
- [ ] Add login rate limiting and account abuse monitoring.
- [ ] Add checkout concurrency and stock-reservation integration tests.
- [ ] Add server authorization and order ownership integration tests.
- [ ] Add browser tests for login, checkout, account, and admin workflows.
- [ ] Add visible retryable errors for homepage and admin queries.
- [ ] Add password change/reset workflow.
- [ ] Add saved-address management if required by the product roadmap.
- [ ] Verify MongoDB transaction support, environment secrets, Cloudinary, and deployment cookies.

---

# 16. Final Assessment

### Current Project Health

- Functionality: 7/10 - Core catalog, cart, checkout, orders, and admin operations are implemented; profile, returns, and some workflow edges are incomplete.
- Database Integration: 7/10 - Major business paths use MongoDB, but legacy fixtures remain and live deployment state was not verified.
- Security: 5/10 - Strong server-side permission patterns exist, but localStorage JWTs, demo fallback, predictable fallback secret, duplicate auth handlers, and missing throttling are significant risks.
- Code Quality: 7/10 - TypeScript structure and server modules are coherent, but auth duplication, frontend/server state duplication, loose MongoDB document typing, and legacy fixtures reduce maintainability.
- UI/UX: 6/10 - The storefront and admin surfaces are broad and usable, but several error, persistence, returns, pagination, and stale-session states need work.
- Testing: 4/10 - Unit/schema coverage passes, but database integration, authorization, concurrency, and browser workflow coverage is limited.
- Production Readiness: 5/10 - Suitable for continued development and controlled testing, not for an unreviewed production launch.

The highest-impact work is to close the authentication/session risks, remove production demo behavior, make profile and returns genuinely persistent, fix category authorization, and add integration/browser coverage around checkout and permissions.

---

## Audit Summary

- Mock/fake data sources found: 4 primary sources/behaviors, with multiple fixture exports.
- Broken features found: 4 confirmed.
- Partial features found: 9 documented areas.
- Improvement opportunities: 20+ actionable items across security, persistence, UX, performance, and testing.
- Critical issues: localStorage JWTs, demo fallback credentials, fallback JWT secret, frontend/server auth drift, and insufficient auth test coverage.
- `Progress.md`: successfully created in the project root.
