'use client'

import { ShoppingListDashboard } from '@/components/shopping-lists/ShoppingListDashboard';
import { ClientOnly } from '@/components/ui/client-only';

export default function ShoppingListsPage() {
  return (
    <ClientOnly fallback={<div className="flex items-center justify-center h-96">Loading...</div>}>
      <ShoppingListDashboard />
    </ClientOnly>
  );
}