'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ExpirationAlert, AlertPreferences, AlertHistory, AlertStats } from '@/types/alerts'
import { InventoryItem } from '@/hooks/useInventory'
import ExpirationAlertService from '@/services/ExpirationAlertService'

export interface UseExpirationAlertsReturn {
  alerts: ExpirationAlert[]
  preferences: AlertPreferences
  history: AlertHistory[]
  stats: AlertStats
  loading: boolean
  error: string | null
  checkExpirations: (items: InventoryItem[]) => Promise<ExpirationAlert[]>
  acknowledgeAlert: (alertId: string) => Promise<void>
  snoozeAlert: (alertId: string, hours?: number) => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  updatePreferences: (preferences: Partial<AlertPreferences>) => Promise<void>
  refreshAlerts: () => void
}

export function useExpirationAlerts(): UseExpirationAlertsReturn {
  const [alerts, setAlerts] = useState<ExpirationAlert[]>([])
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null)
  const [history, setHistory] = useState<AlertHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertService] = useState(() => ExpirationAlertService.getInstance())

  // Initialize service and load data
  useEffect(() => {
    const initializeService = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Wait a bit for service initialization
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Load preferences
        const prefs = alertService.getPreferences()
        setPreferences(prefs)
        
        // Load alerts and history
        refreshAlertsInternal()
        
      } catch (err) {
        setError('Failed to initialize alert service')
        console.error('Alert service initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeService()
  }, [alertService])

  const refreshAlertsInternal = useCallback(() => {
    try {
      const activeAlerts = alertService.getActiveAlerts()
      const alertHistory = alertService.getAlertHistory(50)
      
      setAlerts(activeAlerts)
      setHistory(alertHistory)
    } catch (err) {
      setError('Failed to load alerts')
      console.error('Failed to load alerts:', err)
    }
  }, [alertService])

  const checkExpirations = useCallback(async (items: InventoryItem[]): Promise<ExpirationAlert[]> => {
    try {
      setError(null)
      const newAlerts = await alertService.checkExpirations(items)
      refreshAlertsInternal()
      return newAlerts
    } catch (err) {
      const errorMessage = 'Failed to check expirations'
      setError(errorMessage)
      console.error('Failed to check expirations:', err)
      return []
    }
  }, [alertService, refreshAlertsInternal])

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      setError(null)
      await alertService.acknowledgeAlert(alertId)
      refreshAlertsInternal()
    } catch (err) {
      setError('Failed to acknowledge alert')
      console.error('Failed to acknowledge alert:', err)
    }
  }, [alertService, refreshAlertsInternal])

  const snoozeAlert = useCallback(async (alertId: string, hours?: number): Promise<void> => {
    try {
      setError(null)
      await alertService.snoozeAlert(alertId, hours)
      refreshAlertsInternal()
    } catch (err) {
      setError('Failed to snooze alert')
      console.error('Failed to snooze alert:', err)
    }
  }, [alertService, refreshAlertsInternal])

  const dismissAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      setError(null)
      await alertService.dismissAlert(alertId)
      refreshAlertsInternal()
    } catch (err) {
      setError('Failed to dismiss alert')
      console.error('Failed to dismiss alert:', err)
    }
  }, [alertService, refreshAlertsInternal])

  const updatePreferences = useCallback(async (newPreferences: Partial<AlertPreferences>): Promise<void> => {
    try {
      setError(null)
      await alertService.updatePreferences(newPreferences)
      const updatedPrefs = alertService.getPreferences()
      setPreferences(updatedPrefs)
    } catch (err) {
      setError('Failed to update preferences')
      console.error('Failed to update preferences:', err)
    }
  }, [alertService])

  const refreshAlerts = useCallback(() => {
    refreshAlertsInternal()
  }, [refreshAlertsInternal])

  // Calculate stats
  const stats = useMemo((): AlertStats => {
    if (!alertService) {
      return {
        totalAlerts: 0,
        acknowledgedAlerts: 0,
        snoozedAlerts: 0,
        dismissedAlerts: 0,
        expiredItemsCount: 0,
        criticalItemsCount: 0,
        warningItemsCount: 0,
        reminderItemsCount: 0
      }
    }
    return alertService.getAlertStats()
  }, [alertService, alerts])

  // Automatic cleanup effect - run weekly
  useEffect(() => {
    const cleanup = async () => {
      try {
        await alertService.cleanup(30) // Keep 30 days of history
        refreshAlertsInternal()
      } catch (err) {
        console.error('Failed to cleanup old alerts:', err)
      }
    }

    // Run cleanup on mount and then weekly
    cleanup()
    const interval = setInterval(cleanup, 7 * 24 * 60 * 60 * 1000) // Weekly
    
    return () => clearInterval(interval)
  }, [alertService, refreshAlertsInternal])

  return {
    alerts,
    preferences: preferences || {
      enabled: true,
      pushNotifications: true,
      emailNotifications: false,
      reminderDays: 7,
      warningDays: 3,
      criticalDays: 1,
      quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' },
      maxAlertsPerDay: 10,
      snoozeDefaultHours: 24
    },
    history,
    stats,
    loading,
    error,
    checkExpirations,
    acknowledgeAlert,
    snoozeAlert,
    dismissAlert,
    updatePreferences,
    refreshAlerts
  }
}
