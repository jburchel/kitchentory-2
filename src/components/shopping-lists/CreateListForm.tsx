'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createShoppingListSchema, type CreateShoppingListData } from '@/schemas/shopping';
import { useShopping } from '@/hooks/useShopping';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CreateListFormProps {
  onSuccess?: (listId: string) => void;
  onCancel?: () => void;
}

export function CreateListForm({ onSuccess, onCancel }: CreateListFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createShoppingList } = useShopping();
  
  const form = useForm<CreateShoppingListData>({
    resolver: zodResolver(createShoppingListSchema),
    defaultValues: {
      name: '',
      description: '',
      isTemplate: false,
      items: [],
    },
  });

  const onSubmit = async (data: CreateShoppingListData) => {
    setIsSubmitting(true);
    try {
      const newList = await createShoppingList({
        ...data,
        householdId: 'current-household', // TODO: Get from context
        createdBy: 'current-user', // TODO: Get from auth
        isShared: false,
        sharedWith: [],
        status: 'active',
      });
      form.reset();
      onSuccess?.(newList.id);
    } catch (error) {
      console.error('Failed to create shopping list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Shopping List</h2>
          <p className="text-gray-600">Start a new shopping list for your household</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              List Name *
            </label>
            <input
              type="text"
              id="name"
              {...form.register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="e.g., Weekly Groceries, Party Supplies"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...form.register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Optional description for this list"
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTemplate"
              {...form.register('isTemplate')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isTemplate" className="ml-2 block text-sm text-gray-700">
              Save as template for future use
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create List'}
          </Button>
        </div>
      </form>
    </Card>
  );
}