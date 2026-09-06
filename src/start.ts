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
