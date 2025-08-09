"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Typography component props
interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

// Headings
export function H1({ children, className, as: Component = "h1", ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function H2({ children, className, as: Component = "h2", ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function H3({ children, className, as: Component = "h3", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function H4({ children, className, as: Component = "h4", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function H5({ children, className, as: Component = "h5", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function H6({ children, className, as: Component = "h6", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("scroll-m-20 text-base font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Body text
export function P({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Large text
export function Large({ children, className, as: Component = "div", ...props }: TypographyProps) {
  return (
    <Component className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </Component>
  )
}

// Small text
export function Small({ children, className, as: Component = "small", ...props }: TypographyProps) {
  return (
    <Component className={cn("text-sm font-medium leading-none", className)} {...props}>
      {children}
    </Component>
  )
}

// Muted text
export function Muted({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </Component>
  )
}

// Code
export function Code({ children, className, as: Component = "code", ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Blockquote
export function Blockquote({ children, className, as: Component = "blockquote", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Lead text
export function Lead({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Lists
export function List({ children, className, as: Component = "ul", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function OrderedList({ children, className, as: Component = "ol", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function ListItem({ children, className, as: Component = "li", ...props }: TypographyProps) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

// Kitchen-specific typography components
export function ProductName({ children, className, ...props }: Omit<TypographyProps, "children"> & { children: string }) {
  return (
    <H4 className={cn("text-foreground capitalize", className)} {...props}>
      {children.toLowerCase()}
    </H4>
  )
}

export function CategoryLabel({ children, className, ...props }: Omit<TypographyProps, "children"> & { children: string }) {
  return (
    <Small className={cn("text-primary font-medium uppercase tracking-wide", className)} {...props}>
      {children}
    </Small>
  )
}

export function StatusText({ 
  children, 
  className, 
  status = "default",
  ...props 
}: Omit<TypographyProps, "children"> & { 
  children: string
  status?: "default" | "success" | "warning" | "error" | "info"
}) {
  const statusColors = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  }

  return (
    <Small className={cn("font-medium", statusColors[status], className)} {...props}>
      {children}
    </Small>
  )
}

export function ExpirationText({ 
  children, 
  className, 
  daysUntilExpiry,
  ...props 
}: Omit<TypographyProps, "children"> & { 
  children: string
  daysUntilExpiry?: number
}) {
  let status: "success" | "warning" | "error" = "success"
  
  if (daysUntilExpiry !== undefined) {
    if (daysUntilExpiry <= 0) status = "error"
    else if (daysUntilExpiry <= 3) status = "warning"
  }

  return (
    <StatusText status={status} className={className} {...props}>
      {children}
    </StatusText>
  )
}

// Typography variants object for programmatic use
export const typographyVariants = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "scroll-m-20 text-lg font-semibold tracking-tight",
  h6: "scroll-m-20 text-base font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  blockquote: "mt-6 border-l-2 pl-6 italic",
  list: "my-6 ml-6 list-disc [&>li]:mt-2",
  orderedList: "my-6 ml-6 list-decimal [&>li]:mt-2",
}

// Responsive typography utilities
export const responsiveTypography = {
  title: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
  subtitle: "text-lg sm:text-xl lg:text-2xl font-semibold",
  body: "text-sm sm:text-base leading-relaxed",
  caption: "text-xs sm:text-sm text-muted-foreground",
}
