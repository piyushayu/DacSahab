"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  type = "button",
  onClick,
  isLoading = false,
  disabled = false,
}: GoogleAuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
    >
      <FcGoogle className="w-5 h-5 flex-shrink-0" />
      <span>{isLoading ? "Connecting…" : label}</span>
    </button>
  );
}
