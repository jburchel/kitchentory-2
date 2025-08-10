'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface CreateInvitationData {
  emails: string[]
  role: 'member' | 'admin' | 'viewer'
  message?: string
  expiresIn: number // days
}

export interface Invitation {
  id: string
  email: string
  role: 'member' | 'admin' | 'viewer'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  inviteCode: string
  message?: string
}

export interface UseInvitationsReturn {
  invitations: Invitation[]
  loading: boolean
  error: string | null
  createInvitations: (householdId: string, data: CreateInvitationData) => Promise<Invitation[]>
  resendInvitation: (invitationId: string) => Promise<void>
  cancelInvitation: (invitationId: string) => Promise<void>
  acceptInvitation: (inviteCode: string) => Promise<void>
  declineInvitation: (inviteCode: string) => Promise<void>
  getInvitationByCode: (inviteCode: string) => Promise<Invitation | null>
  refreshInvitations: (householdId: string) => Promise<void>
}

// Mock data for development
const mockInvitations: Invitation[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    role: 'member',
    status: 'pending',
    invitedBy: 'Sarah Johnson',
    invitedAt: new Date('2024-01-15'),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    inviteCode: 'abc123',
    message: 'Welcome to our family household!'
  },
  {
    id: '2',
    email: 'mary.smith@example.com',
    role: 'admin',
    status: 'pending',
    invitedBy: 'Sarah Johnson',
    invitedAt: new Date('2024-01-14'),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    inviteCode: 'def456'
  }
]

export function useInvitations(): UseInvitationsReturn {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInvitations = useCallback(async (householdId: string, data: CreateInvitationData): Promise<Invitation[]> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call - will be replaced with actual Convex mutation
      const newInvitations: Invitation[] = data.emails.map(email => ({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: data.role,
        status: 'pending' as const,
        invitedBy: 'Current User', // Will be replaced with actual user name
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000),
        inviteCode: Math.random().toString(36).substr(2, 9),
        message: data.message
      }))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setInvitations(prev => [...prev, ...newInvitations])
      
      return newInvitations
    } catch (err) {
      const errorMessage = 'Failed to create invitations'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const resendInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the invitation's sent date
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, invitedAt: new Date() }
            : inv
        )
      )
    } catch (err) {
      const errorMessage = 'Failed to resend invitation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
    } catch (err) {
      const errorMessage = 'Failed to cancel invitation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const acceptInvitation = useCallback(async (inviteCode: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update invitation status
      setInvitations(prev => 
        prev.map(inv => 
          inv.inviteCode === inviteCode 
            ? { ...inv, status: 'accepted' as const }
            : inv
        )
      )
    } catch (err) {
      const errorMessage = 'Failed to accept invitation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const declineInvitation = useCallback(async (inviteCode: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update invitation status
      setInvitations(prev => 
        prev.map(inv => 
          inv.inviteCode === inviteCode 
            ? { ...inv, status: 'declined' as const }
            : inv
        )
      )
    } catch (err) {
      const errorMessage = 'Failed to decline invitation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getInvitationByCode = useCallback(async (inviteCode: string): Promise<Invitation | null> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const invitation = invitations.find(inv => inv.inviteCode === inviteCode)
      return invitation || null
    } catch (err) {
      const errorMessage = 'Failed to get invitation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [invitations])

  const refreshInvitations = useCallback(async (householdId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, this would fetch fresh data from Convex
      // For now, we'll just simulate a refresh
    } catch (err) {
      const errorMessage = 'Failed to refresh invitations'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    invitations,
    loading,
    error,
    createInvitations,
    resendInvitation,
    cancelInvitation,
    acceptInvitation,
    declineInvitation,
    getInvitationByCode,
    refreshInvitations
  }
}