'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import CategoryIcon from './CategoryIcon'
import { getCategoryList, type FoodCategory } from '@/lib/icons/food-categories'
import { X, Filter } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategories?: FoodCategory[]
  onCategoryChange?: (categories: FoodCategory[]) => void
  multiSelect?: boolean
  showClearAll?: boolean
  showLabel?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export default function CategoryFilter({
  selectedCategories = [],
  onCategoryChange,
  multiSelect = true,
  showClearAll = true,
  showLabel = false,
  size = 'sm',
  className
}: CategoryFilterProps) {
  const [localSelected, setLocalSelected] = useState<FoodCategory[]>(selectedCategories)
  const categories = getCategoryList()
  
  const currentSelection = onCategoryChange ? selectedCategories : localSelected
  
  const handleCategoryToggle = (category: FoodCategory) => {
    let newSelection: FoodCategory[]
    
    if (multiSelect) {
      if (currentSelection.includes(category)) {
        newSelection = currentSelection.filter(c => c !== category)
      } else {
        newSelection = [...currentSelection, category]
      }
    } else {
      newSelection = currentSelection.includes(category) ? [] : [category]
    }
    
    if (onCategoryChange) {
      onCategoryChange(newSelection)
    } else {
      setLocalSelected(newSelection)
    }
  }
  
  const handleClearAll = () => {
    if (onCategoryChange) {
      onCategoryChange([])
    } else {
      setLocalSelected([])
    }
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filter by Category
          </span>
        </div>
        
        {showClearAll && currentSelection.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs touch-target-sm px-3 py-2"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Category Grid */}
      <div className="flex flex-wrap touch-spacing">
        {categories.map(({ value: category, icon }) => {
          const isSelected = currentSelection.includes(category)
          
          return (
            <Button
              key={category}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryToggle(category)}
              className={cn(
                'touch-target-sm flex items-center gap-2 transition-all touch-feedback',
                {
                  'bg-primary text-primary-foreground hover:bg-primary/90': isSelected,
                  'hover:bg-accent hover:text-accent-foreground': !isSelected
                }
              )}
            >
              <CategoryIcon
                category={category}
                size={size}
                variant={isSelected ? 'filled' : 'subtle'}
                aria-label={`Filter by ${icon.label}`}
              />
              
              {showLabel && (
                <span className="text-xs font-medium">{icon.label}</span>
              )}
            </Button>
          )
        })}
      </div>
      
      {/* Active Filters Display */}
      {currentSelection.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <span className="text-xs text-muted-foreground py-1">Active filters:</span>
          {currentSelection.map((category) => {
            const categoryData = categories.find(c => c.value === category)
            if (!categoryData) return null
            
            return (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <CategoryIcon
                  category={category}
                  size="xs"
                  variant="subtle"
                />
                {categoryData.icon.label}
                
                {multiSelect && (
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="ml-1 hover:bg-muted rounded-full touch-target-icon p-1 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${categoryData.icon.label} filter`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </Badge>
            )
          })}
        </div>
      )}
      
      {/* Results Count Info */}
      {currentSelection.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {multiSelect 
            ? `Showing ${currentSelection.length} categor${currentSelection.length === 1 ? 'y' : 'ies'}`
            : `Filtered by ${categories.find(c => c.value === currentSelection[0])?.icon.label}`
          }
        </div>
      )}
    </div>
  )
}

// Simplified single-select version
interface CategorySelectorProps {
  selectedCategory?: FoodCategory | null
  onCategorySelect?: (category: FoodCategory | null) => void
  allowClear?: boolean
  showLabel?: boolean
  className?: string
}

export function CategorySelector({
  selectedCategory,
  onCategorySelect,
  allowClear = true,
  showLabel = true,
  className
}: CategorySelectorProps) {
  return (
    <CategoryFilter
      selectedCategories={selectedCategory ? [selectedCategory] : []}
      onCategoryChange={(categories) => {
        onCategorySelect?.(categories[0] || null)
      }}
      multiSelect={false}
      showClearAll={allowClear}
      showLabel={showLabel}
      className={className}
    />
  )
}