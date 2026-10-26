import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireAdmin } from "@/lib/dal";

export const instant = false;

export const metadata = {
  title: "Admin Dashboard | DacSahab",
};

export default async function AdminDashboardPage() {
  const current = await requireAdmin();

  const name =
    current.record.kind === "USER"
      ? current.record.user.name
      : current.record.doctor.name;
  const email =
    current.record.kind === "USER"
      ? current.record.user.email
      : current.record.doctor.email;

  return (
    <DashboardShell name={name} email={email} roleLabel="Admin">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Admin dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Verification and platform management tools will appear here.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Doctor verification queue
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No pending applications in this build. The data model and
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
            verified
          </code>
          flag are ready for the approval screen.
        </p>
      </div>
    </DashboardShell>
  );
}
