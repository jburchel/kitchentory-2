'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Plus, 
  Clock, 
  Utensils, 
  Search, 
  Filter,
  ChefHat,
  AlertTriangle
} from 'lucide-react'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { useInventory } from '@/hooks/useInventory'
import { InventoryItem } from '@/components/inventory/InventoryGrid'

export interface MealPlan {
  id: string
  name: string
  date: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: {
    itemId?: string
    name: string
    quantity: number
    unit: string
  }[]
  instructions?: string
  prepTime?: number // in minutes
  servings?: number
}

export interface MealPlanningProps {
  householdId: string
  className?: string
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack', icon: '🍪' }
]

export function MealPlanning({ householdId, className }: MealPlanningProps) {
  const { items: inventoryItems, loading: inventoryLoading } = useInventory(householdId)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMealType, setSelectedMealType] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    mealType: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    ingredients: [] as { itemId?: string; name: string; quantity: number; unit: string }[],
    instructions: '',
    prepTime: 30,
    servings: 4
  })

  // Filter inventory items based on search
  const filteredInventoryItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter meal plans by selected date and meal type
  const filteredMealPlans = mealPlans.filter(plan => {
    const matchesDate = format(plan.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    const matchesMealType = selectedMealType ? plan.mealType === selectedMealType : true
    return matchesDate && matchesMealType
  })

  const handleAddIngredient = (item?: InventoryItem) => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          itemId: item?.id,
          name: item?.name || '',
          quantity: item?.quantity || 1,
          unit: item?.unit || 'pieces'
        }
      ]
    }))
  }

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const handleSaveMealPlan = () => {
    const newMealPlan: MealPlan = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      date: new Date(formData.date)
    }

    setMealPlans(prev => [...prev, newMealPlan])
    setShowAddForm(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      mealType: 'dinner',
      ingredients: [],
      instructions: '',
      prepTime: 30,
      servings: 4
    })
  }

  const handleDateChange = (days: number) => {
    setSelectedDate(addDays(selectedDate, days))
  }

  // Get missing ingredients (items in meal plan but not in inventory)
  const getMissingIngredients = (mealPlan: MealPlan) => {
    return mealPlan.ingredients.filter(ingredient => {
      const inInventory = inventoryItems.some(item => 
        item.name.toLowerCase() === ingredient.name.toLowerCase() && 
        item.quantity >= ingredient.quantity
      )
      return !inInventory
    })
  }

  if (inventoryLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meal Planning</h1>
          <p className="text-muted-foreground">
            Plan your meals and organize your shopping
          </p>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Add Meal Plan
        </Button>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDateChange(-1)}
            >
              ← Previous
            </Button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isToday(selectedDate) ? 'Today' : isTomorrow(selectedDate) ? 'Tomorrow' : ''}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDateChange(1)}
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={selectedMealType === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMealType('')}
          >
            All Meals
          </Button>
          {MEAL_TYPES.map(type => (
            <Button
              key={type.id}
              variant={selectedMealType === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType(type.id)}
              className="flex items-center gap-1"
            >
              <span>{type.icon}</span>
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Meal Plans */}
      {filteredMealPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMealPlans.map(mealPlan => {
            const missingIngredients = getMissingIngredients(mealPlan)
            
            return (
              <Card key={mealPlan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{mealPlan.name}</CardTitle>
                    <Badge variant="secondary">
                      {MEAL_TYPES.find(t => t.id === mealPlan.mealType)?.icon}{' '}
                      {MEAL_TYPES.find(t => t.id === mealPlan.mealType)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(mealPlan.date, 'h:mm a')} • {mealPlan.servings} servings
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Ingredients</h4>
                      <ul className="text-sm space-y-1">
                        {mealPlan.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{ingredient.name}</span>
                            <span>{ingredient.quantity} {ingredient.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {missingIngredients.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Missing Items</span>
                        </div>
                        <ul className="text-sm text-amber-600 mt-1">
                          {missingIngredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient.name} ({ingredient.quantity} {ingredient.unit})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {mealPlan.prepTime && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{mealPlan.prepTime} min prep</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No meal plans scheduled</h3>
            <p className="text-muted-foreground mb-4">
              {selectedMealType 
                ? `No ${MEAL_TYPES.find(t => t.id === selectedMealType)?.label.toLowerCase()} plans for this day` 
                : 'Add your first meal plan to get started'}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meal Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Meal Plan Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Meal Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Meal Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Spaghetti Bolognese"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Meal Type</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({...formData, mealType: e.target.value as any})}
                    className="w-full p-2 border rounded-md"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Prep Time (min)</label>
                    <Input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({...formData, prepTime: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Servings</label>
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Ingredients</label>
                <div className="space-y-2 mt-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient.name}
                        onChange={(e) => {
                          const newIngredients = [...formData.ingredients]
                          newIngredients[index].name = e.target.value
                          setFormData({...formData, ingredients: newIngredients})
                        }}
                        placeholder="Ingredient name"
                      />
                      <Input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => {
                          const newIngredients = [...formData.ingredients]
                          newIngredients[index].quantity = parseInt(e.target.value) || 0
                          setFormData({...formData, ingredients: newIngredients})
                        }}
                        placeholder="Qty"
                        className="w-20"
                      />
                      <Input
                        value={ingredient.unit}
                        onChange={(e) => {
                          const newIngredients = [...formData.ingredients]
                          newIngredients[index].unit = e.target.value
                          setFormData({...formData, ingredients: newIngredients})
                        }}
                        placeholder="Unit"
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add ingredient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddIngredient()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {searchTerm && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {filteredInventoryItems.slice(0, 5).map(item => (
                        <div 
                          key={item.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                          onClick={() => {
                            handleAddIngredient(item)
                            setSearchTerm('')
                          }}
                        >
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Cooking instructions..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMealPlan} disabled={!formData.name}>
                  Save Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}