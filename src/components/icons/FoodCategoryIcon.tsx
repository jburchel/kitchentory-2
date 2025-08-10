'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { getCategoryIcon, type FoodCategory } from '@/lib/icons/food-categories'
import { type IconProps } from '@/components/icons/svg'

interface FoodCategoryIconProps {
  category: FoodCategory | string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'solid' | 'outline' | 'subtle'
  className?: string
  showLabel?: boolean
  interactive?: boolean
  onClick?: () => void
  'aria-label'?: string
}

const sizeConfig = {
  xs: { size: 16, container: 'w-6 h-6', text: 'text-xs' },
  sm: { size: 20, container: 'w-8 h-8', text: 'text-xs' },
  md: { size: 24, container: 'w-10 h-10', text: 'text-sm' },
  lg: { size: 32, container: 'w-12 h-12', text: 'text-sm' },
  xl: { size: 48, container: 'w-16 h-16', text: 'text-base' },
}

export function FoodCategoryIcon({ 
  category, 
  size = 'md', 
  variant = 'default',
  className,
  showLabel = false,
  interactive = false,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: FoodCategoryIconProps) {
  const categoryData = getCategoryIcon(category)
  const IconComponent = categoryData.iconComponent
  const config = sizeConfig[size]
  
  if (!IconComponent) {
    return null
  }

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-full transition-colors duration-200',
    config.container,
    {
      'cursor-pointer hover:scale-105 active:scale-95': interactive,
      'hover:shadow-md': interactive && variant === 'solid',
    },
    className
  )
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: categoryData.borderColor,
          borderWidth: '1px',
          color: categoryData.color,
        }
      case 'solid':
        return {
          backgroundColor: categoryData.color,
          color: 'white',
        }
      case 'subtle':
        return {
          backgroundColor: categoryData.bgColor,
          color: categoryData.color,
        }
      default:
        return {
          backgroundColor: categoryData.bgColor,
          border: `1px solid ${categoryData.borderColor}20`,
          color: categoryData.color,
        }
    }
  }
  
  const iconElement = (
    <div
      className={baseClasses}
      style={getVariantStyles()}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={ariaLabel || `${categoryData.label} category`}
      title={categoryData.description}
      {...props}
    >
      <IconComponent 
        size={config.size}
        aria-hidden={true}
      />
    </div>
  )

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        {iconElement}
        <span className={cn(config.text, 'font-medium text-foreground')}>
          {categoryData.label}
        </span>
      </div>
    )
  }

  return iconElement
}

// Export category types and utilities
export { getAllCategories as foodCategories, getCategoryIcon, getCategoryList } from '@/lib/icons/food-categories'

// Helper function to get category label
export const getFoodCategoryLabel = (category: FoodCategory | string) => {
  const categoryData = getCategoryIcon(category)
  return categoryData.label
}