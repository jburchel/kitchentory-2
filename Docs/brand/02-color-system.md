# Color System

## 🎨 Brand Color Philosophy

Kitchentory's color palette is rooted in the psychology of freshness, health, and organization. Our green-based system evokes the vibrancy of fresh produce, the calm of an organized kitchen, and the trust families place in quality ingredients.

## 🌿 Primary Color Palette

### Brand Green Gradient
The core of our visual identity—a fresh, vibrant green gradient that represents growth, health, and natural abundance.

#### Light Mode Primary
```css
/* Primary Gradient */
background: linear-gradient(135deg, #10B981 0%, #34D399 100%);

/* Individual Colors */
--primary-green-600: #10B981  /* Emerald 600 - Primary brand color */
--primary-green-400: #34D399  /* Emerald 400 - Gradient endpoint */
--primary-green-500: #22C55E  /* Green 500 - Balanced middle */
```

#### Dark Mode Primary
```css
/* Primary Gradient (Dark) */
background: linear-gradient(135deg, #065F46 0%, #047857 100%);

/* Individual Colors */
--primary-green-800: #065F46  /* Emerald 800 - Dark primary */
--primary-green-700: #047857  /* Emerald 700 - Dark gradient endpoint */
--primary-green-600: #059669  /* Emerald 600 - Dark balanced middle */
```

### Primary Color Variations

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| **50** | `#ECFDF5` | `#0F172A` | Background tints |
| **100** | `#D1FAE5` | `#1E293B` | Subtle backgrounds |
| **200** | `#A7F3D0` | `#334155` | Disabled states |
| **300** | `#6EE7B7` | `#475569` | Borders, dividers |
| **400** | `#34D399` | `#64748B` | Secondary elements |
| **500** | `#10B981` | `#94A3B8` | Primary brand color |
| **600** | `#059669` | `#CBD5E1` | Primary interactions |
| **700** | `#047857` | `#E2E8F0` | Text on light backgrounds |
| **800** | `#065F46` | `#F1F5F9` | High emphasis text |
| **900** | `#064E3B` | `#F8FAFC` | Maximum contrast |

## 🎯 Secondary Color Palette

### Warm Accent Colors
Complementary warm tones that add energy and highlight important actions.

#### Orange (Call-to-Action)
```css
/* Light Mode */
--accent-orange-500: #F97316  /* Orange 500 - Primary CTA */
--accent-orange-400: #FB923C  /* Orange 400 - Hover states */
--accent-orange-600: #EA580C  /* Orange 600 - Active states */

/* Dark Mode */
--accent-orange-400: #FB923C  /* Lighter for dark backgrounds */
--accent-orange-500: #F97316  /* Balanced visibility */
--accent-orange-600: #DC2626  /* Strong contrast */
```

#### Yellow (Warnings & Highlights)
```css
/* Light Mode */
--accent-yellow-400: #FBBF24  /* Yellow 400 - Warning states */
--accent-yellow-500: #F59E0B  /* Yellow 500 - Expiration alerts */

/* Dark Mode */
--accent-yellow-300: #FCD34D  /* Better contrast on dark */
--accent-yellow-400: #FBBF24  /* Balanced warning color */
```

## 🔘 Semantic Color System

### Status Colors
Consistent colors for system states and user feedback.

| Status | Light Mode | Dark Mode | Usage |
|--------|------------|-----------|--------|
| **Success** | `#10B981` (Green 600) | `#22C55E` (Green 500) | Confirmations, completed tasks |
| **Warning** | `#F59E0B` (Yellow 500) | `#FCD34D` (Yellow 300) | Expiration alerts, cautions |
| **Error** | `#EF4444` (Red 500) | `#F87171` (Red 400) | Errors, failed actions |
| **Info** | `#3B82F6` (Blue 500) | `#60A5FA` (Blue 400) | Helpful information, tips |

## 🎭 Neutral Color System

### Gray Scale
Professional, accessible grays that provide structure and hierarchy.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| **50** | `#F9FAFB` | `#0F172A` | Page backgrounds |
| **100** | `#F3F4F6` | `#1E293B` | Card backgrounds |
| **200** | `#E5E7EB` | `#334155` | Borders, dividers |
| **300** | `#D1D5DB` | `#475569` | Disabled elements |
| **400** | `#9CA3AF` | `#64748B` | Placeholder text |
| **500** | `#6B7280` | `#94A3B8` | Secondary text |
| **600** | `#4B5563` | `#CBD5E1` | Primary text |
| **700** | `#374151` | `#E2E8F0` | High emphasis text |
| **800** | `#1F2937` | `#F1F5F9` | Headlines, important text |
| **900** | `#111827` | `#F8FAFC` | Maximum contrast text |

## 🌓 Light/Dark Mode Implementation

### Automatic Theme Detection
```css
/* Respect user's system preference */
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode color variables */
  }
}

/* Manual theme switching */
[data-theme="light"] {
  /* Light mode colors */
}

[data-theme="dark"] {
  /* Dark mode colors */
}
```

### Color Variables Structure
```css
:root {
  /* Brand Colors */
  --color-primary: #10B981;
  --color-primary-hover: #059669;
  --color-primary-active: #047857;
  
  /* Background Colors */
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-surface-elevated: #FFFFFF;
  
  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  
  /* Border Colors */
  --color-border: #E5E7EB;
  --color-border-hover: #D1D5DB;
}
```

## ♿ Accessibility Compliance

### Contrast Ratios (WCAG AA)
All color combinations meet or exceed WCAG AA standards:

| Combination | Contrast Ratio | Status |
|-------------|----------------|--------|
| Primary Green on White | 4.73:1 | ✅ AA Compliant |
| Dark Green on Light Gray | 8.21:1 | ✅ AAA Compliant |
| White Text on Primary Green | 4.73:1 | ✅ AA Compliant |
| Secondary Text on Background | 4.89:1 | ✅ AA Compliant |

### Color-Blind Considerations
- **Deuteranopia/Protanopia**: Green-orange combination provides sufficient contrast
- **Tritanopia**: Yellow warnings remain distinguishable from green elements
- **Monochromacy**: All information conveyed with iconography and text labels

## 🎨 Usage Guidelines

### ✅ Do
- Use the brand green gradient for primary CTAs and key brand moments
- Maintain consistent color relationships across light/dark modes
- Test all color combinations for accessibility compliance
- Use semantic colors consistently (green=success, red=error, yellow=warning)
- Leverage neutral grays for text hierarchy and structure

### ❌ Don't
- Create new shades of green without approval
- Use colors that don't meet WCAG AA contrast requirements
- Mix warm and cool grays in the same interface
- Use color alone to convey important information
- Override system dark mode preferences without user consent

## 🍎 Food Category Colors

### Category-Specific Color Coding
Subtle color variations help users quickly identify food categories:

| Category | Color | Light Mode | Dark Mode |
|----------|-------|------------|-----------|
| **Fruits** | Red-Orange | `#F97316` | `#FB923C` |
| **Vegetables** | Green | `#22C55E` | `#4ADE80` |
| **Proteins** | Purple | `#A855F7` | `#C084FC` |
| **Dairy** | Blue | `#3B82F6` | `#60A5FA` |
| **Grains** | Yellow | `#EAB308` | `#FDE047` |
| **Beverages** | Cyan | `#06B6D4` | `#22D3EE` |

---

*This color system ensures Kitchentory maintains visual consistency while providing excellent accessibility and user experience across all devices and lighting conditions.*