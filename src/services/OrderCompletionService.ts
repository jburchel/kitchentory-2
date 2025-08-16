import { StoreOrder, StoreOrderItem, UserStoreConnection } from '@/types/stores'

export interface OrderWebhookPayload {
  orderId: string
  storeOrderId: string
  providerId: string
  status: string
  items: OrderWebhookItem[]
  deliveryInfo?: {
    deliveredAt: string
    trackingNumber?: string
    deliveryPhotos?: string[]
  }
  metadata?: {
    webhookId: string
    timestamp: string
    signature?: string
  }
}

export interface OrderWebhookItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  substitution?: {
    originalProductName: string
    replacementProductName: string
    reason: string
  }
  unavailable?: boolean
  refundAmount?: number
}

export interface EmailOrderConfirmation {
  from: string
  subject: string
  body: string
  receivedAt: Date
  attachments?: Array<{
    filename: string
    content: string
    type: string
  }>
}

export interface OrderAutomationRule {
  id: string
  name: string
  providerId: string
  triggers: OrderTrigger[]
  actions: OrderAction[]
  isActive: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderTrigger {
  type: 'webhook' | 'email' | 'schedule' | 'manual'
  conditions: {
    status?: string[]
    keywords?: string[]
    sender?: string[]
    timeframe?: {
      start: string
      end: string
    }
  }
}

export interface OrderAction {
  type: 'add_to_inventory' | 'update_shopping_list' | 'send_notification' | 'sync_with_receipt'
  parameters: {
    categoryMapping?: { [key: string]: string }
    quantityMultiplier?: number
    defaultExpiration?: number
    notificationChannels?: string[]
    customMapping?: { [key: string]: any }
  }
}

export interface InventoryUpdateResult {
  success: boolean
  itemsAdded: number
  itemsUpdated: number
  itemsSkipped: number
  errors: Array<{
    item: string
    error: string
  }>
  summary: {
    totalValue: number
    topCategories: Array<{
      category: string
      count: number
      value: number
    }>
  }
}

export class OrderCompletionService {
  private automationRules: Map<string, OrderAutomationRule> = new Map()
  private webhookEndpoints: Map<string, string> = new Map()
  
  constructor() {
    this.initializeDefaultRules()
    this.setupWebhookEndpoints()
  }

  private initializeDefaultRules() {
    const defaultRules: OrderAutomationRule[] = [
      {
        id: 'instacart_delivery_auto_add',
        name: 'Instacart Delivery Auto-Add',
        providerId: 'instacart',
        triggers: [{
          type: 'webhook',
          conditions: {
            status: ['delivered', 'completed']
          }
        }],
        actions: [{
          type: 'add_to_inventory',
          parameters: {
            categoryMapping: {
              'produce': 'fresh',
              'dairy': 'refrigerated',
              'meat': 'refrigerated',
              'frozen': 'frozen',
              'pantry': 'pantry'
            },
            defaultExpiration: 7 // days
          }
        }],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kroger_email_confirmation',
        name: 'Kroger Email Order Confirmation',
        providerId: 'kroger',
        triggers: [{
          type: 'email',
          conditions: {
            sender: ['noreply@kroger.com', 'orders@kroger.com'],
            keywords: ['order delivered', 'pickup ready', 'order complete']
          }
        }],
        actions: [{
          type: 'add_to_inventory',
          parameters: {
            categoryMapping: {
              'fresh produce': 'fresh',
              'dairy': 'refrigerated',
              'meat & seafood': 'refrigerated'
            }
          }
        }],
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'walmart_delivery_notification',
        name: 'Walmart Delivery Notification',
        providerId: 'walmart',
        triggers: [{
          type: 'email',
          conditions: {
            sender: ['no-reply@walmart.com'],
            keywords: ['delivered', 'order has been delivered']
          }
        }],
        actions: [{
          type: 'add_to_inventory',
          parameters: {}
        }, {
          type: 'send_notification',
          parameters: {
            notificationChannels: ['app', 'email']
          }
        }],
        isActive: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule)
    })
  }

