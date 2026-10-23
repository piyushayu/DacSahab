"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  subtitle: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Medical Branding & Doctor Image */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white overflow-hidden">
          {/* Subtle glow / backdrop pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Logo / Title */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-500/30">
                +
              </span>
              <span className="text-2xl font-bold tracking-tight text-white">
                Dac<span className="text-teal-400">Sahab</span>
              </span>
            </Link>
            <p className="mt-2 text-xs text-teal-200/80 uppercase tracking-widest font-semibold">
              Medical Consultations & Care
            </p>
          </div>

          {/* Middle Generated Image */}
          <div className="relative z-10 my-4 rounded-2xl overflow-hidden border border-teal-500/20 shadow-xl group">
            <Image
              src="/dacsahab_banner.jpg"
              alt="DacSahab Doctor Consultation"
              width={600}
              height={450}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-medium text-teal-200">
                ⭐ Trusted by 10,000+ verified doctors and patients
              </span>
            </div>
          </div>

          {/* Bottom Testimonial / Tagline */}
          <div className="relative z-10 text-xs text-slate-300 border-t border-white/10 pt-4">
            <p className="italic">
              &quot;Immediate access to top specialists and virtual consultations anywhere, anytime.&quot;
            </p>
            <p className="mt-1 font-semibold text-teal-300">24/7 Digital Health Support</p>
          </div>
        </div>

        {/* Right Side: Auth Form / Skeleton */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-slate-900">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                  +
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Dac<span className="text-teal-600 dark:text-teal-400">Sahab</span>
                </span>
              </Link>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
