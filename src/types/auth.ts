import { User } from '@clerk/nextjs/server'
import { Id } from '../convex/_generated/dataModel'

// Clerk User extended with our application data
export interface AppUser extends Partial<User> {
  id: string
  firstName?: string | null
  lastName?: string | null
  emailAddress?: string
  imageUrl?: string
  phoneNumber?: string | null
  createdAt?: Date
  updatedAt?: Date
}

// Authentication states
export type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

// User role in household context
export type HouseholdRole = 'owner' | 'admin' | 'member'

// User permissions within a household
export interface HouseholdPermissions {
  canManageInventory?: boolean
  canManageShoppingLists?: boolean
  canManageCategories?: boolean
  canInviteMembers?: boolean
}

// Household member with auth user data
export interface HouseholdMember {
  id: Id<'householdMembers'>
  householdId: Id<'households'>
  userId: string
  user?: AppUser
  role: HouseholdRole
  permissions?: HouseholdPermissions
  joinedAt: number
}

// Auth context data
export interface AuthContextData {
  user: AppUser | null
  isLoading: boolean
  isSignedIn: boolean
  currentHousehold?: Id<'households'>
  householdRole?: HouseholdRole
  permissions?: HouseholdPermissions
  signOut: () => Promise<void>
  switchHousehold: (householdId: Id<'households'>) => Promise<void>
}

// Social auth providers
export type SocialProvider = 'google' | 'apple' | 'facebook'

// Auth form data
export interface SignInFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ResetPasswordFormData {
  email: string
}

export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// OAuth configuration
export interface OAuthConfig {
  google?: {
    clientId: string
    enabled: boolean
  }
  apple?: {
    clientId: string
    enabled: boolean
  }
}

// Auth error types
export type AuthError = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'network_error'
  | 'rate_limited'
  | 'oauth_error'
  | 'verification_required'
  | 'account_locked'
  | 'unknown_error'

// Auth action results
export interface AuthResult {
  success: boolean
  error?: AuthError
  message?: string
  data?: any
}

// Session data
export interface SessionData {
  userId: string
  sessionId: string
  isActive: boolean
  lastActiveAt: Date
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

// Webhook event types
export type ClerkWebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended'
  | 'session.removed'
  | 'session.revoked'

// Webhook payload
export interface ClerkWebhookPayload {
  type: ClerkWebhookEvent
  object: string
  data: any
  event_attributes?: {
    http_request: {
      client_ip: string
      user_agent: string
    }
  }
}