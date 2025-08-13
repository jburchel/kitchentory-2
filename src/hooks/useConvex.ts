'use client'

import { useQuery, useMutation, useAction } from 'convex/react'
import type {
  FunctionReference,
  OptionalRestArgs,
  FunctionReturnType,
} from 'convex/server'

// Safely import API with error handling
let api: any = null
let convexAvailable = false

try {
  const apiModule = require("@/convex/_generated/api")
  api = apiModule.api
  convexAvailable = api && typeof api === 'object' && 
    api.households && api.categories && api.products && 
    api.inventoryItems && api.shoppingLists
} catch (error) {
  console.warn('Convex API not available:', error)
  api = null
  convexAvailable = false
}

/**
 * Custom hook for Convex queries with error handling
 */
export function useConvexQuery<T extends FunctionReference<'query'>>(
  query: T,
  ...args: OptionalRestArgs<T>
): FunctionReturnType<T> | undefined {
  return useQuery(convexAvailable ? query : undefined, ...args)
}

/**
 * Custom hook for Convex mutations with error handling
 */
export function useConvexMutation<T extends FunctionReference<'mutation'>>(
  mutation: T
) {
  return useMutation(convexAvailable ? mutation : undefined)
}

/**
 * Custom hook for Convex actions with error handling
 */
export function useConvexAction<T extends FunctionReference<'action'>>(
  action: T
) {
  return useAction(convexAvailable ? action : undefined)
}

// Specific hooks for common operations
export const useHouseholds = () => {
  return {
    // Queries
    get: (id: string) => useQuery(convexAvailable ? api.households.get : undefined, { id: id as any }),
    listForUser: (userId: string) =>
      useQuery(convexAvailable ? api.households.listForUser : undefined, { userId }),
    getMembers: (householdId: string) =>
      useQuery(convexAvailable ? api.households.getMembers : undefined, { householdId: householdId as any }),

    // Mutations
    create: useConvexMutation(convexAvailable ? api.households.create : undefined),
    update: useConvexMutation(convexAvailable ? api.households.update : undefined),
    remove: useConvexMutation(convexAvailable ? api.households.remove : undefined),
    addMember: useConvexMutation(convexAvailable ? api.households.addMember : undefined),
    removeMember: useConvexMutation(convexAvailable ? api.households.removeMember : undefined),
  }
}

export const useCategories = () => {
  return {
    // Queries
    get: (id: string) => useQuery(convexAvailable ? api.categories.get : undefined, { id: id as any }),
    listForHousehold: (householdId: string, activeOnly?: boolean) =>
      useQuery(convexAvailable ? api.categories.listForHousehold : undefined, {
        householdId: householdId as any,
        activeOnly,
      }),
    getSubcategories: (parentId: string) =>
      useQuery(convexAvailable ? api.categories.getSubcategories : undefined, { parentId: parentId as any }),
    getHierarchy: (householdId: string) =>
      useQuery(convexAvailable ? api.categories.getHierarchy : undefined, {
        householdId: householdId as any,
      }),

    // Mutations
    create: useConvexMutation(convexAvailable ? api.categories.create : undefined),
    update: useConvexMutation(convexAvailable ? api.categories.update : undefined),
    remove: useConvexMutation(convexAvailable ? api.categories.remove : undefined),
    hardDelete: useConvexMutation(convexAvailable ? api.categories.hardDelete : undefined),
  }
}

export const useProducts = () => {
  return {
    // Queries
    get: (id: string) => useQuery(convexAvailable ? api.products.get : undefined, { id: id as any }),
    getByBarcode: (barcode: string) =>
      useQuery(convexAvailable ? api.products.getByBarcode : undefined, { barcode }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        categoryId?: string
        searchTerm?: string
        limit?: number
      }
    ) =>
      useQuery(convexAvailable ? api.products.listForHousehold : undefined, {
        householdId: householdId as any,
        ...options,
        categoryId: options?.categoryId as any,
      }),
    search: (householdId: string, searchTerm: string, limit?: number) =>
      useQuery(convexAvailable ? api.products.search : undefined, {
        householdId: householdId as any,
        searchTerm,
        limit,
      }),
    getByCategory: (categoryId: string) =>
      useQuery(convexAvailable ? api.products.getByCategory : undefined, { categoryId: categoryId as any }),
    getPopular: (householdId: string, limit?: number) =>
      useQuery(convexAvailable ? api.products.getPopular : undefined, {
        householdId: householdId as any,
        limit,
      }),

    // Mutations
    create: useConvexMutation(convexAvailable ? api.products.create : undefined),
    update: useConvexMutation(convexAvailable ? api.products.update : undefined),
    remove: useConvexMutation(convexAvailable ? api.products.remove : undefined),
    hardDelete: useConvexMutation(convexAvailable ? api.products.hardDelete : undefined),
  }
}

