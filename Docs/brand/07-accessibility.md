# Accessibility Guidelines

## ♿ Accessibility Philosophy

Kitchentory believes that good kitchen organization should be accessible to everyone, regardless of ability. Our accessibility guidelines ensure that families with diverse needs can confidently manage their kitchen inventory using our app.

## 🎯 Compliance Standards

### WCAG 2.1 Level AA Compliance
We meet or exceed all WCAG 2.1 Level AA requirements, which include:

- **Perceivable**: Information is presentable in ways users can perceive
- **Operable**: Interface components are operable by all users
- **Understandable**: Information and UI operation are understandable
- **Robust**: Content works with various assistive technologies

### Legal & Regulatory Compliance
- **ADA Compliance**: Americans with Disabilities Act requirements
- **Section 508**: US Federal accessibility standards
- **EN 301 549**: European accessibility standard
- **AODA**: Accessibility for Ontarians with Disabilities Act

## 🎨 Visual Accessibility

### Color Contrast Requirements

#### Minimum Contrast Ratios (WCAG AA)
| Text Size | Light Mode | Dark Mode | Status |
|-----------|------------|-----------|---------|
| **Normal Text** (16px+) | 4.5:1 | 4.5:1 | ✅ Required |
| **Large Text** (18px+ bold, 24px+ regular) | 3:1 | 3:1 | ✅ Required |
| **UI Elements** (borders, icons) | 3:1 | 3:1 | ✅ Required |

#### Enhanced Contrast Ratios (WCAG AAA)
| Text Size | Light Mode | Dark Mode | Goal |
|-----------|------------|-----------|------|
| **Normal Text** | 7:1 | 7:1 | 🎯 Preferred |
| **Large Text** | 4.5:1 | 4.5:1 | 🎯 Preferred |

### Tested Color Combinations
All brand colors have been tested for accessibility compliance:

```css
/* WCAG AA Compliant Combinations */
.text-primary-on-light { color: #047857; } /* 7.2:1 ratio */
.text-secondary-on-light { color: #374151; } /* 8.9:1 ratio */
.text-primary-on-dark { color: #6EE7B7; } /* 7.8:1 ratio */
.text-secondary-on-dark { color: #D1D5DB; } /* 9.1:1 ratio */

/* Status Colors - AA Compliant */
.text-success { color: #047857; } /* 7.2:1 on white */
.text-warning { color: #92400E; } /* 4.6:1 on white */
.text-error { color: #DC2626; } /* 4.7:1 on white */
```

### Color-Blind Accessibility

#### Supported Color Vision Types
- **Protanopia** (Red-blind): 1% of males
- **Deuteranopia** (Green-blind): 1% of males  
- **Tritanopia** (Blue-blind): <1% of population
- **Protanomaly/Deuteranomaly**: 6% of males, 0.4% of females

#### Design Strategies
```css
/* Never rely on color alone - always provide additional indicators */
.status-success {
  color: #047857;
  &::before {
    content: "✓";
    margin-right: 4px;
  }
}

.status-warning {
  color: #92400E;
  &::before {
    content: "⚠";
    margin-right: 4px;
  }
}

.status-error {
  color: #DC2626;
  &::before {
    content: "✗";
    margin-right: 4px;
  }
}
```

### Visual Focus Indicators

#### Focus Ring Standards
```css
.focusable-element:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast focus for better visibility */
@media (prefers-contrast: high) {
  .focusable-element:focus-visible {
    outline: 3px solid #000000;
    outline-offset: 1px;
  }
}
```

#### Custom Focus States
```css
/* Button focus */
.btn:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

/* Input focus */
.input:focus-visible {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  outline: none;
}

/* Card focus */
.card:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}
```

## ⌨️ Keyboard Accessibility

### Navigation Requirements

#### Tab Order
- **Logical sequence**: Left to right, top to bottom
- **Skip links**: Allow users to skip repeated navigation
- **Focus trapping**: Modal dialogs trap focus within themselves
- **Focus restoration**: Return focus to trigger element after modal closes

