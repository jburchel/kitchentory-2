import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users - Clerk integration
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

  // User sessions for tracking
  userSessions: defineTable({
    userId: v.string(), // Clerk user ID
    sessionId: v.string(), // Clerk session ID
    isActive: v.boolean(),
    lastActiveAt: v.number(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_session', ['sessionId'])
    .index('by_user_active', ['userId', 'isActive']),

  // Households - Multi-tenant support
  households: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
        defaultView: v.optional(v.string()), // 'inventory', 'shopping', 'dashboard'
        measurementSystem: v.optional(v.string()), // 'metric', 'imperial'
        dateFormat: v.optional(v.string()),
        language: v.optional(v.string()),
      })
    ),
    isActive: v.boolean(),
    memberCount: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_created_by', ['createdBy'])
    .index('by_active', ['isActive']),


  // Household invitations
  householdInvitations: defineTable({
    householdId: v.id('households'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
    invitedBy: v.string(), // User ID of inviter
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('expired')
    ),
    inviteToken: v.string(),
    expiresAt: v.number(),
    message: v.optional(v.string()),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_email', ['email'])
    .index('by_token', ['inviteToken'])
    .index('by_household_status', ['householdId', 'status'])
    .index('by_email_status', ['email', 'status']),

  // Household members
  householdMembers: defineTable({
    householdId: v.id('households'),
    userId: v.string(), // Auth user ID
    role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
    permissions: v.optional(
      v.object({
        canManageInventory: v.optional(v.boolean()),
        canManageShoppingLists: v.optional(v.boolean()),
        canManageCategories: v.optional(v.boolean()),
        canInviteMembers: v.optional(v.boolean()),
        canManageMembers: v.optional(v.boolean()),
        canEditHouseholdSettings: v.optional(v.boolean()),
        canDeleteHousehold: v.optional(v.boolean()),
      })
    ),
    isActive: v.boolean(),
    lastActiveAt: v.optional(v.number()),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_user', ['userId'])
    .index('by_household_user', ['householdId', 'userId'])
    .index('by_household_active', ['householdId', 'isActive'])
    .index('by_user_active', ['userId', 'isActive']),

  // Categories for organization
  categories: defineTable({
    householdId: v.id('households'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentCategoryId: v.optional(v.id('categories')),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_household_active', ['householdId', 'isActive'])
    .index('by_parent', ['parentCategoryId']),

  // Products master list
  products: defineTable({
    householdId: v.id('households'),
    name: v.string(),
    brand: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id('categories')),
    barcode: v.optional(v.string()),
    defaultUnit: v.optional(v.string()),
    defaultShelfLifeDays: v.optional(v.number()),
    nutritionalInfo: v.optional(
      v.object({
        servingSize: v.optional(v.string()),
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fat: v.optional(v.number()),
        fiber: v.optional(v.number()),
        sugar: v.optional(v.number()),
        sodium: v.optional(v.number()),
      })
    ),
    tags: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_household_active', ['householdId', 'isActive'])
    .index('by_category', ['categoryId'])
    .index('by_barcode', ['barcode'])
    .index('by_household_name', ['householdId', 'name']),

  // Inventory items - actual items in the kitchen
  inventoryItems: defineTable({
    householdId: v.id('households'),
    productId: v.id('products'),
    quantity: v.number(),
    unit: v.optional(v.string()),
    location: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    isConsumed: v.boolean(),
    consumedAt: v.optional(v.number()),
    consumedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_product', ['productId'])
    .index('by_household_active', ['householdId', 'isConsumed'])
    .index('by_expiration', ['expirationDate'])
    .index('by_household_expiration', ['householdId', 'expirationDate'])
    .index('by_location', ['location']),

  // Shopping lists
  shoppingLists: defineTable({
    householdId: v.id('households'),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    isCompleted: v.boolean(),
    createdBy: v.string(), // User ID
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_household_active', ['householdId', 'isActive'])
    .index('by_created_by', ['createdBy']),

  // Shopping list items
  shoppingListItems: defineTable({
    shoppingListId: v.id('shoppingLists'),
    productId: v.optional(v.id('products')),
    customName: v.optional(v.string()),
    quantity: v.number(),
    unit: v.optional(v.string()),
    estimatedPrice: v.optional(v.number()),
    actualPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'))
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_shopping_list', ['shoppingListId'])
    .index('by_product', ['productId'])
    .index('by_list_completed', ['shoppingListId', 'isCompleted']),

  // Notifications
  notifications: defineTable({
    householdId: v.id('households'),
    userId: v.string(),
    type: v.union(
      v.literal('expiration_warning'),
      v.literal('low_stock'),
      v.literal('shopping_list_shared'),
      v.literal('inventory_updated')
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()), // ID of related item
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_user', ['userId'])
    .index('by_user_read', ['userId', 'isRead'])
    .index('by_type', ['type']),

  // Activity log for audit trail
  activityLog: defineTable({
    householdId: v.id('households'),
    userId: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_user', ['userId'])
    .index('by_resource', ['resourceType', 'resourceId'])
    .index('by_household_date', ['householdId', 'createdAt']),
})
