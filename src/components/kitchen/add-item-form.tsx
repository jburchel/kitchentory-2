"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarDays, Package, MapPin, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  location: z.string().min(1, "Location is required"),
  expiryDate: z.string().optional(),
  lowStockThreshold: z.number().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddItemFormProps {
  onSubmit?: (data: FormData) => void
  onCancel?: () => void
  defaultValues?: Partial<FormData>
  isLoading?: boolean
}

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Pantry Items",
  "Frozen Foods",
  "Beverages",
  "Snacks",
  "Condiments & Sauces",
  "Baking & Cooking",
  "Other"
]

const units = [
  "pieces",
  "lbs",
  "kg",
  "oz",
  "g",
  "cups",
  "liters",
  "ml",
  "bottles",
  "cans",
  "packages"
]

const locations = [
  "Refrigerator",
  "Freezer",
  "Pantry",
  "Spice Rack",
  "Counter",
  "Cabinets",
  "Basement",
  "Garage",
  "Other"
]

export function AddItemForm({ onSubmit, onCancel, defaultValues, isLoading }: AddItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 1,
      unit: "",
      location: "",
      expiryDate: "",
      lowStockThreshold: undefined,
      notes: "",
      ...defaultValues,
    },
  })

  const onSubmitForm = (data: FormData) => {
    onSubmit?.(data)
  }

  const onReset = () => {
    reset()
    onCancel?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Add New Item</span>
        </CardTitle>
        <CardDescription>
          Add a new item to your kitchen inventory
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Organic Bananas"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Quantity Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Quantity *</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="1"
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <select
                id="unit"
                {...register("unit")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                {...register("lowStockThreshold", { valueAsNumber: true })}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Location and Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location *</span>
              </Label>
              <select
                id="location"
                {...register("location")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <span>Expiry Date</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate")}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Optional notes about this item..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}