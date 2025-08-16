'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ChefHat, 
  Search, 
  RefreshCw, 
  Clock, 
  Users, 
  Heart,
  ShoppingCart,
  BookOpen,
  Sparkles,
  Filter,
  X,
  ExternalLink,
  AlertCircle,
  Utensils
} from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { useInventory } from '@/hooks/useInventory'
import { Recipe } from '@/services/RecipeService'
import { toast } from 'sonner'
import { ConsumptionTracker } from '@/components/inventory/ConsumptionTracker'

export interface RecipeDashboardProps {
  householdId: string
}

export function RecipeDashboard({ householdId }: RecipeDashboardProps) {
  const { 
    recipes, 
    loading, 
    error, 
    selectedRecipe,
    searchByInventory, 
    searchByIngredients,
    getRecipeDetails,
    getRandomRecipes,
    clearRecipes,
    saveRecipe,
    savedRecipes
  } = useRecipes(householdId)
  
  const { items: inventoryItems, consumeIngredients } = useInventory(householdId)
  
  const [searchIngredients, setSearchIngredients] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [showRecipeDetails, setShowRecipeDetails] = useState(false)
  const [showConsumptionTracker, setShowConsumptionTracker] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'inventory' | 'saved'>('inventory')

  // Auto-search on first load
  useEffect(() => {
    if (inventoryItems.length > 0 && recipes.length === 0 && !loading) {
      console.log('Auto-searching recipes with inventory items:', inventoryItems.slice(0, 5).map(i => i.name))
      searchByInventory()
    }
  }, [inventoryItems, recipes.length, loading, searchByInventory])

  const handleIngredientAdd = () => {
    if (searchIngredients.trim()) {
      const ingredients = searchIngredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i && !selectedIngredients.includes(i))
      
      setSelectedIngredients([...selectedIngredients, ...ingredients])
      setSearchIngredients('')
    }
  }

  const handleIngredientRemove = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient))
  }

  const handleSearch = () => {
    if (selectedIngredients.length > 0) {
      searchByIngredients(selectedIngredients)
    } else {
      toast.error('Please add at least one ingredient')
    }
  }

  const handleRecipeClick = async (recipe: Recipe) => {
    await getRecipeDetails(recipe.id)
    setShowRecipeDetails(true)
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    saveRecipe(recipe)
  }

  const handleCookRecipe = async (recipe: Recipe) => {
    if (!recipe.usedIngredients || recipe.usedIngredients.length === 0) {
      toast.error('No ingredients to consume for this recipe')
      return
    }

    try {
      // Map recipe ingredients to inventory items
      const ingredientsToConsume = recipe.usedIngredients
        .map(ingredient => {
          const inventoryItem = inventoryItems.find(item => 
            item.name.toLowerCase().includes(ingredient.name.toLowerCase())
          )
          if (inventoryItem) {
            return {
              itemId: inventoryItem.id,
              quantity: Math.min(ingredient.amount || 1, inventoryItem.quantity)
            }
          }
          return null
        })
        .filter(Boolean) as { itemId: string; quantity: number }[]

      if (ingredientsToConsume.length === 0) {
        toast.error('No matching ingredients found in inventory')
        return
      }

      await consumeIngredients(ingredientsToConsume)
      toast.success(`Cooked ${recipe.title}! Ingredients consumed from inventory.`)
      setShowRecipeDetails(false)
      
    } catch (error) {
      toast.error('Failed to consume ingredients')
    }
  }

  const handleManualCookRecipe = (recipe: Recipe) => {
    if (!recipe.usedIngredients || recipe.usedIngredients.length === 0) {
      toast.error('No ingredients to track for this recipe')
      return
    }
    setShowConsumptionTracker(true)
  }

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => handleRecipeClick(recipe)}
    >
      <div className="relative">
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              console.log('Image failed to load:', recipe.image)
              // Hide the broken image and show fallback
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', recipe.image)
            }}
          />
        )}
        {/* Fallback div for when image fails to load */}
        <div 
          className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-t-lg flex items-center justify-center" 
          style={{ display: recipe.image ? 'none' : 'flex' }}
        >
          <ChefHat className="w-16 h-16 text-orange-400" />
        </div>
        <Button
          size="sm"
          variant={isRecipeSaved(recipe.id) ? "default" : "outline"}
          className="absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation()
            handleSaveRecipe(recipe)
          }}
        >
          <Heart className={`w-4 h-4 ${isRecipeSaved(recipe.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {recipe.readyInMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.readyInMinutes} min
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </div>
          )}
        </div>

        {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-green-600 mb-1">
              Uses {recipe.usedIngredients.length} ingredients from inventory
            </p>
          </div>
        )}

        {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-amber-600 mb-1">
              Missing {recipe.missedIngredients.length} ingredients
            </p>
          </div>
        )}

        {recipe.healthScore !== undefined && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Health Score: {recipe.healthScore}/100
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            Recipe Suggestions
          </h1>
          <p className="text-muted-foreground">
            Find recipes based on what's in your kitchen
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => getRandomRecipes(6)}
            variant="outline"
            disabled={loading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Random Recipes
          </Button>
          <Button 
            onClick={clearRecipes}
            variant="outline"
            disabled={loading || recipes.length === 0}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Items</p>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recipes Found</p>
                <p className="text-2xl font-bold">{recipes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saved Recipes</p>
                <p className="text-2xl font-bold">{savedRecipes.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="inventory">From Inventory</TabsTrigger>
          <TabsTrigger value="search">Custom Search</TabsTrigger>
          <TabsTrigger value="saved">
            Saved Recipes
            {savedRecipes.length > 0 && (
              <Badge variant="default" className="ml-2">
                {savedRecipes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* From Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search Using Your Inventory</span>
                <Button 
                  onClick={searchByInventory}
                  disabled={loading || inventoryItems.length === 0}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Recipes
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inventoryItems.slice(0, 15).map((item) => (
                    <Badge key={item.id} variant="secondary">
                      {item.name}
                    </Badge>
                  ))}
                  {inventoryItems.length > 15 && (
                    <Badge variant="outline">
                      +{inventoryItems.length - 15} more
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>No items in inventory</p>
                  <p className="text-sm">Add items to your inventory to get recipe suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipe Results */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && recipes.length === 0 && !error && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <ChefHat className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
                  <p>Click "Find Recipes" to discover what you can cook!</p>
                </div>
              </CardContent>
            </Card>
          )}

          {recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Custom Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search by Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ingredients (comma separated)"
                  value={searchIngredients}
                  onChange={(e) => setSearchIngredients(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleIngredientAdd()}
                />
                <Button onClick={handleIngredientAdd}>Add</Button>
              </div>
              
              {selectedIngredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <Badge 
                      key={ingredient} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleIngredientRemove(ingredient)}
                    >
                      {ingredient}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleSearch}
                disabled={loading || selectedIngredients.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Recipes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {recipes.length > 0 && activeTab === 'search' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Recipes Tab */}
        <TabsContent value="saved" className="space-y-4">
          {savedRecipes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Heart className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved recipes</h3>
                  <p>Save your favorite recipes to access them later</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recipe Details Dialog */}
      <Dialog open={showRecipeDetails} onOpenChange={setShowRecipeDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedRecipe.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedRecipe.image && (
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      console.log('Dialog image failed to load:', selectedRecipe.image)
                      e.currentTarget.style.display = 'none'
                    }}
                    onLoad={() => {
                      console.log('Dialog image loaded successfully:', selectedRecipe.image)
                    }}
                  />
                )}

                <div className="flex items-center gap-4">
                  {selectedRecipe.readyInMinutes && (
                    <Badge variant="outline">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedRecipe.readyInMinutes} minutes
                    </Badge>
                  )}
                  {selectedRecipe.servings && (
                    <Badge variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      {selectedRecipe.servings} servings
                    </Badge>
                  )}
                  {selectedRecipe.healthScore && (
                    <Badge variant="outline">
                      Health: {selectedRecipe.healthScore}/100
                    </Badge>
                  )}
                </div>

                {selectedRecipe.summary && (
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground" 
                       dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }} />
                  </div>
                )}

                {selectedRecipe.usedIngredients && selectedRecipe.usedIngredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-600">
                      ✓ Ingredients You Have
                    </h3>
                    <ul className="space-y-1">
                      {selectedRecipe.usedIngredients.map((ing) => (
                        <li key={ing.id} className="text-sm">
                          • {ing.original || `${ing.amount} ${ing.unit} ${ing.name}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.missedIngredients && selectedRecipe.missedIngredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-amber-600">
                      ⚠ Missing Ingredients
                    </h3>
                    <ul className="space-y-1">
                      {selectedRecipe.missedIngredients.map((ing) => (
                        <li key={ing.id} className="text-sm">
                          • {ing.original || `${ing.amount} ${ing.unit} ${ing.name}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <div className="text-muted-foreground whitespace-pre-line"
                         dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4">
                  <Button
                    onClick={() => handleCookRecipe(selectedRecipe)}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Auto Cook
                  </Button>
                  
                  <Button
                    onClick={() => handleManualCookRecipe(selectedRecipe)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Utensils className="w-4 h-4 mr-2" />
                    Manual Track
                  </Button>
                  
                  <Button
                    onClick={() => handleSaveRecipe(selectedRecipe)}
                    variant={isRecipeSaved(selectedRecipe.id) ? "default" : "outline"}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isRecipeSaved(selectedRecipe.id) ? 'fill-current' : ''}`} />
                    {isRecipeSaved(selectedRecipe.id) ? 'Saved' : 'Save Recipe'}
                  </Button>
                  
                  {selectedRecipe.sourceUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedRecipe.sourceUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Consumption Tracker */}
      {showConsumptionTracker && selectedRecipe && (
        <ConsumptionTracker
          householdId={householdId}
          recipeName={selectedRecipe.title}
          ingredients={selectedRecipe.usedIngredients?.map(ing => ({
            itemId: inventoryItems.find(item => 
              item.name.toLowerCase().includes(ing.name.toLowerCase())
            )?.id,
            name: ing.name,
            quantity: ing.amount || 1,
            unit: ing.unit || 'pieces'
          })) || []}
          onClose={() => setShowConsumptionTracker(false)}
          onComplete={() => {
            setShowConsumptionTracker(false)
            setShowRecipeDetails(false)
          }}
        />
      )}
    </div>
  )
}