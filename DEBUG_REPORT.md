# Debug Report

**Project:** Zyence E-Commerce Store
**Captured:** 2026-09-06
**Repository:** `https://github.com/abdulbasit-25/E-Comerce-Store.git`
**Deployment observed:** `https://e-comerce-store-two.vercel.app/`

## Executive Summary

The production homepage returned HTTP 500 during investigation. The local production build succeeded, and the configured development server returned HTTP 200. A local request with `MONGODB_URI` removed also returned HTTP 200 after the homepage query change in `src/routes/index.tsx`, confirming that the public homepage no longer depends on MongoDB during SSR. MongoDB remains required for catalog data and other database-backed workflows after client hydration.

The browser warning `Permissions-Policy: Unrecognized feature: 'attribution-reporting'` was not produced by this repository. The deployed homepage response did not contain a `Permissions-Policy` header, so that warning is likely injected by an upstream platform, browser extension, or deployment layer. It is separate from the HTTP 500.

**Security note:** Secret values are intentionally excluded. This report records environment variable names and whether local files contain a value, but never records credentials, connection strings, JWT secrets, or API keys.

## Build and Runtime Configuration

### `package.json`

- Framework: TanStack Start with React 19 and Vite 8.
- Server build: Nitro using the Vercel preset.
- Database: MongoDB driver.
- Authentication: bcryptjs and jsonwebtoken.
- Validation: Zod.
- Tests: Vitest.

Important scripts:

```text
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run seed:users
npm run seed:products
```

### Build configuration files

- `vite.config.ts`: Lovable TanStack config, Nitro Vercel preset, SSR externalization rules, MongoDB dependency exclusion, and `src/server.ts` as the TanStack Start server entry.
- `vitest.config.ts`: Node test environment, `src/**/*.test.ts(x)` inclusion, `@` alias, and image mocks.
- `tsconfig.json`: Strict TypeScript, ES2022 target, bundler resolution, `@/*` mapped to `src/*`, and no emit.
- `eslint.config.js`: TypeScript ESLint, Prettier, React hooks, React refresh, and generated-output ignores.
- `bunfig.toml`: Lockfile saving and a 24-hour package publication age guard.
- `components.json`: shadcn New York style, Tailwind CSS variables, and Lucide icons.
- `AGENTS.md`: Lovable repository history/branch safety instructions.

### Environment variables

Defined by `.env.example`:

```text
MONGODB_URI
JWT_SECRET
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME
NODE_ENV
API_TIMEOUT
```

Local presence check captured on 2026-09-06:

| Variable                | `.env` | `.env.local` | Value in report |
| ----------------------- | -----: | -----------: | --------------- |
| `MONGODB_URI`           |    set |          set | redacted        |
| `JWT_SECRET`            |    set |          set | redacted        |
| `CLOUDINARY_API_KEY`    |    set |          set | redacted        |
| `CLOUDINARY_API_SECRET` |    set |          set | redacted        |
| `CLOUDINARY_CLOUD_NAME` |    set |          set | redacted        |
| `NODE_ENV`              |    set |          set | redacted        |
| `API_TIMEOUT`           |    set |          set | redacted        |

Vercel environment status could not be queried locally because the Vercel CLI is not installed. Confirm these values in the Vercel project settings, especially `MONGODB_URI`, `JWT_SECRET`, and the Cloudinary variables for the Production environment.

## Full Server Entry Files

### `src/server.ts`

```ts
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleLoginApi(request: Request): Promise<Response> {
  const { handleLoginRequest } = await import("@/lib/auth-api");
  return handleLoginRequest(request);
}

async function handleRegisterApi(request: Request): Promise<Response> {
  try {
    const payload = (await request.json()) as { name?: string; email?: string; password?: string };
    const { registerUser } = await import("@/lib/auth-api");
    const result = await registerUser(
      String(payload.name ?? ""),
      String(payload.email ?? ""),
      String(payload.password ?? ""),
    );
    return jsonResponse(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error("[server-register] handler error:", error);
    return jsonResponse(
      { success: false, message: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/login") {
        return handleLoginApi(request);
      }
      if (request.method === "POST" && url.pathname === "/api/register") {
        return handleRegisterApi(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
```

### `src/start.ts`

