'use client';

import { useState } from 'react';
import { ShoppingItem } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { FOOD_CATEGORIES } from '@/components/inventory/AddItemForm';
import { formatDistanceToNow } from 'date-fns';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggleComplete?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
}

export function ShoppingItemRow({ item, onToggleComplete, onDelete, onEdit }: ShoppingItemRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const category = FOOD_CATEGORIES[item.category as keyof typeof FOOD_CATEGORIES];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
      item.completed 
        ? 'bg-green-50 border-green-200 opacity-75' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      {/* Completion Checkbox */}
      <button
        onClick={() => onToggleComplete?.(item.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.completed
            ? 'bg-primary border-primary text-white'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        {item.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium truncate ${
            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {item.name}
          </h4>
          
          {/* Category Badge */}
          {category && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${category.color}`}>
              <span>{category.icon}</span>
              {category.label}
            </span>
          )}
          
          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">
            {item.quantity} {item.unit}
          </span>
          
          {item.estimatedPrice && (
            <span className="text-green-600 font-medium">
              ${item.estimatedPrice.toFixed(2)}
            </span>
          )}
          
          <span className="text-xs text-gray-500">
            Added {formatDistanceToNow(item.addedAt, { addSuffix: true })}
          </span>

          {item.completed && item.completedAt && (
            <span className="text-xs text-green-600">
              Completed {formatDistanceToNow(item.completedAt, { addSuffix: true })}
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-sm text-gray-600 mt-1 italic">
            {item.notes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onEdit && !item.completed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item.id)}
            className="text-gray-600 hover:text-gray-900"
          >
            Edit
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? '...' : 'Delete'}
          </Button>
        )}
      </div>
    </div>
  );
}