/**
 * Recipe Service using free recipe APIs
 * Primary: Spoonacular API (free tier: 150 points/day)
 * Fallback: TheMealDB API (completely free)
 */

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
        return await this.searchSpoonacular(params)
      }
      
      // Fallback to demo data or TheMealDB
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
      image: recipe.image,
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
      image: data.image,
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
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',
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
        image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400',
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
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
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
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
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
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
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