'use client'

import { ConvexProvider as ConvexReactProvider } from 'convex/react'
import { ReactNode } from 'react'
import { convex } from '@/lib/convex'

interface ConvexProviderProps {
  children: ReactNode
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}
