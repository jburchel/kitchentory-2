'use client'

import { useState } from 'react'
import { AlertPreferences as AlertPreferencesType } from '@/types/alerts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AlertPreferencesProps {
  preferences: AlertPreferencesType
  onUpdate: (preferences: Partial<AlertPreferencesType>) => Promise<void>
  loading?: boolean
}

export function AlertPreferences({ preferences, onUpdate, loading = false }: AlertPreferencesProps) {
  const [formData, setFormData] = useState(preferences)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onUpdate(formData)
      toast.success('Alert preferences updated successfully')
    } catch (error) {
      toast.error('Failed to update preferences')
      console.error('Failed to update preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AlertPreferencesType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuietHoursChange = (field: 'enabled' | 'startTime' | 'endTime', value: any) => {
    setFormData(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Preferences</h2>
        <p className="text-gray-600">Configure how and when you receive expiration alerts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable Alerts</label>
                <p className="text-sm text-gray-600">Turn expiration alerts on or off</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-sm text-gray-600">Receive browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pushNotifications}
                  onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                <p className="text-sm text-gray-600">Receive email alerts (coming soon)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 opacity-50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Alert Timing */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Timing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder (days before)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.reminderDays}
                onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Early reminder notification</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warning (days before)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.warningDays}
                onChange={(e) => handleInputChange('warningDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Warning notification</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Critical (days before)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.criticalDays}
                onChange={(e) => handleInputChange('criticalDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Critical alert</p>
            </div>
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable Quiet Hours</label>
                <p className="text-sm text-gray-600">Disable notifications during certain times</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.quietHours.enabled}
                  onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {formData.quietHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.quietHours.startTime}
                    onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.quietHours.endTime}
                    onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Advanced Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Alerts Per Day
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxAlertsPerDay}
                onChange={(e) => handleInputChange('maxAlertsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Limit daily notifications</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Snooze (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.snoozeDefaultHours}
                onChange={(e) => handleInputChange('snoozeDefaultHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default snooze duration</p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData(preferences)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
