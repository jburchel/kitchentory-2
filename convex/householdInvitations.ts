import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { ConvexError } from 'convex/values'

// Generate a unique invitation token
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Create household invitation
export const create = mutation({
  args: {
    householdId: v.id('households'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
    invitedBy: v.string(),
    message: v.optional(v.string()),
    expiryHours: v.optional(v.number()), // Default 72 hours
  },
  handler: async (ctx, args) => {
    // Check if inviter has permission
    const inviterMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) => 
        q.eq('householdId', args.householdId).eq('userId', args.invitedBy)
      )
      .first()

    if (!inviterMembership || !inviterMembership.isActive) {
      throw new ConvexError('You are not a member of this household')
    }

    if (!inviterMembership.permissions?.canInviteMembers) {
      throw new ConvexError('You do not have permission to invite members')
    }

    // Check if user is already a member
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (existingUser) {
      const existingMembership = await ctx.db
        .query('householdMembers')
        .withIndex('by_household_user', (q) =>
          q.eq('householdId', args.householdId).eq('userId', existingUser.clerkId)
        )
        .first()

      if (existingMembership) {
        throw new ConvexError('User is already a member of this household')
      }
    }

    // Check for existing pending invitation
    const existingInvite = await ctx.db
      .query('householdInvitations')
      .withIndex('by_household_status', (q) =>
        q.eq('householdId', args.householdId).eq('status', 'pending')
      )
      .filter((q) => q.eq(q.field('email'), args.email))
      .first()

    if (existingInvite) {
      throw new ConvexError('An invitation has already been sent to this email')
    }

    // Check household member limit
    const household = await ctx.db.get(args.householdId)
    if (!household) {
      throw new ConvexError('Household not found')
    }

    const maxMembers = household.settings?.maxMembers || 10
    if (household.memberCount >= maxMembers) {
      throw new ConvexError('Household has reached maximum member limit')
    }

    const now = Date.now()
    const expiryHours = args.expiryHours || 72
    const expiresAt = now + (expiryHours * 60 * 60 * 1000)

    return await ctx.db.insert('householdInvitations', {
      householdId: args.householdId,
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      status: 'pending',
      inviteToken: generateInviteToken(),
      expiresAt,
      message: args.message,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Accept household invitation
export const accept = mutation({
  args: {
    inviteToken: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('householdInvitations')
      .withIndex('by_token', (q) => q.eq('inviteToken', args.inviteToken))
      .first()

    if (!invitation) {
      throw new ConvexError('Invalid invitation token')
    }

    if (invitation.status !== 'pending') {
      throw new ConvexError('Invitation is no longer valid')
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, {
        status: 'expired',
        updatedAt: Date.now(),
      })
      throw new ConvexError('Invitation has expired')
    }

    // Verify user email matches invitation
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
      .first()

    if (!user || user.email !== invitation.email) {
      throw new ConvexError('User email does not match invitation')
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) =>
        q.eq('householdId', invitation.householdId).eq('userId', args.userId)
      )
      .first()

    if (existingMembership) {
      throw new ConvexError('You are already a member of this household')
    }

    const now = Date.now()

    // Create household membership
    const membershipId = await ctx.db.insert('householdMembers', {
      householdId: invitation.householdId,
      userId: args.userId,
      role: invitation.role,
      permissions: {
        canManageInventory: invitation.role === 'admin',
        canManageShoppingLists: true,
        canManageCategories: invitation.role === 'admin',
        canInviteMembers: invitation.role === 'admin',
        canManageMembers: false, // Only owners can manage members
        canEditHouseholdSettings: invitation.role === 'admin',
        canDeleteHousehold: false, // Only owners can delete
      },
      isActive: true,
      joinedAt: now,
      updatedAt: now,
    })

    // Update invitation status
    await ctx.db.patch(invitation._id, {
      status: 'accepted',
      acceptedAt: now,
      acceptedBy: args.userId,
      updatedAt: now,
    })

    // Update household member count
    const household = await ctx.db.get(invitation.householdId)
    if (household) {
      await ctx.db.patch(invitation.householdId, {
        memberCount: household.memberCount + 1,
        updatedAt: now,
      })
    }

    return membershipId
  },
})

// Decline household invitation
export const decline = mutation({
  args: {
    inviteToken: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('householdInvitations')
      .withIndex('by_token', (q) => q.eq('inviteToken', args.inviteToken))
      .first()

    if (!invitation) {
      throw new ConvexError('Invalid invitation token')
    }

    if (invitation.status !== 'pending') {
      throw new ConvexError('Invitation is no longer valid')
    }

    await ctx.db.patch(invitation._id, {
      status: 'declined',
      updatedAt: Date.now(),
    })

    return invitation._id
  },
})

// Get invitation by token (for invitation page)
export const getByToken = query({
  args: { inviteToken: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('householdInvitations')
      .withIndex('by_token', (q) => q.eq('inviteToken', args.inviteToken))
      .first()

    if (!invitation) {
      return null
    }

    // Get household details
    const household = await ctx.db.get(invitation.householdId)
    
    // Get inviter details
    const inviter = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', invitation.invitedBy))
      .first()

    return {
      ...invitation,
      household,
      inviter: inviter ? {
        firstName: inviter.firstName,
        lastName: inviter.lastName,
        email: inviter.email,
        imageUrl: inviter.imageUrl,
      } : null,
    }
  },
})

// List invitations for household
export const listForHousehold = query({
  args: { 
    householdId: v.id('households'),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('expired')
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('householdInvitations')
      .withIndex('by_household', (q) => q.eq('householdId', args.householdId))

    if (args.status) {
      const invitations = await query.collect()
      return invitations.filter(inv => inv.status === args.status)
    }

    const invitations = await query.collect()

    // Get inviter details for each invitation
    return await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', invitation.invitedBy))
          .first()

        return {
          ...invitation,
          inviter: inviter ? {
            firstName: inviter.firstName,
            lastName: inviter.lastName,
            email: inviter.email,
            imageUrl: inviter.imageUrl,
          } : null,
        }
      })
    )
  },
})

