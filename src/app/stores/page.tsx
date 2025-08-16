'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StoreSelectionDashboard } from '../../components/stores/StoreSelectionDashboard'
import { ShoppingCartSync } from '../../components/stores/ShoppingCartSync'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default function StoresPage() {
  const householdId = 'household-1' // Mock household ID

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Store Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite grocery stores for automated shopping and inventory management
          </p>
        </div>

        <Tabs defaultValue="connections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connections">Store Connections</TabsTrigger>
            <TabsTrigger value="sync">Shopping Cart Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <StoreSelectionDashboard 
              householdId={householdId}
              onStoreConnected={(connection) => {
                console.log('Store connected:', connection)
              }}
            />
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <ShoppingCartSync 
              shoppingListId="list-1"
              householdId={householdId}
            />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}