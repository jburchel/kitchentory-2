// TypeScript types for enhanced Convex schemas

import type { Doc, Id } from '../../convex/_generated/dataModel'

// Enhanced User types
export interface UserProfile extends Doc<'users'> {
  households?: HouseholdMembershipWithHousehold[]
  pendingInvitations?: HouseholdInvitationWithDetails[]
  householdCount?: number
  pendingInvitationCount?: number
}

export interface UserDashboard {
  user: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
    lastLoginAt?: number
  }
  households: HouseholdMembershipWithStats[]
  pendingInvitations: number
  unreadNotifications: number
  summary: {
    totalHouseholds: number
    totalInventoryItems: number
    totalExpiringItems: number
    totalLowStockItems: number
    totalActiveShoppingLists: number
  }
}

// Enhanced Household types
export interface HouseholdSettings {
  defaultShelfLifeDays?: number
  lowStockThreshold?: number
  enableNotifications?: boolean
  showNutritionalInfo?: boolean
  allowGuestAccess?: boolean
  requireApprovalForNewMembers?: boolean
  maxMembers?: number
  theme?: string
}

export interface HouseholdPreferences {
  defaultView?: 'inventory' | 'shopping' | 'dashboard'
  measurementSystem?: 'metric' | 'imperial'
  dateFormat?: string
  language?: string
}

export interface EnhancedHousehold extends Doc<'households'> {
  settings?: HouseholdSettings
  preferences?: HouseholdPreferences
  imageUrl?: string
  isActive: boolean
  memberCount: number
  createdBy: string
}

// Household Member types
export type HouseholdRole = 'owner' | 'admin' | 'member'

export interface HouseholdPermissions {
  canManageInventory?: boolean
  canManageShoppingLists?: boolean
  canManageCategories?: boolean
  canInviteMembers?: boolean
  canManageMembers?: boolean
  canEditHouseholdSettings?: boolean
  canDeleteHousehold?: boolean
}

export interface HouseholdMember extends Doc<'householdMembers'> {
  role: HouseholdRole
  permissions?: HouseholdPermissions
  isActive: boolean
  lastActiveAt?: number
  updatedAt: number
}

export interface HouseholdMemberWithUser extends HouseholdMember {
  user: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
    isActive: boolean
    lastLoginAt?: number
  } | null
}

export interface HouseholdMembershipWithHousehold extends HouseholdMember {
  household: EnhancedHousehold | null
}

export interface HouseholdMembershipWithStats extends HouseholdMembershipWithHousehold {
  stats: {
    inventoryItemCount: number
    activeShoppingLists: number
    expiringItemsCount: number
    lowStockItemsCount: number
  }
}

// Household Invitation types
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface HouseholdInvitation extends Doc<'householdInvitations'> {
  status: InvitationStatus
  role: Exclude<HouseholdRole, 'owner'>
  expiresAt: number
  acceptedAt?: number
  acceptedBy?: string
}

export interface HouseholdInvitationWithDetails extends HouseholdInvitation {
  household: EnhancedHousehold | null
  inviter: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
  } | null
}

// Permission checking types
export interface PermissionCheckResult {
  hasPermission: boolean
  reason?: string
  membership?: {
    role: HouseholdRole
    permissions?: HouseholdPermissions
    joinedAt: number
    lastActiveAt?: number
  } | null
}

export interface MemberManagementPermission {
  canManage: boolean
  reason?: string
}

export interface EffectivePermissions {
  role: HouseholdRole
  permissions: Required<HouseholdPermissions>
  isActive: boolean
  joinedAt: number
  lastActiveAt?: number
}

// Activity Feed types
export interface ActivityLogEntry extends Doc<'activityLog'> {
  user?: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
  } | null
  household?: {
    name: string
    imageUrl?: string
  } | null
  resourceDetails?: any
  formattedMessage: string
}

export interface ActivityStats {
  totalActivities: number
  timeframe: '24h' | '7d' | '30d' | '90d'
  actionCounts: Record<string, number>
  resourceTypeCounts: Record<string, number>
  topUsers: Array<{
    userId: string
    user: {
      firstName?: string
      lastName?: string
      imageUrl?: string
    } | null
    activityCount: number
  }>
  mostActiveDay: { day: string; count: number }
  recentActivityTrend: Array<{ period: string; count: number }>
}

// Subscription types
export interface HouseholdMembersSubscription {
  members: HouseholdMemberWithUser[]
  hasAccess: boolean
  userRole?: HouseholdRole
  userPermissions?: HouseholdPermissions
}

