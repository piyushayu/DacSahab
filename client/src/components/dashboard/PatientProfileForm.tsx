"use client";

import React, { useActionState, useEffect } from "react";

import {
  patientProfileAction,
  type OnboardingFormState,
} from "@/app/actions/onboarding";

interface PatientProfileFormProps {
  defaultName: string;
  defaultDateOfBirth?: string;
  defaultGender?: string | null;
  defaultImage?: string | null;
}

const initialState: OnboardingFormState = {};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export function PatientProfileForm({
  defaultName,
  defaultDateOfBirth,
  defaultGender,
  defaultImage,
}: PatientProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    patientProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
          Step 1 of 1
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Complete your profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add a few details before you can book appointments and use the rest of
          DacSahab.
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
            htmlFor="profile-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Full name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            className={inputClass}
          />
          {state.fieldErrors?.name ? (
            <p className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-dob"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Date of birth
            </label>
            <input
              id="profile-dob"
              name="dateOfBirth"
              type="date"
              defaultValue={defaultDateOfBirth}
              className={inputClass}
            />
            {state.fieldErrors?.dateOfBirth ? (
              <p className="mt-1.5 text-xs text-red-600">
                {state.fieldErrors.dateOfBirth}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="profile-gender"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Gender
            </label>
            <select
              id="profile-gender"
              name="gender"
              defaultValue={defaultGender ?? ""}
              className={inputClass}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {state.fieldErrors?.gender ? (
              <p className="mt-1.5 text-xs text-red-600">
                {state.fieldErrors.gender}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-image"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Profile photo URL <span className="font-normal">(optional)</span>
          </label>
          <input
            id="profile-image"
            name="image"
            type="url"
            defaultValue={defaultImage ?? ""}
            placeholder="https://example.com/photo.jpg"
            className={inputClass}
          />
          {state.fieldErrors?.image ? (
            <p className="mt-1.5 text-xs text-red-600">
              {state.fieldErrors.image}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile and continue"}
        </button>
      </form>
    </section>
  );
}
