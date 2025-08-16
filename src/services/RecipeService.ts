/**
 * Recipe Service using free recipe APIs
 * Primary: Spoonacular API (free tier: 150 points/day)
 * To use real API: Sign up at https://spoonacular.com/food-api
 * Add your API key as NEXT_PUBLIC_SPOONACULAR_API_KEY in .env.local
 * Fallback: Demo recipes with Unsplash images (completely free)
 */

import { getRecipeImage, getRandomRecipeImage } from './RecipeImages'

export interface Recipe {
  id: string
  title: string
  image?: string
  readyInMinutes?: number
  servings?: number
  sourceUrl?: string
  summary?: string
  instructions?: string
  missedIngredients?: Ingredient[]
  usedIngredients?: Ingredient[]
  unusedIngredients?: Ingredient[]
  likes?: number
  healthScore?: number
  pricePerServing?: number
  dishTypes?: string[]
  diets?: string[]
  cuisines?: string[]
}

export interface Ingredient {
  id: number
  name: string
  amount: number
  unit: string
  image?: string
  original?: string
}

export interface RecipeSearchParams {
  ingredients: string[]
  number?: number
  ranking?: 'min-missing-ingredients' | 'max-used-ingredients'
  ignorePantry?: boolean
  diet?: string
  intolerances?: string[]
  cuisine?: string
  type?: string
}

class RecipeService {
  private static instance: RecipeService
  
  // Spoonacular API (sign up free at https://spoonacular.com/food-api)
  private readonly SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || 'demo'
  private readonly SPOONACULAR_BASE_URL = 'https://api.spoonacular.com'
  
  // TheMealDB API (no key required) - completely free with real images!
  private readonly MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

  private constructor() {}

