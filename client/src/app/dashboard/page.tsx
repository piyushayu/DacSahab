import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PatientProfileForm } from "@/components/dashboard/PatientProfileForm";
import { getCurrentAccount } from "@/lib/dal";

export const instant = false;

export const metadata = {
  title: "Dashboard | DacSahab",
};

function formatDate(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string }>;
}) {
  const current = await getCurrentAccount();
  if (!current) redirect("/login");
  if (current.record.kind !== "USER") redirect("/doctor/dashboard");

  const { user } = current.record;
  const params = await searchParams;
  const justCompleted = params.completed === "1";

  if (!user.onboardingCompleted) {
    return (
      <DashboardShell
        name={user.name}
        email={user.email}
        roleLabel="Patient"
      >
        <PatientProfileForm
          defaultName={user.name}
          defaultDateOfBirth={formatDate(user.dateOfBirth)}
          defaultGender={user.gender}
          defaultImage={user.image}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell name={user.name} email={user.email} roleLabel="Patient">
      {justCompleted ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
        >
          Your profile is complete. Welcome to DacSahab.
        </div>
      ) : null}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your consultations and appointments from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Upcoming
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            0
          </p>
          <p className="mt-1 text-xs text-slate-500">appointments booked</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completed
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            0
          </p>
          <p className="mt-1 text-xs text-slate-500">consultations finished</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Profile
          </p>
          <p className="mt-2 text-lg font-bold text-teal-700 dark:text-teal-400">
            Complete
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {user.emailVerified ? "Email verified" : "Email not verified"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Book a consultation
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse verified doctors and schedule an online appointment.
          </p>
          <Link
            href="/appointments"
            className="mt-4 inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            View appointments
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your profile
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {user.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="truncate font-medium text-slate-900 dark:text-white">
                {user.email}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Date of birth</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {formatDate(user.dateOfBirth) ?? "Not set"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardShell>
  );
}
