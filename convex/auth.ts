import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// Permission types
export type Permission = 
  | "read" 
  | "write" 
  | "delete" 
  | "invite" 
  | "manage_members" 
  | "manage_settings";

export type Role = "owner" | "admin" | "member" | "viewer";

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ["read", "write", "delete", "invite", "manage_members", "manage_settings"],
  admin: ["read", "write", "delete", "invite", "manage_members"],
  member: ["read", "write"],
  viewer: ["read"]
};

/**
 * Get authenticated user from Clerk
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  return {
    clerkId: identity.subject,
    email: identity.email!,
    name: identity.name,
    avatar: identity.pictureUrl
  };
}

/**
 * Get or create user in database
 */
export async function getOrCreateUser(ctx: MutationCtx) {
  const authUser = await getAuthenticatedUser(ctx);
  
  // Try to find existing user
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", authUser.clerkId))
    .first();

  // Create user if doesn't exist
  if (!user) {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: authUser.clerkId,
      email: authUser.email,
      name: authUser.name,
      avatar: authUser.avatar,
      isOnboarded: false,
      createdAt: now,
      updatedAt: now
    });
    
    user = await ctx.db.get(userId);
  }

  return user!;
}

/**
 * Check if user has specific permission for a household
 */
export async function checkHouseholdPermission(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  permission: Permission
): Promise<boolean> {
  try {
    const authUser = await getAuthenticatedUser(ctx);
    
    // Check household membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", householdId).eq("userId", authUser.clerkId)
      )
      .first();

    if (!membership || !membership.isActive) {
      return false;
    }

    // Check if user has the specific permission
    return membership.permissions.includes(permission);
  } catch {
    return false;
  }
}

/**
 * Require specific permission for household (throws if not authorized)
 */
export async function requireHouseholdPermission(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  permission: Permission
): Promise<void> {
  const hasPermission = await checkHouseholdPermission(ctx, householdId, permission);
  
  if (!hasPermission) {
    throw new ConvexError(`Permission denied: ${permission} not allowed for this household`);
  }
}

/**
 * Get user's role in a household
 */
export async function getUserHouseholdRole(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  userId?: string
): Promise<Role | null> {
  const targetUserId = userId || (await getAuthenticatedUser(ctx)).clerkId;
  
  const membership = await ctx.db
    .query("householdMemberships")
    .withIndex("by_household_user", (q) => 
      q.eq("householdId", householdId).eq("userId", targetUserId)
    )
    .first();

  return membership?.isActive ? membership.role : null;
}

/**
 * Get user's households
 */
export async function getUserHouseholds(
  ctx: QueryCtx | MutationCtx,
  userId?: string
) {
  const targetUserId = userId || (await getAuthenticatedUser(ctx)).clerkId;
  
  const memberships = await ctx.db
    .query("householdMemberships")
    .withIndex("by_user", (q) => q.eq("userId", targetUserId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  const households = await Promise.all(
    memberships.map(async (membership) => {
      const household = await ctx.db.get(membership.householdId);
      return household ? {
        ...household,
        role: membership.role,
        permissions: membership.permissions,
        joinedAt: membership.joinedAt
      } : null;
    })
  );

  return households.filter(Boolean);
}

/**
 * Check if user is household owner
 */
export async function isHouseholdOwner(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  userId?: string
): Promise<boolean> {
  const targetUserId = userId || (await getAuthenticatedUser(ctx)).clerkId;
  
  const household = await ctx.db.get(householdId);
  return household?.ownerId === targetUserId;
}

/**
 * Validate and get permissions for role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/**
 * Generate secure invite token
 */
export function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate short invite code for household
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  ctx: MutationCtx,
  action: string,
  resource: string,
  details?: {
    householdId?: Id<"households">;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    severity?: "info" | "warning" | "error" | "critical";
  }
) {
  try {
    const authUser = await getAuthenticatedUser(ctx);
    
    await ctx.db.insert("auditLog", {
      householdId: details?.householdId,
      userId: authUser.clerkId,
      action,
      resource,
      resourceId: details?.resourceId,
      details: details ? {
        oldValue: details.oldValue,
        newValue: details.newValue
      } : undefined,
      severity: details?.severity || "info",
      createdAt: Date.now()
    });
  } catch (error) {
    // Don't throw on audit log failures
    console.error("Failed to log audit event:", error);
  }
}