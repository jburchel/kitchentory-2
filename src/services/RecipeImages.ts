/**
 * Recipe Image Service
 * Provides high-quality food images from various free sources
 */

export const RECIPE_IMAGES = {
  // Using reliable placeholder images that work everywhere
  chickenStirFry: 'https://via.placeholder.com/600x400/FF6B35/FFFFFF?text=Chicken+Stir+Fry',
  pastaCarbonara: 'https://via.placeholder.com/600x400/42A5F5/FFFFFF?text=Pasta+Carbonara',
  gardenSalad: 'https://via.placeholder.com/600x400/66BB6A/FFFFFF?text=Garden+Salad',
  vegetableSoup: 'https://via.placeholder.com/600x400/FFA726/FFFFFF?text=Vegetable+Soup',
  grilledCheese: 'https://via.placeholder.com/600x400/FFB74D/FFFFFF?text=Grilled+Cheese',
  
  // Additional recipe images
  tacos: 'https://via.placeholder.com/600x400/EF5350/FFFFFF?text=Tacos',
  pizza: 'https://via.placeholder.com/600x400/AB47BC/FFFFFF?text=Pizza',
  burger: 'https://via.placeholder.com/600x400/8D6E63/FFFFFF?text=Burger',
  sushi: 'https://via.placeholder.com/600x400/26A69A/FFFFFF?text=Sushi',
  pancakes: 'https://via.placeholder.com/600x400/FFCC02/FFFFFF?text=Pancakes',
  smoothie: 'https://via.placeholder.com/600x400/9C27B0/FFFFFF?text=Smoothie',
  omelette: 'https://via.placeholder.com/600x400/FF9800/FFFFFF?text=Omelette',
  
  // Category placeholders
  breakfast: 'https://via.placeholder.com/600x400/FFC107/FFFFFF?text=Breakfast',
  lunch: 'https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=Lunch',
  dinner: 'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Dinner',
  dessert: 'https://via.placeholder.com/600x400/E91E63/FFFFFF?text=Dessert',
  snack: 'https://via.placeholder.com/600x400/607D8B/FFFFFF?text=Snack',
  
  // Default fallback
  defaultFood: 'https://via.placeholder.com/600x400/795548/FFFFFF?text=Recipe'
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