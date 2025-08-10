import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Id } from './_generated/dataModel'
import { ConvexError } from 'convex/values'

// Get or create user from Clerk data
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    const now = Date.now()
    
    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        phoneNumber: args.phoneNumber,
        lastLoginAt: now,
        updatedAt: now,
      })
      return existing._id
    } else {
      // Create new user
      return await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        phoneNumber: args.phoneNumber,
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
  },
})

// Get user with household memberships
export const getUserWithHouseholds = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
    
    if (!user) return null

    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user_active', (q) => q.eq('userId', args.clerkId).eq('isActive', true))
      .collect()

    // Get household details for each membership
    const households = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId)
        return {
          ...membership,
          household,
        }
      })
    )

    // Get pending invitations for user
    const pendingInvitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_email_status', (q) => 
        q.eq('email', user.email).eq('status', 'pending')
      )
      .collect()

    const invitationsWithHouseholds = await Promise.all(
      pendingInvitations.map(async (invitation) => {
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

    return {
      ...user,
      households: households.filter(h => h.household), // Filter out null households
      pendingInvitations: invitationsWithHouseholds,
      householdCount: households.length,
      pendingInvitationCount: pendingInvitations.length,
    }
  },
})

// Update user profile
export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      phoneNumber: args.phoneNumber,
      updatedAt: Date.now(),
    })

    return user._id
  },
})

// Track user session
export const createUserSession = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    return await ctx.db.insert('userSessions', {
      userId: args.userId,
      sessionId: args.sessionId,
      isActive: true,
      lastActiveAt: now,
      expiresAt: args.expiresAt,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: now,
    })
  },
})

// End user session
export const endUserSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('userSessions')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first()

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
        lastActiveAt: Date.now(),
      })
    }

    return session?._id
  },
})

// Get active sessions for user
export const getUserActiveSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userSessions')
      .withIndex('by_user_active', (q) => 
        q.eq('userId', args.userId).eq('isActive', true)
      )
      .collect()
  },
})

// Clean up expired sessions
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expiredSessions = await ctx.db
      .query('userSessions')
      .filter((q) => q.and(q.eq(q.field('isActive'), true), q.lt(q.field('expiresAt'), now)))
      .collect()

    for (const session of expiredSessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        lastActiveAt: now,
      })
    }

    return expiredSessions.length
  },
})

// Delete user account
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    // Mark as inactive instead of deleting for data integrity
    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: Date.now(),
    })

    // End all active sessions
    const activeSessions = await ctx.db
      .query('userSessions')
      .withIndex('by_user_active', (q) => 
        q.eq('userId', args.clerkId).eq('isActive', true)
      )
      .collect()

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        lastActiveAt: Date.now(),
      })
    }

    return user._id
  },
})

// Get user analytics/stats
export const getUserStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) return null

    const households = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.clerkId))
      .collect()

    const sessions = await ctx.db
      .query('userSessions')
      .withIndex('by_user', (q) => q.eq('userId', args.clerkId))
      .collect()

    const activeSessions = sessions.filter(s => s.isActive).length
    const totalSessions = sessions.length

    return {
      user,
      householdsCount: households.length,
    activeHouseholdsCount: households.filter(h => h.household?.isActive).length,
      sessionsCount: {
        active: activeSessions,
        total: totalSessions,
      },
      lastLoginAt: user.lastLoginAt,
      memberSince: user.createdAt,
    }
  },
})

