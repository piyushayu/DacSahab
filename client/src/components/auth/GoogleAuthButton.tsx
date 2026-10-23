"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  onClick,
  isLoading = false,
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60 text-sm"
    >
      <FcGoogle className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}
