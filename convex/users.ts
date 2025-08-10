import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getOrCreateUser, getAuthenticatedUser, logAuditEvent } from "./auth";

/**
 * Get current user profile
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      const authUser = await getAuthenticatedUser(ctx);
      
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", authUser.clerkUserId))
        .first();

      if (!user) {
        return {
          clerkUserId: authUser.clerkUserId,
          email: authUser.email,
          name: authUser.name,
          avatar: authUser.avatar,
          isOnboarded: false,
          preferences: null
        };
      }

      return user;
    } catch {
      return null;
    }
  }
});

/**
 * Update user profile
 */
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    preferences: v.optional(v.object({
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      notifications: v.optional(v.object({
        expiration: v.boolean(),
        lowStock: v.boolean(),
        invitations: v.boolean(),
        activityFeed: v.boolean()
      }))
    }))
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();

    const updates: any = {
      updatedAt: now
    };

    if (args.name !== undefined) {
      updates.name = args.name?.trim();
    }

    if (args.preferences !== undefined) {
      updates.preferences = {
        ...user.preferences,
        ...args.preferences
      };
    }

    await ctx.db.patch(user._id, updates);

    // Log audit event
    await logAuditEvent(ctx, "update_profile", "user", {
      resourceId: user._id,
      oldValue: { name: user.name, preferences: user.preferences },
      newValue: updates,
      severity: "info"
    });

    return user._id;
  }
});

/**
 * Mark user as onboarded
 */
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);

    await ctx.db.patch(user._id, {
      isOnboarded: true,
      updatedAt: Date.now()
    });

    return user._id;
  }
});

/**
 * Update last seen timestamp
 */
export const updateLastSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();

    await ctx.db.patch(user._id, {
      lastSeenAt: now,
      updatedAt: now
    });

    return true;
  }
});

/**
 * Get user statistics
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await getAuthenticatedUser(ctx);

    // Get user's households
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", authUser.clerkUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get total inventory items added by user across all households
    const inventoryItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("addedBy", authUser.clerkUserId))
      .collect();

    // Get recent activity count (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentActivity = await ctx.db
      .query("activityFeed")
      .withIndex("by_user", (q) => q.eq("userId", authUser.clerkUserId))
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    // Get pending invitations
    const pendingInvitations = await ctx.db
      .query("householdInvitations")
      .withIndex("by_email", (q) => q.eq("invitedEmail", authUser.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Count households by role
    const roleCount = memberships.reduce((acc, membership) => {
      acc[membership.role] = (acc[membership.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      householdsCount: memberships.length,
      inventoryItemsCount: inventoryItems.length,
      recentActivityCount: recentActivity.length,
      pendingInvitationsCount: pendingInvitations.length,
      roleDistribution: roleCount,
      stats: {
        totalHouseholds: memberships.length,
        ownedHouseholds: roleCount.owner || 0,
        adminHouseholds: roleCount.admin || 0,
        memberHouseholds: roleCount.member || 0,
        viewerHouseholds: roleCount.viewer || 0
      }
    };
  }
});

/**
 * Search users by email (for invitations)
 */
export const searchUsersByEmail = query({
  args: { 
    query: v.string(),
    householdId: v.optional(v.id("households"))
  },
  handler: async (ctx, args) => {
    const authUser = await getAuthenticatedUser(ctx);
    
    // Only allow searching if user has invite permission for the household
    if (args.householdId) {
      const membership = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household_user", (q) => 
          q.eq("householdId", args.householdId).eq("userId", authUser.clerkUserId)
        )
        .first();

      if (!membership?.isActive || !membership.permissions.includes("invite")) {
        return [];
      }
    }

    const query = args.query.toLowerCase().trim();
    if (query.length < 3) {
      return [];
    }

    // Simple search - in a production app, you'd use a proper search index
    const users = await ctx.db
      .query("users")
      .filter((q) => q.or(
        q.eq(q.field("email"), query),
        // Note: Convex doesn't have built-in text search on email field
        // In production, you'd implement proper search functionality
      ))
      .take(10);

    // Filter out users who are already members of the household
    if (args.householdId) {
      const membershipPromises = users.map(user => 
        ctx.db
          .query("householdMemberships")
          .withIndex("by_household_user", (q) => 
            q.eq("householdId", args.householdId!).eq("userId", user.clerkUserId)
          )
          .first()
      );

      const memberships = await Promise.all(membershipPromises);
      
      return users
        .filter((_, index) => !memberships[index]?.isActive)
        .map(user => ({
          clerkUserId: user.clerkUserId,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }));
    }

    return users.map(user => ({
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }));
  }
});

/**
 * Delete user account (soft delete)
 */
export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);

    // Check if user owns any households
    const ownedHouseholds = await ctx.db
      .query("households")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.clerkUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (ownedHouseholds.length > 0) {
      throw new ConvexError("Cannot delete account while owning households. Transfer ownership or delete households first.");
    }

    // Deactivate all memberships
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, {
        isActive: false,
        updatedAt: Date.now()
      });

      // Update household member count
      const household = await ctx.db.get(membership.householdId);
      if (household) {
        await ctx.db.patch(membership.householdId, {
          memberCount: Math.max(0, household.memberCount - 1),
          updatedAt: Date.now()
        });
      }
    }

    // Cancel pending invitations
    const pendingInvitations = await ctx.db
      .query("householdInvitations")
      .withIndex("by_email", (q) => q.eq("invitedEmail", user.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const invitation of pendingInvitations) {
      await ctx.db.patch(invitation._id, {
        status: "cancelled",
        updatedAt: Date.now()
      });
    }

    // Note: In a real application, you would also need to handle Clerk user deletion
    // This is just marking the user as inactive in the local database

    // Log audit event
    await logAuditEvent(ctx, "delete_account", "user", {
      resourceId: user._id,
      severity: "critical"
    });

    return user._id;
  }
});