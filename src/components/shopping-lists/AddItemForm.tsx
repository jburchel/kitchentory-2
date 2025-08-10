'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shoppingItemSchema, type ShoppingItemData } from '@/schemas/shopping';
import { useShopping } from '@/hooks/useShopping';
import { Button } from '@/components/ui/button';
import { FOOD_CATEGORIES } from '@/components/inventory/AddItemForm';

interface AddItemFormProps {
  listId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  suggestions?: Array<{ itemName: string; category: string; reason: string }>;
}

const UNITS = [
  'pieces', 'lbs', 'oz', 'kg', 'g', 'gallons', 'liters', 'ml',
  'cups', 'tbsp', 'tsp', 'cans', 'bottles', 'boxes', 'bags',
  'bunches', 'loaves', 'dozen', 'packs'
];

export function AddItemForm({ listId, onSuccess, onCancel, suggestions = [] }: AddItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addItemToList } = useShopping();
  
  const form = useForm<ShoppingItemData>({
    resolver: zodResolver(shoppingItemSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      unit: 'pieces',
      category: 'produce',
      priority: 'medium',
      notes: '',
      estimatedPrice: undefined,
    },
  });

  const onSubmit = async (data: ShoppingItemData) => {
    setIsSubmitting(true);
    try {
      await addItemToList(listId, {
        ...data,
        addedBy: 'current-user', // TODO: Get from auth
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySuggestion = (suggestion: { itemName: string; category: string }) => {
    form.setValue('name', suggestion.itemName);
    form.setValue('category', suggestion.category);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Smart Suggestions</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showSuggestions ? 'Hide' : 'Show'} ({suggestions.length})
            </Button>
          </div>
          {showSuggestions && (
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors text-left"
                >
                  <div>
                    <span className="font-medium text-gray-900">{suggestion.itemName}</span>
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {suggestion.reason.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {FOOD_CATEGORIES[suggestion.category as keyof typeof FOOD_CATEGORIES]?.label || suggestion.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              {...form.register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Bananas, Milk, Bread"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              step="0.1"
              {...form.register('quantity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {form.formState.errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              id="unit"
              {...form.register('unit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {form.formState.errors.unit && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.unit.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              {...form.register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              {...form.register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            {form.formState.errors.priority && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.priority.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Price
            </label>
            <input
              type="number"
              id="estimatedPrice"
              step="0.01"
              {...form.register('estimatedPrice', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
            {form.formState.errors.estimatedPrice && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.estimatedPrice.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              {...form.register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Optional notes (brand, size, etc.)"
            />
            {form.formState.errors.notes && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </form>
    </div>
  );
}