import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { 
  requireHouseholdPermission,
  getPermissionsForRole,
  generateInviteToken,
  logAuditEvent,
  getAuthenticatedUser,
  Role
} from "./auth";

/**
 * Send household invitation
 */
export const sendInvitation = mutation({
  args: {
    householdId: v.id("households"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    message: v.optional(v.string()),
    customPermissions: v.optional(v.array(v.union(
      v.literal("read"),
      v.literal("write"),
      v.literal("delete"),
      v.literal("invite")
    )))
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "invite");
    const currentUser = await getAuthenticatedUser(ctx);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new ConvexError("Invalid email address");
    }

    const email = args.email.toLowerCase().trim();

    // Check if user is already a member
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      const existingMembership = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household_user", (q) => 
          q.eq("householdId", args.householdId).eq("userId", existingUser.clerkUserId)
        )
        .first();

      if (existingMembership?.isActive) {
        throw new ConvexError("User is already a member of this household");
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_email", (q) => q.eq("invitedEmail", email))
      .filter((q) => q.and(
        q.eq(q.field("householdId"), args.householdId),
        q.eq(q.field("status"), "pending")
      ))
      .first();

    if (existingInvitation) {
      throw new ConvexError("Pending invitation already exists for this email");
    }

    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
    const token = generateInviteToken();
    const permissions = args.customPermissions || getPermissionsForRole(args.role);

    // Create invitation
    const invitationId = await ctx.db.insert("householdInvitations", {
      householdId: args.householdId,
      inviterUserId: currentUser.clerkUserId,
      invitedEmail: email,
      invitedUserId: existingUser?.clerkUserId,
      role: args.role,
      permissions,
      message: args.message,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
      updatedAt: now
    });

    // Get household info for activity log
    const household = await ctx.db.get(args.householdId);

    // Log activity
    await ctx.db.insert("activityFeed", {
      householdId: args.householdId,
      userId: currentUser.clerkUserId,
      type: "invitation_sent",
      itemName: household?.name || "Household",
      details: `Invitation sent to ${email}`,
      metadata: {
        memberEmail: email
      },
      isRead: false,
      createdAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "send_invitation", "household_invitation", {
      householdId: args.householdId,
      resourceId: invitationId,
      newValue: { email, role: args.role, permissions },
      severity: "info"
    });

    return {
      invitationId,
      token,
      expiresAt
    };
  }
});

/**
 * Get invitation details by token
 */
export const getInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new ConvexError("Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("Invitation is no longer pending");
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, {
        status: "expired",
        updatedAt: Date.now()
      });
      throw new ConvexError("Invitation has expired");
    }

    // Get household and inviter details
    const household = await ctx.db.get(invitation.householdId);
    const inviterUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", invitation.inviterUserId))
      .first();

    return {
      invitationId: invitation._id,
      household: {
        id: household?._id,
        name: household?.name,
        description: household?.description
      },
      inviter: {
        name: inviterUser?.name,
        email: inviterUser?.email
      },
      role: invitation.role,
      permissions: invitation.permissions,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt
    };
  }
});

/**
 * Accept invitation
 */
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new ConvexError("Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("Invitation is no longer pending");
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, {
        status: "expired",
        updatedAt: Date.now()
      });
      throw new ConvexError("Invitation has expired");
    }

    // Check if invitation email matches current user
    if (invitation.invitedEmail !== currentUser.email) {
      throw new ConvexError("This invitation is for a different email address");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_user", (q) => 
        q.eq("householdId", invitation.householdId).eq("userId", currentUser.clerkUserId)
      )
      .first();

    if (existingMembership?.isActive) {
      throw new ConvexError("You are already a member of this household");
    }

    const now = Date.now();

    // Create or reactivate membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        role: invitation.role,
        permissions: invitation.permissions,
        isActive: true,
        joinedAt: now,
        invitedBy: invitation.inviterUserId,
        updatedAt: now
      });
    } else {
      await ctx.db.insert("householdMemberships", {
        householdId: invitation.householdId,
        userId: currentUser.clerkUserId,
        role: invitation.role,
        permissions: invitation.permissions,
        joinedAt: now,
        invitedBy: invitation.inviterUserId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
    }

    // Update invitation status
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      invitedUserId: currentUser.clerkUserId,
      respondedAt: now,
      updatedAt: now
    });

    // Update household member count
    const household = await ctx.db.get(invitation.householdId);
    if (household) {
      await ctx.db.patch(invitation.householdId, {
        memberCount: household.memberCount + 1,
        updatedAt: now
      });

      // Log activity
      await ctx.db.insert("activityFeed", {
        householdId: invitation.householdId,
        userId: currentUser.clerkUserId,
        type: "member_joined",
        itemName: household.name,
        details: `${currentUser.name || currentUser.email} accepted invitation and joined the household`,
        metadata: {
          memberName: currentUser.name,
          memberEmail: currentUser.email
        },
        isRead: false,
        createdAt: now
      });
    }

    // Log audit event
    await logAuditEvent(ctx, "accept_invitation", "household_invitation", {
      householdId: invitation.householdId,
      resourceId: invitation._id,
      severity: "info"
    });

    return invitation.householdId;
  }
});

