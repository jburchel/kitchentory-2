'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  DollarSign,
  Truck,
  Clock,
  ArrowRight,
  Store as StoreIcon,
  Package,
  TrendingUp,
  Target
} from 'lucide-react'
import { 
  CartSyncRequest, 
  CartSyncResult, 
  PriceComparison,
  UserStoreConnection,
  Store 
} from '../../types/stores'
import { ShoppingItem } from '../../types/shopping'
import { StoreAPIManager } from '../../services/StoreAPIManager'
import { toast } from 'sonner'

export interface ShoppingCartSyncProps {
  householdId: string
  shoppingListId: string
  shoppingItems: ShoppingItem[]
  connectedStores: UserStoreConnection[]
  onSyncComplete?: (results: CartSyncResult[]) => void
}

export function ShoppingCartSync({ 
  householdId, 
  shoppingListId, 
  shoppingItems, 
  connectedStores,
  onSyncComplete 
}: ShoppingCartSyncProps) {
  const [storeManager] = useState(() => StoreAPIManager.getInstance())
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [syncResults, setSyncResults] = useState<CartSyncResult[]>([])
  const [priceComparisons, setPriceComparisons] = useState<{ [itemName: string]: PriceComparison }>({})
  const [syncing, setSyncing] = useState(false)
  const [showPriceComparison, setShowPriceComparison] = useState(false)
  const [syncPreferences, setSyncPreferences] = useState({
    allowSubstitutions: true,
    preferredBrands: [] as string[],
    maxPriceIncrease: 20, // percentage
    prioritizeAvailability: true
  })

  useEffect(() => {
    // Auto-select default stores
    const defaultStores = connectedStores
      .filter(c => c.preferences.isDefault || c.preferences.autoPopulateCart)
      .map(c => `${c.providerId}:${c.storeId || 'default'}`)
    setSelectedStores(defaultStores)
  }, [connectedStores])

  const handleStoreSelection = (storeId: string, checked: boolean) => {
    setSelectedStores(prev => 
      checked 
        ? [...prev, storeId]
        : prev.filter(id => id !== storeId)
    )
  }

  const handleSyncToCarts = async () => {
    if (selectedStores.length === 0) {
      toast.error('Please select at least one store')
      return
    }

    setSyncing(true)
    try {
      const syncRequest: CartSyncRequest = {
        shoppingListId,
        targetStores: selectedStores,
        preferences: syncPreferences
      }

      const response = await storeManager.syncShoppingListToCarts(syncRequest)
      
      if (response.success && response.data) {
        setSyncResults(response.data)
        onSyncComplete?.(response.data)
        
        const totalItems = response.data.reduce((sum, result) => sum + result.totalItems, 0)
        const totalStores = response.data.length
        
        toast.success(
          `Successfully synced ${totalItems} items to ${totalStores} store cart${totalStores > 1 ? 's' : ''}`
        )
      } else {
        throw new Error(response.error?.message || 'Sync failed')
      }
    } catch (error) {
      console.error('Cart sync failed:', error)
      toast.error('Failed to sync items to store carts')
    } finally {
      setSyncing(false)
    }
  }

  const handleComparePrices = async () => {
    if (shoppingItems.length === 0) {
      toast.error('No items to compare')
      return
    }

    setSyncing(true)
    try {
      const comparisons: { [itemName: string]: PriceComparison } = {}
      
      // Compare prices for each shopping item
      for (const item of shoppingItems.slice(0, 5)) { // Limit to 5 items for demo
        const response = await storeManager.comparePrices(item.name, selectedStores)
        if (response.success && response.data) {
          comparisons[item.name] = response.data
        }
      }
      
      setPriceComparisons(comparisons)
      setShowPriceComparison(true)
      
      toast.success(`Price comparison complete for ${Object.keys(comparisons).length} items`)
    } catch (error) {
      console.error('Price comparison failed:', error)
      toast.error('Failed to compare prices')
    } finally {
      setSyncing(false)
    }
  }

  const getTotalSyncedItems = () => {
    return syncResults.reduce((sum, result) => sum + result.totalItems, 0)
  }

  const getTotalValue = () => {
    return syncResults.reduce((sum, result) => sum + result.totalPrice, 0)
  }

  const getSuccessRate = () => {
    const totalRequested = shoppingItems.length * selectedStores.length
    const totalSynced = getTotalSyncedItems()
    return totalRequested > 0 ? Math.round((totalSynced / totalRequested) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Auto-Populate Store Carts
          </h2>
          <p className="text-muted-foreground">
            Sync your shopping list to store carts automatically
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleComparePrices}
            variant="outline"
            disabled={syncing || selectedStores.length === 0}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Compare Prices
          </Button>
          <Button 
            onClick={handleSyncToCarts}
            disabled={syncing || selectedStores.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Sync to Carts
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {syncResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getTotalSyncedItems()}</div>
              <div className="text-sm text-muted-foreground">Items Synced</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{syncResults.length}</div>
              <div className="text-sm text-muted-foreground">Store Carts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">${getTotalValue().toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{getSuccessRate()}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5" />
            Select Target Stores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedStores.map((connection) => {
              const storeId = `${connection.providerId}:${connection.storeId || 'default'}`
              const isSelected = selectedStores.includes(storeId)
              
              return (
                <div 
                  key={connection.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStoreSelection(storeId, !isSelected)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleStoreSelection(storeId, checked as boolean)}
                      />
                      <div>
                        <p className="font-medium">{connection.providerId}</p>
                        <div className="flex gap-2 mt-1">
                          {connection.preferences.isDefault && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                          {connection.preferences.autoPopulateCart && (
                            <Badge variant="outline" className="text-xs">Auto-sync</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>
                </div>
              )
            })}
          </div>

          {connectedStores.length === 0 && (
            <div className="text-center py-8">
              <StoreIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No connected stores found</p>
              <p className="text-sm text-muted-foreground">Connect to stores first to enable cart sync</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Sync Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Allow substitutions</label>
                <Switch
                  checked={syncPreferences.allowSubstitutions}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, allowSubstitutions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Prioritize availability</label>
                <Switch
                  checked={syncPreferences.prioritizeAvailability}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, prioritizeAvailability: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Max price increase (%)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={syncPreferences.maxPriceIncrease}
                  onChange={(e) => 
                    setSyncPreferences(prev => ({ 
                      ...prev, 
                      maxPriceIncrease: parseInt(e.target.value) 
                    }))
                  }
                  className="w-full mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {syncPreferences.maxPriceIncrease}% maximum increase
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncResults.map((result) => (
                <div 
                  key={result.storeId}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{result.storeId}</p>
                        <p className="text-sm text-muted-foreground">
                          Cart ID: {result.cartId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${result.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.totalItems} items
                      </p>
                    </div>
                  </div>

                  {result.unavailableItems.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {result.unavailableItems.length} items unavailable
                        </span>
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        {result.unavailableItems.join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Truck className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison Dialog */}
      <Dialog open={showPriceComparison} onOpenChange={setShowPriceComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Price Comparison
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {Object.entries(priceComparisons).map(([itemName, comparison]) => (
              <Card key={itemName}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{itemName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparison.stores.map((store) => (
                      <div 
                        key={store.storeId}
                        className={`p-3 border rounded-lg ${
                          store.storeId === comparison.recommendations.cheapest
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{store.storeName}</p>
                          {store.storeId === comparison.recommendations.cheapest && (
                            <Badge variant="default" className="bg-green-600">
                              Cheapest
                            </Badge>
                          )}
                        </div>
                        
                        {store.availability === 'available' && store.price ? (
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              ${store.price.toFixed(2)}
                            </p>
                            {store.deliveryFee && (
                              <p className="text-sm text-muted-foreground">
                                +${store.deliveryFee.toFixed(2)} delivery
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {store.availability === 'unavailable' ? 'Out of stock' : 'Price unavailable'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}