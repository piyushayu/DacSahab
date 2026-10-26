import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardShellProps {
  name: string;
  email: string;
  roleLabel: string;
  badge?: string;
  children: ReactNode;
}

export function DashboardShell({
  name,
  email,
  roleLabel,
  badge,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white shadow-md shadow-teal-600/20">
              +
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dac<span className="text-teal-600 dark:text-teal-400">Sahab</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {email}
              </p>
            </div>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300">
              {roleLabel}
            </span>

            {badge ? (
              <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300 sm:inline">
                {badge}
              </span>
            ) : null}

            <form action="/api/auth/logout" method="post">
              <input type="hidden" name="redirect" value="/login" />
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