  private setupWebhookEndpoints() {
    this.webhookEndpoints.set('instacart', '/api/webhooks/instacart')
    this.webhookEndpoints.set('kroger', '/api/webhooks/kroger')
    this.webhookEndpoints.set('walmart', '/api/webhooks/walmart')
  }

  public async processWebhook(
    providerId: string,
    payload: OrderWebhookPayload,
    signature?: string
  ): Promise<InventoryUpdateResult> {
    try {
      // Verify webhook signature if provided
      if (signature && !this.verifyWebhookSignature(providerId, payload, signature)) {
        throw new Error('Invalid webhook signature')
      }

      // Find applicable automation rules
      const applicableRules = this.getApplicableRules(providerId, 'webhook', payload)
      
      if (applicableRules.length === 0) {
        return {
          success: false,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsSkipped: 0,
          errors: [{ item: 'webhook', error: 'No applicable automation rules found' }],
          summary: { totalValue: 0, topCategories: [] }
        }
      }

      // Process each rule
      let combinedResult: InventoryUpdateResult = {
        success: true,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        errors: [],
        summary: { totalValue: 0, topCategories: [] }
      }

      for (const rule of applicableRules) {
        const result = await this.executeRule(rule, payload)
        this.mergeResults(combinedResult, result)
      }

      return combinedResult
    } catch (error) {
      return {
        success: false,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        errors: [{ 
          item: 'webhook_processing', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }],
        summary: { totalValue: 0, topCategories: [] }
      }
    }
  }

  public async processEmailConfirmation(
    email: EmailOrderConfirmation
  ): Promise<InventoryUpdateResult> {
    try {
      // Extract order information from email
      const orderInfo = await this.parseEmailForOrderInfo(email)
      
      if (!orderInfo) {
        return {
          success: false,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsSkipped: 0,
          errors: [{ item: 'email_parsing', error: 'Could not extract order information from email' }],
          summary: { totalValue: 0, topCategories: [] }
        }
      }

      // Find applicable rules for email triggers
      const applicableRules = this.getApplicableRulesForEmail(email)
      
      if (applicableRules.length === 0) {
        return {
          success: false,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsSkipped: 0,
          errors: [{ item: 'email_rules', error: 'No applicable automation rules found for email' }],
          summary: { totalValue: 0, topCategories: [] }
        }
      }

      // Convert email data to webhook-like payload for processing
      const mockPayload: OrderWebhookPayload = {
        orderId: orderInfo.orderId || `email_${Date.now()}`,
        storeOrderId: orderInfo.storeOrderId || `email_${Date.now()}`,
        providerId: orderInfo.providerId || 'unknown',
        status: 'delivered',
        items: orderInfo.items || []
      }

      // Process rules
      let combinedResult: InventoryUpdateResult = {
        success: true,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        errors: [],
        summary: { totalValue: 0, topCategories: [] }
      }

      for (const rule of applicableRules) {
        const result = await this.executeRule(rule, mockPayload)
        this.mergeResults(combinedResult, result)
      }

      return combinedResult
    } catch (error) {
      return {
        success: false,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        errors: [{ 
          item: 'email_processing', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }],
        summary: { totalValue: 0, topCategories: [] }
      }
    }
  }

