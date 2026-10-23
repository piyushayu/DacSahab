"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RoleSelector, AuthRole } from "./RoleSelector";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function SignupForm() {
  const [role, setRole] = useState<AuthRole>("user");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create an Account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {role === "doctor"
            ? "Join DacSahab as a verified medical consultant."
            : "Register to consult with trusted healthcare doctors online."}
        </p>
      </div>

      {/* Role Selector: User vs Doctor */}
      <RoleSelector selectedRole={role} onSelectRole={setRole} />

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* Common Name Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {role === "doctor" ? "Doctor's Full Name (with Dr. prefix)" : "Full Name"}
          </label>
          <input
            type="text"
            placeholder={role === "doctor" ? "Dr. Rajesh Sharma" : "Piyush Kumar"}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
          />
        </div>



        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] shadow-md shadow-teal-600/20 transition-all cursor-pointer text-sm"
        >
          {role === "doctor" ? "Register Doctor Account" : "Create Patient Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        <span className="text-xs uppercase font-medium text-slate-400">OR</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
      </div>

      {/* Option 2: Google OAuth */}
      <GoogleAuthButton
        label={role === "doctor" ? "Sign up with Doctor Google Account" : "Sign up with Google"}
        onClick={() => {}}
      />

      {/* Footer Navigation */}
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
