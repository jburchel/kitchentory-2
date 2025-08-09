import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { ConvexError } from 'convex/values'

// Create a new household
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const householdId = await ctx.db.insert('households', {
      name: args.name,
      description: args.description,
      currency: args.currency || 'USD',
      timezone: args.timezone || 'UTC',
      imageUrl: args.imageUrl,
      settings: {
        defaultShelfLifeDays: 7,
        lowStockThreshold: 2,
        enableNotifications: true,
        showNutritionalInfo: true,
        allowGuestAccess: false,
        requireApprovalForNewMembers: false,
        maxMembers: 10,
        theme: 'default',
      },
      preferences: {
        defaultView: 'dashboard',
        measurementSystem: 'metric',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
      },
      isActive: true,
      memberCount: 1,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
    })

    // Add the creator as the owner
    await ctx.db.insert('householdMembers', {
      householdId,
      userId: args.userId,
      role: 'owner',
      permissions: {
        canManageInventory: true,
        canManageShoppingLists: true,
        canManageCategories: true,
        canInviteMembers: true,
        canManageMembers: true,
        canEditHouseholdSettings: true,
        canDeleteHousehold: true,
      },
      isActive: true,
      lastActiveAt: now,
      joinedAt: now,
      updatedAt: now,
    })

    return householdId
  },
})

// Alias for create function for consistent naming
export const createHousehold = create

// Get household by ID
export const get = query({
  args: { id: v.id('households') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// List households for a user
export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect()

    const households = await Promise.all(
      memberships.map(async membership => {
        const household = await ctx.db.get(membership.householdId)
        return {
          ...household,
          role: membership.role,
          permissions: membership.permissions,
        }
      })
    )

    return households.filter(Boolean)
  },
})

// Update household
export const update = mutation({
  args: {
    id: v.id('households'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    userId: v.string(), // For permission checking
    settings: v.optional(
      v.object({
        defaultShelfLifeDays: v.optional(v.number()),
        lowStockThreshold: v.optional(v.number()),
        enableNotifications: v.optional(v.boolean()),
        showNutritionalInfo: v.optional(v.boolean()),
        allowGuestAccess: v.optional(v.boolean()),
        requireApprovalForNewMembers: v.optional(v.boolean()),
        maxMembers: v.optional(v.number()),
        theme: v.optional(v.string()),
      })
    ),
    preferences: v.optional(
      v.object({
        defaultView: v.optional(v.string()),
        measurementSystem: v.optional(v.string()),
        dateFormat: v.optional(v.string()),
        language: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args

    // Check permissions
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', id).eq('userId', userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      throw new Error('You are not a member of this household')
    }

    if (!membership.permissions?.canEditHouseholdSettings) {
      throw new Error('You do not have permission to edit household settings')
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return id
  },
})

// Delete household
export const remove = mutation({
  args: { 
    id: v.id('households'),
    userId: v.string(), // For permission checking
  },
  handler: async (ctx, args) => {
    // Check if user has permission to delete
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.id).eq('userId', args.userId)
      )
      .first()

    if (!membership || !membership.isActive) {
      throw new Error('You are not a member of this household')
    }

    if (!membership.permissions?.canDeleteHousehold) {
      throw new Error('You do not have permission to delete this household')
    }

    // Delete all related data
    const members = await ctx.db
      .query('householdMembers')
      .withIndex('by_household', q => q.eq('householdId', args.id))
      .collect()

    const categories = await ctx.db
      .query('categories')
      .withIndex('by_household', q => q.eq('householdId', args.id))
      .collect()

    const products = await ctx.db
      .query('products')
      .withIndex('by_household', q => q.eq('householdId', args.id))
      .collect()

    const inventoryItems = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household', q => q.eq('householdId', args.id))
      .collect()

    const shoppingLists = await ctx.db
      .query('shoppingLists')
      .withIndex('by_household', q => q.eq('householdId', args.id))
      .collect()

    // Delete in reverse dependency order
    for (const item of inventoryItems) {
      await ctx.db.delete(item._id)
    }

    for (const list of shoppingLists) {
      const listItems = await ctx.db
        .query('shoppingListItems')
        .withIndex('by_shopping_list', q => q.eq('shoppingListId', list._id))
        .collect()

      for (const listItem of listItems) {
        await ctx.db.delete(listItem._id)
      }

      await ctx.db.delete(list._id)
    }

    for (const product of products) {
      await ctx.db.delete(product._id)
    }

    for (const category of categories) {
      await ctx.db.delete(category._id)
    }

    for (const member of members) {
      await ctx.db.delete(member._id)
    }

    await ctx.db.delete(args.id)

    return args.id
  },
})

// Get household members
export const getMembers = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('householdMembers')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()
  },
})

