// UI Components - Kitchentory Design System
// Accessibility-first components with WCAG AA compliance

export { Button, buttonVariants, type ButtonProps } from "./button"
export { Badge, badgeVariants, type BadgeProps } from "./badge"
export { Input, type InputProps } from "./input"
export { Label } from "./label"
export { Select } from "./select"
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card"

// Touch Target Accessibility Components
export { 
  TouchTarget, 
  TouchContainer, 
  touchTargetVariants, 
  useTouchTargetCompliance,
  TouchTargetGuidelines,
  type TouchTargetProps,
  type TouchContainerProps 
} from "./touch-target"

// Note: Components ensure WCAG AA compliance with:
// - 44x44px minimum touch targets
// - Adequate color contrast ratios
// - Keyboard navigation support
// - Screen reader compatibility
// - Focus management