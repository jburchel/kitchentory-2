export interface ExpirationAlert {
  id: string
  itemId: string
  itemName: string
  category: string
  expirationDate: Date
  daysUntilExpiration: number
  alertType: 'expired' | 'critical' | 'warning' | 'reminder'
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
  acknowledged: boolean
  snoozedUntil?: Date
  dismissedAt?: Date
  notificationSent: boolean
  emailSent: boolean
}

export interface AlertPreferences {
  enabled: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  reminderDays: number // Days before expiration to send reminder (default: 7)
  warningDays: number // Days before expiration to send warning (default: 3)
  criticalDays: number // Days before expiration to send critical alert (default: 1)
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string // HH:mm format
  }
  maxAlertsPerDay: number
  snoozeDefaultHours: number
}

export interface AlertHistory {
  id: string
  alertId: string
  action: 'sent' | 'acknowledged' | 'snoozed' | 'dismissed' | 'expired'
  timestamp: Date
  details?: string
}

export interface AlertStats {
  totalAlerts: number
  acknowledgedAlerts: number
  snoozedAlerts: number
  dismissedAlerts: number
  expiredItemsCount: number
  criticalItemsCount: number
  warningItemsCount: number
  reminderItemsCount: number
}

export interface AlertSummary {
  date: string
  alertCount: number
  expiredItems: number
  criticalItems: number
  warningItems: number
  reminderItems: number
}
