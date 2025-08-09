import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Activity feed functions for tracking household member activities

// Log an activity (internal function)
export const logActivity = mutation({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Verify user is a member of the household
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      // Don't log activity for non-members
      return null
    }

    return await ctx.db.insert('activityLog', {
      householdId: args.householdId,
      userId: args.userId,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      oldValues: args.oldValues,
      newValues: args.newValues,
      metadata: args.metadata,
      createdAt: Date.now(),
    })
  },
})

// Get activity feed for household
export const getHouseholdActivityFeed = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(), // For permission checking
    limit: v.optional(v.number()),
    resourceType: v.optional(v.string()), // Filter by resource type
    actions: v.optional(v.array(v.string())), // Filter by specific actions
  },
  handler: async (ctx, args) => {
    // Check if user has access to this household
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { activities: [], hasAccess: false }
    }

    // Get activity log entries
    let query = ctx.db
      .query('activityLog')
      .withIndex('by_household_date', q => q.eq('householdId', args.householdId))
      .order('desc')

    let activities = await query.collect()
    
    if (args.limit) {
      activities = activities.slice(0, args.limit)
    }

    // Apply filters
    if (args.resourceType) {
      activities = activities.filter(activity => activity.resourceType === args.resourceType)
    }

    if (args.actions && args.actions.length > 0) {
      activities = activities.filter(activity => args.actions!.includes(activity.action))
    }

    // Get user details for each activity
    const activitiesWithUserInfo = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', q => q.eq('clerkId', activity.userId))
          .first()

        // Get resource-specific details
        let resourceDetails = null
        try {
          switch (activity.resourceType) {
            case 'product':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'products'>)
              break
            case 'inventoryItem':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'inventoryItems'>)
              break
            case 'category':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'categories'>)
              break
            case 'shoppingList':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'shoppingLists'>)
              break
            case 'household':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'households'>)
              break
          }
        } catch (error) {
          // Resource might have been deleted
          resourceDetails = null
        }

        return {
          ...activity,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            imageUrl: user.imageUrl,
          } : null,
          resourceDetails,
          formattedMessage: formatActivityMessage(activity, user, resourceDetails),
        }
      })
    )

    return {
      activities: activitiesWithUserInfo,
      hasAccess: true,
      userRole: membership.role,
    }
  },
})

// Get user's personal activity feed (across all households)
export const getUserActivityFeed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    householdId: v.optional(v.id('households')), // Optionally filter to specific household
  },
  handler: async (ctx, args) => {
    let activities: Doc<'activityLog'>[] = []

    if (args.householdId) {
      // Get activities for specific household
      const membership = await ctx.db
        .query('householdMembers')
        .withIndex('by_household_user', q =>
          q.eq('householdId', args.householdId!).eq('userId', args.userId)
        )
        .first()

      if (!membership || !membership.isActive) {
        return { activities: [], hasAccess: false }
      }

      let query = ctx.db
        .query('activityLog')
        .withIndex('by_household_date', q => q.eq('householdId', args.householdId!))
        .filter(q => q.eq(q.field('userId'), args.userId))
        .order('desc')

      if (args.limit) {
        query = query.take(args.limit)
      }

      activities = await query.collect()
    } else {
      // Get activities across all user's households
      const memberships = await ctx.db
        .query('householdMembers')
        .withIndex('by_user_active', q => q.eq('userId', args.userId).eq('isActive', true))
        .collect()

      // Get activities from all households the user is a member of
      const householdActivities = await Promise.all(
        memberships.map(async (membership) => {
          let query = ctx.db
            .query('activityLog')
            .withIndex('by_household_date', q => q.eq('householdId', membership.householdId))
            .filter(q => q.eq(q.field('userId'), args.userId))
            .order('desc')

          if (args.limit) {
            // Limit per household, then we'll sort and limit globally
            query = query.take(args.limit)
          }

          return await query.collect()
        })
      )

      // Flatten and sort all activities by date
      activities = householdActivities
        .flat()
        .sort((a, b) => b.createdAt - a.createdAt)

      if (args.limit) {
        activities = activities.slice(0, args.limit)
      }
    }

    // Get household and resource details for each activity
    const activitiesWithDetails = await Promise.all(
      activities.map(async (activity) => {
        const household = await ctx.db.get(activity.householdId)
        
        let resourceDetails = null
        try {
          switch (activity.resourceType) {
            case 'product':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'products'>)
              break
            case 'inventoryItem':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'inventoryItems'>)
              break
            case 'category':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'categories'>)
              break
            case 'shoppingList':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'shoppingLists'>)
              break
            case 'household':
              resourceDetails = await ctx.db.get(activity.resourceId as Id<'households'>)
              break
          }
        } catch (error) {
          resourceDetails = null
        }

        return {
          ...activity,
          household: household ? {
            name: household.name,
            imageUrl: household.imageUrl,
          } : null,
          resourceDetails,
          formattedMessage: formatActivityMessage(activity, null, resourceDetails),
        }
      })
    )

    return {
      activities: activitiesWithDetails,
      hasAccess: true,
    }
  },
})

