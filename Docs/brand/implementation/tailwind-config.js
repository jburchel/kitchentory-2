/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Kitchentory Brand Colors
      colors: {
        // Brand Primary - Green Gradient System
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#ECFDF5",   // Light tint
          100: "#D1FAE5",  // Subtle background
          200: "#A7F3D0",  // Disabled states
          300: "#6EE7B7",  // Borders, dividers
          400: "#34D399",  // Secondary elements - gradient end (light)
          500: "#10B981",  // Primary brand color - gradient start (light)
          600: "#059669",  // Primary interactions
          700: "#047857",  // Text on light backgrounds - gradient end (dark)
          800: "#065F46",  // High emphasis text - gradient start (dark)
          900: "#064E3B",  // Maximum contrast
        },
        
        // Secondary/Accent Colors
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          orange: {
            400: "#FB923C",
            500: "#F97316", // Primary CTA accent
            600: "#EA580C",
          },
          yellow: {
            400: "#FBBF24", // Warning states
            500: "#F59E0B", // Expiration alerts
          },
        },
        
        // Food Category Colors
        category: {
          produce: "#22C55E",      // Fruits & Vegetables - Green 500
          protein: "#A855F7",      // Proteins - Purple 500
          dairy: "#3B82F6",        // Dairy - Blue 500
          grains: "#EAB308",       // Grains & Bread - Yellow 500
          beverages: "#06B6D4",    // Beverages - Cyan 500
          frozen: "#0EA5E9",       // Frozen Foods - Sky 500
          pantry: "#F97316",       // Pantry Staples - Orange 500
          household: "#84CC16",    // Household Items - Lime 500
        },
        
        // Semantic Colors (WCAG AA Compliant)
        success: {
          DEFAULT: "#10B981",      // Green 600 - Light mode
          dark: "#22C55E",         // Green 500 - Dark mode
          light: "#D1FAE5",        // Green 100 - Background
          border: "#A7F3D0",       // Green 200 - Border
        },
        warning: {
          DEFAULT: "#F59E0B",      // Yellow 500 - Light mode
          dark: "#FCD34D",         // Yellow 300 - Dark mode
          light: "#FEF3C7",        // Yellow 100 - Background
          border: "#FDE68A",       // Yellow 200 - Border
        },
        error: {
          DEFAULT: "#EF4444",      // Red 500 - Light mode
          dark: "#F87171",         // Red 400 - Dark mode
          light: "#FEE2E2",        // Red 100 - Background
          border: "#FECACA",       // Red 200 - Border
        },
        info: {
          DEFAULT: "#3B82F6",      // Blue 500 - Light mode
          dark: "#60A5FA",         // Blue 400 - Dark mode
          light: "#DBEAFE",        // Blue 100 - Background
          border: "#BFDBFE",       // Blue 200 - Border
        },
        
        // Extended Neutral System
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      
      // Typography Scale (Major Third - 1.250)
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],     // Small labels, captions
        'sm': ['14px', { lineHeight: '20px' }],     // Secondary text, form labels
        'base': ['16px', { lineHeight: '24px' }],   // Body text, default size
        'lg': ['18px', { lineHeight: '28px' }],     // Emphasized text, large labels
        'xl': ['20px', { lineHeight: '28px' }],     // Small headings, card titles
        '2xl': ['24px', { lineHeight: '32px' }],    // Section headings
        '3xl': ['30px', { lineHeight: '36px' }],    // Page headings
        '4xl': ['36px', { lineHeight: '40px' }],    // Display headings
      },
      
      // Spacing Scale (8px grid system)
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
      },
      
      // Border Radius (Friendly, rounded feel)
      borderRadius: {
        lg: "var(--radius)",      // 12px - Cards, major components
        md: "calc(var(--radius) - 2px)",  // 10px - Medium components
        sm: "calc(var(--radius) - 4px)",  // 8px - Small components, buttons
      },
      
      // Box Shadow (Subtle depth)
      boxShadow: {
        'brand': '0 1px 3px rgba(16, 185, 129, 0.3)',
        'brand-lg': '0 4px 12px rgba(16, 185, 129, 0.4)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      
      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "bounce-subtle": "bounce-subtle 2s infinite",
      },
      
      // Screen breakpoints (Mobile-first)
      screens: {
        'xs': '480px',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'modal': '1100',
        'popover': '1200',
        'tooltip': '1300',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    
    // Custom plugin for Kitchentory utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Gradient backgrounds
        '.bg-brand-gradient': {
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        },
        '.bg-brand-gradient-dark': {
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
        },
        
        // Focus styles
        '.focus-brand': {
          '&:focus-visible': {
            outline: '2px solid #10B981',
            outlineOffset: '2px',
          }
        },
        
        // Touch targets (44x44px minimum)
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        
        // Screen reader only
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
      }
      
      addUtilities(newUtilities)
    },
    
    // Accessibility plugin
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
            outline: '3px solid #000000',
            outlineOffset: '1px',
          }
        },
      })
    }
  ],
}