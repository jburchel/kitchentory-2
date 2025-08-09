import { v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Real-time subscription functions for household updates

// Subscribe to household member changes
export const subscribeToHouseholdMembers = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(), // For permission checking
  },
  handler: async (ctx, args) => {
    // Check if user is a member of the household
    const userMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!userMembership || !userMembership.isActive) {
      return { members: [], hasAccess: false }
    }

    // Get all household members with user details
    const members = await ctx.db
      .query('householdMembers')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    // Get user details for each member
    const membersWithUserInfo = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', q => q.eq('clerkId', member.userId))
          .first()

        return {
          ...member,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            imageUrl: user.imageUrl,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
          } : null,
        }
      })
    )

    return {
      members: membersWithUserInfo,
      hasAccess: true,
      userRole: userMembership.role,
      userPermissions: userMembership.permissions,
    }
  },
})

// Subscribe to household invitations
export const subscribeToHouseholdInvitations = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has permission to view invitations
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive || !membership.permissions?.canInviteMembers) {
      return { invitations: [], hasAccess: false }
    }

    // Get all pending invitations
    const invitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    // Get inviter details for each invitation
    const invitationsWithInviterInfo = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', q => q.eq('clerkId', invitation.invitedBy))
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

    return {
      invitations: invitationsWithInviterInfo,
      hasAccess: true,
    }
  },
})

// Subscribe to household settings and preferences
export const subscribeToHouseholdSettings = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is a member
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { household: null, hasAccess: false }
    }

    const household = await ctx.db.get(args.householdId)
    
    return {
      household,
      hasAccess: true,
      canEdit: membership.permissions?.canEditHouseholdSettings || false,
    }
  },
})

// Subscribe to user's household list
export const subscribeToUserHouseholds = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user_active', q => 
        q.eq('userId', args.userId).eq('isActive', true)
      )
      .collect()

    const households = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId)
        return {
          ...household,
          membership: {
            role: membership.role,
            permissions: membership.permissions,
            joinedAt: membership.joinedAt,
            lastActiveAt: membership.lastActiveAt,
          },
        }
      })
    )

    return households.filter(Boolean)
  },
})

// Subscribe to household activity feed
export const subscribeToHouseholdActivity = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user is a member
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { activities: [], hasAccess: false }
    }

    // Get recent activity log entries
    let query = ctx.db
      .query('activityLog')
      .withIndex('by_household_date', q => q.eq('householdId', args.householdId))
      .order('desc')

    if (args.limit) {
      query = query.take(args.limit)
    }

    const activities = await query.collect()

    // Get user details for each activity
    const activitiesWithUserInfo = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', q => q.eq('clerkId', activity.userId))
          .first()

        return {
          ...activity,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            imageUrl: user.imageUrl,
          } : null,
        }
      })
    )

    return {
      activities: activitiesWithUserInfo,
      hasAccess: true,
    }
  },
})

// Subscribe to user's pending invitations
export const subscribeToUserInvitations = query({
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
    let query = ctx.db
      .query('householdInvitations')
      .withIndex('by_email', q => q.eq('email', args.email))

    const invitations = await query.collect()
    const filteredInvitations = args.status 
      ? invitations.filter(inv => inv.status === args.status)
      : invitations

    // Get household and inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      filteredInvitations.map(async (invitation) => {
        const household = await ctx.db.get(invitation.householdId)
        const inviter = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', q => q.eq('clerkId', invitation.invitedBy))
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

    return invitationsWithDetails
  },
})

// Subscribe to household notifications
export const subscribeToHouseholdNotifications = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user is a member
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { notifications: [], hasAccess: false }
    }

    // Get notifications for this user and household
    let query = ctx.db
      .query('notifications')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('householdId'), args.householdId))
      .order('desc')

    if (args.limit) {
      query = query.take(args.limit)
    }

    const notifications = await query.collect()

    return {
      notifications,
      hasAccess: true,
      unreadCount: notifications.filter(n => !n.isRead).length,
    }
  },
})

// Subscribe to household statistics (for dashboard)
export const subscribeToHouseholdStats = query({
  args: { 
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is a member
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { stats: null, hasAccess: false }
    }

    const household = await ctx.db.get(args.householdId)
    if (!household) return { stats: null, hasAccess: false }

    // Get various statistics
    const members = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_active', q => 
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
      .collect()

    const pendingInvitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_household_status', q =>
        q.eq('householdId', args.householdId).eq('status', 'pending')
      )
      .collect()

    const inventoryItems = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isConsumed', false)
      )
      .collect()

    const shoppingLists = await ctx.db
      .query('shoppingLists')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
      .collect()

    // Get items expiring soon (next 7 days)
    const nextWeek = Date.now() + (7 * 24 * 60 * 60 * 1000)
    const expiringItems = inventoryItems.filter(item => 
      item.expirationDate && item.expirationDate <= nextWeek
    )

    // Get low stock items
    const lowStockThreshold = household.settings?.lowStockThreshold || 2
    const lowStockItems = inventoryItems.filter(item => 
      item.quantity <= lowStockThreshold
    )

    const stats = {
      household: {
        name: household.name,
        memberCount: members.length,
        createdAt: household.createdAt,
      },
      members: {
        total: members.length,
        owners: members.filter(m => m.role === 'owner').length,
        admins: members.filter(m => m.role === 'admin').length,
        regular: members.filter(m => m.role === 'member').length,
      },
      invitations: {
        pending: pendingInvitations.length,
      },
      inventory: {
        total: inventoryItems.length,
        expiringSoon: expiringItems.length,
        lowStock: lowStockItems.length,
      },
      shopping: {
        activeLists: shoppingLists.length,
        totalItems: shoppingLists.reduce((sum, list) => {
          // Would need to count shopping list items here
          return sum
        }, 0),
      },
      lastActivity: Math.max(
        ...members.map(m => m.lastActiveAt || m.joinedAt),
        household.updatedAt
      ),
    }

    return {
      stats,
      hasAccess: true,
      userRole: membership.role,
    }
  },
})