// Get activity statistics for household
export const getHouseholdActivityStats = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    timeframe: v.optional(v.union(
      v.literal('24h'),
      v.literal('7d'),
      v.literal('30d'),
      v.literal('90d')
    )),
  },
  handler: async (ctx, args) => {
    // Check access
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return { stats: null, hasAccess: false }
    }

    const timeframe = args.timeframe || '7d'
    const timeframes = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    }

    const cutoffTime = Date.now() - timeframes[timeframe]

    const activities = await ctx.db
      .query('activityLog')
      .withIndex('by_household_date', q => q.eq('householdId', args.householdId))
      .filter(q => q.gte(q.field('createdAt'), cutoffTime))
      .collect()

    // Group by action type
    const actionCounts: Record<string, number> = {}
    const resourceTypeCounts: Record<string, number> = {}
    const userActivityCounts: Record<string, number> = {}

    for (const activity of activities) {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1
      resourceTypeCounts[activity.resourceType] = (resourceTypeCounts[activity.resourceType] || 0) + 1
      userActivityCounts[activity.userId] = (userActivityCounts[activity.userId] || 0) + 1
    }

    // Get top active users
    const topUsers = await Promise.all(
      Object.entries(userActivityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([userId, count]) => {
          const user = await ctx.db
            .query('users')
            .withIndex('by_clerk_id', q => q.eq('clerkId', userId))
            .first()
          
          return {
            userId,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            } : null,
            activityCount: count,
          }
        })
    )

    return {
      stats: {
        totalActivities: activities.length,
        timeframe,
        actionCounts,
        resourceTypeCounts,
        topUsers,
        mostActiveDay: getMostActiveDay(activities),
        recentActivityTrend: getActivityTrend(activities, timeframe),
      },
      hasAccess: true,
    }
  },
})

// Helper function to format activity messages
function formatActivityMessage(
  activity: Doc<'activityLog'>,
  user: Doc<'users'> | null,
  resource: any
): string {
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Someone'
  const resourceName = resource?.name || 'Unknown'

  switch (activity.action) {
    case 'create':
      return `${userName} created ${activity.resourceType} "${resourceName}"`
    case 'update':
      return `${userName} updated ${activity.resourceType} "${resourceName}"`
    case 'delete':
      return `${userName} deleted ${activity.resourceType} "${resourceName}"`
    case 'consume':
      return `${userName} consumed ${activity.resourceType} "${resourceName}"`
    case 'add_to_shopping_list':
      return `${userName} added "${resourceName}" to shopping list`
    case 'complete_shopping_item':
      return `${userName} completed shopping item "${resourceName}"`
    case 'invite_member':
      return `${userName} invited a new member to the household`
    case 'join_household':
      return `${userName} joined the household`
    case 'leave_household':
      return `${userName} left the household`
    case 'update_role':
      return `${userName} updated member roles`
    case 'update_settings':
      return `${userName} updated household settings`
    default:
      return `${userName} performed ${activity.action} on ${activity.resourceType}`
  }
}

// Helper function to get most active day
function getMostActiveDay(activities: Doc<'activityLog'>[]): { day: string; count: number } {
  const dayCounts: Record<string, number> = {}

  for (const activity of activities) {
    const day = new Date(activity.createdAt).toLocaleDateString()
    dayCounts[day] = (dayCounts[day] || 0) + 1
  }

  const mostActiveDay = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)[0]

  return mostActiveDay ? { day: mostActiveDay[0], count: mostActiveDay[1] } : { day: '', count: 0 }
}

// Helper function to get activity trend
function getActivityTrend(
  activities: Doc<'activityLog'>[],
  timeframe: string
): Array<{ period: string; count: number }> {
  const now = new Date()
  const periods: Array<{ period: string; count: number }> = []

  if (timeframe === '24h') {
    // Group by hour
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourKey = hour.getHours().toString().padStart(2, '0') + ':00'
      const count = activities.filter(a => {
        const activityHour = new Date(a.createdAt).getHours()
        return activityHour === hour.getHours()
      }).length
      periods.push({ period: hourKey, count })
    }
  } else {
    // Group by day
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayKey = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayStart = new Date(day.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = new Date(day.setHours(23, 59, 59, 999)).getTime()
      
      const count = activities.filter(a => 
        a.createdAt >= dayStart && a.createdAt <= dayEnd
      ).length
      
      periods.push({ period: dayKey, count })
    }
  }

  return periods
}

// Clean up old activity logs (scheduled function)
export const cleanupOldActivities = mutation({
  args: {
    retentionDays: v.optional(v.number()), // Default 90 days
  },
  handler: async (ctx, args) => {
    const retentionDays = args.retentionDays || 90
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)

    const oldActivities = await ctx.db
      .query('activityLog')
      .filter(q => q.lt(q.field('createdAt'), cutoffTime))
      .collect()

    let deletedCount = 0
    for (const activity of oldActivities) {
      await ctx.db.delete(activity._id)
      deletedCount++
    }

    return deletedCount
  },
})