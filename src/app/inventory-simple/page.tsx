'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export const dynamic = 'force-dynamic'

export default function InventorySimplePage() {
  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Simple Inventory Page</h1>
        <p>This is a simple inventory page without any complex components.</p>
        <div className="bg-green-100 p-4 rounded-lg mt-4">
          <p>If this page loads without errors, then the issue is with the InventoryDashboard component.</p>
        </div>
      </div>
    </AppLayout>
  )
}