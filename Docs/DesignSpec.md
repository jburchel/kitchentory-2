# Kitchentory Design Specification

## Design Principles

### Core Principles

1. **Mobile-First**: Every interface designed for thumb-friendly mobile use
2. **Speed**: Instant feedback, optimistic updates, minimal loading states
3. **Clarity**: Clear visual hierarchy, obvious actions, minimal cognitive load
4. **Flexibility**: Accommodates different user workflows and preferences
5. **Accessibility**: WCAG 2.1 AA compliant, screen reader friendly

### Visual Design Philosophy

- Clean, modern interface with ample whitespace using shadcn/ui components
- Food-inspired color palette with green accents via TailwindCSS custom colors
- Card-based layouts using shadcn/ui Card primitives for scannable content
- Consistent iconography from Lucide React icons (shadcn/ui default)
- Typography optimized for readability with TailwindCSS typography classes
- Dark mode support via next-themes with system preference detection
- Accessible design patterns with proper focus management and ARIA attributes
- Motion-safe animations with respect for user preferences
- Container queries for component-level responsive design
- CSS-in-JS patterns using Tailwind CSS merge utilities

## Information Architecture

### Site Structure (Next.js App Router)

```
/app
├── /page.tsx (Dashboard)
├── /inventory
│   ├── /page.tsx (Inventory List)
│   ├── /add
│   │   └── /page.tsx (Scanner/Search)
│   ├── /categories
│   │   └── /page.tsx
│   ├── /[id]
│   │   └── /page.tsx (Item Detail)
│   └── /expiring
│       └── /page.tsx
├── /recipes
│   ├── /page.tsx (Recipe Discovery)
│   ├── /discover
│   │   └── /page.tsx
│   ├── /browse
│   │   └── /page.tsx
│   ├── /[id]
│   │   └── /page.tsx (Recipe Detail)
│   ├── /cooking
│   │   └── /[id]
│   │       └── /page.tsx (Cooking Mode)
│   └── /collections
│       └── /page.tsx
├── /shopping
│   ├── /page.tsx (Shopping Lists)
│   ├── /lists
│   │   └── /page.tsx
│   ├── /[listId]
│   │   └── /page.tsx (List Detail)
│   └── /history
│       └── /page.tsx
├── /profile
│   ├── /page.tsx (Profile)
│   ├── /settings
│   │   └── /page.tsx
│   ├── /household
│   │   └── /page.tsx (Clerk Organizations)
│   └── /preferences
│       └── /page.tsx
└── /api
    ├── /barcode
    │   └── /route.ts (Barcode scanning API)
    └── /webhooks
        └── /clerk
            └── /route.ts (Clerk webhooks)
```

### Navigation Patterns

- **Mobile**: Fixed bottom navigation with 5 main sections
- **Desktop**: Responsive sidebar with expanded navigation
- **Quick Actions**: Floating action button for primary tasks
- **Breadcrumbs**: Contextual navigation for deeper pages

## Component Design System

### Color Palette (TailwindCSS + shadcn/ui)

```css
/* shadcn/ui CSS Variables for Light/Dark mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 142.1 76.2% 36.3%;    /* Green-600 */
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 210 40% 94%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 94%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 142.1 76.2% 36.3%;
  --radius: 0.5rem;
  
  /* Custom semantic colors */
  --success: 142.1 76.2% 36.3%;
  --success-foreground: 355.7 100% 97.3%;
  --warning: 45.4 93.4% 47.5%;
  --warning-foreground: 26.5 83.3% 14.1%;
  --info: 217.2 91.2% 59.8%;
  --info-foreground: 355.7 100% 97.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 142.1 70.6% 45.3%;    /* Green-500 */
  --primary-foreground: 144.9 80.4% 10%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 142.4 71.8% 29.2%;
  
  /* Dark mode semantic colors */
  --success: 142.1 70.6% 45.3%;
  --success-foreground: 144.9 80.4% 10%;
  --warning: 45.4 93.4% 47.5%;
  --warning-foreground: 26.5 83.3% 14.1%;
  --info: 217.2 91.2% 59.8%;
  --info-foreground: 355.7 100% 97.3%;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 0%;
    --input: 0 0% 0%;
  }
  
  .dark {
    --border: 0 0% 100%;
    --input: 0 0% 100%;
  }
}

/* Custom Category Colors with enhanced contrast */
.category-produce { @apply bg-lime-100 text-lime-900 dark:bg-lime-900/20 dark:text-lime-300 ring-1 ring-lime-200 dark:ring-lime-800; }
.category-dairy { @apply bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800; }
.category-meat { @apply bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800; }
.category-pantry { @apply bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800; }
.category-frozen { @apply bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800; }

/* Status indicator colors */
.status-fresh { @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400; }
.status-expiring { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400; }
.status-expired { @apply bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400; }
```

### Typography (TailwindCSS)

```css
/* TailwindCSS Font Configuration with Variable Fonts */
@import '@fontsource/inter/variable.css';
@import '@fontsource/inter/variable-italic.css';

/* Font Family Stack with fallbacks */
font-family: 'InterVariable', 'Inter Variable', ui-sans-serif, system-ui, 
             -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, "Noto Sans", sans-serif;

/* TailwindCSS Typography Scale */
.text-xs     /* 12px - Labels, captions, fine print */
.text-sm     /* 14px - Secondary text, shadcn/ui default */
.text-base   /* 16px - Body text, default reading */
.text-lg     /* 18px - Emphasized text, lead paragraphs */
.text-xl     /* 20px - Section headers, card titles */
.text-2xl    /* 24px - Page titles, main headers */
.text-3xl    /* 30px - Hero text, feature highlights */
.text-4xl    /* 36px - Display text, splash screens */
.text-5xl    /* 48px - Large display text */
.text-6xl    /* 60px - Extra large display */

/* Font Weights with Variable Font Support */
.font-thin       /* 100 - Ultra light accent text */
.font-extralight /* 200 - Light accent text */
.font-light      /* 300 - Light body text */
.font-normal     /* 400 - Default body text */
.font-medium     /* 500 - Emphasized text */
.font-semibold   /* 600 - Section headers */
.font-bold       /* 700 - Strong emphasis */
.font-extrabold  /* 800 - Heavy emphasis */
.font-black      /* 900 - Display text */

/* Line Heights for optimal readability */
.leading-none     /* 1 - Tight headlines */
.leading-tight    /* 1.25 - Headlines */
.leading-snug     /* 1.375 - Large text */
.leading-normal   /* 1.5 - Body text default */
.leading-relaxed  /* 1.625 - Comfortable reading */
.leading-loose    /* 2 - Spaced reading */

/* Letter Spacing */
.tracking-tighter /* -0.05em - Tight headlines */
.tracking-tight   /* -0.025em - Headlines */
.tracking-normal  /* 0em - Body text */
.tracking-wide    /* 0.025em - Spaced text */
.tracking-wider   /* 0.05em - Labels */
.tracking-widest  /* 0.1em - Buttons */

/* Responsive Typography */
.text-responsive-sm  /* text-sm md:text-base */
.text-responsive-base /* text-base md:text-lg */
.text-responsive-lg   /* text-lg md:text-xl */
.text-responsive-xl   /* text-xl md:text-2xl */

/* Accessibility improvements */
.text-balance { text-wrap: balance; } /* Balanced headlines */
.text-pretty  { text-wrap: pretty; }  /* Improved text wrapping */

/* Font feature settings for better rendering */
.font-feature-default {
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}

.font-feature-numbers {
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  font-variant-numeric: tabular-nums;
}
```

### Spacing System (TailwindCSS)

