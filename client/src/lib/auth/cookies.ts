import "server-only";

import { cookies } from "next/headers";

import {
  ACCESS_COOKIE,
  ACCESS_EXP_COOKIE,
  ACCESS_TTL_SECONDS,
  PENDING_NEXT_COOKIE,
  PENDING_ROLE_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TTL_SECONDS,
  SESSION_COOKIE,
  isProduction,
} from "./config";

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export type AuthCookiePayload = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
};

export async function setAuthCookies(payload: AuthCookiePayload): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, payload.accessToken, {
    ...baseCookie,
    maxAge: ACCESS_TTL_SECONDS,
  });

  // The long-lived credential is only sent to the auth endpoints.
  store.set(REFRESH_COOKIE, payload.refreshToken, {
    ...baseCookie,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TTL_SECONDS,
  });

  // Presence hint for the Proxy, which cannot read the refresh cookie.
  store.set(SESSION_COOKIE, "1", {
    ...baseCookie,
    maxAge: REFRESH_TTL_SECONDS,
  });

  // Non-sensitive expiry timestamp so client code can refresh proactively.
  store.set(ACCESS_EXP_COOKIE, String(payload.accessExpiresAt), {
    ...baseCookie,
    httpOnly: false,
    maxAge: ACCESS_TTL_SECONDS,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", {
    ...baseCookie,
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
  store.set(SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
  store.set(ACCESS_EXP_COOKIE, "", {
    ...baseCookie,
    httpOnly: false,
    maxAge: 0,
  });
}

export async function setPendingRoleCookie(
  role: "user" | "doctor",
): Promise<void> {
  const store = await cookies();
  store.set(PENDING_ROLE_COOKIE, role, {
    ...baseCookie,
    maxAge: 10 * 60,
  });
}

export async function readPendingRoleCookie(): Promise<"user" | "doctor" | null> {
  const value = (await cookies()).get(PENDING_ROLE_COOKIE)?.value;
  return value === "user" || value === "doctor" ? value : null;
}

export async function clearPendingRoleCookie(): Promise<void> {
  const store = await cookies();
  store.set(PENDING_ROLE_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

export async function setPendingNextCookie(next: string): Promise<void> {
  const store = await cookies();
  store.set(PENDING_NEXT_COOKIE, next, {
    ...baseCookie,
    maxAge: 10 * 60,
  });
}

export async function readPendingNextCookie(): Promise<string | null> {
  return (await cookies()).get(PENDING_NEXT_COOKIE)?.value ?? null;
}

export async function clearPendingNextCookie(): Promise<void> {
  const store = await cookies();
  store.set(PENDING_NEXT_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
