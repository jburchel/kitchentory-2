import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { 
  getOrCreateUser,
  requireHouseholdPermission,
  getUserHouseholds,
  isHouseholdOwner,
  getPermissionsForRole,
  generateInviteCode,
  logAuditEvent,
  getAuthenticatedUser
} from "./auth";

// Household CRUD Operations

/**
 * Create a new household
 */
export const createHousehold = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(v.object({
      currency: v.optional(v.string()),
      defaultUnit: v.optional(v.string()),
      expirationWarningDays: v.optional(v.number()),
      allowGuestView: v.optional(v.boolean())
    }))
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();

    // Create household
    const householdData: any = {
      name: args.name.trim(),
      ownerId: user.clerkId,
      settings: args.settings || {
        currency: "USD",
        defaultUnit: "pieces",
        expirationWarningDays: 7,
        allowGuestView: false
      },
      isActive: true,
      memberCount: 1,
      inviteCode: generateInviteCode(),
      inviteCodeExpiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: now,
      updatedAt: now
    };
    
    // Only add optional fields if they have values
    const trimmedDescription = args.description?.trim();
    if (trimmedDescription) {
      householdData.description = trimmedDescription;
    }
    
    const householdId = await ctx.db.insert("households", householdData);

    // Create owner membership
    await ctx.db.insert("householdMemberships", {
      householdId,
      userId: user.clerkId,
      role: "owner",
      permissions: getPermissionsForRole("owner"),
      joinedAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId,
      userId: user.clerkId,
      type: "household_created",
      itemName: args.name,
      details: "Household created",
      isRead: false,
      createdAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "create", "household", {
      householdId,
      resourceId: householdId,
      newValue: args,
      severity: "info"
    });

    return householdId;
  }
});

/**
 * Get household details
 */
export const getHousehold = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "read");
    
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new ConvexError("Household not found");
    }

    // Get members
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", membership.userId))
          .first();
        
        return {
          userId: membership.userId,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar,
          role: membership.role,
          permissions: membership.permissions,
          joinedAt: membership.joinedAt,
          lastActiveAt: membership.lastActiveAt
        };
      })
    );

    return {
      ...household,
      members
    };
  }
});

/**
 * Get user's households
 */
export const getUserHouseholdsList = query({
  args: {},
  handler: async (ctx) => {
    return await getUserHouseholds(ctx);
  }
});

/**
 * Update household
 */
export const updateHousehold = mutation({
  args: {
    householdId: v.id("households"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(v.object({
      currency: v.optional(v.string()),
      defaultUnit: v.optional(v.string()),
      expirationWarningDays: v.optional(v.number()),
      allowGuestView: v.optional(v.boolean())
    }))
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "manage_settings");
    
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new ConvexError("Household not found");
    }

    const updates: any = {
      updatedAt: Date.now()
    };

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description?.trim();
    }
    if (args.settings !== undefined) {
      updates.settings = { ...household.settings, ...args.settings };
    }

    await ctx.db.patch(args.householdId, updates);

    // Log activity
    const user = await getAuthenticatedUser(ctx);
    await ctx.db.insert("activityFeed", {
      householdId: args.householdId,
      userId: user.clerkId,
      type: "household_updated",
      itemName: household.name,
      details: "Household settings updated",
      isRead: false,
      createdAt: Date.now()
    });

    // Log audit event
    await logAuditEvent(ctx, "update", "household", {
      householdId: args.householdId,
      resourceId: args.householdId,
      oldValue: household,
      newValue: updates,
      severity: "info"
    });

    return args.householdId;
  }
});

/**
 * Delete/deactivate household
 */
export const deleteHousehold = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    // Only owner can delete household
    if (!await isHouseholdOwner(ctx, args.householdId)) {
      throw new ConvexError("Only household owner can delete the household");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new ConvexError("Household not found");
    }

    // Soft delete by marking as inactive
    await ctx.db.patch(args.householdId, {
      isActive: false,
      updatedAt: Date.now()
    });

    // Deactivate all memberships
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, {
        isActive: false,
        updatedAt: Date.now()
      });
    }

    // Log audit event
    await logAuditEvent(ctx, "delete", "household", {
      householdId: args.householdId,
      resourceId: args.householdId,
      oldValue: household,
      severity: "warning"
    });

    return args.householdId;
  }
});

