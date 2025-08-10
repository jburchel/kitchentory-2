# Kitchentory Convex API Documentation

This document provides comprehensive documentation for the Kitchentory Convex API, built with real-time data synchronization and TypeScript-first development.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Authentication with Clerk](#authentication-with-clerk)
4. [Database Schema](#database-schema)
5. [TypeScript Types](#typescript-types)
6. [Convex Functions](#convex-functions)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [Client-Side Usage](#client-side-usage)
9. [Error Handling](#error-handling)
10. [NextJS Route Handlers](#nextjs-route-handlers)
11. [Examples](#examples)

## Overview

Kitchentory uses Convex for real-time data management with TypeScript-first APIs. All data operations are handled through Convex queries, mutations, and actions with automatic real-time synchronization across all connected clients.

### Key Features

- **Real-time synchronization**: All data updates are automatically synchronized across clients
- **TypeScript-first**: Full type safety from database to client
- **Optimistic updates**: UI updates immediately with automatic rollback on errors
- **Offline support**: Convex handles offline scenarios automatically
- **Authentication integration**: Seamless Clerk auth integration

## Tech Stack

- **Backend**: Convex (real-time database & serverless functions)
- **Frontend**: NextJS 14+ with App Router
- **Authentication**: Clerk with Convex integration
- **Language**: TypeScript
- **UI**: shadcn/ui + TailwindCSS
- **Deployment**: Vercel
- **Real-time**: Built-in with Convex

## Authentication with Clerk

Authentication is handled by Clerk and integrated with Convex. All Convex functions automatically receive the authenticated user's identity.

### Setup Authentication

```typescript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN,
      applicationID: process.env.CLERK_APPLICATION_ID,
    },
  ]
};
```

### Using Authentication in Functions

```typescript
// convex/inventoryItems.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");
    
    // Get user's household
    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    
    if (!household) throw new Error("Household not found");
    
    // Function implementation with authenticated context
  },
});
```

### Client-Side Auth Setup

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from './ConvexClientProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

```typescript
// ConvexClientProvider.tsx
"use client";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

## Database Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  households: defineTable({
    name: v.string(),
    clerkUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["clerkUserId"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    householdId: v.id("households"),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_household", ["householdId"]),

  products: defineTable({
    name: v.string(),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()),
    categoryId: v.id("categories"),
    defaultUnit: v.string(),
    description: v.optional(v.string()),
    nutritionInfo: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.string()),
      carbs: v.optional(v.string()),
      fat: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_barcode", ["barcode"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["categoryId"],
    }),

  storageLocations: defineTable({
    name: v.string(),
    locationType: v.union(
      v.literal("fridge"),
      v.literal("freezer"),
      v.literal("pantry"),
      v.literal("counter"),
      v.literal("cabinet")
    ),
    temperature: v.optional(v.number()),
    notes: v.optional(v.string()),
    householdId: v.id("households"),
    createdAt: v.number(),
  }).index("by_household", ["householdId"]),

  inventoryItems: defineTable({
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
    expirationDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    minimumThreshold: v.optional(v.number()),
    notes: v.optional(v.string()),
    householdId: v.id("households"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_location", ["locationId"])
    .index("by_product", ["productId"])
    .index("by_expiration", ["expirationDate"]),

  recipes: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    createdByUserId: v.string(),
    servings: v.number(),
    prepTime: v.number(), // minutes
    cookTime: v.number(), // minutes
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    instructions: v.string(),
    isPublic: v.boolean(),
    image: v.optional(v.string()),
    nutritionInfo: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.string()),
      carbs: v.optional(v.string()),
      fat: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["createdByUserId"])
    .index("by_category", ["categoryId"])
    .index("by_difficulty", ["difficulty"])
    .searchIndex("search_recipes", {
      searchField: "name",
      filterFields: ["isPublic", "difficulty"],
    }),

  recipeIngredients: defineTable({
    recipeId: v.id("recipes"),
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    notes: v.optional(v.string()),
    isOptional: v.optional(v.boolean()),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_product", ["productId"]),

  shoppingLists: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    createdByUserId: v.string(),
    householdId: v.id("households"),
    storeId: v.optional(v.id("stores")),
    budgetLimit: v.optional(v.number()),
    totalEstimatedCost: v.optional(v.number()),
    totalActualCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["createdByUserId"])
    .index("by_status", ["status"]),

  shoppingListItems: defineTable({
    listId: v.id("shoppingLists"),
    productId: v.optional(v.id("products")),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    estimatedPrice: v.optional(v.number()),
    actualPrice: v.optional(v.number()),
    isPurchased: v.boolean(),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_product", ["productId"])
    .index("by_status", ["isPurchased"]),

  stores: defineTable({
    name: v.string(),
    storeType: v.union(
      v.literal("grocery"),
      v.literal("pharmacy"),
      v.literal("restaurant"),
      v.literal("other")
    ),
    address: v.optional(v.string()),
    householdId: v.id("households"),
    createdAt: v.number(),
  }).index("by_household", ["householdId"]),

  sharedListAccess: defineTable({
    listId: v.id("shoppingLists"),
    userEmail: v.string(),
    permission: v.union(
      v.literal("view"),
      v.literal("edit")
    ),
    createdAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_email", ["userEmail"]),
});
```

## TypeScript Types

```typescript
// types/index.ts
import { Doc, Id } from "../convex/_generated/dataModel";

// Database document types
export type Household = Doc<"households">;
export type Category = Doc<"categories">;
export type Product = Doc<"products">;
export type StorageLocation = Doc<"storageLocations">;
export type InventoryItem = Doc<"inventoryItems">;
export type Recipe = Doc<"recipes">;
export type RecipeIngredient = Doc<"recipeIngredients">;
export type ShoppingList = Doc<"shoppingLists">;
export type ShoppingListItem = Doc<"shoppingListItems">;
export type Store = Doc<"stores">;

// Extended types with relationships
export interface CategoryWithItemCount extends Category {
  itemCount: number;
}

export interface InventoryItemWithDetails extends InventoryItem {
  product: Product;
  location: StorageLocation;
  category: Category;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface RecipeWithDetails extends Recipe {
  category?: Category;
  ingredients: Array<RecipeIngredient & { product: Product }>;
  creator: { id: string; username: string };
}

export interface RecipeMatch {
  recipe: Recipe;
  matchPercentage: number;
  availableIngredients: number;
  totalIngredients: number;
  missingIngredients: Array<{
    product: string;
    quantity: number;
    unit: string;
  }>;
}

export interface ShoppingListWithDetails extends ShoppingList {
  items: ShoppingListItem[];
  store?: Store;
  creator: { id: string; username: string };
  itemsCount: number;
  completedItemsCount: number;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  expiredItems: number;
  expiringSoon: number;
  lowStock: number;
  topCategories: Array<{ name: string; count: number }>;
  topLocations: Array<{ name: string; count: number }>;
}

// Input types for mutations
export interface CreateInventoryItemInput {
  productId: Id<"products">;
  quantity: number;
  unit: string;
  locationId: Id<"storageLocations">;
  expirationDate?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  minimumThreshold?: number;
  notes?: string;
}

export interface QuickAddItemInput {
  name: string;
  brand?: string;
  categoryId: Id<"categories">;
  quantity: number;
  unit: string;
  locationId: Id<"storageLocations">;
  daysUntilExpiration?: number;
}

export interface CreateRecipeInput {
  name: string;
  description?: string;
  categoryId?: Id<"categories">;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "medium" | "hard";
  instructions: string;
  isPublic: boolean;
  image?: string;
}

export interface CreateShoppingListInput {
  name: string;
  storeId?: Id<"stores">;
  budgetLimit?: number;
  notes?: string;
}
```

## Convex Functions

### Inventory Management

#### Inventory Queries

```typescript
// convex/inventoryItems.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    locationId: v.optional(v.id("storageLocations")),
    unit: v.optional(v.string()),
    isExpired: v.optional(v.boolean()),
    expiringSoonDays: v.optional(v.number()),
    lowStock: v.optional(v.boolean()),
    search: v.optional(v.string()),
    ordering: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    let items = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    // Apply filters
    if (args.locationId) {
      items = items.filter((item) => item.locationId === args.locationId);
    }

    if (args.unit) {
      items = items.filter((item) => item.unit === args.unit);
    }

    if (args.isExpired) {
      const today = new Date().toISOString().split('T')[0];
      items = items.filter((item) => 
        item.expirationDate && item.expirationDate < today
      );
    }

    if (args.expiringSoonDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + args.expiringSoonDays);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      items = items.filter((item) =>
        item.expirationDate && 
        item.expirationDate <= futureDateStr &&
        item.expirationDate >= today
      );
    }

    if (args.lowStock) {
      items = items.filter((item) => 
        item.minimumThreshold && item.quantity <= item.minimumThreshold
      );
    }

    // Get related data and build response
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const location = await ctx.db.get(item.locationId);
        const category = product ? await ctx.db.get(product.categoryId) : null;
        
        return {
          ...item,
          product,
          location,
          category,
        };
      })
    );

    // Apply search filter
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      return itemsWithDetails.filter((item) =>
        item.product?.name.toLowerCase().includes(searchTerm) ||
        item.product?.brand?.toLowerCase().includes(searchTerm) ||
        item.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (args.ordering) {
      itemsWithDetails.sort((a, b) => {
        switch (args.ordering) {
          case "name":
            return (a.product?.name || "").localeCompare(b.product?.name || "");
          case "-name":
            return (b.product?.name || "").localeCompare(a.product?.name || "");
          case "expiration_date":
            return (a.expirationDate || "").localeCompare(b.expirationDate || "");
          case "-expiration_date":
            return (b.expirationDate || "").localeCompare(a.expirationDate || "");
          case "quantity":
            return a.quantity - b.quantity;
          case "-quantity":
            return b.quantity - a.quantity;
          default:
            return 0;
        }
      });
    }

    return itemsWithDetails;
  },
});

export const get = query({
  args: { id: v.id("inventoryItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const item = await ctx.db.get(args.id);
    if (!item) return null;

    const product = await ctx.db.get(item.productId);
    const location = await ctx.db.get(item.locationId);
    const category = product ? await ctx.db.get(product.categoryId) : null;

    return {
      ...item,
      product,
      location,
      category,
    };
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    const items = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const expiredItems = items.filter(item => 
      item.expirationDate && item.expirationDate < today
    ).length;

    const expiringSoon = items.filter(item =>
      item.expirationDate && 
      item.expirationDate >= today && 
      item.expirationDate <= nextWeekStr
    ).length;

    const lowStock = items.filter(item =>
      item.minimumThreshold && item.quantity <= item.minimumThreshold
    ).length;

    const totalValue = items
      .filter(item => item.purchasePrice)
      .reduce((sum, item) => sum + (item.purchasePrice! * item.quantity), 0);

    // Get category and location statistics
    const categoryStats = new Map<string, number>();
    const locationStats = new Map<string, number>();

    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      const location = await ctx.db.get(item.locationId);
      
      if (product) {
        const category = await ctx.db.get(product.categoryId);
        if (category) {
          categoryStats.set(category.name, (categoryStats.get(category.name) || 0) + 1);
        }
      }
      
      if (location) {
        locationStats.set(location.name, (locationStats.get(location.name) || 0) + 1);
      }
    }

    const topCategories = Array.from(categoryStats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topLocations = Array.from(locationStats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalItems: items.length,
      totalValue,
      expiredItems,
      expiringSoon,
      lowStock,
      topCategories,
      topLocations,
    };
  },
});
```

#### Inventory Mutations

```typescript
// convex/inventoryItems.ts (continued)
export const create = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
    expirationDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    minimumThreshold: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    // Validate product and location belong to user's household
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const location = await ctx.db.get(args.locationId);
    if (!location || location.householdId !== household._id) {
      throw new Error("Storage location not found");
    }

    const now = Date.now();
    return await ctx.db.insert("inventoryItems", {
      ...args,
      householdId: household._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("inventoryItems"),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    locationId: v.optional(v.id("storageLocations")),
    expirationDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    minimumThreshold: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { id, ...updates } = args;
    
    // Verify ownership
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household || item.householdId !== household._id) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const quickAdd = mutation({
  args: {
    name: v.string(),
    brand: v.optional(v.string()),
    categoryId: v.id("categories"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
    daysUntilExpiration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    // Create or find product
    let product = await ctx.db
      .query("products")
      .filter((q) => 
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("categoryId"), args.categoryId),
          args.brand ? q.eq(q.field("brand"), args.brand) : q.eq(q.field("brand"), undefined)
        )
      )
      .first();

    if (!product) {
      const productId = await ctx.db.insert("products", {
        name: args.name,
        brand: args.brand,
        categoryId: args.categoryId,
        defaultUnit: args.unit,
        createdAt: Date.now(),
      });
      product = await ctx.db.get(productId);
    }

    if (!product) throw new Error("Failed to create product");

    // Calculate expiration date
    let expirationDate: string | undefined;
    if (args.daysUntilExpiration) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + args.daysUntilExpiration);
      expirationDate = expDate.toISOString().split('T')[0];
    }

    const now = Date.now();
    return await ctx.db.insert("inventoryItems", {
      productId: product._id,
      quantity: args.quantity,
      unit: args.unit,
      locationId: args.locationId,
      expirationDate,
      householdId: household._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const consume = mutation({
  args: { 
    id: v.id("inventoryItems"),
    quantityUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    // Verify ownership
    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household || item.householdId !== household._id) {
      throw new Error("Unauthorized");
    }

    if (args.quantityUsed && args.quantityUsed < item.quantity) {
      // Partial consumption - update quantity
      return await ctx.db.patch(args.id, {
        quantity: item.quantity - args.quantityUsed,
        updatedAt: Date.now(),
      });
    } else {
      // Full consumption - delete item
      return await ctx.db.delete(args.id);
    }
  },
});

export const bulkAction = mutation({
  args: {
    itemIds: v.array(v.id("inventoryItems")),
    action: v.union(
      v.literal("consume"),
      v.literal("delete"),
      v.literal("update_location"),
      v.literal("update_expiration")
    ),
    locationId: v.optional(v.id("storageLocations")),
    expirationDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { itemIds, action, locationId, expirationDate } = args;

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    let processedCount = 0;

    for (const itemId of itemIds) {
      const item = await ctx.db.get(itemId);
      if (!item || item.householdId !== household._id) continue;

      switch (action) {
        case "consume":
        case "delete":
          await ctx.db.delete(itemId);
          processedCount++;
          break;
        case "update_location":
          if (locationId) {
            await ctx.db.patch(itemId, { 
              locationId,
              updatedAt: Date.now()
            });
            processedCount++;
          }
          break;
        case "update_expiration":
          if (expirationDate) {
            await ctx.db.patch(itemId, { 
              expirationDate,
              updatedAt: Date.now()
            });
            processedCount++;
          }
          break;
      }
    }

    return { success: true, processedItems: processedCount };
  },
});
```

### Recipe Management

```typescript
// convex/recipes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
    maxPrepTime: v.optional(v.number()),
    maxCookTime: v.optional(v.number()),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    let recipes = await ctx.db.query("recipes").collect();

    // Filter by user's recipes and public recipes
    if (args.includePublic) {
      recipes = recipes.filter(recipe => 
        recipe.createdByUserId === identity.subject || recipe.isPublic
      );
    } else {
      recipes = recipes.filter(recipe => 
        recipe.createdByUserId === identity.subject
      );
    }

    // Apply filters
    if (args.categoryId) {
      recipes = recipes.filter(recipe => recipe.categoryId === args.categoryId);
    }

    if (args.difficulty) {
      recipes = recipes.filter(recipe => recipe.difficulty === args.difficulty);
    }

    if (args.maxPrepTime) {
      recipes = recipes.filter(recipe => recipe.prepTime <= args.maxPrepTime!);
    }

    if (args.maxCookTime) {
      recipes = recipes.filter(recipe => recipe.cookTime <= args.maxCookTime!);
    }

    // Apply search
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      recipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Get related data
    const recipesWithDetails = await Promise.all(
      recipes.map(async (recipe) => {
        const category = recipe.categoryId ? await ctx.db.get(recipe.categoryId) : null;
        return {
          ...recipe,
          category,
        };
      })
    );

    return recipesWithDetails;
  },
});

export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) return null;

    const category = recipe.categoryId ? await ctx.db.get(recipe.categoryId) : null;
    
    const ingredients = await ctx.db
      .query("recipeIngredients")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.id))
      .collect();

    const ingredientsWithProducts = await Promise.all(
      ingredients.map(async (ingredient) => {
        const product = await ctx.db.get(ingredient.productId);
        return {
          ...ingredient,
          product,
        };
      })
    );

    return {
      ...recipe,
      category,
      ingredients: ingredientsWithProducts,
    };
  },
});

export const findMatching = query({
  args: {
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const threshold = args.threshold ?? 80;

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    // Get user's inventory
    const inventoryItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const availableProducts = new Set(inventoryItems.map(item => item.productId));

    // Get all recipes (user's + public)
    const recipes = await ctx.db
      .query("recipes")
      .filter(q => q.or(
        q.eq(q.field("createdByUserId"), identity.subject),
        q.eq(q.field("isPublic"), true)
      ))
      .collect();

    const matches = [];

    for (const recipe of recipes) {
      const ingredients = await ctx.db
        .query("recipeIngredients")
        .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
        .collect();

      const totalIngredients = ingredients.length;
      const availableIngredients = ingredients.filter(ingredient => 
        availableProducts.has(ingredient.productId)
      ).length;

      const matchPercentage = totalIngredients > 0 
        ? Math.round((availableIngredients / totalIngredients) * 100)
        : 0;

      if (matchPercentage >= threshold) {
        const missingIngredients = [];
        
        for (const ingredient of ingredients) {
          if (!availableProducts.has(ingredient.productId)) {
            const product = await ctx.db.get(ingredient.productId);
            if (product) {
              missingIngredients.push({
                product: product.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              });
            }
          }
        }

        matches.push({
          recipe,
          matchPercentage,
          availableIngredients,
          totalIngredients,
          missingIngredients,
        });
      }
    }

    // Sort by match percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return matches;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    instructions: v.string(),
    isPublic: v.boolean(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const now = Date.now();
    return await ctx.db.insert("recipes", {
      ...args,
      slug,
      createdByUserId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

### Shopping List Management

```typescript
// convex/shoppingLists.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    )),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    let lists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    // Apply filters
    if (args.status) {
      lists = lists.filter(list => list.status === args.status);
    }

    if (args.storeId) {
      lists = lists.filter(list => list.storeId === args.storeId);
    }

    // Get related data
    const listsWithDetails = await Promise.all(
      lists.map(async (list) => {
        const store = list.storeId ? await ctx.db.get(list.storeId) : null;
        
        const items = await ctx.db
          .query("shoppingListItems")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();

        const itemsCount = items.length;
        const completedItemsCount = items.filter(item => item.isPurchased).length;

        return {
          ...list,
          store,
          itemsCount,
          completedItemsCount,
        };
      })
    );

    return listsWithDetails;
  },
});

export const get = query({
  args: { id: v.id("shoppingLists") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) return null;

    const store = list.storeId ? await ctx.db.get(list.storeId) : null;
    
    const items = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_list", (q) => q.eq("listId", args.id))
      .collect();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = item.productId ? await ctx.db.get(item.productId) : null;
        return {
          ...item,
          product,
        };
      })
    );

    return {
      ...list,
      store,
      items: itemsWithProducts,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    storeId: v.optional(v.id("stores")),
    budgetLimit: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    const now = Date.now();
    return await ctx.db.insert("shoppingLists", {
      ...args,
      status: "active",
      createdByUserId: identity.subject,
      householdId: household._id,
      totalEstimatedCost: 0,
      totalActualCost: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const generateFromDepleted = mutation({
  args: {
    name: v.string(),
    thresholdDays: v.optional(v.number()),
    includeExpired: v.optional(v.boolean()),
    includeLowStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    const thresholdDays = args.thresholdDays ?? 7;
    const includeExpired = args.includeExpired ?? true;
    const includeLowStock = args.includeLowStock ?? true;

    // Get inventory items
    const items = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + thresholdDays);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const itemsToRestock = [];

    for (const item of items) {
      let shouldAdd = false;

      // Check if expired
      if (includeExpired && item.expirationDate && item.expirationDate < today) {
        shouldAdd = true;
      }

      // Check if expiring soon
      if (item.expirationDate && 
          item.expirationDate >= today && 
          item.expirationDate <= futureDateStr) {
        shouldAdd = true;
      }

      // Check if low stock
      if (includeLowStock && 
          item.minimumThreshold && 
          item.quantity <= item.minimumThreshold) {
        shouldAdd = true;
      }

      if (shouldAdd) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          itemsToRestock.push({
            product,
            currentQuantity: item.quantity,
            unit: item.unit,
            minimumThreshold: item.minimumThreshold,
            expirationDate: item.expirationDate,
          });
        }
      }
    }

    // Create shopping list
    const now = Date.now();
    const listId = await ctx.db.insert("shoppingLists", {
      name: args.name,
      status: "active",
      createdByUserId: identity.subject,
      householdId: household._id,
      totalEstimatedCost: 0,
      totalActualCost: 0,
      notes: `Auto-generated from depleted/expiring items`,
      createdAt: now,
      updatedAt: now,
    });

    // Add items to the list
    for (const item of itemsToRestock) {
      const suggestedQuantity = item.minimumThreshold 
        ? Math.max(item.minimumThreshold - item.currentQuantity, 1)
        : 1;

      await ctx.db.insert("shoppingListItems", {
        listId,
        productId: item.product._id,
        name: item.product.name,
        quantity: suggestedQuantity,
        unit: item.unit,
        isPurchased: false,
        priority: "normal",
        notes: item.expirationDate && item.expirationDate < today 
          ? "Expired - replace immediately"
          : item.expirationDate && item.expirationDate <= futureDateStr
          ? "Expiring soon"
          : "Low stock",
        createdAt: now,
        updatedAt: now,
      });
    }

    return await ctx.db.get(listId);
  },
});
```

## Real-time Subscriptions

Convex automatically provides real-time updates. Any component using `useQuery` will automatically re-render when the underlying data changes.

```typescript
// Real-time inventory dashboard
function InventoryDashboard() {
  // These queries automatically update in real-time
  const items = useQuery(api.inventoryItems.list, {});
  const stats = useQuery(api.inventoryItems.getStats);
  const categories = useQuery(api.categories.list, {});
  
  // Real-time expiring items alert
  const expiring = useQuery(api.inventoryItems.list, {
    expiringSoonDays: 3
  });

  if (items === undefined || stats === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Stats update automatically */}
      <InventoryStats stats={stats} />
      
      {/* Items list updates in real-time */}
      <InventoryList items={items} />
      
      {/* Alert appears/disappears automatically */}
      {expiring && expiring.length > 0 && (
        <Alert>
          {expiring.length} items expiring soon!
        </Alert>
      )}
    </div>
  );
}
```

## Client-Side Usage

### React Hooks for Data

```typescript
// hooks/useInventory.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useInventoryItems(filters?: {
  categoryId?: Id<"categories">;
  locationId?: Id<"storageLocations">;
  search?: string;
  isExpired?: boolean;
  expiringSoonDays?: number;
}) {
  return useQuery(api.inventoryItems.list, filters ?? {});
}

