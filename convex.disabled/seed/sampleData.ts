import { Doc } from '../_generated/dataModel'

// Sample household data
export const sampleHouseholds = [
  {
    name: "The Johnson Family",
    description: "A family of four managing their kitchen inventory",
    currency: "USD",
    timezone: "America/New_York",
    settings: {
      defaultShelfLifeDays: 7,
      lowStockThreshold: 2,
      enableNotifications: true,
      showNutritionalInfo: true,
    },
  },
  {
    name: "Sarah's Apartment",
    description: "Single person household with minimal cooking",
    currency: "USD",
    timezone: "America/Los_Angeles",
    settings: {
      defaultShelfLifeDays: 14,
      lowStockThreshold: 1,
      enableNotifications: false,
      showNutritionalInfo: false,
    },
  },
]

// Sample categories with hierarchical structure
export const sampleCategories = [
  // Root categories
  {
    name: "Produce",
    description: "Fresh fruits and vegetables",
    color: "#4CAF50",
    icon: "🥬",
    sortOrder: 1,
  },
  {
    name: "Dairy & Eggs",
    description: "Milk, cheese, yogurt, and eggs",
    color: "#FFC107",
    icon: "🥛",
    sortOrder: 2,
  },
  {
    name: "Meat & Seafood",
    description: "Fresh and frozen meat and seafood",
    color: "#F44336",
    icon: "🥩",
    sortOrder: 3,
  },
  {
    name: "Pantry Staples",
    description: "Dry goods, canned items, and condiments",
    color: "#795548",
    icon: "🏺",
    sortOrder: 4,
  },
  {
    name: "Beverages",
    description: "Drinks and liquid refreshments",
    color: "#2196F3",
    icon: "🥤",
    sortOrder: 5,
  },
  {
    name: "Frozen Foods",
    description: "Frozen meals, vegetables, and treats",
    color: "#00BCD4",
    icon: "🧊",
    sortOrder: 6,
  },
  {
    name: "Snacks & Treats",
    description: "Chips, cookies, candy, and treats",
    color: "#FF9800",
    icon: "🍪",
    sortOrder: 7,
  },
  {
    name: "Health & Personal Care",
    description: "Vitamins, supplements, and personal care items",
    color: "#9C27B0",
    icon: "💊",
    sortOrder: 8,
  },
]

// Subcategories for Produce
export const produceSubcategories = [
  {
    name: "Fresh Fruits",
    description: "Apples, oranges, bananas, etc.",
    color: "#FFE082",
    icon: "🍎",
    parentCategory: "Produce",
    sortOrder: 1,
  },
  {
    name: "Fresh Vegetables",
    description: "Lettuce, carrots, broccoli, etc.",
    color: "#A5D6A7",
    icon: "🥕",
    parentCategory: "Produce",
    sortOrder: 2,
  },
  {
    name: "Herbs & Spices",
    description: "Fresh and dried herbs and spices",
    color: "#C8E6C9",
    icon: "🌿",
    parentCategory: "Produce",
    sortOrder: 3,
  },
]

