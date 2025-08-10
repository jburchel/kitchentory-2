import { z } from 'zod'

// Store sections for organizing shopping lists
export const STORE_SECTIONS = {
  produce: { label: 'Produce', color: 'text-green-600 bg-green-50 border-green-200', icon: '🥬' },
  dairy: { label: 'Dairy & Eggs', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🥛' },
  meat: { label: 'Meat & Seafood', color: 'text-red-600 bg-red-50 border-red-200', icon: '🥩' },
  pantry: { label: 'Pantry & Dry Goods', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: '🏺' },
  frozen: { label: 'Frozen Foods', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: '🧊' },
  beverages: { label: 'Beverages', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: '🧃' },
  bakery: { label: 'Bakery', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🍞' },
  deli: { label: 'Deli', color: 'text-pink-600 bg-pink-50 border-pink-200', icon: '🥪' },
  household: { label: 'Household & Personal Care', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '🧽' },
  pharmacy: { label: 'Pharmacy & Health', color: 'text-teal-600 bg-teal-50 border-teal-200', icon: '💊' }
} as const

export type StoreSection = keyof typeof STORE_SECTIONS

// Priority levels for shopping list items
export const ITEM_PRIORITIES = {
  low: { label: 'Low', color: 'text-gray-600 bg-gray-50 border-gray-200' },
  medium: { label: 'Medium', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200' }
} as const

export type ItemPriority = keyof typeof ITEM_PRIORITIES

// Shopping list status
export const LIST_STATUS = {
  draft: { label: 'Draft', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '📝' },
  active: { label: 'Active', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '📋' },
  shopping: { label: 'Shopping', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🛒' },
  completed: { label: 'Completed', color: 'text-green-600 bg-green-50 border-green-200', icon: '✅' },
  archived: { label: 'Archived', color: 'text-gray-500 bg-gray-50 border-gray-300', icon: '📦' }
} as const

export type ListStatus = keyof typeof LIST_STATUS

// Shopping list item schema
export const shoppingListItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required').max(100, 'Name must be less than 100 characters'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(999, 'Quantity too large'),
  unit: z.string().min(1, 'Unit is required'),
  section: z.enum(Object.keys(STORE_SECTIONS) as [StoreSection, ...StoreSection[]], {
    required_error: 'Store section is required'
  }),
  priority: z.enum(Object.keys(ITEM_PRIORITIES) as [ItemPriority, ...ItemPriority[]]).default('medium'),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  estimatedCost: z.number().min(0, 'Cost must be positive').optional(),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional(),
  isCompleted: z.boolean().default(false),
  completedAt: z.date().optional(),
  addedBy: z.string().optional(), // User ID who added the item
  inventoryItemId: z.string().optional(), // Reference to inventory item if auto-suggested
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

// Shopping list schema
export const shoppingListSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'List name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(Object.keys(LIST_STATUS) as [ListStatus, ...ListStatus[]]).default('draft'),
  householdId: z.string().min(1, 'Household ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
  assignedTo: z.array(z.string()).default([]), // Array of user IDs
  dueDate: z.date().optional(),
  estimatedBudget: z.number().min(0, 'Budget must be positive').optional(),
  actualTotal: z.number().min(0, 'Total must be positive').optional(),
  store: z.string().max(100, 'Store name must be less than 100 characters').optional(),
  items: z.array(shoppingListItemSchema).default([]),
  isTemplate: z.boolean().default(false),
  templateName: z.string().max(100, 'Template name must be less than 100 characters').optional(),
  tags: z.array(z.string()).default([]),
  completedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

// Create shopping list form schema (without auto-generated fields)
export const createShoppingListSchema = shoppingListSchema.omit({
  id: true,
  items: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
})

// Update shopping list schema
export const updateShoppingListSchema = createShoppingListSchema.partial().extend({
  id: z.string().min(1, 'List ID is required')
})

// Add item to list schema
export const addItemToListSchema = shoppingListItemSchema.omit({
  id: true,
  isCompleted: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
})

// Update item schema
export const updateItemSchema = shoppingListItemSchema.partial().extend({
  id: z.string().min(1, 'Item ID is required')
})

// Smart suggestion schema
export const smartSuggestionSchema = z.object({
  itemName: z.string(),
  category: z.string(),
  reason: z.enum(['low_stock', 'expired', 'frequently_bought', 'seasonal', 'recipe_ingredient']),
  priority: z.enum(Object.keys(ITEM_PRIORITIES) as [ItemPriority, ...ItemPriority[]]),
  estimatedQuantity: z.number(),
  estimatedUnit: z.string(),
  inventoryItemId: z.string().optional(),
  lastPurchaseDate: z.date().optional(),
  averageConsumption: z.number().optional() // items per week
})

// Shopping list summary schema
export const shoppingListSummarySchema = z.object({
  totalLists: z.number(),
  activeLists: z.number(),
  completedThisWeek: z.number(),
  totalBudget: z.number(),
  totalSpent: z.number(),
  itemsCompleted: z.number(),
  itemsPending: z.number(),
  averageListSize: z.number(),
  mostFrequentItems: z.array(z.string()),
  topStores: z.array(z.string())
})

// Filter and sort options
export const listFilterSchema = z.object({
  status: z.enum(['all', ...Object.keys(LIST_STATUS)] as ['all', ListStatus, ...ListStatus[]]).default('all'),
  assignedToMe: z.boolean().default(false),
  createdByMe: z.boolean().default(false),
  dueSoon: z.boolean().default(false), // Due within 3 days
  hasItems: z.boolean().default(false)
})

export const listSortSchema = z.object({
  field: z.enum(['name', 'status', 'dueDate', 'createdAt', 'itemCount', 'estimatedBudget']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc')
})

// Type exports
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>
export type ShoppingList = z.infer<typeof shoppingListSchema>
export type CreateShoppingListData = z.infer<typeof createShoppingListSchema>
export type UpdateShoppingListData = z.infer<typeof updateShoppingListSchema>
export type AddItemToListData = z.infer<typeof addItemToListSchema>
export type UpdateItemData = z.infer<typeof updateItemSchema>
export type SmartSuggestion = z.infer<typeof smartSuggestionSchema>
export type ShoppingListSummary = z.infer<typeof shoppingListSummarySchema>
export type ListFilter = z.infer<typeof listFilterSchema>
export type ListSort = z.infer<typeof listSortSchema>