// Add member to household (internal use, typically called from invitation acceptance)
export const addMember = mutation({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if adder has permission
    const adderMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.addedBy)
      )
      .first()

    if (!adderMembership || !adderMembership.isActive) {
      throw new Error('You are not a member of this household')
    }

    if (!adderMembership.permissions?.canManageMembers) {
      throw new Error('You do not have permission to add members')
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (existingMembership) {
      throw new Error('User is already a member of this household')
    }

    const now = Date.now()

    const membershipId = await ctx.db.insert('householdMembers', {
      householdId: args.householdId,
      userId: args.userId,
      role: args.role,
      permissions: {
        canManageInventory: args.role === 'admin',
        canManageShoppingLists: true,
        canManageCategories: args.role === 'admin',
        canInviteMembers: args.role === 'admin',
        canManageMembers: false,
        canEditHouseholdSettings: args.role === 'admin',
        canDeleteHousehold: false,
      },
      isActive: true,
      lastActiveAt: now,
      joinedAt: now,
      updatedAt: now,
    })

    // Update household member count
    const household = await ctx.db.get(args.householdId)
    if (household) {
      await ctx.db.patch(args.householdId, {
        memberCount: household.memberCount + 1,
        updatedAt: now,
      })
    }

    return membershipId
  },
})

// Remove member from household
export const removeMember = mutation({
  args: {
    householdId: v.id('households'),
    userIdToRemove: v.string(),
    removedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if remover has permission
    const removerMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.removedBy)
      )
      .first()

    if (!removerMembership || !removerMembership.isActive) {
      throw new Error('You are not a member of this household')
    }

    const memberToRemove = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userIdToRemove)
      )
      .first()

    if (!memberToRemove) {
      throw new Error('Member not found')
    }

    // Check permissions - owners can remove anyone, admins can remove members, members can only remove themselves
    const canRemove = 
      removerMembership.role === 'owner' ||
      (removerMembership.permissions?.canManageMembers && memberToRemove.role === 'member') ||
      args.removedBy === args.userIdToRemove

    if (!canRemove) {
      throw new Error('You do not have permission to remove this member')
    }

    // Cannot remove the last owner
    if (memberToRemove.role === 'owner') {
      const ownerCount = await ctx.db
        .query('householdMembers')
        .withIndex('by_household', q => q.eq('householdId', args.householdId))
        .filter(q => q.eq(q.field('role'), 'owner'))
        .collect()
      
      if (ownerCount.length <= 1) {
        throw new Error('Cannot remove the last owner of the household')
      }
    }

    await ctx.db.delete(memberToRemove._id)

    // Update household member count
    const household = await ctx.db.get(args.householdId)
    if (household) {
      await ctx.db.patch(args.householdId, {
        memberCount: Math.max(0, household.memberCount - 1),
        updatedAt: Date.now(),
      })
    }

    return memberToRemove._id
  },
})

