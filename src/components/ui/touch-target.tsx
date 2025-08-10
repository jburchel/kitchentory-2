import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Touch Target Utility Component
 * Ensures all interactive elements meet WCAG AA touch target requirements
 * 
 * WCAG AA Requirements:
 * - Minimum touch target size: 44x44px
 * - Minimum spacing between targets: 8px
 * - Exception: elements within a sentence or paragraph
 */

const touchTargetVariants = cva(
  "inline-flex items-center justify-center focus-brand touch-feedback",
  {
    variants: {
      size: {
        default: "touch-target",
        sm: "touch-target-sm", 
        lg: "touch-target-lg",
        icon: "touch-target-icon",
      },
      spacing: {
        default: "",
        touch: "m-1", // 4px margin = 8px spacing
        comfortable: "m-1.5", // 6px margin = 12px spacing
      }
    },
    defaultVariants: {
      size: "default",
      spacing: "default",
    },
  }
)

interface TouchTargetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof touchTargetVariants> {
  asChild?: boolean
}

/**
 * TouchTarget Wrapper Component
 * 
 * @param size - Touch target size variant
 * @param spacing - Spacing between touch targets
 * @param asChild - Render as child component using Slot
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TouchTarget>
 *   <button>Click me</button>
 * </TouchTarget>
 * 
 * // Icon button with proper touch target
 * <TouchTarget size="icon" spacing="touch">
 *   <Button variant="ghost" size="icon">
 *     <Heart className="h-4 w-4" />
 *   </Button>
 * </TouchTarget>
 * 
 * // Small button with responsive touch target
 * <TouchTarget size="sm">
 *   <Button size="sm">Small Button</Button>
 * </TouchTarget>
 * ```
 */
const TouchTarget = React.forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ className, size, spacing, children, ...props }, ref) => {
    return (
      <div
        className={cn(touchTargetVariants({ size, spacing, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TouchTarget.displayName = "TouchTarget"

/**
 * Touch Target Container
 * Provides consistent spacing for multiple touch targets
 */
interface TouchContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "default" | "comfortable"
  direction?: "horizontal" | "vertical"
}

const TouchContainer = React.forwardRef<HTMLDivElement, TouchContainerProps>(
  ({ className, spacing = "default", direction = "horizontal", children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex",
          direction === "horizontal" ? "flex-row" : "flex-col",
          spacing === "default" ? "touch-spacing" : "touch-spacing-lg",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TouchContainer.displayName = "TouchContainer"

/**
 * Utility hook for touch target compliance checking
 * Development helper to ensure components meet requirements
 */
export function useTouchTargetCompliance(elementRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    
    const element = elementRef.current
    if (!element) return
    
    const rect = element.getBoundingClientRect()
    const isCompliant = rect.width >= 44 && rect.height >= 44
    
    if (!isCompliant) {
      console.warn(
        `Touch target compliance warning: Element has size ${rect.width}x${rect.height}px, ` +
        `but should be at least 44x44px for WCAG AA compliance.`,
        element
      )
    }
  }, [elementRef])
}

/**
 * Touch Target Guidelines Component
 * Development utility for documenting proper usage
 */
export function TouchTargetGuidelines() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-sm text-xs opacity-90 hover:opacity-100 transition-opacity">
      <h4 className="font-semibold mb-2">Touch Target Guidelines</h4>
      <ul className="space-y-1 text-muted-foreground">
        <li>• Minimum size: 44×44px</li>
        <li>• Icon buttons: use touch-target-icon</li>
        <li>• Small buttons: use touch-target-sm</li>
        <li>• Spacing: minimum 8px between targets</li>
        <li>• Use TouchContainer for groups</li>
      </ul>
    </div>
  )
}

export { TouchTarget, TouchContainer, touchTargetVariants }
export type { TouchTargetProps, TouchContainerProps }