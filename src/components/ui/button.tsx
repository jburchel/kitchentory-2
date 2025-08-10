import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-button font-medium transition-all duration-200 focus-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-gradient hover:shadow-brand-lg text-white border-none hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0",
        primary: "bg-brand-gradient hover:shadow-brand-lg text-white border-none hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0",
        secondary: "border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-primary-800",
        destructive: "bg-error text-white hover:bg-error/90 hover:shadow-lg",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary-400",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
        link: "text-link underline-offset-4 hover:underline min-h-[44px]",
      },
      size: {
        sm: "px-4 py-2 text-button-small rounded-md touch-target-sm",
        default: "px-6 py-3 text-button rounded-lg touch-target",
        lg: "px-8 py-4 text-button-large rounded-xl touch-target-lg",
        icon: "touch-target p-2 flex-shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }