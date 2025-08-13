import { ConvexReactClient } from 'convex/react'

// Create a safe Convex client that handles missing environment variables  
export const convex = (() => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.warn('NEXT_PUBLIC_CONVEX_URL environment variable is not set. Convex features will be disabled.')
    return null
  }

  try {
    return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  } catch (error) {
    console.error('Failed to initialize Convex client:', error)
    return null
  }
})()

export default convex
