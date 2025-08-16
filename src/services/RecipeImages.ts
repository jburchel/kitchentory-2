/**
 * Recipe Image Service
 * Provides high-quality food images from various free sources
 */

export const RECIPE_IMAGES = {
  // Using Pexels (free stock photos) - Direct hotlinking allowed
  chickenStirFry: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=600',
  pastaCarbonara: 'https://images.pexels.com/photos/4518844/pexels-photo-4518844.jpeg?auto=compress&cs=tinysrgb&w=600',
  gardenSalad: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
  vegetableSoup: 'https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=600',
  grilledCheese: 'https://images.pexels.com/photos/1885578/pexels-photo-1885578.jpeg?auto=compress&cs=tinysrgb&w=600',
  
  // Additional recipe images
  tacos: 'https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg?auto=compress&cs=tinysrgb&w=600',
  pizza: 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=600',
  burger: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600',
  sushi: 'https://images.pexels.com/photos/3147493/pexels-photo-3147493.jpeg?auto=compress&cs=tinysrgb&w=600',
  pancakes: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600',
  smoothie: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600',
  omelette: 'https://images.pexels.com/photos/6294361/pexels-photo-6294361.jpeg?auto=compress&cs=tinysrgb&w=600',
  
  // Category placeholders
  breakfast: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600',
  lunch: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=600',
  dinner: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=600',
  dessert: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=600',
  snack: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=600',
  
  // Default fallback
  defaultFood: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600'
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