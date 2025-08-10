'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react'
import { AddItemForm } from './AddItemForm'
import { InventoryGrid, type InventoryItem } from './InventoryGrid'
import { FOOD_CATEGORIES } from './AddItemForm'
import { formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { toast } from 'sonner'

export interface InventoryDashboardProps {
  householdId: string
  className?: string
}

// Mock data for development - will be replaced with real data from Convex
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    category: 'produce',
    quantity: 6,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    cost: 3.99,
    brand: 'Fresh Market',
    location: 'Counter',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'gallon',
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    cost: 4.29,
    brand: 'Local Dairy',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Ground Turkey',
    category: 'meat',
    quantity: 2,
    unit: 'lbs',
    expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired yesterday
    purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    cost: 8.99,
    brand: 'Premium Meat Co',
    location: 'Fridge',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Pasta Sauce',
    category: 'pantry',
    quantity: 3,
    unit: 'cans',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cost: 2.99,
    brand: 'Italian Brand',
    location: 'Pantry',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    name: 'Frozen Pizza',
    category: 'frozen',
    quantity: 2,
    unit: 'boxes',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    purchaseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    cost: 12.99,
    brand: 'Pizza Co',
    location: 'Freezer',
    householdId: 'household-1',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
]

export function InventoryDashboard({ householdId, className }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(false)

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

      setItems(prev => [newItem, ...prev])
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
      const updatedItem: InventoryItem = {
        ...editingItem,
        ...itemData,
        expirationDate: itemData.expirationDate ? new Date(itemData.expirationDate) : undefined,
        purchaseDate: itemData.purchaseDate ? new Date(itemData.purchaseDate) : undefined,
        updatedAt: new Date()
      }

      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ))
      
      setShowAddDialog(false)
      setEditingItem(null)
      toast.success(`Updated ${itemData.name}`)
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      throw new Error('Failed to delete item')
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, updatedAt: new Date() }
          : item
      ))
    } catch (error) {
      throw new Error('Failed to update quantity')
    }
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setEditingItem(null)
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
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Expired Items */}
          {stats.expiredItems.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Expired Items ({stats.expiredItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.expiredItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expired {formatDistanceToNow(item.expirationDate!)} ago • {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiring Soon */}
          {stats.expiringSoonItems.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Clock className="w-5 h-5" />
                  Expiring Soon ({stats.expiringSoonItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.expiringSoonItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires in {formatDistanceToNow(item.expirationDate!)} • {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditItem(item)}
                      >
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low Stock */}
          {stats.lowStockItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Low Stock ({stats.lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Only {item.quantity} {item.unit} remaining
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 5)}
                      >
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.expiredItems.length === 0 && stats.expiringSoonItems.length === 0 && stats.lowStockItems.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">All Good!</h3>
                  <p className="text-sm">No items need immediate attention.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Items by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.categoryCounts).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES]?.color}>
                          {FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES]?.icon} 
                          {FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES]?.label}
                        </Badge>
                      </div>
                      <span className="font-medium">{count} items</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items
                    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(item.updatedAt)} ago
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.quantity} {item.unit}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
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