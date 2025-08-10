'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import type {
  ShoppingListWithDetails,
  ShoppingListItem,
  ShoppingListItemWithDetails,
  ShoppingListMemberWithUser,
  ShoppingListActivity,
  StoreLayout,
  AddItemData,
  UpdateItemData,
  UseShoppingListReturn,
  ShoppingListItemStatus
} from '@/types/shopping'
import type { FoodCategory } from '@/lib/icons/food-categories'
import { DEFAULT_STORE_SECTIONS } from '@/types/shopping'

// Mock data for individual list
const mockListDetails: ShoppingListWithDetails = {
  _id: 'list-1' as any,
  _creationTime: Date.now() - 86400000,
  name: 'Weekly Groceries',
  description: 'Regular weekly shopping for household essentials',
  householdId: 'household-1' as any,
  ownerId: 'user-1' as any,
  status: 'active',
  isTemplate: false,
  itemCount: 12,
  completedItemCount: 3,
  totalEstimatedCost: 89.50,
  totalActualCost: 45.20,
  lastModifiedBy: 'user-1' as any,
  owner: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    imageUrl: undefined
  },
  household: null,
  members: [
    {
      _id: 'member-1' as any,
      _creationTime: Date.now() - 86400000,
      listId: 'list-1' as any,
      userId: 'user-1' as any,
      role: 'owner',
      canEdit: true,
      canAssignItems: true,
      canCompleteItems: true,
      canInviteOthers: true,
      joinedAt: Date.now() - 86400000,
      lastActiveAt: Date.now() - 3600000,
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: undefined,
        isActive: true
      }
    },
    {
      _id: 'member-2' as any,
      _creationTime: Date.now() - 43200000,
      listId: 'list-1' as any,
      userId: 'user-2' as any,
      role: 'editor',
      canEdit: true,
      canAssignItems: false,
      canCompleteItems: true,
      canInviteOthers: false,
      joinedAt: Date.now() - 43200000,
      lastActiveAt: Date.now() - 1800000,
      user: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        imageUrl: undefined,
        isActive: true
      }
    }
  ],
  memberCount: 2,
  progress: {
    percentComplete: 25,
    itemsRemaining: 9,
    estimatedTimeToComplete: 45
  },
  storeLayout: {
    _id: 'layout-1' as any,
    _creationTime: Date.now() - 86400000 * 30,
    name: 'Default Store Layout',
    householdId: 'household-1' as any,
    sections: DEFAULT_STORE_SECTIONS.map((section, index) => ({
      sectionId: section.id,
      displayOrder: index + 1
    })),
    isDefault: true,
    createdBy: 'user-1' as any
  }
}

const mockItems: ShoppingListItemWithDetails[] = [
  {
    _id: 'item-1' as any,
    _creationTime: Date.now() - 86400000,
    listId: 'list-1' as any,
    name: 'Organic Bananas',
    category: 'produce',
    quantity: 6,
    unit: 'pieces',
    status: 'pending',
    priority: 'medium',
    estimatedCost: 3.99,
    notes: 'Get ripe ones',
    assignedTo: 'user-2' as any,
    addedBy: 'user-1' as any,
    lastModifiedBy: 'user-1' as any,
    displayOrder: 1,
    assignedUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      imageUrl: undefined
    },
    storeSection: DEFAULT_STORE_SECTIONS.find(s => s.id === 'produce'),
    addedByUser: {
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: undefined
    }
  },
  {
    _id: 'item-2' as any,
    _creationTime: Date.now() - 86400000,
    listId: 'list-1' as any,
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'gallon',
    status: 'purchased',
    priority: 'high',
    estimatedCost: 4.29,
    actualCost: 4.19,
    purchasedAt: Date.now() - 21600000,
    addedBy: 'user-1' as any,
    lastModifiedBy: 'user-2' as any,
    displayOrder: 2,
    storeSection: DEFAULT_STORE_SECTIONS.find(s => s.id === 'dairy'),
    addedByUser: {
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: undefined
    },
    inventoryItem: {
      currentQuantity: 0,
      lastPurchasePrice: 4.29,
      brand: 'Local Dairy',
      location: 'Fridge'
    }
  },
  {
    _id: 'item-3' as any,
    _creationTime: Date.now() - 86400000,
    listId: 'list-1' as any,
    name: 'Ground Turkey',
    category: 'protein',
    quantity: 2,
    unit: 'lbs',
    status: 'purchased',
    priority: 'high',
    estimatedCost: 8.99,
    actualCost: 9.49,
    purchasedAt: Date.now() - 18000000,
    addedBy: 'user-1' as any,
    lastModifiedBy: 'user-1' as any,
    displayOrder: 3,
    storeSection: DEFAULT_STORE_SECTIONS.find(s => s.id === 'meat-seafood'),
    addedByUser: {
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: undefined
    }
  },
  {
    _id: 'item-4' as any,
    _creationTime: Date.now() - 86400000,
    listId: 'list-1' as any,
    name: 'Bread',
    category: 'grains',
    quantity: 1,
    unit: 'loaf',
    status: 'purchased',
    priority: 'medium',
    estimatedCost: 2.99,
    actualCost: 2.99,
    purchasedAt: Date.now() - 14400000,
    addedBy: 'user-2' as any,
    lastModifiedBy: 'user-2' as any,
    displayOrder: 4,
    storeSection: DEFAULT_STORE_SECTIONS.find(s => s.id === 'bakery'),
    addedByUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      imageUrl: undefined
    }
  },
  {
    _id: 'item-5' as any,
    _creationTime: Date.now() - 43200000,
    listId: 'list-1' as any,
    name: 'Orange Juice',
    category: 'beverages',
    quantity: 1,
    unit: 'bottle',
    status: 'unavailable',
    priority: 'low',
    estimatedCost: 4.49,
    notes: 'Out of stock, try different brand',
    substitutionNotes: 'Got apple juice instead',
    addedBy: 'user-2' as any,
    lastModifiedBy: 'user-2' as any,
    displayOrder: 5,
    storeSection: DEFAULT_STORE_SECTIONS.find(s => s.id === 'snacks'),
    addedByUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      imageUrl: undefined
    }
  }
]

