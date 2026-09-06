# TASK — Add MongoDB Atlas Backend + Admin/Customer Authentication to Existing E-Commerce Store

You are modifying an **existing e-commerce project**.

DO NOT create a new project.

DO NOT rebuild the frontend.

DO NOT replace the existing routing system.

DO NOT unnecessarily change the existing UI.

Your job is to add a proper **MongoDB Atlas-backed serverless backend and authentication system** to the existing application.

The application must remain deployable as **ONE Vercel project / ONE deployment**.

---

# 1. FIRST — INSPECT THE EXISTING PROJECT

Before modifying anything, inspect the entire existing project structure and configuration.

Current project:

```text
B:\flow\DEV1\Projects\E-Comerce Store
```

Current structure:

```text
E-Comerce Store/
│
├── .lovable/
├── .output/
├── .tanstack/
├── .wrangler/
├── public/
├── src/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   ├── styles.css
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-shell.tsx
│   │   │   └── data-table.tsx
│   │   │
│   │   ├── storefront/
│   │   │   ├── chatbot copy.tsx
│   │   │   ├── chatbot-widget.tsx
│   │   │   ├── chatbot.tsx
│   │   │   ├── legal-page.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── shell.tsx
│   │   │   ├── site-footer.tsx
│   │   │   └── site-header.tsx
│   │   │
│   │   └── ui/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── chatbot.test.ts
│   │   ├── chatbot.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── lovable-error-reporting.ts
│   │   ├── mock-data.ts
│   │   ├── store.ts
│   │   └── utils.ts
│   │
│   └── routes/
│       ├── about.tsx
│       ├── account.tsx
│       ├── admin.categories.tsx
│       ├── admin.customers.tsx
│       ├── admin.index.tsx
│       ├── admin.orders.tsx
│       ├── admin.products.tsx
│       ├── admin.tsx
│       ├── cart.tsx
│       ├── checkout.tsx
│       ├── cookie-policy.tsx
│       ├── index.tsx
│       ├── login.tsx
│       ├── privacy-policy.tsx
│       ├── product.$slug.tsx
│       ├── refund-policy.tsx
│       ├── shop.tsx
│       ├── terms-conditions.tsx
│       └── __root.tsx
│
├── .gitignore
├── AGENTS.md
├── bun.lock
├── bunfig.toml
├── components.json
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

The project is already using:

- React
- TypeScript
- Vite
- TanStack Router
- Existing route tree
- Existing admin pages
- Existing storefront
- Existing UI components
- Existing mock store/data

**Preserve this architecture.**

Before making changes, inspect:

```text
package.json
vite.config.ts
tsconfig.json
src/server.ts
src/start.ts
src/router.tsx
src/routes/admin.tsx
src/routes/login.tsx
src/routes/account.tsx
src/lib/store.ts
src/lib/mock-data.ts
.gitignore
```

Understand how the existing application currently works.

---

# 2. MAIN OBJECTIVE

Add:

```text
Existing Frontend
       +
Serverless API
       +
MongoDB Atlas
       +
Authentication
       +
Admin/Customer Roles
```

The final deployment should look like:

```text
                    VERCEL
                      │
          ┌───────────┴───────────┐
          │                       │
      FRONTEND                  /api
          │                       │
          │              Serverless Functions
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
                MongoDB Atlas
```

There must NOT be a separate backend deployment.

---

# 3. VERY IMPORTANT — DO NOT CREATE EXPRESS SERVER

This project must use a **Vercel-compatible serverless backend**.

Do NOT introduce:

```text
app.listen()
server.listen()
```

Do not create a permanently running Express server just for authentication.

Do not require:

```text
Frontend → separate backend URL → MongoDB
```

The intended architecture is:

```text
Browser
   ↓
Same Vercel deployment
   ↓