// Get user's dashboard data
export const getUserDashboard = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) return null

    // Get active household memberships
    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user_active', (q) => q.eq('userId', args.clerkId).eq('isActive', true))
      .collect()

    // Get household details and stats for each membership
    const households = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId)
        if (!household) return null

        // Get quick stats for this household
        const inventoryItems = await ctx.db
          .query('inventoryItems')
          .withIndex('by_household_active', (q) =>
            q.eq('householdId', membership.householdId).eq('isConsumed', false)
          )
          .collect()

        const shoppingLists = await ctx.db
          .query('shoppingLists')
          .withIndex('by_household_active', (q) =>
            q.eq('householdId', membership.householdId).eq('isActive', true)
          )
          .collect()

        // Items expiring soon (next 3 days)
        const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000)
        const expiringItems = inventoryItems.filter(item => 
          item.expirationDate && item.expirationDate <= threeDaysFromNow
        )

        // Low stock items
        const lowStockThreshold = household.settings?.lowStockThreshold || 2
        const lowStockItems = inventoryItems.filter(item => 
          item.quantity <= lowStockThreshold
        )

        return {
          ...membership,
          household,
          stats: {
            inventoryItemCount: inventoryItems.length,
            activeShoppingLists: shoppingLists.length,
            expiringItemsCount: expiringItems.length,
            lowStockItemsCount: lowStockItems.length,
          },
        }
      })
    )

    // Get pending invitations
    const pendingInvitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_email_status', (q) => 
        q.eq('email', user.email).eq('status', 'pending')
      )
      .collect()

    // Get recent notifications
    const recentNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) => q.eq('userId', args.clerkId).eq('isRead', false))
      .take(5)
      .collect()

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
        lastLoginAt: user.lastLoginAt,
      },
      households: households.filter(Boolean),
      pendingInvitations: pendingInvitations.length,
      unreadNotifications: recentNotifications.length,
      summary: {
        totalHouseholds: households.filter(Boolean).length,
        totalInventoryItems: households.reduce((sum, h) => 
          sum + (h?.stats?.inventoryItemCount || 0), 0
        ),
        totalExpiringItems: households.reduce((sum, h) => 
          sum + (h?.stats?.expiringItemsCount || 0), 0
        ),
        totalLowStockItems: households.reduce((sum, h) => 
          sum + (h?.stats?.lowStockItemsCount || 0), 0
        ),
        totalActiveShoppingLists: households.reduce((sum, h) => 
          sum + (h?.stats?.activeShoppingLists || 0), 0
        ),
      },
    }
  },
})

// Get user's preferences (derived from household settings)
export const getUserPreferences = query({
  args: { 
    clerkId: v.string(),
    householdId: v.optional(v.id('households')), // If specified, get preferences for specific household
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) return null

    let targetHouseholdId = args.householdId
    
    // If no household specified, get the user's primary (first joined) household
    if (!targetHouseholdId) {
      const membership = await ctx.db
        .query('householdMembers')
        .withIndex('by_user_active', (q) => q.eq('userId', args.clerkId).eq('isActive', true))
        .order('asc') // Get oldest membership (first joined)
        .first()
      
      targetHouseholdId = membership?.householdId
    }

    if (!targetHouseholdId) {
      return {
        user,
        preferences: null,
        householdContext: null,
      }
    }

    const household = await ctx.db.get(targetHouseholdId)
    if (!household) return null

    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) =>
        q.eq('householdId', targetHouseholdId).eq('userId', args.clerkId)
      )
      .first()

    return {
      user,
      preferences: household.preferences || {},
      settings: household.settings || {},
      householdContext: {
        householdId: targetHouseholdId,
        householdName: household.name,
        userRole: membership?.role,
        userPermissions: membership?.permissions,
      },
    }
  },
})

// Update user's last activity across all households
export const updateUserActivity = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const now = Date.now()

    // Update user's last login
    await ctx.db.patch(user._id, {
      lastLoginAt: now,
      updatedAt: now,
    })

    // Update activity timestamp for all household memberships
    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user_active', (q) => q.eq('userId', args.clerkId).eq('isActive', true))
      .collect()

    const updatePromises = memberships.map(membership => 
      ctx.db.patch(membership._id, {
        lastActiveAt: now,
        updatedAt: now,
      })
    )

    await Promise.all(updatePromises)

    return user._id
  },
})

// Set user's active household (for context switching)
export const setActiveHousehold = mutation({
  args: {
    clerkId: v.string(),
    householdId: v.id('households'),
  },
  handler: async (ctx, args) => {
    // Verify user is a member of the household
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', (q) =>
        q.eq('householdId', args.householdId).eq('userId', args.clerkId)
      )
      .first()

    if (!membership || !membership.isActive) {
      throw new Error('User is not an active member of this household')
    }

    // Update the user's activity timestamp for this household
    await ctx.db.patch(membership._id, {
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.householdId
  },
})

// Get user's role and permissions summary across all households
export const getUserRoleSummary = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user_active', (q) => q.eq('userId', args.clerkId).eq('isActive', true))
      .collect()

    const householdRoles = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId)
        return {
          householdId: membership.householdId,
          householdName: household?.name || 'Unknown',
          role: membership.role,
          permissions: membership.permissions,
          joinedAt: membership.joinedAt,
          lastActiveAt: membership.lastActiveAt,
        }
      })
    )

    const roles = {
      owner: householdRoles.filter(h => h.role === 'owner').length,
      admin: householdRoles.filter(h => h.role === 'admin').length,
      member: householdRoles.filter(h => h.role === 'member').length,
    }

    return {
      totalHouseholds: householdRoles.length,
      roles,
      householdRoles,
      hasOwnerRole: roles.owner > 0,
      hasAdminRole: roles.admin > 0,
    }
  },
})