'use client'

import { useState, useCallback, useEffect } from 'react'
import RecipeService, { Recipe, RecipeSearchParams } from '@/services/RecipeService'
import { useInventory } from './useInventory'
import { toast } from 'sonner'

export interface UseRecipesReturn {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  selectedRecipe: Recipe | null
  searchByInventory: () => Promise<void>
  searchByIngredients: (ingredients: string[]) => Promise<void>
  getRecipeDetails: (recipeId: string) => Promise<void>
  getRandomRecipes: (count?: number) => Promise<void>
  clearRecipes: () => void
  saveRecipe: (recipe: Recipe) => void
  savedRecipes: Recipe[]
}

export function useRecipes(householdId?: string): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { items: inventoryItems } = useInventory(householdId)
  const recipeService = RecipeService.getInstance()

  // Load saved recipes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedRecipes')
    if (saved) {
      try {
        setSavedRecipes(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved recipes:', e)
      }
    }
  }, [])

  /**
   * Search recipes using current inventory items
   */
  const searchByInventory = useCallback(async () => {
    if (inventoryItems.length === 0) {
      toast.error('No items in inventory to search with')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract ingredient names from inventory
      const ingredients = inventoryItems
        .map(item => item.name.toLowerCase())
        .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
        .slice(0, 10) // Limit to 10 ingredients for API

      const params: RecipeSearchParams = {
        ingredients,
        number: 20,
        ranking: 'max-used-ingredients'
      }

      const foundRecipes = await recipeService.searchRecipesByIngredients(params)
      
      if (foundRecipes.length === 0) {
        toast.info('No recipes found with your current inventory')
      } else {
        toast.success(`Found ${foundRecipes.length} recipes using your inventory!`)
      }
      
      setRecipes(foundRecipes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search recipes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [inventoryItems, recipeService])

  /**
   * Search recipes by specific ingredients
   */
  const searchByIngredients = useCallback(async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      toast.error('Please provide at least one ingredient')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params: RecipeSearchParams = {
        ingredients,
        number: 20,
        ranking: 'min-missing-ingredients'
      }

      const foundRecipes = await recipeService.searchRecipesByIngredients(params)
      
      if (foundRecipes.length === 0) {
        toast.info('No recipes found with those ingredients')
      } else {
        toast.success(`Found ${foundRecipes.length} recipes!`)
      }
      
      setRecipes(foundRecipes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search recipes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [recipeService])

  /**
   * Get detailed information about a specific recipe
   */
  const getRecipeDetails = useCallback(async (recipeId: string) => {
    setLoading(true)
    setError(null)

    try {
      const details = await recipeService.getRecipeDetails(recipeId)
      
      if (details) {
        setSelectedRecipe(details)
        toast.success('Recipe details loaded')
      } else {
        toast.error('Recipe not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recipe details'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [recipeService])

  /**
   * Get random recipe suggestions
   */
  const getRandomRecipes = useCallback(async (count: number = 5) => {
    setLoading(true)
    setError(null)

    try {
      const randomRecipes = await recipeService.getRandomRecipes(count)
      setRecipes(randomRecipes)
      toast.success(`Found ${randomRecipes.length} recipe suggestions!`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get random recipes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [recipeService])

  /**
   * Clear current recipes
   */
  const clearRecipes = useCallback(() => {
    setRecipes([])
    setSelectedRecipe(null)
    setError(null)
  }, [])

  /**
   * Save a recipe to favorites
   */
  const saveRecipe = useCallback((recipe: Recipe) => {
    const newSaved = [...savedRecipes]
    const existingIndex = newSaved.findIndex(r => r.id === recipe.id)
    
    if (existingIndex >= 0) {
      newSaved.splice(existingIndex, 1)
      toast.info('Recipe removed from favorites')
    } else {
      newSaved.push(recipe)
      toast.success('Recipe saved to favorites!')
    }
    
    setSavedRecipes(newSaved)
    localStorage.setItem('savedRecipes', JSON.stringify(newSaved))
  }, [savedRecipes])

  return {
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
  }
}