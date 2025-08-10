import { useState, useCallback, useMemo } from 'react';
import { ShoppingList, ShoppingItem, ShoppingListSuggestion } from '@/types/shopping';
import { FOOD_CATEGORIES } from '@/components/inventory/AddItemForm';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Mock data for development
const mockShoppingLists: ShoppingList[] = [
  {
    id: '1',
    name: 'Weekly Groceries',
    description: 'Regular weekly shopping list',
    householdId: 'household1',
    createdBy: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08'),
    isTemplate: false,
    isShared: true,
    sharedWith: ['user2', 'user3'],
    status: 'active',
    totalEstimatedCost: 125.50,
    completedItemsCount: 3,
    items: [
      {
        id: '1',
        name: 'Milk',
        quantity: 2,
        unit: 'gallons',
        category: 'dairy',
        priority: 'high',
        completed: true,
        estimatedPrice: 6.99,
        addedBy: 'user1',
        addedAt: new Date('2024-01-01'),
        completedBy: 'user2',
        completedAt: new Date('2024-01-08'),
      },
      {
        id: '2',
        name: 'Bananas',
        quantity: 1,
        unit: 'bunch',
        category: 'produce',
        priority: 'medium',
        completed: false,
        estimatedPrice: 3.49,
        addedBy: 'user1',
        addedAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        name: 'Bread',
        quantity: 1,
        unit: 'loaf',
        category: 'grains',
        priority: 'high',
        completed: false,
        estimatedPrice: 4.99,
        addedBy: 'user2',
        addedAt: new Date('2024-01-02'),
      },
    ],
    storeLayout: [
      { id: '1', name: 'Produce', order: 1, categories: ['produce'] },
      { id: '2', name: 'Dairy', order: 2, categories: ['dairy'] },
      { id: '3', name: 'Bakery', order: 3, categories: ['grains'] },
    ],
  },
];

