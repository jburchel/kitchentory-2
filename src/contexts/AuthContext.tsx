'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
// import { useQuery, useMutation } from 'convex/react'
// import { api } from "@/convex/_generated/api"
import { AuthContextData, AppUser } from '@/types/auth'
// import { Id } from "@/convex/_generated/dataModel"

const AuthContext = createContext<AuthContextData | null>(null)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded: userLoaded } = useUser()
  const { signOut: clerkSignOut, isLoaded: authLoaded } = useAuth()
  const [currentHousehold, setCurrentHousehold] = useState<string | undefined>()

  // Temporarily disable Convex queries for build
  // const convexUser = useQuery(
  //   api.users.getUserByClerkId,
  //   clerkUser ? { clerkId: clerkUser.id } : 'skip'
  // )

  // const userWithHouseholds = useQuery(
  //   api.users.getUserWithHouseholds,
  //   clerkUser ? { clerkId: clerkUser.id } : 'skip'
  // )

  // const createOrUpdateUser = useMutation(api.users.createOrUpdateUser)

  // Sync Clerk user with Convex on login (temporarily disabled)
  // useEffect(() => {
  //   if (clerkUser && userLoaded && !convexUser) {
  //     createOrUpdateUser({
  //       clerkId: clerkUser.id,
  //       email: clerkUser.emailAddresses[0]?.emailAddress || '',
  //       firstName: clerkUser.firstName || undefined,
  //       lastName: clerkUser.lastName || undefined,
  //       imageUrl: clerkUser.imageUrl,
  //       phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || undefined,
  //     }).catch((error) => {
  //       console.error('Failed to sync user:', error)
  //     })
  //   }
  // }, [clerkUser, userLoaded, convexUser, createOrUpdateUser])

  // Set default household if user has households (temporarily disabled)
  // useEffect(() => {
  //   if (userWithHouseholds?.households && userWithHouseholds.households.length > 0 && !currentHousehold) {
  //     // Set first household as default
  //     setCurrentHousehold(userWithHouseholds.households[0].householdId)
  //   }
  // }, [userWithHouseholds, currentHousehold])

  const signOut = async () => {
    setCurrentHousehold(undefined)
    await clerkSignOut()
  }

  const switchHousehold = async (householdId: string) => {
    setCurrentHousehold(householdId)
  }

  // Create app user object
  const appUser: AppUser | null = clerkUser
    ? {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        emailAddress: clerkUser.emailAddresses[0]?.emailAddress,
        imageUrl: clerkUser.imageUrl,
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : undefined,
        updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : undefined,
      }
    : null

  // Get current household membership (temporarily disabled)
  // const currentMembership = userWithHouseholds?.households?.find(
  //   (h) => h.householdId === currentHousehold
  // )

  const contextValue: AuthContextData = {
    user: appUser,
    isLoading: !userLoaded || !authLoaded,
    isSignedIn: !!clerkUser,
    currentHousehold,
    householdRole: undefined, // currentMembership?.role,
    permissions: undefined, // currentMembership?.permissions,
    signOut,
    switchHousehold,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}