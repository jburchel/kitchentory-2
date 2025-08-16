import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { addDays, isBefore, isAfter } from 'date-fns'
import { useShopping } from '@/hooks/useShopping'

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
  consumeIngredients: (ingredients: { itemId: string; quantity: number }[]) => Promise<void>
  reserveIngredients: (ingredients: { itemId: string; quantity: number }[]) => Promise<void>
  searchItems: (query: string) => InventoryItem[]
  filterItems: (filter: 'all' | 'expiring' | 'expired' | 'low-stock') => InventoryItem[]
  refreshItems: (householdId: string) => Promise<void>
  getItemsByCategory: (category: string) => InventoryItem[]
  getItemsExpiringBefore: (date: Date) => InventoryItem[]
  getLowStockItems: (threshold?: number) => InventoryItem[]
  sortItems: (sortBy: 'name' | 'category' | 'expiration' | 'quantity' | 'cost' | 'createdAt') => InventoryItem[]
  autoAddToShoppingList: boolean
  setAutoAddToShoppingList: (enabled: boolean) => void
}

// Mock data for development - Full kitchen inventory after grocery shopping
const mockItems: InventoryItem[] = [
  // Proteins - TheMealDB compatible
  {
    id: '1',
    name: 'Chicken Breast',
    category: 'meat',
    quantity: 3,
    unit: 'lbs',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 12.99,
    brand: 'Farm Fresh',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Ground Beef',
    category: 'meat',
    quantity: 2,
    unit: 'lbs',
    expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 9.99,
    brand: 'Premium Beef',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Salmon Fillets',
    category: 'meat',
    quantity: 4,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 18.99,
    brand: 'Ocean Fresh',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Pork Chops',
    category: 'meat',
    quantity: 6,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 14.99,
    brand: 'Local Farm',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  
  // Vegetables - TheMealDB compatible
  {
    id: '5',
    name: 'Onions',
    category: 'produce',
    quantity: 5,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 2.99,
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    name: 'Tomatoes',
    category: 'produce',
    quantity: 8,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 4.99,
    location: 'Counter',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    name: 'Potatoes',
    category: 'produce',
    quantity: 10,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 3.99,
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    name: 'Carrots',
    category: 'produce',
    quantity: 12,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 2.49,
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '9',
    name: 'Bell Peppers',
    category: 'produce',
    quantity: 6,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 5.99,
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '10',
    name: 'Mushrooms',
    category: 'produce',
    quantity: 2,
    unit: 'lbs',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 4.99,
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '11',
    name: 'Garlic',
    category: 'produce',
    quantity: 3,
    unit: 'bulbs',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 1.99,
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '12',
    name: 'Spinach',
    category: 'produce',
    quantity: 2,
    unit: 'bags',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 3.99,
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '13',
    name: 'Lettuce',
    category: 'produce',
    quantity: 2,
    unit: 'heads',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 2.99,
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },

  // Dairy & Eggs
  {
    id: '14',
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'gallon',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 4.29,
    brand: 'Local Dairy',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '15',
    name: 'Eggs',
    category: 'dairy',
    quantity: 18,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 3.99,
    brand: 'Farm Fresh',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '16',
    name: 'Cheddar Cheese',
    category: 'dairy',
    quantity: 1,
    unit: 'block',
    expirationDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 5.99,
    brand: 'Sharp & Creamy',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '17',
    name: 'Butter',
    category: 'dairy',
    quantity: 2,
    unit: 'sticks',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 4.49,
    brand: 'Creamy Gold',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },

  // Pantry Staples
  {
    id: '18',
    name: 'Rice',
    category: 'grains',
    quantity: 5,
    unit: 'lbs',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 6.99,
    brand: 'Premium Rice',
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '19',
    name: 'Pasta',
    category: 'grains',
    quantity: 4,
    unit: 'boxes',
    expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 8.99,
    brand: 'Italian Style',
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '20',
    name: 'Bread',
    category: 'grains',
    quantity: 2,
    unit: 'loaves',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 4.99,
    brand: 'Artisan Bakery',
    location: 'Counter',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]

export function useInventory(householdId?: string): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>(mockItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoAddToShoppingList, setAutoAddToShoppingList] = useState(true)
  
  const { shoppingLists, addItemToList } = useShopping(householdId)

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

      const oldQuantity = existingItem.quantity
      
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity, updatedAt: new Date() } : item
      ))
      
      // Check if item was depleted and auto-add to shopping list
      if (oldQuantity > 0 && quantity === 0) {
        await addToShoppingListIfNeeded(existingItem, quantity)
      }
      
      toast.success('Quantity updated successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [items, addToShoppingListIfNeeded])

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

  // Helper function to add item to shopping list when depleted
  const addToShoppingListIfNeeded = useCallback(async (item: InventoryItem, newQuantity: number) => {
    if (newQuantity === 0 && autoAddToShoppingList) {
      try {
        // Find the default shopping list (first active list) or use the first list
        const targetList = shoppingLists.find(list => list.status === 'active') || shoppingLists[0]
        
        if (targetList) {
          // Check if item already exists in shopping list
          const existingItem = targetList.items.find(shoppingItem => 
            shoppingItem.name.toLowerCase() === item.name.toLowerCase()
          )
          
          if (!existingItem) {
            await addItemToList(targetList.id, {
              name: item.name,
              quantity: item.quantity || 1, // Use original quantity as suggestion
              unit: item.unit,
              category: item.category,
              priority: 'medium',
              addedBy: 'system-auto',
              estimatedPrice: item.cost,
              notes: `Auto-added when ${item.name} was depleted from inventory`
            })
            
            toast.success(`✓ ${item.name} added to shopping list`, {
              description: `Added to "${targetList.name}" shopping list`
            })
          } else {
            toast.info(`${item.name} already on shopping list`, {
              description: `Found in "${targetList.name}" shopping list`
            })
          }
        } else {
          toast.warning(`${item.name} depleted but no shopping list found`, {
            description: 'Create a shopping list to enable auto-add'
          })
        }
      } catch (error) {
        console.error('Failed to add to shopping list:', error)
        toast.error(`Failed to add ${item.name} to shopping list`)
      }
    }
  }, [autoAddToShoppingList, shoppingLists, addItemToList])

  // Consume ingredients from inventory (automatic depletion)
  const consumeIngredients = useCallback(async (ingredients: { itemId: string; quantity: number }[]): Promise<void> => {
    try {
      setLoading(true)
      
      for (const ingredient of ingredients) {
        const item = items.find(i => i.id === ingredient.itemId)
        if (item) {
          const newQuantity = Math.max(0, item.quantity - ingredient.quantity)
          
          setItems(prev => prev.map(i => 
            i.id === ingredient.itemId 
              ? { ...i, quantity: newQuantity, updatedAt: new Date() }
              : i
          ))
          
          if (newQuantity === 0) {
            toast.success(`${item.name} has been consumed and removed from inventory`)
            // Auto-add to shopping list if enabled
            await addToShoppingListIfNeeded(item, newQuantity)
          } else {
            toast.success(`Consumed ${ingredient.quantity} ${item.unit} of ${item.name}`)
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to consume ingredients'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, addToShoppingListIfNeeded])

  // Reserve ingredients for meal planning (marks as reserved, doesn't deplete yet)
  const reserveIngredients = useCallback(async (ingredients: { itemId: string; quantity: number }[]): Promise<void> => {
    try {
      setLoading(true)
      
      // Check if we have enough inventory
      for (const ingredient of ingredients) {
        const item = items.find(i => i.id === ingredient.itemId)
        if (!item) {
          throw new Error(`Ingredient ${ingredient.itemId} not found in inventory`)
        }
        if (item.quantity < ingredient.quantity) {
          throw new Error(`Not enough ${item.name} - have ${item.quantity} ${item.unit}, need ${ingredient.quantity} ${item.unit}`)
        }
      }
      
      // If we get here, we have enough of everything
      toast.success(`Reserved ${ingredients.length} ingredients for meal planning`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reserve ingredients'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
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
    consumeIngredients,
    reserveIngredients,
    searchItems,
    filterItems,
    refreshItems,
    getItemsByCategory,
    getItemsExpiringBefore,
    getLowStockItems,
    sortItems,
    autoAddToShoppingList,
    setAutoAddToShoppingList
  }
}