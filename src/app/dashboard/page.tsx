'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Camera, Edit, Trash2, Calendar, MapPin } from 'lucide-react'
import ProductSearch from '@/components/inventory/ProductSearch'
import { CategoryIcon, CategoryFilter } from '@/components/icons'

interface ProductInfo {
  barcode?: string
  name: string
  brand?: string
  category?: string
  image?: string
  description?: string
}

interface InventoryItem {
  id: string
  name: string
  brand?: string
  category?: string
  quantity: number
  unit: string
  location?: string
  expirationDate?: string
  image?: string
  barcode?: string
}

export default function InventoryPage() {
  const { user } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // Sample data - replace with Convex query
    {
      id: '1',
      name: 'Organic Bananas',
      brand: 'Whole Foods',
      category: 'Fruits',
      quantity: 6,
      unit: 'pieces',
      location: 'Counter',
      expirationDate: '2024-08-15',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&h=100&fit=crop',
      barcode: '123456789'
    },
    {
      id: '2',
      name: 'Whole Milk',
      brand: 'Organic Valley',
      category: 'Dairy',
      quantity: 1,
      unit: 'gallon',
      location: 'Refrigerator',
      expirationDate: '2024-08-12',
      barcode: '987654321'
    }
  ])

  // Form state
  const [formData, setFormData] = useState({
    quantity: 1,
    unit: 'pieces',
    location: '',
    expirationDate: '',
    notes: ''
  })

  const handleProductSelect = (product: ProductInfo) => {
    setSelectedProduct(product)
    setShowAddForm(true)
  }

  const handleAddItem = () => {
    if (!selectedProduct) return

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      category: selectedProduct.category,
      quantity: formData.quantity,
      unit: formData.unit,
      location: formData.location,
      expirationDate: formData.expirationDate,
      image: selectedProduct.image,
      barcode: selectedProduct.barcode
    }

    setInventoryItems(prev => [...prev, newItem])
    setShowAddForm(false)
    setSelectedProduct(null)
    setFormData({
      quantity: 1,
      unit: 'pieces',
      location: '',
      expirationDate: '',
      notes: ''
    })
  }

  const handleDeleteItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id))
  }

  const isExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false
    const expiry = new Date(expirationDate)
    const today = new Date()
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false
    return new Date(expirationDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page">Inventory</h1>
          <p className="text-large text-secondary">
            Manage your kitchen inventory with smart tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-caption">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="heading-section">{inventoryItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-caption">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="heading-section text-warning">
              {inventoryItems.filter(item => item.expirationDate && isExpiringSoon(item.expirationDate)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-caption">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="heading-section text-error">
              {inventoryItems.filter(item => item.expirationDate && isExpired(item.expirationDate)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-caption">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="heading-section">
              {new Set(inventoryItems.map(item => item.category).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Item and Filters */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Search */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="heading-component">Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearch
              onProductSelect={handleProductSelect}
              placeholder="Search products or scan barcode to add to inventory..."
            />
          </CardContent>
        </Card>
        
        {/* Category Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="heading-component">Filter Items</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryFilter
              selectedCategories={selectedCategories as any}
              onCategoryChange={(categories) => setSelectedCategories(categories as string[])}
              showLabel={true}
              size="sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Item Form */}
      {showAddForm && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Add to Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {selectedProduct.image ? (
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-muted-foreground/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="heading-component">{selectedProduct.name}</div>
                <div className="flex items-center gap-2 text-small">
                  {selectedProduct.brand && <span>{selectedProduct.brand}</span>}
                  {selectedProduct.category && (
                    <div className="flex items-center gap-1">
                      <CategoryIcon
                        category={selectedProduct.category}
                        size="xs"
                        variant="subtle"
                        aria-label={`${selectedProduct.category} category`}
                      />
                      <Badge variant="secondary">
                        {selectedProduct.category}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="gallons">Gallons</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="cans">Cans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pantry">Pantry</SelectItem>
                    <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                    <SelectItem value="Freezer">Freezer</SelectItem>
                    <SelectItem value="Counter">Counter</SelectItem>
                    <SelectItem value="Cabinet">Cabinet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration Date</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddItem} className="flex-1">
                Add to Inventory
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="heading-subsection">Current Inventory</CardTitle>
            {selectedCategories.length > 0 && (
              <Badge variant="outline">
                {selectedCategories.length} filter{selectedCategories.length === 1 ? '' : 's'} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventoryItems
              .filter(item => 
                selectedCategories.length === 0 || 
                (item.category && selectedCategories.includes(item.category))
              )
              .map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="heading-component truncate">{item.name}</h3>
                    {item.category && (
                      <div className="flex items-center gap-1">
                        <CategoryIcon
                          category={item.category}
                          size="xs"
                          variant="subtle"
                          aria-label={`${item.category} category`}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                    {item.expirationDate && isExpired(item.expirationDate) && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                    {item.expirationDate && isExpiringSoon(item.expirationDate) && !isExpired(item.expirationDate) && (
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">Soon</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-small text-muted">
                    <span>{item.quantity} {item.unit}</span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    )}
                    {item.expirationDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {inventoryItems
              .filter(item => 
                selectedCategories.length === 0 || 
                (item.category && selectedCategories.includes(item.category))
              ).length === 0 && (
              <div className="text-center py-8 text-body text-muted">
                {selectedCategories.length > 0 
                  ? 'No items found matching the selected filters.' 
                  : 'No items in inventory yet. Use the search above to add your first item!'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}