/**
 * Decline invitation
 */
export const declineInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new ConvexError("Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("Invitation is no longer pending");
    }

    // Check if invitation email matches current user (or allow anyone to decline)
    if (invitation.invitedEmail !== currentUser.email) {
      throw new ConvexError("This invitation is for a different email address");
    }

    const now = Date.now();

    // Update invitation status
    await ctx.db.patch(invitation._id, {
      status: "declined",
      invitedUserId: currentUser.clerkUserId,
      respondedAt: now,
      updatedAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "decline_invitation", "household_invitation", {
      householdId: invitation.householdId,
      resourceId: invitation._id,
      severity: "info"
    });

    return invitation._id;
  }
});

/**
 * Cancel invitation
 */
export const cancelInvitation = mutation({
  args: { invitationId: v.id("householdInvitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    await requireHouseholdPermission(ctx, invitation.householdId, "invite");

    if (invitation.status !== "pending") {
      throw new ConvexError("Only pending invitations can be cancelled");
    }

    const now = Date.now();

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "cancelled",
      updatedAt: now
    });

    // Log audit event
    await logAuditEvent(ctx, "cancel_invitation", "household_invitation", {
      householdId: invitation.householdId,
      resourceId: args.invitationId,
      severity: "info"
    });

    return args.invitationId;
  }
});

/**
 * Get household invitations
 */
export const getHouseholdInvitations = query({
  args: { 
    householdId: v.id("households"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ))
  },
  handler: async (ctx, args) => {
    await requireHouseholdPermission(ctx, args.householdId, "invite");

    let query = ctx.db
      .query("householdInvitations")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const invitations = await query.collect();

    // Get inviter details
    return await Promise.all(
      invitations.map(async (invitation) => {
        const inviterUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", invitation.inviterUserId))
          .first();

        return {
          ...invitation,
          inviter: {
            name: inviterUser?.name,
            email: inviterUser?.email
          }
        };
      })
    );
  }
});

/**
 * Get user's pending invitations
 */
export const getUserInvitations = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    const invitations = await ctx.db
      .query("householdInvitations")
      .withIndex("by_email", (q) => q.eq("invitedEmail", currentUser.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired invitations and mark them
    const validInvitations = [];
    const now = Date.now();

    for (const invitation of invitations) {
      if (invitation.expiresAt < now) {
        // Mark as expired
        await ctx.db.patch(invitation._id, {
          status: "expired",
          updatedAt: now
        });
      } else {
        // Get household and inviter details
        const household = await ctx.db.get(invitation.householdId);
        const inviterUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", invitation.inviterUserId))
          .first();

        validInvitations.push({
          ...invitation,
          household: {
            id: household?._id,
            name: household?.name,
            description: household?.description
          },
          inviter: {
            name: inviterUser?.name,
            email: inviterUser?.email
          }
        });
      }
    }

    return validInvitations;
  }
});

/**
 * Cleanup expired invitations (should be called periodically)
 */
export const cleanupExpiredInvitations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredInvitations = await ctx.db
      .query("householdInvitations")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const invitation of expiredInvitations) {
      await ctx.db.patch(invitation._id, {
        status: "expired",
        updatedAt: now
      });
    }

    return expiredInvitations.length;
  }
});