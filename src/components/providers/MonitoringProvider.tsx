/**
 * Monitoring Provider
 * Initializes and configures the monitoring service across the app
 */

'use client'

import React, { useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { monitoringService } from '@/services/monitoring'

interface MonitoringProviderProps {
  children: ReactNode
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const { user } = useUser()

  useEffect(() => {
    // Set user ID when user is available
    if (user?.id) {
      monitoringService.setUserId(user.id)
    }

    // Track initial page load
    monitoringService.trackPageView(window.location.pathname, {
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })

    // Track page visibility changes
    const handleVisibilityChange = () => {
      monitoringService.trackActivity('page_visibility_change', {
        visible: !document.hidden,
        url: window.location.href,
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Track unhandled errors
    const handleError = (event: ErrorEvent) => {
      monitoringService.logError(event.error || new Error(event.message), {
        context: 'UnhandledError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: 'high',
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      monitoringService.logError(
        event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason)),
        {
          context: 'UnhandledPromiseRejection',
          severity: 'high',
        }
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [user?.id])

  return <>{children}</>
}

export default MonitoringProvider