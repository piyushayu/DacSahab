export const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const JWT_ISSUER = "dacsahab";
export const ACCESS_AUDIENCE = "dacsahab-app";
export const REFRESH_AUDIENCE = "dacsahab-refresh";

export const ACCESS_COOKIE = "ds_access";
export const REFRESH_COOKIE = "ds_refresh";
export const SESSION_COOKIE = "ds_session";
export const ACCESS_EXP_COOKIE = "ds_access_exp";
export const PENDING_ROLE_COOKIE = "ds_pending_role";
export const PENDING_NEXT_COOKIE = "ds_pending_next";

export const REFRESH_COOKIE_PATH = "/api/auth";

const encoder = new TextEncoder();

export function accessSecret(): Uint8Array {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value) throw new Error("JWT_ACCESS_SECRET is not set");
  return encoder.encode(value);
}

export function refreshSecret(): Uint8Array {
  const value = process.env.JWT_REFRESH_SECRET;
  if (!value) throw new Error("JWT_REFRESH_SECRET is not set");
  return encoder.encode(value);
}

export const isProduction = process.env.NODE_ENV === "production";
