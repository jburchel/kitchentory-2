'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { MealPlanning } from '@/components/meal-planning/MealPlanning'

export default function MealPlanningPage() {
  // In a real implementation, we would get the household ID from context or props
  const householdId = 'household-1' // Mock for now

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <MealPlanning householdId={householdId} />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}