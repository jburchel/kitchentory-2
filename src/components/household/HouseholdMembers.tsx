'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Plus, MoreVertical, Crown, Shield, Eye, UserMinus, Settings } from 'lucide-react'
import { InvitationForm } from './invitations/InvitationForm'
import { InvitationList, type Invitation } from './invitations/InvitationList'
import { toast } from 'sonner'

export interface HouseholdMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'inactive'
  joinedAt: Date
  lastActive?: Date
}

export interface HouseholdMembersProps {
  householdId: string
  members: HouseholdMember[]
  invitations: Invitation[]
  currentUserId: string
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer'
  onUpdateMember?: (memberId: string, updates: Partial<HouseholdMember>) => void
  onRemoveMember?: (memberId: string) => void
  onResendInvitation?: (invitationId: string) => void
  onCancelInvitation?: (invitationId: string) => void
  className?: string
}

const getRoleIcon = (role: HouseholdMember['role']) => {
  switch (role) {
    case 'owner':
      return <Crown className="w-4 h-4 text-yellow-600" />
    case 'admin':
      return <Shield className="w-4 h-4 text-purple-600" />
    case 'member':
      return <Users className="w-4 h-4 text-blue-600" />
    case 'viewer':
      return <Eye className="w-4 h-4 text-gray-600" />
    default:
      return <Users className="w-4 h-4" />
  }
}

const getRoleVariant = (role: HouseholdMember['role']) => {
  switch (role) {
    case 'owner':
      return 'default'
    case 'admin':
      return 'secondary'
    case 'member':
      return 'outline'
    case 'viewer':
      return 'outline'
    default:
      return 'outline'
  }
}

const canManageMember = (currentRole: string, targetRole: string, isCurrentUser: boolean) => {
  if (isCurrentUser) return false
  if (currentRole === 'owner') return true
  if (currentRole === 'admin' && targetRole !== 'owner') return true
  return false
}

export function HouseholdMembers({
  householdId,
  members,
  invitations,
  currentUserId,
  currentUserRole,
  onUpdateMember,
  onRemoveMember,
  onResendInvitation,
  onCancelInvitation,
  className
}: HouseholdMembersProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const handleInviteSuccess = (newInvitations: any[]) => {
    setShowInviteDialog(false)
    toast.success(`Successfully sent ${newInvitations.length} invitation${newInvitations.length > 1 ? 's' : ''}`)
  }

  const handleRoleChange = async (memberId: string, newRole: HouseholdMember['role']) => {
    try {
      await onUpdateMember?.(memberId, { role: newRole })
      toast.success('Member role updated successfully')
    } catch (error) {
      toast.error('Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this household?`)) {
      try {
        await onRemoveMember?.(memberId)
        toast.success(`${memberName} has been removed from the household`)
      } catch (error) {
        toast.error('Failed to remove member')
      }
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    await onResendInvitation?.(invitationId)
  }

  const handleCancelInvitation = async (invitationId: string) => {
    await onCancelInvitation?.(invitationId)
  }

  const handleCopyInviteLink = (inviteCode: string) => {
    // Already handled in InvitationList component
  }

  const activeMembers = members.filter(member => member.status === 'active')
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending')

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Household Members
              <Badge variant="outline" className="ml-2">
                {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            
            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite New Members</DialogTitle>
                  </DialogHeader>
                  <InvitationForm
                    householdId={householdId}
                    onSuccess={handleInviteSuccess}
                    onCancel={() => setShowInviteDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId
            const canManage = canManageMember(currentUserRole, member.role, isCurrentUser)
            
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                      {member.lastActive && (
                        <span className="text-xs text-muted-foreground">
                          Active {new Date(member.lastActive).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {}}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {member.role !== 'owner' && currentUserRole === 'owner' && (
                        <>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                            <Users className="w-4 h-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {(currentUserRole === 'owner' || currentUserRole === 'admin') && pendingInvitations.length > 0 && (
        <InvitationList
          invitations={pendingInvitations}
          onResend={handleResendInvitation}
          onCancel={handleCancelInvitation}
          onCopyLink={handleCopyInviteLink}
        />
      )}
    </div>
  )
}