export function useInventoryStats() {
  return useQuery(api.inventoryItems.getStats);
}

export function useCreateInventoryItem() {
  return useMutation(api.inventoryItems.create);
}

export function useConsumeItem() {
  return useMutation(api.inventoryItems.consume);
}

export function useQuickAddItem() {
  return useMutation(api.inventoryItems.quickAdd);
}
```

### Component Examples

```typescript
// components/AddItemForm.tsx
import { useCreateInventoryItem } from "@/hooks/useInventory";
import { useState } from "react";
import { toast } from "sonner";

export function AddItemForm() {
  const createItem = useCreateInventoryItem();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await createItem({
        productId: formData.get("productId") as Id<"products">,
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit") as string,
        locationId: formData.get("locationId") as Id<"storageLocations">,
        expirationDate: formData.get("expirationDate") as string,
        purchasePrice: formData.get("purchasePrice") 
          ? Number(formData.get("purchasePrice")) 
          : undefined,
      });
      
      toast.success("Item added successfully!");
      // Form automatically resets and UI updates via real-time sync
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
}
```

```typescript
// components/ShoppingListManager.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ShoppingListManager() {
  const lists = useQuery(api.shoppingLists.list, { status: "active" });
  const createList = useMutation(api.shoppingLists.create);
  const generateFromDepleted = useMutation(api.shoppingLists.generateFromDepleted);

  const handleCreateFromDepleted = async () => {
    try {
      await generateFromDepleted({
        name: "Auto-Generated Restock",
        thresholdDays: 7,
        includeExpired: true,
        includeLowStock: true,
      });
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
    }
  };

  if (lists === undefined) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreateFromDepleted}>
        Generate from Low Stock
      </button>
      
      {lists.map((list) => (
        <ShoppingListCard key={list._id} list={list} />
      ))}
    </div>
  );
}
```

## Error Handling

### Convex Error Handling with Validators

```typescript
import { ConvexError } from "convex/values";
import { v } from "convex/values";

