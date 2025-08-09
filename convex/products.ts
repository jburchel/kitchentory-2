import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Create a new product
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('products', {
      householdId: args.householdId,
      name: args.name,
      brand: args.brand,
      description: args.description,
      categoryId: args.categoryId,
      barcode: args.barcode,
      defaultUnit: args.defaultUnit || 'unit',
      defaultShelfLifeDays: args.defaultShelfLifeDays || 7,
      nutritionalInfo: args.nutritionalInfo,
      tags: args.tags || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get product by ID
export const get = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get product by barcode
export const getByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_barcode', q => q.eq('barcode', args.barcode))
      .filter(q => q.eq(q.field('isActive'), true))
      .first()
  },
})

// List products for a household
export const listForHousehold = query({
  args: {
    householdId: v.id('households'),
    activeOnly: v.optional(v.boolean()),
    categoryId: v.optional(v.id('categories')),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('products')

    if (args.categoryId) {
      query = query.withIndex('by_category', q =>
        q.eq('categoryId', args.categoryId)
      )
    } else if (args.activeOnly) {
      query = query.withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
    } else {
      query = query.withIndex('by_household', q =>
        q.eq('householdId', args.householdId)
      )
    }

    let results = await query.collect()

    // Filter by search term if provided
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase()
      results = results.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply limit if provided
    if (args.limit) {
      results = results.slice(0, args.limit)
    }

    return results
  },
})

// Search products
export const search = query({
  args: {
    householdId: v.id('households'),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
      .collect()

    const searchLower = args.searchTerm.toLowerCase()
    const filtered = products.filter(
      product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )

    // Sort by relevance (exact matches first)
    filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchLower
      const bExact = b.name.toLowerCase() === searchLower
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      const aStarts = a.name.toLowerCase().startsWith(searchLower)
      const bStarts = b.name.toLowerCase().startsWith(searchLower)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      return a.name.localeCompare(b.name)
    })

    return args.limit ? filtered.slice(0, args.limit) : filtered
  },
})

// Update product
export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
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

// Delete product (soft delete)
export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

// Hard delete product
export const hardDelete = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    // Check for inventory items using this product
    const inventoryItems = await ctx.db
      .query('inventoryItems')
      .withIndex('by_product', q => q.eq('productId', args.id))
      .collect()

    if (inventoryItems.length > 0) {
      throw new Error('Cannot delete product with inventory items')
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// Get products by category
export const getByCategory = query({
  args: { categoryId: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_category', q => q.eq('categoryId', args.categoryId))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect()
  },
})

// Get popular products (most used in inventory)
export const getPopular = query({
  args: {
    householdId: v.id('households'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const inventoryItems = await ctx.db
      .query('inventoryItems')
      .withIndex('by_household', q => q.eq('householdId', args.householdId))
      .collect()

    // Count product usage
    const productCounts = new Map<string, number>()
    for (const item of inventoryItems) {
      const count = productCounts.get(item.productId) || 0
      productCounts.set(item.productId, count + 1)
    }

    // Get products and sort by usage
    const products = await Promise.all(
      Array.from(productCounts.keys()).map(async productId => {
        const product = await ctx.db.get(productId as Id<'products'>)
        return product
          ? { ...product, usageCount: productCounts.get(productId)! }
          : null
      })
    )

    const validProducts = products.filter(Boolean) as (Doc<'products'> & {
      usageCount: number
    })[]
    validProducts.sort((a, b) => b.usageCount - a.usageCount)

    return args.limit ? validProducts.slice(0, args.limit) : validProducts
  },
})
