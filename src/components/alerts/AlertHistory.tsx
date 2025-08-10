'use client'

import { AlertHistory as AlertHistoryType, AlertStats } from '@/types/alerts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, format } from 'date-fns'

interface AlertHistoryProps {
  history: AlertHistoryType[]
  stats: AlertStats
  onRefresh: () => void
  loading?: boolean
}

export function AlertHistory({ history, stats, onRefresh, loading = false }: AlertHistoryProps) {
  const getActionIcon = (action: AlertHistoryType['action']) => {
    switch (action) {
      case 'sent':
        return '📱'
      case 'acknowledged':
        return '✅'
      case 'snoozed':
        return '⏰'
      case 'dismissed':
        return '❌'
      case 'expired':
        return '⚠️'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: AlertHistoryType['action']) => {
    switch (action) {
      case 'sent':
        return 'text-blue-600'
      case 'acknowledged':
        return 'text-green-600'
      case 'snoozed':
        return 'text-yellow-600'
      case 'dismissed':
        return 'text-gray-600'
      case 'expired':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActionLabel = (action: AlertHistoryType['action']) => {
    switch (action) {
      case 'sent':
        return 'Alert Sent'
      case 'acknowledged':
        return 'Acknowledged'
      case 'snoozed':
        return 'Snoozed'
      case 'dismissed':
        return 'Dismissed'
      case 'expired':
        return 'Expired'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert History</h2>
          <p className="text-gray-600">Track your expiration alert activities</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalAlerts}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.acknowledgedAlerts}</div>
          <div className="text-sm text-gray-600">Acknowledged</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.snoozedAlerts}</div>
          <div className="text-sm text-gray-600">Snoozed</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.dismissedAlerts}</div>
          <div className="text-sm text-gray-600">Dismissed</div>
        </Card>
      </div>

      {/* Alert Type Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{stats.expiredItemsCount}</div>
            <div className="text-sm text-red-700">Expired</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{stats.criticalItemsCount}</div>
            <div className="text-sm text-orange-700">Critical</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{stats.warningItemsCount}</div>
            <div className="text-sm text-yellow-700">Warning</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.reminderItemsCount}</div>
            <div className="text-sm text-blue-700">Reminder</div>
          </div>
        </div>
      </Card>

      {/* History Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No alert history yet</h3>
            <p className="text-gray-600">Alert activities will appear here once you start receiving notifications</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {getActionIcon(entry.action)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                      {getActionLabel(entry.action)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    Alert ID: {entry.alertId.slice(-8)}
                  </p>
                  
                  {entry.details && (
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.details}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {format(entry.timestamp, 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Clear History Option */}
      {history.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 mb-4">
            History is automatically cleaned up after 30 days
          </p>
        </div>
      )}
    </div>
  )
}