```ts
import { createStart, createMiddleware } from "@tanstack/react-start";
import { createCsrfMiddleware } from "@tanstack/start-client-core";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const loginApiMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  if (request.method !== "POST" || url.pathname !== "/api/login") {
    if (request.method === "POST" && url.pathname === "/api/register") {
      try {
        const payload = (await request.json()) as {
          name?: string;
          email?: string;
          password?: string;
        };
        const { registerUser } = await import("./lib/auth-api");
        const result = await registerUser(
          String(payload.name ?? ""),
          String(payload.email ?? ""),
          String(payload.password ?? ""),
        );
        return jsonResponse(result, { status: result.success ? 201 : 400 });
      } catch (error) {
        console.error("[register] handler error:", error);
        return jsonResponse(
          { success: false, message: "Unable to create your account right now." },
          { status: 500 },
        );
      }
    }
    return next();
  }

  const { handleLoginRequest } = await import("./lib/auth-api");
  return handleLoginRequest(request);
});

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

export const startInstance = createStart(() => ({
  requestMiddleware: [loginApiMiddleware, errorMiddleware, csrfMiddleware],
}));
```

## Authentication and Database Source Inventory

These are all authentication, authorization, database, catalog, and database-backed domain modules identified under `src/lib`. The source remains in the repository at the listed path; this report records the complete set without duplicating every large implementation file.

### Authentication and authorization

- `src/lib/auth.ts` - password hashing, password verification, JWT creation and verification.
- `src/lib/auth-api.ts` - login and registration API handlers.
- `src/lib/auth-server.ts` - server functions for login, logout, and current-user access.
- `src/lib/auth-types.ts` - authentication types.
- `src/lib/auth-validation.ts` - authentication input validation.
- `src/lib/authorization-server.ts` - server-side permission and current-user authorization checks.
- `src/lib/permissions.ts` - role and permission definitions.
- `src/lib/auth.test.ts` - authentication tests.
- `src/lib/permissions.test.ts` - permission tests.

### Database connection and domain server modules

- `src/lib/mongodb.ts` - MongoDB client/database cache, connection, indexes, and collection initialization.
- `src/lib/catalog-types.ts` - product and catalog domain types.
- `src/lib/category-server.ts` - category reads and mutations.
- `src/lib/coupon-server.ts` - coupon reads, validation, usage, and mutations.
- `src/lib/customer-server.ts` - customer aggregation and admin customer operations.
- `src/lib/inventory-server.ts` - inventory reads and stock adjustments.
- `src/lib/order-server.ts` - order creation, stock reservation, coupons, and order reads/mutations.
- `src/lib/product-server.ts` - product reads, filters, and product CRUD.
- `src/lib/return-server.ts` - return, refund, and admin return operations.
- `src/lib/review-server.ts` - review reads, eligibility, creation, and moderation.
- `src/lib/shipment-server.ts` - shipment reads and admin shipment operations.
- `src/lib/user-server.ts` - user reads, role management, and admin user operations.

### Database source fingerprints

The following file sizes were captured from the working tree on 2026-09-06. Hashes should be regenerated before comparing a later deployment because generated build output is not authoritative.

| File                      |         Size |
| ------------------------- | -----------: |
| `auth.ts`                 |  1,159 bytes |
| `auth-api.ts`             |  7,569 bytes |
| `auth-server.ts`          |  4,677 bytes |
| `auth-types.ts`           |    196 bytes |
| `auth-validation.ts`      |    527 bytes |
| `authorization-server.ts` |  2,119 bytes |
| `mongodb.ts`              |  3,917 bytes |
| `permissions.ts`          |  1,220 bytes |
| `catalog-types.ts`        |  1,506 bytes |
| `category-server.ts`      |  3,313 bytes |
| `coupon-server.ts`        |  7,727 bytes |
| `customer-server.ts`      |  4,077 bytes |
| `inventory-server.ts`     |  6,200 bytes |
| `order-server.ts`         | 17,512 bytes |
| `product-server.ts`       | 10,858 bytes |
| `return-server.ts`        |  9,055 bytes |
| `review-server.ts`        | 14,379 bytes |
| `shipment-server.ts`      |  7,483 bytes |
| `user-server.ts`          |  7,397 bytes |

## Route List

Generated from `src/routes` on 2026-09-06:

```text
/__root
/about
/account
/admin
/admin/categories
/admin/coupons
/admin/customers
/admin/inventory
/admin/orders
/admin/products
/admin/returns
/admin/reviews
/admin/shipments
/admin/users
/cart
/checkout
/contact
/cookie-policy
/
/login
/privacy-policy
/product/$slug
/refund-policy
/shop
/terms-conditions
```

Route files:

```text
src/routes/__root.tsx
src/routes/about.tsx
src/routes/account.tsx
src/routes/admin.categories.tsx
src/routes/admin.coupons.tsx
src/routes/admin.customers.tsx
src/routes/admin.index.tsx
src/routes/admin.inventory.tsx
src/routes/admin.orders.tsx
src/routes/admin.products.tsx
src/routes/admin.returns.tsx
src/routes/admin.reviews.tsx
src/routes/admin.shipments.tsx
src/routes/admin.tsx
src/routes/admin.users.tsx
src/routes/cart.tsx
src/routes/checkout.tsx
src/routes/contact.tsx
src/routes/cookie-policy.tsx
src/routes/index.tsx
src/routes/login.tsx
src/routes/privacy-policy.tsx
src/routes/product.$slug.tsx
src/routes/refund-policy.tsx
src/routes/shop.tsx
src/routes/terms-conditions.tsx
```

