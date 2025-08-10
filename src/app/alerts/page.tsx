import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AlertDashboard } from '@/components/alerts/AlertDashboard'

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <AlertDashboard />
      </AppLayout>
    </ProtectedRoute>
  )
}
