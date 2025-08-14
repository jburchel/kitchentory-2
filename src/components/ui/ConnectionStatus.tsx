'use client'

import { usePWA } from '@/components/providers/PWAProvider'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionStatusProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ConnectionStatus({ 
  className = '', 
  showLabel = true,
  size = 'md'
}: ConnectionStatusProps) {
  try {
    const { isOnline, updateAvailable, updateApp } = usePWA()

    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'

    if (updateAvailable) {
      return (
        <Button
          onClick={updateApp}
          variant="outline"
          size="sm"
          className={`${className} h-6 px-2 ${textSize}`}
        >
          <Download className={`${iconSize} mr-1`} />
          Update Available
        </Button>
      )
    }

    if (!isOnline) {
      return (
        <Badge variant="destructive" className={`${className} ${textSize}`}>
          <WifiOff className={`${iconSize} ${showLabel ? 'mr-1' : ''}`} />
          {showLabel && 'Offline'}
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className={`${className} ${textSize} bg-green-50 text-green-700 border-green-200`}>
        <Wifi className={`${iconSize} ${showLabel ? 'mr-1' : ''}`} />
        {showLabel && 'Online'}
      </Badge>
    )
  } catch (error) {
    // PWA provider not available, show default online status
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
    
    return (
      <Badge variant="secondary" className={`${className} ${textSize} bg-green-50 text-green-700 border-green-200`}>
        <Wifi className={`${iconSize} ${showLabel ? 'mr-1' : ''}`} />
        {showLabel && 'Online'}
      </Badge>
    )
  }
}

// Compact version for mobile
export function MobileConnectionStatus() {
  try {
    const { isOnline, updateAvailable } = usePWA()

    if (updateAvailable) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-xs z-50">
          App update available - tap to refresh
        </div>
      )
    }

    if (!isOnline) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-xs z-50">
          <WifiOff className="w-3 h-3 inline mr-1" />
          You're offline - some features may be limited
        </div>
      )
    }

    return null
  } catch (error) {
    // PWA provider not available, render nothing
    return null
  }
}

// Hook for connection-aware operations
export function useConnectionAware() {
  try {
    const { isOnline } = usePWA()

    const withConnectionCheck = <T extends any[]>(
      onlineCallback: (...args: T) => Promise<any> | any,
      offlineCallback?: (...args: T) => Promise<any> | any,
      offlineMessage = 'This action requires an internet connection'
    ) => {
      return async (...args: T) => {
        if (isOnline) {
          return onlineCallback(...args)
        } else {
          if (offlineCallback) {
            return offlineCallback(...args)
          } else {
            throw new Error(offlineMessage)
          }
        }
      }
    }

    const requireConnection = (message?: string) => {
      if (!isOnline) {
        throw new Error(message || 'Internet connection required')
      }
      return true
    }

    return {
      isOnline,
      withConnectionCheck,
      requireConnection
    }
  } catch (error) {
    // PWA provider not available, assume online
    const defaultOnline = true
    
    const withConnectionCheck = <T extends any[]>(
      onlineCallback: (...args: T) => Promise<any> | any,
      offlineCallback?: (...args: T) => Promise<any> | any,
      offlineMessage = 'This action requires an internet connection'
    ) => {
      return async (...args: T) => {
        return onlineCallback(...args)
      }
    }

    const requireConnection = (message?: string) => {
      return true
    }

    return {
      isOnline: defaultOnline,
      withConnectionCheck,
      requireConnection
    }
  }
}