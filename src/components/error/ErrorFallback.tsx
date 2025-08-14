/**
 * Error Fallback UI Component
 * Displays when an error boundary catches an error
 */

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Using built-in details/summary instead of collapsible component

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  resetErrorBoundary?: () => void
}

export function ErrorFallback({ error, resetError, resetErrorBoundary }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleReset = () => {
    resetError?.()
    resetErrorBoundary?.()
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">Something went wrong</CardTitle>
          <CardDescription>
            We&apos;re sorry, but an unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleReset} className="flex-1" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleReload} className="flex-1" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome} className="flex-1" variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {(isDevelopment || error) && (
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between" 
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>Error Details</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </Button>
              
              {showDetails && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  {error && (
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-sm">Error Message:</h4>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                          {error.message}
                        </p>
                      </div>
                      {error.stack && isDevelopment && (
                        <div>
                          <h4 className="font-semibold text-sm">Stack Trace:</h4>
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Error ID: {Math.random().toString(36).substr(2, 9)}
                      <br />
                      Time: {new Date().toISOString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If this error persists, please{' '}
              <a 
                href="mailto:support@kitchentory.app" 
                className="text-primary hover:underline"
              >
                contact support
              </a>
              {' '}with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorFallback