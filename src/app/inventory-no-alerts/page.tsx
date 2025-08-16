'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppLayout } from '@/components/layout/AppLayout'
import { 
  Package, 
  Plus, 
  DollarSign,
  AlertTriangle, 
  Clock
} from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { InventoryGrid } from '@/components/inventory/InventoryGrid'

export const dynamic = 'force-dynamic'

export default function InventoryNoAlertsPage() {
  const [mounted, setMounted] = useState(false)
  const householdId = 'household-1'
  
  const { items, loading: inventoryLoading, error: inventoryError } = useInventory(householdId)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate basic stats without alerts
  const stats = useMemo(() => {
    const totalItems = items.length
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0), 0)
    
    return {
      totalItems,
      totalValue,
      expiredCount: 0, // Simplified for testing
      expiringSoonCount: 0 // Simplified for testing
    }
  }, [items])

  if (!mounted) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (inventoryError) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Inventory</h2>
            <p className="text-muted-foreground mb-6">{inventoryError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Inventory Dashboard (No Alerts)</h1>
              <p className="text-muted-foreground">
                Simplified inventory view without alert components
              </p>
            </div>
            
            <Button className="w-fit">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold text-green-600">Good</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Test Mode</p>
                    <p className="text-2xl font-bold">Active</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">All Items</TabsTrigger>
              <TabsTrigger value="test">Test Tab</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <InventoryGrid
                items={items}
                loading={inventoryLoading}
              />
            </TabsContent>

            <TabsContent value="test">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Test Tab</h3>
                    <p className="text-muted-foreground">
                      This is a simplified inventory page for testing production issues.
                    </p>
                    <div className="mt-4 p-4 bg-green-100 rounded-lg">
                      <p className="text-green-800">If you can see this, the basic inventory functionality is working!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}