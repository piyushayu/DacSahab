import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken, type AccessClaims } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

function extractToken(request: Request): string | null {
  const header = request.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim() || null;
  }

  // The browser cannot read the httpOnly access cookie, so the API accepts it
  // directly. Client and API must be same-site for this to work.
  return request.cookies?.ds_access ?? null;
}

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(request);

  if (!token) {
    response.setHeader("WWW-Authenticate", "Bearer");
    response.status(401).json({ code: "UNAUTHENTICATED" });
    return;
  }

  let claims;

  try {
    claims = await verifyAccessToken(token);
  } catch {
    response.setHeader("WWW-Authenticate", 'Bearer error="invalid_token"');
    response.status(401).json({ code: "INVALID_TOKEN" });
    return;
  }

  request.auth = claims;
  next();
}

export function requireRole(...roles: AccessClaims["role"][]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.auth) {
      response.status(401).json({ code: "UNAUTHENTICATED" });
      return;
    }

    if (!roles.includes(request.auth.role)) {
      response.status(403).json({ code: "FORBIDDEN" });
      return;
    }

    next();
  };
}

export function requireKind(...kinds: AccessClaims["kind"][]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.auth) {
      response.status(401).json({ code: "UNAUTHENTICATED" });
      return;
    }

    if (!kinds.includes(request.auth.kind)) {
      response.status(403).json({ code: "FORBIDDEN" });
      return;
    }

    next();
  };
}

export function requireOnboarded(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.auth) {
    response.status(401).json({ code: "UNAUTHENTICATED" });
    return;
  }

  if (!request.auth.onboarded) {
    response.status(403).json({ code: "ONBOARDING_REQUIRED" });
    return;
  }

  next();
}

export async function requireVerifiedDoctor(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  if (!request.auth || request.auth.kind !== "DOCTOR") {
    response.status(403).json({ code: "FORBIDDEN" });
    return;
  }

  let doctor: {
    verified: boolean;
    onboardingCompleted: boolean;
    tokenVersion: number;
  } | null;

  try {
    doctor = await prisma.doctor.findUnique({
      where: { id: request.auth.sub },
      select: { verified: true, onboardingCompleted: true, tokenVersion: true },
    });
  } catch (error) {
    console.error("[auth] verified-doctor check failed", error);
    response.status(500).json({ code: "INTERNAL_ERROR" });
    return;
  }

  if (!doctor || doctor.tokenVersion !== request.auth.tokenVersion) {
    response.status(401).json({ code: "UNAUTHENTICATED" });
    return;
  }

  if (!doctor.onboardingCompleted) {
    response.status(403).json({ code: "ONBOARDING_REQUIRED" });
    return;
  }

  if (!doctor.verified) {
    response.status(403).json({ code: "DOCTOR_NOT_VERIFIED" });
    return;
  }

  next();
}
