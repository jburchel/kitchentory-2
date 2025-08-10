'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Home, Users, Check, X, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface InvitationData {
  id: string
  householdName: string
  inviterName: string
  inviterEmail: string
  role: 'member' | 'admin' | 'viewer'
  message?: string
  expiresAt: Date
  status: 'pending' | 'expired' | 'used'
}

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteCode = params.code as string

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation()
    }
  }, [inviteCode])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock invitation data - will be replaced with actual Convex query
      const mockInvitation: InvitationData = {
        id: '1',
        householdName: 'The Johnson Family',
        inviterName: 'Sarah Johnson',
        inviterEmail: 'sarah@example.com',
        role: 'member',
        message: 'Welcome to our family household! We can share grocery lists and track our kitchen inventory together.',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending'
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setInvitation(mockInvitation)
    } catch (error) {
      setError('Failed to load invitation details')
      console.error('Error fetching invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async () => {
    if (!invitation || !user) return

    try {
      setAccepting(true)

      // Mock API call - will be replaced with actual Convex mutation
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success(`Successfully joined ${invitation.householdName}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to accept invitation')
      console.error('Error accepting invitation:', error)
    } finally {
      setAccepting(false)
    }
  }

  const declineInvitation = async () => {
    if (!invitation) return

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Invitation declined')
      router.push('/')
    } catch (error) {
      toast.error('Failed to decline invitation')
    }
  }

  const isExpired = invitation && new Date() > invitation.expiresAt

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h1 className="text-xl font-semibold mb-2">Invalid Invitation</h1>
              <p className="text-muted-foreground mb-6">
                {error || 'This invitation link is invalid or has expired.'}
              </p>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isExpired || invitation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h1 className="text-xl font-semibold mb-2">Invitation Expired</h1>
              <p className="text-muted-foreground mb-6">
                This invitation has expired. Please ask {invitation.inviterName} to send you a new invitation.
              </p>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Join Household</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <Avatar className="w-16 h-16 mx-auto">
                <AvatarFallback className="text-lg bg-emerald-100 text-emerald-700">
                  <Home className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-semibold">{invitation.householdName}</h2>
                <p className="text-muted-foreground">
                  {invitation.inviterName} invited you to join their household
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm text-left">
              <p className="font-medium mb-2">You'll be added as a:</p>
              <Badge variant="outline" className="capitalize">{invitation.role}</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You need to sign in to accept this invitation.
              </p>
              
              <div className="space-y-2">
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full">Create Account</Button>
                </Link>
                <Link href="/auth/sign-in" className="block">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Join Household</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Avatar className="w-16 h-16 mx-auto">
              <AvatarFallback className="text-lg bg-emerald-100 text-emerald-700">
                <Home className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">{invitation.householdName}</h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Invited by {invitation.inviterName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-sm mb-2">You'll be added as a:</p>
              <Badge variant="outline" className="capitalize">
                {invitation.role}
              </Badge>
              
              <div className="mt-3 text-xs text-muted-foreground">
                {invitation.role === 'member' && 'Can view and manage inventory items'}
                {invitation.role === 'admin' && 'Can manage members, settings, and inventory'}
                {invitation.role === 'viewer' && 'Can view inventory but not make changes'}
              </div>
            </div>

            {invitation.message && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 italic">
                  "{invitation.message}"
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={acceptInvitation}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Accept & Join
                </>
              )}
            </Button>
            
            <Button
              onClick={declineInvitation}
              variant="outline"
              disabled={accepting}
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By joining, you agree to share household inventory and collaborate with other members.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}