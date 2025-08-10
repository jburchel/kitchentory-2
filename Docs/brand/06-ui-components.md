# UI Components

## 🎨 Component Design Philosophy

Kitchentory's UI components prioritize clarity, accessibility, and family-friendly usability. Every component is designed to feel fresh and organized while maintaining the approachable personality that makes kitchen management enjoyable rather than overwhelming.

## 🎯 Design Principles

### Core Component Characteristics
- **Clean & Minimal**: Focus on content, reduce visual noise
- **Consistent Spacing**: 8px grid system for harmonious layouts
- **Rounded & Friendly**: 8px border radius for approachable feel
- **Accessible First**: WCAG AA compliance built into every component
- **Mobile Optimized**: Touch-friendly interactions for kitchen use

## 🔘 Button Components

### Primary Button
The main call-to-action button featuring our signature green gradient.

#### Light Mode
```css
.btn-primary {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-weight: 500;
  padding: 12px 24px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
}
```

#### Dark Mode
```css
.dark .btn-primary {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  box-shadow: 0 1px 3px rgba(5, 150, 105, 0.4);
}

.dark .btn-primary:hover {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5);
}
```

### Secondary Button
For less prominent actions that still need emphasis.

```css
.btn-secondary {
  background: transparent;
  border: 2px solid #10B981;
  border-radius: 8px;
  color: #10B981;
  font-weight: 500;
  padding: 10px 24px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #10B981;
  color: #FFFFFF;
}

.dark .btn-secondary {
  border-color: #34D399;
  color: #34D399;
}

.dark .btn-secondary:hover {
  background: #34D399;
  color: #065F46;
}
```

### Ghost Button
For subtle actions that shouldn't compete with primary content.

```css
.btn-ghost {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6B7280;
  font-weight: 500;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: #F3F4F6;
  color: #374151;
}

.dark .btn-ghost:hover {
  background: #374151;
  color: #F3F4F6;
}
```

### Button Sizes
```css
/* Small */
.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
}

/* Default */
.btn-md {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
}

/* Large */
.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 10px;
}
```

## 📝 Input Components

### Text Input
Clean, accessible input fields for user data entry.

```css
.input {
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  font-size: 16px; /* Prevents zoom on iOS */
  padding: 12px 16px;
  transition: all 0.2s ease;
  width: 100%;
}

.input:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.input::placeholder {
  color: #9CA3AF;
}

.input:disabled {
  background: #F3F4F6;
  border-color: #D1D5DB;
  color: #6B7280;
  cursor: not-allowed;
}

/* Dark mode */
.dark .input {
  background: #374151;
  border-color: #4B5563;
  color: #F9FAFB;
}

.dark .input:focus {
  border-color: #34D399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}
```

### Select Dropdown
Styled select components for category selection.

```css
.select {
  appearance: none;
  background: #FFFFFF url("data:image/svg+xml...") no-repeat right 12px center;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  cursor: pointer;
  font-size: 16px;
  padding: 12px 40px 12px 16px;
  transition: all 0.2s ease;
  width: 100%;
}

.select:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}
```

## 📄 Card Components

### Basic Card
Foundation for displaying inventory items and content groups.

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  border-bottom: 1px solid #F3F4F6;
  padding: 20px 24px 16px;
}

.card-body {
  padding: 20px 24px;
}

.card-footer {
  background: #F9FAFB;
  border-top: 1px solid #F3F4F6;
  padding: 16px 24px;
}

/* Dark mode */
.dark .card {
  background: #374151;
  border-color: #4B5563;
}

.dark .card-footer {
  background: #4B5563;
}
```

### Inventory Item Card
Specialized card for displaying kitchen inventory items.

```css
.inventory-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.inventory-card:hover {
  border-color: #10B981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.inventory-card .item-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.inventory-card .item-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.inventory-card .item-details {
  font-size: 14px;
  color: #6B7280;
}

.inventory-card .expiration-warning {
  color: #F59E0B;
  font-weight: 500;
}

