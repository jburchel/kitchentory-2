'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Lightbulb, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Snowflake,
  ChefHat,
  RefreshCw,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import {
  SmartSuggestion,
  ITEM_PRIORITIES,
  STORE_SECTIONS,
  AddItemToListData
} from '@/schemas/shoppingListSchemas'

export interface SmartSuggestionsProps {
  householdId: string
  onAddToList: (item: AddItemToListData) => Promise<void>
  excludeItems?: string[]
  maxSuggestions?: number
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

const REASON_CONFIG = {
  low_stock: {
    label: 'Low Stock',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    description: 'Running low in inventory'
  },
  expired: {
    label: 'Expired',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: AlertTriangle,
    description: 'Item has expired'
  },
  frequently_bought: {
    label: 'Frequent',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: TrendingUp,
    description: 'Frequently purchased item'
  },
  seasonal: {
    label: 'Seasonal',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: Snowflake,
    description: 'Seasonal recommendation'
  },
  recipe_ingredient: {
    label: 'Recipe',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: ChefHat,
    description: 'Needed for planned recipes'
  }
}

// Mock smart suggestions generator
const generateSmartSuggestions = async (
  householdId: string, 
  excludeItems: string[] = []
): Promise<SmartSuggestion[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const allSuggestions: SmartSuggestion[] = [
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
    },
    {
      itemName: 'Orange Juice',
      category: 'beverages',
      reason: 'low_stock',
      priority: 'medium',
      estimatedQuantity: 1,
      estimatedUnit: 'bottle',
      inventoryItemId: 'inv-3',
      lastPurchaseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      averageConsumption: 1.2
    },
    {
      itemName: 'Chicken Breast',
      category: 'meat',
      reason: 'recipe_ingredient',
      priority: 'high',
      estimatedQuantity: 2,
      estimatedUnit: 'lbs',
      lastPurchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      itemName: 'Pasta',
      category: 'pantry',
      reason: 'frequently_bought',
      priority: 'low',
      estimatedQuantity: 2,
      estimatedUnit: 'boxes',
      lastPurchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      averageConsumption: 0.5
    },
    {
      itemName: 'Apples',
      category: 'produce',
      reason: 'seasonal',
      priority: 'medium',
      estimatedQuantity: 8,
      estimatedUnit: 'pieces',
      lastPurchaseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      averageConsumption: 2.0
    }
  ]

  // Filter out excluded items
  return allSuggestions
    .filter(suggestion => !excludeItems.includes(suggestion.itemName.toLowerCase()))
    .slice(0, 6) // Limit suggestions
}

export function SmartSuggestions({
  householdId,
  onAddToList,
  excludeItems = [],
  maxSuggestions = 6,
  onRefresh,
  loading = false,
  className
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dismissedItems, setDismissedItems] = useState<string[]>([])

  const loadSuggestions = async () => {
    try {
      setIsLoading(true)
      const newSuggestions = await generateSmartSuggestions(householdId, excludeItems)
      setSuggestions(newSuggestions.slice(0, maxSuggestions))
    } catch (error) {
      toast.error('Failed to load smart suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSuggestions()
  }, [householdId, excludeItems, maxSuggestions])

  const handleAddToList = async (suggestion: SmartSuggestion) => {
    try {
      const itemData: AddItemToListData = {
        name: suggestion.itemName,
        quantity: suggestion.estimatedQuantity,
        unit: suggestion.estimatedUnit,
        section: suggestion.category as keyof typeof STORE_SECTIONS,
        priority: suggestion.priority,
        inventoryItemId: suggestion.inventoryItemId,
        addedBy: 'current-user-id' // This would come from auth context
      }

      await onAddToList(itemData)
      
      // Remove from suggestions
      setSuggestions(prev => 
        prev.filter(s => s.itemName !== suggestion.itemName)
      )
      
      toast.success(`Added ${suggestion.itemName} to shopping list`)
    } catch (error) {
      toast.error('Failed to add item to list')
    }
  }

  const handleDismiss = (itemName: string) => {
    setDismissedItems(prev => [...prev, itemName])
    setSuggestions(prev => 
      prev.filter(s => s.itemName !== itemName)
    )
  }

  const handleRefresh = () => {
    setDismissedItems([])
    loadSuggestions()
    onRefresh?.()
  }

  const visibleSuggestions = suggestions.filter(
    suggestion => !dismissedItems.includes(suggestion.itemName)
  )

  if (loading || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-16 h-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (visibleSuggestions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              Smart Suggestions
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No suggestions available</h3>
            <p className="text-sm">
              We'll suggest items based on your inventory and shopping patterns
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            Smart Suggestions
            <Badge variant="secondary" className="text-xs">
              {visibleSuggestions.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleSuggestions.map((suggestion) => {
            const reasonConfig = REASON_CONFIG[suggestion.reason]
            const priorityConfig = ITEM_PRIORITIES[suggestion.priority]
            const sectionConfig = STORE_SECTIONS[suggestion.category as keyof typeof STORE_SECTIONS]
            const ReasonIcon = reasonConfig.icon

            return (
              <div
                key={suggestion.itemName}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Item Icon */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`text-sm ${sectionConfig?.color || 'bg-gray-100'}`}>
                    {sectionConfig?.icon || '📦'}
                  </AvatarFallback>
                </Avatar>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{suggestion.itemName}</h4>
                    <Badge variant="outline" className={`${reasonConfig.color} text-xs`}>
                      <ReasonIcon className="w-3 h-3 mr-1" />
                      {reasonConfig.label}
                    </Badge>
                    {suggestion.priority === 'urgent' && (
                      <Badge variant="outline" className={`${priorityConfig.color} text-xs`}>
                        {suggestion.priority}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{suggestion.estimatedQuantity} {suggestion.estimatedUnit}</span>
                    <span>•</span>
                    <span>{reasonConfig.description}</span>
                    {suggestion.averageConsumption && (
                      <>
                        <span>•</span>
                        <span>{suggestion.averageConsumption}/week avg</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddToList(suggestion)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(suggestion.itemName)}
                    className="p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Suggestions Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How we suggest items:</p>
              <ul className="text-xs space-y-1">
                <li>• Items running low in your inventory</li>
                <li>• Frequently purchased items based on your history</li>
                <li>• Expired items that need replacing</li>
                <li>• Seasonal recommendations and recipe ingredients</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}