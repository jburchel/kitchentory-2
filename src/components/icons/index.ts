// Export all icon components and utilities
export { default as CategoryIcon } from './CategoryIcon'
export type { IconSize, IconVariant } from './CategoryIcon'

export {
  CategoryIconXS,
  CategoryIconSM,
  CategoryIconMD,
  CategoryIconLG,
  CategoryIconXL
} from './CategoryIcon'

export { default as CategoryFilter, CategorySelector } from './CategoryFilter'

// Re-export category utilities
export {
  FOOD_CATEGORIES,
  getCategoryFromString,
  getCategoryIcon,
  getAllCategories,
  getCategoryList,
  type FoodCategory,
  type CategoryIcon as CategoryIconData
} from '@/lib/icons/food-categories'