.inventory-card .expiration-urgent {
  color: #EF4444;
  font-weight: 600;
}
```

## 🏷️ Badge Components

### Status Badges
For displaying item status, categories, and alerts.

```css
.badge {
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  text-transform: capitalize;
}

/* Success (Fresh items) */
.badge-success {
  background: #D1FAE5;
  color: #047857;
}

/* Warning (Expiring soon) */
.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

/* Error (Expired) */
.badge-error {
  background: #FEE2E2;
  color: #DC2626;
}

/* Category badges */
.badge-category {
  background: #F3F4F6;
  color: #374151;
}

/* Dark mode adjustments */
.dark .badge-success {
  background: #064E3B;
  color: #6EE7B7;
}

.dark .badge-warning {
  background: #78350F;
  color: #FCD34D;
}

.dark .badge-error {
  background: #7F1D1D;
  color: #FCA5A5;
}
```

## 📊 Data Display Components

### Stats Card
For displaying inventory metrics and achievements.

```css
.stats-card {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  color: #10B981;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Dark mode */
.dark .stats-card {
  background: linear-gradient(135deg, #374151 0%, #4B5563 100%);
  border-color: #6B7280;
}

.dark .stats-number {
  color: #34D399;
}
```

## 🔍 Search Components

### Search Bar
For product search and inventory filtering.

```css
.search-container {
  position: relative;
  width: 100%;
}

.search-input {
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  padding: 14px 48px 14px 48px;
  transition: all 0.2s ease;
  width: 100%;
}

.search-input:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  width: 20px;
  height: 20px;
}

.search-clear {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
}
```

## 🎛️ Navigation Components

### Tab Navigation
For switching between different inventory views.

```css
.tabs {
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  gap: 0;
}

.tab {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6B7280;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  border-bottom-color: #10B981;
  color: #10B981;
}

/* Dark mode */
.dark .tab {
  color: #9CA3AF;
}

.dark .tab:hover {
  color: #F3F4F6;
}

.dark .tab.active {
  color: #34D399;
  border-bottom-color: #34D399;
}
```

## ⚠️ Alert Components

### System Alerts
For notifications, warnings, and success messages.

```css
.alert {
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.alert-success {
  background: #D1FAE5;
  border: 1px solid #A7F3D0;
  color: #047857;
}

.alert-warning {
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  color: #92400E;
}

.alert-error {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  color: #DC2626;
}

.alert-info {
  background: #DBEAFE;
  border: 1px solid #BFDBFE;
  color: #1D4ED8;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  line-height: 1.5;
}
```

## 📱 Mobile-Specific Components

### Bottom Sheet
For mobile actions and forms.

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.bottom-sheet.open {
  transform: translateY(0);
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: #D1D5DB;
  border-radius: 2px;
  margin: 0 auto 24px;
}
```

### Floating Action Button
For primary mobile actions like "Add Item".

```css
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  border: none;
  border-radius: 28px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.5);
}

.fab:active {
  transform: scale(0.95);
}
```

## ♿ Accessibility Implementation

### Focus States
All interactive components must have visible focus indicators:

```css
.component:focus {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}

.component:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support
Essential ARIA attributes for components:

```html
<!-- Button with loading state -->
<button aria-describedby="loading-text" disabled>
  <span aria-hidden="true">⏳</span>
  <span id="loading-text">Adding item to inventory...</span>
</button>

<!-- Form input with error -->
<label for="item-name">Item Name</label>
<input 
  id="item-name" 
  aria-describedby="name-error"
  aria-invalid="true"
/>
<div id="name-error" role="alert">Item name is required</div>
```

## ✅ Component Usage Guidelines

### Do
- Use consistent spacing and sizing across similar components
- Implement proper focus states for keyboard navigation
- Test components in both light and dark modes
- Provide sufficient color contrast for all text
- Use semantic HTML elements where appropriate

### Don't
- Create components smaller than 44px tap targets on mobile
- Use color alone to convey state or information
- Override focus styles without providing alternatives
- Mix different visual styles within the same interface
- Ignore loading and error states

---

*These UI components create a cohesive, accessible interface that makes kitchen inventory management feel fresh, organized, and family-friendly across all devices and user contexts.*