  private async parseEmailForOrderInfo(email: EmailOrderConfirmation): Promise<any> {
    const body = email.body.toLowerCase()
    let providerId = 'unknown'
    
    // Detect provider from email
    if (email.from.includes('instacart') || body.includes('instacart')) {
      providerId = 'instacart'
    } else if (email.from.includes('kroger') || body.includes('kroger')) {
      providerId = 'kroger'
    } else if (email.from.includes('walmart') || body.includes('walmart')) {
      providerId = 'walmart'
    }

    // Extract order ID using regex patterns
    let orderId = null
    const orderIdPatterns = [
      /order\s*(?:id|number|#)\s*:?\s*([a-z0-9-]+)/i,
      /order\s+([a-z0-9-]+)/i,
      /#([a-z0-9-]+)/i
    ]

    for (const pattern of orderIdPatterns) {
      const match = email.body.match(pattern)
      if (match) {
        orderId = match[1]
        break
      }
    }

    // Basic item extraction (this would need to be more sophisticated for production)
    const items: OrderWebhookItem[] = []
    const itemLines = email.body.split('\n').filter(line => {
      const l = line.toLowerCase()
      return (l.includes('$') && !l.includes('total') && !l.includes('tax') && !l.includes('fee'))
    })

    itemLines.forEach((line, index) => {
      const priceMatch = line.match(/\$(\d+\.\d{2})/)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        const name = line.replace(/\$[\d.]+/, '').replace(/\d+x?/, '').trim()
        
        if (name.length > 2) {
          items.push({
            productId: `email_item_${index}`,
            name: name,
            quantity: 1,
            unitPrice: price,
            totalPrice: price
          })
        }
      }
    })

    return {
      orderId,
      storeOrderId: orderId,
      providerId,
      items
    }
  }

  private getApplicableRules(
    providerId: string, 
    triggerType: string, 
    payload: OrderWebhookPayload
  ): OrderAutomationRule[] {
    return Array.from(this.automationRules.values()).filter(rule => {
      if (!rule.isActive || rule.providerId !== providerId) {
        return false
      }

      return rule.triggers.some(trigger => {
        if (trigger.type !== triggerType) return false
        
        if (trigger.conditions.status) {
          return trigger.conditions.status.includes(payload.status)
        }
        
        return true
      })
    }).sort((a, b) => a.priority - b.priority)
  }

  private getApplicableRulesForEmail(email: EmailOrderConfirmation): OrderAutomationRule[] {
    return Array.from(this.automationRules.values()).filter(rule => {
      if (!rule.isActive) return false

      return rule.triggers.some(trigger => {
        if (trigger.type !== 'email') return false
        
        const { sender, keywords } = trigger.conditions
        
        // Check sender
        if (sender && !sender.some(s => email.from.includes(s))) {
          return false
        }
        
        // Check keywords
        if (keywords) {
          const bodyLower = email.body.toLowerCase()
          const subjectLower = email.subject.toLowerCase()
          
          return keywords.some(keyword => 
            bodyLower.includes(keyword.toLowerCase()) || 
            subjectLower.includes(keyword.toLowerCase())
          )
        }
        
        return true
      })
    }).sort((a, b) => a.priority - b.priority)
  }

