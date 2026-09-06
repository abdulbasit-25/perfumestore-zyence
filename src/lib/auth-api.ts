import { verifyPassword, createToken } from "./auth";
import { isValidEmail, normalizeEmail, validatePassword } from "./auth-validation";
import type { SessionUser } from "./auth-types";

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    if (!cleanName) return { success: false, message: "Please enter your name." };
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, message: "Please enter a valid email address." };
    }
    const passwordMessage = validatePassword(password);
    if (passwordMessage) return { success: false, message: passwordMessage };
    const { getMongoDb } = await import("./mongodb");
    const users = (await getMongoDb()).collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) return { success: false, message: "An account with this email already exists." };
    const { hashPassword } = await import("./auth");
    await users.insertOne({
      name: cleanName,
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: "customer",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      success: true,
      message: "Your account has been created successfully. You can now sign in.",
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return { success: false, message: "An account with this email already exists." };
    }
    console.error("Registration error:", error);
    return { success: false, message: "Unable to create your account right now." };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: SessionUser; token?: string; message?: string }> {
  try {
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    if (!isValidEmail(email)) {
      return { success: false, message: "Invalid email format" };
    }

    const { getMongoDb } = await import("./mongodb");
    const db = await getMongoDb();
    const usersCollection = db.collection("users");
    const normalizedEmail = normalizeEmail(email);

    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    if (user["status"] === "disabled") {
      return { success: false, message: "This account is disabled." };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash as string);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    const sessionUser: SessionUser = {
      id: user._id?.toString() || "",
      name: user.name as string,
      email: user.email as string,
      role: (user.role as "admin" | "manager" | "customer") || "customer",
      ...(typeof user["phone"] === "string" ? { phone: user["phone"] } : {}),
      ...(typeof user["avatarUrl"] === "string" ? { avatarUrl: user["avatarUrl"] } : {}),
    };

    const token = createToken(sessionUser);

    return { success: true, user: sessionUser, token };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Internal server error" };
  }
}

type LoginAttempt = { failures: number; blockedUntil: number };
const loginAttempts = new Map<string, LoginAttempt>();
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function requestKey(request: Request, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${address}:${normalizeEmail(email)}`;
}

function cookieHeader(token: string, maxAge: number): string {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `auth-token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

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

async function parseLoginRequest(request: Request): Promise<{ email: string; password: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as { email?: string; password?: string };
    return { email: String(payload.email ?? ""), password: String(payload.password ?? "") };
  }
  const form = await request.formData();
  return { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
}

export async function handleLoginRequest(request: Request): Promise<Response> {
  try {
    const { email, password } = await parseLoginRequest(request);
    if (!email || !password) {
      return jsonResponse(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return jsonResponse({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    const key = requestKey(request, email);
    const attempt = loginAttempts.get(key);
    if (attempt && attempt.blockedUntil > Date.now()) {
      return jsonResponse(
        { success: false, message: "Too many attempts. Please wait a moment and try again." },
        {
          status: 429,
          headers: { "retry-after": String(Math.ceil((attempt.blockedUntil - Date.now()) / 1000)) },
        },
      );
    }

    const result = await loginUser(email, password);
    if (!result.success || !result.user || !result.token) {
      const failures = (attempt?.failures ?? 0) + 1;
      loginAttempts.set(key, {
        failures,
        blockedUntil: failures >= MAX_LOGIN_FAILURES ? Date.now() + LOGIN_WINDOW_MS : 0,
      });
      return jsonResponse(
        { success: false, message: result.message ?? "Invalid email or password" },
        { status: 401 },
      );
    }

    loginAttempts.delete(key);
    return jsonResponse(
      { success: true, user: result.user },
      {
        headers: { "set-cookie": cookieHeader(result.token, 60 * 60 * 24 * 7) },
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function getUserById(userId: string): Promise<SessionUser | null> {
  try {
    const { getMongoDb } = await import("./mongodb");
    const db = await getMongoDb();
    const usersCollection = db.collection("users");

    const { ObjectId } = await import("mongodb");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return null;
    }

    return {
      id: user._id?.toString() || "",
      name: user.name as string,
      email: user.email as string,
      role: (user.role as "admin" | "manager" | "customer") || "customer",
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
