'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth Error Boundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Default error UI
      return <DefaultAuthError error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface DefaultAuthErrorProps {
  error: Error
  onRetry: () => void
}

function DefaultAuthError({ error, onRetry }: DefaultAuthErrorProps) {
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch')
  const isAuthError = error.message.includes('auth') || error.message.includes('clerk')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isNetworkError ? 'Connection Error' : 
               isAuthError ? 'Authentication Error' : 
               'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isNetworkError ? 
                'Unable to connect to our servers. Please check your internet connection.' :
               isAuthError ? 
                'There was a problem with authentication. Please try signing in again.' :
                'An unexpected error occurred. Please try again.'}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `

${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={onRetry} className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth/sign-in'}
            >
              Go to Sign In
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Hook for handling auth errors in components
export function useAuthErrorHandler() {
  const handleAuthError = React.useCallback((error: Error) => {
    console.error('Auth error:', error)
    
    // Handle specific error types
    if (error.message.includes('session_token_invalid')) {
      // Redirect to sign in for invalid sessions
      window.location.href = '/auth/sign-in'
      return
    }
    
    if (error.message.includes('network')) {
      // Could show a toast or retry mechanism for network errors
      console.log('Network error detected, consider showing retry option')
    }
    
    // For other errors, you might want to show a toast or modal
    // This depends on your toast/notification system
  }, [])

  return { handleAuthError }
}

// Higher-order component for wrapping auth-related components
export function withAuthErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }
) {
  return function AuthBoundaryWrappedComponent(props: P) {
    return (
      <AuthErrorBoundary 
        fallback={options?.fallback}
        onError={options?.onError}
      >
        <WrappedComponent {...props} />
      </AuthErrorBoundary>
    )
  }
}