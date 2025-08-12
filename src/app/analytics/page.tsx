'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  const { analyticsData, loading, error, refreshAnalytics } = useAnalytics()

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Insights into your household's consumption patterns and spending
              </p>
            </div>
            
            <Button 
              onClick={refreshAnalytics}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
          
          <AnalyticsDashboard
            analyticsData={analyticsData}
            loading={loading}
            error={error}
            onRefresh={refreshAnalytics}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}