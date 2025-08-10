import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // User management
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_clerk_id", ["clerkUserId"]),

  // Household management for family sharing
  households: defineTable({
    name: v.string(),
    ownerId: v.string(), // User ID
    members: v.array(v.string()), // Array of user IDs
    inviteCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_owner", ["ownerId"])
  .index("by_invite_code", ["inviteCode"]),

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

  // Activity feed for real-time updates
  activityFeed: defineTable({
    householdId: v.id("households"),
    userId: v.string(),
    type: v.union(
      v.literal("item_added"),
      v.literal("item_updated"),
      v.literal("item_removed"),
      v.literal("item_consumed"),
      v.literal("expiration_warning")
    ),
    itemId: v.optional(v.id("inventoryItems")),
    itemName: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      location: v.optional(v.string())
    })),
    createdAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_user", ["userId"])
  .index("by_type", ["type"]),

  // Permissions for household management
  permissions: defineTable({
    householdId: v.id("households"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.array(v.string()), // ["read", "write", "delete", "invite", "manage"]
    grantedBy: v.string(), // User ID
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_household", ["householdId"])
  .index("by_user", ["userId"])
  .index("by_household_user", ["householdId", "userId"])
})