// Sample products with detailed information
export const sampleProducts = [
  // Produce
  {
    name: "Organic Bananas",
    brand: "Dole",
    description: "Fresh organic bananas, perfect for smoothies and snacks",
    category: "Fresh Fruits",
    barcode: "4011",
    defaultUnit: "bunch",
    defaultShelfLifeDays: 5,
    nutritionalInfo: {
      servingSize: "1 medium (118g)",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4,
      sodium: 1,
    },
    tags: ["organic", "potassium", "vitamin-c"],
  },
  {
    name: "Romaine Lettuce",
    brand: "Fresh Express",
    description: "Crisp romaine lettuce heads for salads",
    category: "Fresh Vegetables",
    barcode: "3383",
    defaultUnit: "head",
    defaultShelfLifeDays: 10,
    nutritionalInfo: {
      servingSize: "1 cup shredded (47g)",
      calories: 8,
      protein: 0.6,
      carbs: 1.6,
      fat: 0.1,
      fiber: 1,
      sugar: 0.8,
      sodium: 4,
    },
    tags: ["leafy-green", "vitamin-a", "folate"],
  },
  {
    name: "Fresh Basil",
    brand: "Local Farm",
    description: "Fresh basil leaves for cooking and garnishing",
    category: "Herbs & Spices",
    defaultUnit: "bunch",
    defaultShelfLifeDays: 7,
    tags: ["herb", "aromatic", "italian"],
  },

  // Dairy & Eggs
  {
    name: "Whole Milk",
    brand: "Organic Valley",
    description: "Organic whole milk from grass-fed cows",
    category: "Dairy & Eggs",
    barcode: "023244100011",
    defaultUnit: "gallon",
    defaultShelfLifeDays: 7,
    nutritionalInfo: {
      servingSize: "1 cup (244g)",
      calories: 150,
      protein: 8,
      carbs: 12,
      fat: 8,
      fiber: 0,
      sugar: 12,
      sodium: 105,
    },
    tags: ["organic", "calcium", "vitamin-d"],
  },
  {
    name: "Grade A Large Eggs",
    brand: "Eggland's Best",
    description: "Fresh large eggs with enhanced nutrition",
    category: "Dairy & Eggs",
    barcode: "071890000120",
    defaultUnit: "dozen",
    defaultShelfLifeDays: 21,
    nutritionalInfo: {
      servingSize: "1 large egg (50g)",
      calories: 70,
      protein: 6,
      carbs: 0,
      fat: 5,
      fiber: 0,
      sugar: 0,
      sodium: 65,
    },
    tags: ["protein", "vitamin-d", "choline"],
  },
  {
    name: "Sharp Cheddar Cheese",
    brand: "Cabot",
    description: "Aged sharp cheddar cheese block",
    category: "Dairy & Eggs",
    barcode: "087157009003",
    defaultUnit: "block",
    defaultShelfLifeDays: 30,
    nutritionalInfo: {
      servingSize: "1 oz (28g)",
      calories: 110,
      protein: 7,
      carbs: 1,
      fat: 9,
      fiber: 0,
      sugar: 0,
      sodium: 180,
    },
    tags: ["aged", "calcium", "sharp"],
  },

  // Meat & Seafood
  {
    name: "Ground Beef 80/20",
    brand: "Certified Angus",
    description: "Fresh ground beef, 80% lean, 20% fat",
    category: "Meat & Seafood",
    barcode: "210000000001",
    defaultUnit: "lb",
    defaultShelfLifeDays: 3,
    nutritionalInfo: {
      servingSize: "4 oz (113g)",
      calories: 287,
      protein: 19,
      carbs: 0,
      fat: 23,
      fiber: 0,
      sugar: 0,
      sodium: 75,
    },
    tags: ["beef", "protein", "iron"],
  },
  {
    name: "Atlantic Salmon Fillet",
    brand: "Wild Planet",
    description: "Fresh Atlantic salmon fillet, skin-on",
    category: "Meat & Seafood",
    barcode: "829696010001",
    defaultUnit: "lb",
    defaultShelfLifeDays: 2,
    nutritionalInfo: {
      servingSize: "3.5 oz (100g)",
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      fiber: 0,
      sugar: 0,
      sodium: 59,
    },
    tags: ["salmon", "omega-3", "protein"],
  },

  // Pantry Staples
  {
    name: "Extra Virgin Olive Oil",
    brand: "California Olive Ranch",
    description: "Cold-pressed extra virgin olive oil",
    category: "Pantry Staples",
    barcode: "656475002018",
    defaultUnit: "bottle",
    defaultShelfLifeDays: 720, // 2 years
    nutritionalInfo: {
      servingSize: "1 tbsp (14g)",
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: ["olive-oil", "healthy-fats", "cooking"],
  },
  {
    name: "Jasmine Rice",
    brand: "Lundberg",
    description: "Organic jasmine white rice",
    category: "Pantry Staples",
    barcode: "073416003026",
    defaultUnit: "bag",
    defaultShelfLifeDays: 1095, // 3 years
    nutritionalInfo: {
      servingSize: "1/4 cup dry (45g)",
      calories: 160,
      protein: 3,
      carbs: 36,
      fat: 0.5,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: ["rice", "grain", "organic"],
  },

  // Beverages
  {
    name: "Sparkling Water",
    brand: "LaCroix",
    description: "Pure sparkling water with natural essence",
    category: "Beverages",
    barcode: "012000638503",
    defaultUnit: "12-pack",
    defaultShelfLifeDays: 365,
    nutritionalInfo: {
      servingSize: "12 fl oz (355ml)",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: ["sparkling", "zero-calorie", "hydration"],
  },

  // Frozen Foods
  {
    name: "Frozen Blueberries",
    brand: "Wyman's",
    description: "Wild frozen blueberries, no sugar added",
    category: "Frozen Foods",
    barcode: "071249004208",
    defaultUnit: "bag",
    defaultShelfLifeDays: 365,
    nutritionalInfo: {
      servingSize: "1 cup (148g)",
      calories: 80,
      protein: 1,
      carbs: 19,
      fat: 0.5,
      fiber: 4,
      sugar: 15,
      sodium: 1,
    },
    tags: ["blueberries", "antioxidants", "frozen"],
  },

  // Snacks & Treats
  {
    name: "Mixed Nuts",
    brand: "Blue Diamond",
    description: "Roasted mixed nuts with sea salt",
    category: "Snacks & Treats",
    barcode: "041570051535",
    defaultUnit: "can",
    defaultShelfLifeDays: 365,
    nutritionalInfo: {
      servingSize: "1 oz (28g)",
      calories: 170,
      protein: 6,
      carbs: 5,
      fat: 15,
      fiber: 3,
      sugar: 1,
      sodium: 95,
    },
    tags: ["nuts", "protein", "healthy-fats"],
  },
]

// Sample storage locations
export const sampleLocations = [
  "Refrigerator - Main",
  "Refrigerator - Crisper",
  "Refrigerator - Door",
  "Freezer - Main",
  "Freezer - Door",
  "Pantry - Upper Shelf",
  "Pantry - Lower Shelf",
  "Counter",
  "Spice Rack",
  "Wine Fridge",
  "Basement Storage",
  "Garage Freezer",
]

// Sample inventory items
export const sampleInventoryItems = [
  {
    product: "Organic Bananas",
    quantity: 1,
    unit: "bunch",
    location: "Counter",
    purchaseDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    expirationDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    purchasePrice: 2.49,
    notes: "Getting brown spots, use soon",
  },
  {
    product: "Whole Milk",
    quantity: 0.75,
    unit: "gallon",
    location: "Refrigerator - Main",
    purchaseDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    expirationDate: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days from now
    purchasePrice: 4.99,
    notes: "About 3/4 full",
  },
  {
    product: "Grade A Large Eggs",
    quantity: 8,
    unit: "pieces",
    location: "Refrigerator - Door",
    purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    expirationDate: Date.now() + 16 * 24 * 60 * 60 * 1000, // 16 days from now
    purchasePrice: 3.29,
    notes: "8 eggs remaining from dozen",
  },
  {
    product: "Ground Beef 80/20",
    quantity: 2,
    unit: "lb",
    location: "Refrigerator - Main",
    purchaseDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    expirationDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now (expires soon!)
    purchasePrice: 7.98,
    notes: "Use by tomorrow for best quality",
  },
  {
    product: "Frozen Blueberries",
    quantity: 1,
    unit: "bag",
    location: "Freezer - Main",
    purchaseDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
    expirationDate: Date.now() + 358 * 24 * 60 * 60 * 1000, // ~1 year from now
    purchasePrice: 4.49,
    notes: "Unopened bag",
  },
  {
    product: "Extra Virgin Olive Oil",
    quantity: 1,
    unit: "bottle",
    location: "Pantry - Upper Shelf",
    purchaseDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 1 month ago
    expirationDate: Date.now() + 690 * 24 * 60 * 60 * 1000, // ~2 years from now
    purchasePrice: 8.99,
    notes: "About 80% full",
  },
  {
    product: "Romaine Lettuce",
    quantity: 2,
    unit: "head",
    location: "Refrigerator - Crisper",
    purchaseDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    expirationDate: Date.now() + 9 * 24 * 60 * 60 * 1000, // 9 days from now
    purchasePrice: 3.98,
    notes: "Two fresh heads",
  },
  {
    product: "Sharp Cheddar Cheese",
    quantity: 0.5,
    unit: "block",
    location: "Refrigerator - Main",
    purchaseDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    expirationDate: Date.now() + 20 * 24 * 60 * 60 * 1000, // 20 days from now
    purchasePrice: 5.99,
    notes: "Half block remaining",
  },
  {
    product: "Mixed Nuts",
    quantity: 1,
    unit: "can",
    location: "Pantry - Lower Shelf",
    purchaseDate: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
    expirationDate: Date.now() + 351 * 24 * 60 * 60 * 1000, // ~1 year from now
    purchasePrice: 6.49,
    notes: "Unopened can",
  },
  {
    product: "Jasmine Rice",
    quantity: 0.75,
    unit: "bag",
    location: "Pantry - Lower Shelf",
    purchaseDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 2 months ago
    expirationDate: Date.now() + 1035 * 24 * 60 * 60 * 1000, // ~3 years from now
    purchasePrice: 12.99,
    notes: "About 3/4 of 5lb bag remaining",
  },
]

// Sample shopping lists
export const sampleShoppingLists = [
  {
    name: "Weekly Grocery Run",
    description: "Regular weekly groceries for the family",
    items: [
      {
        product: "Whole Milk",
        quantity: 1,
        unit: "gallon",
        estimatedPrice: 4.99,
        priority: "high",
        notes: "Running low",
      },
      {
        product: "Organic Bananas",
        quantity: 2,
        unit: "bunch",
        estimatedPrice: 4.98,
        priority: "medium",
      },
      {
        customName: "Bread",
        quantity: 1,
        unit: "loaf",
        estimatedPrice: 2.99,
        priority: "medium",
        notes: "Whole wheat preferred",
      },
      {
        product: "Ground Beef 80/20",
        quantity: 2,
        unit: "lb",
        estimatedPrice: 15.96,
        priority: "high",
        notes: "For tacos tonight",
      },
    ],
  },
  {
    name: "Low Stock Items",
    description: "Auto-generated from low stock alert",
    items: [
      {
        product: "Grade A Large Eggs",
        quantity: 1,
        unit: "dozen",
        estimatedPrice: 3.29,
        priority: "high",
      },
      {
        product: "Fresh Basil",
        quantity: 1,
        unit: "bunch",
        estimatedPrice: 2.49,
        priority: "low",
      },
    ],
  },
]

// Sample notification templates
export const sampleNotifications = [
  {
    type: "expiration_warning" as const,
    title: "Items Expiring Soon",
    message: "You have 2 items expiring within the next 3 days",
    metadata: {
      itemCount: 2,
      daysAhead: 3,
    },
  },
  {
    type: "low_stock" as const,
    title: "Low Stock Alert",
    message: "You're running low on milk and eggs",
    metadata: {
      products: ["Whole Milk", "Grade A Large Eggs"],
    },
  },
  {
    type: "shopping_list_shared" as const,
    title: "Shopping List Shared",
    message: "Sarah shared 'Weekly Grocery Run' with you",
    metadata: {
      sharedBy: "Sarah",
      listName: "Weekly Grocery Run",
    },
  },
]

// Export all data for easy import
export const seedData = {
  households: sampleHouseholds,
  categories: sampleCategories,
  subcategories: produceSubcategories,
  products: sampleProducts,
  locations: sampleLocations,
  inventoryItems: sampleInventoryItems,
  shoppingLists: sampleShoppingLists,
  notifications: sampleNotifications,
}