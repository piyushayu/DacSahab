import { jwtVerify } from "jose";

export type AccessClaims = {
  sub: string;
  kind: "USER" | "DOCTOR";
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  onboarded: boolean;
  tokenVersion: number;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

function accessSecret(): Uint8Array {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(value);
}

function isKind(value: unknown): value is "USER" | "DOCTOR" {
  return value === "USER" || value === "DOCTOR";
}

function isRole(value: unknown): value is "PATIENT" | "DOCTOR" | "ADMIN" {
  return value === "PATIENT" || value === "DOCTOR" || value === "ADMIN";
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, accessSecret(), {
    issuer: "dacsahab",
    audience: "dacsahab-app",
  });

  if (
    typeof payload.sub !== "string" ||
    !isKind(payload.kind) ||
    !isRole(payload.role) ||
    typeof payload.onboarded !== "boolean" ||
    typeof payload.tokenVersion !== "number"
  ) {
    throw new Error("Malformed access token");
  }

  return payload as unknown as AccessClaims;
}