  static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService()
    }
    return RecipeService.instance
  }

  /**
   * Search recipes by ingredients using Spoonacular API
   */
  async searchRecipesByIngredients(params: RecipeSearchParams): Promise<Recipe[]> {
    try {
      // Try TheMealDB first (completely free with real images!)
      console.log('Attempting to use TheMealDB API...')
      try {
        const results = await this.searchTheMealDB(params)
        if (results.length > 0) {
          console.log('TheMealDB API success, got', results.length, 'recipes')
          return results
        }
      } catch (mealError) {
        console.warn('TheMealDB API failed, trying Spoonacular:', mealError)
      }

      // Try Spoonacular as backup if API key is available
      if (this.SPOONACULAR_API_KEY && this.SPOONACULAR_API_KEY !== 'demo') {
        console.log('Attempting to use Spoonacular API...')
        try {
          const results = await this.searchSpoonacular(params)
          console.log('Spoonacular API success, got', results.length, 'recipes')
          return results
        } catch (spoonError) {
          console.warn('Spoonacular API failed, falling back to demo data:', spoonError)
        }
      }
      
      // Fallback to demo data
      console.log('Using demo recipe data with placeholder images')
      return await this.searchWithDemoData(params)
    } catch (error) {
      console.error('Error searching recipes:', error)
      // Return demo data on error
      return this.getDemoRecipes(params.ingredients)
    }
  }

  private async searchTheMealDB(params: RecipeSearchParams): Promise<Recipe[]> {
    const recipes: Recipe[] = []
    
    // Map common inventory items to TheMealDB ingredient names
    const ingredientMap: Record<string, string> = {
      'chicken': 'chicken',
      'beef': 'beef',
      'pork': 'pork',
      'fish': 'salmon',
      'tomatoes': 'tomato',
      'tomato': 'tomato',
      'onions': 'onion',
      'onion': 'onion',
      'potatoes': 'potato',
      'potato': 'potato',
      'carrots': 'carrot',
      'carrot': 'carrot',
      'cheese': 'cheese',
      'eggs': 'egg',
      'egg': 'egg',
      'milk': 'milk',
      'butter': 'butter',
      'rice': 'rice',
      'pasta': 'pasta',
      'bread': 'bread',
      'garlic': 'garlic',
      'mushrooms': 'mushroom',
      'mushroom': 'mushroom',
      'peppers': 'pepper',
      'pepper': 'pepper',
      'lettuce': 'lettuce',
      'spinach': 'spinach'
    }
    
    // Also try some common ingredients that work well with TheMealDB
    const commonIngredients = ['chicken', 'beef', 'salmon', 'tomato', 'onion', 'potato', 'cheese', 'egg']
    const searchIngredients = [...params.ingredients.slice(0, 2)]
    
    // Add mapped ingredients
    for (const ingredient of params.ingredients.slice(0, 3)) {
      const mapped = ingredientMap[ingredient.toLowerCase()]
      if (mapped && !searchIngredients.includes(mapped)) {
        searchIngredients.push(mapped)
      }
    }
    
    // If we don't have good matches, try some common ingredients
    if (searchIngredients.length === 0) {
      searchIngredients.push(...commonIngredients.slice(0, 3))
    }
    
    console.log('TheMealDB searching for ingredients:', searchIngredients)
    
    // TheMealDB searches by single ingredient, so we'll try each ingredient
    for (const ingredient of searchIngredients.slice(0, 3)) {
      try {
        const response = await fetch(
          `${this.MEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient.toLowerCase())}`
        )
        
        if (response.ok) {
          const data = await response.json()
          console.log(`TheMealDB response for ${ingredient}:`, data)
          if (data.meals) {
            const mealRecipes = data.meals.slice(0, 8).map((meal: any) => ({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb, // TheMealDB provides high-quality images!
              sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
              usedIngredients: [{ id: 1, name: ingredient, amount: 1, unit: '' }],
              missedIngredients: [],
              cuisines: meal.strArea ? [meal.strArea] : [],
              dishTypes: meal.strCategory ? [meal.strCategory] : []
            }))
            recipes.push(...mealRecipes)
            console.log(`Found ${mealRecipes.length} recipes for ${ingredient}`)
          } else {
            console.log(`No meals found for ingredient: ${ingredient}`)
          }
        }
      } catch (error) {
        console.warn(`Failed to search TheMealDB for ingredient: ${ingredient}`, error)
      }
    }

    // Remove duplicates and limit results
    const uniqueRecipes = recipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    )
    
    console.log(`TheMealDB total unique recipes found: ${uniqueRecipes.length}`)
    return uniqueRecipes.slice(0, params.number || 10)
  }

  private async searchSpoonacular(params: RecipeSearchParams): Promise<Recipe[]> {
    const ingredients = params.ingredients.join(',')
    const queryParams = new URLSearchParams({
      apiKey: this.SPOONACULAR_API_KEY,
      ingredients,
      number: (params.number || 10).toString(),
      ranking: params.ranking || 'min-missing-ingredients',
      ignorePantry: (params.ignorePantry ?? true).toString()
    })

    const response = await fetch(
      `${this.SPOONACULAR_BASE_URL}/recipes/findByIngredients?${queryParams}`
    )

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return data.map((recipe: any) => ({
      id: recipe.id.toString(),
      title: recipe.title,
      // Spoonacular provides images at https://spoonacular.com/recipeImages/{id}-{size}.{extension}
      // We'll use the image they provide or generate one based on the recipe ID
      image: recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg`,
      usedIngredients: recipe.usedIngredients,
      missedIngredients: recipe.missedIngredients,
      unusedIngredients: recipe.unusedIngredients,
      likes: recipe.likes
    }))
  }

  /**
   * Get detailed recipe information
   */
  async getRecipeDetails(recipeId: string): Promise<Recipe | null> {
    try {
      // Try TheMealDB first (works for TheMealDB recipe IDs)
      if (recipeId.length >= 5 && !isNaN(Number(recipeId))) {
        try {
          const details = await this.getTheMealDBDetails(recipeId)
          if (details) {
            console.log('TheMealDB details retrieved for recipe:', recipeId)
            return details
          }
        } catch (mealError) {
          console.warn('TheMealDB details failed, trying Spoonacular:', mealError)
        }
      }

      // Try Spoonacular if API key available
      if (this.SPOONACULAR_API_KEY && this.SPOONACULAR_API_KEY !== 'demo') {
        return await this.getSpoonacularDetails(recipeId)
      }
      
      // Return demo recipe details
      return this.getDemoRecipeDetails(recipeId)
    } catch (error) {
      console.error('Error fetching recipe details:', error)
      return null
    }
  }

  private async getTheMealDBDetails(recipeId: string): Promise<Recipe | null> {
    const response = await fetch(`${this.MEALDB_BASE_URL}/lookup.php?i=${recipeId}`)
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.meals || data.meals.length === 0) {
      return null
    }

    const meal = data.meals[0]
    
    // Parse ingredients from TheMealDB format
    const ingredients: Ingredient[] = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      const measure = meal[`strMeasure${i}`]
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          id: i,
          name: ingredient.trim(),
          amount: 1,
          unit: measure ? measure.trim() : '',
          original: measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim()
        })
      }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
      summary: `${meal.strMeal} is a delicious ${meal.strCategory} dish from ${meal.strArea} cuisine.`,
      instructions: meal.strInstructions,
      usedIngredients: ingredients,
      missedIngredients: [],
      readyInMinutes: 45, // TheMealDB doesn't provide cook time
      servings: 4, // Default serving size
      cuisines: meal.strArea ? [meal.strArea] : [],
      dishTypes: meal.strCategory ? [meal.strCategory] : []
    }
  }

  private async getSpoonacularDetails(recipeId: string): Promise<Recipe> {
    const queryParams = new URLSearchParams({
      apiKey: this.SPOONACULAR_API_KEY,
      includeNutrition: 'false'
    })

    const response = await fetch(
      `${this.SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?${queryParams}`
    )

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      id: data.id.toString(),
      title: data.title,
      // Ensure we have an image URL
      image: data.image || `https://spoonacular.com/recipeImages/${data.id}-636x393.jpg`,
      readyInMinutes: data.readyInMinutes,
      servings: data.servings,
      sourceUrl: data.sourceUrl,
      summary: data.summary,
      instructions: data.instructions,
      healthScore: data.healthScore,
      pricePerServing: data.pricePerServing,
      dishTypes: data.dishTypes,
      diets: data.diets,
      cuisines: data.cuisines
    }
  }

  /**
   * Search with demo data when API is not available
   */
  private async searchWithDemoData(params: RecipeSearchParams): Promise<Recipe[]> {
    // For demo purposes, return recipes based on ingredients
    return this.getDemoRecipes(params.ingredients)
  }

  /**
   * Get demo recipes for testing without API
   */
  private getDemoRecipes(ingredients: string[]): Recipe[] {
    const demoRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Quick Chicken Stir Fry',
        image: getRecipeImage('Quick Chicken Stir Fry'),
        readyInMinutes: 25,
        servings: 4,
        summary: 'A healthy and quick chicken stir fry with vegetables.',
        usedIngredients: [
          { id: 1, name: 'chicken', amount: 500, unit: 'g' },
          { id: 2, name: 'vegetables', amount: 300, unit: 'g' }
        ],
        missedIngredients: [
          { id: 3, name: 'soy sauce', amount: 2, unit: 'tbsp' }
        ],
        healthScore: 85,
        dishTypes: ['dinner', 'main course'],
        cuisines: ['Asian']
      },
      {
        id: '2',
        title: 'Pasta Carbonara',
        image: getRecipeImage('Pasta Carbonara'),
        readyInMinutes: 20,
        servings: 2,
        summary: 'Classic Italian pasta carbonara with eggs and bacon.',
        usedIngredients: [
          { id: 4, name: 'pasta', amount: 200, unit: 'g' },
          { id: 5, name: 'eggs', amount: 2, unit: '' },
          { id: 6, name: 'bacon', amount: 100, unit: 'g' }
        ],
        missedIngredients: [
          { id: 7, name: 'parmesan', amount: 50, unit: 'g' }
        ],
        healthScore: 65,
        dishTypes: ['lunch', 'main course'],
        cuisines: ['Italian']
      },
      {
        id: '3',
        title: 'Fresh Garden Salad',
        image: getRecipeImage('Fresh Garden Salad'),
        readyInMinutes: 15,
        servings: 2,
        summary: 'A refreshing salad with mixed greens and vegetables.',
        usedIngredients: [
          { id: 8, name: 'lettuce', amount: 200, unit: 'g' },
          { id: 9, name: 'tomatoes', amount: 150, unit: 'g' },
          { id: 10, name: 'cucumber', amount: 100, unit: 'g' }
        ],
        missedIngredients: [],
        healthScore: 95,
        dishTypes: ['salad', 'side dish'],
        cuisines: ['Mediterranean']
      },
      {
        id: '4',
        title: 'Vegetable Soup',
        image: getRecipeImage('Vegetable Soup'),
        readyInMinutes: 30,
        servings: 4,
        summary: 'Hearty vegetable soup perfect for cold days.',
        usedIngredients: [
          { id: 11, name: 'carrots', amount: 200, unit: 'g' },
          { id: 12, name: 'potatoes', amount: 300, unit: 'g' },
          { id: 13, name: 'onions', amount: 100, unit: 'g' }
        ],
        missedIngredients: [
          { id: 14, name: 'vegetable stock', amount: 1, unit: 'L' }
        ],
        healthScore: 90,
        dishTypes: ['soup', 'lunch'],
        cuisines: ['European']
      },
      {
        id: '5',
        title: 'Grilled Cheese Sandwich',
        image: getRecipeImage('Grilled Cheese Sandwich'),
        readyInMinutes: 10,
        servings: 1,
        summary: 'Classic comfort food - crispy grilled cheese sandwich.',
        usedIngredients: [
          { id: 15, name: 'bread', amount: 2, unit: 'slices' },
          { id: 16, name: 'cheese', amount: 50, unit: 'g' },
          { id: 17, name: 'butter', amount: 10, unit: 'g' }
        ],
        missedIngredients: [],
        healthScore: 40,
        dishTypes: ['lunch', 'snack'],
        cuisines: ['American']
      },
      {
        id: '6',
        title: 'Classic Beef Tacos',
        image: getRecipeImage('tacos'),
        readyInMinutes: 20,
        servings: 4,
        summary: 'Delicious beef tacos with fresh toppings.',
        usedIngredients: [
          { id: 18, name: 'ground beef', amount: 500, unit: 'g' },
          { id: 19, name: 'taco shells', amount: 8, unit: '' },
          { id: 20, name: 'lettuce', amount: 100, unit: 'g' }
        ],
        missedIngredients: [
          { id: 21, name: 'sour cream', amount: 100, unit: 'ml' },
          { id: 22, name: 'salsa', amount: 150, unit: 'ml' }
        ],
        healthScore: 70,
        dishTypes: ['dinner', 'main course'],
        cuisines: ['Mexican']
      },
      {
        id: '7',
        title: 'Homemade Pizza Margherita',
        image: getRecipeImage('pizza'),
        readyInMinutes: 35,
        servings: 4,
        summary: 'Classic Italian pizza with fresh mozzarella and basil.',
        usedIngredients: [
          { id: 23, name: 'pizza dough', amount: 400, unit: 'g' },
          { id: 24, name: 'tomato sauce', amount: 200, unit: 'ml' },
          { id: 25, name: 'mozzarella', amount: 200, unit: 'g' }
        ],
        missedIngredients: [
          { id: 26, name: 'fresh basil', amount: 10, unit: 'leaves' }
        ],
        healthScore: 60,
        dishTypes: ['dinner', 'main course'],
        cuisines: ['Italian']
      },
      {
        id: '8',
        title: 'Fluffy Pancakes',
        image: getRecipeImage('pancakes'),
        readyInMinutes: 15,
        servings: 2,
        summary: 'Light and fluffy pancakes perfect for breakfast.',
        usedIngredients: [
          { id: 27, name: 'flour', amount: 200, unit: 'g' },
          { id: 28, name: 'eggs', amount: 2, unit: '' },
          { id: 29, name: 'milk', amount: 250, unit: 'ml' }
        ],
        missedIngredients: [
          { id: 30, name: 'maple syrup', amount: 50, unit: 'ml' }
        ],
        healthScore: 45,
        dishTypes: ['breakfast'],
        cuisines: ['American']
      },
      {
        id: '9',
        title: 'Berry Smoothie Bowl',
        image: getRecipeImage('smoothie'),
        readyInMinutes: 10,
        servings: 1,
        summary: 'Healthy and refreshing smoothie bowl with mixed berries.',
        usedIngredients: [
          { id: 31, name: 'mixed berries', amount: 200, unit: 'g' },
          { id: 32, name: 'banana', amount: 1, unit: '' },
          { id: 33, name: 'yogurt', amount: 150, unit: 'ml' }
        ],
        missedIngredients: [
          { id: 34, name: 'granola', amount: 30, unit: 'g' }
        ],
        healthScore: 92,
        dishTypes: ['breakfast', 'snack'],
        cuisines: ['American']
      },
      {
        id: '10',
        title: 'Classic Burger',
        image: getRecipeImage('burger'),
        readyInMinutes: 20,
        servings: 2,
        summary: 'Juicy homemade burger with all the fixings.',
        usedIngredients: [
          { id: 35, name: 'ground beef', amount: 300, unit: 'g' },
          { id: 36, name: 'burger buns', amount: 2, unit: '' },
          { id: 37, name: 'lettuce', amount: 50, unit: 'g' }
        ],
        missedIngredients: [
          { id: 38, name: 'pickles', amount: 4, unit: 'slices' },
          { id: 39, name: 'ketchup', amount: 30, unit: 'ml' }
        ],
        healthScore: 55,
        dishTypes: ['lunch', 'dinner'],
        cuisines: ['American']
      }
    ]

    // Filter recipes based on matching ingredients
    const lowerIngredients = ingredients.map(i => i.toLowerCase())
    
    return demoRecipes.map(recipe => {
      const usedCount = recipe.usedIngredients?.filter(ing => 
        lowerIngredients.some(i => ing.name.toLowerCase().includes(i))
      ).length || 0
      
      return {
        ...recipe,
        matchScore: usedCount / Math.max(recipe.usedIngredients?.length || 1, 1)
      }
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  private getDemoRecipeDetails(recipeId: string): Recipe {
    const recipes = this.getDemoRecipes([])
    const recipe = recipes.find(r => r.id === recipeId)
    
    if (!recipe) {
      return {
        id: recipeId,
        title: 'Recipe Not Found',
        summary: 'This recipe could not be found.'
      }
    }

    return {
      ...recipe,
      instructions: `1. Prepare all ingredients\n2. Cook according to recipe\n3. Season to taste\n4. Serve and enjoy!`,
      sourceUrl: '#'
    }
  }

  /**
   * Get random recipes
   */
  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    try {
      // Try TheMealDB random recipes first
      console.log('Fetching random recipes from TheMealDB...')
      const recipes: Recipe[] = []
      
      for (let i = 0; i < count; i++) {
        try {
          const response = await fetch(`${this.MEALDB_BASE_URL}/random.php`)
          if (response.ok) {
            const data = await response.json()
            if (data.meals && data.meals[0]) {
              const meal = data.meals[0]
              recipes.push({
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
                summary: `${meal.strMeal} is a delicious ${meal.strCategory} dish from ${meal.strArea} cuisine.`,
                readyInMinutes: 45,
                servings: 4,
                cuisines: meal.strArea ? [meal.strArea] : [],
                dishTypes: meal.strCategory ? [meal.strCategory] : []
              })
            }
          }
        } catch (randomError) {
          console.warn('Failed to get random recipe from TheMealDB:', randomError)
        }
      }

      if (recipes.length > 0) {
        console.log('TheMealDB random recipes success, got', recipes.length, 'recipes')
        return recipes
      }

      // Fallback to Spoonacular if available
      if (this.SPOONACULAR_API_KEY && this.SPOONACULAR_API_KEY !== 'demo') {
        const queryParams = new URLSearchParams({
          apiKey: this.SPOONACULAR_API_KEY,
          number: count.toString()
        })

        const response = await fetch(
          `${this.SPOONACULAR_BASE_URL}/recipes/random?${queryParams}`
        )

        if (response.ok) {
          const data = await response.json()
          return data.recipes.map((recipe: any) => ({
            id: recipe.id.toString(),
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            summary: recipe.summary,
            sourceUrl: recipe.sourceUrl
          }))
        }
      }
      
      // Return random demo recipes
      console.log('Using demo recipes for random selection')
      return this.getDemoRecipes([]).slice(0, count)
    } catch (error) {
      console.error('Error fetching random recipes:', error)
      return this.getDemoRecipes([]).slice(0, count)
    }
  }
}

export default RecipeService