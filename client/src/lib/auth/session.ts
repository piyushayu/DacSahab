import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { getAccountById, toSessionAccount, type AccountRecord } from "./accounts";
import { REFRESH_COOKIE, REFRESH_TTL_SECONDS } from "./config";
import { clearAuthCookies, setAuthCookies } from "./cookies";
import {
  hashToken,
  newTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./tokens";
import type { SessionAccount, SessionMeta } from "./types";

const ROTATION_GRACE_MS = 10_000;

export class InvalidRefreshError extends Error {
  constructor(message = "Invalid refresh token") {
    super(message);
    this.name = "InvalidRefreshError";
  }
}

export class RefreshReuseError extends InvalidRefreshError {
  constructor() {
    super("Refresh token reuse detected");
    this.name = "RefreshReuseError";
  }
}

export class RefreshRaceError extends InvalidRefreshError {
  constructor() {
    super("Refresh token was just rotated by another request");
    this.name = "RefreshRaceError";
  }
}

function refreshRowData(
  account: SessionAccount,
  tokenHash: string,
  familyId: string,
  meta: SessionMeta,
) {
  return {
    tokenHash,
    familyId,
    kind: account.kind,
    userId: account.kind === "USER" ? account.id : null,
    doctorId: account.kind === "DOCTOR" ? account.id : null,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  };
}

export async function createSession(
  account: SessionAccount,
  meta: SessionMeta = {},
): Promise<void> {
  const familyId = newTokenId();
  const jti = newTokenId();

  const [access, refreshToken] = await Promise.all([
    signAccessToken(account),
    signRefreshToken(account, jti),
  ]);

  await prisma.refreshToken.create({
    data: refreshRowData(account, hashToken(refreshToken), familyId, meta),
  });

  await setAuthCookies({
    accessToken: access.token,
    refreshToken,
    accessExpiresAt: access.expiresAt,
  });
}

export async function rotateSession(
  rawRefreshToken: string,
  meta: SessionMeta = {},
): Promise<SessionAccount> {
  const claims = await verifyRefreshToken(rawRefreshToken).catch(() => null);
  if (!claims) throw new InvalidRefreshError();

  const tokenHash = hashToken(rawRefreshToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!row || row.expiresAt.getTime() <= Date.now()) {
    throw new InvalidRefreshError();
  }

  if (row.revokedAt) {
    const age = row.revokedAt ? Date.now() - row.revokedAt.getTime() : Infinity;

    // Two tabs can race. The browser shares cookies, so the losing tab can
    // retry and pick up the winner's new cookie. Only treat an old reuse as
    // an attack.
    if (row.replacedBy && age < ROTATION_GRACE_MS) {
      throw new RefreshRaceError();
    }

    await revokeFamily(row.familyId);
    throw new RefreshReuseError();
  }

  if (row.kind !== claims.kind) {
    await revokeFamily(row.familyId);
    throw new InvalidRefreshError();
  }

  const record = await getAccountById(claims.kind, claims.sub);
  if (!record) {
    await revokeFamily(row.familyId);
    throw new InvalidRefreshError();
  }

  const account = toSessionAccount(record);

  if (account.tokenVersion !== claims.tokenVersion) {
    await revokeFamily(row.familyId);
    throw new InvalidRefreshError();
  }

  const jti = newTokenId();
  const [access, refreshToken] = await Promise.all([
    signAccessToken(account),
    signRefreshToken(account, jti),
  ]);

  await prisma.$transaction(async (tx) => {
    const created = await tx.refreshToken.create({
      data: refreshRowData(account, hashToken(refreshToken), row.familyId, meta),
    });

    await tx.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date(), replacedBy: created.id },
    });
  });

  await setAuthCookies({
    accessToken: access.token,
    refreshToken,
    accessExpiresAt: access.expiresAt,
  });

  return account;
}

export async function revokeFamily(familyId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const claims = await verifyRefreshToken(rawRefreshToken).catch(() => null);
  if (!claims) return;

  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawRefreshToken) },
    select: { familyId: true },
  });

  if (row) await revokeFamily(row.familyId);
}

export async function revokeCurrentSession(): Promise<void> {
  const raw = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (raw) await revokeRefreshToken(raw);
  await clearAuthCookies();
}

/**
 * Revokes every refresh token for an account and bumps tokenVersion so any
 * outstanding access token is rejected by the DAL on its next request.
 */
export async function revokeAllSessions(record: AccountRecord): Promise<void> {
  if (record.kind === "USER") {
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { userId: record.user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.user.id },
        data: { tokenVersion: { increment: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { doctorId: record.doctor.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.doctor.update({
        where: { id: record.doctor.id },
        data: { tokenVersion: { increment: 1 } },
      }),
    ]);
  }
}
