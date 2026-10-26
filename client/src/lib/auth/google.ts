import "server-only";

import type { Doctor, User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

import { normalizeEmail } from "./accounts";
import type { AccountKind } from "./types";

export type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export type GoogleAccount = {
  provider: string;
  providerAccountId: string;
  type?: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

type GoogleIdentity = {
  id: string;
  kind: AccountKind;
};

function providerAccountData(account: GoogleAccount) {
  return {
    type: account.type ?? "oauth",
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? null,
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    id_token: account.id_token ?? null,
    session_state: account.session_state ?? null,
  };
}

async function touchUser(user: User, profile: GoogleProfile): Promise<void> {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: user.emailVerified ?? new Date(),
      image: user.image ?? profile.picture ?? null,
    },
  });
}

async function touchDoctor(doctor: Doctor, profile: GoogleProfile): Promise<void> {
  await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      emailVerified: doctor.emailVerified ?? new Date(),
      image: doctor.image ?? profile.picture ?? null,
    },
  });
}

async function linkUser(
  user: User,
  account: GoogleAccount,
  profile: GoogleProfile,
): Promise<GoogleIdentity> {
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    create: { ...providerAccountData(account), userId: user.id },
    update: {},
  });

  await touchUser(user, profile);
  return { id: user.id, kind: "USER" };
}

async function linkDoctor(
  doctor: Doctor,
  account: GoogleAccount,
  profile: GoogleProfile,
): Promise<GoogleIdentity> {
  await prisma.doctorAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    create: { ...providerAccountData(account), doctorId: doctor.id },
    update: {},
  });

  await touchDoctor(doctor, profile);
  return { id: doctor.id, kind: "DOCTOR" };
}

/**
 * Auth.js hands us a verified Google identity. This function is the only
 * bridge between Auth.js and our own account model; it never creates a session.
 */
export async function handleGoogleSignIn(input: {
  account: GoogleAccount;
  profile: GoogleProfile;
  pendingRole: AccountKind;
}): Promise<GoogleIdentity> {
  const { account, profile, pendingRole } = input;

  if (!profile.email) {
    throw new Error("Google did not return an email address");
  }

  const email = normalizeEmail(profile.email);

  const linkedUser = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (linkedUser) return linkUser(linkedUser.user, account, profile);

  const linkedDoctor = await prisma.doctorAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { doctor: true },
  });

  if (linkedDoctor) return linkDoctor(linkedDoctor.doctor, account, profile);

  const identity = await prisma.loginIdentity.findUnique({
    where: { email },
    include: { user: true, doctor: true },
  });

  if (identity?.user) return linkUser(identity.user, account, profile);
  if (identity?.doctor) return linkDoctor(identity.doctor, account, profile);

  // New account: the role was chosen on the signup screen.
  try {
    if (pendingRole === "DOCTOR") {
      const doctor = await prisma.$transaction(async (tx) => {
        const created = await tx.doctor.create({
          data: {
            name: profile.name?.trim() || email.split("@")[0],
            email,
            image: profile.picture ?? null,
            emailVerified: new Date(),
            role: "DOCTOR",
          },
        });

        await tx.loginIdentity.create({
          data: { email, kind: "DOCTOR", doctorId: created.id },
        });

        await tx.doctorAccount.create({
          data: { ...providerAccountData(account), doctorId: created.id },
        });

        return created;
      });

      return { id: doctor.id, kind: "DOCTOR" };
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: profile.name?.trim() || email.split("@")[0],
          email,
          image: profile.picture ?? null,
          emailVerified: new Date(),
          role: "PATIENT",
        },
      });

      await tx.loginIdentity.create({
        data: { email, kind: "USER", userId: created.id },
      });

      await tx.account.create({
        data: { ...providerAccountData(account), userId: created.id },
      });

      return created;
    });

    return { id: user.id, kind: "USER" };
  } catch (error) {
    // A concurrent Google callback may have created the identity first.
    const raced = await prisma.loginIdentity.findUnique({
      where: { email },
      include: { user: true, doctor: true },
    });

    if (raced?.user) return linkUser(raced.user, account, profile);
    if (raced?.doctor) return linkDoctor(raced.doctor, account, profile);

    throw error;
  }
}
