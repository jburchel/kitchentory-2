'use client'

import { useState, useEffect } from 'react'
import { useExpirationAlerts } from '@/hooks/useExpirationAlerts'
import { useInventory } from '@/hooks/useInventory'
import { ExpirationAlertCard } from './ExpirationAlertCard'
import { AlertPreferences } from './AlertPreferences'
import { AlertHistory } from './AlertHistory'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AlertDashboard() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'preferences' | 'history'>('alerts')
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Get inventory data to check for expirations - use mock household ID
  const { items: inventoryItems, loading: inventoryLoading } = useInventory('household-1')
  
  // Get alert system
  const {
    alerts,
    preferences,
    history,
    stats,
    loading: alertsLoading,
    error,
    checkExpirations,
    acknowledgeAlert,
    snoozeAlert,
    dismissAlert,
    updatePreferences,
    refreshAlerts
  } = useExpirationAlerts()

  // Check for new expirations when inventory loads or changes
  useEffect(() => {
    if (inventoryItems.length > 0) {
      checkExpirations(inventoryItems)
        .then((newAlerts) => {
          if (newAlerts.length > 0) {
            toast.success(`Found ${newAlerts.length} new expiration alerts`)
          }
        })
        .catch((error) => {
          console.error('Failed to check expirations:', error)
        })
    }
  }, [inventoryItems, checkExpirations, refreshKey])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (inventoryItems.length > 0) {
        checkExpirations(inventoryItems)
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [inventoryItems, checkExpirations])

  const handleRefresh = async () => {
    try {
      refreshAlerts()
      if (inventoryItems.length > 0) {
        await checkExpirations(inventoryItems)
      }
      setRefreshKey(prev => prev + 1)
      toast.success('Alerts refreshed')
    } catch (error) {
      toast.error('Failed to refresh alerts')
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId)
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const handleSnoozeAlert = async (alertId: string, hours?: number) => {
    try {
      await snoozeAlert(alertId, hours)
      const hoursText = hours ? `${hours} hours` : 'default duration'
      toast.success(`Alert snoozed for ${hoursText}`)
    } catch (error) {
      toast.error('Failed to snooze alert')
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId)
      toast.success('Alert dismissed')
    } catch (error) {
      toast.error('Failed to dismiss alert')
    }
  }

  const handleUpdatePreferences = async (newPreferences: any) => {
    try {
      await updatePreferences(newPreferences)
      toast.success('Preferences updated')
    } catch (error) {
      toast.error('Failed to update preferences')
    }
  }

  const loading = alertsLoading || inventoryLoading

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expiration Alerts</h1>
            <p className="text-gray-600">Stay on top of your inventory with smart expiration notifications</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.expiredItemsCount}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.criticalItemsCount}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.warningItemsCount}</div>
          <div className="text-sm text-gray-600">Warning</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.reminderItemsCount}</div>
          <div className="text-sm text-gray-600">Reminders</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'alerts', label: 'Active Alerts', count: stats.totalAlerts },
            { id: 'preferences', label: 'Preferences' },
            { id: 'history', label: 'History', count: history.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && (
        <div>
          {loading && alerts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading alerts...</p>
              </div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active alerts</h3>
              <p className="text-gray-600 mb-4">All your items are in good shape! Check back later for expiration updates.</p>
              <Button onClick={handleRefresh} variant="outline">
                Check for Updates
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {alerts.map((alert) => (
                <ExpirationAlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledgeAlert}
                  onSnooze={handleSnoozeAlert}
                  onDismiss={handleDismissAlert}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <AlertPreferences
          preferences={preferences}
          onUpdate={handleUpdatePreferences}
          loading={loading}
        />
      )}

      {activeTab === 'history' && (
        <AlertHistory
          history={history}
          stats={stats}
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}
    </div>
  )
}
