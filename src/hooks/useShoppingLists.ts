'use client'

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { addDays, isBefore, startOfWeek, endOfWeek } from 'date-fns'
import {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListData,
  UpdateShoppingListData,
  AddItemToListData,
  UpdateItemData,
  SmartSuggestion,
  ShoppingListSummary,
  ListFilter,
  ListSort,
  LIST_STATUS,
  ITEM_PRIORITIES,
  STORE_SECTIONS
} from '@/schemas/shoppingListSchemas'

export interface UseShoppingListsReturn {
  lists: ShoppingList[]
  activeLists: ShoppingList[]
  summary: ShoppingListSummary
  loading: boolean
  error: string | null
  createList: (data: CreateShoppingListData) => Promise<ShoppingList>
  updateList: (data: UpdateShoppingListData) => Promise<ShoppingList>
  deleteList: (listId: string) => Promise<void>
  duplicateList: (listId: string, newName?: string) => Promise<ShoppingList>
  addItemToList: (listId: string, item: AddItemToListData) => Promise<ShoppingListItem>
  updateItem: (listId: string, item: UpdateItemData) => Promise<ShoppingListItem>
  removeItem: (listId: string, itemId: string) => Promise<void>
  toggleItemComplete: (listId: string, itemId: string) => Promise<void>
  reorderItems: (listId: string, itemIds: string[]) => Promise<void>
  getSmartSuggestions: (householdId: string, excludeItems?: string[]) => Promise<SmartSuggestion[]>
  searchLists: (query: string) => ShoppingList[]
  filterLists: (filter: ListFilter) => ShoppingList[]
  sortLists: (sort: ListSort) => ShoppingList[]
  refreshLists: (householdId: string) => Promise<void>
  archiveCompletedLists: (olderThanDays?: number) => Promise<void>
  getListById: (listId: string) => ShoppingList | undefined
  getListStats: (listId: string) => {
    totalItems: number
    completedItems: number
    completionPercentage: number
    estimatedTotal: number
    itemsBySection: Record<string, ShoppingListItem[]>
  }
}

