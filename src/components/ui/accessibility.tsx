"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Screen reader only text
export function ScreenReaderOnly({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "sr-only",
        "absolute left-[-10000px] top-auto width-[1px] height-[1px] overflow-hidden",
        className
      )}
    >
      {children}
    </span>
  )
}

// Skip to content link
export function SkipToContent({ href = "#main-content" }: { href?: string }) {
  return (
    <a
      href={href}
      className={
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 " +
        "bg-background text-foreground px-4 py-2 rounded-md border z-50"
      }
    >
      Skip to content
    </a>
  )
}

// Accessible icon button
interface AccessibleIconButtonProps {
  children: React.ReactNode
  label: string
  description?: string
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function AccessibleIconButton({
  children,
  label,
  description,
  className,
  onClick,
  disabled = false,
  type = "button",
  ...props
}: AccessibleIconButtonProps) {
  const id = React.useId()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-describedby={descriptionId}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-accent hover:text-accent-foreground",
          "h-10 w-10",
          className
        )}
        {...props}
      >
        {children}
        <ScreenReaderOnly>{label}</ScreenReaderOnly>
      </button>
      {description && (
        <div id={descriptionId} className="sr-only">
          {description}
        </div>
      )}
    </>
  )
}

// Focus trap hook
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus the first element
    firstFocusable?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}

// Accessible status announcer
export function LiveRegion({ 
  children, 
  priority = "polite",
  atomic = false,
  className 
}: { 
  children: React.ReactNode
  priority?: "polite" | "assertive"
  atomic?: boolean
  className?: string
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Progress indicator for screen readers
export function AccessibleProgress({ 
  value, 
  max = 100, 
  label,
  description,
  className 
}: { 
  value: number
  max?: number
  label: string
  description?: string
  className?: string
}) {
  const percentage = Math.round((value / max) * 100)
  const id = React.useId()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={className}>
      <div 
        role="progressbar" 
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-describedby={descriptionId}
        className="w-full bg-secondary rounded-full h-2"
      >
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ScreenReaderOnly>
        {label}: {percentage}% complete
      </ScreenReaderOnly>
      {description && (
        <div id={descriptionId} className="sr-only">
          {description}
        </div>
      )}
    </div>
  )
}

// Keyboard navigation helper
export function useKeyboardNavigation({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
}: {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
} = {}) {
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight])

  return { onKeyDown: handleKeyDown }
}

// Accessible form validation announcements
export function useFormAnnouncements() {
  const [announcement, setAnnouncement] = React.useState<string>("")

  const announceError = React.useCallback((message: string) => {
    setAnnouncement(`Error: ${message}`)
    setTimeout(() => setAnnouncement(""), 1000)
  }, [])

  const announceSuccess = React.useCallback((message: string) => {
    setAnnouncement(`Success: ${message}`)
    setTimeout(() => setAnnouncement(""), 1000)
  }, [])

  const announceLoading = React.useCallback((message: string = "Loading") => {
    setAnnouncement(message)
  }, [])

  const clearAnnouncement = React.useCallback(() => {
    setAnnouncement("")
  }, [])

  return {
    announcement,
    announceError,
    announceSuccess,
    announceLoading,
    clearAnnouncement,
  }
}

// ARIA descriptions
export function AriaDescription({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div id={id} className="sr-only">
      {children}
    </div>
  )
}

// Color contrast utilities
export const colorContrastClasses = {
  // High contrast text combinations
  highContrast: {
    light: "text-slate-900 bg-white",
    dark: "text-white bg-slate-900",
  },
  // WCAG AA compliant combinations
  accessible: {
    primary: "text-white bg-blue-600",
    secondary: "text-slate-900 bg-slate-100",
    success: "text-white bg-green-700",
    warning: "text-slate-900 bg-yellow-400",
    error: "text-white bg-red-600",
    info: "text-white bg-blue-600",
  },
}
