import { redirect } from "next/navigation";

import { toSessionAccount } from "@/lib/auth/accounts";
import { getCurrentAccount } from "@/lib/dal";

export const instant = false;

export default async function AuthContinuePage() {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");

  const account = toSessionAccount(current.record);

  if (account.kind === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  if (account.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/dashboard");
}
