import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { getAccountById, toSessionAccount } from "@/lib/auth/accounts";
import {
  clearPendingNextCookie,
  clearPendingRoleCookie,
  readPendingNextCookie,
} from "@/lib/auth/cookies";
import { createSession } from "@/lib/auth/session";

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
 * One-time handoff from Auth.js to our own token system.
 * Auth.js proves the Google identity; from here on the app uses ds_access /
 * ds_refresh and never reads the Auth.js session again.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.appSub || !session.appKind) {
    return NextResponse.redirect(
      new URL("/login?error=google_handoff_failed", request.url),
    );
  }

  const record = await getAccountById(session.appKind, session.appSub);
  if (!record) {
    return NextResponse.redirect(
      new URL("/login?error=account_not_found", request.url),
    );
  }

  const account = toSessionAccount(record);
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
  const destination = safeNext(await readPendingNextCookie()) ?? fallback;

  await clearPendingRoleCookie();
  await clearPendingNextCookie();

  return NextResponse.redirect(new URL(destination, request.url));
}
