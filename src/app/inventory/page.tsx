'use client'

import React from 'react'
import { InventoryDashboard } from '@/components/inventory'
import { ClientOnly } from '@/components/ui/client-only'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function InventoryPage() {
  // In real implementation, this would come from the user's current household context
  const householdId = 'household-1' // Mock household ID for development

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <ClientOnly fallback={<div className="flex items-center justify-center h-96">Loading...</div>}>
            <InventoryDashboard householdId={householdId} />
          </ClientOnly>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}