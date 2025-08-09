import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)', 
  '/auth/forgot-password(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
])

const isApiRoute = createRouteMatcher(['/api(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware((auth, req) => {
  // Temporarily disable all middleware logic for debugging
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}