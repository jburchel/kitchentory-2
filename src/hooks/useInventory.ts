import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { addDays, isBefore, isAfter } from 'date-fns'

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
  const [items, setItems] = useState<InventoryItem[]>(mockItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate inventory statistics from mock data
  const stats = useMemo((): InventoryStats => {
    const now = new Date()
    const threeDaysFromNow = addDays(now, 3)
    
    const currentItems = items
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
  }, [items])

  const createItem = useCallback(async (householdId: string, data: CreateItemData): Promise<InventoryItem> => {
    try {
      setLoading(true)
      setError(null)

      // Create a temporary item structure for immediate UI feedback
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        householdId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setItems(prev => [...prev, newItem])
      toast.success('Item added successfully')
      return newItem
    } catch (err) {
      const errorMessage = 'Failed to create item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (data: UpdateItemData): Promise<InventoryItem> => {
    try {
      setLoading(true)
      setError(null)

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
      
      setItems(prev => prev.map(item => item.id === data.id ? updatedItem : item))
      toast.success('Item updated successfully')
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items])

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      setItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Item deleted successfully')
    } catch (err) {
      const errorMessage = 'Failed to delete item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    try {
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative')
      }

      const existingItem = items.find(item => item.id === itemId)
      if (!existingItem) {
        throw new Error('Item not found')
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity, updatedAt: new Date() } : item
      ))
      toast.success('Quantity updated successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [items])

  const searchItems = useCallback((query: string): InventoryItem[] => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.location?.toLowerCase().includes(lowerQuery)
    )
  }, [items])

  const filterItems = useCallback((filter: 'all' | 'expiring' | 'expired' | 'low-stock'): InventoryItem[] => {
    switch (filter) {
      case 'expiring':
        return stats.expiringSoonItems
      case 'expired':
        return stats.expiredItems
      case 'low-stock':
        return stats.lowStockItems
      default:
        return items
    }
  }, [items, stats])

  const refreshItems = useCallback(async (householdId: string): Promise<void> => {
    // No-op for mock implementation
    return Promise.resolve()
  }, [])

  const getItemsByCategory = useCallback((category: string): InventoryItem[] => {
    return items.filter(item => item.category === category)
  }, [items])

  const getItemsExpiringBefore = useCallback((date: Date): InventoryItem[] => {
    return items.filter(item => 
      item.expirationDate && isBefore(item.expirationDate, date)
    )
  }, [items])

  const getLowStockItems = useCallback((threshold = 2): InventoryItem[] => {
    return items.filter(item => item.quantity <= threshold)
  }, [items])

  const sortItems = useCallback((sortBy: 'name' | 'category' | 'expiration' | 'quantity' | 'cost' | 'createdAt'): InventoryItem[] => {
    return [...items].sort((a, b) => {
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
  }, [items])

  return {
    items,
    stats,
    loading,
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