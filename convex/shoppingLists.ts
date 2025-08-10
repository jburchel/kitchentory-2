import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Shopping list management functions
export const createShoppingList = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    householdId: v.id("households"),
    createdBy: v.string(),
    scheduledDate: v.optional(v.number()),
    estimatedBudget: v.optional(v.number()),
    storeLayoutId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    templateId: v.optional(v.id("shoppingListTemplates")),
    shareWithMembers: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Create the shopping list
    const listId = await ctx.db.insert("shoppingLists", {
      name: args.name,
      description: args.description,
      householdId: args.householdId,
      ownerId: args.createdBy,
      status: "active",
      isTemplate: false,
      itemCount: 0,
      completedItemCount: 0,
      totalEstimatedCost: args.estimatedBudget || 0,
      scheduledDate: args.scheduledDate,
      tags: args.tags,
      lastModifiedBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If template is specified, copy items from template
    if (args.templateId) {
      await ctx.runMutation(internal.shoppingLists.copyFromTemplate, {
        listId,
        templateId: args.templateId,
        createdBy: args.createdBy,
      });
    }

    // Share with specified members
    if (args.shareWithMembers && args.shareWithMembers.length > 0) {
      for (const userId of args.shareWithMembers) {
        await ctx.db.insert("shoppingListMembers", {
          listId,
          userId,
          role: "editor",
          canEdit: true,
          canAssignItems: true,
          canCompleteItems: true,
          canInviteOthers: false,
          joinedAt: Date.now(),
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // Log activity
    await ctx.runMutation(internal.activityFeed.logActivity, {
      householdId: args.householdId,
      userId: args.createdBy,
      type: "shopping_list_created",
      itemName: args.name,
      details: `Created shopping list "${args.name}"`,
    });

    return listId;
  },
});

export const getShoppingLists = query({
  args: {
    householdId: v.id("households"),
    userId: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    let listsQuery = ctx.db
      .query("shoppingLists")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId));

    if (args.status) {
      listsQuery = listsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const lists = await listsQuery.collect();

    // Get lists where user is owner or member
    const userLists = [];
    for (const list of lists) {
      if (list.ownerId === args.userId) {
        userLists.push(list);
      } else {
        const membership = await ctx.db
          .query("shoppingListMembers")
          .withIndex("by_list_user", (q) => q.eq("listId", list._id).eq("userId", args.userId))
          .first();
        if (membership && membership.isActive) {
          userLists.push(list);
        }
      }
    }

    // Enrich with additional data
    const enrichedLists = await Promise.all(
      userLists.map(async (list) => {
        const items = await ctx.db
          .query("shoppingListItems")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();

        const members = await ctx.db
          .query("shoppingListMembers")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", list.ownerId))
          .first();

        return {
          ...list,
          items: items.length,
          completedItems: items.filter((item) => item.status === "purchased").length,
          members: members.length,
          owner: owner ? { name: owner.name, email: owner.email } : null,
          progress: {
            percentComplete: items.length > 0 ? Math.round((items.filter((item) => item.status === "purchased").length / items.length) * 100) : 0,
            itemsRemaining: items.filter((item) => item.status === "pending").length,
          },
        };
      })
    );

    return enrichedLists;
  },
});

export const getShoppingList = query({
  args: {
    listId: v.id("shoppingLists"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Check if user has access
    const hasAccess = list.ownerId === args.userId ||
      (await ctx.db
        .query("shoppingListMembers")
        .withIndex("by_list_user", (q) => q.eq("listId", args.listId).eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first()) !== null;

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // Get list items
    const items = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    // Get members
    const members = await ctx.db
      .query("shoppingListMembers")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", member.userId))
          .first();
        return {
          ...member,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return {
      ...list,
      items,
      members: enrichedMembers,
    };
  },
});

export const addItemToList = mutation({
  args: {
    listId: v.id("shoppingLists"),
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    brand: v.optional(v.string()),
    size: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    inventoryItemId: v.optional(v.id("inventoryItems")),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Check permissions
    const canEdit = list.ownerId === args.addedBy ||
      (await ctx.db
        .query("shoppingListMembers")
        .withIndex("by_list_user", (q) => q.eq("listId", args.listId).eq("userId", args.addedBy))
        .filter((q) => q.eq(q.field("canEdit"), true))
        .first()) !== null;

    if (!canEdit) {
      throw new Error("Permission denied");
    }

    // Add the item
    const itemId = await ctx.db.insert("shoppingListItems", {
      listId: args.listId,
      name: args.name,
      category: args.category as any,
      quantity: args.quantity,
      unit: args.unit,
      status: "pending",
      priority: args.priority,
      estimatedCost: args.estimatedCost,
      notes: args.notes,
      assignedTo: args.assignedTo,
      inventoryItemId: args.inventoryItemId,
      brand: args.brand,
      size: args.size,
      addedBy: args.addedBy,
      lastModifiedBy: args.addedBy,
      displayOrder: await getNextDisplayOrder(ctx, args.listId),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update list item count and cost
    await updateListStats(ctx, args.listId);

    // Log activity
    await ctx.runMutation(internal.activityFeed.logActivity, {
      householdId: list.householdId,
      userId: args.addedBy,
      type: "shopping_item_added",
      itemName: args.name,
      details: `Added "${args.name}" to shopping list "${list.name}"`,
      metadata: {
        quantity: args.quantity,
        unit: args.unit,
      },
    });

    return itemId;
  },
});

export const updateShoppingItem = mutation({
  args: {
    itemId: v.id("shoppingListItems"),
    userId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      estimatedCost: v.optional(v.number()),
      actualCost: v.optional(v.number()),
      notes: v.optional(v.string()),
      assignedTo: v.optional(v.string()),
      status: v.optional(v.union(v.literal("pending"), v.literal("purchased"), v.literal("unavailable"), v.literal("substituted"))),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Check permissions
    const canEdit = list.ownerId === args.userId ||
      (await ctx.db
        .query("shoppingListMembers")
        .withIndex("by_list_user", (q) => q.eq("listId", item.listId).eq("userId", args.userId))
        .filter((q) => q.eq(q.field("canEdit"), true))
        .first()) !== null;

    if (!canEdit) {
      throw new Error("Permission denied");
    }

    // Update the item
    await ctx.db.patch(args.itemId, {
      ...args.updates,
      lastModifiedBy: args.userId,
      updatedAt: Date.now(),
      purchasedAt: args.updates.status === "purchased" ? Date.now() : item.purchasedAt,
    });

    // Update list stats
    await updateListStats(ctx, item.listId);

    return args.itemId;
  },
});

export const deleteShoppingItem = mutation({
  args: {
    itemId: v.id("shoppingListItems"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Check permissions
    const canEdit = list.ownerId === args.userId ||
      (await ctx.db
        .query("shoppingListMembers")
        .withIndex("by_list_user", (q) => q.eq("listId", item.listId).eq("userId", args.userId))
        .filter((q) => q.eq(q.field("canEdit"), true))
        .first()) !== null;

    if (!canEdit) {
      throw new Error("Permission denied");
    }

    await ctx.db.delete(args.itemId);
    await updateListStats(ctx, item.listId);

    return args.itemId;
  },
});

export const generateSmartSuggestions = query({
  args: {
    householdId: v.id("households"),
    userId: v.string(),
    maxSuggestions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.maxSuggestions || 10;
    const suggestions = [];

    // Get low stock items
    const lowStockItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.lte(q.field("quantity"), 2))
      .take(limit);

    for (const item of lowStockItems) {
      suggestions.push({
        itemName: item.customName || 'Unknown Item',
        category: item.customCategory || 'pantry',
        reason: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
        priority: item.quantity === 0 ? 95 : 80,
        confidence: 0.9,
        suggestedQuantity: Math.max(1, item.quantity * 2),
        suggestedUnit: item.unit,
        inventoryItemId: item._id,
      });
    }

    // Get expiring items
    const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000);
    const expiringItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => 
        q.and(
          q.neq(q.field("expirationDate"), undefined),
          q.lte(q.field("expirationDate"), threeDaysFromNow)
        )
      )
      .take(limit - suggestions.length);

    for (const item of expiringItems) {
      if (suggestions.length >= limit) break;
      
      suggestions.push({
        itemName: item.customName || 'Unknown Item',
        category: item.customCategory || 'pantry',
        reason: 'recurring_purchase',
        priority: 70,
        confidence: 0.75,
        suggestedQuantity: item.quantity,
        suggestedUnit: item.unit,
        inventoryItemId: item._id,
      });
    }

    return suggestions;
  },
});

// Internal functions
export const copyFromTemplate = internalMutation({
  args: {
    listId: v.id("shoppingLists"),
    templateId: v.id("shoppingListTemplates"),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    let displayOrder = 0;
    for (const item of template.items) {
      await ctx.db.insert("shoppingListItems", {
        listId: args.listId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        status: "pending",
        priority: item.priority,
        estimatedCost: item.estimatedCost,
        notes: item.notes,
        addedBy: args.createdBy,
        lastModifiedBy: args.createdBy,
        displayOrder: displayOrder++,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Update template usage count
    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });
  },
});

// Helper functions
async function updateListStats(ctx: any, listId: Id<"shoppingLists">) {
  const items = await ctx.db
    .query("shoppingListItems")
    .withIndex("by_list", (q) => q.eq("listId", listId))
    .collect();

  const completedItems = items.filter((item: any) => item.status === "purchased");
  const totalEstimatedCost = items.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0);

  await ctx.db.patch(listId, {
    itemCount: items.length,
    completedItemCount: completedItems.length,
    totalEstimatedCost,
    lastModifiedBy: "system",
    updatedAt: Date.now(),
  });
}

async function getNextDisplayOrder(ctx: any, listId: Id<"shoppingLists">): Promise<number> {
  const items = await ctx.db
    .query("shoppingListItems")
    .withIndex("by_list", (q) => q.eq("listId", listId))
    .collect();

  return items.length;
}