export const createItemWithValidation = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    // Validate inputs
    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be greater than 0");
    }

    if (!args.unit.trim()) {
      throw new ConvexError("Unit is required");
    }

    // Validate references
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new ConvexError("Storage location not found");
    }

    // Validate ownership
    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) {
      throw new ConvexError("Household not found");
    }

    if (location.householdId !== household._id) {
      throw new ConvexError("Storage location does not belong to your household");
    }

    // Continue with creation...
  },
});
```

### Client-Side Error Handling

```typescript
// utils/errorHandling.ts
import { ConvexError } from "convex/values";

export function handleConvexError(error: unknown): string {
  if (error instanceof ConvexError) {
    return error.data;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}

// In components
export function InventoryForm() {
  const createItem = useMutation(api.inventoryItems.create);
  
  const handleSubmit = async (data: FormData) => {
    try {
      await createItem({
        // ... form data
      });
      toast.success("Item created successfully!");
    } catch (error) {
      const message = handleConvexError(error);
      toast.error(message);
    }
  };
}
```

## NextJS Route Handlers

Use NextJS route handlers only for external integrations, webhooks, and APIs that don't fit the Convex model.

### Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error - no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create household for new user via Convex
    try {
      await convex.mutation(api.households.create, {
        name: `${evt.data.first_name || 'User'}'s Household`,
        clerkUserId: id,
      });
    } catch (error) {
      console.error('Failed to create household:', error);
      return new Response('Error creating household', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    // Handle user deletion
    try {
      await convex.mutation(api.households.deleteByUserId, {
        clerkUserId: id,
      });
    } catch (error) {
      console.error('Failed to delete household:', error);
      return new Response('Error deleting household', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
```

### Barcode Lookup Integration

```typescript
// app/api/barcode/[code]/route.ts
import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const barcode = params.code;
  
  try {
    // First check if product exists in our database
    const existingProduct = await convex.query(api.products.getByBarcode, {
      barcode,
    });

    if (existingProduct) {
      return Response.json({
        found: true,
        cached: true,
        product: existingProduct,
      });
    }

    // Call external barcode API
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        headers: {
          'User-Agent': 'Kitchentory/1.0',
          'Accept': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Barcode API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const productData = {
        name: item.title,
        brand: item.brand,
        barcode: barcode,
        description: item.description,
        imageUrl: item.images?.[0],
        category: item.category,
      };

      return Response.json({
        found: true,
        cached: false,
        product: productData,
      });
    } else {
      return Response.json({
        found: false,
        barcode: barcode,
      });
    }
  } catch (error) {
    console.error('Barcode lookup error:', error);
    
    // Return structured error response
    if (error.name === 'TimeoutError') {
      return Response.json(
        { error: 'Barcode lookup timed out. Please try again.' },
        { status: 408 }
      );
    }
    
    return Response.json(
      { error: 'Failed to lookup barcode' },
      { status: 500 }
    );
  }
}
```

### Webhook Integration Patterns

#### Generic Webhook Handler with Validation

```typescript
// app/api/webhooks/generic/route.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const payload = await request.text();
    
    if (!signature) {
      return Response.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifySignature(
      payload,
      signature,
      process.env.WEBHOOK_SECRET!
    );

    if (!isValid) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);
    const { event, timestamp, data: eventData } = data;

    // Log webhook for debugging
    console.log(`Webhook received: ${event}`, {
      timestamp,
      data: eventData,
    });

    // Process webhook based on event type
    switch (event) {
      case 'inventory.low_stock':
        await convex.mutation(api.notifications.create, {
          type: 'low_stock',
          data: eventData,
          timestamp: Date.now(),
        });
        break;

      case 'recipe.shared':
        await convex.mutation(api.recipes.handleShare, {
          recipeId: eventData.recipeId,
          sharedWith: eventData.userEmail,
          sharedBy: eventData.sharedBy,
        });
        break;

      case 'barcode.scan':
        // Process barcode scan from mobile app
        await convex.mutation(api.analytics.recordScan, {
          barcode: eventData.barcode,
          userId: eventData.userId,
          timestamp: eventData.timestamp,
        });
        break;

      default:
        console.warn(`Unknown webhook event: ${event}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### Advanced Webhook Patterns

#### Batch Processing Webhook

```typescript
// app/api/webhooks/batch/route.ts
import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();
    
    if (!Array.isArray(events)) {
      return Response.json(
        { error: 'Events must be an array' },
        { status: 400 }
      );
    }

    // Process events in batches to avoid overwhelming Convex
    const BATCH_SIZE = 10;
    const results = [];
    
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (event) => {
        try {
          switch (event.type) {
            case 'inventory_update':
              return await convex.mutation(api.inventoryItems.batchUpdate, {
                updates: event.data,
              });
            
            case 'price_update':
              return await convex.mutation(api.products.batchUpdatePrices, {
                priceUpdates: event.data,
              });
            
            default:
              console.warn(`Unknown event type: ${event.type}`);
              return { success: false, error: 'Unknown event type' };
          }
        } catch (error) {
          console.error(`Failed to process event ${event.type}:`, error);
          return { success: false, error: error.message };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failureCount = results.length - successCount;

    return Response.json({
      success: true,
      processed: results.length,
      succeeded: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error('Batch webhook error:', error);
    return Response.json(
      { error: 'Batch processing failed' },
      { status: 500 }
    );
  }
}
```

#### Real-time Webhook with Server-Sent Events

```typescript
// app/api/webhooks/stream/route.ts
import { NextRequest } from 'next/server';

const clients = new Set<Response>();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );
      
      // Store this stream for broadcasting
      const response = {
        controller,
        encoder,
        send: (data: any) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          } catch (error) {
            console.error('Failed to send SSE message:', error);
          }
        },
      };
      
      clients.add(response);
      
      // Clean up on close
      const cleanup = () => {
        clients.delete(response);
        try {
          controller.close();
        } catch (error) {
          // Controller already closed
        }
      };
      
      // Handle client disconnect
      setTimeout(cleanup, 30000); // Close after 30 seconds
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Broadcast to all connected clients
    clients.forEach((client) => {
      client.send({
        type: 'webhook',
        timestamp: Date.now(),
        ...data,
      });
    });

    return Response.json({
      success: true,
      broadcast_to: clients.size,
    });
  } catch (error) {
    console.error('Stream webhook error:', error);
    return Response.json(
      { error: 'Failed to broadcast webhook' },
      { status: 500 }
    );
  }
}
```

### External API Integration Examples

#### Nutrition API Integration

```typescript
// app/api/nutrition/[productName]/route.ts
import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { productName: string } }
) {
  const productName = decodeURIComponent(params.productName);
  
  try {
    // Check cache first
    const cached = await convex.query(api.nutrition.getCached, {
      productName,
    });
    
    if (cached) {
      return Response.json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    // Call nutrition API
    const response = await fetch(
      `https://api.spoonacular.com/food/products/search?query=${encodeURIComponent(productName)}`,
      {
        headers: {
          'X-API-Key': process.env.SPOONACULAR_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Nutrition API request failed');
    }

    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      const nutritionData = {
        productName,
        calories: product.nutrition?.calories,
        protein: product.nutrition?.protein,
        carbs: product.nutrition?.carbohydrates,
        fat: product.nutrition?.fat,
        fiber: product.nutrition?.fiber,
        sugar: product.nutrition?.sugar,
        sodium: product.nutrition?.sodium,
        cachedAt: Date.now(),
      };

      // Cache the result
      await convex.mutation(api.nutrition.cache, nutritionData);
      
      return Response.json({
        success: true,
        cached: false,
        data: nutritionData,
      });
    } else {
      return Response.json({
        success: false,
        error: 'Product not found in nutrition database',
      });
    }
  } catch (error) {
    console.error('Nutrition API error:', error);
    return Response.json(
      { error: 'Failed to fetch nutrition data' },
      { status: 500 }
    );
  }
}
```

#### Store Locator Integration

```typescript
// app/api/stores/nearby/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '10'; // km
  
  if (!lat || !lng) {
    return Response.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Call Google Places API or similar
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&radius=${Number(radius) * 1000}&type=grocery_or_supermarket&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Places API request failed');
    }

    const data = await response.json();
    
    const stores = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      priceLevel: place.price_level,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      distance: calculateDistance(
        Number(lat),
        Number(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      isOpen: place.opening_hours?.open_now,
      photos: place.photos?.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      ),
    }));

    // Sort by distance
    stores.sort((a, b) => a.distance - b.distance);

    return Response.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error('Store locator error:', error);
    return Response.json(
      { error: 'Failed to fetch nearby stores' },
      { status: 500 }
    );
  }
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Advanced Real-time Patterns

