"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  center?: boolean
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
}

const paddingClasses = {
  none: "",
  sm: "px-4 sm:px-6",
  md: "px-4 sm:px-6 lg:px-8",
  lg: "px-4 sm:px-8 lg:px-12 xl:px-16",
}

export function ResponsiveContainer({
  children,
  className,
  size = "lg",
  padding = "md",
  center = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        sizeClasses[size],
        paddingClasses[padding],
        center && "mx-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive grid components
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-4 sm:gap-6 lg:gap-8",
  xl: "gap-6 sm:gap-8 lg:gap-10 xl:gap-12",
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const gridColsClass = cn(
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols["2xl"] && `2xl:grid-cols-${cols["2xl"]}`
  )

  return (
    <div className={cn("grid", gridColsClass, gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Responsive flex components
interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: "row" | "col" | "row-reverse" | "col-reverse"
  wrap?: boolean
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: {
    direction?: {
      sm?: "row" | "col" | "row-reverse" | "col-reverse"
      md?: "row" | "col" | "row-reverse" | "col-reverse"
      lg?: "row" | "col" | "row-reverse" | "col-reverse"
    }
  }
}

export function ResponsiveFlex({
  children,
  className,
  direction = "row",
  wrap = false,
  justify = "start",
  align = "center",
  gap = "md",
  responsive,
}: ResponsiveFlexProps) {
  const flexClasses = cn(
    "flex",
    `flex-${direction}`,
    wrap && "flex-wrap",
    `justify-${justify}`,
    `items-${align}`,
    gapClasses[gap],
    responsive?.direction?.sm && `sm:flex-${responsive.direction.sm}`,
    responsive?.direction?.md && `md:flex-${responsive.direction.md}`,
    responsive?.direction?.lg && `lg:flex-${responsive.direction.lg}`
  )

  return <div className={cn(flexClasses, className)}>{children}</div>
}

// Responsive spacing utilities
export const spacing = {
  none: "",
  xs: "space-y-1 sm:space-y-2",
  sm: "space-y-2 sm:space-y-4",
  md: "space-y-4 sm:space-y-6",
  lg: "space-y-6 sm:space-y-8",
  xl: "space-y-8 sm:space-y-12",
}

export const responsiveSpacing = {
  section: "py-8 sm:py-12 lg:py-16",
  component: "py-4 sm:py-6 lg:py-8",
  element: "py-2 sm:py-3 lg:py-4",
}

// Responsive text utilities
export const responsiveText = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base",
  base: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
  xl: "text-xl sm:text-2xl",
  "2xl": "text-2xl sm:text-3xl",
  "3xl": "text-3xl sm:text-4xl",
  "4xl": "text-4xl sm:text-5xl",
}

// Screen size utilities
export const screenSizes = {
  xs: "(min-width: 475px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
}

// Hook for responsive values
export function useResponsive() {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024
  const isLargeDesktop = windowSize.width >= 1280

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  }
}
