'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type CustomTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  customTheme: CustomTheme
  setCustomTheme: (theme: CustomTheme) => void
  resolvedTheme: 'light' | 'dark'
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [customTheme, setCustomThemeState] = useState<CustomTheme>('default')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      const savedCustomTheme = localStorage.getItem('customTheme') as CustomTheme | null
      
      if (savedTheme) {
        setThemeState(savedTheme)
      }
      if (savedCustomTheme) {
        setCustomThemeState(savedCustomTheme)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Handle system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        if (theme === 'system') {
          const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
          setResolvedTheme(newResolvedTheme)
          updateThemeOnDocument(newResolvedTheme, customTheme)
        }
      }

      handleChange() // Set initial value
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, customTheme])

  // Update resolved theme when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme !== 'system') {
        setResolvedTheme(theme)
        updateThemeOnDocument(theme, customTheme)
      } else {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newResolvedTheme)
        updateThemeOnDocument(newResolvedTheme, customTheme)
      }
    }
  }, [theme, customTheme])

  const updateThemeOnDocument = (theme: 'light' | 'dark', customTheme: CustomTheme) => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-midnight')
    
    // Add current theme classes
    root.classList.add(theme)
    if (customTheme !== 'default') {
      root.classList.add(`theme-${customTheme}`)
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name=theme-color]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  const setCustomTheme = (newCustomTheme: CustomTheme) => {
    setCustomThemeState(newCustomTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('customTheme', newCustomTheme)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        customTheme,
        setCustomTheme,
        resolvedTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}