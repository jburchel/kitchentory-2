/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { monitoringService } from '@/services/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to monitoring service
    monitoringService.logError(error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary using react-error-boundary
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallbackComponent?: React.ComponentType<any>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

export function ErrorBoundaryWrapper({
  children,
  fallbackComponent: Fallback = ErrorFallback,
  onError,
}: ErrorBoundaryWrapperProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    monitoringService.logError(error, {
      context: 'ErrorBoundaryWrapper',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
    onError?.(error, errorInfo)
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary