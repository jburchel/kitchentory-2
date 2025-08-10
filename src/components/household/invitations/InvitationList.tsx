'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Clock, MoreVertical, Send, X, RefreshCw, Copy, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

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

export interface InvitationListProps {
  invitations: Invitation[]
  onResend: (invitationId: string) => void
  onCancel: (invitationId: string) => void
  onCopyLink: (inviteCode: string) => void
  className?: string
}

const getStatusVariant = (status: Invitation['status']) => {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'accepted':
      return 'default'
    case 'declined':
      return 'destructive'
    case 'expired':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getStatusIcon = (status: Invitation['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-3 h-3" />
    case 'accepted':
      return <div className="w-3 h-3 rounded-full bg-green-500" />
    case 'declined':
      return <X className="w-3 h-3" />
    case 'expired':
      return <div className="w-3 h-3 rounded-full bg-gray-400" />
    default:
      return <Clock className="w-3 h-3" />
  }
}

const getRoleColor = (role: Invitation['role']) => {
  switch (role) {
    case 'admin':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'member':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'viewer':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function InvitationList({ 
  invitations, 
  onResend, 
  onCancel, 
  onCopyLink,
  className 
}: InvitationListProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})

  const handleResend = async (invitationId: string) => {
    setLoadingActions(prev => ({ ...prev, [`resend-${invitationId}`]: true }))
    try {
      await onResend(invitationId)
      toast.success('Invitation resent successfully')
    } catch (error) {
      toast.error('Failed to resend invitation')
    } finally {
      setLoadingActions(prev => ({ ...prev, [`resend-${invitationId}`]: false }))
    }
  }

  const handleCancel = async (invitationId: string) => {
    setLoadingActions(prev => ({ ...prev, [`cancel-${invitationId}`]: true }))
    try {
      await onCancel(invitationId)
      toast.success('Invitation cancelled')
    } catch (error) {
      toast.error('Failed to cancel invitation')
    } finally {
      setLoadingActions(prev => ({ ...prev, [`cancel-${invitationId}`]: false }))
    }
  }

  const handleCopyLink = (inviteCode: string) => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    onCopyLink(inviteCode)
    toast.success('Invitation link copied to clipboard')
  }

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt
  }

  if (invitations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No invitations sent</h3>
            <p className="text-sm">
              When you send invitations to new members, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pending Invitations</span>
          <Badge variant="outline" className="ml-2">
            {invitations.filter(inv => inv.status === 'pending').length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm">
                  {invitation.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{invitation.email}</p>
                  <Badge 
                    variant={getStatusVariant(invitation.status)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {getStatusIcon(invitation.status)}
                    {invitation.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRoleColor(invitation.role)}`}
                  >
                    {invitation.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Invited by {invitation.invitedBy}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Sent {formatDistanceToNow(invitation.invitedAt)} ago
                  </div>
                  <div className={isExpired(invitation.expiresAt) ? 'text-red-500' : ''}>
                    {isExpired(invitation.expiresAt) ? 'Expired' : 'Expires'} {formatDistanceToNow(invitation.expiresAt)} 
                    {!isExpired(invitation.expiresAt) && ' from now'}
                  </div>
                </div>
                
                {invitation.message && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                    "{invitation.message}"
                  </div>
                )}
              </div>
            </div>

            {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleCopyLink(invitation.inviteCode)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleResend(invitation.id)}
                    disabled={loadingActions[`resend-${invitation.id}`]}
                    className="flex items-center gap-2"
                  >
                    {loadingActions[`resend-${invitation.id}`] ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Resend Email
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCancel(invitation.id)}
                    disabled={loadingActions[`cancel-${invitation.id}`]}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    {loadingActions[`cancel-${invitation.id}`] ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Cancel Invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}