/api/*
   ↓
MongoDB Atlas
```

---

# 4. USE THE EXISTING SERVER ARCHITECTURE WHERE APPROPRIATE

The project already contains:

```text
src/server.ts
src/start.ts
```

Inspect these files first.

If the existing TanStack server setup already provides a Vercel-compatible server/API mechanism, integrate with it.

Do NOT blindly create another server architecture.

If `/api` serverless functions are the cleanest compatible solution, implement them in a way that works with the current build/deployment configuration.

The final result must work on Vercel.

---

# 5. MONGODB ATLAS

Use MongoDB Atlas as the database.

Create a reusable database connection utility.

Prefer:

```text
src/lib/mongodb.ts
```

or another location consistent with the current architecture.

The MongoDB connection must:

- Use `MONGODB_URI`
- Never hard-code credentials
- Cache/reuse connections in serverless environments
- Avoid opening a new connection unnecessarily on every request

Conceptually:

```text
API Request
    ↓
MongoDB Connection Utility
    ↓
Existing Connection?
    ├── YES → Reuse
    │
    └── NO → Create Connection
                   ↓
              MongoDB Atlas
```

---

# 6. ENVIRONMENT VARIABLES

Create or update:

```text
.env.example
```

with:

```env
MONGODB_URI=
JWT_SECRET=
```

If the existing project already contains environment variables, preserve them.

Do NOT delete existing environment variables.

Do NOT commit real secrets.

---

# 7. UPDATE .gitignore

Ensure the following are ignored:

```text
.env
.env.local
.env.*.local
credentials.txt
```

Do NOT expose real credentials in Git.

---

# 8. USER SYSTEM

Create a User model.

Use MongoDB.

User fields:

```text
_id
name
email
passwordHash
role
createdAt
updatedAt
```

Role:

```text
admin
customer
```

Do not store plaintext passwords.

Passwords must be hashed.

Use a suitable password hashing library compatible with the existing project and Vercel.

Prefer:

```text
bcryptjs
```

if compatible with the current dependency setup.

---

# 9. CREATE EXACTLY TWO DEMO USERS

For development/testing, create exactly:

## ADMIN

```text
Name:
Sorrel Administrator

Email:
admin@sorrel.local

Password:
Admin@12345

Role:
admin
```

## CUSTOMER

```text
Name:
Demo Customer

Email:
customer@sorrel.local

Password:
Customer@12345

Role:
customer
```

These are development/demo credentials only.

---

# 10. CREDENTIALS FILE

Create:

```text
credentials.txt
```

with:

```text
SORREL E-COMMERCE — DEMO CREDENTIALS

===================================

ADMIN ACCOUNT

Name: Sorrel Administrator
Email: admin@sorrel.local
Password: Admin@12345
Role: admin


CUSTOMER ACCOUNT

Name: Demo Customer
Email: customer@sorrel.local
Password: Customer@12345
Role: customer


IMPORTANT:

These credentials are for local development/demo testing only.

Change/remove them before production.

Do not use these credentials for a real production store.
```

Because this file contains passwords:

```text
credentials.txt
```

must be included in `.gitignore`.

---

# 11. SEED SCRIPT

Create a user seed script.

For example:

```text
scripts/seed-users.ts
```

The script must:

1. Connect to MongoDB Atlas.
2. Normalize emails.
3. Check whether admin already exists.
4. Create admin if missing.
5. Check whether customer already exists.
6. Create customer if missing.
7. Hash both passwords.
8. Never create duplicates.
9. Close/clean up the database connection.

Running:

```text
bun run seed:users
```

or the appropriate package command should safely seed the accounts.

Adapt the command to the existing Bun/npm setup.

Do not create duplicate users when the script is run multiple times.

---

# 12. AUTHENTICATION API

Create serverless API endpoints.

At minimum:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Optional later:

```text
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

For this task, focus on:

```text
login
me
logout
```

---

# 13. LOGIN WORKFLOW

Implement:

```text
User
 ↓
Enter email
 ↓
Enter password
 ↓
POST /api/auth/login
 ↓
Normalize email
 ↓
Find user in MongoDB
 ↓
Compare password hash
 ↓
Check account
 ↓
Create secure authentication session/token
 ↓
Return safe user information
```

Return only:

```text
id
name
email
role
```

Never return:

```text
passwordHash
JWT_SECRET
MONGODB_URI
```

---

# 14. AUTHENTICATION STORAGE

Prefer a secure HTTP-only cookie for authentication.

The authentication cookie should be:

```text
HttpOnly
Secure in production
SameSite=Lax
```

Do not store sensitive authentication secrets in:

```text
localStorage
sessionStorage
frontend source code
```

The server must be responsible for validating authentication.

---

# 15. AUTH HELPERS

Create reusable authentication utilities.

For example:

```text
requireAuth()
requireAdmin()
requireCustomer()
getCurrentUser()
```

Adapt naming to the existing architecture.

---

# 16. AUTHORIZATION

Admin APIs must verify:

```text
Authenticated
AND
role === "admin"
```

Customer APIs must verify:

```text
Authenticated
AND
role === "customer"
```

A customer must NEVER be able to access admin APIs simply by manually typing the URL or making an API request.

Example:

```text
GET /api/admin/dashboard
```

Customer response:

```text
403 Forbidden
```

---

# 17. EXISTING LOGIN PAGE

The project already has:

```text
src/routes/login.tsx
```

Do NOT create a completely separate login UI unless necessary.

Modify the existing login page so it connects to:

```text
POST /api/auth/login
```

The existing visual design should be preserved.

After login:

```text
role === "admin"
    ↓
/admin

role === "customer"
    ↓
/account
```

---

# 18. EXISTING ACCOUNT PAGE

The project already has:

```text
src/routes/account.tsx
```

Connect it to:

```text
GET /api/auth/me
```

Display the authenticated customer.

Example:

```text
Welcome, Demo Customer

Email:
customer@sorrel.local

Account Type:
Customer
```

Do not use mock authentication.

---

# 19. EXISTING ADMIN ROUTES

The project already contains:

```text
src/routes/admin.tsx
src/routes/admin.index.tsx
src/routes/admin.categories.tsx
src/routes/admin.customers.tsx
src/routes/admin.orders.tsx
src/routes/admin.products.tsx
```

Preserve these pages.

Do NOT delete them.

Do NOT rebuild them from scratch.

Initially, connect authentication protection to the existing admin section.

The admin layout should require:

```text
authenticated user
+
role === admin
```

---

# 20. ADMIN ACCESS FLOW

```text
/admin
   ↓
Is user authenticated?
   │
   ├── NO → /login
   │
   └── YES
          ↓
      Is role admin?
          │
          ├── NO → /account or 403
          │
          └── YES
                 ↓
             Admin Dashboard
```

---

# 21. CUSTOMER ACCESS FLOW

```text
/account
   ↓
Is user authenticated?
   │
   ├── NO → /login
   │
   └── YES
          ↓
      Customer Account
```

---

# 22. LOGOUT

Implement:

```text
POST /api/auth/logout
```

Logout must invalidate/remove the authentication cookie/session.

Frontend should then:

```text
Clear auth state
 ↓
Redirect to /
```

After logout:

```text
/admin
```

must no longer be accessible.

---

# 23. AUTH STATE

Create a reusable authentication mechanism.

For example:

```text
useAuth()
```

or adapt the existing state architecture.

It should expose:

```text
user
isAuthenticated
isLoading
login()
logout()
refreshUser()
```

Do not duplicate login logic in multiple components.

---

# 24. PROTECT ROUTES

Protect:

```text
/account
/admin
/admin/*
```

Unauthenticated users:

```text
→ /login
```

Customer accessing:

```text
/admin
```

must NOT gain access.

---

# 25. ADMIN DASHBOARD

The existing admin dashboard should remain visually intact.

For now, connect authentication.

Do NOT implement the entire ecommerce backend yet.

The admin navigation can remain:

```text
Dashboard
Products
Categories
Orders
Customers
Inventory
Settings
Logout
```

Existing placeholder pages can remain placeholders until their individual development phases.

---

# 26. DATABASE STRUCTURE — ONLY START WITH USERS

For this phase, create only:

```text
users
```

Do NOT prematurely build every ecommerce collection.

Future phases can add:

```text
products
categories
inventory
orders
orderItems
cart
reviews
wishlist
payments
shipments
returns
refunds
coupons
notifications
```

The purpose of this task is to establish the backend foundation.

---

# 27. FUTURE-READY API STRUCTURE

Organize the API so future modules can be added cleanly.

Conceptually:

```text
/api
│
├── auth
│   ├── login
│   ├── logout
│   └── me
│
├── admin
│   └── dashboard
│
├── products
├── categories
├── cart
├── orders
├── customers
├── inventory
├── reviews
├── wishlist
├── returns
├── refunds
└── ...
```

Only implement the necessary endpoints for the current authentication phase.

---

# 28. ERROR HANDLING

Use consistent API responses.

Success:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Sorrel Administrator",
    "email": "admin@sorrel.local",
    "role": "admin"
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Use appropriate HTTP status codes:

```text
400 → Bad Request
401 → Unauthorized
403 → Forbidden
404 → Not Found
500 → Internal Server Error
```

Do not expose internal database errors to users.

---

# 29. SECURITY

Implement:

- Password hashing
- Server-side authentication
- Server-side authorization
- Secure cookies
- Environment variables
- Input validation
- Email normalization
- Unique email index
- Rate limiting if appropriate
- No sensitive data in responses
- No secrets in frontend
- No plaintext passwords in database

---

# 30. MONGODB INDEX

Create a unique index for:

```text
users.email
```

Normalize email before storing:

```text
admin@sorrel.local
```

so:

```text
Admin@Sorrel.Local
```

does not accidentally create a second account.

---

# 31. VERCEL COMPATIBILITY

The final application must be deployable as:

```text
One Git repository
        ↓
One Vercel project
        ↓
Frontend
+
Serverless API
        ↓
MongoDB Atlas
```

Do NOT require:

```text
Vercel frontend
+
Render backend
```

Do NOT require:

```text
Railway backend
```

Do NOT require a separate server deployment.

---

# 32. IMPORTANT — EXISTING PROJECT MUST KEEP WORKING

After making changes:

Run the existing development/build commands from `package.json`.

Check:

```text
TypeScript
Vite
TanStack Router
Existing routes
Existing admin pages
Existing storefront
```

Do not leave build errors.

Do not break:

```text
/
/shop
/product/:slug
/cart
/checkout
/about
/account
/login
/admin
```

---

# 33. DO NOT MODIFY THESE UNNECESSARILY

Avoid unnecessary changes to:

```text
src/components/ui/
src/components/storefront/
src/assets/
src/routes/product.$slug.tsx
src/routes/shop.tsx
src/routes/cart.tsx
src/routes/checkout.tsx
```

Only modify them if authentication integration genuinely requires it.

---

# 34. SERVERLESS DATABASE CONNECTION

The MongoDB connection must be safe for Vercel.

Do NOT do this:

```text
Every API request
 ↓
new MongoClient()
 ↓
connect
 ↓
query
 ↓
disconnect
```

Instead use a cached/shared connection pattern suitable for serverless execution.

Also handle connection errors gracefully.

---

# 35. LOCAL DEVELOPMENT

After implementation, verify:

```text
npm/bun install
 ↓
environment variables
 ↓
seed users
 ↓
start dev server
 ↓
open website
```

Document the exact commands in README.md.

---

# 36. TEST THE TWO USERS

Test this exact workflow.

## Test 1 — Admin

```text
Open /login

Email:
admin@sorrel.local

Password:
Admin@12345

Expected:
Login succeeds
 ↓
Redirect /admin
 ↓
Admin dashboard visible
```

---

## Test 2 — Customer

Logout.

Then:

```text
Email:
customer@sorrel.local

Password:
Customer@12345
```

Expected:

```text
Login succeeds
 ↓
Redirect /account
 ↓
Customer account visible
```

---

# 37. TEST ADMIN PROTECTION

While logged in as customer, manually visit:

```text
/admin
```

Expected:

```text
Access denied
```

Also test the API directly.

Customer must not be able to call:

```text
/api/admin/*
```

successfully.

---

# 38. TEST LOGOUT

Admin:

```text
Login
 ↓
/admin
 ↓
Logout
 ↓
/admin
```

Expected:

```text
Redirect to /login
```

Customer:

```text
Login
 ↓
/account
 ↓
Logout
 ↓
/account
```

Expected:

```text
Redirect to /login
```

---

# 39. TEST REFRESH

Admin:

```text
Login
 ↓
/admin
 ↓
Refresh browser
```

Expected:

```text
Still authenticated
```

Customer:

```text
Login
 ↓
/account
 ↓
Refresh browser
```

Expected:

```text
Still authenticated
```

This is important because authentication must survive normal page refreshes.

---

# 40. TEST PRODUCTION BUILD

Before finishing:

```text
Run build
```

Then verify:

```text
No TypeScript errors
No Vite errors
No TanStack Router errors
No missing imports
No serverless API errors
```

---

# 41. DO NOT FAKE THE BACKEND

Do NOT use:

```text
mock login
hardcoded frontend users
localStorage-only authentication
fake API responses
```

The login must actually verify credentials against MongoDB Atlas.

The source of truth must be:

```text
MongoDB Atlas
```

---

# 42. DO NOT HARDCODE USERS IN FRONTEND

Do NOT write:

```typescript
if (email === "admin@sorrel.local" && password === "Admin@12345") {
  // login
}
```

This is explicitly forbidden.

The workflow must be:

```text
Frontend
 ↓
POST /api/auth/login
 ↓
Server
 ↓
MongoDB Atlas
 ↓
Verify hashed password
 ↓
Create authenticated session
 ↓
Frontend
```

---

# 43. EXPECTED FILES

Add only the files actually needed.

Likely files may include:

```text
src/lib/mongodb.ts
src/lib/auth.ts
src/lib/auth-client.ts

api/auth/login.ts
api/auth/logout.ts
api/auth/me.ts

scripts/seed-users.ts

credentials.txt
.env.example
```

But adapt these paths to the project's actual architecture.

Do not blindly create duplicate utilities if equivalent files already exist.

---

# 44. README UPDATE

Update README.md with a section:

```text
## MongoDB Atlas Setup

## Environment Variables

## Seed Demo Users

## Local Development

## Authentication

## Admin Login

## Customer Login

## Vercel Deployment
```

Do not put real secrets in README.md.

---

# 45. FINAL VERIFICATION

Before saying the task is complete, verify all of the following:

```text
[ ] Existing application still works
[ ] MongoDB Atlas connection works
[ ] User model works
[ ] Admin seed works
[ ] Customer seed works
[ ] Passwords are hashed
[ ] Admin can login
[ ] Customer can login
[ ] Admin redirects to /admin
[ ] Customer redirects to /account
[ ] Admin route is protected
[ ] Customer cannot access admin
[ ] Admin API is protected
[ ] Logout works
[ ] Refresh preserves authentication
[ ] Credentials file exists
[ ] credentials.txt is gitignored
[ ] .env is gitignored
[ ] No secrets are exposed
[ ] No mock authentication remains
[ ] Build passes
[ ] TypeScript passes
[ ] Vercel-compatible architecture
[ ] Single deployment architecture
```

---

# 46. AFTER IMPLEMENTATION

When finished, report:

### Files Created

List every new file.

### Files Modified

List every modified file.

### Dependencies Added

List every package added and why.

### Environment Variables

List required variable NAMES only.

Never print actual secrets.

### Database

Explain:

```text
MongoDB database name
Collection name
Indexes
```

### Demo Accounts

Confirm:

```text
Admin account seeded
Customer account seeded
```

Do not print passwords in the final implementation report.

### Commands

Give exact commands for:

```text
Install
Seed
Run locally
Build
Deploy
```

---

# MOST IMPORTANT INSTRUCTION

**Work with the existing project, not against it.**

This is already a functioning e-commerce frontend with:

- TanStack Router
- Storefront
- Admin UI
- Product pages
- Cart
- Checkout
- Account page
- Login page
- Legal pages
- Existing mock data

Your job is to **connect a real MongoDB Atlas + serverless authentication foundation to what already exists**.

Do not redesign the application.

Do not rebuild the application.

Do not create a second project.

Do not create a separate backend deployment.

Do not replace TanStack Router.

Do not remove existing functionality.

**Inspect first → implement carefully → run/build → test → fix errors → report exactly what changed.**

The final architecture must be:

```text
                    SORREL E-COMMERCE
                           │
              ┌────────────┴────────────┐
              │                         │
          EXISTING UI                /api
              │                         │
       React + TanStack          Vercel Serverless
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                     MongoDB Atlas
                           │
                    ┌──────┴──────┐
                    │             │
                  ADMIN        CUSTOMER
```

Build **only this backend/authentication foundation first**. Product, inventory, orders, payments, returns, coupons, analytics, etc. will be implemented as separate phases after this foundation is confirmed working.
