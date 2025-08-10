"use client"

import * as React from "react"
import { Search, Filter, Plus, Grid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/badge"
import { InventoryCard, type InventoryItem } from "./inventory-card"
import { InventoryGridLoading } from "../layout/loading-states"
import { EmptyState } from "../layout/error-states"

interface InventoryGridProps {
  items?: InventoryItem[]
  isLoading?: boolean
  onAddItem?: () => void
  onEditItem?: (item: InventoryItem) => void
  onDeleteItem?: (itemId: string) => void
  className?: string
}

const filterOptions = [
  { label: "All Items", value: "all" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Expiring Soon", value: "expiring" },
  { label: "Expired", value: "expired" },
]

const categories = [
  "All Categories",
  "Fruits & Vegetables", 
  "Dairy & Eggs",
  "Meat & Seafood",
  "Pantry Items",
  "Frozen Foods",
  "Beverages",
  "Snacks",
  "Condiments & Sauces",
  "Baking & Cooking",
  "Other"
]

export function InventoryGrid({ 
  items = [], 
  isLoading, 
  onAddItem, 
  onEditItem, 
  onDeleteItem,
  className 
}: InventoryGridProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All Categories")
  const [selectedFilter, setSelectedFilter] = React.useState("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")

  // Filter items based on search, category, and status
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      const matchesCategory = selectedCategory === "All Categories" || 
                            item.category === selectedCategory
      
      // Status filter
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold
      const isExpiringSoon = item.expiryDate && 
        new Date(item.expiryDate) > now && 
        new Date(item.expiryDate) <= sevenDaysFromNow
      const isExpired = item.expiryDate && new Date(item.expiryDate) < now
      
      let matchesFilter = true
      switch (selectedFilter) {
        case "low-stock":
          matchesFilter = !!isLowStock
          break
        case "expiring":
          matchesFilter = !!isExpiringSoon
          break
        case "expired":
          matchesFilter = !!isExpired
          break
        default:
          matchesFilter = true
      }
      
      return matchesSearch && matchesCategory && matchesFilter
    })
  }, [items, searchTerm, selectedCategory, selectedFilter])

  // Get category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [items])

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-sm">
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <InventoryGridLoading count={8} />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {onAddItem && (
            <Button onClick={onAddItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
              {category !== "All Categories" && categoryCounts[category] ? 
                ` (${categoryCounts[category]})` : ""
              }
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex gap-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} of {items.length} items
        </p>
        {(searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("All Categories")
              setSelectedFilter("all")
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "No items in inventory" : "No matching items"}
          description={
            items.length === 0 
              ? "Add your first kitchen item to get started."
              : "Try adjusting your search or filters."
          }
          action={
            items.length === 0 && onAddItem 
              ? { label: "Add First Item", onClick: onAddItem }
              : undefined
          }
        />
      ) : (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
        )}>
          {filteredItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              className={viewMode === "list" ? "max-w-none" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}