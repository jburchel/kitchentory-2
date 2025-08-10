'use client'

import { UserButton as ClerkUserButton } from '@clerk/nextjs'
import { useAuthContext } from '@/contexts/AuthContext'

export function UserButton() {
  const { user } = useAuthContext()
  
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
          userButtonPopoverCard: "shadow-lg border border-gray-200",
          userButtonPopoverActions: "space-y-1",
          userButtonPopoverActionButton: 
            "text-sm px-4 py-2 hover:bg-gray-100 rounded-md transition-colors",
          userButtonPopoverFooter: "border-t border-gray-200 pt-2 mt-2",
        },
      }}
      userProfileMode="navigation"
      userProfileUrl="/profile"
      afterSignOutUrl="/auth/sign-in"
    />
  )
}

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function UserAvatar({ size = 'md', showName = false, className = '' }: UserAvatarProps) {
  const { user } = useAuthContext()

  if (!user) return null

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-medium">
            {(user.firstName?.[0] || user.emailAddress?.[0] || 'U').toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <span className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
          {user.firstName || user.emailAddress}
        </span>
      )}
    </div>
  )
}