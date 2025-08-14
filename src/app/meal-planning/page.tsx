'use client'

import React, { useState, useEffect } from 'react'
import { MealPlanning } from '@/components/meal-planning/MealPlanning'
import { AppLayout } from '@/components/layout/AppLayout'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function MealPlanningPage() {
  const [mounted, setMounted] = useState(false)
  // In a real implementation, we would get the household ID from context or props
  const householdId = 'household-1' // Mock for now

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
        <MealPlanning householdId={householdId} />
      </div>
    </AppLayout>
  )
}