'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDashboard } from '@/components/alerts/AlertDashboard'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  RefreshCw
} from 'lucide-react'
import { AddItemForm } from './AddItemForm'
import { InventoryGrid, type InventoryItem } from './InventoryGrid'
import { FOOD_CATEGORIES } from './AddItemForm'
import { formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { toast } from 'sonner'
import { useInventory } from '@/hooks/useInventory'
import { useAnalytics } from '@/hooks/useAnalytics'

export interface InventoryDashboardProps {
  householdId: string
  className?: string
}

export function InventoryDashboard({ householdId, className }: InventoryDashboardProps) {
  const { items, loading: inventoryLoading, error: inventoryError } = useInventory(householdId)
  const { analyticsData, loading: analyticsLoading, error: analyticsError, refreshAnalytics } = useAnalytics(householdId)
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  // Calculate inventory statistics
  const stats = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = addDays(now, 3)
    
    const totalItems = items.length
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0), 0)
    
    const expiredItems = items.filter(item => 
      item.expirationDate && isBefore(item.expirationDate, now)
    )
    
    const expiringSoonItems = items.filter(item => 
      item.expirationDate && 
      isAfter(item.expirationDate, now) && 
      isBefore(item.expirationDate, threeDaysFromNow)
    )
    
    const lowStockItems = items.filter(item => item.quantity <= 2)
    
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalItems,
      totalValue,
      expiredCount: expiredItems.length,
      expiringSoonCount: expiringSoonItems.length,
      lowStockCount: lowStockItems.length,
      categoryCounts,
      expiredItems,
      expiringSoonItems,
      lowStockItems
    }
  }, [items])

  const handleAddItem = async (itemData: any) => {
    try {
      // Mock API call - will be replaced with actual Convex mutation
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...itemData,
        expirationDate: itemData.expirationDate ? new Date(itemData.expirationDate) : undefined,
        purchaseDate: itemData.purchaseDate ? new Date(itemData.purchaseDate) : undefined,
        householdId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // In a real implementation, we would call a mutation here
      // For now, we'll just show a success message
      setShowAddDialog(false)
      toast.success(`Added ${itemData.name} to inventory`)
    } catch (error) {
      toast.error('Failed to add item')
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowAddDialog(true)
  }

  const handleUpdateItem = async (itemData: any) => {
    if (!editingItem) return

    try {
      // In a real implementation, we would call a mutation here
      // For now, we'll just show a success message
      setShowAddDialog(false)
      setEditingItem(null)
      toast.success(`Updated ${itemData.name}`)
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      // In a real implementation, we would call a mutation here
      toast.success('Item deleted')
    } catch (error) {
      toast.error('Failed to delete item')
      throw new Error('Failed to delete item')
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      // In a real implementation, we would call a mutation here
      toast.success('Quantity updated')
    } catch (error) {
      toast.error('Failed to update quantity')
      throw new Error('Failed to update quantity')
    }
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setEditingItem(null)
  }

  if (inventoryError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Inventory</h2>
          <p className="text-muted-foreground mb-6">{inventoryError}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your household food inventory and track expiration dates
          </p>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)} className="w-fit">
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

        <Card className={stats.expiredCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Items</p>
                <p className={`text-2xl font-bold ${stats.expiredCount > 0 ? 'text-red-600' : ''}`}>
                  {stats.expiredCount}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${stats.expiredCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.expiringSoonCount > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className={`text-2xl font-bold ${stats.expiringSoonCount > 0 ? 'text-amber-600' : ''}`}>
                  {stats.expiringSoonCount}
                </p>
              </div>
              <Clock className={`w-8 h-8 ${stats.expiringSoonCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">All Items</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {(stats.expiredCount + stats.expiringSoonCount + stats.lowStockCount) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 text-xs">
                {stats.expiredCount + stats.expiringSoonCount + stats.lowStockCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryGrid
            items={items}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onUpdateQuantity={handleUpdateQuantity}
            loading={inventoryLoading}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard
            analyticsData={analyticsData}
            loading={analyticsLoading}
            error={analyticsError}
            onRefresh={refreshAnalytics}
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          <AddItemForm
            householdId={householdId}
            onSuccess={editingItem ? handleUpdateItem : handleAddItem}
            onCancel={handleCloseDialog}
            initialData={editingItem ? {
              name: editingItem.name,
              category: editingItem.category,
              quantity: editingItem.quantity,
              unit: editingItem.unit,
              expirationDate: editingItem.expirationDate?.toISOString().split('T')[0],
              purchaseDate: editingItem.purchaseDate?.toISOString().split('T')[0],
              cost: editingItem.cost,
              barcode: editingItem.barcode,
              notes: editingItem.notes,
              location: editingItem.location,
              brand: editingItem.brand
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}