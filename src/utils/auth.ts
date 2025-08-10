export const isAuthenticated = (userId: string | null): boolean => {
  return !!userId
}

export const hasCompletedOnboarding = (metadata: any): boolean => {
  return !!metadata?.onboardingCompleted
}

export const getUserDisplayName = (user: any): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user?.firstName) {
    return user.firstName
  }
  if (user?.lastName) {
    return user.lastName
  }
  return user?.emailAddresses?.[0]?.emailAddress || 'User'
}

export const formatUserRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}