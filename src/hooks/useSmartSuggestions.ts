import { useState, useEffect, useCallback } from 'react'
import { InventoryItem } from '@/components/inventory/InventoryGrid'
import { ShoppingList } from '@/types/shopping'
import SmartSuggestionsService, { SmartSuggestion } from '@/services/SmartSuggestionsService'
import { useInventory } from './useInventory'
import { useShoppingLists } from './useShoppingLists'

export interface UseSmartSuggestionsReturn {
  suggestions: SmartSuggestion[]
  loading: boolean
  error: string | null
  refreshSuggestions: () => Promise<void>
}

export function useSmartSuggestions(
  householdId?: string,
  excludeItems: string[] = []
): UseSmartSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const { items: inventoryItems, loading: inventoryLoading } = useInventory(householdId)
  const { shoppingLists, loading: shoppingLoading } = useShoppingLists(householdId)
  
  const suggestionsService = SmartSuggestionsService.getInstance()

  const fetchSuggestions = useCallback(async () => {
    if (!householdId || inventoryLoading || shoppingLoading) return
    
    try {
      setLoading(true)
      setError(null)
      
      const smartSuggestions = suggestionsService.generateSmartSuggestions(
        inventoryItems,
        shoppingLists,
        excludeItems
      )
      
      setSuggestions(smartSuggestions)
    } catch (err) {
      setError('Failed to generate smart suggestions')
      console.error('Suggestions error:', err)
    } finally {
      setLoading(false)
    }
  }, [householdId, inventoryItems, shoppingLists, excludeItems, inventoryLoading, shoppingLoading])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const refreshSuggestions = useCallback(async () => {
    await fetchSuggestions()
  }, [fetchSuggestions])

  return {
    suggestions,
    loading: loading || inventoryLoading || shoppingLoading,
    error,
    refreshSuggestions
  }
}