#### Multi-tenant Real-time Updates

```typescript
// convex/realtimeHelpers.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Subscribe to household-specific updates
export const subscribeToHouseholdUpdates = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    // Verify user belongs to household
    const household = await ctx.db.get(args.householdId);
    if (!household || household.clerkUserId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Get all relevant data for real-time updates
    const [inventoryItems, shoppingLists, recipes] = await Promise.all([
      ctx.db
        .query("inventoryItems")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect(),
      ctx.db
        .query("shoppingLists")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect(),
      ctx.db
        .query("recipes")
        .filter((q) => q.eq(q.field("createdByUserId"), identity.subject))
        .collect(),
    ]);

    return {
      inventoryCount: inventoryItems.length,
      shoppingListsCount: shoppingLists.length,
      recipesCount: recipes.length,
      lastUpdated: Date.now(),
    };
  },
});

// Real-time notifications
export const getNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) return [];

    // Get expiring items
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const inventoryItems = await ctx.db
      .query("inventoryItems")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const notifications = [];

    // Check for expiring items
    const expiringItems = inventoryItems.filter(item => 
      item.expirationDate && item.expirationDate <= nextWeekStr
    );

    if (expiringItems.length > 0) {
      notifications.push({
        id: 'expiring-items',
        type: 'warning',
        title: 'Items Expiring Soon',
        message: `${expiringItems.length} items expire within a week`,
        count: expiringItems.length,
        priority: 'high',
      });
    }

    // Check for low stock
    const lowStockItems = inventoryItems.filter(item =>
      item.minimumThreshold && item.quantity <= item.minimumThreshold
    );

    if (lowStockItems.length > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'info',
        title: 'Low Stock Alert',
        message: `${lowStockItems.length} items are running low`,
        count: lowStockItems.length,
        priority: 'medium',
      });
    }

    return notifications;
  },
});
```

