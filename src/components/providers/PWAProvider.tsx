'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'

interface PWAContextType {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  installApp: () => Promise<void>
  updateAvailable: boolean
  updateApp: () => Promise<void>
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored!')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('You are now offline. Some features may be limited.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show install prompt after a delay
      setTimeout(() => {
        if (!isInstalled) {
          toast.info('Install Kitchentory for a better experience!', {
            action: {
              label: 'Install',
              onClick: () => installApp()
            },
            duration: 10000
          })
        }
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      toast.success('Kitchentory installed successfully!')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered:', reg)
          setRegistration(reg)

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                  toast.info('App update available!', {
                    action: {
                      label: 'Update',
                      onClick: () => updateApp()
                    },
                    duration: 0 // Don't auto-dismiss
                  })
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, payload } = event.data

        switch (type) {
          case 'CACHE_UPDATED':
            toast.success('App updated! New version available.')
            break
          case 'OFFLINE_READY':
            toast.info('App is ready to work offline.')
            break
          case 'SYNC_COMPLETE':
            toast.success('Offline changes synced successfully!')
            break
          case 'SYNC_ERROR':
            toast.error('Failed to sync offline changes.')
            break
          default:
            break
        }
      })
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast.success('Notifications enabled! You\'ll be alerted about expiring items.')
          }
        })
      }, 10000) // Ask after 10 seconds
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error installing app:', error)
      toast.error('Failed to install app. Please try again.')
    }
  }

  const updateApp = async () => {
    if (!registration || !registration.waiting) return

    try {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
      
      setUpdateAvailable(false)
      toast.success('Updating app...')
    } catch (error) {
      console.error('Error updating app:', error)
      toast.error('Failed to update app. Please refresh manually.')
    }
  }

  // Store data for offline use
  const storeForOfflineSync = async (type: 'inventory' | 'shopping', data: any) => {
    if (!('indexedDB' in window)) return

    try {
      const db = await openIndexedDB()
      const transaction = db.transaction([`pending-${type}`], 'readwrite')
      const store = transaction.objectStore(`pending-${type}`)
      
      await store.add({
        id: Date.now().toString(),
        data,
        timestamp: Date.now()
      })

      // Register for background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(`${type}-sync`)
      }

      toast.info('Changes saved locally. Will sync when online.')
    } catch (error) {
      console.error('Error storing offline data:', error)
    }
  }

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('kitchentory-offline', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('pending-inventory')) {
          db.createObjectStore('pending-inventory', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('pending-shopping')) {
          db.createObjectStore('pending-shopping', { keyPath: 'id' })
        }
      }
    })
  }

  const value: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    installApp,
    updateAvailable,
    updateApp
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

// Hook for offline storage
export function useOfflineStorage() {
  const { isOnline } = usePWA()

  const storeForSync = async (type: 'inventory' | 'shopping', data: any) => {
    if (isOnline) {
      // If online, proceed with normal operation
      return data
    }

    // Store for offline sync
    if ('indexedDB' in window) {
      try {
        const request = indexedDB.open('kitchentory-offline', 1)
        
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction([`pending-${type}`], 'readwrite')
          const store = transaction.objectStore(`pending-${type}`)
          
          store.add({
            id: Date.now().toString(),
            data,
            timestamp: Date.now()
          })
        }

        // Register for background sync if available
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready
          await registration.sync.register(`${type}-sync`)
        }

        toast.info('Saved locally. Will sync when connection is restored.')
        return data
      } catch (error) {
        console.error('Error storing for offline sync:', error)
        toast.error('Unable to save offline. Please try again when online.')
        throw error
      }
    }

    throw new Error('Offline storage not available')
  }

  return { storeForSync, isOnline }
}