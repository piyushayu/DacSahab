import { createHash, randomUUID } from "node:crypto";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";

import {
  ACCESS_AUDIENCE,
  ACCESS_TTL_SECONDS,
  JWT_ISSUER,
  REFRESH_AUDIENCE,
  REFRESH_TTL_SECONDS,
  accessSecret,
  refreshSecret,
} from "./config";
import type { AccessClaims, RefreshClaims, SessionAccount } from "./types";

export function newTokenId(): string {
  return randomUUID();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(
  account: SessionAccount,
): Promise<{ token: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ACCESS_TTL_SECONDS;

  const token = await new SignJWT({
    kind: account.kind,
    role: account.role,
    onboarded: account.onboarded,
    tokenVersion: account.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(account.id)
    .setIssuer(JWT_ISSUER)
    .setAudience(ACCESS_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(accessSecret());

  return { token, expiresAt: expiresAt * 1000 };
}

export async function signRefreshToken(
  account: SessionAccount,
  jti: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    kind: account.kind,
    tokenVersion: account.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(account.id)
    .setJti(jti)
    .setIssuer(JWT_ISSUER)
    .setAudience(REFRESH_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + REFRESH_TTL_SECONDS)
    .sign(refreshSecret());
}

function isAccountKind(value: unknown): value is "USER" | "DOCTOR" {
  return value === "USER" || value === "DOCTOR";
}

function isAppRole(value: unknown): value is "PATIENT" | "DOCTOR" | "ADMIN" {
  return value === "PATIENT" || value === "DOCTOR" || value === "ADMIN";
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, accessSecret(), {
    issuer: JWT_ISSUER,
    audience: ACCESS_AUDIENCE,
  });

  if (
    typeof payload.sub !== "string" ||
    !isAccountKind(payload.kind) ||
    !isAppRole(payload.role) ||
    typeof payload.onboarded !== "boolean" ||
    typeof payload.tokenVersion !== "number"
  ) {
    throw new Error("Malformed access token");
  }

  return payload as unknown as AccessClaims;
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims> {
  const { payload } = await jwtVerify(token, refreshSecret(), {
    issuer: JWT_ISSUER,
    audience: REFRESH_AUDIENCE,
  });

  if (
    typeof payload.sub !== "string" ||
    !isAccountKind(payload.kind) ||
    typeof payload.jti !== "string" ||
    typeof payload.tokenVersion !== "number"
  ) {
    throw new Error("Malformed refresh token");
  }

  return payload as unknown as RefreshClaims;
}