export function useShoppingList(listId: string): UseShoppingListReturn {
  const [list, setList] = useState<ShoppingListWithDetails | null>(
    listId === 'list-1' ? mockListDetails : null
  )
  const [items, setItems] = useState<ShoppingListItemWithDetails[]>(
    listId === 'list-1' ? mockItems : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get members and store layout from list
  const members = useMemo(() => list?.members || [], [list])
  const storeLayout = useMemo(() => list?.storeLayout || null, [list])

  // Add item to list
  const addItem = useCallback(async (data: AddItemData): Promise<ShoppingListItem> => {
    try {
      setLoading(true)
      setError(null)

      const newItem: ShoppingListItemWithDetails = {
        _id: `item-${Date.now()}` as any,
        _creationTime: Date.now(),
        listId: listId as any,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        status: 'pending',
        priority: data.priority || 'medium',
        estimatedCost: data.estimatedCost,
        notes: data.notes,
        assignedTo: data.assignTo as any,
        addedBy: 'current-user' as any,
        lastModifiedBy: 'current-user' as any,
        displayOrder: items.length + 1,
        brand: data.brand,
        size: data.size,
        inventoryItemId: data.inventoryItemId as any,
        storeSection: DEFAULT_STORE_SECTIONS.find(s => {
          // Auto-assign section based on category
          if (data.category === 'produce') return s.id === 'produce'
          if (data.category === 'dairy') return s.id === 'dairy'
          if (data.category === 'protein') return s.id === 'meat-seafood'
          if (data.category === 'grains') return s.id === 'bakery'
          if (data.category === 'beverages') return s.id === 'snacks'
          if (data.category === 'frozen') return s.id === 'frozen'
          if (data.category === 'pantry') return s.id === 'pantry'
          if (data.category === 'household') return s.id === 'household'
          return s.id === 'other'
        }),
        addedByUser: {
          firstName: 'Current',
          lastName: 'User',
          imageUrl: undefined
        }
      }

      if (data.assignTo) {
        const assignedUser = members.find(m => m.userId === data.assignTo)
        if (assignedUser?.user) {
          newItem.assignedUser = {
            firstName: assignedUser.user.firstName,
            lastName: assignedUser.user.lastName,
            imageUrl: assignedUser.user.imageUrl
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      setItems(prev => [newItem, ...prev])
      
      // Update list item count
      if (list) {
        setList(prev => prev ? {
          ...prev,
          itemCount: prev.itemCount + 1,
          progress: {
            ...prev.progress,
            itemsRemaining: prev.progress.itemsRemaining + 1,
            percentComplete: Math.round((prev.completedItemCount / (prev.itemCount + 1)) * 100)
          }
        } : prev)
      }

      toast.success(`Added "${data.name}" to shopping list`)
      return newItem
    } catch (err) {
      const errorMessage = 'Failed to add item to list'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [listId, items.length, members, list])

  // Update existing item
  const updateItem = useCallback(async (itemId: string, data: UpdateItemData): Promise<ShoppingListItem> => {
    try {
      setLoading(true)
      setError(null)

      const existingItem = items.find(item => item._id === itemId)
      if (!existingItem) {
        throw new Error('Item not found')
      }

      const updatedItem: ShoppingListItemWithDetails = {
        ...existingItem,
        ...data,
        lastModifiedBy: 'current-user' as any,
        assignedTo: data.assignedTo as any
      }

      // Update assigned user if changed
      if (data.assignedTo) {
        const assignedUser = members.find(m => m.userId === data.assignedTo)
        if (assignedUser?.user) {
          updatedItem.assignedUser = {
            firstName: assignedUser.user.firstName,
            lastName: assignedUser.user.lastName,
            imageUrl: assignedUser.user.imageUrl
          }
        }
      } else if (data.assignedTo === null) {
        updatedItem.assignedUser = null
      }

      await new Promise(resolve => setTimeout(resolve, 400))

      setItems(prev => prev.map(item => 
        item._id === itemId ? updatedItem : item
      ))

      toast.success('Item updated')
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, members])

  // Remove item from list
  const removeItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const item = items.find(i => i._id === itemId)
      if (!item) {
        throw new Error('Item not found')
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      setItems(prev => prev.filter(item => item._id !== itemId))

      // Update list counts
      if (list) {
        const wasCompleted = item.status === 'purchased'
        setList(prev => prev ? {
          ...prev,
          itemCount: Math.max(0, prev.itemCount - 1),
          completedItemCount: wasCompleted ? Math.max(0, prev.completedItemCount - 1) : prev.completedItemCount,
          progress: {
            ...prev.progress,
            itemsRemaining: Math.max(0, wasCompleted ? prev.progress.itemsRemaining : prev.progress.itemsRemaining - 1),
            percentComplete: prev.itemCount > 1 ? Math.round((prev.completedItemCount / (prev.itemCount - 1)) * 100) : 0
          }
        } : prev)
      }

      toast.success(`Removed "${item.name}" from list`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, list])

  // Mark item as completed/purchased
  const completeItem = useCallback(async (itemId: string, actualCost?: number, notes?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const item = items.find(i => i._id === itemId)
      if (!item) {
        throw new Error('Item not found')
      }

      const updatedItem: ShoppingListItemWithDetails = {
        ...item,
        status: 'purchased',
        actualCost: actualCost || item.estimatedCost,
        purchasedAt: Date.now(),
        notes: notes ? `${item.notes || ''}\n${notes}`.trim() : item.notes,
        lastModifiedBy: 'current-user' as any
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      setItems(prev => prev.map(i => i._id === itemId ? updatedItem : i))

      // Update list progress
      if (list) {
        setList(prev => prev ? {
          ...prev,
          completedItemCount: prev.completedItemCount + 1,
          totalActualCost: (prev.totalActualCost || 0) + (actualCost || item.estimatedCost || 0),
          progress: {
            ...prev.progress,
            itemsRemaining: Math.max(0, prev.progress.itemsRemaining - 1),
            percentComplete: Math.round(((prev.completedItemCount + 1) / prev.itemCount) * 100)
          }
        } : prev)
      }

      toast.success(`Marked "${item.name}" as purchased`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, list])

  // Mark item as not completed
  const uncompleteItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const item = items.find(i => i._id === itemId)
      if (!item || item.status !== 'purchased') {
        throw new Error('Item not found or not completed')
      }

      const updatedItem: ShoppingListItemWithDetails = {
        ...item,
        status: 'pending',
        actualCost: undefined,
        purchasedAt: undefined,
        lastModifiedBy: 'current-user' as any
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      setItems(prev => prev.map(i => i._id === itemId ? updatedItem : i))

      // Update list progress
      if (list) {
        setList(prev => prev ? {
          ...prev,
          completedItemCount: Math.max(0, prev.completedItemCount - 1),
          totalActualCost: Math.max(0, (prev.totalActualCost || 0) - (item.actualCost || 0)),
          progress: {
            ...prev.progress,
            itemsRemaining: prev.progress.itemsRemaining + 1,
            percentComplete: prev.itemCount > 0 ? Math.round(((prev.completedItemCount - 1) / prev.itemCount) * 100) : 0
          }
        } : prev)
      }

      toast.success(`Marked "${item.name}" as not purchased`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to uncomplete item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, list])

  // Assign item to user
  const assignItem = useCallback(async (itemId: string, userId: string): Promise<void> => {
    try {
      await updateItem(itemId, { assignedTo: userId })
      
      const assignedUser = members.find(m => m.userId === userId)
      if (assignedUser?.user) {
        toast.success(`Assigned item to ${assignedUser.user.firstName}`)
      }
    } catch (err) {
      const errorMessage = 'Failed to assign item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [updateItem, members])

  // Unassign item
  const unassignItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      await updateItem(itemId, { assignedTo: undefined })
      toast.success('Item unassigned')
    } catch (err) {
      const errorMessage = 'Failed to unassign item'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [updateItem])

  // Add multiple items at once
  const addMultipleItems = useCallback(async (itemsData: AddItemData[]): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      for (const itemData of itemsData) {
        await addItem(itemData)
      }

      toast.success(`Added ${itemsData.length} items to list`)
    } catch (err) {
      const errorMessage = 'Failed to add multiple items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [addItem])

  // Complete multiple items
  const completeMultipleItems = useCallback(async (itemIds: string[], actualCosts?: Record<string, number>): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      for (const itemId of itemIds) {
        await completeItem(itemId, actualCosts?.[itemId])
      }

      toast.success(`Marked ${itemIds.length} items as purchased`)
    } catch (err) {
      const errorMessage = 'Failed to complete multiple items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [completeItem])

  // Remove multiple items
  const removeMultipleItems = useCallback(async (itemIds: string[]): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      for (const itemId of itemIds) {
        await removeItem(itemId)
      }

      toast.success(`Removed ${itemIds.length} items from list`)
    } catch (err) {
      const errorMessage = 'Failed to remove multiple items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [removeItem])

  // Clear all completed items
  const clearCompletedItems = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const completedItems = items.filter(item => item.status === 'purchased')
      const completedIds = completedItems.map(item => item._id)

      await removeMultipleItems(completedIds)
      toast.success('Cleared all completed items')
    } catch (err) {
      const errorMessage = 'Failed to clear completed items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items, removeMultipleItems])

  // Assign multiple items to user
  const assignMultipleItems = useCallback(async (itemIds: string[], userId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      for (const itemId of itemIds) {
        await assignItem(itemId, userId)
      }

      const assignedUser = members.find(m => m.userId === userId)
      if (assignedUser?.user) {
        toast.success(`Assigned ${itemIds.length} items to ${assignedUser.user.firstName}`)
      }
    } catch (err) {
      const errorMessage = 'Failed to assign multiple items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [assignItem, members])

  // Reorder items
  const reorderItems = useCallback(async (itemIds: string[]): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Update display order based on new arrangement
      const updatedItems = items.map(item => {
        const newIndex = itemIds.indexOf(item._id)
        return newIndex >= 0 ? { ...item, displayOrder: newIndex + 1 } : item
      })

      // Sort by new display order
      updatedItems.sort((a, b) => a.displayOrder - b.displayOrder)

      await new Promise(resolve => setTimeout(resolve, 300))

      setItems(updatedItems)
      toast.success('Items reordered')
    } catch (err) {
      const errorMessage = 'Failed to reorder items'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [items])

  // Group items by store section
  const groupByStoreSection = useCallback((): Record<string, ShoppingListItemWithDetails[]> => {
    const grouped: Record<string, ShoppingListItemWithDetails[]> = {}

    items.forEach(item => {
      const sectionId = item.storeSection?.id || 'other'
      const sectionName = item.storeSection?.name || 'Other'
      
      if (!grouped[sectionName]) {
        grouped[sectionName] = []
      }
      grouped[sectionName].push(item)
    })

    // Sort sections by display order and items by display order within sections
    Object.keys(grouped).forEach(sectionName => {
      grouped[sectionName].sort((a, b) => a.displayOrder - b.displayOrder)
    })

    return grouped
  }, [items])

  // Group items by category
  const groupByCategory = useCallback((): Record<FoodCategory, ShoppingListItemWithDetails[]> => {
    const grouped = {} as Record<FoodCategory, ShoppingListItemWithDetails[]>

    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })

    // Sort items within each category
    Object.keys(grouped).forEach(category => {
      grouped[category as FoodCategory].sort((a, b) => a.displayOrder - b.displayOrder)
    })

    return grouped
  }, [items])

  // Group items by assignee
  const groupByAssignee = useCallback((): Record<string, ShoppingListItemWithDetails[]> => {
    const grouped: Record<string, ShoppingListItemWithDetails[]> = {
      'Unassigned': []
    }

    items.forEach(item => {
      if (item.assignedUser) {
        const assigneeName = `${item.assignedUser.firstName} ${item.assignedUser.lastName}`.trim()
        if (!grouped[assigneeName]) {
          grouped[assigneeName] = []
        }
        grouped[assigneeName].push(item)
      } else {
        grouped['Unassigned'].push(item)
      }
    })

    return grouped
  }, [items])

  // Group items by status
  const groupByStatus = useCallback((): Record<ShoppingListItemStatus, ShoppingListItemWithDetails[]> => {
    const grouped = {
      pending: [],
      purchased: [],
      unavailable: [],
      substituted: []
    } as Record<ShoppingListItemStatus, ShoppingListItemWithDetails[]>

    items.forEach(item => {
      grouped[item.status].push(item)
    })

    return grouped
  }, [items])

  // Search items
  const searchItems = useCallback((query: string): ShoppingListItemWithDetails[] => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand?.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    )
  }, [items])

  // Filter items by status
  const filterItems = useCallback((filter: ShoppingListItemStatus | 'all'): ShoppingListItemWithDetails[] => {
    if (filter === 'all') return items
    return items.filter(item => item.status === filter)
  }, [items])

  // Get active members (recently active)
  const getActiveMembers = useCallback((): ShoppingListMemberWithUser[] => {
    const oneHourAgo = Date.now() - 3600000
    return members.filter(member => 
      member.lastActiveAt && member.lastActiveAt > oneHourAgo
    )
  }, [members])

  // Track member activity
  const trackMemberActivity = useCallback(async (action: string, details?: string): Promise<void> => {
    // Mock activity tracking
    console.log('Activity tracked:', { action, details, timestamp: Date.now() })
  }, [])

  // Get member activity
  const getMemberActivity = useCallback((userId?: string): ShoppingListActivity[] => {
    // Mock activity data
    return []
  }, [])

  // Calculate total cost
  const calculateTotalCost = useCallback((type: 'estimated' | 'actual'): number => {
    return items.reduce((total, item) => {
      const cost = type === 'estimated' ? item.estimatedCost : item.actualCost
      return total + (cost || 0)
    }, 0)
  }, [items])

  // Get cost accuracy
  const getCostAccuracy = useCallback((): number => {
    const totalEstimated = calculateTotalCost('estimated')
    const totalActual = calculateTotalCost('actual')
    
    if (totalEstimated === 0) return 0
    return Math.min((totalActual / totalEstimated) * 100, 200) // Cap at 200% for outliers
  }, [calculateTotalCost])

  // Get category breakdown
  const getCategoryBreakdown = useCallback((): Record<FoodCategory, { estimated: number; actual: number; items: number }> => {
    const breakdown = {} as Record<FoodCategory, { estimated: number; actual: number; items: number }>

    items.forEach(item => {
      if (!breakdown[item.category]) {
        breakdown[item.category] = { estimated: 0, actual: 0, items: 0 }
      }
      
      breakdown[item.category].estimated += item.estimatedCost || 0
      breakdown[item.category].actual += item.actualCost || 0
      breakdown[item.category].items += 1
    })

    return breakdown
  }, [items])

  // Load list data when listId changes
  useEffect(() => {
    if (listId && listId !== 'list-1') {
      // In real implementation, would load list data from API
      setList(null)
      setItems([])
    }
  }, [listId])

  return {
    list,
    items,
    members,
    storeLayout,
    loading,
    error,
    
    // Item Management
    addItem,
    updateItem,
    removeItem,
    completeItem,
    uncompleteItem,
    assignItem,
    unassignItem,
    
    // Bulk Operations
    addMultipleItems,
    completeMultipleItems,
    removeMultipleItems,
    clearCompletedItems,
    assignMultipleItems,
    
    // Organization
    reorderItems,
    groupByStoreSection,
    groupByCategory,
    groupByAssignee,
    groupByStatus,
    
    // Search & Filter
    searchItems,
    filterItems,
    
    // Real-time Collaboration
    getActiveMembers,
    trackMemberActivity,
    getMemberActivity,
    
    // Cost Tracking
    calculateTotalCost,
    getCostAccuracy,
    getCategoryBreakdown
  }
}