import { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | DacSahab - Online Doctors & Consultations",
  description:
    "Sign in to DacSahab to book appointments with verified doctors or manage your medical consultations.",
};

export const instant = false;

const notices: Record<string, string> = {
  google_not_configured:
    "Google sign-in is not configured yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to client/.env.local.",
  google_handoff_failed:
    "Google sign-in could not be completed. Please try again.",
  account_not_found:
    "We could not find that account. Please create an account first.",
  AccessDenied: "Google sign-in was cancelled or denied.",
  OAuthAccountNotLinked:
    "This email is already registered with another sign-in method.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const initialRole = params.role === "doctor" ? "doctor" : "user";
  const notice = params.error ? notices[params.error] : undefined;

  return (
    <AuthLayout subtitle="Sign in to your DacSahab account">
      <LoginForm
        initialRole={initialRole}
        notice={notice}
        next={params.next}
      />
    </AuthLayout>
  );
}
