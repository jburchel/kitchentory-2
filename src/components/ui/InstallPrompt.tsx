'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePWA } from '@/components/providers/PWAProvider'
import { X, Download, Smartphone } from 'lucide-react'

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt after a delay if installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, 10000) // Show after 10 seconds

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, dismissed])

  const handleInstall = async () => {
    try {
      await installApp()
      setShowPrompt(false)
    } catch (error) {
      console.error('Install failed:', error)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowPrompt(false)
    // Remember dismissal for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true')
  }

  // Don't show if already installed, not installable, dismissed, or in session storage
  if (!showPrompt || isInstalled || !isInstallable || 
      sessionStorage.getItem('install-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="p-4 bg-card border-2 border-primary/20 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">Install Kitchentory</h3>
                <p className="text-xs text-muted-foreground">
                  Get the full app experience with offline access and notifications
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 -mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Compact version for header
export function HeaderInstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA()

  if (!isInstallable || isInstalled) return null

  return (
    <Button
      onClick={installApp}
      variant="outline"
      size="sm"
      className="hidden md:flex items-center space-x-1 h-8"
    >
      <Download className="w-3 h-3" />
      <span className="text-xs">Install</span>
    </Button>
  )
}