export const useInventoryItems = () => {
  return {
    // Queries
    get: (id: string) => useQuery(convexAvailable ? api.inventoryItems.get : undefined, { id: id as any }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        location?: string
        productId?: string
      }
    ) =>
      useQuery(convexAvailable ? api.inventoryItems.listForHousehold : undefined, {
        householdId: householdId as any,
        ...options,
        productId: options?.productId as any,
      }),
    getWithProducts: (householdId: string, activeOnly?: boolean) =>
      useQuery(convexAvailable ? api.inventoryItems.getWithProducts : undefined, {
        householdId: householdId as any,
        activeOnly,
      }),
    getExpiring: (householdId: string, daysAhead?: number) =>
      useQuery(convexAvailable ? api.inventoryItems.getExpiring : undefined, {
        householdId: householdId as any,
        daysAhead,
      }),
    getLowStock: (householdId: string, threshold?: number) =>
      useQuery(convexAvailable ? api.inventoryItems.getLowStock : undefined, {
        householdId: householdId as any,
        threshold,
      }),
    getByLocation: (householdId: string, location: string) =>
      useQuery(convexAvailable ? api.inventoryItems.getByLocation : undefined, {
        householdId: householdId as any,
        location,
      }),
    getStats: (householdId: string) =>
      useQuery(convexAvailable ? api.inventoryItems.getStats : undefined, {
        householdId: householdId as any,
      }),

    // Mutations
    create: useConvexMutation(convexAvailable ? api.inventoryItems.create : undefined),
    update: useConvexMutation(convexAvailable ? api.inventoryItems.update : undefined),
    consume: useConvexMutation(convexAvailable ? api.inventoryItems.consume : undefined),
    remove: useConvexMutation(convexAvailable ? api.inventoryItems.remove : undefined),
  }
}

export const useShoppingLists = () => {
  return {
    // Queries
    get: (id: string) => useQuery(convexAvailable ? api.shoppingLists.get : undefined, { id: id as any }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        completedOnly?: boolean
      }
    ) =>
      useQuery(convexAvailable ? api.shoppingLists.listForHousehold : undefined, {
        householdId: householdId as any,
        ...options,
      }),
    getWithItems: (id: string) =>
      useQuery(convexAvailable ? api.shoppingLists.getWithItems : undefined, { id: id as any }),
    getItems: (shoppingListId: string, completedOnly?: boolean) =>
      useQuery(convexAvailable ? api.shoppingLists.getItems : undefined, {
        shoppingListId: shoppingListId as any,
        completedOnly,
      }),
    getStats: (householdId: string) =>
      useQuery(convexAvailable ? api.shoppingLists.getStats : undefined, { householdId: householdId as any }),

    // Mutations
    create: useConvexMutation(convexAvailable ? api.shoppingLists.create : undefined),
    update: useConvexMutation(convexAvailable ? api.shoppingLists.update : undefined),
    complete: useConvexMutation(convexAvailable ? api.shoppingLists.complete : undefined),
    remove: useConvexMutation(convexAvailable ? api.shoppingLists.remove : undefined),
    addItem: useConvexMutation(convexAvailable ? api.shoppingLists.addItem : undefined),
    updateItem: useConvexMutation(convexAvailable ? api.shoppingLists.updateItem : undefined),
    completeItem: useConvexMutation(convexAvailable ? api.shoppingLists.completeItem : undefined),
    removeItem: useConvexMutation(convexAvailable ? api.shoppingLists.removeItem : undefined),
    generateFromLowStock: useConvexMutation(
      convexAvailable ? api.shoppingLists.generateFromLowStock : undefined
    ),
  }
}
