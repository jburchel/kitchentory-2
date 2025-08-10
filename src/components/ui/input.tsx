import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base font-medium placeholder:text-muted-foreground focus-brand focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 touch-target",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }