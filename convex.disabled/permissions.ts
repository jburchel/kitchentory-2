import { v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { ConvexError } from 'convex/values'

// Permission checking utilities for household operations

// Check if user has permission to perform an action in a household
export const checkHouseholdPermission = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    permission: v.union(
      v.literal('canManageInventory'),
      v.literal('canManageShoppingLists'),
      v.literal('canManageCategories'),
      v.literal('canInviteMembers'),
      v.literal('canManageMembers'),
      v.literal('canEditHouseholdSettings'),
      v.literal('canDeleteHousehold')
    ),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return {
        hasPermission: false,
        reason: 'User is not an active member of this household',
        membership: null,
      }
    }

    const hasPermission = membership.permissions?.[args.permission] || false

    return {
      hasPermission,
      reason: hasPermission ? null : `User does not have ${args.permission} permission`,
      membership: {
        role: membership.role,
        permissions: membership.permissions,
        joinedAt: membership.joinedAt,
        lastActiveAt: membership.lastActiveAt,
      },
    }
  },
})

// Get user's permissions for a household
export const getUserHouseholdPermissions = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return null
    }

    return {
      role: membership.role,
      permissions: membership.permissions || {},
      isActive: membership.isActive,
      joinedAt: membership.joinedAt,
      lastActiveAt: membership.lastActiveAt,
    }
  },
})

// Check if user is a member of household
export const isHouseholdMember = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    requireActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership) {
      return { isMember: false, membership: null }
    }

    if (args.requireActive !== false && !membership.isActive) {
      return { isMember: false, membership }
    }

    return { isMember: true, membership }
  },
})

// Get user's role in household
export const getUserRole = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    return membership?.role || null
  },
})

// Check multiple permissions at once
export const checkMultiplePermissions = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    permissions: v.array(
      v.union(
        v.literal('canManageInventory'),
        v.literal('canManageShoppingLists'),
        v.literal('canManageCategories'),
        v.literal('canInviteMembers'),
        v.literal('canManageMembers'),
        v.literal('canEditHouseholdSettings'),
        v.literal('canDeleteHousehold')
      )
    ),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return {
        isValid: false,
        reason: 'User is not an active member of this household',
        permissions: {},
      }
    }

    const permissionResults: Record<string, boolean> = {}
    
    for (const permission of args.permissions) {
      permissionResults[permission] = membership.permissions?.[permission] || false
    }

    const allPermissionsGranted = args.permissions.every(
      permission => permissionResults[permission]
    )

    return {
      isValid: allPermissionsGranted,
      permissions: permissionResults,
      role: membership.role,
      membership,
    }
  },
})

// Check if user can perform action on another user (for member management)
export const canManageUser = query({
  args: {
    householdId: v.id('households'),
    actorUserId: v.string(),
    targetUserId: v.string(),
    action: v.union(
      v.literal('remove'),
      v.literal('update_role'),
      v.literal('update_permissions'),
      v.literal('view_details')
    ),
  },
  handler: async (ctx, args) => {
    // Get both memberships
    const actorMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.actorUserId)
      )
      .first()

    const targetMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.targetUserId)
      )
      .first()

    if (!actorMembership || !actorMembership.isActive) {
      return {
        canManage: false,
        reason: 'Actor is not an active member of this household',
      }
    }

    if (!targetMembership) {
      return {
        canManage: false,
        reason: 'Target user is not a member of this household',
      }
    }

    // Self-management rules
    if (args.actorUserId === args.targetUserId) {
      if (args.action === 'remove') {
        // Can always leave (but check if last owner)
        if (actorMembership.role === 'owner') {
          const ownerCount = await ctx.db
            .query('householdMembers')
            .withIndex('by_household', q => q.eq('householdId', args.householdId))
            .filter(q => q.eq(q.field('role'), 'owner'))
            .collect()
          
          if (ownerCount.length <= 1) {
            return {
              canManage: false,
              reason: 'Cannot remove the last owner of the household',
            }
          }
        }
        return { canManage: true }
      }
      
      if (args.action === 'view_details') {
        return { canManage: true }
      }
      
      return {
        canManage: false,
        reason: 'Cannot modify your own role or permissions',
      }
    }

    // Role-based permissions
    switch (args.action) {
      case 'view_details':
        // Members can view other members' basic details
        return { canManage: true }

      case 'remove':
        // Owners can remove anyone, admins with canManageMembers can remove members
        if (actorMembership.role === 'owner') {
          return { canManage: true }
        }
        
        if (actorMembership.permissions?.canManageMembers && targetMembership.role === 'member') {
          return { canManage: true }
        }
        
        return {
          canManage: false,
          reason: 'Insufficient permissions to remove this member',
        }

      case 'update_role':
        // Only owners can change roles
        if (actorMembership.role === 'owner') {
          return { canManage: true }
        }
        
        return {
          canManage: false,
          reason: 'Only owners can change member roles',
        }

      case 'update_permissions':
        // Owners can update anyone's permissions, users with canManageMembers can update non-owner permissions
        if (actorMembership.role === 'owner') {
          return { canManage: true }
        }
        
        if (actorMembership.permissions?.canManageMembers && targetMembership.role !== 'owner') {
          return { canManage: true }
        }
        
        return {
          canManage: false,
          reason: 'Insufficient permissions to update this member\'s permissions',
        }

      default:
        return {
          canManage: false,
          reason: 'Unknown action',
        }
    }
  },
})

// Get effective permissions (combining role-based and custom permissions)
export const getEffectivePermissions = query({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      return null
    }

    // Role-based default permissions
    const rolePermissions = {
      owner: {
        canManageInventory: true,
        canManageShoppingLists: true,
        canManageCategories: true,
        canInviteMembers: true,
        canManageMembers: true,
        canEditHouseholdSettings: true,
        canDeleteHousehold: true,
      },
      admin: {
        canManageInventory: true,
        canManageShoppingLists: true,
        canManageCategories: true,
        canInviteMembers: true,
        canManageMembers: false,
        canEditHouseholdSettings: true,
        canDeleteHousehold: false,
      },
      member: {
        canManageInventory: false,
        canManageShoppingLists: true,
        canManageCategories: false,
        canInviteMembers: false,
        canManageMembers: false,
        canEditHouseholdSettings: false,
        canDeleteHousehold: false,
      },
    }

    const defaultPermissions = rolePermissions[membership.role]
    
    // Merge with custom permissions (custom permissions can override role defaults)
    const effectivePermissions = {
      ...defaultPermissions,
      ...membership.permissions,
    }

    return {
      role: membership.role,
      permissions: effectivePermissions,
      isActive: membership.isActive,
      joinedAt: membership.joinedAt,
      lastActiveAt: membership.lastActiveAt,
    }
  },
})

// Check if household has reached member limit
export const checkMemberLimit = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId)
    if (!household) {
      return { hasLimit: false, canAddMembers: false, reason: 'Household not found' }
    }

    const maxMembers = household.settings?.maxMembers || 10
    const currentMemberCount = household.memberCount

    return {
      hasLimit: true,
      maxMembers,
      currentMemberCount,
      canAddMembers: currentMemberCount < maxMembers,
      remainingSlots: Math.max(0, maxMembers - currentMemberCount),
      reason: currentMemberCount >= maxMembers ? 'Household has reached maximum member limit' : null,
    }
  },
})