#### Optimistic Updates Pattern

```typescript
// hooks/useOptimisticInventory.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useOptimisticInventory() {
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
  const inventoryItems = useQuery(api.inventoryItems.list, {});
  const consumeItem = useMutation(api.inventoryItems.consume);
  const updateItem = useMutation(api.inventoryItems.update);

  // Apply optimistic updates to the data
  const itemsWithOptimisticUpdates = inventoryItems?.map(item => {
    const optimisticUpdate = optimisticUpdates.get(item._id);
    return optimisticUpdate ? { ...item, ...optimisticUpdate } : item;
  });

  const optimisticConsume = useCallback(async (itemId: string, quantityUsed?: number) => {
    const item = inventoryItems?.find(i => i._id === itemId);
    if (!item) return;

    const newQuantity = quantityUsed 
      ? item.quantity - quantityUsed
      : 0;

    // Apply optimistic update immediately
    if (newQuantity <= 0) {
      // Item will be deleted
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.set(itemId, { _deleted: true });
        return next;
      });
    } else {
      // Item quantity reduced
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.set(itemId, { quantity: newQuantity });
        return next;
      });
    }

    try {
      await consumeItem({ id: itemId, quantityUsed });
      
      // Remove optimistic update on success
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
      
      toast.error("Failed to consume item. Please try again.");
    }
  }, [inventoryItems, consumeItem]);

  const optimisticUpdate = useCallback(async (itemId: string, updates: any) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(itemId, { ...prev.get(itemId), ...updates });
      return next;
    });

    try {
      await updateItem({ id: itemId, ...updates });
      
      // Remove optimistic update on success
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
      
      toast.error("Failed to update item. Please try again.");
    }
  }, [updateItem]);

  return {
    items: itemsWithOptimisticUpdates,
    optimisticConsume,
    optimisticUpdate,
    isLoading: inventoryItems === undefined,
  };
}
```

