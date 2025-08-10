import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { 
  requireHouseholdPermission,
  isHouseholdOwner,
  getPermissionsForRole,
  logAuditEvent,
  getAuthenticatedUser,
  Role
} from "./auth";

/**
 * Get household members
 */
export const getHouseholdMembers = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "read");

    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", membership.userId))
          .first();

        return {
          membershipId: membership._id,
          userId: membership.userId,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar,
          role: membership.role,
          permissions: membership.permissions,
          joinedAt: membership.joinedAt,
          invitedBy: membership.invitedBy,
          lastActiveAt: membership.lastActiveAt,
          isActive: membership.isActive
        };
      })
    );

    return members;
  }
});

/**
 * Update member role and permissions
 */
export const updateMemberRole = mutation({
  args: {
    householdId: v.id("households"),
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    customPermissions: v.optional(v.array(v.union(
      v.literal("read"),
      v.literal("write"),
      v.literal("delete"),
      v.literal("invite"),
      v.literal("manage_members")
    )))
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "manage_members");
    const currentUser = await getAuthenticatedUser(ctx);

    // Can't change owner role
    if (await isHouseholdOwner(ctx, args.householdId, args.userId)) {
      throw new ConvexError("Cannot change household owner role");
    }

    // Non-owners can't promote to admin unless they are admin themselves
    if (args.role === "admin" && !await isHouseholdOwner(ctx, args.householdId)) {
      const currentUserRole = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household_user", (q) => 
          q.eq("householdId", args.householdId).eq("userId", currentUser.clerkUserId)
        )
        .first();
      
      if (currentUserRole?.role !== "admin") {
        throw new ConvexError("Only admins can promote members to admin role");
      }
    }

    // Find membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", args.userId)
      )
      .first();

    if (!membership || !membership.isActive) {
      throw new ConvexError("Member not found or inactive");
    }

    const oldRole = membership.role;
    const permissions = args.customPermissions || getPermissionsForRole(args.role);

    await ctx.db.patch(membership._id, {
      role: args.role,
      permissions,
      updatedAt: Date.now()
    });

    // Get user for activity log
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
      .first();

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId: args.householdId,
      userId: currentUser.clerkUserId,
      type: "member_updated" as any,
      itemName: "Member Role Updated",
      details: `${user?.name || user?.email || args.userId} role changed from ${oldRole} to ${args.role}`,
      metadata: {
        memberName: user?.name,
        memberEmail: user?.email
      },
      isRead: false,
      createdAt: Date.now()
    });

    // Log audit event
    await logAuditEvent(ctx, "update_member_role", "household_membership", {
      householdId: args.householdId,
      resourceId: membership._id,
      oldValue: { role: oldRole, permissions: membership.permissions },
      newValue: { role: args.role, permissions },
      severity: "info"
    });

    return membership._id;
  }
});

/**
 * Remove member from household
 */
export const removeMember = mutation({
  args: {
    householdId: v.id("households"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "manage_members");
    const currentUser = await getAuthenticatedUser(ctx);

    // Can't remove household owner
    if (await isHouseholdOwner(ctx, args.householdId, args.userId)) {
      throw new ConvexError("Cannot remove household owner");
    }

    // Can't remove yourself using this method
    if (args.userId === currentUser.clerkUserId) {
      throw new ConvexError("Use leaveHousehold to remove yourself");
    }

    // Find membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", args.userId)
      )
      .first();

    if (!membership || !membership.isActive) {
      throw new ConvexError("Member not found or already inactive");
    }

    const now = Date.now();

    // Deactivate membership
    await ctx.db.patch(membership._id, {
      isActive: false,
      updatedAt: now
    });

    // Update household member count
    const household = await ctx.db.get(args.householdId);
    if (household) {
      await ctx.db.patch(args.householdId, {
        memberCount: Math.max(0, household.memberCount - 1),
        updatedAt: now
      });
    }

    // Get user for activity log
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
      .first();

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId: args.householdId,
      userId: currentUser.clerkUserId,
      type: "member_left",
      itemName: household?.name || "Household",
      details: `${user?.name || user?.email || args.userId} was removed from the household`,
      metadata: {
        memberName: user?.name,
        memberEmail: user?.email
      },
      isRead: false,
      createdAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "remove_member", "household_membership", {
      householdId: args.householdId,
      resourceId: membership._id,
      oldValue: membership,
      severity: "warning"
    });

    return membership._id;
  }
});