```css
/* TailwindCSS Spacing Scale */
.p-1, .m-1    /* 4px */
.p-2, .m-2    /* 8px */
.p-3, .m-3    /* 12px */
.p-4, .m-4    /* 16px - shadcn/ui default */
.p-5, .m-5    /* 20px */
.p-6, .m-6    /* 24px */
.p-8, .m-8    /* 32px */
.p-10, .m-10  /* 40px */
.p-12, .m-12  /* 48px */
.p-16, .m-16  /* 64px */

/* Component-specific spacing */
.space-y-1    /* 4px vertical gap */
.space-y-2    /* 8px vertical gap */
.space-y-4    /* 16px vertical gap */
.space-x-2    /* 8px horizontal gap */
.space-x-4    /* 16px horizontal gap */

/* Grid gaps */
.gap-1        /* 4px grid gap */
.gap-2        /* 8px grid gap */
.gap-4        /* 16px grid gap */
.gap-6        /* 24px grid gap */
```

## Page Layouts

### Dashboard

```
┌─────────────────────────────────┐
│ Welcome, [Name]      [Avatar]   │ Header
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Quick Stats │ │ Quick Stats │ │ Stats Cards
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────┤
│ Expiring Soon                   │ Section Header
│ ┌─────────────────────────────┐ │
│ │ [Item] [Item] [Item] →      │ │ Horizontal Scroll
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Recent Recipes                  │
│ ┌──────┐ ┌──────┐ ┌──────┐    │ Recipe Cards
│ │      │ │      │ │      │    │
│ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────┤
│ [+] Quick Add Button            │ FAB
└─────────────────────────────────┘
```

### Inventory List

```
┌─────────────────────────────────┐
│ [<] Inventory      [Search] [⋮] │ Header
├─────────────────────────────────┤
│ [All] [Fridge] [Pantry] [...]   │ Filter Tabs
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [IMG] Item Name        [>]  │ │ Item Card
│ │       Qty • Expires in 3d   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [IMG] Item Name        [>]  │ │
│ │       Qty • Location        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [+] Add Item                    │ FAB
└─────────────────────────────────┘
```

### Recipe Discovery

```
┌─────────────────────────────────┐
│ Recipe Discovery                │ Header
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ You can make 12 recipes now │ │ Hero Card
│ │ [View All →]                │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Almost There (2 items away)     │
│ ┌────────┐ ┌────────┐          │ Recipe Grid
│ │ [IMG]  │ │ [IMG]  │          │
│ │ Title  │ │ Title  │          │
│ │ 30 min │ │ 45 min │          │
│ └────────┘ └────────┘          │
└─────────────────────────────────┘
```

## Component Library (shadcn/ui + TailwindCSS)

### Cards

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, Users, Globe } from "lucide-react"
import Image from "next/image"

