import { useState, useCallback, useMemo } from 'react';
import { ShoppingList, ShoppingItem, ShoppingListSuggestion } from '@/types/shopping';
import { toast } from 'sonner';

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
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(mockShoppingLists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShoppingList = useCallback(async (data: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'totalEstimatedCost' | 'completedItemsCount'>) => {
    setLoading(true);
    try {
      const newList: ShoppingList = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
        totalEstimatedCost: 0,
        completedItemsCount: 0,
      };
      
      setShoppingLists(prev => [...prev, newList]);
      setError(null);
      toast.success('Shopping list created successfully');
      return newList;
    } catch (err) {
      const errorMessage = 'Failed to create shopping list';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addItemToList = useCallback(async (listId: string, item: Omit<ShoppingItem, 'id' | 'addedAt' | 'completed'>) => {
    setLoading(true);
    try {
      const newItem: ShoppingItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        addedAt: new Date(),
        completed: false,
      };
      
      setShoppingLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: [...list.items, newItem],
            updatedAt: new Date(),
          };
        }
        return list;
      }));
      
      setError(null);
      toast.success('Item added to shopping list');
    } catch (err) {
      const errorMessage = 'Failed to add item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleItemCompletion = useCallback(async (listId: string, itemId: string) => {
    setLoading(true);
    try {
      setShoppingLists(prev => prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                completed: !item.completed,
                completedAt: !item.completed ? new Date() : undefined,
                completedBy: !item.completed ? 'current-user' : undefined,
              };
            }
            return item;
          });
          
          return {
            ...list,
            items: updatedItems,
            completedItemsCount: updatedItems.filter(item => item.completed).length,
            updatedAt: new Date(),
          };
        }
        return list;
      }));
      
      setError(null);
      toast.success('Item updated');
    } catch (err) {
      const errorMessage = 'Failed to update item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    setLoading(true);
    try {
      setShoppingLists(prev => prev.map(list => {
        if (list.id === listId) {
          const filteredItems = list.items.filter(item => item.id !== itemId);
          return {
            ...list,
            items: filteredItems,
            completedItemsCount: filteredItems.filter(item => item.completed).length,
            updatedAt: new Date(),
          };
        }
        return list;
      }));
      
      setError(null);
      toast.success('Item deleted');
    } catch (err) {
      const errorMessage = 'Failed to delete item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    // Return mock suggestions for development
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
  }, []);

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
    const totalLists = shoppingLists.length;
    const activeLists = shoppingLists.filter(list => list.status === 'active').length;
    const totalItems = shoppingLists.reduce((sum, list) => sum + list.items.length, 0);
    const completedItems = shoppingLists.reduce((sum, list) => sum + list.completedItemsCount, 0);
    const totalEstimatedCost = shoppingLists.reduce((sum, list) => sum + list.totalEstimatedCost, 0);
    
    return {
      totalLists,
      activeLists,
      totalItems,
      completedItems,
      completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      totalEstimatedCost,
    };
  }, [shoppingLists]);

  return {
    shoppingLists,
    loading,
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