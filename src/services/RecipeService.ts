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
  
  // TheMealDB API (no key required)
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
      // Try Spoonacular first if API key is available
      if (this.SPOONACULAR_API_KEY && this.SPOONACULAR_API_KEY !== 'demo') {
        console.log('Attempting to use Spoonacular API...')
        try {
          const results = await this.searchSpoonacular(params)
          console.log('Spoonacular API success, got', results.length, 'recipes')
          return results
        } catch (spoonError) {
          console.warn('Spoonacular API failed, falling back to demo data:', spoonError)
          // Fall through to demo data
        }
      }
      
      // Fallback to demo data
      console.log('Using demo recipe data with Unsplash images')
      return await this.searchWithDemoData(params)
    } catch (error) {
      console.error('Error searching recipes:', error)
      // Return demo data on error
      return this.getDemoRecipes(params.ingredients)
    }
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
      return this.getDemoRecipes([]).slice(0, count)
    } catch (error) {
      console.error('Error fetching random recipes:', error)
      return this.getDemoRecipes([]).slice(0, count)
    }
  }
}

export default RecipeService