  private async executeRule(
    rule: OrderAutomationRule, 
    payload: OrderWebhookPayload
  ): Promise<InventoryUpdateResult> {
    let result: InventoryUpdateResult = {
      success: true,
      itemsAdded: 0,
      itemsUpdated: 0,
      itemsSkipped: 0,
      errors: [],
      summary: { totalValue: 0, topCategories: [] }
    }

    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'add_to_inventory':
            const inventoryResult = await this.addItemsToInventory(payload.items, action.parameters)
            this.mergeResults(result, inventoryResult)
            break
            
          case 'send_notification':
            await this.sendNotification(payload, action.parameters)
            break
            
          case 'update_shopping_list':
            await this.updateShoppingList(payload, action.parameters)
            break
            
          default:
            console.warn(`Unknown action type: ${action.type}`)
        }
      } catch (error) {
        result.errors.push({
          item: `action_${action.type}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return result
  }

  private async addItemsToInventory(
    items: OrderWebhookItem[], 
    parameters: any
  ): Promise<InventoryUpdateResult> {
    const result: InventoryUpdateResult = {
      success: true,
      itemsAdded: 0,
      itemsUpdated: 0,
      itemsSkipped: 0,
      errors: [],
      summary: { totalValue: 0, topCategories: [] }
    }

    const categoryMapping = parameters.categoryMapping || {}
    const defaultExpiration = parameters.defaultExpiration || 7
    const quantityMultiplier = parameters.quantityMultiplier || 1

    for (const item of items) {
      try {
        if (item.unavailable) {
          result.itemsSkipped++
          continue
        }

        const category = this.mapItemCategory(item.name, categoryMapping)
        const inventoryItem = {
          name: item.name,
          quantity: item.quantity * quantityMultiplier,
          category: category,
          price: item.unitPrice,
          totalValue: item.totalPrice,
          dateAdded: new Date(),
          expirationDate: new Date(Date.now() + defaultExpiration * 24 * 60 * 60 * 1000),
          source: 'order-automation',
          metadata: {
            orderId: item.productId,
            substitution: item.substitution
          }
        }

        // This would integrate with your actual inventory service
        // For now, we'll just simulate the addition
        result.itemsAdded++
        result.summary.totalValue += item.totalPrice

        // Update category summary
        const existingCategory = result.summary.topCategories.find(c => c.category === category)
        if (existingCategory) {
          existingCategory.count++
          existingCategory.value += item.totalPrice
        } else {
          result.summary.topCategories.push({
            category,
            count: 1,
            value: item.totalPrice
          })
        }

      } catch (error) {
        result.errors.push({
          item: item.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Sort categories by value
    result.summary.topCategories.sort((a, b) => b.value - a.value)

    return result
  }

  private mapItemCategory(itemName: string, categoryMapping: { [key: string]: string }): string {
    const name = itemName.toLowerCase()
    
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (name.includes(key.toLowerCase())) {
        return value
      }
    }

    // Default categorization
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
      return 'refrigerated'
    } else if (name.includes('apple') || name.includes('banana') || name.includes('lettuce')) {
      return 'fresh'
    } else if (name.includes('bread') || name.includes('cereal') || name.includes('pasta')) {
      return 'pantry'
    } else if (name.includes('frozen') || name.includes('ice cream')) {
      return 'frozen'
    }

    return 'general'
  }

  private async sendNotification(payload: OrderWebhookPayload, parameters: any): Promise<void> {
    const channels = parameters.notificationChannels || ['app']
    const message = `Order ${payload.storeOrderId} has been delivered with ${payload.items.length} items.`
    
    // This would integrate with your notification service
    console.log(`Sending notification via ${channels.join(', ')}: ${message}`)
  }

  private async updateShoppingList(payload: OrderWebhookPayload, parameters: any): Promise<void> {
    // This would integrate with your shopping list service
    console.log(`Updating shopping list based on order ${payload.orderId}`)
  }

  private verifyWebhookSignature(providerId: string, payload: any, signature: string): boolean {
    // This would implement actual signature verification for each provider
    // For demo purposes, we'll just return true
    return true
  }

  private mergeResults(target: InventoryUpdateResult, source: InventoryUpdateResult): void {
    target.itemsAdded += source.itemsAdded
    target.itemsUpdated += source.itemsUpdated
    target.itemsSkipped += source.itemsSkipped
    target.errors.push(...source.errors)
    target.summary.totalValue += source.summary.totalValue
    
    // Merge categories
    source.summary.topCategories.forEach(sourceCategory => {
      const existingCategory = target.summary.topCategories.find(c => c.category === sourceCategory.category)
      if (existingCategory) {
        existingCategory.count += sourceCategory.count
        existingCategory.value += sourceCategory.value
      } else {
        target.summary.topCategories.push({ ...sourceCategory })
      }
    })
    
    target.success = target.success && source.success
  }

  public getAutomationRules(): OrderAutomationRule[] {
    return Array.from(this.automationRules.values())
  }

  public addAutomationRule(rule: OrderAutomationRule): void {
    this.automationRules.set(rule.id, rule)
  }

  public updateAutomationRule(ruleId: string, updates: Partial<OrderAutomationRule>): boolean {
    const rule = this.automationRules.get(ruleId)
    if (!rule) return false
    
    const updatedRule = { ...rule, ...updates, updatedAt: new Date() }
    this.automationRules.set(ruleId, updatedRule)
    return true
  }

  public deleteAutomationRule(ruleId: string): boolean {
    return this.automationRules.delete(ruleId)
  }

  public getWebhookEndpoint(providerId: string): string | undefined {
    return this.webhookEndpoints.get(providerId)
  }
}