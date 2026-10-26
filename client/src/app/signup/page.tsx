import { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | DacSahab - Online Doctors & Consultations",
  description:
    "Create an account on DacSahab as a patient or register as a certified doctor.",
};

export const instant = false;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const initialRole = params.role === "doctor" ? "doctor" : "user";

  return (
    <AuthLayout subtitle="Create your DacSahab account">
      <SignupForm initialRole={initialRole} />
    </AuthLayout>
  );
}