// Update member role and permissions
export const updateMemberRole = mutation({
  args: {
    householdId: v.id('households'),
    userIdToUpdate: v.string(),
    newRole: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if updater has permission
    const updaterMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.updatedBy)
      )
      .first()

    if (!updaterMembership || !updaterMembership.isActive) {
      throw new Error('You are not a member of this household')
    }

    const memberToUpdate = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userIdToUpdate)
      )
      .first()

    if (!memberToUpdate) {
      throw new Error('Member not found')
    }

    // Only owners can change roles, and they can't demote themselves if they're the last owner
    if (updaterMembership.role !== 'owner') {
      throw new Error('Only owners can change member roles')
    }

    // Prevent demoting the last owner
    if (memberToUpdate.role === 'owner' && args.newRole !== 'owner') {
      const ownerCount = await ctx.db
        .query('householdMembers')
        .withIndex('by_household', q => q.eq('householdId', args.householdId))
        .filter(q => q.eq(q.field('role'), 'owner'))
        .collect()
      
      if (ownerCount.length <= 1) {
        throw new Error('Cannot demote the last owner of the household')
      }
    }

    // Set permissions based on role
    const permissions = {
      canManageInventory: args.newRole === 'admin' || args.newRole === 'owner',
      canManageShoppingLists: true,
      canManageCategories: args.newRole === 'admin' || args.newRole === 'owner',
      canInviteMembers: args.newRole === 'admin' || args.newRole === 'owner',
      canManageMembers: args.newRole === 'owner',
      canEditHouseholdSettings: args.newRole === 'admin' || args.newRole === 'owner',
      canDeleteHousehold: args.newRole === 'owner',
    }

    await ctx.db.patch(memberToUpdate._id, {
      role: args.newRole,
      permissions,
      updatedAt: Date.now(),
    })

    return memberToUpdate._id
  },
})

// Update member permissions (custom permissions)
export const updateMemberPermissions = mutation({
  args: {
    householdId: v.id('households'),
    userIdToUpdate: v.string(),
    permissions: v.object({
      canManageInventory: v.optional(v.boolean()),
      canManageShoppingLists: v.optional(v.boolean()),
      canManageCategories: v.optional(v.boolean()),
      canInviteMembers: v.optional(v.boolean()),
      canManageMembers: v.optional(v.boolean()),
      canEditHouseholdSettings: v.optional(v.boolean()),
      canDeleteHousehold: v.optional(v.boolean()),
    }),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if updater has permission
    const updaterMembership = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.updatedBy)
      )
      .first()

    if (!updaterMembership || !updaterMembership.isActive) {
      throw new Error('You are not a member of this household')
    }

    if (!updaterMembership.permissions?.canManageMembers) {
      throw new Error('You do not have permission to manage member permissions')
    }

    const memberToUpdate = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userIdToUpdate)
      )
      .first()

    if (!memberToUpdate) {
      throw new Error('Member not found')
    }

    // Cannot modify owner permissions unless you're an owner
    if (memberToUpdate.role === 'owner' && updaterMembership.role !== 'owner') {
      throw new Error('Cannot modify owner permissions')
    }

    // Merge with existing permissions
    const updatedPermissions = {
      ...memberToUpdate.permissions,
      ...args.permissions,
    }

    await ctx.db.patch(memberToUpdate._id, {
      permissions: updatedPermissions,
      updatedAt: Date.now(),
    })

    return memberToUpdate._id
  },
})

// Get member details with user info
export const getMembersWithUserInfo = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('householdMembers')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    // Get user details for each member
    return await Promise.all(
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
  },
})

// Update member activity timestamp
export const updateMemberActivity = mutation({
  args: {
    householdId: v.id('households'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('householdMembers')
      .withIndex('by_household_user', q =>
        q.eq('householdId', args.householdId).eq('userId', args.userId)
      )
      .first()

    if (member && member.isActive) {
      await ctx.db.patch(member._id, {
        lastActiveAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return member?._id
  },
})

// Get household stats
export const getHouseholdStats = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId)
    if (!household) return null

    const members = await ctx.db
      .query('householdMembers')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    const activeMembers = members.filter(m => m.isActive)
    const invitations = await ctx.db
      .query('householdInvitations')
      .withIndex('by_household_status', q =>
        q.eq('householdId', args.householdId).eq('status', 'pending')
      )
      .collect()

    // Get inventory and other stats
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

    return {
      household,
      memberCount: activeMembers.length,
      pendingInvitations: invitations.length,
      inventoryItemCount: inventoryItems.length,
      activeShoppingLists: shoppingLists.length,
      roles: {
        owners: members.filter(m => m.role === 'owner').length,
        admins: members.filter(m => m.role === 'admin').length,
        members: members.filter(m => m.role === 'member').length,
      },
      createdAt: household.createdAt,
      lastActivity: Math.max(
        ...members.map(m => m.lastActiveAt || m.joinedAt),
        household.updatedAt
      ),
    }
  },
})
