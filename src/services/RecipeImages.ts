/**
 * Recipe Image Service
 * Provides high-quality food images from various free sources
 */

export const RECIPE_IMAGES = {
  // Using Unsplash Source API - provides direct image URLs
  chickenStirFry: 'https://source.unsplash.com/600x400/?chicken,stir-fry',
  pastaCarbonara: 'https://source.unsplash.com/600x400/?pasta,carbonara',
  gardenSalad: 'https://source.unsplash.com/600x400/?salad,fresh',
  vegetableSoup: 'https://source.unsplash.com/600x400/?soup,vegetable',
  grilledCheese: 'https://source.unsplash.com/600x400/?grilled-cheese,sandwich',
  
  // Additional recipe images
  tacos: 'https://source.unsplash.com/600x400/?tacos,mexican-food',
  pizza: 'https://source.unsplash.com/600x400/?pizza,italian',
  burger: 'https://source.unsplash.com/600x400/?burger,hamburger',
  sushi: 'https://source.unsplash.com/600x400/?sushi,japanese',
  pancakes: 'https://source.unsplash.com/600x400/?pancakes,breakfast',
  smoothie: 'https://source.unsplash.com/600x400/?smoothie,healthy',
  omelette: 'https://source.unsplash.com/600x400/?omelette,eggs',
  
  // Category placeholders
  breakfast: 'https://source.unsplash.com/600x400/?breakfast,food',
  lunch: 'https://source.unsplash.com/600x400/?lunch,meal',
  dinner: 'https://source.unsplash.com/600x400/?dinner,food',
  dessert: 'https://source.unsplash.com/600x400/?dessert,cake',
  snack: 'https://source.unsplash.com/600x400/?snack,food',
  
  // Default fallback
  defaultFood: 'https://source.unsplash.com/600x400/?food,cooking'
}

/**
 * Get a recipe image by name or return a default
 */
export function getRecipeImage(recipeName: string): string {
  const lowerName = recipeName.toLowerCase()
  
  // Check for specific matches
  if (lowerName.includes('chicken') && lowerName.includes('stir')) {
    return RECIPE_IMAGES.chickenStirFry
  }
  if (lowerName.includes('pasta') || lowerName.includes('carbonara')) {
    return RECIPE_IMAGES.pastaCarbonara
  }
  if (lowerName.includes('salad')) {
    return RECIPE_IMAGES.gardenSalad
  }
  if (lowerName.includes('soup')) {
    return RECIPE_IMAGES.vegetableSoup
  }
  if (lowerName.includes('grilled cheese') || lowerName.includes('sandwich')) {
    return RECIPE_IMAGES.grilledCheese
  }
  if (lowerName.includes('taco')) {
    return RECIPE_IMAGES.tacos
  }
  if (lowerName.includes('pizza')) {
    return RECIPE_IMAGES.pizza
  }
  if (lowerName.includes('burger')) {
    return RECIPE_IMAGES.burger
  }
  if (lowerName.includes('sushi')) {
    return RECIPE_IMAGES.sushi
  }
  if (lowerName.includes('pancake')) {
    return RECIPE_IMAGES.pancakes
  }
  if (lowerName.includes('smoothie')) {
    return RECIPE_IMAGES.smoothie
  }
  if (lowerName.includes('omelette') || lowerName.includes('omelet')) {
    return RECIPE_IMAGES.omelette
  }
  
  // Category-based fallbacks
  if (lowerName.includes('breakfast')) {
    return RECIPE_IMAGES.breakfast
  }
  if (lowerName.includes('lunch')) {
    return RECIPE_IMAGES.lunch
  }
  if (lowerName.includes('dinner')) {
    return RECIPE_IMAGES.dinner
  }
  if (lowerName.includes('dessert') || lowerName.includes('cake') || lowerName.includes('cookie')) {
    return RECIPE_IMAGES.dessert
  }
  if (lowerName.includes('snack')) {
    return RECIPE_IMAGES.snack
  }
  
  // Default fallback
  return RECIPE_IMAGES.defaultFood
}

/**
 * Get a random food image
 */
export function getRandomRecipeImage(): string {
  const images = Object.values(RECIPE_IMAGES)
  return images[Math.floor(Math.random() * images.length)]
}