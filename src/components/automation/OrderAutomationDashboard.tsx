'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Zap, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Package,
  Mail,
  Webhook,
  Plus,
  Edit3,
  Trash2,
  Activity,
  TrendingUp,
  ShoppingBag,
  Bell,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react'
import { 
  OrderCompletionService, 
  OrderAutomationRule, 
  InventoryUpdateResult,
  OrderWebhookPayload 
} from '@/services/OrderCompletionService'
import { toast } from 'sonner'

export interface OrderAutomationDashboardProps {
  householdId: string
}

export function OrderAutomationDashboard({ householdId }: OrderAutomationDashboardProps) {
  const [automationService] = useState(() => new OrderCompletionService())
  const [automationRules, setAutomationRules] = useState<OrderAutomationRule[]>([])
  const [recentActivity, setRecentActivity] = useState<InventoryUpdateResult[]>([])
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [selectedRule, setSelectedRule] = useState<OrderAutomationRule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    processedToday: 0,
    itemsAddedToday: 0,
    totalValueToday: 0
  })

  useEffect(() => {
    loadAutomationRules()
    loadRecentActivity()
    loadStats()
  }, [])

  const loadAutomationRules = () => {
    const rules = automationService.getAutomationRules()
    setAutomationRules(rules)
  }

  const loadRecentActivity = () => {
    // Mock recent activity data
    const mockActivity: InventoryUpdateResult[] = [
      {
        success: true,
        itemsAdded: 12,
        itemsUpdated: 0,
        itemsSkipped: 2,
        errors: [],
        summary: {
          totalValue: 89.47,
          topCategories: [
            { category: 'fresh', count: 5, value: 23.45 },
            { category: 'refrigerated', count: 4, value: 34.12 },
            { category: 'pantry', count: 3, value: 31.90 }
          ]
        }
      },
      {
        success: true,
        itemsAdded: 8,
        itemsUpdated: 1,
        itemsSkipped: 0,
        errors: [],
        summary: {
          totalValue: 56.23,
          topCategories: [
            { category: 'frozen', count: 3, value: 18.67 },
            { category: 'pantry', count: 5, value: 37.56 }
          ]
        }
      }
    ]
    setRecentActivity(mockActivity)
  }

  const loadStats = () => {
    const rules = automationService.getAutomationRules()
    setStats({
      totalRules: rules.length,
      activeRules: rules.filter(r => r.isActive).length,
      processedToday: 3,
      itemsAddedToday: 20,
      totalValueToday: 145.70
    })
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    const success = automationService.updateAutomationRule(ruleId, { isActive })
    if (success) {
      loadAutomationRules()
      loadStats()
      toast.success(`Rule ${isActive ? 'activated' : 'deactivated'} successfully`)
    } else {
      toast.error('Failed to update rule status')
    }
  }

  const handleEditRule = (rule: OrderAutomationRule) => {
    setSelectedRule(rule)
    setShowRuleEditor(true)
  }

  const handleDeleteRule = async (ruleId: string) => {
    const success = automationService.deleteAutomationRule(ruleId)
    if (success) {
      loadAutomationRules()
      loadStats()
      toast.success('Rule deleted successfully')
    } else {
      toast.error('Failed to delete rule')
    }
  }

  const testWebhook = async (providerId: string) => {
    setIsLoading(true)
    try {
      // Create a mock webhook payload for testing
      const mockPayload: OrderWebhookPayload = {
        orderId: `test_${Date.now()}`,
        storeOrderId: `${providerId}_test_order`,
        providerId,
        status: 'delivered',
        items: [
          {
            productId: 'test_product_1',
            name: 'Test Bananas',
            quantity: 3,
            unitPrice: 1.99,
            totalPrice: 5.97
          },
          {
            productId: 'test_product_2',
            name: 'Test Milk',
            quantity: 1,
            unitPrice: 3.49,
            totalPrice: 3.49
          }
        ],
        metadata: {
          webhookId: 'test_webhook',
          timestamp: new Date().toISOString()
        }
      }

      const result = await automationService.processWebhook(providerId, mockPayload)
      
      if (result.success) {
        toast.success(`Test successful! Would add ${result.itemsAdded} items to inventory`)
      } else {
        toast.error(`Test failed: ${result.errors.map(e => e.error).join(', ')}`)
      }
    } catch (error) {
      toast.error('Test webhook failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getRuleStatusBadge = (rule: OrderAutomationRule) => {
    if (!rule.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'webhook':
        return <Webhook className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'schedule':
        return <Clock className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'add_to_inventory':
        return <Package className="w-4 h-4" />
      case 'send_notification':
        return <Bell className="w-4 h-4" />
      case 'update_shopping_list':
        return <ShoppingBag className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Order Automation
          </h1>
          <p className="text-muted-foreground">
            Automatically update inventory when orders are delivered
          </p>
        </div>
        
        <Button onClick={() => setShowRuleEditor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{stats.totalRules}</p>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed Today</p>
                <p className="text-2xl font-bold">{stats.processedToday}</p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items Added</p>
                <p className="text-2xl font-bold">{stats.itemsAddedToday}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValueToday.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Endpoints</TabsTrigger>
        </TabsList>

        {/* Automation Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      {getRuleStatusBadge(rule)}
                      <Badge variant="outline">{rule.providerId}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRule(rule)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Triggers</p>
                      <div className="space-y-2">
                        {rule.triggers.map((trigger, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {getTriggerIcon(trigger.type)}
                            <span className="text-sm capitalize">{trigger.type}</span>
                            {trigger.conditions.status && (
                              <Badge variant="outline" className="text-xs">
                                {trigger.conditions.status.join(', ')}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Actions</p>
                      <div className="space-y-2">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {getActionIcon(action.type)}
                            <span className="text-sm">{action.type.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Priority: {rule.priority}</span>
                    <span>Updated: {rule.updatedAt.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {activity.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      Order Processing Result
                    </CardTitle>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      Today
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{activity.itemsAdded}</p>
                      <p className="text-sm text-muted-foreground">Items Added</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{activity.itemsUpdated}</p>
                      <p className="text-sm text-muted-foreground">Items Updated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{activity.itemsSkipped}</p>
                      <p className="text-sm text-muted-foreground">Items Skipped</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">${activity.summary.totalValue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                    </div>
                  </div>

                  {activity.summary.topCategories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Top Categories</p>
                      <div className="space-y-1">
                        {activity.summary.topCategories.slice(0, 3).map((category) => (
                          <div key={category.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm capitalize">{category.category}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {category.count} items
                              </Badge>
                              <span className="text-sm font-medium">${category.value.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activity.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-red-600">Errors</p>
                      <div className="space-y-1">
                        {activity.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-700">{error.item}: {error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhook Endpoints Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="space-y-4">
            {['instacart', 'kroger', 'walmart'].map((providerId) => (
              <Card key={providerId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    {providerId.charAt(0).toUpperCase() + providerId.slice(1)} Webhook
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Endpoint URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                        {window.location.origin}{automationService.getWebhookEndpoint(providerId)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(
                          `${window.location.origin}${automationService.getWebhookEndpoint(providerId)}`
                        )}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Supported Events</p>
                    <div className="flex flex-wrap gap-1">
                      {['order.delivered', 'order.completed', 'order.cancelled'].map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => testWebhook(providerId)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Test Webhook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Editor Dialog */}
      <Dialog open={showRuleEditor} onOpenChange={setShowRuleEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Rule editor interface would be implemented here with form fields for
              configuring triggers, conditions, and actions.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={() => setShowRuleEditor(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => setShowRuleEditor(false)}>
                {selectedRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}