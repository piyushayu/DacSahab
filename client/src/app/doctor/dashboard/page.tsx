import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DoctorOnboardingForm } from "@/components/dashboard/DoctorOnboardingForm";
import { getCurrentAccount } from "@/lib/dal";

export const instant = false;

export const metadata = {
  title: "Doctor Dashboard | DacSahab",
};

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string; pending?: string }>;
}) {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");
  if (current.record.kind !== "DOCTOR") redirect("/dashboard");

  const { doctor } = current.record;
  const params = await searchParams;

  if (!doctor.onboardingCompleted) {
    return (
      <DashboardShell
        name={doctor.name}
        email={doctor.email}
        roleLabel="Doctor"
        badge="Onboarding"
      >
        <DoctorOnboardingForm />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      name={doctor.name}
      email={doctor.email}
      roleLabel="Doctor"
      badge={doctor.verified ? undefined : "Pending verification"}
    >
      {params.completed === "1" ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
        >
          Your professional details are saved. Your license is now waiting for
          admin verification.
        </div>
      ) : null}

      {params.pending === "verification" ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
        >
          This area opens after an admin verifies your medical license.
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome, {doctor.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {doctor.specialization} · {doctor.experience} years of experience
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            doctor.verified
              ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          }`}
        >
          {doctor.verified ? "Verified doctor" : "Verification pending"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Today
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            0
          </p>
          <p className="mt-1 text-xs text-slate-500">appointments</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Patients
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            0
          </p>
          <p className="mt-1 text-xs text-slate-500">under your care</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            License
          </p>
          <p className="mt-2 truncate text-lg font-bold text-slate-900 dark:text-white">
            {doctor.licenseNumber}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {doctor.verified ? "Approved" : "Awaiting admin approval"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Professional profile
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Specialization</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {doctor.specialization}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Experience</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {doctor.experience} years
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">License number</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {doctor.licenseNumber}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {doctor.phone ?? "Not set"}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardShell>
  );
}
