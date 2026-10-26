"use server";

import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  doctorOnboardingSchema,
  fieldErrors,
  patientProfileSchema,
} from "@/lib/validation/auth";

export type OnboardingFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectTo?: string;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function patientProfileAction(
  _state: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const current = await getCurrentAccount();
  if (!current || current.record.kind !== "USER") redirect("/login");

  const parsed = patientProfileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    image: String(formData.get("image") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await prisma.user.update({
      where: { id: current.record.user.id },
      data: {
        name: parsed.data.name,
        dateOfBirth: parsed.data.dateOfBirth
          ? new Date(`${parsed.data.dateOfBirth}T00:00:00.000Z`)
          : null,
        gender: parsed.data.gender || null,
        image: parsed.data.image || null,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[onboarding] patient profile failed", error);
    return { error: "Could not save your profile. Please try again." };
  }

  return {
    redirectTo: `/api/auth/reissue?next=${encodeURIComponent("/dashboard?completed=1")}`,
  };
}

export async function doctorOnboardingAction(
  _state: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const current = await getCurrentAccount();
  if (!current || current.record.kind !== "DOCTOR") redirect("/login");

  const parsed = doctorOnboardingSchema.safeParse({
    licenseNumber: String(formData.get("licenseNumber") ?? ""),
    specialization: String(formData.get("specialization") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await prisma.doctor.update({
      where: { id: current.record.doctor.id },
      data: {
        licenseNumber: parsed.data.licenseNumber,
        specialization: parsed.data.specialization,
        experience: parsed.data.experience,
        phone: parsed.data.phone || null,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: {
          licenseNumber: "This license number is already registered",
        },
      };
    }

    console.error("[onboarding] doctor profile failed", error);
    return { error: "Could not save your profile. Please try again." };
  }

  return {
    redirectTo: `/api/auth/reissue?next=${encodeURIComponent("/doctor/dashboard?completed=1")}`,
  };
}