## Examples

### Complete Inventory Workflow

```typescript
// Complete example of adding an item with barcode lookup
export function AddItemWithBarcode() {
  const [barcode, setBarcode] = useState("");
  const [productData, setProductData] = useState(null);
  const createItem = useMutation(api.inventoryItems.create);
  const quickAdd = useMutation(api.inventoryItems.quickAdd);

  const handleBarcodeSubmit = async () => {
    try {
      const response = await fetch(`/api/barcode/${barcode}`);
      const data = await response.json();
      
      if (data.found) {
        setProductData(data.product);
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      toast.error("Barcode lookup failed");
    }
  };

  const handleQuickAdd = async (formData: FormData) => {
    try {
      await quickAdd({
        name: productData.name,
        brand: productData.brand,
        categoryId: formData.get("categoryId") as Id<"categories">,
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit") as string,
        locationId: formData.get("locationId") as Id<"storageLocations">,
        daysUntilExpiration: formData.get("daysUntilExpiration") 
          ? Number(formData.get("daysUntilExpiration"))
          : undefined,
      });
      
      toast.success("Item added successfully!");
      setBarcode("");
      setProductData(null);
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleBarcodeSubmit(); }}>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Scan or enter barcode"
        />
        <button type="submit">Lookup</button>
      </form>

      {productData && (
        <form action={handleQuickAdd}>
          <div>Product: {productData.name}</div>
          <div>Brand: {productData.brand}</div>
          
          <select name="categoryId" required>
            <option value="">Select Category</option>
            {/* Category options */}
          </select>
          
          <input name="quantity" type="number" placeholder="Quantity" required />
          <input name="unit" placeholder="Unit" required />
          
          <select name="locationId" required>
            <option value="">Select Location</option>
            {/* Location options */}
          </select>
          
          <input 
            name="daysUntilExpiration" 
            type="number" 
            placeholder="Days until expiration" 
          />
          
          <button type="submit">Add to Inventory</button>
        </form>
      )}
    </div>
  );
}
```

