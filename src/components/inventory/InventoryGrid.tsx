'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { FOOD_CATEGORIES } from './AddItemForm'
import { toast } from 'sonner'

export interface InventoryItem {
  id: string
  name: string
  category: keyof typeof FOOD_CATEGORIES
  quantity: number
  unit: string
  expirationDate?: Date
  purchaseDate?: Date
  cost?: number
  barcode?: string
  notes?: string
  location?: string
  brand?: string
  householdId: string
  createdAt: Date
  updatedAt: Date
}

export interface InventoryGridProps {
  items: InventoryItem[]
  onEditItem?: (item: InventoryItem) => void
  onDeleteItem?: (itemId: string) => void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  loading?: boolean
  className?: string
}

type SortOption = 'name' | 'category' | 'expiration' | 'quantity' | 'recent'
type FilterOption = 'all' | 'expiring' | 'expired' | 'low-stock'
type ViewMode = 'grid' | 'list'

const getExpirationStatus = (expirationDate?: Date) => {
  if (!expirationDate) return 'none'
  
  const now = new Date()
  const threeDaysFromNow = addDays(now, 3)
  const sevenDaysFromNow = addDays(now, 7)
  
  if (isBefore(expirationDate, now)) return 'expired'
  if (isBefore(expirationDate, threeDaysFromNow)) return 'critical'
  if (isBefore(expirationDate, sevenDaysFromNow)) return 'warning'
  return 'good'
}

const getExpirationBadge = (status: string, expirationDate?: Date) => {
  switch (status) {
    case 'expired':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Expired
        </Badge>
      )
    case 'critical':
      return (
        <Badge className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="w-3 h-3" />
          Expires in {formatDistanceToNow(expirationDate!)}
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
          <Clock className="w-3 h-3" />
          Expires in {formatDistanceToNow(expirationDate!)}
        </Badge>
      )
    case 'good':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Good
        </Badge>
      )
    default:
      return null
  }
}

const getCategoryStyle = (category: keyof typeof FOOD_CATEGORIES) => {
  return FOOD_CATEGORIES[category]?.color || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function InventoryGrid({ 
  items, 
  onEditItem, 
  onDeleteItem, 
  onUpdateQuantity,
  loading = false,
  className 
}: InventoryGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filter items based on search and filter criteria
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    // Additional filters
    switch (filterBy) {
      case 'expiring':
        return item.expirationDate && ['critical', 'warning'].includes(getExpirationStatus(item.expirationDate))
      case 'expired':
        return getExpirationStatus(item.expirationDate) === 'expired'
      case 'low-stock':
        return item.quantity <= 2 // Define low stock threshold
      default:
        return true
    }
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'expiration':
        if (!a.expirationDate && !b.expirationDate) return 0
        if (!a.expirationDate) return 1
        if (!b.expirationDate) return -1
        return a.expirationDate.getTime() - b.expirationDate.getTime()
      case 'quantity':
        return a.quantity - b.quantity
      case 'recent':
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime()
    }
  })

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        await onDeleteItem?.(itemId)
        toast.success(`"${itemName}" has been removed from inventory`)
      } catch (error) {
        toast.error('Failed to delete item')
      }
    }
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    try {
      await onUpdateQuantity?.(itemId, newQuantity)
      toast.success('Quantity updated')
    } catch (error) {
      toast.error('Failed to update quantity')
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="expiration">Expiration</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border border-input">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none border-l"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sortedItems.length} of {items.length} items
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {filterBy !== 'all' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterBy('all')}
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Items Grid/List */}
      {sortedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filterBy !== 'all' ? 'No items match your search' : 'No items in inventory'}
              </h3>
              <p className="text-sm">
                {searchQuery || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first item to get started'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {sortedItems.map((item) => {
            const expirationStatus = getExpirationStatus(item.expirationDate)
            const isLowStock = item.quantity <= 2

            return (
              <Card 
                key={item.id} 
                className={`hover:shadow-md transition-shadow ${
                  expirationStatus === 'expired' ? 'border-red-200' :
                  expirationStatus === 'critical' ? 'border-red-100' :
                  expirationStatus === 'warning' ? 'border-amber-100' : ''
                }`}
              >
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                  {/* Item Icon/Avatar */}
                  <Avatar className={`${viewMode === 'list' ? 'w-12 h-12' : 'w-10 h-10 mb-3'}`}>
                    <AvatarFallback className={`text-lg ${getCategoryStyle(item.category)}`}>
                      {FOOD_CATEGORIES[item.category]?.icon || '📦'}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${viewMode === 'list' ? 'flex items-center gap-3' : ''}`}>
                        <h3 className="font-medium text-sm leading-tight">
                          {item.name}
                          {item.brand && <span className="text-muted-foreground"> • {item.brand}</span>}
                        </h3>
                        {viewMode === 'list' && (
                          <Badge variant="outline" className={`${getCategoryStyle(item.category)} text-xs`}>
                            {FOOD_CATEGORIES[item.category]?.icon} {FOOD_CATEGORIES[item.category]?.label}
                          </Badge>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditItem?.(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Category Badge (Grid view only) */}
                    {viewMode === 'grid' && (
                      <Badge variant="outline" className={`${getCategoryStyle(item.category)} text-xs mb-3`}>
                        {FOOD_CATEGORIES[item.category]?.icon} {FOOD_CATEGORIES[item.category]?.label}
                      </Badge>
                    )}

                    {/* Item Details */}
                    <div className={`space-y-2 text-xs text-muted-foreground ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span className={isLowStock ? 'text-amber-600 font-medium' : ''}>
                          {item.quantity} {item.unit}
                          {isLowStock && ' (Low)'}
                        </span>
                      </div>

                      {/* Location */}
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location}</span>
                        </div>
                      )}

                      {/* Cost */}
                      {item.cost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${item.cost.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Purchase Date */}
                      {item.purchaseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Added {formatDistanceToNow(item.purchaseDate)} ago</span>
                        </div>
                      )}
                    </div>

                    {/* Expiration Status */}
                    {item.expirationDate && (
                      <div className="mt-3">
                        {getExpirationBadge(expirationStatus, item.expirationDate)}
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-6 w-6 p-0"
                        >
                          -
                        </Button>
                        <span className="text-sm min-w-[2rem] text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          +
                        </Button>
                      </div>
                      
                      {isLowStock && (
                        <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}