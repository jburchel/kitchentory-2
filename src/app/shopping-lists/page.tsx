'use client'

import { ShoppingListDashboard } from '@/components/shopping-lists/ShoppingListDashboard';
import { ClientOnly } from '@/components/ui/client-only';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ShoppingListsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <ClientOnly fallback={<div className="flex items-center justify-center h-96">Loading...</div>}>
            <ShoppingListDashboard />
          </ClientOnly>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}