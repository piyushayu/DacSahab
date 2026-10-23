"use client";

import React from "react";

interface AuthSkeletonProps {
  fieldsCount?: number;
}

export function AuthSkeleton({ fieldsCount = 2 }: AuthSkeletonProps) {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Title & subtitle skeleton */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto sm:mx-0"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mx-auto sm:mx-0"></div>
      </div>

      {/* Role switch skeleton */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>

      {/* Input fields skeleton */}
      <div className="space-y-4">
        {Array.from({ length: fieldsCount }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"></div>
          </div>
        ))}
      </div>

      {/* Submit button skeleton */}
      <div className="h-12 bg-teal-600/40 dark:bg-teal-500/30 rounded-xl"></div>

      {/* Divider skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8"></div>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
      </div>

      {/* Google OAuth button skeleton */}
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"></div>
    </div>
  );
}
