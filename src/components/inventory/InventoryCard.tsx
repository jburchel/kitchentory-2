import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Calendar, MapPin, Package } from 'lucide-react'
import { CategoryIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  brand?: string
  category?: string
  quantity: number
  unit: string
  location?: string
  expirationDate?: string
  image?: string
  barcode?: string
}

interface InventoryCardProps {
  item: InventoryItem
  onEdit?: (item: InventoryItem) => void
  onDelete?: (id: string) => void
  className?: string
}

export default function InventoryCard({
  item,
  onEdit,
  onDelete,
  className
}: InventoryCardProps) {
  const isExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false
    const expiry = new Date(expirationDate)
    const today = new Date()
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays > 0
  }

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false
    return new Date(expirationDate) < new Date()
  }

  const getExpirationStatus = () => {
    if (!item.expirationDate) return null
    
    if (isExpired(item.expirationDate)) {
      return { label: 'Expired', variant: 'destructive' as const, urgent: true }
    }
    
    if (isExpiringSoon(item.expirationDate)) {
      return { label: 'Expires Soon', variant: 'outline' as const, urgent: true }
    }
    
    return null
  }

  const expirationStatus = getExpirationStatus()

  return (
    <div 
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg transition-all hover:shadow-md',
        {
          'border-red-200 bg-red-50/50': expirationStatus?.variant === 'destructive',
          'border-orange-200 bg-orange-50/50': expirationStatus?.variant === 'outline' && expirationStatus.urgent,
        },
        className
      )}
    >
      {/* Product Image or Category Icon */}
      <div className="relative flex-shrink-0">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
            <CategoryIcon
              category={item.category}
              size="lg"
              variant="subtle"
              aria-label={`${item.category || 'unknown'} category`}
            />
          </div>
        )}
        
        {/* Category icon overlay for images */}
        {item.image && item.category && (
          <div className="absolute -bottom-1 -right-1">
            <CategoryIcon
              category={item.category}
              size="xs"
              variant="filled"
              className="shadow-sm border-2 border-background"
            />
          </div>
        )}
      </div>
      
      {/* Item Details */}
      <div className="flex-1 min-w-0">
        {/* Name and Status */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base truncate">{item.name}</h3>
            
            {/* Category Badge */}
            {item.category && (
              <div className="flex items-center gap-1">
                <CategoryIcon
                  category={item.category}
                  size="xs"
                  variant="subtle"
                  aria-label={`${item.category} category`}
                />
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            )}
            
            {/* Expiration Status */}
            {expirationStatus && (
              <Badge 
                variant={expirationStatus.variant}
                className={cn(
                  'text-xs',
                  expirationStatus.variant === 'outline' && 'border-orange-500 text-orange-600',
                  expirationStatus.variant === 'destructive' && 'animate-pulse'
                )}
              >
                {expirationStatus.label}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Brand */}
        {item.brand && (
          <div className="text-sm text-muted-foreground mb-2">
            {item.brand}
          </div>
        )}
        
        {/* Quantity and Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Quantity */}
          <span className="font-medium text-foreground">
            {item.quantity} {item.unit}
          </span>
          
          {/* Location */}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          )}
          
          {/* Expiration Date */}
          {item.expirationDate && (
            <span 
              className={cn(
                'flex items-center gap-1',
                expirationStatus?.urgent && 'text-orange-600 font-medium'
              )}
            >
              <Calendar className="h-3 w-3" />
              {new Date(item.expirationDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        {onEdit && (
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0 hover:bg-accent"
            aria-label={`Edit ${item.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        
        {onDelete && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}