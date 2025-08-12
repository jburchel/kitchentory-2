'use client'

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { addDays, isBefore, isAfter } from 'date-fns'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  expirationDate?: Date
  purchaseDate?: Date
  cost?: number
  barcode?: string
  notes?: string
  location?: string
  brand?: string
  householdId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateItemData {
  name: string
  category: string
  quantity: number
  unit: string
  expirationDate?: string
  purchaseDate?: string
  cost?: number
  barcode?: string
  notes?: string
  location?: string
  brand?: string
}

export interface UpdateItemData extends Partial<CreateItemData> {
  id: string
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  expiredCount: number
  expiringSoonCount: number
  lowStockCount: number
  categoryCounts: Record<string, number>
  expiredItems: InventoryItem[]
  expiringSoonItems: InventoryItem[]
  lowStockItems: InventoryItem[]
}

export interface UseInventoryReturn {
  items: InventoryItem[]
  stats: InventoryStats
  loading: boolean
  error: string | null
  createItem: (householdId: string, data: CreateItemData) => Promise<InventoryItem>
  updateItem: (data: UpdateItemData) => Promise<InventoryItem>
  deleteItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  searchItems: (query: string) => InventoryItem[]
  filterItems: (filter: 'all' | 'expiring' | 'expired' | 'low-stock') => InventoryItem[]
  refreshItems: (householdId: string) => Promise<void>
  getItemsByCategory: (category: string) => InventoryItem[]
  getItemsExpiringBefore: (date: Date) => InventoryItem[]
  getLowStockItems: (threshold?: number) => InventoryItem[]
  sortItems: (sortBy: 'name' | 'category' | 'expiration' | 'quantity' | 'cost' | 'createdAt') => InventoryItem[]
}

// Mock data for development
const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    category: 'produce',
    quantity: 6,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    cost: 3.99,
    brand: 'Fresh Market',
    location: 'Counter',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'gallon',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    cost: 4.29,
    brand: 'Local Dairy',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Ground Turkey',
    category: 'meat',
    quantity: 2,
    unit: 'lbs',
    expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    cost: 8.99,
    brand: 'Premium Meat Co',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
]

