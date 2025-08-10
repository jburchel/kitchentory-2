import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-brand",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-error text-white hover:bg-error/80",
        outline: "border-border text-foreground hover:bg-secondary",
        // Food category variants
        produce: "border-transparent bg-category-produce/10 text-category-produce",
        protein: "border-transparent bg-category-protein/10 text-category-protein",
        dairy: "border-transparent bg-category-dairy/10 text-category-dairy",
        grains: "border-transparent bg-category-grains/10 text-category-grains",
        beverages: "border-transparent bg-category-beverages/10 text-category-beverages",
        frozen: "border-transparent bg-category-frozen/10 text-category-frozen",
        pantry: "border-transparent bg-category-pantry/10 text-category-pantry",
        household: "border-transparent bg-category-household/10 text-category-household",
        // Status variants
        success: "border-transparent bg-success-light text-success",
        warning: "border-transparent bg-warning-light text-warning",
        error: "border-transparent bg-error-light text-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }