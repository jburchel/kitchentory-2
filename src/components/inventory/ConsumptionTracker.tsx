'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Check, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Utensils,
  Clock,
  ChefHat,
  X
} from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { InventoryItem } from '@/hooks/useInventory'
import { toast } from 'sonner'

export interface ConsumptionItem {
  id: string
  itemId: string
  itemName: string
  plannedQuantity: number
  consumedQuantity: number
  unit: string
  checked: boolean
}

export interface ConsumptionTrackerProps {
  householdId: string
  recipeName?: string
  ingredients: { itemId?: string; name: string; quantity: number; unit: string }[]
  onClose: () => void
  onComplete: () => void
}

export function ConsumptionTracker({ 
  householdId, 
  recipeName, 
  ingredients, 
  onClose, 
  onComplete 
}: ConsumptionTrackerProps) {
  const { items: inventoryItems, consumeIngredients, autoAddToShoppingList } = useInventory(householdId)
  
  // Initialize consumption items from recipe ingredients
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>(() => {
    return ingredients.map((ingredient, index) => {
      const inventoryItem = inventoryItems.find(item => 
        item.id === ingredient.itemId || 
        item.name.toLowerCase().includes(ingredient.name.toLowerCase())
      )
      
      return {
        id: `consumption-${index}`,
        itemId: inventoryItem?.id || '',
        itemName: ingredient.name,
        plannedQuantity: ingredient.quantity,
        consumedQuantity: 0,
        unit: ingredient.unit,
        checked: false
      }
    })
  })

  const [showBulkActions, setShowBulkActions] = useState(false)

  // Update consumed quantity for an item
  const updateConsumedQuantity = (id: string, quantity: number) => {
    setConsumptionItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, consumedQuantity: Math.max(0, quantity) }
        : item
    ))
  }

  // Toggle item checked status
  const toggleItemChecked = (id: string) => {
    setConsumptionItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, checked: !item.checked }
        : item
    ))
  }

  // Quick set consumed quantity to planned quantity
  const setFullQuantity = (id: string) => {
    setConsumptionItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, consumedQuantity: item.plannedQuantity, checked: true }
        : item
    ))
  }

  // Clear consumed quantity
  const clearQuantity = (id: string) => {
    setConsumptionItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, consumedQuantity: 0, checked: false }
        : item
    ))
  }

  // Bulk actions
  const markAllUsed = () => {
    setConsumptionItems(prev => prev.map(item => ({
      ...item,
      consumedQuantity: item.plannedQuantity,
      checked: true
    })))
  }

  const clearAll = () => {
    setConsumptionItems(prev => prev.map(item => ({
      ...item,
      consumedQuantity: 0,
      checked: false
    })))
  }

  // Calculate summary stats
  const totalItems = consumptionItems.length
  const checkedItems = consumptionItems.filter(item => item.checked).length
  const itemsWithConsumption = consumptionItems.filter(item => item.consumedQuantity > 0).length

  // Handle final consumption
  const handleFinishCooking = async () => {
    const itemsToConsume = consumptionItems
      .filter(item => item.consumedQuantity > 0 && item.itemId)
      .map(item => ({
        itemId: item.itemId,
        quantity: item.consumedQuantity
      }))

    if (itemsToConsume.length === 0) {
      toast.error('No items selected for consumption')
      return
    }

    try {
      await consumeIngredients(itemsToConsume)
      toast.success(`Finished cooking! Consumed ${itemsToConsume.length} ingredients.`)
      onComplete()
    } catch (error) {
      toast.error('Failed to update inventory')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Manual Consumption Tracking
            {recipeName && <span className="text-sm font-normal text-muted-foreground">- {recipeName}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{itemsWithConsumption}</div>
                <div className="text-sm text-muted-foreground">Will Consume</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{checkedItems}</div>
                <div className="text-sm text-muted-foreground">Checked Off</div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-add Shopping List Info */}
          {autoAddToShoppingList && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-700">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Auto-add to Shopping List Enabled</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Items that reach zero quantity will automatically be added to your shopping list
              </p>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllUsed}
            >
              <Check className="w-4 h-4 mr-2" />
              Use All Planned
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAll}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Consumption Items */}
          <div className="space-y-3">
            {consumptionItems.map((item) => {
              const inventoryItem = inventoryItems.find(inv => inv.id === item.itemId)
              const availableQuantity = inventoryItem?.quantity || 0
              const isOverLimit = item.consumedQuantity > availableQuantity
              
              return (
                <Card key={item.id} className={`${item.checked ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItemChecked(item.id)}
                        />
                        <div>
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-sm text-muted-foreground">
                            Planned: {item.plannedQuantity} {item.unit}
                            {inventoryItem && (
                              <span className="ml-2">
                                • Available: {availableQuantity} {item.unit}
                              </span>
                            )}
                          </div>
                          {isOverLimit && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Exceeds available quantity
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Quick Actions */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFullQuantity(item.id)}
                          disabled={!inventoryItem}
                        >
                          Use All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clearQuantity(item.id)}
                        >
                          Clear
                        </Button>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateConsumedQuantity(item.id, item.consumedQuantity - 0.5)}
                            disabled={item.consumedQuantity <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={item.consumedQuantity}
                            onChange={(e) => updateConsumedQuantity(item.id, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            step="0.5"
                            min="0"
                            max={availableQuantity}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateConsumedQuantity(item.id, item.consumedQuantity + 0.5)}
                            disabled={item.consumedQuantity >= availableQuantity}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <span className="text-sm text-muted-foreground min-w-12">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={handleFinishCooking}
                disabled={itemsWithConsumption === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Finish Cooking ({itemsWithConsumption} items)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}