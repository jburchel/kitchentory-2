'use client'

import React from 'react'
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard'

export default function InventoryPage() {
  // Use a mock household ID for development/demo purposes
  const householdId = 'household-1'
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <InventoryDashboard householdId={householdId} />
    </div>
  )
}