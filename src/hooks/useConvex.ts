'use client'

import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from "@/convex/_generated/api"
import type {
  FunctionReference,
  OptionalRestArgs,
  FunctionReturnType,
} from 'convex/server'

/**
 * Custom hook for Convex queries with error handling
 */
export function useConvexQuery<T extends FunctionReference<'query'>>(
  query: T,
  ...args: OptionalRestArgs<T>
): FunctionReturnType<T> | undefined {
  return useQuery(query, ...args)
}

/**
 * Custom hook for Convex mutations with error handling
 */
export function useConvexMutation<T extends FunctionReference<'mutation'>>(
  mutation: T
) {
  return useMutation(mutation)
}

/**
 * Custom hook for Convex actions with error handling
 */
export function useConvexAction<T extends FunctionReference<'action'>>(
  action: T
) {
  return useAction(action)
}

// Specific hooks for common operations
export const useHouseholds = () => {
  return {
    // Queries
    get: (id: string) => useQuery(api.households.get, { id: id as any }),
    listForUser: (userId: string) =>
      useQuery(api.households.listForUser, { userId }),
    getMembers: (householdId: string) =>
      useQuery(api.households.getMembers, { householdId: householdId as any }),

    // Mutations
    create: useConvexMutation(api.households.create),
    update: useConvexMutation(api.households.update),
    remove: useConvexMutation(api.households.remove),
    addMember: useConvexMutation(api.households.addMember),
    removeMember: useConvexMutation(api.households.removeMember),
  }
}

export const useCategories = () => {
  return {
    // Queries
    get: (id: string) => useQuery(api.categories.get, { id: id as any }),
    listForHousehold: (householdId: string, activeOnly?: boolean) =>
      useQuery(api.categories.listForHousehold, {
        householdId: householdId as any,
        activeOnly,
      }),
    getSubcategories: (parentId: string) =>
      useQuery(api.categories.getSubcategories, { parentId: parentId as any }),
    getHierarchy: (householdId: string) =>
      useQuery(api.categories.getHierarchy, {
        householdId: householdId as any,
      }),

    // Mutations
    create: useConvexMutation(api.categories.create),
    update: useConvexMutation(api.categories.update),
    remove: useConvexMutation(api.categories.remove),
    hardDelete: useConvexMutation(api.categories.hardDelete),
  }
}

export const useProducts = () => {
  return {
    // Queries
    get: (id: string) => useQuery(api.products.get, { id: id as any }),
    getByBarcode: (barcode: string) =>
      useQuery(api.products.getByBarcode, { barcode }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        categoryId?: string
        searchTerm?: string
        limit?: number
      }
    ) =>
      useQuery(api.products.listForHousehold, {
        householdId: householdId as any,
        ...options,
        categoryId: options?.categoryId as any,
      }),
    search: (householdId: string, searchTerm: string, limit?: number) =>
      useQuery(api.products.search, {
        householdId: householdId as any,
        searchTerm,
        limit,
      }),
    getByCategory: (categoryId: string) =>
      useQuery(api.products.getByCategory, { categoryId: categoryId as any }),
    getPopular: (householdId: string, limit?: number) =>
      useQuery(api.products.getPopular, {
        householdId: householdId as any,
        limit,
      }),

    // Mutations
    create: useConvexMutation(api.products.create),
    update: useConvexMutation(api.products.update),
    remove: useConvexMutation(api.products.remove),
    hardDelete: useConvexMutation(api.products.hardDelete),
  }
}

export const useInventoryItems = () => {
  return {
    // Queries
    get: (id: string) => useQuery(api.inventoryItems.get, { id: id as any }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        location?: string
        productId?: string
      }
    ) =>
      useQuery(api.inventoryItems.listForHousehold, {
        householdId: householdId as any,
        ...options,
        productId: options?.productId as any,
      }),
    getWithProducts: (householdId: string, activeOnly?: boolean) =>
      useQuery(api.inventoryItems.getWithProducts, {
        householdId: householdId as any,
        activeOnly,
      }),
    getExpiring: (householdId: string, daysAhead?: number) =>
      useQuery(api.inventoryItems.getExpiring, {
        householdId: householdId as any,
        daysAhead,
      }),
    getLowStock: (householdId: string, threshold?: number) =>
      useQuery(api.inventoryItems.getLowStock, {
        householdId: householdId as any,
        threshold,
      }),
    getByLocation: (householdId: string, location: string) =>
      useQuery(api.inventoryItems.getByLocation, {
        householdId: householdId as any,
        location,
      }),
    getStats: (householdId: string) =>
      useQuery(api.inventoryItems.getStats, {
        householdId: householdId as any,
      }),

    // Mutations
    create: useConvexMutation(api.inventoryItems.create),
    update: useConvexMutation(api.inventoryItems.update),
    consume: useConvexMutation(api.inventoryItems.consume),
    remove: useConvexMutation(api.inventoryItems.remove),
  }
}

export const useShoppingLists = () => {
  return {
    // Queries
    get: (id: string) => useQuery(api.shoppingLists.get, { id: id as any }),
    listForHousehold: (
      householdId: string,
      options?: {
        activeOnly?: boolean
        completedOnly?: boolean
      }
    ) =>
      useQuery(api.shoppingLists.listForHousehold, {
        householdId: householdId as any,
        ...options,
      }),
    getWithItems: (id: string) =>
      useQuery(api.shoppingLists.getWithItems, { id: id as any }),
    getItems: (shoppingListId: string, completedOnly?: boolean) =>
      useQuery(api.shoppingLists.getItems, {
        shoppingListId: shoppingListId as any,
        completedOnly,
      }),
    getStats: (householdId: string) =>
      useQuery(api.shoppingLists.getStats, { householdId: householdId as any }),

    // Mutations
    create: useConvexMutation(api.shoppingLists.create),
    update: useConvexMutation(api.shoppingLists.update),
    complete: useConvexMutation(api.shoppingLists.complete),
    remove: useConvexMutation(api.shoppingLists.remove),
    addItem: useConvexMutation(api.shoppingLists.addItem),
    updateItem: useConvexMutation(api.shoppingLists.updateItem),
    completeItem: useConvexMutation(api.shoppingLists.completeItem),
    removeItem: useConvexMutation(api.shoppingLists.removeItem),
    generateFromLowStock: useConvexMutation(
      api.shoppingLists.generateFromLowStock
    ),
  }
}
