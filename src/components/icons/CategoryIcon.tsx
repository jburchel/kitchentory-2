import React from 'react'
import { cn } from '@/lib/utils'
import { getCategoryIcon, type FoodCategory } from '@/lib/icons/food-categories'
import { type IconProps } from '@/components/icons/svg'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type IconVariant = 'default' | 'outlined' | 'filled' | 'subtle'

interface CategoryIconProps {
  category: FoodCategory | string | null | undefined
  size?: IconSize
  variant?: IconVariant
  className?: string
  showLabel?: boolean
  interactive?: boolean
  onClick?: () => void
  'aria-label'?: string
}

const sizeClasses: Record<IconSize, { 
  container: string
  text: string
}> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs'
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs'
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm'
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-sm'
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-base'
  }
}

export default function CategoryIcon({
  category,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false,
  interactive = false,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: CategoryIconProps) {
  const categoryData = getCategoryIcon(category)
  const sizeConfig = sizeClasses[size]
  
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-full',
    sizeConfig.container,
    {
      // Variant styles
      'border': variant === 'outlined',
      'shadow-sm': variant === 'filled',
      
      // Interactive styles
      'cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95': interactive,
      'hover:shadow-md': interactive && variant === 'filled',
      'hover:bg-opacity-80': interactive,
    },
    className
  )
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: categoryData.borderColor,
          borderWidth: '1px',
        }
      case 'filled':
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
          border: `1px solid ${categoryData.borderColor}20`, // 20% opacity
        }
    }
  }
  
  const IconComponent = categoryData.iconComponent
  const iconSize = {
    xs: 16,
    sm: 20, 
    md: 24,
    lg: 32,
    xl: 48
  }[size]

  const iconElement = (
    <div
      className={cn(baseClasses)}
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
      aria-label={ariaLabel || `${categoryData.label} category icon`}
      title={categoryData.description}
      {...props}
    >
      <IconComponent 
        size={iconSize}
        aria-hidden={!!ariaLabel}
      />
    </div>
  )
  
  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        {iconElement}
        <span className={cn(sizeConfig.text, 'font-medium text-muted-foreground')}>
          {categoryData.label}
        </span>
      </div>
    )
  }
  
  return iconElement
}

// Export individual size variants for convenience
export const CategoryIconXS = (props: Omit<CategoryIconProps, 'size'>) => (
  <CategoryIcon {...props} size="xs" />
)

export const CategoryIconSM = (props: Omit<CategoryIconProps, 'size'>) => (
  <CategoryIcon {...props} size="sm" />
)

export const CategoryIconMD = (props: Omit<CategoryIconProps, 'size'>) => (
  <CategoryIcon {...props} size="md" />
)

export const CategoryIconLG = (props: Omit<CategoryIconProps, 'size'>) => (
  <CategoryIcon {...props} size="lg" />
)

export const CategoryIconXL = (props: Omit<CategoryIconProps, 'size'>) => (
  <CategoryIcon {...props} size="xl" />
)