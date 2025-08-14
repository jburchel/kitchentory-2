'use client'

import type { ExpirationAlert } from '@/types/alerts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, format } from 'date-fns'

interface ExpirationAlertCardProps {
  alert: ExpirationAlert
  onAcknowledge: (alertId: string) => Promise<void>
  onSnooze: (alertId: string, hours?: number) => Promise<void>
  onDismiss: (alertId: string) => Promise<void>
  loading?: boolean
}

export function ExpirationAlertCard({ 
  alert, 
  onAcknowledge, 
  onSnooze, 
  onDismiss, 
  loading = false 
}: ExpirationAlertCardProps) {
  const getAlertStyles = () => {
    switch (alert.alertType) {
      case 'expired':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          icon: '🚨',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          badge: 'bg-red-100 text-red-800'
        }
      case 'critical':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          icon: '⚠️',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800'
        }
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          icon: '⚡',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      case 'reminder':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          icon: '📅',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800'
        }
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          icon: '📦',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const styles = getAlertStyles()
  
  const getExpirationText = () => {
    if (alert.daysUntilExpiration < 0) {
      return `Expired ${Math.abs(alert.daysUntilExpiration)} days ago`
    } else if (alert.daysUntilExpiration === 0) {
      return 'Expires today'
    } else if (alert.daysUntilExpiration === 1) {
      return 'Expires tomorrow'
    } else {
      return `Expires in ${alert.daysUntilExpiration} days`
    }
  }

  const getAlertTypeLabel = () => {
    switch (alert.alertType) {
      case 'expired':
        return 'EXPIRED'
      case 'critical':
        return 'CRITICAL'
      case 'warning':
        return 'WARNING'
      case 'reminder':
        return 'REMINDER'
      default:
        return 'ALERT'
    }
  }

  return (
    <Card className={`${styles.border} ${styles.bg} border-l-4 p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`text-2xl ${styles.iconColor}`}>
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                {getAlertTypeLabel()}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {alert.category}
              </span>
            </div>
            
            <h3 className={`text-lg font-semibold ${styles.titleColor} mb-1`}>
              {alert.itemName}
            </h3>
            
            <p className="text-sm text-gray-700 mb-2">
              {getExpirationText()}
            </p>
            
            <p className="text-xs text-gray-500">
              Expiration: {format(alert.expirationDate, 'MMM d, yyyy')}
            </p>
            
            <p className="text-xs text-gray-400 mt-1">
              Alert created {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
            </p>
            
            {alert.snoozedUntil && (
              <p className="text-xs text-yellow-600 mt-1">
                ⏰ Snoozed until {format(alert.snoozedUntil, 'MMM d, h:mm a')}
              </p>
            )}
          </div>
        </div>
        
        {/* Priority indicator */}
        <div className="flex-shrink-0 ml-4">
          {alert.priority === 'high' && (
            <div className="w-3 h-3 bg-red-500 rounded-full" title="High Priority" />
          )}
          {alert.priority === 'medium' && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Medium Priority" />
          )}
          {alert.priority === 'low' && (
            <div className="w-3 h-3 bg-blue-500 rounded-full" title="Low Priority" />
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      {!alert.acknowledged && !alert.dismissedAt && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            size="sm"
            onClick={() => onAcknowledge(alert.id)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            ✅ Acknowledge
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSnooze(alert.id, 24)}
            disabled={loading}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            ⏰ Snooze 24h
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSnooze(alert.id, 72)}
            disabled={loading}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            ⏰ Snooze 3d
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDismiss(alert.id)}
            disabled={loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ❌ Dismiss
          </Button>
        </div>
      )}
      
      {alert.acknowledged && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-green-600">
            ✅ <span className="ml-1">Acknowledged</span>
          </div>
        </div>
      )}
      
      {alert.dismissedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            ❌ <span className="ml-1">Dismissed {formatDistanceToNow(alert.dismissedAt, { addSuffix: true })}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
