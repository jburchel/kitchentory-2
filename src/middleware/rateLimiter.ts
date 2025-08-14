import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMITS, SECURITY_EVENTS } from '@/config/security'

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < now) {
      requestCounts.delete(key)
    }
  }
}, 60000) // Clean every minute

export function rateLimiter(
  request: NextRequest,
  isAuthenticated: boolean = false
): NextResponse | null {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const path = request.nextUrl.pathname
  
  // Determine rate limit based on path and auth status
  let limit: number
  let window: number // in milliseconds
  
  if (path.startsWith('/api/auth/login')) {
    limit = RATE_LIMITS.auth.login
    window = 15 * 60 * 1000 // 15 minutes
  } else if (path.startsWith('/api/auth/register')) {
    limit = RATE_LIMITS.auth.register
    window = 60 * 60 * 1000 // 1 hour
  } else if (path.startsWith('/api/auth/reset')) {
    limit = RATE_LIMITS.auth.passwordReset
    window = 60 * 60 * 1000 // 1 hour
  } else if (path.startsWith('/api/')) {
    limit = isAuthenticated 
      ? RATE_LIMITS.api.authenticated 
      : RATE_LIMITS.api.unauthenticated
    window = 60 * 1000 // 1 minute
  } else {
    // No rate limiting for regular pages
    return null
  }
  
  const key = `${ip}:${path}`
  const now = Date.now()
  const resetTime = now + window
  
  const current = requestCounts.get(key)
  
  if (!current || current.resetTime < now) {
    // First request or window expired
    requestCounts.set(key, { count: 1, resetTime })
    return null
  }
  
  if (current.count >= limit) {
    // Rate limit exceeded
    console.warn(`Rate limit exceeded for ${key}`, {
      event: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      ip,
      path,
      count: current.count,
      limit,
    })
    
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
        },
      }
    )
  }
  
  // Increment counter
  current.count++
  requestCounts.set(key, current)
  
  return null
}

// Rate limiting for specific operations
export class OperationRateLimiter {
  private attempts = new Map<string, number[]>()
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      timestamp => timestamp > now - this.windowMs
    )
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    
    return true
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
  
  getRemainingAttempts(identifier: string): number {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || []
    const validAttempts = userAttempts.filter(
      timestamp => timestamp > now - this.windowMs
    )
    
    return Math.max(0, this.maxAttempts - validAttempts.length)
  }
}