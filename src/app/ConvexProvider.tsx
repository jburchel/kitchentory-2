'use client'

import { ReactNode } from 'react'
import { ConvexProvider as ConvexProviderBase } from 'convex/react'
import { ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderBase client={convex}>
      {children}
    </ConvexProviderBase>
  )
}