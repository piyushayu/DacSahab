"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import {
  accountExists,
  createDoctorAccount,
  createPatientAccount,
  findIdentityByEmail,
  toSessionAccount,
  type AccountRecord,
} from "@/lib/auth/accounts";
import {
  clearPendingNextCookie,
  setPendingNextCookie,
  setPendingRoleCookie,
} from "@/lib/auth/cookies";
import {
  burnPasswordCheck,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { requestMeta } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";
import {
  fieldErrors,
  loginSchema,
  signupSchema,
} from "@/lib/validation/auth";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: {
    name?: string;
    email?: string;
    role?: string;
  };
};

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/api/auth")) return null;
  return value;
}

export async function signupAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "user"),
  };

  const parsed = signupSchema.safeParse({
    name: values.name,
    email: values.email,
    password: String(formData.get("password") ?? ""),
    role: values.role,
  });

  if (!parsed.success) {
    return {
      fieldErrors: fieldErrors(parsed.error),
      values,
    };
  }

  if (formData.get("terms") !== "on") {
    return {
      fieldErrors: { terms: "Please accept the terms to continue" },
      values,
    };
  }

  let record: AccountRecord;

  try {
    if (await accountExists(parsed.data.email)) {
      return {
        fieldErrors: {
          email: "An account with this email already exists. Try signing in.",
        },
        values,
      };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    record =
      parsed.data.role === "doctor"
        ? await createDoctorAccount({
            name: parsed.data.name,
            email: parsed.data.email,
            passwordHash,
          })
        : await createPatientAccount({
            name: parsed.data.name,
            email: parsed.data.email,
            passwordHash,
          });

    await createSession(toSessionAccount(record), await requestMeta());
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: {
          email: "An account with this email already exists. Try signing in.",
        },
        values,
      };
    }

    console.error("[auth] signup failed", error);
    return {
      error: "Could not create your account. Please try again.",
      values,
    };
  }

  redirect(record.kind === "DOCTOR" ? "/doctor/dashboard" : "/dashboard");
}

export async function loginAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "user"),
  };
  const requestedNext = safeNext(String(formData.get("next") ?? ""));

  const parsed = loginSchema.safeParse({
    email: values.email,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values };
  }

  let destination = "/dashboard";

  try {
    const identity = await findIdentityByEmail(parsed.data.email);

    if (!identity) {
      await burnPasswordCheck(parsed.data.password);
      return { error: "Invalid email or password", values };
    }

    const record: AccountRecord | null = identity.user
      ? { kind: "USER", user: identity.user }
      : identity.doctor
        ? { kind: "DOCTOR", doctor: identity.doctor }
        : null;

    if (!record) {
      return { error: "Invalid email or password", values };
    }

    destination =
      record.kind === "DOCTOR"
        ? "/doctor/dashboard"
        : record.user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/dashboard";

    destination = requestedNext ?? destination;

    const passwordHash =
      record.kind === "USER"
        ? record.user.passwordHash
        : record.doctor.passwordHash;

    if (!passwordHash) {
      return {
        error:
          "This account uses Google sign-in. Continue with Google instead.",
        values,
      };
    }

    const valid = await verifyPassword(parsed.data.password, passwordHash);
    if (!valid) {
      return { error: "Invalid email or password", values };
    }

    await createSession(toSessionAccount(record), await requestMeta());
  } catch (error) {
    console.error("[auth] login failed", error);
    return {
      error: "Could not sign you in. Please try again.",
      values,
    };
  }

  redirect(destination);
}

export async function googleStartAction(formData: FormData): Promise<void> {
  const role = formData.get("role") === "doctor" ? "doctor" : "user";
  const requestedNext = safeNext(String(formData.get("next") ?? ""));

  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    redirect("/login?error=google_not_configured");
  }

  await setPendingRoleCookie(role);

  if (requestedNext) {
    await setPendingNextCookie(requestedNext);
  } else {
    await clearPendingNextCookie();
  }

  await signIn("google", { redirectTo: "/api/auth/complete" });
}