export interface HouseholdInvitationsSubscription {
  invitations: HouseholdInvitationWithDetails[]
  hasAccess: boolean
}

export interface HouseholdSettingsSubscription {
  household: EnhancedHousehold | null
  hasAccess: boolean
  canEdit: boolean
}

export interface HouseholdActivitySubscription {
  activities: ActivityLogEntry[]
  hasAccess: boolean
  userRole?: HouseholdRole
}

export interface HouseholdStatsSubscription {
  stats: {
    household: {
      name: string
      memberCount: number
      createdAt: number
    }
    members: {
      total: number
      owners: number
      admins: number
      regular: number
    }
    invitations: {
      pending: number
    }
    inventory: {
      total: number
      expiringSoon: number
      lowStock: number
    }
    shopping: {
      activeLists: number
      totalItems: number
    }
    lastActivity: number
  } | null
  hasAccess: boolean
  userRole?: HouseholdRole
}

// Utility types
export interface HouseholdContext {
  householdId: Id<'households'>
  householdName: string
  userRole?: HouseholdRole
  userPermissions?: HouseholdPermissions
}

export interface UserPreferences {
  user: Doc<'users'>
  preferences: HouseholdPreferences | null
  settings: HouseholdSettings | null
  householdContext: HouseholdContext | null
}

export interface UserRoleSummary {
  totalHouseholds: number
  roles: {
    owner: number
    admin: number
    member: number
  }
  householdRoles: Array<{
    householdId: Id<'households'>
    householdName: string
    role: HouseholdRole
    permissions?: HouseholdPermissions
    joinedAt: number
    lastActiveAt?: number
  }>
  hasOwnerRole: boolean
  hasAdminRole: boolean
}

export interface MemberLimitCheck {
  hasLimit: boolean
  maxMembers?: number
  currentMemberCount?: number
  canAddMembers: boolean
  remainingSlots?: number
  reason?: string
}

// API Response types for mutations
export interface CreateHouseholdResponse {
  householdId: Id<'households'>
}

export interface AcceptInvitationResponse {
  membershipId: Id<'householdMembers'>
}

export interface InviteMemberResponse {
  invitationId: Id<'householdInvitations'>
}

// Error types
export interface ConvexError {
  message: string
  data?: any
}

// Hook types for React components
export interface UseHouseholdMembersResult {
  members: HouseholdMemberWithUser[]
  isLoading: boolean
  error: ConvexError | null
  hasAccess: boolean
  userRole?: HouseholdRole
  userPermissions?: HouseholdPermissions
}

export interface UseHouseholdInvitationsResult {
  invitations: HouseholdInvitationWithDetails[]
  isLoading: boolean
  error: ConvexError | null
  hasAccess: boolean
}

export interface UseUserDashboardResult {
  dashboard: UserDashboard | null
  isLoading: boolean
  error: ConvexError | null
}

export interface UsePermissionCheckResult {
  hasPermission: boolean
  isLoading: boolean
  error: ConvexError | null
  reason?: string
}

// Form types
export interface CreateHouseholdForm {
  name: string
  description?: string
  currency?: string
  timezone?: string
  imageUrl?: string
}

export interface UpdateHouseholdForm extends CreateHouseholdForm {
  settings?: Partial<HouseholdSettings>
  preferences?: Partial<HouseholdPreferences>
}

export interface InviteMemberForm {
  email: string
  role: Exclude<HouseholdRole, 'owner'>
  message?: string
  expiryHours?: number
}

export interface UpdateMemberForm {
  role?: HouseholdRole
  permissions?: Partial<HouseholdPermissions>
}

// Constants
export const HOUSEHOLD_ROLES: Record<HouseholdRole, string> = {
  owner: 'Owner',
  admin: 'Administrator', 
  member: 'Member',
} as const

export const INVITATION_STATUSES: Record<InvitationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
} as const

export const DEFAULT_HOUSEHOLD_SETTINGS: Required<HouseholdSettings> = {
  defaultShelfLifeDays: 7,
  lowStockThreshold: 2,
  enableNotifications: true,
  showNutritionalInfo: true,
  allowGuestAccess: false,
  requireApprovalForNewMembers: false,
  maxMembers: 10,
  theme: 'default',
} as const

export const DEFAULT_HOUSEHOLD_PREFERENCES: Required<HouseholdPreferences> = {
  defaultView: 'dashboard',
  measurementSystem: 'metric',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
} as const