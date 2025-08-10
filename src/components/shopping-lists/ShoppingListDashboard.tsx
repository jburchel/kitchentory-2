'use client';

import { useState } from 'react';
import { useShopping } from '@/hooks/useShopping';
import { CreateListForm } from './CreateListForm';
import { ShoppingListCard } from './ShoppingListCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ShoppingListDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lists' | 'create'>('overview');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { 
    shoppingLists, 
    stats, 
    loading, 
    error, 
    deleteShoppingList, 
    shareShoppingList 
  } = useShopping();

  const handleViewList = (listId: string) => {
    setSelectedListId(listId);
    // TODO: Navigate to detailed list view
  };

  const handleEditList = (listId: string) => {
    setSelectedListId(listId);
    // TODO: Open edit modal or navigate to edit view
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      try {
        await deleteShoppingList(listId);
      } catch (error) {
        console.error('Failed to delete shopping list:', error);
      }
    }
  };

  const handleShareList = async (listId: string) => {
    // TODO: Open share modal
    console.log('Share list:', listId);
  };

  const handleCreateSuccess = (listId: string) => {
    setActiveTab('lists');
    setSelectedListId(listId);
  };

  if (loading && shoppingLists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shopping lists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Lists</h1>
        <p className="text-gray-600">Organize your shopping with smart lists and suggestions</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', count: stats.totalLists },
            { id: 'lists', label: 'My Lists', count: stats.activeLists },
            { id: 'create', label: 'Create New' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.totalLists}</div>
                <div className="text-sm text-gray-600">Total Lists</div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeLists}</div>
                <div className="text-sm text-gray-600">Active Lists</div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">${stats.totalEstimatedCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Estimated Cost</div>
              </div>
            </Card>
          </div>

          {/* Completion Rate */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Completion Rate</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{stats.completedItems} completed</span>
                  <span>{stats.totalItems} total items</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.completionRate}%
              </div>
            </div>
          </Card>

          {/* Recent Lists */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Lists</h3>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('lists')}
              >
                View All Lists
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shoppingLists.slice(0, 3).map((list) => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onView={handleViewList}
                  onEdit={handleEditList}
                  onDelete={handleDeleteList}
                  onShare={handleShareList}
                />
              ))}
            </div>

            {shoppingLists.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No shopping lists yet</h3>
                <p className="text-gray-600 mb-4">Create your first shopping list to get started</p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Your First List
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lists' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">All Shopping Lists</h3>
            <Button onClick={() => setActiveTab('create')}>
              Create New List
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onView={handleViewList}
                onEdit={handleEditList}
                onDelete={handleDeleteList}
                onShare={handleShareList}
              />
            ))}
          </div>

          {shoppingLists.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shopping lists yet</h3>
              <p className="text-gray-600 mb-4">Create your first shopping list to get started</p>
              <Button onClick={() => setActiveTab('create')}>
                Create Your First List
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div>
          <CreateListForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setActiveTab('overview')}
          />
        </div>
      )}
    </div>
  );
}