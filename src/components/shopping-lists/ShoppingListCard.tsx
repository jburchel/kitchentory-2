'use client';

import { ShoppingList } from '@/types/shopping';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ShoppingListCardProps {
  list: ShoppingList;
  onView?: (listId: string) => void;
  onEdit?: (listId: string) => void;
  onDelete?: (listId: string) => void;
  onShare?: (listId: string) => void;
}

export function ShoppingListCard({ list, onView, onEdit, onDelete, onShare }: ShoppingListCardProps) {
  const completionPercentage = list.items.length > 0 
    ? Math.round((list.completedItemsCount / list.items.length) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityItems = () => {
    const highPriorityCount = list.items.filter(item => item.priority === 'high' && !item.completed).length;
    const mediumPriorityCount = list.items.filter(item => item.priority === 'medium' && !item.completed).length;
    return { high: highPriorityCount, medium: mediumPriorityCount };
  };

  const { high, medium } = getPriorityItems();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(list.status)}`}>
              {list.status}
            </span>
            {list.isShared && (
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                Shared
              </span>
            )}
          </div>
          {list.description && (
            <p className="text-sm text-gray-600 mb-2">{list.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{list.completedItemsCount} of {list.items.length} items completed</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Priority Items */}
        {(high > 0 || medium > 0) && (
          <div className="flex gap-4 text-sm">
            {high > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">{high} high priority</span>
              </div>
            )}
            {medium > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">{medium} medium priority</span>
              </div>
            )}
          </div>
        )}

        {/* Cost Estimate */}
        {list.totalEstimatedCost > 0 && (
          <div className="text-sm text-gray-600">
            Estimated cost: <span className="font-medium">${list.totalEstimatedCost.toFixed(2)}</span>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500">
          Updated {formatDistanceToNow(list.updatedAt, { addSuffix: true })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(list.id)}
          className="flex-1"
        >
          View List
        </Button>
        {list.status === 'active' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(list.id)}
          >
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShare?.(list.id)}
        >
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete?.(list.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}