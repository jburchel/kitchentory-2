'use client'

// Removed Convex imports to fix production Symbol(functionName) errors
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
  return undefined // Return undefined for mock mode
}

/**
 * Mock wrapper for mutations
 */
export function useConvexMutation<T extends FunctionReference<'mutation'>>(
  mutation: T
) {
  return async (data: any) => {
    console.log('Mock mutation called:', data)
    return Promise.resolve(null)
  }
}

/**
 * Mock wrapper for actions
 */
export function useConvexAction<T extends FunctionReference<'action'>>(
  action: T
) {
  return async (data: any) => {
    console.log('Mock action called:', data)
    return Promise.resolve(null)
  }
}

// Specific hooks for common operations
export const useHouseholds = () => {
  return {
    // Queries - all return undefined for mock mode
    get: (id: string) => undefined,
    listForUser: (userId: string) => undefined,
    getMembers: (householdId: string) => undefined,

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
    // Queries - all return undefined for mock mode
    get: (id: string) => undefined,
    listForHousehold: (householdId: string, activeOnly?: boolean) => undefined,
    getSubcategories: (parentId: string) => undefined,
    getHierarchy: (householdId: string) => undefined,

    // Mutations
    create: useConvexMutation(convexAvailable ? api.categories.create : undefined),
    update: useConvexMutation(convexAvailable ? api.categories.update : undefined),
    remove: useConvexMutation(convexAvailable ? api.categories.remove : undefined),
    hardDelete: useConvexMutation(convexAvailable ? api.categories.hardDelete : undefined),
  }
}

export const useProducts = () => {
  return {
    // Queries - all return undefined for mock mode
    get: (id: string) => undefined,
    getByBarcode: (barcode: string) => undefined,
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        categoryId?: string
        searchTerm?: string
        limit?: number
      }
    ) => undefined,
    search: (householdId: string, searchTerm: string, limit?: number) => undefined,
    getByCategory: (categoryId: string) => undefined,
    getPopular: (householdId: string, limit?: number) => undefined,

    // Mutations
    create: useConvexMutation(convexAvailable ? api.products.create : undefined),
    update: useConvexMutation(convexAvailable ? api.products.update : undefined),
    remove: useConvexMutation(convexAvailable ? api.products.remove : undefined),
    hardDelete: useConvexMutation(convexAvailable ? api.products.hardDelete : undefined),
  }
}

export const useInventoryItems = () => {
  return {
    // Queries - all return undefined for mock mode
    get: (id: string) => undefined,
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        location?: string
        productId?: string
      }
    ) => undefined,
    getWithProducts: (householdId: string, activeOnly?: boolean) => undefined,
    getExpiring: (householdId: string, daysAhead?: number) => undefined,
    getLowStock: (householdId: string, threshold?: number) => undefined,
    getByLocation: (householdId: string, location: string) => undefined,
    getStats: (householdId: string) => undefined,

    // Mutations
    create: useConvexMutation(convexAvailable ? api.inventoryItems.create : undefined),
    update: useConvexMutation(convexAvailable ? api.inventoryItems.update : undefined),
    consume: useConvexMutation(convexAvailable ? api.inventoryItems.consume : undefined),
    remove: useConvexMutation(convexAvailable ? api.inventoryItems.remove : undefined),
  }
}

export const useShoppingLists = () => {
  return {
    // Queries - all return undefined for mock mode
    get: (id: string) => undefined,
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        completedOnly?: boolean
      }
    ) => undefined,
    getWithItems: (id: string) => undefined,
    getItems: (shoppingListId: string, completedOnly?: boolean) => undefined,
    getStats: (householdId: string) => undefined,

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