// List invitations for user
export const listForUser = query({
  args: { 
    email: v.string(),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('expired')
    )),
  },
  handler: async (ctx, args) => {
    let baseQuery = ctx.db
      .query('householdInvitations')
      .withIndex('by_email', (q) => q.eq('email', args.email))

    const invitations = await baseQuery.collect()
    const filteredInvitations = args.status 
      ? invitations.filter(inv => inv.status === args.status)
      : invitations

    // Get household and inviter details for each invitation
    return await Promise.all(
      filteredInvitations.map(async (invitation) => {
        const household = await ctx.db.get(invitation.householdId)
        const inviter = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', invitation.invitedBy))
          .first()

        return {
          ...invitation,
          household,
          inviter: inviter ? {
            firstName: inviter.firstName,
            lastName: inviter.lastName,
            email: inviter.email,
            imageUrl: inviter.imageUrl,
          } : null,
        }
      })
    )
  },
})

// Cancel invitation (by inviter or admin)
export const cancel = mutation({
  args: {
    invitationId: v.id('householdInvitations'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new ConvexError('Invitation not found')
    }

    if (invitation.status !== 'pending') {
      throw new ConvexError('Can only cancel pending invitations')
    }

    // Check if user has permission to cancel
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) =>
        q.eq('householdId', invitation.householdId).eq('userId', args.userId)
      )
      .first()

    const canCancel = membership && (
      membership.permissions?.canInviteMembers || 
      invitation.invitedBy === args.userId
    )

    if (!canCancel) {
      throw new ConvexError('You do not have permission to cancel this invitation')
    }

    await ctx.db.patch(args.invitationId, {
      status: 'expired',
      updatedAt: Date.now(),
    })

    return args.invitationId
  },
})

// Cleanup expired invitations (scheduled function)
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expiredInvitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_household_status', (q) => q.eq('status', 'pending'))
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect()

    let cleanedCount = 0
    for (const invitation of expiredInvitations) {
      await ctx.db.patch(invitation._id, {
        status: 'expired',
        updatedAt: now,
      })
      cleanedCount++
    }

    return cleanedCount
  },
})

// Resend invitation
export const resend = mutation({
  args: {
    invitationId: v.id('householdInvitations'),
    userId: v.string(),
    expiryHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new ConvexError('Invitation not found')
    }

    // Check if user has permission to resend
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) =>
        q.eq('householdId', invitation.householdId).eq('userId', args.userId)
      )
      .first()

    const canResend = membership && (
      membership.permissions?.canInviteMembers || 
      invitation.invitedBy === args.userId
    )

    if (!canResend) {
      throw new ConvexError('You do not have permission to resend this invitation')
    }

    const now = Date.now()
    const expiryHours = args.expiryHours || 72
    const expiresAt = now + (expiryHours * 60 * 60 * 1000)

    await ctx.db.patch(args.invitationId, {
      status: 'pending',
      inviteToken: generateInviteToken(), // Generate new token
      expiresAt,
      updatedAt: now,
    })

    return args.invitationId
  },
})