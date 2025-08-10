# Kitchentory Convex API Documentation

## Overview

Kitchentory uses Convex for real-time data management with TypeScript-first APIs. All data operations are handled through Convex queries, mutations, and actions with automatic real-time synchronization.

## Tech Stack

- **Backend**: Convex (real-time database & functions)
- **Frontend**: NextJS 14+ with App Router
- **Authentication**: Clerk with Convex integration
- **Language**: TypeScript
- **UI**: shadcn/ui + TailwindCSS
- **Deployment**: Vercel

## Authentication

Authentication is handled by Clerk and integrated with Convex. All Convex functions automatically receive the authenticated user's identity.

```typescript
// Convex function with authentication
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Function implementation
  },
});
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
  }).index("by_user", ["clerkUserId"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    householdId: v.id("households"),
  }).index("by_household", ["householdId"]),

  products: defineTable({
    name: v.string(),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()),
    categoryId: v.id("categories"),
    defaultUnit: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_category", ["categoryId"])
    .index("by_barcode", ["barcode"]),

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
  }).index("by_household", ["householdId"]),

  inventoryItems: defineTable({
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
    expirationDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
    householdId: v.id("households"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_location", ["locationId"])
    .index("by_product", ["productId"])
    .index("by_expiration", ["expirationDate"]),
});
```

## TypeScript Types

```typescript
// types/inventory.ts
import { Doc, Id } from "../convex/_generated/dataModel";

export type Household = Doc<"households">;
export type Category = Doc<"categories">;
export type Product = Doc<"products">;
export type StorageLocation = Doc<"storageLocations">;
export type InventoryItem = Doc<"inventoryItems">;

export interface CategoryWithItemCount extends Category {
  itemCount: number;
}

export interface InventoryItemWithDetails extends InventoryItem {
  product: Product;
  location: StorageLocation;
  category: Category;
}

export interface InventoryStats {
  totalItems: number;
  expiredItems: number;
  expiringSoon: number;
  topCategories: Array<{ name: string; count: number }>;
  topLocations: Array<{ name: string; count: number }>;
}
```

## Convex Functions

### Categories

#### List Categories Query
```typescript
// convex/categories.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    ordering: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    let categories = await ctx.db
      .query("categories")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    // Apply search filter
    if (args.search) {
      categories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(args.search!.toLowerCase())
      );
    }

    // Get item counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await ctx.db
          .query("inventoryItems")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .collect()
          .then((items) =>
            items.filter(async (item) => {
              const product = await ctx.db.get(item.productId);
              return product?.categoryId === category._id;
            })
          )
          .then((items) => items.length);

        return { ...category, itemCount };
      })
    );

    // Apply ordering
    if (args.ordering) {
      categoriesWithCounts.sort((a, b) => {
        if (args.ordering === "name") return a.name.localeCompare(b.name);
        if (args.ordering === "-item_count") return b.itemCount - a.itemCount;
        if (args.ordering === "item_count") return a.itemCount - b.itemCount;
        return 0;
      });
    }

    return categoriesWithCounts;
  },
});

export const get = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.get(args.id);
  },
});
```

#### Client Usage
```typescript
// components/CategoriesList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CategoriesList() {
  const categories = useQuery(api.categories.list, {
    search: "",
    ordering: "name"
  });

  if (categories === undefined) return <div>Loading...</div>;

  return (
    <div>
      {categories.map((category) => (
        <div key={category._id}>
          {category.name} ({category.itemCount} items)
        </div>
      ))}
    </div>
  );
}
```

### Products

#### Search Products Query

```typescript
// convex/products.ts
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchTerm = args.query.toLowerCase();

    const products = await ctx.db.query("products").collect();

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
        (product.barcode && product.barcode.includes(searchTerm))
      )
      .slice(0, limit);
  },
});

export const getByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .first();
  },
});
```

### Storage Locations

#### Storage Location Mutations

```typescript
// convex/storageLocations.ts
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    return await ctx.db.insert("storageLocations", {
      ...args,
      householdId: household._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("storageLocations"),
    name: v.optional(v.string()),
    locationType: v.optional(v.union(
      v.literal("fridge"),
      v.literal("freezer"),
      v.literal("pantry"),
      v.literal("counter"),
      v.literal("cabinet")
    )),
    temperature: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});
```

