'use client'

import React from 'react'
import { InventoryDashboard } from '@/components/inventory'

export default function InventoryPage() {
  // In real implementation, this would come from the user's current household context
  const householdId = 'mock-household-id'

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <InventoryDashboard householdId={householdId} />
    </div>
  )
}