## Recent Commits

```text
8cb9836 | 2026-09-06 10:51:36 +0500 | abdulbasit-025 | ReadME
84073c1 | 2026-09-06 10:43:16 +0500 | abdulbasit-025 | ReadME
16e48ec | 2026-09-06 10:31:08 +0500 | abdulbasit-025 | Update Vitest configuration
43b9176 | 2026-09-06 10:31:04 +0500 | abdulbasit-025 | Update async hooks polyfill
94d4c77 | 2026-09-06 10:31:00 +0500 | abdulbasit-025 | Update tooltip component
343fee1 | 2026-09-06 10:30:56 +0500 | abdulbasit-025 | Update FAQ section
c0622a3 | 2026-09-06 10:30:53 +0500 | abdulbasit-025 | Update product test script
3e0a6f3 | 2026-09-06 10:30:49 +0500 | abdulbasit-025 | Update ESLint configuration
70a05a0 | 2026-09-06 10:30:06 +0500 | abdulbasit-025 | Add shipment tests
f8b3056 | 2026-09-06 10:30:03 +0500 | abdulbasit-025 | Add pagination utilities
edc9c18 | 2026-09-06 10:29:59 +0500 | abdulbasit-025 | Add mock data documentation
7217436 | 2026-09-06 10:29:56 +0500 | abdulbasit-025 | Add project progress documentation
```

Working-tree status at capture: clean. Remote `origin`: `https://github.com/abdulbasit-25/E-Comerce-Store.git`.

## Build Log

Command:

```text
npm run build
```

Result:

```text
Exit code: 0
vite build completed successfully
Nitro preset: vercel
Generated .vercel/output/static
Generated .vercel/output/functions/__server.func
Generated .vercel/output/nitro.json
You can preview this build using npx vite preview
You can deploy this build using npx nitro deploy --prebuilt
```

The repository `build.log` is an older captured build log from 2026-08-18, size 34,220 bytes. Its tail also reports a successful build and generated `.output/server/wrangler.json`, `.wrangler/deploy/config.json`, `.output/public/_headers`, and `.output/nitro.json`.

### Local runtime checks

Configured development server:

```text
npm run dev -- --host 127.0.0.1
```

Observed result:

```text
VITE v8.2.1 ready
Local: http://127.0.0.1:8081/
GET / -> HTTP 200
```

No-database check:

```text
MONGODB_URI="" npm run dev -- --host 127.0.0.1 --port 4175
GET http://127.0.0.1:4175/ -> STATUS 200
```

This check validates that the homepage shell can render without MongoDB during SSR after the `enabled: typeof window !== "undefined"` query guard in `src/routes/index.tsx`.

### Preview log

The command `npx vite preview --host 127.0.0.1 --port 4173` did not exercise the generated Vercel output in this setup. It returned HTTP 500 because the TanStack preview plugin attempted to import a missing development artifact:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'B:\\flow\\DEV1\\Projects\\E-Comerce Store\\dist\\server\\server.js'
imported from @tanstack/start-plugin-core/.../preview-server-plugin/plugin.js
```

This is a preview-tool/output-layout mismatch, not the deployed Vercel response. Use the Nitro/Vercel output or the configured dev server for local runtime validation.

### Deployed response

Request:

```text
curl.exe -i https://e-comerce-store-two.vercel.app/
```

Observed:

```text
HTTP/1.1 500 Internal Server Error
Server: Vercel
Content-Type: text/html; charset=utf-8
X-Vercel-Cache: MISS
```

The body was Vercel's generic `This page didn't load` page. The response did not include a `Permissions-Policy` header. The deployed runtime logs were not available from the local workspace, so Vercel Function Logs should be checked for the original exception and environment-variable status.

## Recommended Deployment Checks

1. Confirm Production `MONGODB_URI` exists in Vercel and can connect from the deployed region.
2. Confirm Production `JWT_SECRET`, `NODE_ENV`, Cloudinary variables, and `API_TIMEOUT` are configured as needed.
3. Redeploy the current commit and request `/` with `curl -i`.
4. Inspect Vercel Function Logs for MongoDB connection, index initialization, or SSR errors.
5. Check deployment headers or Vercel configuration for any externally injected `Permissions-Policy` header.
6. Verify `/shop`, `/login`, `/account`, `/checkout`, and `/admin` after the homepage deploy.
