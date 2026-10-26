import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email is too long");

const name = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const signupSchema = z.object({
  name,
  email,
  password,
  role: z.enum(["user", "doctor"]),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72),
});

export const patientProfileSchema = z.object({
  name,
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  image: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
});

export const doctorOnboardingSchema = z.object({
  licenseNumber: z
    .string()
    .trim()
    .min(3, "License number is required")
    .max(60, "License number is too long"),
  specialization: z
    .string()
    .trim()
    .min(2, "Specialization is required")
    .max(80, "Specialization is too long"),
  experience: z.coerce
    .number()
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(70, "Experience is too high"),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }

  return result;
}
