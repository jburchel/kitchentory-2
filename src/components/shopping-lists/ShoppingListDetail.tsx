'use client';

import { useState } from 'react';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { useShopping } from '@/hooks/useShopping';
import { AddItemForm } from './AddItemForm';
import { ShoppingItemRow } from './ShoppingItemRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ShoppingListDetailProps {
  listId: string;
  onBack?: () => void;
}

export function ShoppingListDetail({ listId, onBack }: ShoppingListDetailProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'added' | 'priority' | 'category' | 'name'>('added');
  
  const { 
    shoppingLists, 
    loading, 
    error, 
    toggleItemCompletion, 
    deleteItem,
    getSmartSuggestions 
  } = useShopping();

  const list = shoppingLists.find(l => l.id === listId);

  if (!list) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Shopping list not found</div>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back to Lists
          </Button>
        )}
      </div>
    );
  }

  const filteredItems = list.items.filter(item => {
    switch (viewMode) {
      case 'pending': return !item.completed;
      case 'completed': return item.completed;
      default: return true;
    }
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'category':
        return a.category.localeCompare(b.category);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'added':
      default:
        return b.addedAt.getTime() - a.addedAt.getTime();
    }
  });

  const suggestions = getSmartSuggestions(listId);
  const completionPercentage = list.items.length > 0 
    ? Math.round((list.completedItemsCount / list.items.length) * 100)
    : 0;

  const pendingItems = list.items.filter(item => !item.completed);
  const highPriorityPending = pendingItems.filter(item => item.priority === 'high');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            {list.description && (
              <p className="text-gray-600 mt-1">{list.description}</p>
            )}
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              ← Back to Lists
            </Button>
          )}
        </div>

        {/* List Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{list.items.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{list.completedItemsCount}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingItems.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ${list.totalEstimatedCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completionPercentage}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* High Priority Alert */}
        {highPriorityPending.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">
                {highPriorityPending.length} high priority item{highPriorityPending.length !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={showAddItem ? 'default' : 'outline'}
            onClick={() => setShowAddItem(!showAddItem)}
          >
            {showAddItem ? 'Hide' : 'Add Item'}
          </Button>
          
          {suggestions.length > 0 && (
            <Button variant="outline" size="sm">
              Smart Suggestions ({suggestions.length})
            </Button>
          )}
        </div>

        <div className="flex gap-2 ml-auto">
          {/* View Filter */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Items ({list.items.length})</option>
            <option value="pending">Pending ({pendingItems.length})</option>
            <option value="completed">Completed ({list.completedItemsCount})</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="added">Sort by Added</option>
            <option value="priority">Sort by Priority</option>
            <option value="category">Sort by Category</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddItem && (
        <Card className="p-6 mb-6">
          <AddItemForm
            listId={listId}
            suggestions={suggestions}
            onSuccess={() => setShowAddItem(false)}
            onCancel={() => setShowAddItem(false)}
          />
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onToggleComplete={toggleItemCompletion}
              onDelete={deleteItem}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {viewMode === 'all' ? 'No items in this list' : 
               viewMode === 'pending' ? 'All items completed!' : 'No completed items yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {viewMode === 'all' ? 'Add some items to get started' : 
               viewMode === 'pending' ? 'Great job finishing your shopping!' : 'Items you complete will appear here'}
            </p>
            {viewMode === 'all' && (
              <Button onClick={() => setShowAddItem(true)}>
                Add Your First Item
              </Button>
            )}
          </div>
        )}
      </div>

      {/* List Metadata */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          Created {formatDistanceToNow(list.createdAt, { addSuffix: true })} • 
          Last updated {formatDistanceToNow(list.updatedAt, { addSuffix: true })}
        </p>
        {list.isShared && list.sharedWith.length > 0 && (
          <p className="mt-1">
            Shared with {list.sharedWith.length} member{list.sharedWith.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}