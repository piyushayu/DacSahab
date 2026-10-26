"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";

import { googleStartAction, signupAction } from "@/app/actions/auth";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { RoleSelector, type AuthRole } from "./RoleSelector";

interface SignupFormProps {
  initialRole?: AuthRole;
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

export function SignupForm({ initialRole = "user" }: SignupFormProps) {
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create an Account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {role === "doctor"
            ? "Create your doctor account now — add your license and specialization after you sign in."
            : "Register to consult with trusted healthcare doctors online."}
        </p>
      </div>

      <RoleSelector selectedRole={role} onSelectRole={setRole} />

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="role" value={role} />

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
            htmlFor="signup-name"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            {role === "doctor" ? "Doctor's Full Name" : "Full Name"}
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={
              state.fieldErrors?.name ? "signup-name-error" : undefined
            }
            placeholder={role === "doctor" ? "Dr. Rajesh Sharma" : "Piyush Kumar"}
            className={fieldClass(Boolean(state.fieldErrors?.name))}
          />
          {state.fieldErrors?.name ? (
            <p id="signup-name-error" className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "signup-email-error" : undefined
            }
            placeholder="you@example.com"
            className={fieldClass(Boolean(state.fieldErrors?.email))}
          />
          {state.fieldErrors?.email ? (
            <p id="signup-email-error" className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "signup-password-error" : undefined
            }
            placeholder="At least 8 characters"
            className={fieldClass(Boolean(state.fieldErrors?.password))}
          />
          {state.fieldErrors?.password ? (
            <p id="signup-password-error" className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.password}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Use at least 8 characters with a letter and a number.
            </p>
          )}
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              name="terms"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I agree to the{" "}
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {state.fieldErrors?.terms ? (
            <p className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.terms}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] shadow-md shadow-teal-600/20 transition-all cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending
            ? "Creating account…"
            : role === "doctor"
              ? "Create Doctor Account"
              : "Create Patient Account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs uppercase font-medium text-slate-400">OR</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <form action={googleStartAction}>
        <input type="hidden" name="role" value={role} />
        <GoogleAuthButton
          type="submit"
          label={
            role === "doctor"
              ? "Sign up with Doctor Google Account"
              : "Sign up with Google"
          }
        />
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href={`/login?role=${role}`}
          className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
