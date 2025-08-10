import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Create a new shopping list
export const create = mutation({
  args: {
    householdId: v.id('households'),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('shoppingLists', {
      householdId: args.householdId,
      name: args.name,
      description: args.description,
      isActive: true,
      isCompleted: false,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get shopping list by ID
export const get = query({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// List shopping lists for a household
export const listForHousehold = query({
  args: {
    householdId: v.id('households'),
    activeOnly: v.optional(v.boolean()),
    completedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('shoppingLists')

    if (args.activeOnly) {
      query = query.withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
    } else {
      query = query.withIndex('by_household', q =>
        q.eq('householdId', args.householdId)
      )
    }

    let results = await query.order('desc').collect()

    if (args.completedOnly !== undefined) {
      results = results.filter(list => list.isCompleted === args.completedOnly)
    }

    return results
  },
})

// Get shopping list with items
export const getWithItems = query({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id)
    if (!list) return null

    const items = await ctx.db
      .query('shoppingListItems')
      .withIndex('by_shopping_list', q => q.eq('shoppingListId', args.id))
      .collect()

    const itemsWithProducts = await Promise.all(
      items.map(async item => {
        const product = item.productId ? await ctx.db.get(item.productId) : null
        return {
          ...item,
          product,
        }
      })
    )

    return {
      ...list,
      items: itemsWithProducts,
    }
  },
})

// Update shopping list
export const update = mutation({
  args: {
    id: v.id('shoppingLists'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return id
  },
})

// Complete shopping list
export const complete = mutation({
  args: {
    id: v.id('shoppingLists'),
    completedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.id, {
      isCompleted: true,
      completedAt: now,
      completedBy: args.completedBy,
      updatedAt: now,
    })

    return args.id
  },
})

// Delete shopping list
export const remove = mutation({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    // Delete all items first
    const items = await ctx.db
      .query('shoppingListItems')
      .withIndex('by_shopping_list', q => q.eq('shoppingListId', args.id))
      .collect()

    for (const item of items) {
      await ctx.db.delete(item._id)
    }

    // Delete the list
    await ctx.db.delete(args.id)
    return args.id
  },
})

// Add item to shopping list
export const addItem = mutation({
  args: {
    shoppingListId: v.id('shoppingLists'),
    productId: v.optional(v.id('products')),
    customName: v.optional(v.string()),
    quantity: v.number(),
    unit: v.optional(v.string()),
    estimatedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const itemId = await ctx.db.insert('shoppingListItems', {
      shoppingListId: args.shoppingListId,
      productId: args.productId,
      customName: args.customName,
      quantity: args.quantity,
      unit: args.unit,
      estimatedPrice: args.estimatedPrice,
      notes: args.notes,
      isCompleted: false,
      priority: args.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    })

    // Update list updated time
    await ctx.db.patch(args.shoppingListId, {
      updatedAt: now,
    })

    return itemId
  },
})

// Update shopping list item
export const updateItem = mutation({
  args: {
    id: v.id('shoppingListItems'),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    estimatedPrice: v.optional(v.number()),
    actualPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'))
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return id
  },
})

// Complete shopping list item
export const completeItem = mutation({
  args: {
    id: v.id('shoppingListItems'),
    actualPrice: v.optional(v.number()),
    completedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.id, {
      isCompleted: true,
      actualPrice: args.actualPrice,
      completedAt: now,
      completedBy: args.completedBy,
      updatedAt: now,
    })

    return args.id
  },
})

// Remove item from shopping list
export const removeItem = mutation({
  args: { id: v.id('shoppingListItems') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

// Get shopping list items
export const getItems = query({
  args: {
    shoppingListId: v.id('shoppingLists'),
    completedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('shoppingListItems')
      .withIndex('by_shopping_list', q =>
        q.eq('shoppingListId', args.shoppingListId)
      )

    if (args.completedOnly !== undefined) {
      query = query.filter(q =>
        q.eq(q.field('isCompleted'), args.completedOnly)
      )
    }

    const items = await query.collect()

    const itemsWithProducts = await Promise.all(
      items.map(async item => {
        const product = item.productId ? await ctx.db.get(item.productId) : null
        return {
          ...item,
          product,
        }
      })
    )

    return itemsWithProducts
  },
})

// Generate shopping list from low stock
export const generateFromLowStock = mutation({
  args: {
    householdId: v.id('households'),
    name: v.string(),
    createdBy: v.string(),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get low stock items
    const items = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isConsumed', false)
      )
      .collect()

    // Group by product and sum quantities
    const productQuantities = new Map<
      string,
      { product: Doc<'products'> | null; totalQuantity: number }
    >()

    for (const item of items) {
      const key = item.productId
      if (!productQuantities.has(key)) {
        const product = await ctx.db.get(item.productId)
        productQuantities.set(key, { product, totalQuantity: 0 })
      }
      const entry = productQuantities.get(key)!
      entry.totalQuantity += item.quantity
    }

    // Get household settings for default threshold
    const household = await ctx.db.get(args.householdId)
    const defaultThreshold = household?.settings?.lowStockThreshold || 2
    const threshold = args.threshold || defaultThreshold

    // Filter low stock items
    const lowStockProducts = Array.from(productQuantities.entries())
      .filter(([_, entry]) => entry.totalQuantity <= threshold)
      .map(([productId, entry]) => ({
        productId: productId as Id<'products'>,
        product: entry.product,
      }))

    if (lowStockProducts.length === 0) {
      throw new Error('No low stock items found')
    }

    // Create shopping list
    const now = Date.now()
    const listId = await ctx.db.insert('shoppingLists', {
      householdId: args.householdId,
      name: args.name,
      description: `Auto-generated from low stock items (threshold: ${threshold})`,
      isActive: true,
      isCompleted: false,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    })

    // Add items to list
    for (const { productId, product } of lowStockProducts) {
      await ctx.db.insert('shoppingListItems', {
        shoppingListId: listId,
        productId: productId,
        quantity: 1,
        unit: product?.defaultUnit,
        isCompleted: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      })
    }

    return listId
  },
})

// Get shopping list statistics
export const getStats = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query('shoppingLists')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    const activeLists = lists.filter(list => list.isActive && !list.isCompleted)
    const completedLists = lists.filter(list => list.isCompleted)

    // Get all items for active lists
    const activeListItems = await Promise.all(
      activeLists.map(async list => {
        const items = await ctx.db
          .query('shoppingListItems')
          .withIndex('by_shopping_list', q => q.eq('shoppingListId', list._id))
          .collect()
        return items
      })
    )

    const totalActiveItems = activeListItems.flat().length
    const completedActiveItems = activeListItems
      .flat()
      .filter(item => item.isCompleted).length

    return {
      totalLists: lists.length,
      activeLists: activeLists.length,
      completedLists: completedLists.length,
      totalActiveItems,
      completedActiveItems,
      pendingItems: totalActiveItems - completedActiveItems,
    }
  },
})
