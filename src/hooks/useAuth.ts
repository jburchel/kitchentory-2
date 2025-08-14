'use client'

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs'
import { useAuthContext } from '@/contexts/AuthContext'
import { AuthError, AuthResult } from '@/types/auth'
import { useState, useCallback } from 'react'

// Main auth hook that combines Clerk and our custom context
export function useAuth() {
  const clerkAuth = useClerkAuth()
  const { user: clerkUser } = useUser()
  const authContext = useAuthContext()

  return {
    // Clerk auth data
    ...clerkAuth,
    clerkUser,
    
    // Our custom auth data
    ...authContext,
    
    // Combined utilities
    isAuthenticated: clerkAuth.isSignedIn && !!authContext.user,
    userId: clerkUser?.id,
    email: clerkUser?.emailAddresses[0]?.emailAddress,
    fullName: clerkUser ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim() : null,
    initials: clerkUser ? 
      `${clerkUser.firstName?.[0] || ''}${clerkUser.lastName?.[0] || ''}`.toUpperCase() : 
      null,
  }
}

// Hook for profile management
export function useProfile() {
  const { user, clerkUser } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  
  // Mock update function for development
  const updateUserProfile = async (data: any) => {
    console.log('Mock updateUserProfile called with:', data)
    return Promise.resolve()
  }

  const updateProfile = useCallback(async (data: {
    firstName?: string
    lastName?: string
    imageUrl?: string
    phoneNumber?: string
  }): Promise<AuthResult> => {
    if (!clerkUser) {
      return { success: false, error: 'user_not_found' }
    }

    setIsUpdating(true)
    setError(null)

    try {
      // Update in Convex
      await updateUserProfile({
        clerkId: clerkUser.id,
        ...data,
      })

      // Update Clerk user (if needed for name changes)
      if (data.firstName || data.lastName) {
        await clerkUser.update({
          firstName: data.firstName || clerkUser.firstName,
          lastName: data.lastName || clerkUser.lastName,
        })
      }

      return { success: true }
    } catch (err) {
      const error = 'unknown_error' as AuthError
      setError(error)
      return { 
        success: false, 
        error,
        message: err instanceof Error ? err.message : 'Failed to update profile'
      }
    } finally {
      setIsUpdating(false)
    }
  }, [clerkUser, updateUserProfile])

  return {
    user,
    isUpdating,
    error,
    updateProfile,
  }
}

// Hook for session management
export function useSession() {
  const { sessionId, isLoaded, isSignedIn } = useAuth()
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  
  // Mock session functions for development
  const createUserSession = async (data: any) => {
    console.log('Mock createUserSession called with:', data)
    return Promise.resolve(null)
  }
  
  const endUserSession = async (data: any) => {
    console.log('Mock endUserSession called with:', data)
    return Promise.resolve()
  }

  const createSession = useCallback(async (data: {
    userId: string
    expiresAt: number
    ipAddress?: string
    userAgent?: string
  }) => {
    if (!sessionId) return null

    setIsCreatingSession(true)
    try {
      return await createUserSession({
        sessionId,
        ...data,
      })
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    } finally {
      setIsCreatingSession(false)
    }
  }, [sessionId, createUserSession])

  const endSession = useCallback(async () => {
    if (!sessionId) return

    try {
      await endUserSession({ sessionId })
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }, [sessionId, endUserSession])

  return {
    sessionId,
    isLoaded,
    isSignedIn,
    isCreatingSession,
    createSession,
    endSession,
  }
}

// Hook for household management in auth context
export function useHouseholdAuth() {
  const { 
    currentHousehold, 
    householdRole, 
    permissions, 
    switchHousehold 
  } = useAuth()

  const canManageInventory = permissions?.canManageInventory ?? false
  const canManageShoppingLists = permissions?.canManageShoppingLists ?? false
  const canManageCategories = permissions?.canManageCategories ?? false
  const canInviteMembers = permissions?.canInviteMembers ?? false
  
  const isOwner = householdRole === 'owner'
  const isAdmin = householdRole === 'admin'
  const isMember = householdRole === 'member'
  const hasAdminAccess = isOwner || isAdmin

  return {
    currentHousehold,
    householdRole,
    permissions,
    switchHousehold,
    
    // Permission checks
    canManageInventory: hasAdminAccess || canManageInventory,
    canManageShoppingLists: hasAdminAccess || canManageShoppingLists,
    canManageCategories: hasAdminAccess || canManageCategories,
    canInviteMembers: hasAdminAccess || canInviteMembers,
    
    // Role checks
    isOwner,
    isAdmin,
    isMember,
    hasAdminAccess,
  }
}

// Hook for authentication state monitoring
export function useAuthState() {
  const { isLoaded, isSignedIn, user } = useAuth()
  
  const authState = !isLoaded 
    ? 'loading' 
    : isSignedIn 
      ? 'authenticated' 
      : 'unauthenticated'

  return {
    state: authState,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
    isUnauthenticated: isLoaded && !isSignedIn,
    user,
  }
}

// Hook for redirect handling
export function useAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  
  const redirectToSignIn = useCallback((redirectUrl?: string) => {
    const url = new URL('/auth/sign-in', window.location.origin)
    if (redirectUrl) {
      url.searchParams.set('redirect_url', redirectUrl)
    }
    window.location.href = url.toString()
  }, [])

  const redirectToDashboard = useCallback(() => {
    window.location.href = '/dashboard'
  }, [])

  const redirectToOnboarding = useCallback(() => {
    window.location.href = '/onboarding'
  }, [])

  return {
    isLoaded,
    isSignedIn,
    redirectToSignIn,
    redirectToDashboard,
    redirectToOnboarding,
  }
}