/**
 * Transfer household ownership
 */
export const transferOwnership = mutation({
  args: {
    householdId: v.id("households"),
    newOwnerId: v.string()
  },
  handler: async (ctx, args) => {
    // Only current owner can transfer ownership
    if (!await isHouseholdOwner(ctx, args.householdId)) {
      throw new ConvexError("Only household owner can transfer ownership");
    }

    const currentUser = await getAuthenticatedUser(ctx);

    // Can't transfer to yourself
    if (args.newOwnerId === currentUser.clerkUserId) {
      throw new ConvexError("Cannot transfer ownership to yourself");
    }

    // Check if new owner is a member
    const newOwnerMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", args.newOwnerId)
      )
      .first();

    if (!newOwnerMembership || !newOwnerMembership.isActive) {
      throw new ConvexError("New owner must be an active member of the household");
    }

    // Get current owner membership
    const currentOwnerMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", currentUser.clerkUserId)
      )
      .first();

    if (!currentOwnerMembership) {
      throw new ConvexError("Current owner membership not found");
    }

    const now = Date.now();

    // Update household owner
    await ctx.db.patch(args.householdId, {
      ownerId: args.newOwnerId,
      updatedAt: now
    });

    // Update new owner's role
    await ctx.db.patch(newOwnerMembership._id, {
      role: "owner",
      permissions: getPermissionsForRole("owner"),
      updatedAt: now
    });

    // Update old owner's role to admin
    await ctx.db.patch(currentOwnerMembership._id, {
      role: "admin",
      permissions: getPermissionsForRole("admin"),
      updatedAt: now
    });

    // Get users for activity log
    const newOwnerUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.newOwnerId))
      .first();

    const household = await ctx.db.get(args.householdId);

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId: args.householdId,
      userId: currentUser.clerkUserId,
      type: "household_updated",
      itemName: household?.name || "Household",
      details: `Ownership transferred to ${newOwnerUser?.name || newOwnerUser?.email || args.newOwnerId}`,
      metadata: {
        memberName: newOwnerUser?.name,
        memberEmail: newOwnerUser?.email
      },
      isRead: false,
      createdAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "transfer_ownership", "household", {
      householdId: args.householdId,
      resourceId: args.householdId,
      oldValue: { ownerId: currentUser.clerkUserId },
      newValue: { ownerId: args.newOwnerId },
      severity: "warning"
    });

    return args.householdId;
  }
});

/**
 * Get member activity summary
 */
export const getMemberActivity = query({
  args: {
    householdId: v.id("households"),
    userId: v.optional(v.string()),
    days: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "read");
    const currentUser = await getAuthenticatedUser(ctx);
    
    const targetUserId = args.userId || currentUser.clerkUserId;
    const daysAgo = (args.days || 30) * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - daysAgo;

    // Get recent activity
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.and(
        q.eq(q.field("userId"), targetUserId),
        q.gte(q.field("createdAt"), cutoffTime)
      ))
      .collect();

    // Count by type
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get inventory items added by user in the time period
    const inventoryItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.and(
        q.eq(q.field("addedBy"), targetUserId),
        q.gte(q.field("createdAt"), cutoffTime)
      ))
      .collect();

    return {
      userId: targetUserId,
      period: {
        days: args.days || 30,
        startTime: cutoffTime,
        endTime: Date.now()
      },
      activityCounts,
      totalActivities: activities.length,
      itemsAdded: inventoryItems.length,
      recentActivities: activities
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
    };
  }
});

/**
 * Update member's last active time
 */
export const updateLastActive = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", currentUser.clerkUserId)
      )
      .first();

    if (membership && membership.isActive) {
      await ctx.db.patch(membership._id, {
        lastActiveAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    return true;
  }
});