import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { rateLimiter } from '@/middleware/rateLimiter'
import { generateCSRFToken } from '@/config/security'

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)', 
  '/auth/forgot-password(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/offline',
  '/manifest.json',
  '/service-worker.js',
  // Temporarily allow these routes for testing
  ...(process.env.NODE_ENV === 'development' ? [
    '/dashboard(.*)',
    '/inventory(.*)',
    '/shopping-lists(.*)', 
    '/analytics(.*)',
    '/alerts(.*)',
    '/meal-planning(.*)',
    '/onboarding(.*)',
    '/stores(.*)',
    '/recipes(.*)',
    '/debug(.*)',
  ] : [])
])

const isApiRoute = createRouteMatcher(['/api(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const isAuthenticated = !!userId
  
  // Apply rate limiting to API routes (disabled in development)
  if (isApiRoute(req) && process.env.NODE_ENV === 'production') {
    const rateLimitResponse = rateLimiter(req, isAuthenticated)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }
  
  // Add CSRF token to response headers for state-changing requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const response = NextResponse.next()
    const csrfToken = generateCSRFToken()
    response.headers.set('X-CSRF-Token', csrfToken)
  }
  
  // For public routes, don't require authentication
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // For all other routes, authentication is required
  // This will automatically redirect to sign-in if not authenticated
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}