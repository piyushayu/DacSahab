import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireOnboarded } from "@/lib/dal";

export const instant = false;

export const metadata = {
  title: "Appointments | DacSahab",
};

export default async function AppointmentsPage() {
  const current = await requireOnboarded();
  if (current.record.kind !== "USER") redirect("/doctor/dashboard");

  const { user } = current.record;

  return (
    <DashboardShell name={user.name} email={user.email} roleLabel="Patient">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Appointments
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Your upcoming and past consultations will appear here.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          No appointments yet
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Doctor discovery and booking are the next feature after auth.
        </p>
      </div>
    </DashboardShell>
  );
}
