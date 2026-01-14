import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const authMiddleware = withAuth({});

const PROTECTED_PATHS = ["/users", "/list", "/settings", "/billing"];
const API_PREFIX = "/api";

const parseEnvNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const API_RATE_LIMIT_WINDOW_MS = parseEnvNumber(
  process.env.API_RATE_LIMIT_WINDOW_MS,
  60000,
);
const API_RATE_LIMIT_MAX = parseEnvNumber(
  process.env.API_RATE_LIMIT_MAX,
  300,
);

const getClientKey = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.ip ||
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (ip !== "unknown") return ip;
  return `unknown:${request.headers.get("user-agent") ?? "na"}`;
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(API_PREFIX) && request.method !== "OPTIONS") {
    const key = getClientKey(request);
    const result = rateLimit(key, {
      windowMs: API_RATE_LIMIT_WINDOW_MS,
      max: API_RATE_LIMIT_MAX,
    });
    const resetSeconds = Math.ceil(result.resetAt / 1000);

    if (!result.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((result.resetAt - Date.now()) / 1000),
      );
      const response = NextResponse.json(
        { status: 429, message: "Too many requests" },
        { status: 429 },
      );
      response.headers.set("Retry-After", retryAfter.toString());
      response.headers.set("X-RateLimit-Limit", result.limit.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        result.remaining.toString(),
      );
      response.headers.set("X-RateLimit-Reset", resetSeconds.toString());
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetSeconds.toString());
    return response;
  }

  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return authMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/users/:path*",
    "/list/:path*",
    "/settings/:path*",
    "/billing/:path*",
  ],
};