#### Keyboard Shortcuts
```javascript
// Essential keyboard shortcuts
const keyboardShortcuts = {
  'Escape': 'Close modal/dropdown',
  'Enter': 'Activate button/link',
  'Space': 'Toggle checkbox/button',
  'ArrowUp/Down': 'Navigate lists/menus',
  'Home/End': 'First/last item in list',
  'Tab': 'Next focusable element',
  'Shift+Tab': 'Previous focusable element'
};
```

### Interactive Element Requirements

#### Minimum Touch Target Sizes
- **Mobile**: 44x44px minimum (48x48px preferred)
- **Desktop**: 24x24px minimum (32x32px preferred)
- **Spacing**: 8px minimum between touch targets

#### Button Implementation
```html
<!-- Accessible button with proper labeling -->
<button 
  type="button"
  aria-label="Add bananas to inventory"
  class="btn-primary"
>
  <svg aria-hidden="true" class="icon">
    <!-- Plus icon -->
  </svg>
  Add Item
</button>

<!-- Icon-only button -->
<button 
  type="button"
  aria-label="Delete item from inventory"
  class="btn-ghost"
>
  <svg aria-hidden="true" class="icon">
    <!-- Trash icon -->
  </svg>
</button>
```

## 📱 Screen Reader Support

### ARIA Implementation

#### Landmarks
```html
<main role="main" aria-label="Kitchen inventory">
  <nav aria-label="Primary navigation">
    <ul role="list">
      <li><a href="/inventory">Inventory</a></li>
      <li><a href="/shopping">Shopping Lists</a></li>
    </ul>
  </nav>
  
  <section aria-labelledby="inventory-heading">
    <h1 id="inventory-heading">Your Kitchen Inventory</h1>
    <!-- Content -->
  </section>
</main>
```

#### Live Regions
```html
<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="status-message"></span>
</div>

<!-- Urgent announcements -->
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  <span id="error-message"></span>
</div>

<script>
// Announce status changes
function announceStatus(message) {
  document.getElementById('status-message').textContent = message;
}

// Usage: announceStatus("Item added to inventory");
</script>
```

#### Form Accessibility
```html
<!-- Accessible form with proper labeling -->
<form>
  <div class="form-group">
    <label for="item-name" class="form-label">
      Item Name
      <span aria-label="required" class="required">*</span>
    </label>
    <input 
      type="text"
      id="item-name"
      name="itemName"
      aria-describedby="name-help name-error"
      aria-invalid="false"
      required
      class="form-input"
    />
    <div id="name-help" class="form-help">
      Enter the name as it appears on the package
    </div>
    <div id="name-error" class="form-error" role="alert">
      <!-- Error message appears here -->
    </div>
  </div>
</form>
```

### Screen Reader Testing
Regular testing with popular screen readers:

- **NVDA** (Windows) - Free, widely used
- **JAWS** (Windows) - Most popular commercial option  
- **VoiceOver** (macOS/iOS) - Built into Apple devices
- **TalkBack** (Android) - Built into Android devices

## 🎵 Audio & Motion Accessibility

### Reduced Motion Support
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Provide alternative focus indicators */
@media (prefers-reduced-motion: reduce) {
  .btn:focus-visible {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
    /* Remove transform animations */
  }
}
```

### Audio Considerations
- **No auto-play**: Audio never plays automatically
- **Volume controls**: User controls for any audio feedback
- **Visual alternatives**: Visual feedback for audio cues
- **Captions**: Text alternatives for any spoken content

## 📝 Content Accessibility

### Plain Language Guidelines

#### Writing Standards
- **Flesch-Kincaid Grade Level**: Target 8th grade or below
- **Sentence length**: Average 15-20 words
- **Paragraph length**: Maximum 3-4 sentences
- **Active voice**: Use active over passive voice

#### Example Transformations
```
❌ "Utilize our comprehensive solution to optimize your kitchen management workflow"
✅ "Use our tools to organize your kitchen better"

❌ "In order to facilitate the addition of items to your inventory..."
✅ "To add items to your inventory..."

