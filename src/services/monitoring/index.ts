/**
 * Comprehensive Monitoring Service
 * Handles error logging, performance tracking, and analytics
 */

interface ErrorMetadata {
  context?: string
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp?: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  extra?: Record<string, any>
  [key: string]: any
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
}

interface UserActivity {
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp: number
}

class MonitoringService {
  private isInitialized = false
  private sessionId: string
  private userId?: string
  private errorQueue: Array<{ error: Error; metadata: ErrorMetadata }> = []
  private performanceQueue: PerformanceMetric[] = []
  private activityQueue: UserActivity[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async initialize() {
    try {
      // Initialize performance monitoring
      this.setupPerformanceMonitoring()
      
      // Initialize user activity tracking
      this.setupActivityTracking()
      
      // Start periodic flushing
      this.startPeriodicFlush()
      
      this.isInitialized = true
      console.log('Monitoring service initialized')
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error)
    }
  }

  private setupPerformanceMonitoring() {
    // Web Vitals tracking
    if (typeof window !== 'undefined') {
      // Core Web Vitals
      this.trackWebVitals()
      
      // Navigation timing
      window.addEventListener('load', () => {
        this.trackNavigationTiming()
      })
      
      // Resource timing
      this.trackResourceTiming()
    }
  }

  private trackWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric({
        name: 'lcp',
        value: lastEntry.startTime,
        unit: 'ms',
        timestamp: Date.now(),
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'fid',
          value: (entry as any).processingStart - entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        })
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      this.recordMetric({
        name: 'cls',
        value: clsValue,
        unit: 'score',
        timestamp: Date.now(),
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  private trackNavigationTiming() {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return

    const metrics = [
      { name: 'dns_lookup', value: navigation.domainLookupEnd - navigation.domainLookupStart },
      { name: 'tcp_connect', value: navigation.connectEnd - navigation.connectStart },
      { name: 'ssl_handshake', value: navigation.connectEnd - navigation.secureConnectionStart },
      { name: 'ttfb', value: navigation.responseStart - navigation.requestStart },
      { name: 'response_time', value: navigation.responseEnd - navigation.responseStart },
      { name: 'dom_parse', value: navigation.domContentLoadedEventEnd - navigation.responseEnd },
      { name: 'dom_ready', value: navigation.domContentLoadedEventEnd - navigation.navigationStart },
      { name: 'page_load', value: navigation.loadEventEnd - navigation.navigationStart },
    ]

    metrics.forEach(metric => {
      this.recordMetric({
        name: metric.name,
        value: metric.value,
        unit: 'ms',
        timestamp: Date.now(),
      })
    })
  }

  private trackResourceTiming() {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        this.recordMetric({
          name: 'resource_load',
          value: resource.duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            resource_type: resource.initiatorType,
            resource_url: resource.name,
          },
        })
      }
    }).observe({ entryTypes: ['resource'] })
  }

  private setupActivityTracking() {
    if (typeof window === 'undefined') return

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackActivity('page_visibility_change', {
        visible: !document.hidden,
      })
    })

    // Mouse/touch activity
    let lastActivity = Date.now()
    const trackActivity = () => {
      const now = Date.now()
      if (now - lastActivity > 30000) { // 30 seconds threshold
        this.trackActivity('user_active')
      }
      lastActivity = now
    }

    document.addEventListener('mousedown', trackActivity)
    document.addEventListener('touchstart', trackActivity)
    document.addEventListener('keydown', trackActivity)
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flush()
    }, 30000) // Flush every 30 seconds

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })
    }
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  public logError(error: Error, metadata: ErrorMetadata = {}) {
    const enrichedMetadata: ErrorMetadata = {
      ...metadata,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      severity: metadata.severity || 'medium',
    }

    this.errorQueue.push({ error, metadata: enrichedMetadata })

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Monitoring Service - Error logged:', error, enrichedMetadata)
    }

    // Send critical errors immediately
    if (enrichedMetadata.severity === 'critical') {
      this.flush()
    }
  }

  public recordMetric(metric: PerformanceMetric) {
    this.performanceQueue.push(metric)
  }

  public trackActivity(event: string, properties?: Record<string, any>) {
    const activity: UserActivity = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }

    this.activityQueue.push(activity)
  }

  public async flush() {
    try {
      if (this.errorQueue.length > 0) {
        await this.sendErrors([...this.errorQueue])
        this.errorQueue.length = 0
      }

      if (this.performanceQueue.length > 0) {
        await this.sendMetrics([...this.performanceQueue])
        this.performanceQueue.length = 0
      }

      if (this.activityQueue.length > 0) {
        await this.sendActivities([...this.activityQueue])
        this.activityQueue.length = 0
      }
    } catch (error) {
      console.error('Failed to flush monitoring data:', error)
    }
  }

  private async sendErrors(errors: Array<{ error: Error; metadata: ErrorMetadata }>) {
    try {
      const payload = {
        errors: errors.map(({ error, metadata }) => ({
          message: error.message,
          stack: error.stack,
          name: error.name,
          metadata,
        })),
        sessionId: this.sessionId,
        timestamp: Date.now(),
      }

      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('Would send errors:', payload)
        return
      }

      // Send to your error logging service
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send errors:', error)
    }
  }

  private async sendMetrics(metrics: PerformanceMetric[]) {
    try {
      const payload = {
        metrics,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      }

      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('Would send metrics:', payload)
        return
      }

      // Send to your analytics service
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }

  private async sendActivities(activities: UserActivity[]) {
    try {
      const payload = {
        activities,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      }

      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('Would send activities:', payload)
        return
      }

      // Send to your analytics service
      await fetch('/api/monitoring/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send activities:', error)
    }
  }

  // Utility methods for common tracking scenarios
  public trackPageView(page: string, properties?: Record<string, any>) {
    this.trackActivity('page_view', { page, ...properties })
  }

  public trackClick(element: string, properties?: Record<string, any>) {
    this.trackActivity('click', { element, ...properties })
  }

  public trackFormSubmit(form: string, properties?: Record<string, any>) {
    this.trackActivity('form_submit', { form, ...properties })
  }

  public trackFeatureUse(feature: string, properties?: Record<string, any>) {
    this.trackActivity('feature_use', { feature, ...properties })
  }

  public startTiming(name: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      })
    }
  }
}

export const monitoringService = new MonitoringService()
export default monitoringService