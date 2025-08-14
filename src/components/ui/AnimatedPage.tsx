'use client'

import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedPage({ children, className = '', delay = 0 }: AnimatedPageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export function AnimatedList({ children, className = '' }: AnimatedPageProps) {
  return (
    <div className={cn('stagger-children', className)}>
      {children}
    </div>
  )
}

export function AnimatedItem({ children, className = '', delay = 0 }: AnimatedPageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 100)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export function FadeIn({ children, className = '', delay = 0 }: AnimatedPageProps) {
  return (
    <div 
      className={cn('animate-in fade-scale-in', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function SlideIn({ 
  children, 
  className = '', 
  direction = 'left' 
}: AnimatedPageProps & { direction?: 'left' | 'right' }) {
  return (
    <div className={cn(
      direction === 'left' ? 'slide-in-left' : 'slide-in-right',
      className
    )}>
      {children}
    </div>
  )
}