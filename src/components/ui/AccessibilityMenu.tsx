'use client'

import { useState, useEffect } from 'react'
import { 
  Settings2, 
  Eye, 
  Type, 
  Volume2,
  Zap,
  Contrast,
  Focus,
  Keyboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'

interface AccessibilitySettings {
  fontSize: number
  contrast: 'normal' | 'high' | 'highest'
  reduceMotion: boolean
  focusIndicator: boolean
  keyboardNavigation: boolean
  screenReaderMode: boolean
}

export function AccessibilityMenu() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    contrast: 'normal',
    reduceMotion: false,
    focusIndicator: true,
    keyboardNavigation: true,
    screenReaderMode: false,
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      applySettings(parsed)
    }
  }, [])

  // Apply settings to document
  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${newSettings.fontSize}%`

    // Contrast
    root.classList.remove('contrast-normal', 'contrast-high', 'contrast-highest')
    root.classList.add(`contrast-${newSettings.contrast}`)

    // Reduce motion
    if (newSettings.reduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Focus indicator
    if (newSettings.focusIndicator) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }

    // Screen reader mode
    if (newSettings.screenReaderMode) {
      root.setAttribute('aria-live', 'polite')
      root.classList.add('screen-reader-mode')
    } else {
      root.removeAttribute('aria-live')
      root.classList.remove('screen-reader-mode')
    }

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    applySettings(newSettings)
  }

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      contrast: 'normal',
      reduceMotion: false,
      focusIndicator: true,
      keyboardNavigation: true,
      screenReaderMode: false,
    }
    setSettings(defaultSettings)
    applySettings(defaultSettings)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9"
          aria-label="Accessibility settings"
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Accessibility settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Accessibility Settings</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Font Size */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="text-sm">Font Size</span>
            </div>
            <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            min={75}
            max={150}
            step={5}
            className="w-full"
          />
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Contrast */}
        <DropdownMenuLabel className="text-xs">Contrast</DropdownMenuLabel>
        {(['normal', 'high', 'highest'] as const).map((level) => (
          <DropdownMenuItem
            key={level}
            onClick={() => updateSetting('contrast', level)}
            className="gap-2"
          >
            <Contrast className="h-4 w-4" />
            <span className="capitalize">{level}</span>
            {settings.contrast === level && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Toggle Options */}
        <DropdownMenuCheckboxItem
          checked={settings.reduceMotion}
          onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
        >
          <Zap className="h-4 w-4 mr-2" />
          Reduce Motion
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.focusIndicator}
          onCheckedChange={(checked) => updateSetting('focusIndicator', checked)}
        >
          <Focus className="h-4 w-4 mr-2" />
          Focus Indicators
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.keyboardNavigation}
          onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Keyboard Navigation
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.screenReaderMode}
          onCheckedChange={(checked) => updateSetting('screenReaderMode', checked)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Screen Reader Mode
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={resetSettings}>
          Reset to Defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}