"use client"

import * as React from "react"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  className?: string
}

function ErrorFallback({ error, resetErrorBoundary, className }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const isDevelopment = process.env.NODE_ENV === "development"

  // Log error to monitoring service in production
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // Log to your error monitoring service (Sentry, LogRocket, etc.)
      console.error("ErrorBoundary caught an error:", error)
    }
  }, [error])

  return (
    <div className={cn(
      "flex items-center justify-center min-h-[400px] p-6",
      className
    )}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We apologize for the inconvenience. An unexpected error occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetErrorBoundary} className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              className="flex-1 sm:flex-none"
            >
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </div>

          {isDevelopment && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                <Bug className="h-4 w-4 mr-2" />
                {showDetails ? "Hide" : "Show"} error details
              </Button>
              
              {showDetails && (
                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-sm text-destructive">
                      Error Details (Development Only)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Message:</h4>
                        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                          {error.message}
                        </p>
                      </div>
                      
                      {error.stack && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Stack trace:</h4>
                          <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
  className?: string
}

export function ErrorBoundary({ 
  children, 
  fallback: Fallback = ErrorFallback,
  onError,
  onReset,
  className 
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo)
    }
    
    // Call custom error handler
    onError?.(error, errorInfo)
  }

  const handleReset = () => {
    // Call custom reset handler
    onReset?.()
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <Fallback {...props} className={className} />
      )}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Specialized error boundaries for specific use cases
export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Route-specific error handling
        console.error("Route error:", { error, errorInfo })
      }}
      onReset={() => {
        // Route-specific reset logic
        window.location.reload()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: React.ReactNode
  componentName: string 
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Card className="p-6">
          <div className="text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Component Error</h3>
              <p className="text-sm text-muted-foreground">
                The {componentName} component failed to load.
              </p>
            </div>
            <Button size="sm" onClick={resetErrorBoundary}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      )}
      onError={(error) => {
        console.error(`${componentName} component error:`, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for imperatively handling errors
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    // Throw error to be caught by nearest error boundary
    throw error
  }, [])
}

// Async error handler for promises
export function handleAsyncError<T>(
  promise: Promise<T>, 
  errorHandler?: (error: Error) => void
): Promise<T> {
  return promise.catch((error) => {
    if (errorHandler) {
      errorHandler(error)
    } else {
      // Default handling
      console.error("Async error:", error)
      throw error
    }
    throw error
  })
}
