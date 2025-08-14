'use client'

import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AlertDashboard } from '@/components/alerts/AlertDashboard'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false)

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
    <ProtectedRoute>
      <AppLayout>
        <AlertDashboard />
      </AppLayout>
    </ProtectedRoute>
  )
}