### Inventory Items

#### Inventory Item Queries and Mutations

```typescript
// convex/inventoryItems.ts
export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    locationId: v.optional(v.id("storageLocations")),
    unit: v.optional(v.string()),
    isExpired: v.optional(v.boolean()),
    expiringSoonDays: v.optional(v.number()),
    search: v.optional(v.string()),
    ordering: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
      
      items = items.filter((item) =>
        item.expirationDate && 
        item.expirationDate <= futureDateStr &&
        item.expirationDate >= new Date().toISOString().split('T')[0]
      );
    }

    // Get related data
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

    return itemsWithDetails;
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unit: v.string(),
    locationId: v.id("storageLocations"),
    expirationDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const household = await ctx.db
      .query("households")
      .withIndex("by_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!household) throw new Error("Household not found");

    const now = Date.now();
    return await ctx.db.insert("inventoryItems", {
      ...args,
      householdId: household._id,
      createdAt: now,
      updatedAt: now,
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
    if (!identity) throw new Error("Not authenticated");

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
  args: { id: v.id("inventoryItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
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
    if (!identity) throw new Error("Not authenticated");

    const { itemIds, action, locationId, expirationDate } = args;

    for (const itemId of itemIds) {
      switch (action) {
        case "consume":
        case "delete":
          await ctx.db.delete(itemId);
          break;
        case "update_location":
          if (locationId) {
            await ctx.db.patch(itemId, { 
              locationId,
              updatedAt: Date.now()
            });
          }
          break;
        case "update_expiration":
          if (expirationDate) {
            await ctx.db.patch(itemId, { 
              expirationDate,
              updatedAt: Date.now()
            });
          }
          break;
      }
    }

    return { success: true, processedItems: itemIds.length };
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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

    // Get category and location stats
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
      expiredItems,
      expiringSoon,
      topCategories,
      topLocations,
    };
  },
});
```

## Client-Side Real-time Usage

```typescript
// components/InventoryDashboard.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InventoryDashboard() {
  // Real-time queries that automatically update
  const items = useQuery(api.inventoryItems.list, {});
  const stats = useQuery(api.inventoryItems.getStats);
  const categories = useQuery(api.categories.list, {});
  
  // Mutations for data modification
  const createItem = useMutation(api.inventoryItems.create);
  const consumeItem = useMutation(api.inventoryItems.consume);

  const handleCreateItem = async (itemData: any) => {
    try {
      await createItem(itemData);
      // UI automatically updates due to real-time sync
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  if (items === undefined || stats === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Inventory Dashboard</h1>
      <div>
        <p>Total Items: {stats.totalItems}</p>
        <p>Expired: {stats.expiredItems}</p>
        <p>Expiring Soon: {stats.expiringSoon}</p>
      </div>
      
      <div>
        {items.map((item) => (
          <div key={item._id}>
            {item.product?.name} - {item.quantity} {item.unit}
            <button onClick={() => consumeItem({ id: item._id })}>
              Consume
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

```typescript
// Convex error handling with validators
import { ConvexError } from "convex/values";

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

    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be greater than 0");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new ConvexError("Storage location not found");
    }

    // Continue with creation...
  },
});
```

## NextJS Route Handlers (for external integrations)

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
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
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
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create household for new user
    await convex.mutation(api.households.create, {
      name: `${evt.data.first_name}'s Household`,
      clerkUserId: id,
    });
  }

  return new Response('', { status: 200 });
}
```

## Real-time Subscriptions

Convex automatically provides real-time updates. Any component using `useQuery` will automatically re-render when the underlying data changes, providing instant updates across all connected clients.

```typescript
// Multiple clients automatically sync in real-time
function ExpiringSoonAlert() {
  const expiring = useQuery(api.inventoryItems.list, {
    expiringSoonDays: 3
  });

  // This component updates automatically when:
  // - Items are added/removed
  // - Expiration dates change
  // - Items are consumed
  
  return (
    <div>
      {expiring?.length > 0 && (
        <Alert>
          {expiring.length} items expiring soon!
        </Alert>
      )}
    </div>
  );
}
```

## Deployment

The application deploys seamlessly to Vercel with Convex handling all backend infrastructure automatically. No server management required - Convex provides auto-scaling, real-time sync, and built-in security.