// Inventory Item Card
function InventoryItemCard({ item }: { item: InventoryItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
          <Image
            src={item.image || "/placeholder-food.jpg"}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground">
            {item.quantity} • {item.location} • 
            <span className={cn(
              "ml-1",
              item.daysUntilExpiry <= 3 && "text-destructive"
            )}>
              {item.daysUntilExpiry > 0 
                ? `Expires in ${item.daysUntilExpiry}d`
                : "Expired"
              }
            </span>
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

// Recipe Card
function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 w-full">
        <Image
          src={recipe.image || "/placeholder-recipe.jpg"}
          alt={recipe.title}
          fill
          className="object-cover"
        />
        <Badge 
          className="absolute top-2 left-2"
          variant={recipe.canMakeNow ? "default" : "secondary"}
        >
          {recipe.canMakeNow ? "Ready to make" : "Almost there"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.cookTime} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings} servings
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {recipe.cuisine}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Forms

```tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Minus, Plus } from "lucide-react"

// Search Input
function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search items..."
        className="pl-10"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}

// Quantity Input
function QuantityInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 999 
}: { 
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const decrease = () => {
    if (value > min) onChange(value - 1)
  }
  
  const increase = () => {
    if (value < max) onChange(value + 1)
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={decrease}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 text-center"
        min={min}
        max={max}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={increase}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Navigation

```tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Package, Plus, ChefHat, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

// Mobile Bottom Navigation
function BottomNavigation() {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/recipes", icon: ChefHat, label: "Recipes" },
    { href: "/shopping", icon: ShoppingCart, label: "Shopping" },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.slice(0, 2).map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
        
        {/* Center FAB */}
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg"
          asChild
        >
          <Link href="/inventory/add">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
        
        {navItems.slice(2).map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
}) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}
```

## Interactive Elements

### Barcode Scanner

```
┌─────────────────────────────────┐
│ [X] Scan Barcode                │
├─────────────────────────────────┤
│                                 │
│   ┌───────────────────────┐     │
│   │                       │     │ Camera View
│   │    [Scanning Area]    │     │
│   │                       │     │
│   └───────────────────────┘     │
│                                 │
│ Point at barcode to scan        │
├─────────────────────────────────┤
│ [Enter Manually]                │
└─────────────────────────────────┘
```

### Cooking Mode

```
┌─────────────────────────────────┐
│ [X] Cooking: Pasta Carbonara    │
├─────────────────────────────────┤
│ Step 3 of 8                     │ Progress
├─────────────────────────────────┤
│                                 │
│ Cook pasta according to         │ Step Content
│ package directions until        │
│ al dente                        │
│                                 │
│ [Timer: 8:00]                   │ Timer
│                                 │
├─────────────────────────────────┤
│ Ingredients for this step:      │
│ ☐ 400g Spaghetti               │ Checklist
│ ☐ Salt for water               │
├─────────────────────────────────┤
│ [← Previous]      [Next Step →] │
└─────────────────────────────────┘
```

## Advanced Responsive Design

### Enhanced Breakpoint System (TailwindCSS)

```css
/* TailwindCSS Default Breakpoints */
/* Mobile First Approach */
sm: 640px   /* @media (min-width: 640px) - Large phones/small tablets */
md: 768px   /* @media (min-width: 768px) - Tablets */
lg: 1024px  /* @media (min-width: 1024px) - Desktop */
xl: 1280px  /* @media (min-width: 1280px) - Large desktop */
2xl: 1536px /* @media (min-width: 1536px) - Extra large desktop */

/* Container Queries (CSS Container Queries) */
@container (min-width: 320px) {
  .card-compact { padding: 1rem; }
}

@container (min-width: 768px) {
  .card-expanded { 
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
  }
}

/* Usage Examples */
.hidden sm:block          /* Hidden on mobile, visible on tablet+ */
.grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  /* Responsive grid */
.text-sm md:text-base lg:text-lg            /* Responsive text */
.p-4 md:p-6 lg:p-8                          /* Responsive padding */

/* Safe area support for mobile devices */
.pb-safe-area-inset-bottom  /* Bottom safe area (iPhone notch) */
.pt-safe-area-inset-top     /* Top safe area (iPhone notch) */

