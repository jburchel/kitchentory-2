# Iconography System

## 🎨 Icon Philosophy

Kitchentory's iconography emphasizes clarity, consistency, and universal recognition. Our icons are designed to help users quickly identify food categories and navigate the app efficiently, regardless of language or cultural background.

## 🎯 Design Principles

### Core Icon Characteristics
- **Outlined Style**: Clean 2px stroke weight for consistency
- **Rounded Corners**: 2px radius for friendly, approachable feel
- **24px Grid System**: Designed on 24x24px artboard with 2px padding
- **Minimal Detail**: Focus on essential shapes for quick recognition
- **Universal Recognition**: Culturally neutral and globally understood

### Technical Specifications
```svg
<!-- Standard Icon Template -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

## 🍎 Food Category Icons

### Primary Food Categories

#### Fruits & Vegetables 🥕
```svg
<!-- Carrot Icon (Representative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M8 17L16 9M8 17C8 17 11 19 14 16C17 13 15 10 15 10M8 17L5 20M16 9C16 9 19 6 16 3C13 0 10 2 10 2M16 9L19 6" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Apple Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 20C16 20 20 16 20 12S16 4 12 4S4 8 4 12S8 20 12 20Z" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M12 4C12 4 13 2 15 2" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```
**Usage**: Fresh produce, fruits, vegetables  
**Color**: `--color-category-produce` (#22C55E)

#### Proteins 🥩
```svg
<!-- Meat/Fish Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6 12C6 8 8 6 12 6S18 8 18 12C18 16 16 18 12 18S6 16 6 12Z" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M9 12H15M12 9V15" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Egg Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 21C15 21 17 18 17 14C17 10 15 7 12 3C9 7 7 10 7 14C7 18 9 21 12 21Z" 
        stroke="currentColor" stroke-width="2"/>
</svg>
```
**Usage**: Meat, fish, eggs, plant proteins  
**Color**: `--color-category-protein` (#A855F7)

#### Dairy Products 🥛
```svg
<!-- Milk Glass Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M8 21H16C17 21 18 20 18 19V8L16 3H8L6 8V19C6 20 7 21 8 21Z" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M6 8H18" stroke="currentColor" stroke-width="2"/>
</svg>

<!-- Cheese Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M4 18H20L18 6H6L4 18Z" stroke="currentColor" stroke-width="2"/>
  <circle cx="10" cy="12" r="1" fill="currentColor"/>
  <circle cx="14" cy="10" r="1" fill="currentColor"/>
  <circle cx="12" cy="14" r="1" fill="currentColor"/>
</svg>
```
**Usage**: Milk, cheese, yogurt, butter  
**Color**: `--color-category-dairy` (#3B82F6)

#### Grains & Bread 🍞
```svg
<!-- Bread Loaf Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M4 12C4 8 6 6 12 6S20 8 20 12V16C20 18 18 20 16 20H8C6 20 4 18 4 16V12Z" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M8 12V16M12 12V16M16 12V16" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Grain Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 3V8M12 8L8 12M12 8L16 12M12 8V21" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```
**Usage**: Bread, pasta, rice, cereals  
**Color**: `--color-category-grains` (#EAB308)

#### Beverages 🥤
```svg
<!-- Beverage Cup Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M5 11V19C5 20 6 21 7 21H17C18 21 19 20 19 19V11" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M3 11H21" stroke="currentColor" stroke-width="2"/>
  <path d="M8 7V3H16V7" stroke="currentColor" stroke-width="2"/>
</svg>

<!-- Water Drop Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 21C15 21 17 19 17 16C17 13 12 7 12 7S7 13 7 16C7 19 9 21 12 21Z" 
        stroke="currentColor" stroke-width="2"/>
</svg>
```
**Usage**: Water, juice, soda, coffee, tea  
**Color**: `--color-category-beverages` (#06B6D4)

#### Frozen Foods ❄️
```svg
<!-- Snowflake Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2V22M6 6L18 18M18 6L6 18M8 12H16M12 8L8 4M12 8L16 4M12 16L8 20M12 16L16 20" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```
**Usage**: Frozen vegetables, ice cream, frozen meals  
**Color**: `--color-category-frozen` (#0EA5E9)

#### Pantry Staples 🥫
```svg
<!-- Can Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6 6H18V18C18 19 17 20 16 20H8C7 20 6 19 6 18V6Z" 
        stroke="currentColor" stroke-width="2"/>
  <ellipse cx="12" cy="6" rx="6" ry="2" stroke="currentColor" stroke-width="2"/>
  <path d="M6 6V8M18 6V8" stroke="currentColor" stroke-width="2"/>
</svg>

<!-- Jar Icon (Alternative) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M8 4H16V6H18V20C18 21 17 22 16 22H8C7 22 6 21 6 20V6H8V4Z" 
        stroke="currentColor" stroke-width="2"/>
  <path d="M8 4V2H16V4" stroke="currentColor" stroke-width="2"/>
</svg>
```
**Usage**: Canned goods, condiments, spices  
**Color**: `--color-category-pantry` (#F97316)

#### Household Items 🧽
```svg
<!-- Cleaning Spray Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M8 17L16 9M8 17H4V13L8 17ZM16 9H20V5L16 9Z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 9L12 5M16 17L12 13" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```
**Usage**: Cleaning supplies, paper products, personal care  
**Color**: `--color-category-household` (#84CC16)

## 🔧 UI System Icons

### Navigation Icons
```svg
<!-- Home -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 12L12 3L21 12M5 10V20C5 21 6 22 7 22H17C18 22 19 21 19 20V10" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Search -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Settings -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

### Action Icons
```svg
<!-- Add/Plus -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Delete/Trash -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 6H21M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6H19Z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Edit -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M17 3C17.5 2.5 18.2 2.2 19 2.2S20.5 2.5 21 3C21.5 3.5 21.8 4.2 21.8 5S21.5 6.5 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Status Icons
```svg
<!-- Check/Success -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Warning -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.37 1.8 18.82 2.18 19C2.25 19.03 2.33 19.05 2.4 19.05H21.6C22.01 19.05 22.35 18.71 22.35 18.3C22.35 18.23 22.33 18.15 22.3 18.08L13.83 3.86C13.65 3.49 13.2 3.33 12.83 3.51C12.69 3.58 12.58 3.69 12.51 3.83L10.29 3.86Z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Error -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

## 📱 Icon Sizes & Usage

### Size Specifications
| Size | Usage | Context |
|------|-------|---------|
| **16px** | Small UI elements | Buttons, form inputs, inline text |
| **20px** | Medium UI elements | Navigation items, card actions |
| **24px** | Standard icons | Primary navigation, main actions |
| **32px** | Large icons | Feature highlights, empty states |
| **48px** | Hero icons | Category headers, onboarding |

### Implementation Example
```css
.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  color: currentColor;
  flex-shrink: 0;
}

.icon--small { --icon-size: 16px; }
.icon--medium { --icon-size: 20px; }
.icon--default { --icon-size: 24px; }
.icon--large { --icon-size: 32px; }
.icon--hero { --icon-size: 48px; }
```

## 🎨 Icon Color System

### Color Usage
```css
/* Default - inherits text color */
.icon { color: currentColor; }

/* Category-specific colors */
.icon--produce { color: var(--color-category-produce); }
.icon--protein { color: var(--color-category-protein); }
.icon--dairy { color: var(--color-category-dairy); }
.icon--grains { color: var(--color-category-grains); }
.icon--beverages { color: var(--color-category-beverages); }
.icon--frozen { color: var(--color-category-frozen); }
.icon--pantry { color: var(--color-category-pantry); }
.icon--household { color: var(--color-category-household); }

/* Status colors */
.icon--success { color: var(--color-success); }
.icon--warning { color: var(--color-warning); }
.icon--error { color: var(--color-error); }
```

## ♿ Accessibility Guidelines

### Icon Accessibility
- **Always include text labels**: Never rely on icons alone
- **Proper alt text**: Descriptive alternative text for screen readers
- **Sufficient contrast**: Meet WCAG AA standards (4.5:1 minimum)
- **Focus indicators**: Clear focus states for interactive icons
- **Touch targets**: Minimum 44x44px tap area on mobile

### Implementation Example
```html
<!-- Good: Icon with label -->
<button aria-label="Add new item to inventory">
  <svg aria-hidden="true" class="icon"><!-- SVG content --></svg>
  <span>Add Item</span>
</button>

<!-- Good: Icon-only with descriptive aria-label -->
<button aria-label="Delete item from inventory">
  <svg aria-hidden="true" class="icon"><!-- SVG content --></svg>
</button>
```

## 📦 Icon Library Organization

### File Structure
```
/assets/icons/
├── categories/
│   ├── produce.svg
│   ├── protein.svg
│   ├── dairy.svg
│   └── ...
├── ui/
│   ├── add.svg
│   ├── search.svg
│   ├── settings.svg
│   └── ...
└── status/
    ├── success.svg
    ├── warning.svg
    └── error.svg
```

### Component Implementation
```tsx
interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'default' | 'large' | 'hero';
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'default', 
  color = 'currentColor',
  className 
}) => {
  return (
    <svg 
      className={`icon icon--${size} ${className}`}
      style={{ color }}
      aria-hidden="true"
    >
      {/* Dynamic SVG content based on name */}
    </svg>
  );
};
```

## ✅ Usage Guidelines

### Do
- Use icons consistently throughout the interface
- Maintain the 2px stroke weight for custom icons
- Provide text labels for all interactive icons
- Test icon visibility in both light and dark modes
- Use category colors to improve visual organization

### Don't
- Mix different icon styles (outlined with filled)
- Create icons smaller than 12px for UI elements
- Use decorative icons without semantic meaning
- Rely on color alone to convey information
- Ignore accessibility requirements for interactive elements

---

*This iconography system ensures Kitchentory maintains visual consistency while providing clear, accessible navigation and category identification for all users.*