import { z } from 'zod';

export const shoppingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Item name too long'),
  quantity: z.number().min(0.1, 'Quantity must be greater than 0').max(999, 'Quantity too large'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().max(500, 'Notes too long').optional(),
  estimatedPrice: z.number().min(0).max(9999).optional(),
});

export const createShoppingListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'List name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isTemplate: z.boolean().default(false),
  items: z.array(shoppingItemSchema).default([]),
  storeLayout: z.array(z.object({
    name: z.string(),
    order: z.number(),
    categories: z.array(z.string()),
  })).optional(),
});

export const updateShoppingItemSchema = z.object({
  quantity: z.number().min(0.1).max(999).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().max(500).optional(),
  estimatedPrice: z.number().min(0).max(9999).optional(),
  completed: z.boolean().optional(),
});

export const shareShoppingListSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email required'),
  permissions: z.enum(['view', 'edit']).default('view'),
  message: z.string().max(500).optional(),
});

export type CreateShoppingListData = z.infer<typeof createShoppingListSchema>;
export type ShoppingItemData = z.infer<typeof shoppingItemSchema>;
export type UpdateShoppingItemData = z.infer<typeof updateShoppingItemSchema>;
export type ShareShoppingListData = z.infer<typeof shareShoppingListSchema>;