/* High contrast mode */
@media (prefers-contrast: high) {
  .high-contrast:border-2 { border-width: 2px; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .motion-reduce:transition-none { transition: none; }
  .motion-reduce:animate-none { animation: none; }
}
```

### Advanced Layout Adaptations

- **Mobile Portrait (< 640px)**: 
  - Single column layouts with touch-optimized 44px minimum touch targets
  - Bottom navigation with 5 items + FAB
  - Swipe gestures and pull-to-refresh functionality

- **Tablet Portrait (768px - 1024px)**:
  - 2-3 column grids with enhanced hover states
  - Side navigation drawer with keyboard support
  - Multi-panel layouts

- **Desktop (> 1024px)**:
  - 3-4 column grids with persistent sidebar navigation
  - Advanced filtering, keyboard shortcuts, and context menus
  - Multi-window support and enhanced data visualization

## Animation & Transitions

### Micro-interactions

```css
/* Standard Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;

/* Animation Examples */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.button:active {
  transform: scale(0.95);
}

/* Loading States */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Page Transitions

- Slide transitions between main sections
- Fade in/out for modal overlays
- Smooth scroll for anchor links
- Skeleton screens while loading

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text
- All interactive elements keyboard accessible
- Focus indicators on all focusable elements
- ARIA labels for icon-only buttons

### Screen Reader Support

```html
<!-- Accessible Card Example -->
<article class="card" role="article" aria-label="Inventory item">
  <img src="..." alt="Milk carton">
  <h3>Whole Milk</h3>
  <p>
    <span class="sr-only">Quantity:</span> 2 liters
    <span class="sr-only">Location:</span> Fridge
    <span class="sr-only">Status:</span> Expires in 3 days
  </p>
</article>
```

## Real-time Features (Convex Integration)

### Live Data Synchronization

```tsx
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

// Real-time inventory updates
function InventoryList() {
  const items = useQuery(api.inventory.list)
  const updateItem = useMutation(api.inventory.update)
  
  // Data automatically updates when changes occur
  // across any device in real-time
  return (
    <div className="space-y-2">
      {items?.map(item => (
        <InventoryItemCard 
          key={item._id} 
          item={item}
          onUpdate={(updates) => updateItem({ id: item._id, ...updates })}
        />
      ))}
    </div>
  )
}

// Real-time collaboration on shopping lists
function SharedShoppingList({ listId }: { listId: string }) {
  const list = useQuery(api.shopping.getList, { listId })
  const members = useQuery(api.shopping.getListMembers, { listId })
  
  return (
    <div>
      <div className="flex -space-x-2 mb-4">
        {members?.map(member => (
          <Avatar key={member._id} className="border-2 border-background">
            <AvatarImage src={member.imageUrl} />
            <AvatarFallback>{member.name?.[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {/* List items update in real-time as members check them off */}
    </div>
  )
}
```

### Optimistic Updates

- Instant UI feedback before server confirmation
- Automatic rollback on errors
- Seamless offline-to-online synchronization
- Real-time conflict resolution

## Performance Considerations

### Image Optimization (Next.js)

```tsx
import Image from "next/image"

// Automatic optimization with Next.js Image component
<Image
  src={item.image}
  alt={item.name}
  width={48}
  height={48}
  className="object-cover rounded-lg"
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

- Automatic WebP/AVIF format conversion
- Responsive images with built-in srcset
- Lazy loading by default
- Blur placeholder for smooth loading
- CDN optimization via Vercel

### Code Splitting (Next.js App Router)

```tsx
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Lazy load heavy components
const BarcodeScanner = dynamic(
  () => import("@/components/barcode-scanner"),
  { 
    loading: () => <div>Loading scanner...</div>,
    ssr: false 
  }
)

// Route-based automatic code splitting
// Each page.tsx creates its own bundle
// Shared components automatically optimized
```

### Caching Strategy

- **Static Assets**: Cached indefinitely with Vercel CDN
- **Database Queries**: Convex handles intelligent caching
- **API Routes**: Edge caching with Vercel Edge Runtime
- **Real-time Data**: Convex subscriptions with efficient diffing
- **Images**: Automatic caching and optimization via Vercel

## Error States & Empty States

### Error Handling

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

// Error State Component
function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load your inventory. Please try again.",
  onRetry 
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
      </Alert>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}
```

### Empty States

```tsx
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"

// Empty Inventory State
function EmptyInventoryState({ onAddItem }: { onAddItem: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your inventory is empty</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Start by adding items to track what's in your kitchen
      </p>
      <Button onClick={onAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Item
      </Button>
    </div>
  )
}
```

## Mobile-Specific Features

### Touch Gestures

- Swipe to delete/archive items
- Pull to refresh on lists
- Pinch to zoom on images
- Long press for context menus

### Device Features

- Camera access for barcode scanning
- Haptic feedback for actions
- Push notifications (PWA)
- Add to home screen prompt

### Offline Functionality

- View cached inventory
- Add items to queue
- Browse saved recipes
- Sync when online

## Dark Mode Implementation

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

- Automatic system preference detection via next-themes
- Manual toggle option in user preferences
- CSS variables automatically adjust for dark mode
- Smooth transitions between themes

## Future Design Considerations

### Internationalization

- RTL layout support
- Flexible text containers
- Culturally neutral icons
- Date/time format flexibility

### Tablet Optimization

- Multi-column layouts
- Sidebar navigation
- Keyboard shortcuts
- Hover states

This design specification serves as the foundation for implementing a consistent, user-friendly interface across the Kitchentory application.