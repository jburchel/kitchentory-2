import { v } from "convex/values";

/**
 * Common validation patterns and reusable validators
 */

// Email validation
export const emailValidator = v.string();

// Household name validation (1-100 characters, trimmed)
export const householdNameValidator = v.string();

// Role validation
export const roleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer")
);

// Permission validation
export const permissionValidator = v.union(
  v.literal("read"),
  v.literal("write"),
  v.literal("delete"),
  v.literal("invite"),
  v.literal("manage_members"),
  v.literal("manage_settings")
);

// Permissions array validation
export const permissionsArrayValidator = v.array(permissionValidator);

// Household settings validation
export const householdSettingsValidator = v.object({
  currency: v.optional(v.string()),
  defaultUnit: v.optional(v.string()),
  expirationWarningDays: v.optional(v.number()),
  allowGuestView: v.optional(v.boolean())
});

// User preferences validation
export const userPreferencesValidator = v.object({
  language: v.optional(v.string()),
  timezone: v.optional(v.string()),
  notifications: v.optional(v.object({
    expiration: v.boolean(),
    lowStock: v.boolean(),
    invitations: v.boolean(),
    activityFeed: v.boolean()
  }))
});

// Activity type validation
export const activityTypeValidator = v.union(
  v.literal("item_added"),
  v.literal("item_updated"),
  v.literal("item_removed"),
  v.literal("item_consumed"),
  v.literal("expiration_warning"),
  v.literal("member_joined"),
  v.literal("member_left"),
  v.literal("invitation_sent"),
  v.literal("household_created"),
  v.literal("household_updated")
);

// Invitation status validation
export const invitationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("expired"),
  v.literal("cancelled")
);

// Audit severity validation
export const auditSeverityValidator = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("error"),
  v.literal("critical")
);

// Storage location type validation
export const storageTypeValidator = v.union(
  v.literal("pantry"),
  v.literal("fridge"),
  v.literal("freezer"),
  v.literal("cabinet"),
  v.literal("other")
);

/**
 * Validation helper functions
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
}

export function validateHouseholdName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

export function validateInviteCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function validateInviteToken(token: string): boolean {
  return /^[A-Za-z0-9]{32}$/.test(token);
}

export function sanitizeString(str: string, maxLength = 1000): string {
  return str.trim().slice(0, maxLength);
}

export function isValidTimestamp(timestamp: number): boolean {
  // Check if timestamp is reasonable (between 2020 and 2050)
  const minDate = new Date('2020-01-01').getTime();
  const maxDate = new Date('2050-01-01').getTime();
  return timestamp >= minDate && timestamp <= maxDate;
}

export function isValidRole(role: string): role is "owner" | "admin" | "member" | "viewer" {
  return ["owner", "admin", "member", "viewer"].includes(role);
}

export function isValidPermission(permission: string): boolean {
  return ["read", "write", "delete", "invite", "manage_members", "manage_settings"].includes(permission);
}

/**
 * Error messages for validation failures
 */
export const ValidationErrors = {
  INVALID_EMAIL: "Invalid email format",
  INVALID_HOUSEHOLD_NAME: "Household name must be between 1 and 100 characters",
  INVALID_ROLE: "Invalid role specified",
  INVALID_PERMISSION: "Invalid permission specified",
  INVALID_INVITE_CODE: "Invalid invite code format",
  INVALID_INVITE_TOKEN: "Invalid invite token format",
  STRING_TOO_LONG: "Text is too long",
  INVALID_TIMESTAMP: "Invalid timestamp",
  REQUIRED_FIELD_MISSING: "Required field is missing"
} as const;

/**
 * Comprehensive validation for household creation
 */
export function validateHouseholdCreation(args: {
  name: string;
  description?: string;
  settings?: any;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateHouseholdName(args.name)) {
    errors.push(ValidationErrors.INVALID_HOUSEHOLD_NAME);
  }

  if (args.description && args.description.length > 500) {
    errors.push("Description must be less than 500 characters");
  }

  if (args.settings) {
    if (args.settings.expirationWarningDays && 
        (args.settings.expirationWarningDays < 1 || args.settings.expirationWarningDays > 365)) {
      errors.push("Expiration warning days must be between 1 and 365");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validation for invitation creation
 */
export function validateInvitationCreation(args: {
  email: string;
  role: string;
  message?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateEmail(args.email)) {
    errors.push(ValidationErrors.INVALID_EMAIL);
  }

  if (!isValidRole(args.role)) {
    errors.push(ValidationErrors.INVALID_ROLE);
  }

  if (args.role === "owner") {
    errors.push("Cannot invite someone as owner");
  }

  if (args.message && args.message.length > 1000) {
    errors.push("Invitation message must be less than 1000 characters");
  }

  return { valid: errors.length === 0, errors };
}