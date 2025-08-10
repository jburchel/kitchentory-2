export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  notes?: string;
  estimatedPrice?: number;
  addedBy: string;
  addedAt: Date;
  completedBy?: string;
  completedAt?: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  householdId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  items: ShoppingItem[];
  isTemplate: boolean;
  isShared: boolean;
  sharedWith: string[];
  totalEstimatedCost: number;
  completedItemsCount: number;
  status: 'active' | 'completed' | 'archived';
  storeLayout?: StoreSection[];
}

export interface StoreSection {
  id: string;
  name: string;
  order: number;
  categories: string[];
}

export interface ShoppingListSuggestion {
  itemName: string;
  category: string;
  reason: 'low_stock' | 'expired_soon' | 'frequently_used' | 'seasonal';
  confidence: number;
  lastPurchased?: Date;
  averageConsumption?: number;
}

export interface ShoppingListTemplate {
  id: string;
  name: string;
  description?: string;
  items: Omit<ShoppingItem, 'id' | 'completed' | 'addedBy' | 'addedAt' | 'completedBy' | 'completedAt'>[];
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
}