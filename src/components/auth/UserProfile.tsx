'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { UserAvatar } from './UserButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, Edit2, X } from 'lucide-react'

interface UserProfileProps {
  showAvatar?: boolean
  compact?: boolean
}

export function UserProfile({ showAvatar = true, compact = false }: UserProfileProps) {
  const { user, isUpdating, error, updateProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  })
  const [success, setSuccess] = useState(false)

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          No user data available
        </div>
      </Card>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const result = await updateProfile({
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    })

    if (result.success) {
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
    })
    setIsEditing(false)
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        {showAvatar && (
          <UserAvatar size="md" className="flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.emailAddress}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showAvatar && (
              <UserAvatar size="lg" className="flex-shrink-0" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <p className="text-gray-500">
                Manage your account details
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-md">
            <p className="text-sm">Failed to update profile. Please try again.</p>
          </div>
        )}

        {/* Profile form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            {isEditing ? (
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {user.firstName || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            {isEditing ? (
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {user.lastName || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="mt-1 text-sm text-gray-900">
              {user.emailAddress}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here. Use account settings.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
              />
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {user.phoneNumber || 'Not provided'}
              </div>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Member Since</Label>
              <div className="mt-1 text-sm text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
            <div>
              <Label>Last Updated</Label>
              <div className="mt-1 text-sm text-gray-900">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Edit actions */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              {isUpdating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// Compact profile card for sidebars
export function ProfileCard() {
  return <UserProfile compact showAvatar />
}

// Profile header for main pages
export function ProfileHeader() {
  return (
    <div className="mb-6">
      <UserProfile showAvatar={false} />
    </div>
  )
}