/**
 * Regenerate invite code
 */
export const regenerateInviteCode = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "invite");

    const now = Date.now();
    const newInviteCode = generateInviteCode();

    await ctx.db.patch(args.householdId, {
      inviteCode: newInviteCode,
      inviteCodeExpiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days
      updatedAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "regenerate_invite_code", "household", {
      householdId: args.householdId,
      resourceId: args.householdId,
      severity: "info"
    });

    return newInviteCode;
  }
});

/**
 * Join household via invite code
 */
export const joinHouseholdByCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    
    // Find household by invite code
    const household = await ctx.db
      .query("households")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!household) {
      throw new ConvexError("Invalid or expired invite code");
    }

    // Check if invite code is expired
    if (household.inviteCodeExpiresAt && household.inviteCodeExpiresAt < Date.now()) {
      throw new ConvexError("Invite code has expired");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", household._id).eq("userId", user.clerkId)
      )
      .first();

    if (existingMembership?.isActive) {
      throw new ConvexError("You are already a member of this household");
    }

    const now = Date.now();

    // Create or reactivate membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        isActive: true,
        joinedAt: now,
        updatedAt: now
      });
    } else {
      await ctx.db.insert("householdMemberships", {
        householdId: household._id,
        userId: user.clerkId,
        role: "member",
        permissions: getPermissionsForRole("member"),
        joinedAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
    }

    // Update household member count
    await ctx.db.patch(household._id, {
      memberCount: household.memberCount + 1,
      updatedAt: now
    });

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId: household._id,
      userId: user.clerkId,
      type: "member_joined",
      itemName: household.name,
      details: `${user.name || user.email} joined the household`,
      metadata: {
        memberName: user.name,
        memberEmail: user.email
      },
      isRead: false,
      createdAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "join_household", "household_membership", {
      householdId: household._id,
      severity: "info"
    });

    return household._id;
  }
});

/**
 * Leave household
 */
export const leaveHousehold = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

    // Check if user is the owner
    if (await isHouseholdOwner(ctx, args.householdId, user.clerkId)) {
      throw new ConvexError("Household owner cannot leave. Transfer ownership first or delete the household.");
    }

    // Find membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", args.householdId).eq("userId", user.clerkId)
      )
      .first();

    if (!membership || !membership.isActive) {
      throw new ConvexError("You are not a member of this household");
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

      // Log activity
      await ctx.db.insert("activityFeed", {
        householdId: args.householdId,
        userId: user.clerkId,
        type: "member_left",
        itemName: household.name,
        details: `${user.name || user.email} left the household`,
        metadata: {
          memberName: user.name,
          memberEmail: user.email
        },
        isRead: false,
        createdAt: now
      });
    }

    // Log audit event
    await logAuditEvent(ctx, "leave_household", "household_membership", {
      householdId: args.householdId,
      severity: "info"
    });

    return args.householdId;
  }
});

/**
 * Get household activity feed
 */
export const getHouseholdActivity = query({
  args: { 
    householdId: v.id("households"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "read");

    let query = ctx.db
      .query("activityFeed")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc");

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    return await query.take(args.limit || 50);
  }
});

/**
 * Mark activity as read
 */
export const markActivityRead = mutation({
  args: { 
    householdId: v.id("households"),
    activityIds: v.optional(v.array(v.id("activityFeed")))
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "read");
    const user = await getAuthenticatedUser(ctx);

    if (args.activityIds) {
      // Mark specific activities as read
      for (const activityId of args.activityIds) {
        const activity = await ctx.db.get(activityId);
        if (activity && activity.householdId === args.householdId) {
          await ctx.db.patch(activityId, { isRead: true });
        }
      }
    } else {
      // Mark all user's activities as read
      const activities = await ctx.db
        .query("activityFeed")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .filter((q) => q.and(
          q.eq(q.field("userId"), user.clerkId),
          q.eq(q.field("isRead"), false)
        ))
        .collect();

      for (const activity of activities) {
        await ctx.db.patch(activity._id, { isRead: true });
      }
    }
  }
});