import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#ECFDF5',   // Emerald 50
          100: '#D1FAE5',  // Emerald 100
          200: '#A7F3D0',  // Emerald 200
          300: '#6EE7B7',  // Emerald 300
          400: '#34D399',  // Emerald 400
          500: '#10B981',  // PRIMARY BRAND - Emerald 600
          600: '#059669',  // Emerald 700
          700: '#047857',  // Emerald 800
          800: '#065F46',  // Emerald 900
          900: '#064E3B',  // Emerald 950
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Food Category Colors - Brand Compliant
        category: {
          produce: 'hsl(var(--color-category-produce))',     // Green 500 - Fruits & Vegetables
          protein: 'hsl(var(--color-category-protein))',     // Purple 500 - Proteins  
          dairy: 'hsl(var(--color-category-dairy))',         // Blue 500 - Dairy
          grains: 'hsl(var(--color-category-grains))',       // Yellow 500 - Grains & Bread
          beverages: 'hsl(var(--color-category-beverages))', // Cyan 500 - Beverages
          frozen: 'hsl(var(--color-category-frozen))',       // Sky 500 - Frozen Foods
          pantry: 'hsl(var(--color-category-pantry))',       // Orange 500 - Pantry Staples
          household: 'hsl(var(--color-category-household))', // Lime 500 - Household Items
        },
        // Semantic Colors - Brand Compliant
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          bg: 'hsl(var(--color-success-bg))',
          border: 'hsl(var(--color-success-border))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          bg: 'hsl(var(--color-warning-bg))',
          border: 'hsl(var(--color-warning-border))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          bg: 'hsl(var(--color-error-bg))',
          border: 'hsl(var(--color-error-border))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          bg: 'hsl(var(--color-info-bg))',
          border: 'hsl(var(--color-info-border))',
        },
        // Surface & Background
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    
    // Brand utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Gradient backgrounds
        '.bg-brand-gradient': {
          background: 'var(--gradient-primary)',
        },
        '.bg-surface-gradient': {
          background: 'var(--gradient-surface)',
        },
        
        // Focus styles for accessibility
        '.focus-brand': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--ring))',
            outlineOffset: '2px',
          }
        },
        
        // Touch targets (44x44px minimum)
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
      }
      
      addUtilities(newUtilities)
    },
    
    // Accessibility support
    function({ addBase }) {
      addBase({
        // Respect reduced motion preferences
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
        // High contrast mode support
        '@media (prefers-contrast: high)': {
          '.focus-brand:focus-visible': {
            outline: '3px solid hsl(var(--foreground))',
            outlineOffset: '1px',
          },
        },
      })
    }
  ],
}
export default config
