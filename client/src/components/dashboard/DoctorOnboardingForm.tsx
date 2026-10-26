"use client";

import React, { useActionState, useEffect } from "react";

import {
  doctorOnboardingAction,
  type OnboardingFormState,
} from "@/app/actions/onboarding";

const initialState: OnboardingFormState = {};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export function DoctorOnboardingForm() {
  const [state, formAction, pending] = useActionState(
    doctorOnboardingAction,
    initialState,
  );

  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          Doctor onboarding
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Add your professional details
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your dashboard is locked until these details are saved. An admin will
          verify your license before your profile goes live to patients.
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        noValidate
      >
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
            htmlFor="doctor-license"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Medical license number
          </label>
          <input
            id="doctor-license"
            name="licenseNumber"
            type="text"
            required
            placeholder="e.g. MCI-123456"
            className={inputClass}
          />
          {state.fieldErrors?.licenseNumber ? (
            <p className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.licenseNumber}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="doctor-specialization"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Specialization
          </label>
          <input
            id="doctor-specialization"
            name="specialization"
            type="text"
            required
            placeholder="e.g. Cardiology"
            className={inputClass}
          />
          {state.fieldErrors?.specialization ? (
            <p className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.specialization}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="doctor-experience"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Years of experience
            </label>
            <input
              id="doctor-experience"
              name="experience"
              type="number"
              min={0}
              max={70}
              required
              placeholder="8"
              className={inputClass}
            />
            {state.fieldErrors?.experience ? (
              <p className="mt-1.5 text-xs text-red-600">
                {state.fieldErrors.experience}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="doctor-phone"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Phone <span className="font-normal">(optional)</span>
            </label>
            <input
              id="doctor-phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              className={inputClass}
            />
            {state.fieldErrors?.phone ? (
              <p className="mt-1.5 text-xs text-red-600">
                {state.fieldErrors.phone}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save details and open dashboard"}
        </button>
      </form>
    </section>
  );
}
