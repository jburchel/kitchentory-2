import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

// Create a new category
export const create = mutation({
  args: {
    householdId: v.id('households'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentCategoryId: v.optional(v.id('categories')),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('categories', {
      householdId: args.householdId,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      parentCategoryId: args.parentCategoryId,
      isActive: true,
      sortOrder: args.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get category by ID
export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// List categories for a household
export const listForHousehold = query({
  args: {
    householdId: v.id('households'),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db.query('categories')

    if (args.activeOnly) {
      return await query
        .withIndex('by_household_active', q =>
          q.eq('householdId', args.householdId).eq('isActive', true)
        )
        .order('asc')
        .collect()
    } else {
      return await query
        .withIndex('by_household', q => q.eq('householdId', args.householdId))
        .order('asc')
        .collect()
    }
  },
})

// Get subcategories
export const getSubcategories = query({
  args: { parentId: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('categories')
      .withIndex('by_parent', q => q.eq('parentCategoryId', args.parentId))
      .filter(q => q.eq(q.field('isActive'), true))
      .order('asc')
      .collect()
  },
})

// Update category
export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentCategoryId: v.optional(v.id('categories')),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
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

// Delete category (soft delete)
export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

// Hard delete category
export const hardDelete = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    // Check for subcategories
    const subcategories = await ctx.db
      .query('categories')
      .withIndex('by_parent', q => q.eq('parentCategoryId', args.id))
      .collect()

    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories')
    }

    // Check for products using this category
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', q => q.eq('categoryId', args.id))
      .collect()

    if (products.length > 0) {
      throw new Error('Cannot delete category with products')
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// Get category hierarchy
export const getHierarchy = query({
  args: { householdId: v.id('households') },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_household_active', q =>
        q.eq('householdId', args.householdId).eq('isActive', true)
      )
      .collect()

    // Build hierarchy
    const categoryMap = new Map(
      categories.map(cat => [cat._id, { ...cat, children: [] as any[] }])
    )
    const rootCategories: any[] = []

    for (const category of categories) {
      const categoryWithChildren = categoryMap.get(category._id)!

      if (category.parentCategoryId) {
        const parent = categoryMap.get(category.parentCategoryId)
        if (parent) {
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    }

    return rootCategories
  },
})
