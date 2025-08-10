"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  children: React.ReactNode
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl", 
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full"
}

const paddingClasses = {
  none: "",
  sm: "px-4 py-2",
  md: "px-6 py-4", 
  lg: "px-8 py-6"
}

export function ResponsiveContainer({
  size = "lg",
  padding = "md",
  className,
  children,
  ...props
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-first responsive grid
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "md" | "lg"
  children: React.ReactNode
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6"
}

export function ResponsiveGrid({
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  className,
  children,
  ...props
}: ResponsiveGridProps) {
  const gridClasses = [
    "grid",
    gapClasses[gap],
    cols.base && `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(" ")

  return (
    <div className={cn(gridClasses, className)} {...props}>
      {children}
    </div>
  )
}

// Responsive flex container
interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col" | "row-reverse" | "col-reverse"
  wrap?: boolean
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "start" | "center" | "end" | "stretch"
  gap?: "sm" | "md" | "lg"
  responsive?: {
    sm?: Partial<Pick<ResponsiveFlexProps, "direction" | "justify" | "align">>
    md?: Partial<Pick<ResponsiveFlexProps, "direction" | "justify" | "align">>
    lg?: Partial<Pick<ResponsiveFlexProps, "direction" | "justify" | "align">>
  }
  children: React.ReactNode
}

const flexClasses = {
  direction: {
    row: "flex-row",
    col: "flex-col", 
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse"
  },
  justify: {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  },
  align: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch"
  }
}

export function ResponsiveFlex({
  direction = "row",
  wrap = false,
  justify = "start",
  align = "center",
  gap = "md",
  responsive,
  className,
  children,
  ...props
}: ResponsiveFlexProps) {
  const classes = [
    "flex",
    flexClasses.direction[direction],
    wrap && "flex-wrap",
    flexClasses.justify[justify],
    flexClasses.align[align],
    gapClasses[gap],
    // Responsive classes
    responsive?.sm?.direction && `sm:${flexClasses.direction[responsive.sm.direction]}`,
    responsive?.sm?.justify && `sm:${flexClasses.justify[responsive.sm.justify]}`,
    responsive?.sm?.align && `sm:${flexClasses.align[responsive.sm.align]}`,
    responsive?.md?.direction && `md:${flexClasses.direction[responsive.md.direction]}`,
    responsive?.md?.justify && `md:${flexClasses.justify[responsive.md.justify]}`,
    responsive?.md?.align && `md:${flexClasses.align[responsive.md.align]}`,
    responsive?.lg?.direction && `lg:${flexClasses.direction[responsive.lg.direction]}`,
    responsive?.lg?.justify && `lg:${flexClasses.justify[responsive.lg.justify]}`,
    responsive?.lg?.align && `lg:${flexClasses.align[responsive.lg.align]}`,
  ].filter(Boolean).join(" ")

  return (
    <div className={cn(classes, className)} {...props}>
      {children}
    </div>
  )
}

// Mobile-safe area container
export function MobileSafeContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "pb-safe-bottom lg:pb-0", // Add bottom padding for mobile nav on mobile only
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}