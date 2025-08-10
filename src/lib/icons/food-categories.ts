import React from 'react'
import { 
  ProduceIcon, 
  ProteinIcon, 
  DairyIcon, 
  GrainsIcon, 
  BeveragesIcon, 
  FrozenIcon, 
  PantryIcon, 
  HouseholdIcon,
  type IconProps
} from '@/components/icons/svg'

export type FoodCategory = 
  | 'produce' 
  | 'protein' 
  | 'dairy' 
  | 'grains' 
  | 'beverages' 
  | 'frozen' 
  | 'pantry' 
  | 'household'
  | 'unknown'

export interface CategoryIcon {
  /** @deprecated Use iconComponent instead */
  emoji: string
  /** SVG icon component following brandbook specifications */
  iconComponent: React.ComponentType<IconProps>
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

// Fallback icon for unknown categories
const UnknownIcon: React.FC<IconProps> = ({ className, size = 24, ...props }) => {
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    ...props
  }, [
    React.createElement('rect', {
      key: 'rect',
      x: "3",
      y: "3", 
      width: "18",
      height: "18",
      rx: "2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('path', {
      key: 'path',
      d: "M9 9H15M9 12H12M9 15H15",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    })
  ])
}

export const FOOD_CATEGORIES: Record<FoodCategory, CategoryIcon> = {
  produce: {
    emoji: '🥕', // Deprecated - kept for backward compatibility
    iconComponent: ProduceIcon,
    label: 'Produce',
    description: 'Fresh fruits and vegetables',
    color: '#22C55E', // green-500 (brand specification)
    bgColor: '#dcfce7', // green-100
    borderColor: '#22C55E', // green-500 (brand specification)
  },
  protein: {
    emoji: '🥩', // Deprecated - kept for backward compatibility
    iconComponent: ProteinIcon,
    label: 'Protein',
    description: 'Meat, fish, eggs, and protein sources',
    color: '#A855F7', // purple-500 (brand specification)
    bgColor: '#faf5ff', // purple-50
    borderColor: '#A855F7', // purple-500 (brand specification)
  },
  dairy: {
    emoji: '🥛', // Deprecated - kept for backward compatibility
    iconComponent: DairyIcon,
    label: 'Dairy',
    description: 'Milk, cheese, yogurt, and dairy products',
    color: '#3B82F6', // blue-500 (brand specification)
    bgColor: '#eff6ff', // blue-50
    borderColor: '#3B82F6', // blue-500 (brand specification)
  },
  grains: {
    emoji: '🍞', // Deprecated - kept for backward compatibility
    iconComponent: GrainsIcon,
    label: 'Grains',
    description: 'Bread, pasta, rice, and grain products',
    color: '#EAB308', // yellow-500 (brand specification)
    bgColor: '#fef3c7', // yellow-100
    borderColor: '#EAB308', // yellow-500 (brand specification)
  },
  beverages: {
    emoji: '🥤', // Deprecated - kept for backward compatibility
    iconComponent: BeveragesIcon,
    label: 'Beverages',
    description: 'Water, juice, soda, and drinks',
    color: '#06B6D4', // cyan-500 (brand specification)
    bgColor: '#cffafe', // cyan-100
    borderColor: '#06B6D4', // cyan-500 (brand specification)
  },
  frozen: {
    emoji: '❄️', // Deprecated - kept for backward compatibility
    iconComponent: FrozenIcon,
    label: 'Frozen',
    description: 'Frozen foods and ice products',
    color: '#0EA5E9', // sky-500 (brand specification)
    bgColor: '#f0f9ff', // sky-50
    borderColor: '#0EA5E9', // sky-500 (brand specification)
  },
  pantry: {
    emoji: '🥫', // Deprecated - kept for backward compatibility
    iconComponent: PantryIcon,
    label: 'Pantry',
    description: 'Canned goods, spices, and shelf-stable items',
    color: '#F97316', // orange-500 (brand specification)
    bgColor: '#fff7ed', // orange-50
    borderColor: '#F97316', // orange-500 (brand specification)
  },
  household: {
    emoji: '🧽', // Deprecated - kept for backward compatibility
    iconComponent: HouseholdIcon,
    label: 'Household',
    description: 'Cleaning supplies and household items',
    color: '#84CC16', // lime-500 (brand specification)
    bgColor: '#f7fee7', // lime-50
    borderColor: '#84CC16', // lime-500 (brand specification)
  },
  unknown: {
    emoji: '📦', // Deprecated - kept for backward compatibility
    iconComponent: UnknownIcon,
    label: 'Unknown',
    description: 'Uncategorized items',
    color: '#6b7280', // gray-500
    bgColor: '#f9fafb', // gray-50
    borderColor: '#9ca3af', // gray-400
  }
}

// Category mapping helpers
export const getCategoryFromString = (category?: string | null): FoodCategory => {
  if (!category) return 'unknown'
  
  const lowerCategory = category.toLowerCase()
  
  // Map various category names to our standard categories
  if (lowerCategory.includes('fruit') || lowerCategory.includes('vegetable') || 
      lowerCategory.includes('produce') || lowerCategory.includes('fresh')) {
    return 'produce'
  }
  
  if (lowerCategory.includes('meat') || lowerCategory.includes('fish') || 
      lowerCategory.includes('chicken') || lowerCategory.includes('beef') || 
      lowerCategory.includes('pork') || lowerCategory.includes('egg') ||
      lowerCategory.includes('protein')) {
    return 'protein'
  }
  
  if (lowerCategory.includes('milk') || lowerCategory.includes('cheese') || 
      lowerCategory.includes('yogurt') || lowerCategory.includes('dairy') ||
      lowerCategory.includes('cream') || lowerCategory.includes('butter')) {
    return 'dairy'
  }
  
  if (lowerCategory.includes('bread') || lowerCategory.includes('pasta') || 
      lowerCategory.includes('rice') || lowerCategory.includes('cereal') ||
      lowerCategory.includes('grain') || lowerCategory.includes('flour') ||
      lowerCategory.includes('bakery')) {
    return 'grains'
  }
  
  if (lowerCategory.includes('drink') || lowerCategory.includes('beverage') || 
      lowerCategory.includes('juice') || lowerCategory.includes('soda') ||
      lowerCategory.includes('water') || lowerCategory.includes('coffee') ||
      lowerCategory.includes('tea')) {
    return 'beverages'
  }
  
  if (lowerCategory.includes('frozen')) {
    return 'frozen'
  }
  
  if (lowerCategory.includes('canned') || lowerCategory.includes('spice') || 
      lowerCategory.includes('condiment') || lowerCategory.includes('sauce') ||
      lowerCategory.includes('pantry') || lowerCategory.includes('snack')) {
    return 'pantry'
  }
  
  if (lowerCategory.includes('clean') || lowerCategory.includes('household') || 
      lowerCategory.includes('paper') || lowerCategory.includes('soap') ||
      lowerCategory.includes('detergent')) {
    return 'household'
  }
  
  return 'unknown'
}

export const getCategoryIcon = (category?: string | null): CategoryIcon => {
  const mappedCategory = getCategoryFromString(category)
  return FOOD_CATEGORIES[mappedCategory]
}

export const getAllCategories = (): FoodCategory[] => {
  return Object.keys(FOOD_CATEGORIES) as FoodCategory[]
}

export const getCategoryList = (): Array<{ value: FoodCategory; icon: CategoryIcon }> => {
  return getAllCategories()
    .filter(cat => cat !== 'unknown') // Exclude unknown from user-selectable categories
    .map(category => ({
      value: category,
      icon: FOOD_CATEGORIES[category]
    }))
}