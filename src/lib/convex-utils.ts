import type { Id } from "@/convex/_generated/dataModel"

/**
 * Type-safe ID conversion utility for Convex IDs
 */
export function toConvexId<T extends string>(id: string): Id<T> {
  return id as Id<T>
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format dates for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365

  if (diff < minute) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < week) return `${Math.floor(diff / day)}d ago`
  if (diff < month) return `${Math.floor(diff / week)}w ago`
  if (diff < year) return `${Math.floor(diff / month)}mo ago`
  return `${Math.floor(diff / year)}y ago`
}

/**
 * Check if a date is expired
 */
export function isExpired(timestamp?: number): boolean {
  return timestamp ? timestamp < Date.now() : false
}

/**
 * Check if a date is expiring soon (within specified days)
 */
export function isExpiringSoon(timestamp?: number, daysAhead = 7): boolean {
  if (!timestamp) return false
  const futureDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000
  return timestamp <= futureDate && timestamp > Date.now()
}

/**
 * Get expiration status with color coding
 */
export function getExpirationStatus(timestamp?: number): {
  status: 'expired' | 'expiring' | 'fresh'
  color: 'red' | 'yellow' | 'green'
  text: string
} {
  if (!timestamp) {
    return { status: 'fresh', color: 'green', text: 'No expiration' }
  }

  if (isExpired(timestamp)) {
    return { status: 'expired', color: 'red', text: 'Expired' }
  }

  if (isExpiringSoon(timestamp)) {
    return { status: 'expiring', color: 'yellow', text: 'Expiring soon' }
  }

  return { status: 'fresh', color: 'green', text: 'Fresh' }
}

/**
 * Calculate days until expiration
 */
export function daysUntilExpiration(timestamp?: number): number | null {
  if (!timestamp) return null
  const diff = timestamp - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      'NEXT_PUBLIC_CONVEX_URL is required. Please check your environment variables.'
    )
  }
}

/**
 * Generate search keywords from product data
 */
export function generateSearchKeywords(product: {
  name: string
  brand?: string
  description?: string
  tags?: string[]
}): string[] {
  const keywords = new Set<string>()

  // Add words from name
  product.name
    .toLowerCase()
    .split(/\s+/)
    .forEach(word => {
      if (word.length > 2) keywords.add(word)
    })

  // Add words from brand
  if (product.brand) {
    product.brand
      .toLowerCase()
      .split(/\s+/)
      .forEach(word => {
        if (word.length > 2) keywords.add(word)
      })
  }

  // Add words from description
  if (product.description) {
    product.description
      .toLowerCase()
      .split(/\s+/)
      .forEach(word => {
        if (word.length > 2) keywords.add(word)
      })
  }

  // Add tags
  if (product.tags) {
    product.tags.forEach(tag => {
      keywords.add(tag.toLowerCase())
    })
  }

  return Array.from(keywords)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
