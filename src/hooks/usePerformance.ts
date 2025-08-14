/**
 * Performance Monitoring Hook
 * Provides utilities for tracking performance metrics in React components
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { monitoringService } from '@/services/monitoring'

interface PerformanceMetrics {
  renderTime: number
  mountTime: number
  updateTime: number
}

interface UsePerformanceOptions {
  componentName: string
  trackRenders?: boolean
  trackMounts?: boolean
  trackUpdates?: boolean
}

export function usePerformance({
  componentName,
  trackRenders = true,
  trackMounts = true,
  trackUpdates = true,
}: UsePerformanceOptions) {
  const renderStartTime = useRef<number>(0)
  const mountStartTime = useRef<number>(0)
  const updateStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const isMounted = useRef<boolean>(false)

  // Track component mount time
  useEffect(() => {
    if (trackMounts) {
      const mountTime = performance.now() - mountStartTime.current
      monitoringService.recordMetric({
        name: 'component_mount_time',
        value: mountTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          component: componentName,
        },
      })
    }
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [componentName, trackMounts])

  // Track render performance
  useEffect(() => {
    if (trackRenders) {
      renderCount.current += 1
      const renderTime = performance.now() - renderStartTime.current

      monitoringService.recordMetric({
        name: 'component_render_time',
        value: renderTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          component: componentName,
          renderCount: renderCount.current.toString(),
        },
      })
    }
  })

  // Track update performance
  useEffect(() => {
    if (trackUpdates && isMounted.current) {
      const updateTime = performance.now() - updateStartTime.current
      monitoringService.recordMetric({
        name: 'component_update_time',
        value: updateTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          component: componentName,
        },
      })
    }
  })

  // Start timing functions
  const startRenderTiming = useCallback(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now()
    }
  }, [trackRenders])

  const startMountTiming = useCallback(() => {
    if (trackMounts) {
      mountStartTime.current = performance.now()
    }
  }, [trackMounts])

  const startUpdateTiming = useCallback(() => {
    if (trackUpdates) {
      updateStartTime.current = performance.now()
    }
  }, [trackUpdates])

  // Manual timing functions
  const measureAsync = useCallback(
    async <T>(fn: () => Promise<T>, operationName: string): Promise<T> => {
      const startTime = performance.now()
      try {
        const result = await fn()
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'async_operation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            component: componentName,
            operation: operationName,
            status: 'success',
          },
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'async_operation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            component: componentName,
            operation: operationName,
            status: 'error',
          },
        })
        
        throw error
      }
    },
    [componentName]
  )

  const measureSync = useCallback(
    <T>(fn: () => T, operationName: string): T => {
      const startTime = performance.now()
      try {
        const result = fn()
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'sync_operation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            component: componentName,
            operation: operationName,
            status: 'success',
          },
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'sync_operation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            component: componentName,
            operation: operationName,
            status: 'error',
          },
        })
        
        throw error
      }
    },
    [componentName]
  )

  // Initialize timing
  useEffect(() => {
    startMountTiming()
    startRenderTiming()
    startUpdateTiming()
  }, [startMountTiming, startRenderTiming, startUpdateTiming])

  return {
    measureAsync,
    measureSync,
    renderCount: renderCount.current,
    startRenderTiming,
    startMountTiming,
    startUpdateTiming,
  }
}

// Hook for tracking form performance
export function useFormPerformance(formName: string) {
  const submitStartTime = useRef<number>(0)
  const validationStartTime = useRef<number>(0)

  const trackFormSubmit = useCallback(
    async <T>(submitFn: () => Promise<T>): Promise<T> => {
      submitStartTime.current = performance.now()
      
      try {
        const result = await submitFn()
        const duration = performance.now() - submitStartTime.current
        
        monitoringService.recordMetric({
          name: 'form_submit_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            form: formName,
            status: 'success',
          },
        })
        
        monitoringService.trackFormSubmit(formName, { duration, status: 'success' })
        
        return result
      } catch (error) {
        const duration = performance.now() - submitStartTime.current
        
        monitoringService.recordMetric({
          name: 'form_submit_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            form: formName,
            status: 'error',
          },
        })
        
        monitoringService.trackFormSubmit(formName, { 
          duration, 
          status: 'error',
          error: (error as Error).message 
        })
        
        throw error
      }
    },
    [formName]
  )

  const trackValidation = useCallback(
    <T>(validationFn: () => T): T => {
      validationStartTime.current = performance.now()
      
      try {
        const result = validationFn()
        const duration = performance.now() - validationStartTime.current
        
        monitoringService.recordMetric({
          name: 'form_validation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            form: formName,
            status: 'success',
          },
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - validationStartTime.current
        
        monitoringService.recordMetric({
          name: 'form_validation_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            form: formName,
            status: 'error',
          },
        })
        
        throw error
      }
    },
    [formName]
  )

  return {
    trackFormSubmit,
    trackValidation,
  }
}

// Hook for tracking API call performance
export function useApiPerformance() {
  const trackApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      endpoint: string,
      method: string = 'GET'
    ): Promise<T> => {
      const startTime = performance.now()
      
      try {
        const result = await apiCall()
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'api_call_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            endpoint,
            method,
            status: 'success',
          },
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        monitoringService.recordMetric({
          name: 'api_call_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            endpoint,
            method,
            status: 'error',
          },
        })
        
        throw error
      }
    },
    []
  )

  return { trackApiCall }
}

export default usePerformance