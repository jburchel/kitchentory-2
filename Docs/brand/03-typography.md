# Typography System

## 🔤 Font Philosophy

Kitchentory's typography prioritizes clarity, accessibility, and modern professionalism. We use the Inter font family throughout our interface—a typeface specifically designed for user interfaces with excellent legibility at all sizes and exceptional character spacing.

## 📝 Primary Typeface: Inter

### Why Inter?
- **Designed for UI**: Optimized for digital interfaces and screen reading
- **Excellent Legibility**: Clear at small sizes, perfect for mobile inventory lists  
- **Wide Language Support**: Supports international characters for global users
- **Accessible**: High readability for users with dyslexia and visual impairments
- **Variable Font**: Efficient loading with multiple weights in one file

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

## 📐 Typography Scale

### Modular Scale System
Our typography uses a **1.250 (Major Third)** modular scale for harmonious proportions:

| Level | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| **xs** | 12px | 16px (1.33) | Small labels, captions |
| **sm** | 14px | 20px (1.43) | Secondary text, form labels |
| **base** | 16px | 24px (1.50) | Body text, default size |
| **lg** | 18px | 28px (1.56) | Emphasized text, large labels |
| **xl** | 20px | 28px (1.40) | Small headings, card titles |
| **2xl** | 24px | 32px (1.33) | Section headings |
| **3xl** | 30px | 36px (1.20) | Page headings |
| **4xl** | 36px | 40px (1.11) | Display headings |

### Mobile-First Responsive Scaling
```css
/* Mobile Base (320px+) */
.text-3xl { font-size: 24px; line-height: 32px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .text-3xl { font-size: 30px; line-height: 36px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .text-3xl { font-size: 30px; line-height: 36px; }
}
```

## 🏗️ Typography Hierarchy

### Heading Styles

#### Display Heading (Hero Sections)
```css
.heading-display {
  font-family: 'Inter', sans-serif;
  font-size: 36px;
  font-weight: 800; /* Extra Bold */
  line-height: 40px;
  letter-spacing: -0.02em; /* Tight tracking */
}
```
**Usage**: Hero sections, major landing page headings

#### Page Heading (H1)
```css
.heading-page {
  font-family: 'Inter', sans-serif;
  font-size: 30px;
  font-weight: 700; /* Bold */
  line-height: 36px;
  letter-spacing: -0.01em;
}
```
**Usage**: Main page titles, dashboard headings

#### Section Heading (H2)
```css
.heading-section {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600; /* Semi Bold */
  line-height: 32px;
  letter-spacing: -0.005em;
}
```
**Usage**: Major section titles, card group headings

#### Subsection Heading (H3)
```css
.heading-subsection {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600; /* Semi Bold */
  line-height: 28px;
  letter-spacing: 0em;
}
```
**Usage**: Subsections, form group titles

#### Component Heading (H4)
```css
.heading-component {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 500; /* Medium */
  line-height: 28px;
  letter-spacing: 0em;
}
```
**Usage**: Card titles, component headers

### Body Text Styles

#### Large Body Text
```css
.text-large {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 400; /* Regular */
  line-height: 28px;
  letter-spacing: 0em;
}
```
**Usage**: Introductory paragraphs, important descriptions

#### Regular Body Text
```css
.text-body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400; /* Regular */
  line-height: 24px;
  letter-spacing: 0em;
}
```
**Usage**: Default paragraph text, form inputs

#### Small Body Text
```css
.text-small {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400; /* Regular */
  line-height: 20px;
  letter-spacing: 0em;
}
```
**Usage**: Secondary information, helper text

#### Caption Text
```css
.text-caption {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400; /* Regular */
  line-height: 16px;
  letter-spacing: 0.01em;
}
```
**Usage**: Timestamps, metadata, fine print

### Interactive Text Styles

#### Button Text
```css
.text-button {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500; /* Medium */
  line-height: 24px;
  letter-spacing: 0.005em;
}

.text-button-small {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
```

