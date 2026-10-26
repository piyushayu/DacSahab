import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, SESSION_COOKIE } from "@/lib/auth/config";
import { verifyAccessToken } from "@/lib/auth/tokens";
import type { AccessClaims } from "@/lib/auth/types";

const PUBLIC_PREFIXES = ["/login", "/signup", "/api/auth"];
const PATIENT_PREFIXES = ["/dashboard", "/appointments", "/profile", "/doctors"];
const DOCTOR_PREFIX = "/doctor";
const ADMIN_PREFIX = "/admin";

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPatientPath(pathname: string): boolean {
  return PATIENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function forbidden(isApi: boolean, code: string, request: NextRequest, to: string) {
  if (isApi) {
    return NextResponse.json({ code }, { status: 403 });
  }
  return NextResponse.redirect(new URL(to, request.url));
}

/**
 * Optimistic route guard only. It verifies the signed access token and reads
 * claims; it never touches the database. Real authorization lives in the DAL
 * and in every Server Action.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const isApi = pathname.startsWith("/api/");
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  let claims: AccessClaims | null = null;

  if (accessToken) {
    try {
      claims = await verifyAccessToken(accessToken);
    } catch {
      claims = null;
    }
  }

  if (!claims) {
    if (isApi) {
      return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
    }

    if (isPrefetch) return NextResponse.next();

    const next = `${pathname}${search}`;

    // An expired access token with a live session hint gets a silent refresh.
    if (request.cookies.get(SESSION_COOKIE)) {
      const refresh = new URL("/api/auth/refresh", request.url);
      refresh.searchParams.set("next", next);
      return NextResponse.redirect(refresh);
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  const dashboard =
    claims.kind === "DOCTOR" ? "/doctor/dashboard" : "/dashboard";

  // Profile gate: an incomplete account may only see its own dashboard.
  if (!claims.onboarded) {
    if (pathname !== dashboard) {
      return forbidden(
        isApi,
        "ONBOARDING_REQUIRED",
        request,
        dashboard,
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/auth/continue") {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  if (claims.role === "ADMIN") {
    if (pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next();
    return forbidden(isApi, "FORBIDDEN", request, "/admin/dashboard");
  }

  if (pathname.startsWith(DOCTOR_PREFIX) && claims.kind !== "DOCTOR") {
    return forbidden(isApi, "FORBIDDEN", request, "/dashboard");
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    return forbidden(isApi, "FORBIDDEN", request, "/dashboard");
  }

  if (isPatientPath(pathname) && claims.kind !== "USER") {
    return forbidden(isApi, "FORBIDDEN", request, "/doctor/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