❌ "Subsequent to the completion of the scanning process..."
✅ "After scanning..."
```

### Internationalization Support

#### Text Expansion Considerations
```css
/* Allow for text expansion in different languages */
.btn {
  min-width: 120px; /* Accommodate longer translations */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Flexible layouts for varying text lengths */
.form-label {
  flex: 0 0 auto; /* Don't shrink labels */
  margin-bottom: 4px; /* Stack on narrow screens */
}
```

#### Right-to-Left (RTL) Support
```css
/* RTL layout support */
[dir="rtl"] .search-icon {
  left: auto;
  right: 16px;
}

[dir="rtl"] .arrow-right::before {
  transform: rotate(180deg);
}
```

## 🧪 Testing Methodologies

### Automated Testing Tools
```javascript
// Example accessibility testing with axe-core
import { configureAxe } from 'jest-axe';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true }
  }
});

test('Inventory page should be accessible', async () => {
  const { container } = render(<InventoryPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are clearly visible
- [ ] No keyboard traps (except in modals)
- [ ] Escape key closes modals and dropdowns

#### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Headings create logical document structure
- [ ] Images have meaningful alt text
- [ ] Forms are properly labeled
- [ ] Status changes are announced

#### Visual Testing
- [ ] Text contrast meets WCAG AA standards
- [ ] UI works at 200% zoom
- [ ] No information is conveyed by color alone
- [ ] Content reflows properly on mobile

## 🎯 Feature-Specific Guidelines

### Barcode Scanner Accessibility
```html
<!-- Accessible barcode scanner -->
<div class="scanner-container">
  <h2 id="scanner-title">Barcode Scanner</h2>
  
  <div aria-labelledby="scanner-title" aria-live="polite">
    <p id="scanner-instructions">
      Point your camera at the barcode and wait for it to focus.
      <button type="button" onclick="speakInstructions()">
        🔊 Repeat instructions
      </button>
    </p>
  </div>
  
  <div class="scanner-viewfinder" aria-hidden="true">
    <!-- Camera view -->
  </div>
  
  <div class="scanner-manual-entry">
    <label for="manual-barcode">
      Can't scan? Enter barcode manually:
    </label>
    <input 
      type="text" 
      id="manual-barcode"
      placeholder="Enter 12-digit barcode number"
      pattern="[0-9]{8,13}"
      aria-describedby="barcode-help"
    />
    <div id="barcode-help">
      Usually found below the barcode stripes
    </div>
  </div>
</div>
```

### Inventory List Accessibility
```html
<!-- Accessible inventory list -->
<section aria-labelledby="inventory-heading">
  <h2 id="inventory-heading">Kitchen Inventory (23 items)</h2>
  
  <div role="group" aria-labelledby="filter-heading">
    <h3 id="filter-heading">Filter Options</h3>
    <!-- Filter controls -->
  </div>
  
  <div 
    role="list" 
    aria-label="Inventory items"
    aria-describedby="list-description"
  >
    <div id="list-description" class="sr-only">
      Use arrow keys to navigate. Press Enter to view item details.
    </div>
    
    <div role="listitem" class="inventory-item" tabindex="0">
      <div class="item-info">
        <h4>Organic Bananas</h4>
        <p>6 pieces, expires in 3 days</p>
      </div>
      <div class="item-actions">
        <button aria-label="Edit organic bananas">Edit</button>
        <button aria-label="Delete organic bananas">Delete</button>
      </div>
    </div>
  </div>
</section>
```

## ✅ Accessibility Checklist

### Before Launch
- [ ] All colors meet WCAG AA contrast requirements
- [ ] All interactive elements have 44x44px touch targets
- [ ] Every image has appropriate alt text
- [ ] All forms have proper labels and validation
- [ ] Keyboard navigation works throughout the app
- [ ] Screen reader testing completed on major platforms
- [ ] Automated accessibility testing passes
- [ ] High contrast mode works properly
- [ ] Reduced motion preferences are respected

### Ongoing Monitoring
- [ ] Weekly automated accessibility scans
- [ ] Monthly manual testing with assistive technologies
- [ ] Quarterly user testing with disabled users
- [ ] Annual comprehensive accessibility audit

---

*These accessibility guidelines ensure that Kitchentory is usable by everyone, creating an inclusive experience that makes kitchen organization accessible to families of all abilities.*