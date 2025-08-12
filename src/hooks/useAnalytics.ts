'use client'

import { useState, useEffect, useCallback } from 'react'
import { InventoryItem } from '@/components/inventory/InventoryGrid'
import { ShoppingList } from '@/types/shopping'
import AnalyticsService, { AnalyticsData } from '@/services/AnalyticsService'
import { useInventory } from './useInventory'
import { useShoppingLists } from './useShoppingLists'

export interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null
  loading: boolean
  error: string | null
  refreshAnalytics: () => Promise<void>
}

export function useAnalytics(householdId?: string): UseAnalyticsReturn {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const { items: inventoryItems, loading: inventoryLoading } = useInventory(householdId)
  const { shoppingLists, loading: shoppingLoading } = useShoppingLists(householdId)
  
  const analyticsService = AnalyticsService.getInstance()

  const fetchAnalytics = useCallback(async () => {
    if (!householdId || inventoryLoading || shoppingLoading) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = analyticsService.generateAnalyticsReport(
        inventoryItems,
        shoppingLists
      )
      
      setAnalyticsData(data)
    } catch (err) {
      setError('Failed to generate analytics report')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }, [householdId, inventoryItems, shoppingLists, inventoryLoading, shoppingLoading])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analyticsData,
    loading: loading || inventoryLoading || shoppingLoading,
    error,
    refreshAnalytics
  }
}