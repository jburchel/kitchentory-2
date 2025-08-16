'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { RecipeDashboard } from '@/components/recipes/RecipeDashboard'

export const dynamic = 'force-dynamic'

export default function RecipesPage() {
  const [mounted, setMounted] = useState(false)
  const householdId = 'household-1' // Mock household ID
  
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
        <RecipeDashboard householdId={householdId} />
      </div>
    </AppLayout>
  )
}