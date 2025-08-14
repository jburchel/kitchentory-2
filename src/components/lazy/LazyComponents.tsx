/**
 * Lazy Loading Components
 * Dynamic imports for better code splitting and performance
 */

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Loading component for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Error component for failed lazy loads
const ErrorFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <p className="text-muted-foreground">Failed to load component</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>
  </div>
)

// Common lazy loading options
const defaultOptions = {
  loading: LoadingFallback,
  ssr: false, // Disable SSR for lazy components to reduce initial bundle
}

// Inventory Management Components
export const LazyInventoryDashboard = dynamic(
  () => import('@/components/inventory/InventoryDashboard'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    ),
  }
)

export const LazyInventoryList = dynamic(
  () => import('@/components/inventory/InventoryList'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    ),
  }
)

export const LazyInventoryForm = dynamic(
  () => import('@/components/inventory/InventoryForm'),
  defaultOptions
)

// Shopping List Components
export const LazyShoppingList = dynamic(
  () => import('@/components/shopping/ShoppingList'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    ),
  }
)

export const LazyShoppingForm = dynamic(
  () => import('@/components/shopping/ShoppingForm'),
  defaultOptions
)

// Recipe Components
export const LazyRecipeList = dynamic(
  () => import('@/components/recipes/RecipeList'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded" />
        ))}
      </div>
    ),
  }
)

export const LazyRecipeDetail = dynamic(
  () => import('@/components/recipes/RecipeDetail'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded" />
        <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    ),
  }
)

// Analytics Components
export const LazyAnalytics = dynamic(
  () => import('@/components/analytics/Analytics'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    ),
  }
)

// Chart Components
export const LazyCharts = dynamic(
  () => import('@/components/charts/Charts'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
)

// Settings Components
export const LazySettings = dynamic(
  () => import('@/components/settings/Settings'),
  defaultOptions
)

export const LazyProfile = dynamic(
  () => import('@/components/profile/Profile'),
  defaultOptions
)

// Calendar Components
export const LazyCalendar = dynamic(
  () => import('@/components/calendar/Calendar'),
  {
    ...defaultOptions,
    loading: () => (
      <div className="h-96 bg-muted animate-pulse rounded flex items-center justify-center">
        <span className="text-muted-foreground">Loading calendar...</span>
      </div>
    ),
  }
)

// Export Components
export const LazyExportDialog = dynamic(
  () => import('@/components/export/ExportDialog'),
  defaultOptions
)

// Notification Components
export const LazyNotificationCenter = dynamic(
  () => import('@/components/notifications/NotificationCenter'),
  defaultOptions
)

// Help Components
export const LazyHelpCenter = dynamic(
  () => import('@/components/help/HelpCenter'),
  defaultOptions
)

// Advanced lazy loading with retry mechanism
export function createLazyComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: ComponentType
    maxRetries?: number
    retryDelay?: number
  } = {}
) {
  const { fallback = LoadingFallback, maxRetries = 3, retryDelay = 1000 } = options

  return dynamic(
    async () => {
      let lastError: Error | null = null
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const component = await importFn()
          return component
        } catch (error) {
          lastError = error as Error
          
          if (attempt < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          }
        }
      }
      
      // If all retries failed, return error component
      throw lastError
    },
    {
      loading: fallback,
      ssr: false,
    }
  )
}

// Preload utility for critical lazy components
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  // Only preload in browser
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        componentLoader().catch(() => {
          // Silently fail preloading
        })
      })
    } else {
      setTimeout(() => {
        componentLoader().catch(() => {
          // Silently fail preloading
        })
      }, 1)
    }
  }
}

// Preload critical components
if (typeof window !== 'undefined') {
  // Preload inventory components (most likely to be used)
  preloadComponent(() => import('@/components/inventory/InventoryDashboard'))
  preloadComponent(() => import('@/components/inventory/InventoryList'))
  
  // Preload shopping components
  preloadComponent(() => import('@/components/shopping/ShoppingList'))
}

export default {
  LazyInventoryDashboard,
  LazyInventoryList,
  LazyInventoryForm,
  LazyShoppingList,
  LazyShoppingForm,
  LazyRecipeList,
  LazyRecipeDetail,
  LazyAnalytics,
  LazyCharts,
  LazySettings,
  LazyProfile,
  LazyCalendar,
  LazyExportDialog,
  LazyNotificationCenter,
  LazyHelpCenter,
}