// Mock data for development
const mockLists: ShoppingList[] = [
  {
    id: 'list-1',
    name: 'Weekly Groceries',
    description: 'Regular weekly grocery shopping',
    status: 'active',
    householdId: 'household-1',
    createdBy: 'user-1',
    assignedTo: ['user-1', 'user-2'],
    dueDate: addDays(new Date(), 2),
    estimatedBudget: 150,
    store: 'Whole Foods',
    items: [
      {
        id: 'item-1',
        name: 'Organic Bananas',
        quantity: 6,
        unit: 'pieces',
        section: 'produce',
        priority: 'medium',
        estimatedCost: 3.99,
        brand: 'Fresh Market',
        isCompleted: false,
        addedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-2',
        name: 'Whole Milk',
        quantity: 1,
        unit: 'gallon',
        section: 'dairy',
        priority: 'high',
        estimatedCost: 4.29,
        isCompleted: true,
        completedAt: new Date(),
        addedBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-3',
        name: 'Ground Turkey',
        quantity: 2,
        unit: 'lbs',
        section: 'meat',
        priority: 'high',
        estimatedCost: 8.99,
        isCompleted: false,
        addedBy: 'user-1',
        notes: 'For dinner tonight',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    tags: ['groceries', 'weekly'],
    isTemplate: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 'list-2',
    name: 'Party Supplies',
    description: 'Items for weekend party',
    status: 'draft',
    householdId: 'household-1',
    createdBy: 'user-2',
    assignedTo: ['user-2'],
    dueDate: addDays(new Date(), 5),
    estimatedBudget: 75,
    items: [
      {
        id: 'item-4',
        name: 'Potato Chips',
        quantity: 3,
        unit: 'bags',
        section: 'pantry',
        priority: 'medium',
        estimatedCost: 12.99,
        isCompleted: false,
        addedBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    tags: ['party', 'entertainment'],
    isTemplate: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'list-3',
    name: 'Emergency Essentials',
    description: 'Template for emergency supplies',
    status: 'completed',
    householdId: 'household-1',
    createdBy: 'user-1',
    assignedTo: ['user-1'],
    estimatedBudget: 200,
    actualTotal: 185.50,
    items: [
      {
        id: 'item-5',
        name: 'Bottled Water',
        quantity: 24,
        unit: 'bottles',
        section: 'beverages',
        priority: 'urgent',
        estimatedCost: 15.99,
        isCompleted: true,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        addedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    tags: ['emergency', 'essentials'],
    isTemplate: true,
    templateName: 'Emergency Kit',
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]

// Mock smart suggestions based on inventory status
const generateMockSuggestions = (): SmartSuggestion[] => [
  {
    itemName: 'Organic Bananas',
    category: 'produce',
    reason: 'low_stock',
    priority: 'high',
    estimatedQuantity: 6,
    estimatedUnit: 'pieces',
    inventoryItemId: 'inv-1',
    lastPurchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    averageConsumption: 1.5
  },
  {
    itemName: 'Whole Milk',
    category: 'dairy',
    reason: 'expired',
    priority: 'urgent',
    estimatedQuantity: 1,
    estimatedUnit: 'gallon',
    inventoryItemId: 'inv-2',
    lastPurchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    itemName: 'Bread',
    category: 'bakery',
    reason: 'frequently_bought',
    priority: 'medium',
    estimatedQuantity: 1,
    estimatedUnit: 'loaf',
    lastPurchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    averageConsumption: 0.8
  },
  {
    itemName: 'Eggs',
    category: 'dairy',
    reason: 'frequently_bought',
    priority: 'medium',
    estimatedQuantity: 12,
    estimatedUnit: 'pieces',
    lastPurchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    averageConsumption: 2.1
  }
]

export function useShoppingLists(householdId?: string): UseShoppingListsReturn {
  const [lists, setLists] = useState<ShoppingList[]>(mockLists)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter active lists
  const activeLists = useMemo(() => 
    lists.filter(list => ['draft', 'active', 'shopping'].includes(list.status)),
    [lists]
  )

  // Calculate summary statistics
  const summary = useMemo((): ShoppingListSummary => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const totalLists = lists.length
    const activeLists = lists.filter(list => ['draft', 'active', 'shopping'].includes(list.status)).length
    const completedThisWeek = lists.filter(list => 
      list.status === 'completed' && 
      list.completedAt &&
      list.completedAt >= weekStart && 
      list.completedAt <= weekEnd
    ).length

    const totalBudget = lists
      .filter(list => list.estimatedBudget)
      .reduce((sum, list) => sum + (list.estimatedBudget || 0), 0)

    const totalSpent = lists
      .filter(list => list.actualTotal)
      .reduce((sum, list) => sum + (list.actualTotal || 0), 0)

    const allItems = lists.flatMap(list => list.items)
    const itemsCompleted = allItems.filter(item => item.isCompleted).length
    const itemsPending = allItems.filter(item => !item.isCompleted).length

    const averageListSize = totalLists > 0 ? allItems.length / totalLists : 0

    // Most frequent items
    const itemCounts: Record<string, number> = {}
    allItems.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + 1
    })
    const mostFrequentItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    // Top stores
    const storeCounts: Record<string, number> = {}
    lists.forEach(list => {
      if (list.store) {
        storeCounts[list.store] = (storeCounts[list.store] || 0) + 1
      }
    })
    const topStores = Object.entries(storeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)

    return {
      totalLists,
      activeLists,
      completedThisWeek,
      totalBudget,
      totalSpent,
      itemsCompleted,
      itemsPending,
      averageListSize,
      mostFrequentItems,
      topStores
    }
  }, [lists])

  const createList = useCallback(async (data: CreateShoppingListData): Promise<ShoppingList> => {
    try {
      setLoading(true)
      setError(null)

      const newList: ShoppingList = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setLists(prev => [newList, ...prev])
      
      return newList
    } catch (err) {
      const errorMessage = 'Failed to create shopping list'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateList = useCallback(async (data: UpdateShoppingListData): Promise<ShoppingList> => {
    try {
      setLoading(true)
      setError(null)

      const existingList = lists.find(list => list.id === data.id)
      if (!existingList) {
        throw new Error('Shopping list not found')
      }

      const updatedList: ShoppingList = {
        ...existingList,
        ...data,
        updatedAt: new Date()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      setLists(prev => prev.map(list => 
        list.id === data.id ? updatedList : list
      ))
      
      return updatedList
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shopping list'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [lists])

  const deleteList = useCallback(async (listId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setLists(prev => prev.filter(list => list.id !== listId))
    } catch (err) {
      const errorMessage = 'Failed to delete shopping list'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const duplicateList = useCallback(async (listId: string, newName?: string): Promise<ShoppingList> => {
    try {
      setLoading(true)
      setError(null)

      const originalList = lists.find(list => list.id === listId)
      if (!originalList) {
        throw new Error('Original shopping list not found')
      }

      const duplicatedList: ShoppingList = {
        ...originalList,
        id: Math.random().toString(36).substr(2, 9),
        name: newName || `${originalList.name} (Copy)`,
        status: 'draft',
        items: originalList.items.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          isCompleted: false,
          completedAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        completedAt: undefined,
        actualTotal: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setLists(prev => [duplicatedList, ...prev])
      
      return duplicatedList
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate shopping list'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [lists])

  const addItemToList = useCallback(async (listId: string, itemData: AddItemToListData): Promise<ShoppingListItem> => {
    try {
      setLoading(true)
      setError(null)

      const newItem: ShoppingListItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...itemData,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, items: [...list.items, newItem], updatedAt: new Date() }
          : list
      ))
      
      return newItem
    } catch (err) {
      const errorMessage = 'Failed to add item to shopping list'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (listId: string, itemData: UpdateItemData): Promise<ShoppingListItem> => {
    try {
      setLoading(true)
      setError(null)

      const list = lists.find(list => list.id === listId)
      if (!list) {
        throw new Error('Shopping list not found')
      }

      const existingItem = list.items.find(item => item.id === itemData.id)
      if (!existingItem) {
        throw new Error('Item not found')
      }

      const updatedItem: ShoppingListItem = {
        ...existingItem,
        ...itemData,
        updatedAt: new Date()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400))

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: list.items.map(item => item.id === itemData.id ? updatedItem : item),
              updatedAt: new Date()
            }
          : list
      ))
      
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [lists])

  const removeItem = useCallback(async (listId: string, itemId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: list.items.filter(item => item.id !== itemId),
              updatedAt: new Date()
            }
          : list
      ))
    } catch (err) {
      const errorMessage = 'Failed to remove item'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleItemComplete = useCallback(async (listId: string, itemId: string): Promise<void> => {
    try {
      const list = lists.find(list => list.id === listId)
      if (!list) throw new Error('Shopping list not found')

      const item = list.items.find(item => item.id === itemId)
      if (!item) throw new Error('Item not found')

      const updatedItem: ShoppingListItem = {
        ...item,
        isCompleted: !item.isCompleted,
        completedAt: !item.isCompleted ? new Date() : undefined,
        updatedAt: new Date()
      }

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: list.items.map(item => item.id === itemId ? updatedItem : item),
              updatedAt: new Date()
            }
          : list
      ))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item status'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [lists])

  const reorderItems = useCallback(async (listId: string, itemIds: string[]): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const list = lists.find(list => list.id === listId)
      if (!list) throw new Error('Shopping list not found')

      const reorderedItems = itemIds.map(id => 
        list.items.find(item => item.id === id)!
      ).filter(Boolean)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, items: reorderedItems, updatedAt: new Date() }
          : list
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder items'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [lists])

  const getSmartSuggestions = useCallback(async (householdId: string, excludeItems?: string[]): Promise<SmartSuggestion[]> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay for smart suggestions
      await new Promise(resolve => setTimeout(resolve, 1500))

      const suggestions = generateMockSuggestions()
      
      // Filter out excluded items
      const filteredSuggestions = excludeItems 
        ? suggestions.filter(suggestion => !excludeItems.includes(suggestion.itemName.toLowerCase()))
        : suggestions

      return filteredSuggestions
    } catch (err) {
      const errorMessage = 'Failed to get smart suggestions'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchLists = useCallback((query: string): ShoppingList[] => {
    if (!query.trim()) return lists

    const lowerQuery = query.toLowerCase()
    return lists.filter(list =>
      list.name.toLowerCase().includes(lowerQuery) ||
      list.description?.toLowerCase().includes(lowerQuery) ||
      list.store?.toLowerCase().includes(lowerQuery) ||
      list.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      list.items.some(item => item.name.toLowerCase().includes(lowerQuery))
    )
  }, [lists])

  const filterLists = useCallback((filter: ListFilter): ShoppingList[] => {
    return lists.filter(list => {
      if (filter.status !== 'all' && list.status !== filter.status) return false
      if (filter.assignedToMe && !list.assignedTo.includes('current-user-id')) return false
      if (filter.createdByMe && list.createdBy !== 'current-user-id') return false
      if (filter.hasItems && list.items.length === 0) return false
      if (filter.dueSoon && list.dueDate && !isBefore(list.dueDate, addDays(new Date(), 3))) return false
      
      return true
    })
  }, [lists])

  const sortLists = useCallback((sort: ListSort): ShoppingList[] => {
    return [...lists].sort((a, b) => {
      let comparison = 0
      
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else comparison = a.dueDate.getTime() - b.dueDate.getTime()
          break
        case 'itemCount':
          comparison = a.items.length - b.items.length
          break
        case 'estimatedBudget':
          comparison = (a.estimatedBudget || 0) - (b.estimatedBudget || 0)
          break
        case 'createdAt':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }
      
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [lists])

  const refreshLists = useCallback(async (householdId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call - will be replaced with actual Convex query
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, this would fetch fresh data
    } catch (err) {
      const errorMessage = 'Failed to refresh shopping lists'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const archiveCompletedLists = useCallback(async (olderThanDays = 30): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const cutoffDate = addDays(new Date(), -olderThanDays)
      
      setLists(prev => prev.map(list => 
        list.status === 'completed' && 
        list.completedAt && 
        isBefore(list.completedAt, cutoffDate)
          ? { ...list, status: 'archived', updatedAt: new Date() }
          : list
      ))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
    } catch (err) {
      const errorMessage = 'Failed to archive completed lists'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getListById = useCallback((listId: string): ShoppingList | undefined => {
    return lists.find(list => list.id === listId)
  }, [lists])

  const getListStats = useCallback((listId: string) => {
    const list = lists.find(list => list.id === listId)
    if (!list) {
      return {
        totalItems: 0,
        completedItems: 0,
        completionPercentage: 0,
        estimatedTotal: 0,
        itemsBySection: {}
      }
    }

    const totalItems = list.items.length
    const completedItems = list.items.filter(item => item.isCompleted).length
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const estimatedTotal = list.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    
    // Group items by store section
    const itemsBySection = list.items.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = []
      }
      acc[item.section].push(item)
      return acc
    }, {} as Record<string, ShoppingListItem[]>)

    return {
      totalItems,
      completedItems,
      completionPercentage,
      estimatedTotal,
      itemsBySection
    }
  }, [lists])

  return {
    lists,
    activeLists,
    summary,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    duplicateList,
    addItemToList,
    updateItem,
    removeItem,
    toggleItemComplete,
    reorderItems,
    getSmartSuggestions,
    searchLists,
    filterLists,
    sortLists,
    refreshLists,
    archiveCompletedLists,
    getListById,
    getListStats
  }
}