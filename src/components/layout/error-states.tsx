"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home, WifiOff, Database, Bug, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"

interface ErrorStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  className?: string
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "We encountered an error. Please try again.",
  action,
  icon = <AlertTriangle className="h-12 w-12 text-destructive" />,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specific error states
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Problem"
      description="Please check your internet connection and try again."
      icon={<WifiOff className="h-12 w-12 text-destructive" />}
      action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined}
    />
  )
}

export function DatabaseError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Database Error"
      description="We're having trouble accessing your data. Please try again in a moment."
      icon={<Database className="h-12 w-12 text-destructive" />}
      action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
    />
  )
}

export function NotFoundError({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon={<AlertTriangle className="h-12 w-12 text-muted-foreground" />}
      action={onGoHome ? { label: "Go Home", onClick: onGoHome } : undefined}
    />
  )
}

export function UnexpectedError({ onRetry, error }: { 
  onRetry?: () => void
  error?: Error 
}) {
  const [showDetails, setShowDetails] = React.useState(false)
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      <div className="flex flex-col items-center space-y-2">
        <Bug className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Unexpected Error</h2>
        <p className="text-muted-foreground max-w-md">
          Something unexpected happened. Our team has been notified.
        </p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {error && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        )}
      </div>
      
      {showDetails && error && (
        <Card className="mt-4 max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-sm">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-left overflow-auto bg-muted p-3 rounded">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Empty state
export function EmptyState({ 
  title = "No items found",
  description = "Get started by adding your first item.",
  action,
  icon = <Package className="h-12 w-12 text-muted-foreground" />,
  className 
}: ErrorStateProps & { icon?: React.ReactNode }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Form validation error
export function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}