'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true,
  redirectTo = '/auth/sign-in' 
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && requireAuth && !isSignedIn) {
      router.push(redirectTo)
    }
  }, [isLoaded, isSignedIn, requireAuth, redirectTo, router])

  // Show loading while auth is loading
  if (!isLoaded) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If auth is required but user is not signed in, show fallback or nothing
  if (requireAuth && !isSignedIn) {
    return fallback || null
  }

  return <>{children}</>
}

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  roles?: string[]
  permissions?: string[]
}

export function AuthGuard({ children, fallback, roles, permissions }: AuthGuardProps) {
  const { isLoaded, isSignedIn, sessionClaims } = useAuth()

  if (!isLoaded) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isSignedIn) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500">You must be signed in to access this content.</p>
      </div>
    )
  }

  // Check roles if specified
  if (roles && roles.length > 0) {
    const userRoles = (sessionClaims as any)?.roles || []
    const hasRole = roles.some(role => userRoles.includes(role))
    
    if (!hasRole) {
      return fallback || (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have permission to access this content.</p>
        </div>
      )
    }
  }

  // Check permissions if specified
  if (permissions && permissions.length > 0) {
    const userPermissions = (sessionClaims as any)?.permissions || []
    const hasPermission = permissions.some(permission => userPermissions.includes(permission))
    
    if (!hasPermission) {
      return fallback || (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have the required permissions.</p>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    redirectTo?: string
    roles?: string[]
    permissions?: string[]
  } = {}
) {
  const { requireAuth = true, redirectTo = '/auth/sign-in', roles, permissions } = options

  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth={requireAuth} redirectTo={redirectTo}>
        <AuthGuard roles={roles} permissions={permissions}>
          <WrappedComponent {...props} />
        </AuthGuard>
      </ProtectedRoute>
    )
  }
}