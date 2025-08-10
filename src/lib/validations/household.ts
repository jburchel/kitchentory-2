import { z } from "zod";

/**
 * Validation schemas for household creation and management
 */

// Basic validation rules
const householdNameRule = z
  .string()
  .min(1, "Household name is required")
  .max(100, "Household name must be less than 100 characters")
  .transform((val) => val.trim());

const householdDescriptionRule = z
  .string()
  .max(500, "Description must be less than 500 characters")
  .transform((val) => val.trim())
  .optional();

const userNameRule = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be less than 50 characters")
  .transform((val) => val.trim());

const emailRule = z
  .string()
  .email("Please enter a valid email address")
  .transform((val) => val.toLowerCase().trim());

// Household type validation
export const householdTypeSchema = z.enum(["single", "family", "shared"], {
  errorMap: () => ({ message: "Please select a household type" }),
});

// User profile schema for onboarding
export const userProfileSchema = z.object({
  firstName: userNameRule,
  lastName: userNameRule,
});

// Household creation schema
export const householdCreationSchema = z.object({
  name: householdNameRule,
  description: householdDescriptionRule,
  type: householdTypeSchema,
  settings: z
    .object({
      currency: z.string().default("USD"),
      defaultUnit: z.string().default("pieces"),
      expirationWarningDays: z
        .number()
        .min(1, "Warning days must be at least 1")
        .max(365, "Warning days must be at most 365")
        .default(7),
      allowGuestView: z.boolean().default(false),
    })
    .optional(),
});

// Member invitation schema
export const memberInvitationSchema = z.object({
  email: emailRule,
  role: z.enum(["admin", "member", "viewer"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .transform((val) => val.trim())
    .optional(),
});

// Complete onboarding schema
export const onboardingSchema = z.object({
  profile: userProfileSchema,
  household: householdCreationSchema,
  invitations: z.array(memberInvitationSchema).optional(),
});

// Step-specific schemas for validation
export const stepSchemas = {
  profile: userProfileSchema,
  household: householdCreationSchema.omit({ settings: true }),
  settings: z.object({
    settings: householdCreationSchema.shape.settings,
  }),
  invitations: z.object({
    invitations: z.array(memberInvitationSchema).optional(),
  }),
};

// Type exports
export type HouseholdType = z.infer<typeof householdTypeSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type HouseholdCreation = z.infer<typeof householdCreationSchema>;
export type MemberInvitation = z.infer<typeof memberInvitationSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

// Validation utility functions
export function validateStep<T extends keyof typeof stepSchemas>(
  step: T,
  data: unknown
): { success: true; data: z.infer<typeof stepSchemas[T]> } | { success: false; errors: z.ZodError } {
  try {
    const result = stepSchemas[step].parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Error formatting utilities
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
}

export function getFieldError(errors: z.ZodError, fieldPath: string): string | undefined {
  const error = errors.errors.find((err) => err.path.join('.') === fieldPath);
  return error?.message;
}
