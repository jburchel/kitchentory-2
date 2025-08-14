'use client'

import React, { useState, useEffect } from 'react'
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard'
import { AppLayout } from '@/components/layout/AppLayout'

// Disable static generation to prevent SSR issues with Convex hooks
export const dynamic = 'force-dynamic'

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false)
  // Use a mock household ID for development/demo purposes
  const householdId = 'household-1'
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <InventoryDashboard householdId={householdId} />
      </div>
    </AppLayout>
  )
}