#### Link Text
```css
.text-link {
  font-family: 'Inter', sans-serif;
  font-weight: 500; /* Medium */
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}

.text-link:hover {
  text-decoration-thickness: 2px;
}
```

## 🎯 Font Weight System

### Weight Usage Guidelines
| Weight | Value | Usage |
|--------|-------|-------|
| **Regular** | 400 | Body text, form inputs, secondary information |
| **Medium** | 500 | Buttons, links, emphasized text, small headings |
| **Semi Bold** | 600 | Section headings, important labels |
| **Bold** | 700 | Page headings, strong emphasis |
| **Extra Bold** | 800 | Display headings, hero text |

### Loading Strategy
```css
/* Load only the weights we use */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Variable font option for better performance */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap');
```

## 📱 Mobile Typography Considerations

### Minimum Sizes for Touch
- **Buttons**: Minimum 16px font size for tap targets
- **Form Inputs**: 16px to prevent zoom on iOS
- **Body Text**: Never below 14px for readability

### Responsive Font Sizing
```css
/* Clamp function for fluid typography */
.heading-responsive {
  font-size: clamp(24px, 4vw, 36px);
}

.body-responsive {
  font-size: clamp(14px, 2.5vw, 18px);
}
```

## ♿ Accessibility Guidelines

### WCAG Compliance
- **Minimum font size**: 14px for body text (16px preferred)
- **Line height**: At least 1.5x the font size
- **Paragraph spacing**: At least 2x the font size
- **Letter spacing**: At least 0.12x the font size (for improved readability)

### Dyslexia Considerations
- **Inter font**: Designed with dyslexia-friendly character shapes
- **Letter spacing**: Slightly increased for better character recognition
- **Line height**: Generous spacing reduces crowding
- **Avoid**: All caps text for long content

## 🎨 Text Color Hierarchy

### Light Mode
```css
--text-primary: #111827;     /* Gray 900 - Highest emphasis */
--text-secondary: #4B5563;   /* Gray 600 - Medium emphasis */
--text-muted: #6B7280;       /* Gray 500 - Lower emphasis */
--text-disabled: #9CA3AF;    /* Gray 400 - Disabled state */
```

### Dark Mode
```css
--text-primary: #F9FAFB;     /* Gray 50 - Highest emphasis */
--text-secondary: #D1D5DB;   /* Gray 300 - Medium emphasis */
--text-muted: #9CA3AF;       /* Gray 400 - Lower emphasis */
--text-disabled: #6B7280;    /* Gray 500 - Disabled state */
```

## 📋 Usage Examples

### Dashboard Inventory List
```html
<h1 class="heading-page">Kitchen Inventory</h1>
<h2 class="heading-section">Fresh Produce</h2>

<div class="inventory-item">
  <h3 class="heading-component">Organic Bananas</h3>
  <p class="text-body">6 pieces remaining</p>
  <span class="text-caption">Expires in 3 days</span>
</div>
```

### Form Labels and Inputs
```html
<label class="text-small font-medium">Product Name</label>
<input class="text-body" placeholder="Enter product name...">
<p class="text-caption text-muted">This will appear in your inventory</p>
```

### Button Variations
```html
<button class="text-button">Add to Inventory</button>
<button class="text-button-small">Cancel</button>
<a href="#" class="text-link">Learn more about categories</a>
```

## ✅ Best Practices

### Do
- Use consistent font weights throughout the interface
- Maintain proper text hierarchy with size and weight
- Ensure sufficient contrast between text and background
- Test typography on various screen sizes and devices
- Use sentence case for most text (avoid excessive capitalization)

### Don't
- Mix different font families in the same interface
- Use font sizes below 12px for any user-facing text
- Create too many font weight variations (stick to 4-5 weights max)
- Use decorative fonts that sacrifice readability
- Ignore line height and spacing guidelines

---

*This typography system ensures Kitchentory maintains excellent readability and visual hierarchy while supporting accessibility across all devices and user needs.*