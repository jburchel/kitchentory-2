"use client"

import * as React from "react"
import { Calendar, Package, AlertTriangle, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiryDate?: Date
  location: string
  lowStockThreshold?: number
  image?: string
}

interface InventoryCardProps {
  item: InventoryItem
  onEdit?: (item: InventoryItem) => void
  onDelete?: (itemId: string) => void
  className?: string
}

export function InventoryCard({ item, onEdit, onDelete, className }: InventoryCardProps) {
  const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold
  const isExpiringSoon = item.expiryDate && 
    new Date(item.expiryDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date()

  const getStatusVariant = () => {
    if (isExpired) return "destructive"
    if (isExpiringSoon) return "cream"
    if (isLowStock) return "mint"
    return "sage"
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate">
            {item.name}
          </CardTitle>
          <Badge variant={getStatusVariant()}>
            {item.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Quantity</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{item.quantity}</span>
              <span className="text-sm text-muted-foreground">{item.unit}</span>
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Location</span>
            </div>
            <span className="text-sm font-medium">{item.location}</span>
          </div>

          {/* Expiry Date */}
          {item.expiryDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Expires</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={cn(
                  "text-sm font-medium",
                  isExpired && "text-destructive",
                  isExpiringSoon && "text-amber-600"
                )}>
                  {formatDate(item.expiryDate)}
                </span>
                {(isExpired || isExpiringSoon) && (
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    isExpired ? "text-destructive" : "text-amber-500"
                  )} />
                )}
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            {isExpiringSoon && !isExpired && (
              <Badge variant="cream" className="text-xs">
                Expires Soon
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="mint" className="text-xs">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="flex-1"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}