export function useInventory(householdId?: string): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convex mutations and queries - handle SSR gracefully
  const createInventoryItem = typeof window !== 'undefined' ? useMutation(api.inventoryItems.createInventoryItem) : null
  const updateInventoryItemMutation = typeof window !== 'undefined' ? useMutation(api.inventoryItems.updateInventoryItem) : null
  const deleteInventoryItemMutation = typeof window !== 'undefined' ? useMutation(api.inventoryItems.deleteInventoryItem) : null
  const updateItemQuantityMutation = typeof window !== 'undefined' ? useMutation(api.inventoryItems.updateItemQuantity) : null
  // Only use Convex queries if we have a valid Convex ID format (starts with a letter followed by alphanumeric)
  const isValidConvexId = householdId && /^[a-z][a-z0-9]*$/.test(householdId)
  
  const getInventoryItemsQuery = useQuery(
    isValidConvexId && typeof window !== 'undefined' ? api.inventoryItems.getInventoryItems : undefined,
    isValidConvexId && typeof window !== 'undefined' ? { householdId: householdId as Id<'households'>, userId: 'current-user' } : 'skip'
  )
  const getInventoryStatsQuery = useQuery(
    isValidConvexId && typeof window !== 'undefined' ? api.inventoryItems.getInventoryStats : undefined,
    isValidConvexId && typeof window !== 'undefined' ? { householdId: householdId as Id<'households'>, userId: 'current-user' } : 'skip'
  )

  // Use Convex data when available, fallback to mock data for development
  const convexItems = getInventoryItemsQuery
  const convexStats = getInventoryStatsQuery
  const isConvexLoading = isValidConvexId && getInventoryItemsQuery === undefined
  
  // Transform Convex data to match our interface
  const transformedItems = useMemo(() => {
    if (convexItems) {
      return convexItems.map((item: any): InventoryItem => ({
        id: item._id,
        name: item.customName || 'Unknown Item',
        category: item.customCategory || 'other',
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
        cost: item.cost,
        barcode: item.barcode,
        notes: item.notes,
        location: item.storageLocation?.name,
        brand: item.customBrand,
        householdId: item.householdId,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }))
    }
    return items || mockItems // Fallback to mock data during development
  }, [convexItems, items])

  // Calculate inventory statistics - use Convex stats when available
  const stats = useMemo((): InventoryStats => {
    if (convexStats) {
      return {
        totalItems: convexStats.totalItems,
        totalValue: convexStats.totalValue,
        expiredCount: convexStats.expiredCount,
        expiringSoonCount: convexStats.expiringSoonCount,
        lowStockCount: convexStats.lowStockCount,
        categoryCounts: convexStats.categoryBreakdown,
        expiredItems: convexStats.expiredItems?.map((item: any): InventoryItem => ({
          id: item._id,
          name: item.customName || 'Unknown Item',
          category: item.customCategory || 'other',
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
          cost: item.cost,
          barcode: item.barcode,
          notes: item.notes,
          location: item.storageLocation?.name,
          brand: item.customBrand,
          householdId: item.householdId,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })) || [],
        expiringSoonItems: convexStats.expiringSoonItems?.map((item: any): InventoryItem => ({
          id: item._id,
          name: item.customName || 'Unknown Item',
          category: item.customCategory || 'other',
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
          cost: item.cost,
          barcode: item.barcode,
          notes: item.notes,
          location: item.storageLocation?.name,
          brand: item.customBrand,
          householdId: item.householdId,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })) || [],
        lowStockItems: convexStats.lowStockItems?.map((item: any): InventoryItem => ({
          id: item._id,
          name: item.customName || 'Unknown Item',
          category: item.customCategory || 'other',
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
          cost: item.cost,
          barcode: item.barcode,
          notes: item.notes,
          location: item.storageLocation?.name,
          brand: item.customBrand,
          householdId: item.householdId,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })) || []
      }
    }
    
    // Fallback to calculating from local data
    const now = new Date()
    const threeDaysFromNow = addDays(now, 3)
    
    const currentItems = transformedItems
    const totalItems = currentItems.length
    const totalValue = currentItems.reduce((sum, item) => sum + (item.cost || 0), 0)
    
    const expiredItems = currentItems.filter(item => 
      item.expirationDate && isBefore(item.expirationDate, now)
    )
    
    const expiringSoonItems = currentItems.filter(item => 
      item.expirationDate && 
      isAfter(item.expirationDate, now) && 
      isBefore(item.expirationDate, threeDaysFromNow)
    )
    
    const lowStockItems = currentItems.filter(item => item.quantity <= 2)
    
    const categoryCounts = currentItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalItems,
      totalValue,
      expiredCount: expiredItems.length,
      expiringSoonCount: expiringSoonItems.length,
      lowStockCount: lowStockItems.length,
      categoryCounts,
      expiredItems,
      expiringSoonItems,
      lowStockItems
    }
  }, [convexStats, transformedItems])

  const createItem = useCallback(async (householdId: string, data: CreateItemData): Promise<InventoryItem> => {
    try {
      setLoading(true)
      setError(null)

      let itemId: string
      if (createInventoryItem) {
        itemId = await createInventoryItem({
          householdId: householdId as Id<'households'>,
          customName: data.name,
          customBrand: data.brand,
          customCategory: data.category,
          quantity: data.quantity,
          unit: data.unit,
          expirationDate: data.expirationDate ? new Date(data.expirationDate).getTime() : undefined,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).getTime() : undefined,
          cost: data.cost,
          notes: data.notes,
          addedBy: 'current-user'
        })
      } else {
        // Fallback for SSR/build time
        itemId = Math.random().toString(36).substr(2, 9)
      }

      // Create a temporary item structure for immediate UI feedback
      const newItem: InventoryItem = {
        id: itemId,
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        householdId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      return newItem
    } catch (err) {
      const errorMessage = 'Failed to create item'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [createInventoryItem])

  const updateItem = useCallback(async (data: UpdateItemData): Promise<InventoryItem> => {
    try {
      setLoading(true)
      setError(null)

      if (updateInventoryItemMutation) {
        await updateInventoryItemMutation({
          itemId: data.id as Id<'inventoryItems'>,
          userId: 'current-user',
          updates: {
            customName: data.name,
            customBrand: data.brand,
            customCategory: data.category,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate ? new Date(data.expirationDate).getTime() : undefined,
            purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).getTime() : undefined,
            cost: data.cost,
            notes: data.notes
          }
        })
      }

      // Return a temporary updated item structure
      const existingItem = items.find(item => item.id === data.id)
      if (!existingItem) {
        throw new Error('Item not found')
      }

      const updatedItem: InventoryItem = {
        ...existingItem,
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : existingItem.expirationDate,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : existingItem.purchaseDate,
        updatedAt: new Date()
      }
      
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, updateInventoryItemMutation])

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (deleteInventoryItemMutation) {
        await deleteInventoryItemMutation({
          itemId: itemId as Id<'inventoryItems'>,
          userId: 'current-user'
        })
      }
    } catch (err) {
      const errorMessage = 'Failed to delete item'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [deleteInventoryItemMutation])

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    try {
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative')
      }

      const existingItem = items.find(item => item.id === itemId)
      if (!existingItem) {
        throw new Error('Item not found')
      }

      const quantityChange = quantity - existingItem.quantity

      if (updateItemQuantityMutation) {
        await updateItemQuantityMutation({
          itemId: itemId as Id<'inventoryItems'>,
          userId: 'current-user',
          quantityChange,
          consumed: quantityChange < 0
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [items, updateItemQuantityMutation])

  const searchItems = useCallback((query: string): InventoryItem[] => {
    if (!query.trim()) return transformedItems

    const lowerQuery = query.toLowerCase()
    return transformedItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.location?.toLowerCase().includes(lowerQuery)
    )
  }, [transformedItems])

  const filterItems = useCallback((filter: 'all' | 'expiring' | 'expired' | 'low-stock'): InventoryItem[] => {
    switch (filter) {
      case 'expiring':
        return stats.expiringSoonItems
      case 'expired':
        return stats.expiredItems
      case 'low-stock':
        return stats.lowStockItems
      default:
        return transformedItems
    }
  }, [transformedItems, stats])

  const refreshItems = useCallback(async (householdId: string): Promise<void> => {
    // Convex queries are automatically reactive, so we don't need manual refresh
    // This is kept for API compatibility
    return Promise.resolve()
  }, [])

  const getItemsByCategory = useCallback((category: string): InventoryItem[] => {
    return transformedItems.filter(item => item.category === category)
  }, [transformedItems])

  const getItemsExpiringBefore = useCallback((date: Date): InventoryItem[] => {
    return transformedItems.filter(item => 
      item.expirationDate && isBefore(item.expirationDate, date)
    )
  }, [transformedItems])

  const getLowStockItems = useCallback((threshold = 2): InventoryItem[] => {
    return transformedItems.filter(item => item.quantity <= threshold)
  }, [transformedItems])

  const sortItems = useCallback((sortBy: 'name' | 'category' | 'expiration' | 'quantity' | 'cost' | 'createdAt'): InventoryItem[] => {
    return [...transformedItems].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'expiration':
          if (!a.expirationDate && !b.expirationDate) return 0
          if (!a.expirationDate) return 1
          if (!b.expirationDate) return -1
          return a.expirationDate.getTime() - b.expirationDate.getTime()
        case 'quantity':
          return a.quantity - b.quantity
        case 'cost':
          return (a.cost || 0) - (b.cost || 0)
        case 'createdAt':
        default:
          return a.createdAt.getTime() - b.createdAt.getTime()
      }
    })
  }, [transformedItems])

  return {
    items: transformedItems,
    stats,
    loading: loading || isConvexLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    updateQuantity,
    searchItems,
    filterItems,
    refreshItems,
    getItemsByCategory,
    getItemsExpiringBefore,
    getLowStockItems,
    sortItems
  }
}