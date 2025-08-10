'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingListDetail } from '@/components/shopping-lists'
import { useShoppingLists } from '@/hooks/useShoppingLists'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

export default function ShoppingListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string
  
  // In real implementation, this would come from the user's current household context
  // For now, don't pass invalid household ID - let hook handle fallback to mock data
  const householdId = undefined
  
  const {
    lists,
    loading,
    updateList,
    addItemToList,
    updateItem,
    removeItem,
    toggleItemComplete,
    reorderItems,
    getListById
  } = useShoppingLists(householdId)

  const list = getListById(listId)

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">Shopping List Not Found</h2>
              <p className="text-sm mb-6">
                The shopping list you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/shopping-lists')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shopping Lists
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/shopping-lists')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping Lists
        </Button>
      </div>

      {/* List Detail */}
      <ShoppingListDetail
        list={list}
        onUpdateList={updateList}
        onAddItem={addItemToList}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onToggleItemComplete={toggleItemComplete}
        onReorderItems={reorderItems}
        loading={loading}
      />
    </div>
  )
}