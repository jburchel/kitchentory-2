'use client'

import type { ExpirationAlert } from '@/types/alerts'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

class EmailAlertService {
  private static instance: EmailAlertService
  private apiEndpoint: string

  private constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_EMAIL_API_ENDPOINT ?? '/api/send-alert-email'
  }

  static getInstance(): EmailAlertService {
    if (!EmailAlertService.instance) {
      EmailAlertService.instance = new EmailAlertService()
    }
    return EmailAlertService.instance
  }

  async sendExpirationAlert(
    email: string, 
    alerts: ExpirationAlert[],
    householdName?: string
  ): Promise<boolean> {
    try {
      const template = this.generateEmailTemplate(alerts, householdName)
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          type: 'expiration_alert'
        })
      })

      if (!response.ok) {
        throw new Error(`Email service responded with ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to send email alert:', error)
      return false
    }
  }

  private generateEmailTemplate(alerts: ExpirationAlert[], householdName?: string): EmailTemplate {
    const expiredCount = alerts.filter(a => a.alertType === 'expired').length
    const criticalCount = alerts.filter(a => a.alertType === 'critical').length
    
    const householdText = householdName ? ` for ${householdName}` : ''
    
    let subject: string
    if (expiredCount > 0) {
      subject = `🚨 ${expiredCount} item${expiredCount > 1 ? 's' : ''} expired${householdText}`
    } else if (criticalCount > 0) {
      subject = `⚠️ ${criticalCount} item${criticalCount > 1 ? 's' : ''} expiring soon${householdText}`
    } else {
      subject = `📅 Kitchen inventory update${householdText}`
    }

    const html = this.generateHTMLContent(alerts, householdName)
    const text = this.generateTextContent(alerts, householdName)

    return { subject, html, text }
  }

  private generateHTMLContent(alerts: ExpirationAlert[], householdName?: string): string {
    const householdText = householdName ? ` for ${householdName}` : ''
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Kitchentory Alert</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .alert-section { margin-bottom: 30px; }
        .alert-section:last-child { margin-bottom: 0; }
        .alert-section h2 { margin: 0 0 15px 0; font-size: 18px; font-weight: 600; }
        .alert-item { background: #f8fafc; border-left: 4px solid #e2e8f0; padding: 15px; margin-bottom: 10px; border-radius: 0 8px 8px 0; }
        .alert-item:last-child { margin-bottom: 0; }
        .alert-item.expired { border-left-color: #ef4444; background: #fef2f2; }
        .alert-item.critical { border-left-color: #f97316; background: #fff7ed; }
        .alert-item.warning { border-left-color: #eab308; background: #fefce8; }
        .alert-item.reminder { border-left-color: #3b82f6; background: #eff6ff; }
        .item-name { font-weight: 600; font-size: 16px; margin-bottom: 5px; }
        .item-details { font-size: 14px; color: #64748b; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥬 Kitchentory Alert</h1>
          <p>Kitchen inventory expiration update${householdText}</p>
        </div>
        
        <div class="content">
          ${this.generateAlertSections(alerts)}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kitchentory.app'}/alerts" class="cta-button">
              View All Alerts
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent by Kitchentory. You can manage your alert preferences in the app.</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  private generateAlertSections(alerts: ExpirationAlert[]): string {
    const sections: string[] = []
    
    // Expired items
    const expiredItems = alerts.filter(a => a.alertType === 'expired')
    if (expiredItems.length > 0) {
      sections.push(`
        <div class="alert-section">
          <h2 style="color: #ef4444;">🚨 Expired Items (${expiredItems.length})</h2>
          ${expiredItems.map(alert => `
            <div class="alert-item expired">
              <div class="item-name">${alert.itemName}</div>
              <div class="item-details">Expired ${Math.abs(alert.daysUntilExpiration)} days ago • Category: ${alert.category}</div>
            </div>
          `).join('')}
        </div>
      `)
    }

    // Critical items
    const criticalItems = alerts.filter(a => a.alertType === 'critical')
    if (criticalItems.length > 0) {
      sections.push(`
        <div class="alert-section">
          <h2 style="color: #f97316;">⚠️ Critical Alerts (${criticalItems.length})</h2>
          ${criticalItems.map(alert => `
            <div class="alert-item critical">
              <div class="item-name">${alert.itemName}</div>
              <div class="item-details">Expires ${alert.daysUntilExpiration === 0 ? 'today' : `in ${alert.daysUntilExpiration} day${alert.daysUntilExpiration > 1 ? 's' : ''}`} • Category: ${alert.category}</div>
            </div>
          `).join('')}
        </div>
      `)
    }

    // Warning items
    const warningItems = alerts.filter(a => a.alertType === 'warning')
    if (warningItems.length > 0) {
      sections.push(`
        <div class="alert-section">
          <h2 style="color: #eab308;">⚡ Expiring Soon (${warningItems.length})</h2>
          ${warningItems.map(alert => `
            <div class="alert-item warning">
              <div class="item-name">${alert.itemName}</div>
              <div class="item-details">Expires in ${alert.daysUntilExpiration} days • Category: ${alert.category}</div>
            </div>
          `).join('')}
        </div>
      `)
    }

    // Reminder items
    const reminderItems = alerts.filter(a => a.alertType === 'reminder')
    if (reminderItems.length > 0) {
      sections.push(`
        <div class="alert-section">
          <h2 style="color: #3b82f6;">📅 Reminders (${reminderItems.length})</h2>
          ${reminderItems.map(alert => `
            <div class="alert-item reminder">
              <div class="item-name">${alert.itemName}</div>
              <div class="item-details">Expires in ${alert.daysUntilExpiration} days • Category: ${alert.category}</div>
            </div>
          `).join('')}
        </div>
      `)
    }

    return sections.join('')
  }

  private generateTextContent(alerts: ExpirationAlert[], householdName?: string): string {
    const householdText = householdName ? ` for ${householdName}` : ''
    
    let content = `KITCHENTORY ALERT - Kitchen inventory update${householdText}\n\n`
    
    const expiredItems = alerts.filter(a => a.alertType === 'expired')
    if (expiredItems.length > 0) {
      content += `EXPIRED ITEMS (${expiredItems.length}):\n`
      expiredItems.forEach(alert => {
        content += `- ${alert.itemName} (expired ${Math.abs(alert.daysUntilExpiration)} days ago)\n`
      })
      content += '\n'
    }

    const criticalItems = alerts.filter(a => a.alertType === 'critical')
    if (criticalItems.length > 0) {
      content += `CRITICAL ALERTS (${criticalItems.length}):\n`
      criticalItems.forEach(alert => {
        const timeText = alert.daysUntilExpiration === 0 ? 'today' : `in ${alert.daysUntilExpiration} day${alert.daysUntilExpiration > 1 ? 's' : ''}`
        content += `- ${alert.itemName} (expires ${timeText})\n`
      })
      content += '\n'
    }

    const warningItems = alerts.filter(a => a.alertType === 'warning')
    if (warningItems.length > 0) {
      content += `EXPIRING SOON (${warningItems.length}):\n`
      warningItems.forEach(alert => {
        content += `- ${alert.itemName} (expires in ${alert.daysUntilExpiration} days)\n`
      })
      content += '\n'
    }

    const reminderItems = alerts.filter(a => a.alertType === 'reminder')
    if (reminderItems.length > 0) {
      content += `REMINDERS (${reminderItems.length}):\n`
      reminderItems.forEach(alert => {
        content += `- ${alert.itemName} (expires in ${alert.daysUntilExpiration} days)\n`
      })
      content += '\n'
    }

    content += `View all alerts: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kitchentory.app'}/alerts\n\n`
    content += 'This email was sent by Kitchentory. You can manage your alert preferences in the app.'
    
    return content
  }

  // Test email functionality
  async sendTestEmail(email: string): Promise<boolean> {
    const testAlert: ExpirationAlert = {
      id: 'test-alert',
      itemId: 'test-item',
      itemName: 'Test Bananas',
      category: 'produce',
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      daysUntilExpiration: 1,
      alertType: 'critical',
      priority: 'high',
      createdAt: new Date(),
      acknowledged: false,
      notificationSent: false,
      emailSent: false
    }

    return this.sendExpirationAlert(email, [testAlert], 'Test Household')
  }
}

export default EmailAlertService
