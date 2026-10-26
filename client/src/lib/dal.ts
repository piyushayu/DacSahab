import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAccountById, toSessionAccount, type AccountRecord } from "@/lib/auth/accounts";
import { ACCESS_COOKIE } from "@/lib/auth/config";
import { verifyAccessToken } from "@/lib/auth/tokens";
import type { AccessClaims } from "@/lib/auth/types";

export const getAppSession = cache(async (): Promise<AccessClaims | null> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
});

export const getCurrentAccount = cache(
  async (): Promise<{ session: AccessClaims; record: AccountRecord } | null> => {
    const session = await getAppSession();
    if (!session) return null;

    const record = await getAccountById(session.kind, session.sub);
    if (!record) return null;

    // A bumped tokenVersion means every previously issued token is dead.
    const current = toSessionAccount(record);
    if (current.tokenVersion !== session.tokenVersion) return null;

    return { session, record };
  },
);

export async function requireUser(): Promise<AccessClaims> {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");
  if (current.session.kind !== "USER") redirect("/doctor/dashboard");
  return current.session;
}

export async function requireDoctor(): Promise<AccessClaims> {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");
  if (current.session.kind !== "DOCTOR") redirect("/dashboard");
  return current.session;
}

export async function requireAdmin(): Promise<{
  session: AccessClaims;
  record: AccountRecord;
}> {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");
  if (current.session.role !== "ADMIN") redirect("/dashboard");
  return current;
}

export async function requireOnboarded(): Promise<{
  session: AccessClaims;
  record: AccountRecord;
}> {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");

  const account = toSessionAccount(current.record);
  if (!account.onboarded) {
    redirect(account.kind === "DOCTOR" ? "/doctor/dashboard" : "/dashboard");
  }

  return current;
}

export async function requireVerifiedDoctor(): Promise<{
  session: AccessClaims;
  record: Extract<AccountRecord, { kind: "DOCTOR" }>;
}> {
  const current = await getCurrentAccount();
  if (!current || current.record.kind !== "DOCTOR") redirect("/login");

  if (!current.record.doctor.verified) {
    redirect("/doctor/dashboard?pending=verification");
  }

  return {
    session: current.session,
    record: current.record,
  };
}
