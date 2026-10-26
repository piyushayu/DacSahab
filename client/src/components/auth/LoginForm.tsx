"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";

import { googleStartAction, loginAction } from "@/app/actions/auth";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { RoleSelector, type AuthRole } from "./RoleSelector";

interface LoginFormProps {
  initialRole?: AuthRole;
  notice?: string;
  next?: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm";

function fieldClass(hasError: boolean): string {
  return `${inputClass} ${
    hasError
      ? "border-red-400 dark:border-red-500"
      : "border-slate-300 dark:border-slate-700"
  }`;
}

export function LoginForm({ initialRole = "user", notice, next }: LoginFormProps) {
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {role === "doctor"
            ? "Doctor Portal: log in to manage your appointments and consultations."
            : "Sign in to connect with certified doctors and medical consultants."}
        </p>
      </div>

      {notice ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
        >
          {notice}
        </div>
      ) : null}

      <RoleSelector selectedRole={role} onSelectRole={setRole} />

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="next" value={next ?? ""} />

        {state.error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {state.error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            {role === "doctor" ? "Doctor Registered Email" : "Email Address"}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "login-email-error" : undefined
            }
            placeholder={
              role === "doctor" ? "doctor@hospital.org" : "you@example.com"
            }
            className={fieldClass(Boolean(state.fieldErrors?.email))}
          />
          {state.fieldErrors?.email ? (
            <p id="login-email-error" className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Password
            </label>
            <a
              href="#"
              onClick={(event) => event.preventDefault()}
              className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "login-password-error" : undefined
            }
            placeholder="••••••••"
            className={fieldClass(Boolean(state.fieldErrors?.password))}
          />
          {state.fieldErrors?.password ? (
            <p id="login-password-error" className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] shadow-md shadow-teal-600/20 transition-all cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs uppercase font-medium text-slate-400">OR</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <form action={googleStartAction}>
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="next" value={next ?? ""} />
        <GoogleAuthButton
          type="submit"
          label={role === "doctor" ? "Login with Google" : "Continue with Google"}
        />
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/signup?role=${role}`}
          className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
