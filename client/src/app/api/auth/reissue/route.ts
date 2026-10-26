import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { toSessionAccount } from "@/lib/auth/accounts";
import { REFRESH_COOKIE } from "@/lib/auth/config";
import { createSession, revokeRefreshToken } from "@/lib/auth/session";
import { getCurrentAccount } from "@/lib/dal";

function clientIp(value: string | null): string | null {
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/api/auth")) return null;
  return value;
}

/**
 * Issues a fresh access/refresh pair from the current database state.
 * Onboarding uses this after writing the profile so the new access token has
 * `onboarded: true`. The route lives under /api/auth, which means the
 * path-scoped refresh cookie is actually sent and the old family can be
 * revoked.
 */
export async function GET(request: NextRequest) {
  const current = await getCurrentAccount();
  if (!current) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const rawRefreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (rawRefreshToken) await revokeRefreshToken(rawRefreshToken);

  const account = toSessionAccount(current.record);
  const headerStore = await headers();

  await createSession(account, {
    userAgent: headerStore.get("user-agent"),
    ip: clientIp(
      headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip"),
    ),
  });

  const fallback =
    account.kind === "DOCTOR"
      ? "/doctor/dashboard"
      : account.role === "ADMIN"
        ? "/admin/dashboard"
        : "/dashboard";
  const destination =
    safeNext(request.nextUrl.searchParams.get("next")) ?? fallback;

  return NextResponse.redirect(new URL(destination, request.url));
}
