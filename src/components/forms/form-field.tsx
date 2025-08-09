"use client"

import * as React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" 
import { AlertCircle, Eye, EyeOff } from "lucide-react"

export interface FormFieldProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select"
  options?: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
  labelClassName?: string
  helperText?: string
}

export function FormField({
  name,
  label,
  description,
  placeholder,
  type = "text",
  options,
  required = false,
  disabled = false,
  className,
  inputClassName,
  labelClassName,
  helperText,
  ...props
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  
  const [showPassword, setShowPassword] = React.useState(false)
  const error = errors[name]
  const hasError = !!error

  const renderInput = (field: any) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasError && "border-destructive focus:border-destructive",
              inputClassName
            )}
            rows={4}
            {...props}
          />
        )
      
      case "select":
        return (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                hasError && "border-destructive focus:border-destructive",
                inputClassName
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case "password":
        return (
          <div className="relative">
            <Input
              {...field}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                hasError && "border-destructive focus:border-destructive",
                "pr-10",
                inputClassName
              )}
              {...props}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        )
      
      default:
        return (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasError && "border-destructive focus:border-destructive",
              inputClassName
            )}
            {...props}
          />
        )
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            required && "after:content-['*'] after:text-destructive after:ml-1",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => renderInput(field)}
      />
      
      {hasError && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error?.message}</span>
        </div>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

// Specific form field components
export function EmailField(props: Omit<FormFieldProps, "type">) {
  return <FormField type="email" {...props} />
}

export function PasswordField(props: Omit<FormFieldProps, "type">) {
  return <FormField type="password" {...props} />
}

export function NumberField(props: Omit<FormFieldProps, "type">) {
  return <FormField type="number" {...props} />
}

export function TextareaField(props: Omit<FormFieldProps, "type">) {
  return <FormField type="textarea" {...props} />
}

export function SelectField(props: Omit<FormFieldProps, "type"> & { options: { value: string; label: string }[] }) {
  return <FormField type="select" {...props} />
}
