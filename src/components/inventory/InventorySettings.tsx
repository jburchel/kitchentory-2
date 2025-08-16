'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  ShoppingCart, 
  Zap, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { useShopping } from '@/hooks/useShopping'

export interface InventorySettingsProps {
  householdId: string
}

export function InventorySettings({ householdId }: InventorySettingsProps) {
  const { autoAddToShoppingList, setAutoAddToShoppingList } = useInventory(householdId)
  const { shoppingLists } = useShopping(householdId)

  const activeShoppingLists = shoppingLists.filter(list => list.status === 'active')
  const defaultList = activeShoppingLists[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Inventory Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-add to Shopping List Setting */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Auto-add to Shopping List</h3>
                <Badge variant={autoAddToShoppingList ? "default" : "outline"} className="text-xs">
                  {autoAddToShoppingList ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically add items to your shopping list when they're completely depleted from inventory
              </p>
            </div>
            <Switch
              checked={autoAddToShoppingList}
              onCheckedChange={setAutoAddToShoppingList}
            />
          </div>

          {/* Shopping List Status */}
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-start gap-2">
              {defaultList ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {defaultList ? "Ready for Auto-add" : "No Shopping List Found"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {defaultList ? (
                    <>
                      Depleted items will be added to <strong>"{defaultList.name}"</strong>
                    </>
                  ) : (
                    "Create a shopping list to enable auto-add functionality"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* How it Works */}
          {autoAddToShoppingList && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                How Auto-add Works
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5" />
                  <span>When you cook a recipe or manually consume items, inventory quantities are reduced</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5" />
                  <span>Items that reach zero quantity are automatically added to your shopping list</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5" />
                  <span>Duplicates are prevented - items already on your shopping list won't be added again</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5" />
                  <span>You'll get a notification when items are automatically added</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shopping List Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Shopping Lists Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-md">
              <div className="text-lg font-semibold">{shoppingLists.length}</div>
              <div className="text-xs text-muted-foreground">Total Lists</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-md">
              <div className="text-lg font-semibold">{activeShoppingLists.length}</div>
              <div className="text-xs text-muted-foreground">Active Lists</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-md">
              <div className="text-lg font-semibold">
                {shoppingLists.reduce((sum, list) => sum + list.items.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!defaultList && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Get Started</p>
                <p className="text-xs text-blue-700">Create your first shopping list to enable auto-add</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create List
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}