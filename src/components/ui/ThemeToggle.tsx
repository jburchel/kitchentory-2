'use client'

import { Moon, Sun, Monitor, Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme, customTheme, setCustomTheme, resolvedTheme, isLoading } = useTheme()

  // Don't render until client-side hydration is complete
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  const customThemes = [
    { value: 'default', label: 'Default', color: '#10b981' },
    { value: 'ocean', label: 'Ocean', color: '#0ea5e9' },
    { value: 'forest', label: 'Forest', color: '#22c55e' },
    { value: 'sunset', label: 'Sunset', color: '#f97316' },
    { value: 'midnight', label: 'Midnight', color: '#6366f1' },
  ] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {theme === value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        {customThemes.map(({ value, label, color }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setCustomTheme(value)}
            className="gap-2"
          >
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
            {customTheme === value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="h-4 w-4" />}
      {theme === 'dark' && <Moon className="h-4 w-4" />}
      {theme === 'system' && <Monitor className="h-4 w-4" />}
      <span className="sr-only">Current theme: {theme}</span>
    </Button>
  )
}