### Recipe Matching with Real-time Updates

```typescript
// Component that shows recipes you can make with current inventory
export function RecipeMatching() {
  const matches = useQuery(api.recipes.findMatching, { threshold: 80 });
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (matches === undefined) return <div>Loading...</div>;

  return (
    <div>
      <h2>Recipes You Can Make</h2>
      {matches.length === 0 ? (
        <p>No matching recipes found. Try adding more ingredients!</p>
      ) : (
        <div>
          {matches.map((match) => (
            <div key={match.recipe._id} className="recipe-match">
              <h3>{match.recipe.name}</h3>
              <div>Match: {match.matchPercentage}%</div>
              <div>
                Available: {match.availableIngredients}/{match.totalIngredients} ingredients
              </div>
              
              {match.missingIngredients.length > 0 && (
                <div>
                  <strong>Missing:</strong>
                  <ul>
                    {match.missingIngredients.map((ingredient, idx) => (
                      <li key={idx}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.product}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button onClick={() => setSelectedMatch(match)}>
                View Recipe
              </button>
            </div>
          ))}
        </div>
      )}
      
      {selectedMatch && (
        <RecipeModal 
          recipe={selectedMatch.recipe} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
```

### Shopping List with Real-time Collaboration

```typescript
// Shopping list that updates in real-time for all household members
export function CollaborativeShoppingList({ listId }: { listId: Id<"shoppingLists"> }) {
  const list = useQuery(api.shoppingLists.get, { id: listId });
  const toggleItem = useMutation(api.shoppingListItems.toggle);
  const addItem = useMutation(api.shoppingListItems.create);

  const handleToggleItem = async (itemId: Id<"shoppingListItems">) => {
    try {
      await toggleItem({ id: itemId });
      // UI updates automatically via real-time sync
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleAddItem = async (formData: FormData) => {
    try {
      await addItem({
        listId,
        name: formData.get("name") as string,
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit") as string,
        estimatedPrice: formData.get("estimatedPrice") 
          ? Number(formData.get("estimatedPrice"))
          : undefined,
      });
      // Form resets automatically
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  if (list === undefined) return <div>Loading...</div>;
  if (!list) return <div>Shopping list not found</div>;

  return (
    <div>
      <h1>{list.name}</h1>
      <div>
        {list.completedItemsCount}/{list.items.length} items completed
      </div>
      
      {/* Real-time progress bar */}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ 
            width: `${(list.completedItemsCount / list.items.length) * 100}%` 
          }}
        />
      </div>

      {/* Items update in real-time for all users */}
      <div>
        {list.items.map((item) => (
          <div 
            key={item._id} 
            className={`item ${item.isPurchased ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.isPurchased}
              onChange={() => handleToggleItem(item._id)}
            />
            <span>{item.name}</span>
            <span>{item.quantity} {item.unit}</span>
            {item.estimatedPrice && (
              <span>${item.estimatedPrice.toFixed(2)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Add new item form */}
      <form action={handleAddItem}>
        <input name="name" placeholder="Item name" required />
        <input name="quantity" type="number" placeholder="Qty" required />
        <input name="unit" placeholder="Unit" required />
        <input name="estimatedPrice" type="number" step="0.01" placeholder="$" />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}
```

## Deployment

The application deploys seamlessly to Vercel with Convex handling all backend infrastructure:

1. **Convex Backend**: Auto-scaling, real-time sync, built-in security
2. **NextJS Frontend**: Static generation + server components
3. **Clerk Authentication**: Managed auth with automatic user sync
4. **Environment Variables**: Configured in Vercel dashboard

### Required Environment Variables

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-app.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional: External APIs
BARCODE_API_KEY=your-barcode-api-key
```

No server management required - Convex provides complete backend infrastructure with real-time capabilities, automatic scaling, and built-in security.

---

## API Reference Summary

### Convex Functions by Module

#### Inventory Management (`api.inventoryItems.*`)

**Queries:**
- `list(filters)` - Get filtered inventory items with real-time updates
- `get(id)` - Get single item with related data
- `getStats()` - Get household inventory statistics

**Mutations:**
- `create(itemData)` - Add new inventory item
- `update(id, updates)` - Update existing item
- `quickAdd(productData)` - Quickly add item with product creation
- `consume(id, quantityUsed?)` - Consume/use item
- `bulkAction(itemIds, action, params)` - Bulk operations

#### Recipe Management (`api.recipes.*`)

**Queries:**
- `list(filters)` - Get filtered recipes
- `get(id)` - Get recipe with ingredients
- `findMatching(threshold?)` - Find recipes you can make with current inventory

**Mutations:**
- `create(recipeData)` - Create new recipe
- `update(id, updates)` - Update recipe
- `delete(id)` - Delete recipe
- `addIngredient(recipeId, ingredient)` - Add ingredient to recipe

#### Shopping Lists (`api.shoppingLists.*`)

**Queries:**
- `list(filters)` - Get shopping lists with stats
- `get(id)` - Get list with items

**Mutations:**
- `create(listData)` - Create shopping list
- `generateFromDepleted(params)` - Auto-generate from low stock
- `update(id, updates)` - Update list
- `delete(id)` - Delete list

#### Categories & Products (`api.categories.*`, `api.products.*`)

**Queries:**
- `categories.list()` - Get all categories
- `products.search(query)` - Search products
- `products.getByBarcode(barcode)` - Find product by barcode

**Mutations:**
- `categories.create(name, description)` - Create category
- `products.create(productData)` - Create product
- `products.updateNutrition(id, nutrition)` - Update nutrition info

### NextJS API Routes

#### External Integrations
- `GET /api/barcode/[code]` - Barcode lookup with caching
- `GET /api/nutrition/[product]` - Nutrition data lookup
- `GET /api/stores/nearby` - Find nearby grocery stores

#### Webhook Endpoints
- `POST /api/webhooks/clerk` - Clerk user lifecycle events
- `POST /api/webhooks/generic` - Generic webhook processor
- `POST /api/webhooks/batch` - Batch event processing
- `GET/POST /api/webhooks/stream` - Real-time webhook streaming

### Authentication Context

All Convex functions automatically receive authentication context:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Authentication required");

// Get user's household
const household = await ctx.db
  .query("households")
  .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
  .first();
```

### Real-time Subscriptions

All queries provide automatic real-time updates:

```typescript
// Component automatically re-renders when data changes
const items = useQuery(api.inventoryItems.list, { search: "milk" });
const stats = useQuery(api.inventoryItems.getStats);
const notifications = useQuery(api.notifications.list);
```

### Error Handling Standards

**Convex Functions:**
```typescript
// Use ConvexError for user-facing errors
throw new ConvexError("Item not found");

// System errors are automatically handled
throw new Error("Database connection failed");
```

**Client-side:**
```typescript
try {
  await createItem(data);
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.data); // User-friendly message
  } else {
    toast.error("Something went wrong");
  }
}
```

### Performance Best Practices

1. **Query Optimization:**
   - Use specific indexes for filters
   - Limit data fetching with pagination
   - Cache expensive calculations

2. **Real-time Updates:**
   - Queries automatically optimize for minimal re-renders
   - Use optimistic updates for immediate feedback
   - Batch mutations when possible

3. **Data Loading:**
   - Check for `undefined` to handle loading states
   - Use React Suspense for better UX
   - Implement error boundaries for graceful failures

### Deployment Configuration

**Required Environment Variables:**
```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# External APIs
SPOONACULAR_API_KEY=your-nutrition-api-key
GOOGLE_MAPS_API_KEY=your-maps-api-key
WEBHOOK_SECRET=your-webhook-secret
```

**Deployment Steps:**
1. Deploy Convex functions: `npx convex deploy --prod`
2. Configure environment variables in Vercel
3. Deploy NextJS app: `vercel --prod`
4. Set up webhook endpoints in external services

This architecture provides a robust, scalable, and real-time kitchen inventory management system with comprehensive API coverage for all client needs.