export function useShopping(householdId?: string) {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convex mutations and queries - handle SSR gracefully
  const createShoppingListMutation = typeof window !== 'undefined' ? useMutation(api.shoppingLists.createShoppingList) : null
  const getShoppingListsQuery = useQuery(
    householdId && typeof window !== 'undefined' ? api.shoppingLists.getShoppingLists : undefined,
    householdId && typeof window !== 'undefined' ? { householdId: householdId as Id<'households'>, userId: 'current-user' } : 'skip'
  )
  const addItemToListMutation = typeof window !== 'undefined' ? useMutation(api.shoppingLists.addItemToList) : null
  const updateShoppingItemMutation = typeof window !== 'undefined' ? useMutation(api.shoppingLists.updateShoppingItem) : null
  const deleteShoppingItemMutation = typeof window !== 'undefined' ? useMutation(api.shoppingLists.deleteShoppingItem) : null
  const generateSmartSuggestionsMutation = useQuery(
    householdId && typeof window !== 'undefined' ? api.shoppingLists.generateSmartSuggestions : undefined,
    householdId && typeof window !== 'undefined' ? { householdId: householdId as Id<'households'>, userId: 'current-user' } : 'skip'
  )

  // Transform Convex data to match our interface
  const transformedLists = useMemo(() => {
    if (getShoppingListsQuery && Array.isArray(getShoppingListsQuery)) {
      return getShoppingListsQuery.map((list: any): ShoppingList => ({
        id: list._id,
        name: list.name,
        description: list.description,
        householdId: list.householdId,
        createdBy: list.ownerId,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        isTemplate: list.isTemplate,
        isShared: list.members && list.members.length > 1,
        sharedWith: list.members?.map((m: any) => m.userId) || [],
        status: list.status,
        totalEstimatedCost: list.totalEstimatedCost || 0,
        completedItemsCount: list.completedItems || 0,
        items: list.items?.map((item: any): ShoppingItem => ({
          id: item._id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          priority: item.priority,
          completed: item.status === 'purchased',
          estimatedPrice: item.estimatedCost,
          addedBy: item.addedBy,
          addedAt: new Date(item.createdAt),
          completedBy: item.status === 'purchased' ? 'unknown' : undefined,
          completedAt: item.purchasedAt ? new Date(item.purchasedAt) : undefined
        })) || [],
        storeLayout: [] // Will be implemented later with store layouts
      }))
    }
    // Always show mock data when no householdId or no real data
    return householdId ? [] : mockShoppingLists;
  }, [getShoppingListsQuery, householdId]);

  const createShoppingList = useCallback(async (data: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'totalEstimatedCost' | 'completedItemsCount'>) => {
    setLoading(true);
    try {
      if (createShoppingListMutation) {
        const listId = await createShoppingListMutation({
          name: data.name,
          description: data.description,
          householdId: data.householdId as Id<'households'>,
          createdBy: data.createdBy,
          shareWithMembers: data.sharedWith
        })

        const newList: ShoppingList = {
          ...data,
          id: listId,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
          totalEstimatedCost: 0,
          completedItemsCount: 0,
        };
        setError(null);
        return newList;
      } else {
        // Fallback for SSR/build time
        const newList: ShoppingList = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
          totalEstimatedCost: 0,
          completedItemsCount: 0,
        };
        return newList;
      }
    } catch (err) {
      setError('Failed to create shopping list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createShoppingListMutation]);

  const addItemToList = useCallback(async (listId: string, item: Omit<ShoppingItem, 'id' | 'addedAt' | 'completed'>) => {
    setLoading(true);
    try {
      if (addItemToListMutation) {
        const itemId = await addItemToListMutation({
          listId: listId as Id<'shoppingLists'>,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          priority: item.priority,
          estimatedCost: item.estimatedPrice,
          brand: item.brand,
          addedBy: item.addedBy
        })
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to add item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addItemToListMutation]);

  const toggleItemCompletion = useCallback(async (listId: string, itemId: string) => {
    setLoading(true);
    try {
      if (updateShoppingItemMutation) {
        // Find current item to determine new status
        const list = transformedLists.find(l => l.id === listId)
        const item = list?.items.find(i => i.id === itemId)
        const newStatus = item?.completed ? 'pending' : 'purchased'

        await updateShoppingItemMutation({
          itemId: itemId as Id<'shoppingListItems'>,
          userId: 'current-user',
          updates: {
            status: newStatus as any
          }
        })
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to update item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateShoppingItemMutation, transformedLists]);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    setLoading(true);
    try {
      if (deleteShoppingItemMutation) {
        await deleteShoppingItemMutation({
          itemId: itemId as Id<'shoppingListItems'>,
          userId: 'current-user'
        })
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteShoppingItemMutation]);

  const deleteShoppingList = useCallback(async (listId: string) => {
    setLoading(true);
    try {
      setShoppingLists(prev => prev.filter(list => list.id !== listId));
      setError(null);
    } catch (err) {
      setError('Failed to delete shopping list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSmartSuggestions = useCallback((listId: string): ShoppingListSuggestion[] => {
    // Use Convex smart suggestions when available
    if (generateSmartSuggestionsMutation) {
      return generateSmartSuggestionsMutation.map((suggestion: any): ShoppingListSuggestion => ({
        itemName: suggestion.itemName,
        category: suggestion.category,
        reason: suggestion.reason,
        confidence: suggestion.confidence,
        lastPurchased: suggestion.lastPurchaseDate ? new Date(suggestion.lastPurchaseDate) : undefined,
        averageConsumption: suggestion.averageDaysBetweenPurchases
      }))
    }

    // Fallback to mock data
    return [
      {
        itemName: 'Eggs',
        category: 'dairy',
        reason: 'low_stock',
        confidence: 0.9,
        lastPurchased: new Date('2024-01-01'),
        averageConsumption: 1.5,
      },
      {
        itemName: 'Apples',
        category: 'produce',
        reason: 'frequently_used',
        confidence: 0.8,
        lastPurchased: new Date('2024-01-05'),
        averageConsumption: 2.0,
      },
      {
        itemName: 'Orange Juice',
        category: 'dairy',
        reason: 'expired_soon',
        confidence: 0.7,
        lastPurchased: new Date('2023-12-28'),
      },
    ];
  }, [generateSmartSuggestionsMutation]);

  const shareShoppingList = useCallback(async (listId: string, emails: string[], permissions: 'view' | 'edit') => {
    setLoading(true);
    try {
      setShoppingLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            isShared: true,
            sharedWith: [...new Set([...list.sharedWith, ...emails])],
            updatedAt: new Date(),
          };
        }
        return list;
      }));
      setError(null);
    } catch (err) {
      setError('Failed to share shopping list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const currentLists = transformedLists
    const totalLists = currentLists.length;
    const activeLists = currentLists.filter(list => list.status === 'active').length;
    const totalItems = currentLists.reduce((sum, list) => sum + list.items.length, 0);
    const completedItems = currentLists.reduce((sum, list) => sum + list.completedItemsCount, 0);
    const totalEstimatedCost = currentLists.reduce((sum, list) => sum + list.totalEstimatedCost, 0);
    
    return {
      totalLists,
      activeLists,
      totalItems,
      completedItems,
      completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      totalEstimatedCost,
    };
  }, [transformedLists]);

  return {
    shoppingLists: transformedLists,
    loading: loading || (householdId && getShoppingListsQuery === undefined),
    error,
    stats,
    createShoppingList,
    addItemToList,
    toggleItemCompletion,
    deleteItem,
    deleteShoppingList,
    getSmartSuggestions,
    shareShoppingList,
  };
}