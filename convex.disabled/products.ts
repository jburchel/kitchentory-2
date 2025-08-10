// @ts-nocheck
import { action, query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

interface ProductInfo {
  barcode: string
  name?: string
  brand?: string
  category?: string
  image?: string
  description?: string
  nutritionFacts?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
  }
  ingredients?: string[]
  allergens?: string[]
}

export const lookupProductByBarcode = action({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    const cleanBarcode = args.barcode.replace(/\D/g, '')
    
    if (cleanBarcode.length < 8) {
      throw new Error('Invalid barcode format')
    }

    try {
      // Try Open Food Facts first
      const foodProduct = await lookupOpenFoodFacts(cleanBarcode)
      if (foodProduct) {
        return foodProduct
      }

      // Return basic product info if no external data found
      return {
        barcode: cleanBarcode,
        name: `Product ${cleanBarcode}`,
        category: 'Unknown'
      }

    } catch (error) {
      console.error('Product lookup failed:', error)
      return {
        barcode: cleanBarcode,
        name: `Product ${cleanBarcode}`,
        category: 'Unknown'
      }
    }
  }
})

export const searchProducts = action({
  args: { 
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(args.query)}&search_simple=1&action=process&json=1&page_size=${limit}`,
        {
          headers: {
            'User-Agent': 'Kitchentory/1.0 (https://kitchentory.com)'
          }
        }
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()

      if (!data.products) {
        return []
      }

      return data.products
        .map((product: any) => ({
          barcode: product._id || product.code,
          name: product.product_name,
          brand: product.brands,
          category: parseCategories(product.categories),
          image: product.image_front_url || product.image_url,
          description: product.ingredients_text
        }))
        .filter((product: ProductInfo) => product.name) // Filter out products without names

    } catch (error) {
      console.error('Product search failed:', error)
      return []
    }
  }
})

export const getRecentSearches = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10)

    return searches.map(search => ({
      id: search._id,
      query: search.query,
      timestamp: search._creationTime
    }))
  }
})

export const addSearch = action({
  args: {
    userId: v.string(),
    query: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.products.createSearch, {
      userId: args.userId,
      query: args.query.toLowerCase().trim()
    })
  }
})

export const createSearch = internalMutation({
  args: {
    userId: v.string(),
    query: v.string()
  },
  handler: async (ctx, args) => {
    // Check if search already exists for this user
    const existing = await ctx.db
      .query("searches")
      .withIndex("by_user_query", (q) => 
        q.eq("userId", args.userId).eq("query", args.query)
      )
      .first()

    if (!existing) {
      await ctx.db.insert("searches", {
        userId: args.userId,
        query: args.query,
        createdAt: Date.now()
      })
    }
  }
})

async function lookupOpenFoodFacts(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'Kitchentory/1.0 (https://kitchentory.com)'
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.status !== 1 || !data.product) {
      return null
    }

    const product = data.product
    const nutrients = product.nutriments

    return {
      barcode,
      name: product.product_name || undefined,
      brand: product.brands || undefined,
      category: parseCategories(product.categories),
      image: product.image_front_url || product.image_url || undefined,
      description: product.ingredients_text || undefined,
      nutritionFacts: nutrients ? {
        calories: nutrients.energy_kcal_100g || nutrients.energy_kcal,
        protein: nutrients.proteins_100g || nutrients.proteins,
        carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates,
        fat: nutrients.fat_100g || nutrients.fat,
        fiber: nutrients.fiber_100g || nutrients.fiber,
        sugar: nutrients.sugars_100g || nutrients.sugars
      } : undefined,
      ingredients: product.ingredients_text ? [product.ingredients_text] : undefined,
      allergens: product.allergens_tags?.map((tag: string) => tag.replace('en:', '')) || undefined
    }
  } catch (error) {
    console.error('Open Food Facts lookup failed:', error)
    return null
  }
}

function parseCategories(categories?: string): string | undefined {
  if (!categories) return undefined
  
  const categoryList = categories.split(',')
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0)
  
  return categoryList[categoryList.length - 1] || 'Food'
}