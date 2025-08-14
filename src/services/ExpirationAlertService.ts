'use client'

import type { InventoryItem } from '@/hooks/useInventory'
import type { ExpirationAlert, AlertPreferences, AlertHistory, AlertStats } from '@/types/alerts'
import { differenceInDays, isAfter, isBefore, addDays, format } from 'date-fns'

class ExpirationAlertService {
  private static instance: ExpirationAlertService
  private alerts: ExpirationAlert[] = []
  private preferences: AlertPreferences
  private history: AlertHistory[] = []
  private dbName = 'kitchentory-alerts'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  private constructor() {
    this.preferences = this.getDefaultPreferences()
    this.initializeDB()
    this.loadPersistedData()
  }

  static getInstance(): ExpirationAlertService {
    if (!ExpirationAlertService.instance) {
      ExpirationAlertService.instance = new ExpirationAlertService()
    }
    return ExpirationAlertService.instance
  }

  private getDefaultPreferences(): AlertPreferences {
    const saved = localStorage.getItem('alert-preferences')
    if (saved) {
      return JSON.parse(saved)
    }

    return {
      enabled: true,
      pushNotifications: true,
      emailNotifications: false,
      reminderDays: 7,
      warningDays: 3,
      criticalDays: 1,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      maxAlertsPerDay: 10,
      snoozeDefaultHours: 24
    }
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create alerts store
        if (!db.objectStoreNames.contains('alerts')) {
          const alertsStore = db.createObjectStore('alerts', { keyPath: 'id' })
          alertsStore.createIndex('itemId', 'itemId', { unique: false })
          alertsStore.createIndex('alertType', 'alertType', { unique: false })
          alertsStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
        
        // Create history store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' })
          historyStore.createIndex('alertId', 'alertId', { unique: false })
          historyStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  private async loadPersistedData(): Promise<void> {
    if (!this.db) return

    try {
      // Load alerts
      const alertsTransaction = this.db.transaction(['alerts'], 'readonly')
      const alertsStore = alertsTransaction.objectStore('alerts')
      const alertsRequest = alertsStore.getAll()
      
      alertsRequest.onsuccess = () => {
        this.alerts = alertsRequest.result.map(alert => ({
          ...alert,
          expirationDate: new Date(alert.expirationDate),
          createdAt: new Date(alert.createdAt),
          snoozedUntil: alert.snoozedUntil ? new Date(alert.snoozedUntil) : undefined,
          dismissedAt: alert.dismissedAt ? new Date(alert.dismissedAt) : undefined
        }))
      }

      // Load history
      const historyTransaction = this.db.transaction(['history'], 'readonly')
      const historyStore = historyTransaction.objectStore('history')
      const historyRequest = historyStore.getAll()
      
      historyRequest.onsuccess = () => {
        this.history = historyRequest.result.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load persisted alert data:', error)
    }
  }

  private async persistAlert(alert: ExpirationAlert): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['alerts'], 'readwrite')
    const store = transaction.objectStore('alerts')
    await store.put(alert)
  }

  private async persistHistory(entry: AlertHistory): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['history'], 'readwrite')
    const store = transaction.objectStore('history')
    await store.put(entry)
  }

  async checkExpirations(items: InventoryItem[]): Promise<ExpirationAlert[]> {
    if (!this.preferences.enabled) return []

    const now = new Date()
    const newAlerts: ExpirationAlert[] = []

    for (const item of items) {
      if (!item.expirationDate) continue

      const daysUntilExpiration = differenceInDays(item.expirationDate, now)
      const alertType = this.getAlertType(daysUntilExpiration)
      
      if (!alertType) continue

      // Check if we already have an alert for this item
      const existingAlert = this.alerts.find(
        alert => alert.itemId === item.id && 
                alert.alertType === alertType &&
                !alert.dismissedAt
      )

      if (existingAlert) {
        // Check if alert is snoozed
        if (existingAlert.snoozedUntil && isBefore(now, existingAlert.snoozedUntil)) {
          continue
        }
        // Update existing alert
        existingAlert.daysUntilExpiration = daysUntilExpiration
      } else {
        // Create new alert
        const newAlert: ExpirationAlert = {
          id: this.generateAlertId(),
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          expirationDate: item.expirationDate,
          daysUntilExpiration,
          alertType,
          priority: this.getAlertPriority(alertType),
          createdAt: now,
          acknowledged: false,
          notificationSent: false,
          emailSent: false
        }

        newAlerts.push(newAlert)
        this.alerts.push(newAlert)
        await this.persistAlert(newAlert)
      }
    }

    // Send notifications for new alerts
    if (newAlerts.length > 0) {
      await this.sendNotifications(newAlerts)
    }

    return newAlerts
  }

  private getAlertType(daysUntilExpiration: number): ExpirationAlert['alertType'] | null {
    if (daysUntilExpiration < 0) return 'expired'
    if (daysUntilExpiration <= this.preferences.criticalDays) return 'critical'
    if (daysUntilExpiration <= this.preferences.warningDays) return 'warning'
    if (daysUntilExpiration <= this.preferences.reminderDays) return 'reminder'
    return null
  }

  private getAlertPriority(alertType: ExpirationAlert['alertType']): ExpirationAlert['priority'] {
    switch (alertType) {
      case 'expired':
      case 'critical':
        return 'high'
      case 'warning':
        return 'medium'
      case 'reminder':
      default:
        return 'low'
    }
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendNotifications(alerts: ExpirationAlert[]): Promise<void> {
    if (!this.preferences.pushNotifications || !('Notification' in window)) return

    // Check quiet hours
    if (this.isQuietHours()) return

    // Limit alerts per day
    const todaysAlerts = this.getTodaysAlertCount()
    if (todaysAlerts >= this.preferences.maxAlertsPerDay) return

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission !== 'granted') return

    for (const alert of alerts) {
      const title = this.getNotificationTitle(alert)
      const body = this.getNotificationBody(alert)
      const icon = '/icons/icon-192x192.png'
      
      const notification = new Notification(title, {
        body,
        icon,
        tag: `expiration-${alert.id}`,
        requireInteraction: alert.priority === 'high',
        data: { alertId: alert.id, itemId: alert.itemId }
      })

      // Handle notification clicks
      notification.onclick = () => {
        window.focus()
        // Navigate to inventory page
        window.location.href = '/inventory'
        notification.close()
      }

      alert.notificationSent = true
      await this.persistAlert(alert)
      
      // Log to history
      await this.addToHistory({
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        alertId: alert.id,
        action: 'sent',
        timestamp: new Date(),
        details: 'Push notification sent'
      })
    }
  }

  private getNotificationTitle(alert: ExpirationAlert): string {
    switch (alert.alertType) {
      case 'expired':
        return `🚨 Item Expired`
      case 'critical':
        return `⚠️ Critical Alert`
      case 'warning':
        return `⚡ Expiring Soon`
      case 'reminder':
        return `📅 Expiration Reminder`
      default:
        return `📦 Kitchentory Alert`
    }
  }

  private getNotificationBody(alert: ExpirationAlert): string {
    const daysText = alert.daysUntilExpiration === 0 ? 'today' :
                    alert.daysUntilExpiration === 1 ? 'tomorrow' :
                    alert.daysUntilExpiration < 0 ? `${Math.abs(alert.daysUntilExpiration)} days ago` :
                    `in ${alert.daysUntilExpiration} days`

    if (alert.alertType === 'expired') {
      return `${alert.itemName} expired ${daysText}`
    } else {
      return `${alert.itemName} expires ${daysText}`
    }
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = format(now, 'HH:mm')
    const startTime = this.preferences.quietHours.startTime
    const endTime = this.preferences.quietHours.endTime

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= startTime && currentTime <= endTime
  }

  private getTodaysAlertCount(): number {
    const today = format(new Date(), 'yyyy-MM-dd')
    return this.history.filter(
      entry => entry.action === 'sent' && 
               format(entry.timestamp, 'yyyy-MM-dd') === today
    ).length
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return

    alert.acknowledged = true
    if (alert.snoozedUntil) delete alert.snoozedUntil
    await this.persistAlert(alert)
    
    await this.addToHistory({
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId,
      action: 'acknowledged',
      timestamp: new Date()
    })
  }

  async snoozeAlert(alertId: string, hours?: number): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return

    const snoozeHours = hours ?? this.preferences.snoozeDefaultHours
    alert.snoozedUntil = addDays(new Date(), snoozeHours / 24)
    await this.persistAlert(alert)
    
    await this.addToHistory({
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId,
      action: 'snoozed',
      timestamp: new Date(),
      details: `Snoozed for ${snoozeHours} hours`
    })
  }

  async dismissAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return

    alert.dismissedAt = new Date()
    await this.persistAlert(alert)
    
    await this.addToHistory({
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId,
      action: 'dismissed',
      timestamp: new Date()
    })
  }

  private async addToHistory(entry: AlertHistory): Promise<void> {
    this.history.push(entry)
    await this.persistHistory(entry)
  }

  getActiveAlerts(): ExpirationAlert[] {
    const now = new Date()
    return this.alerts.filter(
      alert => !alert.dismissedAt &&
               (!alert.snoozedUntil || isAfter(now, alert.snoozedUntil))
    ).sort((a, b) => {
      // Sort by priority and days until expiration
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return a.daysUntilExpiration - b.daysUntilExpiration
    })
  }

  getAlertHistory(limit?: number): AlertHistory[] {
    const sortedHistory = [...this.history].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
    return limit ? sortedHistory.slice(0, limit) : sortedHistory
  }

  getAlertStats(): AlertStats {
    const activeAlerts = this.getActiveAlerts()
    
    return {
      totalAlerts: activeAlerts.length,
      acknowledgedAlerts: this.alerts.filter(a => a.acknowledged).length,
      snoozedAlerts: activeAlerts.filter(a => a.snoozedUntil).length,
      dismissedAlerts: this.alerts.filter(a => a.dismissedAt).length,
      expiredItemsCount: activeAlerts.filter(a => a.alertType === 'expired').length,
      criticalItemsCount: activeAlerts.filter(a => a.alertType === 'critical').length,
      warningItemsCount: activeAlerts.filter(a => a.alertType === 'warning').length,
      reminderItemsCount: activeAlerts.filter(a => a.alertType === 'reminder').length
    }
  }

  getPreferences(): AlertPreferences {
    return { ...this.preferences }
  }

  async updatePreferences(newPreferences: Partial<AlertPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences }
    localStorage.setItem('alert-preferences', JSON.stringify(this.preferences))
  }

  // Cleanup old alerts and history
  async cleanup(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = addDays(new Date(), -daysToKeep)
    
    // Remove old dismissed alerts
    this.alerts = this.alerts.filter(
      alert => !alert.dismissedAt || isAfter(alert.dismissedAt, cutoffDate)
    )
    
    // Remove old history entries
    this.history = this.history.filter(
      entry => isAfter(entry.timestamp, cutoffDate)
    )
    
    // Update IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['alerts', 'history'], 'readwrite')
      await transaction.objectStore('alerts').clear()
      await transaction.objectStore('history').clear()
      
      // Re-persist current data
      for (const alert of this.alerts) {
        await transaction.objectStore('alerts').add(alert)
      }
      
      for (const entry of this.history) {
        await transaction.objectStore('history').add(entry)
      }
    }
  }
}

export default ExpirationAlertService
