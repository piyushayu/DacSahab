"use client";

import React from "react";
import { User, Stethoscope } from "lucide-react";

export type AuthRole = "user" | "doctor";

interface RoleSelectorProps {
  selectedRole: AuthRole;
  onSelectRole: (role: AuthRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="w-full mb-6">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        I am logging in as:
      </label>
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onSelectRole("user")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            selectedRole === "user"
              ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient / User</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole("doctor")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            selectedRole === "doctor"
              ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor</span>
        </button>
      </div>
    </div>
  );
}
