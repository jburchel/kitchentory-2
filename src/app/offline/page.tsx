'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProduceIcon } from '@/components/icons/svg'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const retryConnection = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ProduceIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isOnline ? 'Connection Restored' : 'You\'re Offline'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isOnline 
              ? 'Your internet connection has been restored. You can now access all features.'
              : 'No internet connection detected. Some features may be limited, but you can still browse your cached data.'
            }
          </p>
        </div>

        <div className="space-y-4">
          {isOnline ? (
            <>
              <Button onClick={retryConnection} className="w-full">
                Return to App
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>You can now:</p>
                <ul className="text-left mt-2 space-y-1">
                  <li>• Sync your offline changes</li>
                  <li>• Access real-time data</li>
                  <li>• Share shopping lists</li>
                  <li>• Receive push notifications</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Button onClick={retryConnection} variant="outline" className="w-full">
                Try Again
              </Button>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/inventory" className="w-full">
                  <Button variant="outline" className="w-full">
                    Browse Inventory
                  </Button>
                </Link>
                <Link href="/shopping-lists" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Shopping Lists
                  </Button>
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>While offline, you can:</p>
                <ul className="text-left mt-2 space-y-1">
                  <li>• View cached inventory items</li>
                  <li>• Browse shopping lists</li>
                  <li>• Add items (will sync when online)</li>
                  <li>• Use all previously loaded features</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}