import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Enhanced user management with preferences
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    preferences: v.optional(v.object({
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      notifications: v.optional(v.object({
        expiration: v.boolean(),
        lowStock: v.boolean(),
        invitations: v.boolean(),
        activityFeed: v.boolean()
      }))
    })),
    isOnboarded: v.boolean(),
    lastSeenAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_clerk_id", ["clerkUserId"])
  .index("by_email", ["email"]),

  // Enhanced household management
  households: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(), // Clerk User ID
    settings: v.optional(v.object({
      currency: v.optional(v.string()),
      defaultUnit: v.optional(v.string()),
      expirationWarningDays: v.optional(v.number()),
      allowGuestView: v.optional(v.boolean())
    })),
    isActive: v.boolean(),
    memberCount: v.number(),
    inviteCode: v.optional(v.string()),
    inviteCodeExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_owner", ["ownerId"])
  .index("by_invite_code", ["inviteCode"])
  .index("by_active", ["isActive"]),

  // Household memberships with roles and permissions
  householdMemberships: defineTable({
    householdId: v.id("households"),
    userId: v.string(), // Clerk User ID
    role: v.union(
      v.literal("owner"),
      v.literal("admin"), 
      v.literal("member"),
      v.literal("viewer")
    ),
    permissions: v.array(v.union(
      v.literal("read"),
      v.literal("write"), 
      v.literal("delete"),
      v.literal("invite"),
      v.literal("manage_members"),
      v.literal("manage_settings")
    )),
    joinedAt: v.number(),
    invitedBy: v.optional(v.string()), // Clerk User ID
    lastActiveAt: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_user", ["userId"])
  .index("by_household_user", ["householdId", "userId"])
  .index("by_role", ["role"])
  .index("by_active", ["isActive"]),

  // Invitation system for household management
  householdInvitations: defineTable({
    householdId: v.id("households"),
    inviterUserId: v.string(), // Clerk User ID
    invitedEmail: v.string(),
    invitedUserId: v.optional(v.string()), // Set when user signs up
    role: v.union(
      v.literal("admin"),
      v.literal("member"), 
      v.literal("viewer")
    ),
    permissions: v.array(v.union(
      v.literal("read"),
      v.literal("write"),
      v.literal("delete"),
      v.literal("invite")
    )),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    token: v.string(),
    expiresAt: v.number(),
    respondedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_email", ["invitedEmail"])
  .index("by_token", ["token"])
  .index("by_status", ["status"])
  .index("by_invited_user", ["invitedUserId"])
  .index("by_expiry", ["expiresAt"]),

  // Product categories with hierarchy
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_slug", ["slug"])
  .index("by_parent", ["parentId"]),

  // Storage locations within household
  storageLocations: defineTable({
    householdId: v.id("households"),
    name: v.string(),
    type: v.union(v.literal("pantry"), v.literal("fridge"), v.literal("freezer"), v.literal("cabinet"), v.literal("other")),
    description: v.optional(v.string()),
    temperature: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_household", ["householdId"]),

  // Global product database
  products: defineTable({
    barcode: v.string(),
    name: v.string(),
    brand: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    nutritionFacts: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      fiber: v.optional(v.number()),
      sugar: v.optional(v.number())
    })),
    ingredients: v.optional(v.array(v.string())),
    allergens: v.optional(v.array(v.string())),
    verified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_barcode", ["barcode"])
  .searchIndex("search_products", {
    searchField: "name",
    filterFields: ["barcode", "brand", "categoryId"]
  }),

  // User's inventory items
  inventoryItems: defineTable({
    householdId: v.id("households"),
    productId: v.optional(v.id("products")),
    customName: v.optional(v.string()), // For items not in global product DB
    customBrand: v.optional(v.string()),
    customCategory: v.optional(v.string()),
    barcode: v.optional(v.string()),
    quantity: v.number(),
    unit: v.string(), // "pieces", "kg", "lbs", "liters", etc.
    storageLocationId: v.optional(v.id("storageLocations")),
    purchaseDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    cost: v.optional(v.number()),
    notes: v.optional(v.string()),
    addedBy: v.string(), // User ID
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_product", ["productId"])
  .index("by_storage_location", ["storageLocationId"])
  .index("by_expiration", ["expirationDate"])
  .searchIndex("search_inventory", {
    searchField: "customName",
    filterFields: ["householdId", "storageLocationId"]
  }),

  // Product barcodes for scanning
  productBarcodes: defineTable({
    productId: v.id("products"),
    barcode: v.string(),
    verified: v.boolean(),
    createdAt: v.number()
  })
  .index("by_barcode", ["barcode"])
  .index("by_product", ["productId"]),

  // Search history
  searches: defineTable({
    userId: v.string(),
    query: v.string(),
    createdAt: v.number()
  })
  .index("by_user", ["userId"])
  .index("by_user_query", ["userId", "query"]),

  // Enhanced activity feed for real-time updates
  activityFeed: defineTable({
    householdId: v.id("households"),
    userId: v.string(),
    type: v.union(
      v.literal("item_added"),
      v.literal("item_updated"),
      v.literal("item_removed"),
      v.literal("item_consumed"),
      v.literal("expiration_warning"),
      v.literal("member_joined"),
      v.literal("member_left"),
      v.literal("invitation_sent"),
      v.literal("household_created"),
      v.literal("household_updated")
    ),
    itemId: v.optional(v.id("inventoryItems")),
    itemName: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      location: v.optional(v.string()),
      memberName: v.optional(v.string()),
      memberEmail: v.optional(v.string())
    })),
    isRead: v.boolean(),
    createdAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_user", ["userId"])
  .index("by_type", ["type"])
  .index("by_unread", ["isRead"]),

  // Audit log for security and compliance
  auditLog: defineTable({
    householdId: v.optional(v.id("households")),
    userId: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.object({
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string())
    })),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    createdAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_user", ["userId"])
  .index("by_action", ["action"])
  .index("by_severity", ["severity"])
  .index("by_created_at", ["createdAt"])
})