/**
 * Analytics Integration
 * Provides analytics tracking utilities and integrations
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

// Google Analytics Configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

interface EventParameters {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

interface PageViewParameters {
  page_title?: string
  page_location?: string
  content_group1?: string
  content_group2?: string
  custom_map?: Record<string, any>
}

class Analytics {
  private isInitialized = false
  private isProduction = process.env.NODE_ENV === 'production'

  constructor() {
    if (typeof window !== 'undefined' && this.isProduction && GA_MEASUREMENT_ID) {
      this.initializeGoogleAnalytics()
    }
  }

  private initializeGoogleAnalytics() {
    if (this.isInitialized || !GA_MEASUREMENT_ID) return

    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments)
    }

    // Configure Google Analytics
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })

    this.isInitialized = true
    console.log('Google Analytics initialized')
  }

  // Track page views
  public pageView(url: string, parameters?: PageViewParameters) {
    if (!this.isProduction) {
      console.log('Analytics: Page view', { url, parameters })
      return
    }

    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_title: parameters?.page_title || document.title,
        page_location: parameters?.page_location || window.location.href,
        ...parameters,
      })
    }
  }

  // Track custom events
  public event(parameters: EventParameters) {
    if (!this.isProduction) {
      console.log('Analytics: Event', parameters)
      return
    }

    if (window.gtag) {
      const { action, category, label, value, ...customParameters } = parameters
      
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...customParameters,
      })
    }
  }

  // Track user interactions
  public trackInteraction(element: string, action: string, additionalData?: Record<string, any>) {
    this.event({
      action: 'interaction',
      category: 'User Interaction',
      label: `${element}_${action}`,
      element,
      interaction_action: action,
      ...additionalData,
    })
  }

  // Track form submissions
  public trackFormSubmission(formName: string, success: boolean, additionalData?: Record<string, any>) {
    this.event({
      action: 'form_submit',
      category: 'Form',
      label: formName,
      form_name: formName,
      success: success,
      ...additionalData,
    })
  }

  // Track feature usage
  public trackFeatureUsage(feature: string, additionalData?: Record<string, any>) {
    this.event({
      action: 'feature_use',
      category: 'Feature',
      label: feature,
      feature_name: feature,
      ...additionalData,
    })
  }

  // Track errors
  public trackError(error: Error, context?: string) {
    this.event({
      action: 'exception',
      category: 'Error',
      label: error.message,
      description: error.stack?.substring(0, 150) || error.message,
      fatal: false,
      context: context || 'Unknown',
    })
  }

  // Track performance metrics
  public trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.event({
      action: 'timing_complete',
      category: 'Performance',
      label: metric,
      value: Math.round(value),
      metric_name: metric,
      metric_unit: unit,
    })
  }

  // Track search queries
  public trackSearch(query: string, results: number, category?: string) {
    this.event({
      action: 'search',
      category: 'Search',
      label: query,
      search_term: query,
      search_results: results,
      search_category: category,
    })
  }

  // Track inventory actions
  public trackInventoryAction(action: string, itemId?: string, category?: string) {
    this.event({
      action: 'inventory_action',
      category: 'Inventory',
      label: action,
      inventory_action: action,
      item_id: itemId,
      item_category: category,
    })
  }

  // Track shopping list actions
  public trackShoppingAction(action: string, listId?: string, itemCount?: number) {
    this.event({
      action: 'shopping_action',
      category: 'Shopping',
      label: action,
      shopping_action: action,
      list_id: listId,
      item_count: itemCount,
    })
  }

  // Track recipe interactions
  public trackRecipeAction(action: string, recipeId?: string, recipeName?: string) {
    this.event({
      action: 'recipe_action',
      category: 'Recipe',
      label: action,
      recipe_action: action,
      recipe_id: recipeId,
      recipe_name: recipeName,
    })
  }

  // Track user engagement
  public trackEngagement(engagementTime: number, scrollDepth: number) {
    this.event({
      action: 'engagement',
      category: 'Engagement',
      label: 'page_engagement',
      engagement_time_msec: engagementTime,
      scroll_depth: scrollDepth,
    })
  }

  // Set user properties
  public setUserProperties(properties: Record<string, any>) {
    if (!this.isProduction) {
      console.log('Analytics: User properties', properties)
      return
    }

    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        custom_map: properties,
      })
    }
  }

  // Consent management
  public grantConsent() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
  }

  public denyConsent() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }
  }
}

export const analytics = new Analytics()

// React hook for analytics
export function useAnalytics() {
  return {
    pageView: analytics.pageView.bind(analytics),
    event: analytics.event.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackInventoryAction: analytics.trackInventoryAction.bind(analytics),
    trackShoppingAction: analytics.trackShoppingAction.bind(analytics),
    trackRecipeAction: analytics.trackRecipeAction.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
  }
}

export default analytics