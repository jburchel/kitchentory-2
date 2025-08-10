'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Scan, Search, Package, Calendar, AlertTriangle, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { formatISO } from 'date-fns'
import { CameraScanner } from '@/components/ui/CameraScanner'
import { usePWA } from '@/components/providers/PWAProvider'

// Food categories with their associated colors and icons
export const FOOD_CATEGORIES = {
  produce: { label: 'Produce', color: 'text-green-600 bg-green-50 border-green-200', icon: '🥬' },
  dairy: { label: 'Dairy', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🥛' },
  meat: { label: 'Meat & Seafood', color: 'text-red-600 bg-red-50 border-red-200', icon: '🥩' },
  pantry: { label: 'Pantry', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: '🏺' },
  frozen: { label: 'Frozen', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: '🧊' },
  beverages: { label: 'Beverages', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: '🧃' },
  snacks: { label: 'Snacks', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🍿' },
  household: { label: 'Household', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '🧽' }
} as const

type FoodCategory = keyof typeof FOOD_CATEGORIES

// Validation schema for inventory item
const addItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Name must be less than 100 characters'),
  category: z.enum(Object.keys(FOOD_CATEGORIES) as [FoodCategory, ...FoodCategory[]], {
    required_error: 'Category is required'
  }),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(999, 'Quantity too large'),
  unit: z.string().min(1, 'Unit is required'),
  expirationDate: z.string().optional(),
  purchaseDate: z.string().optional(),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  barcode: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  location: z.string().max(50, 'Location must be less than 50 characters').optional(),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional()
})

type AddItemFormData = z.infer<typeof addItemSchema>

// Common units for different categories
const UNITS_BY_CATEGORY = {
  produce: ['lbs', 'kg', 'pieces', 'bunches', 'heads'],
  dairy: ['units', 'gallons', 'liters', 'oz', 'lbs'],
  meat: ['lbs', 'kg', 'pieces', 'packages'],
  pantry: ['units', 'boxes', 'bags', 'cans', 'bottles'],
  frozen: ['units', 'bags', 'boxes', 'packages'],
  beverages: ['units', 'bottles', 'cans', 'gallons', 'liters'],
  snacks: ['units', 'bags', 'boxes', 'packages'],
  household: ['units', 'bottles', 'packages', 'rolls']
}

export interface AddItemFormProps {
  householdId: string
  onSuccess?: (item: AddItemFormData) => void
  onCancel?: () => void
  initialData?: Partial<AddItemFormData>
  className?: string
}

export function AddItemForm({ 
  householdId, 
  onSuccess, 
  onCancel, 
  initialData,
  className 
}: AddItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const { isOnline } = usePWA()

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: '',
      category: 'pantry',
      quantity: 1,
      unit: 'units',
      expirationDate: '',
      purchaseDate: formatISO(new Date(), { representation: 'date' }),
      cost: undefined,
      barcode: '',
      notes: '',
      location: '',
      brand: '',
      ...initialData
    }
  })

  const selectedCategory = form.watch('category')
  const availableUnits = UNITS_BY_CATEGORY[selectedCategory] || ['units']

  const onSubmit = async (data: AddItemFormData) => {
    try {
      setIsSubmitting(true)

      // Mock API call - will be replaced with actual Convex mutation
      console.log('Adding item:', data)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(`Added ${data.name} to inventory`)
      onSuccess?.(data)
      
      // Reset form
      form.reset()
      
    } catch (error) {
      toast.error('Failed to add item')
      console.error('Error adding item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBarcodeDetected = (barcode: string) => {
    form.setValue('barcode', barcode)
    setShowBarcodeScanner(false)
    toast.success(`Barcode detected: ${barcode}`)
    
    // Auto-trigger product lookup
    setTimeout(() => {
      handleProductLookup()
    }, 500)
  }

  const handlePhotoCapture = (imageData: string) => {
    setCapturedPhoto(imageData)
    setShowPhotoCapture(false)
    toast.success('Photo captured! This will help identify your item.')
  }

  const handleProductLookup = async () => {
    const barcode = form.getValues('barcode')
    if (!barcode) {
      toast.error('Please enter a barcode first')
      return
    }

    // Mock product lookup - will be replaced with actual API
    toast.success('Looking up product...')
    
    // Simulate lookup delay
    setTimeout(() => {
      const mockProduct = {
        name: 'Organic Bananas',
        brand: 'Fresh Market',
        category: 'produce' as FoodCategory,
        unit: 'lbs'
      }
      
      form.setValue('name', mockProduct.name)
      form.setValue('brand', mockProduct.brand)
      form.setValue('category', mockProduct.category)
      form.setValue('unit', mockProduct.unit)
      
      toast.success('Product details found!')
    }, 1000)
  }

  const getCategoryStyle = (category: FoodCategory) => {
    return FOOD_CATEGORIES[category]?.color || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" />
          Add New Item
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Barcode Scanner Section */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input
                id="barcode"
                placeholder="Scan or enter barcode"
                {...form.register('barcode')}
              />
            </div>
            <div className="flex gap-2 items-end">
              <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Scan className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                  </DialogHeader>
                  <CameraScanner
                    mode="barcode"
                    onScan={handleBarcodeDetected}
                    onClose={() => setShowBarcodeScanner(false)}
                    className="border-0"
                  />
                </DialogContent>
              </Dialog>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleProductLookup}
                disabled={!form.watch('barcode')}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Organic Bananas"
              {...form.register('name')}
              className={form.formState.errors.name ? 'border-red-500' : ''}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value: FoodCategory) => {
                  form.setValue('category', value)
                  // Auto-adjust unit when category changes
                  const defaultUnit = UNITS_BY_CATEGORY[value]?.[0] || 'units'
                  form.setValue('unit', defaultUnit)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className={`w-fit ${getCategoryStyle(selectedCategory)}`}>
                {FOOD_CATEGORIES[selectedCategory]?.icon} {FOOD_CATEGORIES[selectedCategory]?.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                placeholder="e.g., Fresh Market"
                {...form.register('brand')}
              />
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="999"
                {...form.register('quantity', { valueAsNumber: true })}
                className={form.formState.errors.quantity ? 'border-red-500' : ''}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={form.watch('unit')}
                onValueChange={(value) => form.setValue('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...form.register('purchaseDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiration Date
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </Label>
              <Input
                id="expirationDate"
                type="date"
                {...form.register('expirationDate')}
              />
            </div>
          </div>

          {/* Cost and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (Optional)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register('cost', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Pantry, Fridge"
                {...form.register('location')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this item..."
              rows={3}
              {...form.register('notes')}
              className="resize-none"
            />
          </div>

          {/* Photo Capture */}
          <div className="space-y-2">
            <Label>Item Photo (Optional)</Label>
            <div className="flex items-center gap-3">
              {capturedPhoto ? (
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured item"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={() => setCapturedPhoto(null)}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Dialog open={showPhotoCapture} onOpenChange={setShowPhotoCapture}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      {capturedPhoto ? 'Retake Photo' : 'Take Photo'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Take Item Photo</DialogTitle>
                    </DialogHeader>
                    <CameraScanner
                      mode="photo"
                      onCapture={handlePhotoCapture}
                      onClose={() => setShowPhotoCapture(false)}
                      className="border-0"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Add a photo to help identify this item in your inventory
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Item...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Add to Inventory
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}