import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Create a new inventory item
export const create = mutation({
  args: {
    householdId: v.id('households'),
    productId: v.id('products'),
    quantity: v.number(),
    unit: v.optional(v.string()),
    location: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('inventoryItems', {
      householdId: args.householdId,
      productId: args.productId,
      quantity: args.quantity,
      unit: args.unit,
      location: args.location,
      purchaseDate: args.purchaseDate,
      expirationDate: args.expirationDate,
      purchasePrice: args.purchasePrice,
      notes: args.notes,
      isConsumed: false,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get inventory item by ID
export const get = query({
  args: { id: v.id('inventoryItems') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// List inventory items for a household
export const listForHousehold = query({
  args: {
    householdId: v.id('households'),
    activeOnly: v.optional(v.boolean()),
    location: v.optional(v.string()),
    productId: v.optional(v.id('products')),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('inventoryItems')

    if (args.productId) {
      query = query.withIndex('by_product', q =>
        q.eq('productId', args.productId)
      )
    } else if (args.activeOnly) {
      query = query.withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isConsumed', false)
      )
    } else {
      query = query.withIndex('by_household', q =>
        q.eq('householdId', args.householdId)
      )
    }

    let results = await query.collect()

    // Filter by location if provided
    if (args.location) {
      results = results.filter(item => item.location === args.location)
    }

    return results
  },
})

// Get inventory with product details
export const getWithProducts = query({
  args: {
    householdId: v.id('households'),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const query = args.activeOnly
      ? ctx.db
          .query('inventoryItems')
          .withIndex('by_household_active', q =>
            q.eq('householdId', args.householdId).eq('isConsumed', false)
          )
      : ctx.db
          .query('inventoryItems')
          .withIndex('by_household', q => q.eq('householdId', args.householdId))

    const inventoryItems = await query.collect()

    const itemsWithProducts = await Promise.all(
      inventoryItems.map(async item => {
        const product = await ctx.db.get(item.productId)
        return {
          ...item,
          product,
        }
      })
    )

    return itemsWithProducts
  },
})

// Get expiring items
export const getExpiring = query({
  args: {
    householdId: v.id('households'),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 7
    const futureDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000

    const items = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isConsumed', false)
      )
      .filter(q =>
        q.and(
          q.neq(q.field('expirationDate'), undefined),
          q.lte(q.field('expirationDate'), futureDate)
        )
      )
      .collect()

    // Sort by expiration date (soonest first)
    items.sort((a, b) => (a.expirationDate || 0) - (b.expirationDate || 0))

    // Add product details
    const itemsWithProducts = await Promise.all(
      items.map(async item => {
        const product = await ctx.db.get(item.productId)
        return {
          ...item,
          product,
        }
      })
    )

    return itemsWithProducts
  },
})

// Get low stock items
export const getLowStock = query({
  args: {
    householdId: v.id('households'),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isConsumed', false)
      )
      .collect()

    // Group by product and sum quantities
    const productQuantities = new Map<
      string,
      {
        product: Doc<'products'> | null
        totalQuantity: number
        items: Doc<'inventoryItems'>[]
      }
    >()

    for (const item of items) {
      const key = item.productId
      if (!productQuantities.has(key)) {
        const product = await ctx.db.get(item.productId)
        productQuantities.set(key, { product, totalQuantity: 0, items: [] })
      }
      const entry = productQuantities.get(key)!
      entry.totalQuantity += item.quantity
      entry.items.push(item)
    }

    // Get household settings for default threshold
    const household = await ctx.db.get(args.householdId)
    const defaultThreshold = household?.settings?.lowStockThreshold || 2
    const threshold = args.threshold || defaultThreshold

    // Filter low stock items
    const lowStockItems = Array.from(productQuantities.entries())
      .filter(([_, entry]) => entry.totalQuantity <= threshold)
      .map(([productId, entry]) => ({
        productId: productId as Id<'products'>,
        product: entry.product,
        totalQuantity: entry.totalQuantity,
        items: entry.items,
        threshold,
      }))

    return lowStockItems
  },
})

// Update inventory item
export const update = mutation({
  args: {
    id: v.id('inventoryItems'),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    location: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    notes: v.optional(v.string()),
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

// Consume item
export const consume = mutation({
  args: {
    id: v.id('inventoryItems'),
    quantity: v.optional(v.number()),
    consumedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) {
      throw new Error('Inventory item not found')
    }

    const now = Date.now()
    const consumeQuantity = args.quantity || item.quantity

    if (consumeQuantity >= item.quantity) {
      // Consume entire item
      await ctx.db.patch(args.id, {
        isConsumed: true,
        consumedAt: now,
        consumedBy: args.consumedBy,
        updatedAt: now,
      })
    } else {
      // Partial consumption - reduce quantity
      await ctx.db.patch(args.id, {
        quantity: item.quantity - consumeQuantity,
        updatedAt: now,
      })
    }

    return args.id
  },
})

// Delete inventory item
export const remove = mutation({
  args: { id: v.id('inventoryItems') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

// Get inventory by location
export const getByLocation = query({
  args: {
    householdId: v.id('households'),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('inventoryItems')
      .withIndex('by_location', q => q.eq('location', args.location))
      .filter(q =>
        q.and(
          q.eq(q.field('householdId'), args.householdId),
          q.eq(q.field('isConsumed'), false)
        )
      )
      .collect()

    // Add product details
    const itemsWithProducts = await Promise.all(
      items.map(async item => {
        const product = await ctx.db.get(item.productId)
        return {
          ...item,
          product,
        }
      })
    )

    return itemsWithProducts
  },
})

// Get inventory statistics
export const getStats = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    const activeItems = items.filter(item => !item.isConsumed)
    const expiredItems = activeItems.filter(
      item => item.expirationDate && item.expirationDate < Date.now()
    )
    const expiringItems = activeItems.filter(
      item =>
        item.expirationDate &&
        item.expirationDate > Date.now() &&
        item.expirationDate < Date.now() + 7 * 24 * 60 * 60 * 1000
    )

    const totalValue = activeItems.reduce(
      (sum, item) => sum + (item.purchasePrice || 0) * item.quantity,
      0
    )

    const locations = new Set(
      activeItems.map(item => item.location).filter(Boolean)
    )
    const uniqueProducts = new Set(activeItems.map(item => item.productId))

    return {
      totalItems: activeItems.length,
      totalProducts: uniqueProducts.size,
      totalValue,
      expiredCount: expiredItems.length,
      expiringCount: expiringItems.length,
      locationCount: locations.size,
      consumedItems: items.filter(item => item.isConsumed).length,
    }
  },
})
