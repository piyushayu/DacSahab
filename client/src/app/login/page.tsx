import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | DacSahab - Online Doctors & Consultations",
  description: "Sign in to DacSahab to book appointments with verified doctors or manage your medical consultations.",
};

export default function LoginPage() {
  return (
    <AuthLayout subtitle="Sign in to your DacSahab account">
      <LoginForm />
    </AuthLayout>
  );
}
