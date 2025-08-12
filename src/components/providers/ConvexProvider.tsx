'use client'

import { ConvexProvider as ConvexReactProvider } from 'convex/react'
import { ReactNode } from 'react'
import { convex } from '@/lib/convex'

interface ConvexProviderProps {
  children: ReactNode
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  // Check if Convex is properly configured
  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !convex) {
    // Render children without Convex provider if not configured
    return <>{children}</>
  }

  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}
