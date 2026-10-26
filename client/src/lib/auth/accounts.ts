import "server-only";

import type { Doctor, LoginIdentity, User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

import type { AccountKind, SessionAccount } from "./types";

export type AccountRecord =
  | { kind: "USER"; user: User }
  | { kind: "DOCTOR"; doctor: Doctor };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toSessionAccount(record: AccountRecord): SessionAccount {
  if (record.kind === "USER") {
    return {
      id: record.user.id,
      kind: "USER",
      role: record.user.role,
      onboarded: record.user.onboardingCompleted,
      tokenVersion: record.user.tokenVersion,
    };
  }

  return {
    id: record.doctor.id,
    kind: "DOCTOR",
    role: record.doctor.role,
    onboarded: record.doctor.onboardingCompleted,
    tokenVersion: record.doctor.tokenVersion,
  };
}

export async function findIdentityByEmail(
  email: string,
): Promise<
  | (LoginIdentity & { user: User | null; doctor: Doctor | null })
  | null
> {
  return prisma.loginIdentity.findUnique({
    where: { email: normalizeEmail(email) },
    include: { user: true, doctor: true },
  });
}

export async function getAccountById(
  kind: AccountKind,
  id: string,
): Promise<AccountRecord | null> {
  if (kind === "USER") {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? { kind: "USER", user } : null;
  }

  const doctor = await prisma.doctor.findUnique({ where: { id } });
  return doctor ? { kind: "DOCTOR", doctor } : null;
}

export async function createPatientAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<AccountRecord> {
  const email = normalizeEmail(input.email);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash: input.passwordHash,
        role: "PATIENT",
      },
    });

    await tx.loginIdentity.create({
      data: { email, kind: "USER", userId: user.id },
    });

    return { kind: "USER" as const, user };
  });
}

export async function createDoctorAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<AccountRecord> {
  const email = normalizeEmail(input.email);

  return prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash: input.passwordHash,
        role: "DOCTOR",
      },
    });

    await tx.loginIdentity.create({
      data: { email, kind: "DOCTOR", doctorId: doctor.id },
    });

    return { kind: "DOCTOR" as const, doctor };
  });
}

export async function accountExists(email: string): Promise<boolean> {
  const identity = await prisma.loginIdentity.findUnique({
    where: { email: normalizeEmail(email) },
    select: { email: true },
  });

  return Boolean(identity);
}

export async function findAccountByEmail(
  email: string,
): Promise<AccountRecord | null> {
  const identity = await findIdentityByEmail(email);
  if (!identity) return null;
  if (identity.user) return { kind: "USER", user: identity.user };
  if (identity.doctor) return { kind: "DOCTOR", doctor: identity.doctor };
  return null;
}
