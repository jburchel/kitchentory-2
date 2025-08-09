import { internalMutation } from "../_generated/server"
import { seedData } from "./sampleData"
import type { Doc, Id } from "../_generated/dataModel"

// Main seed function that populates the database with sample data
export const seedDatabase = internalMutation({
  handler: async (ctx) => {
    console.log("🌱 Starting database seeding...")

    try {
      // Clear existing data (development only)
      await clearDatabase(ctx)

      // Create households
      console.log("Creating households...")
      const householdIds: Id<"households">[] = []
      
      for (const householdData of seedData.households) {
        const householdId = await ctx.db.insert("households", {
          ...householdData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        householdIds.push(householdId)

        // Add default admin user for each household
        await ctx.db.insert("householdMembers", {
          householdId,
          userId: `admin-${Math.random().toString(36).substring(7)}`,
          role: "owner",
          permissions: {
            canManageInventory: true,
            canManageShoppingLists: true,
            canManageCategories: true,
            canInviteMembers: true,
          },
          joinedAt: Date.now(),
        })
      }

      // Create categories for each household
      console.log("Creating categories...")
      const categoryMap = new Map<string, Id<"categories">>()
      
      for (const householdId of householdIds) {
        // Create root categories
        for (const categoryData of seedData.categories) {
          const categoryId = await ctx.db.insert("categories", {
            ...categoryData,
            householdId,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          categoryMap.set(`${householdId}-${categoryData.name}`, categoryId)
        }

        // Create subcategories
        for (const subcategoryData of seedData.subcategories) {
          const parentCategoryId = categoryMap.get(`${householdId}-${subcategoryData.parentCategory}`)
          if (parentCategoryId) {
            const subcategoryId = await ctx.db.insert("categories", {
              name: subcategoryData.name,
              description: subcategoryData.description,
              color: subcategoryData.color,
              icon: subcategoryData.icon,
              householdId,
              parentCategoryId,
              isActive: true,
              sortOrder: subcategoryData.sortOrder,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
            categoryMap.set(`${householdId}-${subcategoryData.name}`, subcategoryId)
          }
        }
      }

      // Create products for each household
      console.log("Creating products...")
      const productMap = new Map<string, Id<"products">>()
      
      for (const householdId of householdIds) {
        for (const productData of seedData.products) {
          const categoryId = categoryData.category 
            ? categoryMap.get(`${householdId}-${productData.category}`)
            : undefined

          const productId = await ctx.db.insert("products", {
            name: productData.name,
            brand: productData.brand,
            description: productData.description,
            householdId,
            categoryId,
            barcode: productData.barcode,
            defaultUnit: productData.defaultUnit,
            defaultShelfLifeDays: productData.defaultShelfLifeDays,
            nutritionalInfo: productData.nutritionalInfo,
            tags: productData.tags,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          productMap.set(`${householdId}-${productData.name}`, productId)
        }
      }

      // Create inventory items (only for the first household to avoid duplication)
      console.log("Creating inventory items...")
      const firstHousehold = householdIds[0]
      
      for (const inventoryData of seedData.inventoryItems) {
        const productId = productMap.get(`${firstHousehold}-${inventoryData.product}`)
        if (productId) {
          await ctx.db.insert("inventoryItems", {
            householdId: firstHousehold,
            productId,
            quantity: inventoryData.quantity,
            unit: inventoryData.unit,
            location: inventoryData.location,
            purchaseDate: inventoryData.purchaseDate,
            expirationDate: inventoryData.expirationDate,
            purchasePrice: inventoryData.purchasePrice,
            notes: inventoryData.notes,
            isConsumed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
      }

      // Create shopping lists
      console.log("Creating shopping lists...")
      const adminUserId = `admin-${Math.random().toString(36).substring(7)}`
      
      for (const listData of seedData.shoppingLists) {
        const shoppingListId = await ctx.db.insert("shoppingLists", {
          householdId: firstHousehold,
          name: listData.name,
          description: listData.description,
          isActive: true,
          isCompleted: false,
          createdBy: adminUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        // Add items to shopping list
        for (const itemData of listData.items) {
          const productId = itemData.product 
            ? productMap.get(`${firstHousehold}-${itemData.product}`)
            : undefined

          await ctx.db.insert("shoppingListItems", {
            shoppingListId,
            productId,
            customName: itemData.customName,
            quantity: itemData.quantity,
            unit: itemData.unit,
            estimatedPrice: itemData.estimatedPrice,
            notes: itemData.notes,
            isCompleted: false,
            priority: itemData.priority,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
      }

      // Create sample notifications
      console.log("Creating notifications...")
      for (const notificationData of seedData.notifications) {
        await ctx.db.insert("notifications", {
          householdId: firstHousehold,
          userId: adminUserId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          isRead: false,
          metadata: notificationData.metadata,
          createdAt: Date.now(),
        })
      }

      // Create some activity log entries
      console.log("Creating activity log entries...")
      const activities = [
        {
          action: "create_household",
          resourceType: "households",
          resourceId: firstHousehold,
          metadata: { source: "seed_data" },
        },
        {
          action: "add_product",
          resourceType: "products",
          resourceId: productMap.get(`${firstHousehold}-Organic Bananas`) || "",
          metadata: { productName: "Organic Bananas" },
        },
        {
          action: "update_inventory",
          resourceType: "inventoryItems",
          resourceId: "sample_inventory_item",
          oldValues: { quantity: 2 },
          newValues: { quantity: 1 },
          metadata: { action_type: "consume" },
        },
      ]

      for (const activityData of activities) {
        await ctx.db.insert("activityLog", {
          householdId: firstHousehold,
          userId: adminUserId,
          action: activityData.action,
          resourceType: activityData.resourceType,
          resourceId: activityData.resourceId,
          oldValues: activityData.oldValues,
          newValues: activityData.newValues,
          metadata: activityData.metadata,
          createdAt: Date.now(),
        })
      }

      console.log("✅ Database seeding completed successfully!")
      
      return {
        success: true,
        summary: {
          households: householdIds.length,
          categories: categoryMap.size,
          products: productMap.size,
          inventoryItems: seedData.inventoryItems.length,
          shoppingLists: seedData.shoppingLists.length,
          notifications: seedData.notifications.length,
          activityEntries: activities.length,
        },
      }

    } catch (error) {
      console.error("❌ Error seeding database:", error)
      throw error
    }
  },
})

// Helper function to clear database (development only)
async function clearDatabase(ctx: any) {
  console.log("🧹 Clearing existing data...")

  // Delete in reverse dependency order
  const tables = [
    "activityLog",
    "notifications", 
    "shoppingListItems",
    "shoppingLists",
    "inventoryItems",
    "products",
    "categories",
    "householdMembers",
    "households",
  ] as const

  for (const table of tables) {
    const items = await ctx.db.query(table).collect()
    for (const item of items) {
      await ctx.db.delete(item._id)
    }
    console.log(`  Cleared ${items.length} items from ${table}`)
  }
}

// Quick seed function for testing (smaller dataset)
export const quickSeed = internalMutation({
  handler: async (ctx) => {
    console.log("🚀 Quick seeding for testing...")

    // Create one household
    const householdId = await ctx.db.insert("households", {
      name: "Test Household",
      description: "Quick test household",
      currency: "USD",
      timezone: "UTC",
      settings: {
        defaultShelfLifeDays: 7,
        lowStockThreshold: 2,
        enableNotifications: true,
        showNutritionalInfo: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Add admin user
    const adminUserId = "test-admin"
    await ctx.db.insert("householdMembers", {
      householdId,
      userId: adminUserId,
      role: "owner",
      permissions: {
        canManageInventory: true,
        canManageShoppingLists: true,
        canManageCategories: true,
        canInviteMembers: true,
      },
      joinedAt: Date.now(),
    })

    // Create basic categories
    const produceCategory = await ctx.db.insert("categories", {
      householdId,
      name: "Produce",
      description: "Fresh fruits and vegetables",
      color: "#4CAF50",
      icon: "🥬",
      isActive: true,
      sortOrder: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create basic products
    const bananaProduct = await ctx.db.insert("products", {
      householdId,
      name: "Bananas",
      categoryId: produceCategory,
      defaultUnit: "bunch",
      defaultShelfLifeDays: 5,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create inventory item
    await ctx.db.insert("inventoryItems", {
      householdId,
      productId: bananaProduct,
      quantity: 1,
      unit: "bunch",
      location: "Counter",
      expirationDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
      isConsumed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    console.log("✅ Quick seed completed!")
    
    return {
      success: true,
      householdId,
      adminUserId,
    }
  },
})