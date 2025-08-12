import { InventoryItem } from '@/components/inventory/InventoryGrid'
import { ShoppingList, ShoppingListSuggestion } from '@/types/shopping'
import { differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import AnalyticsService, { ConsumptionPattern, WasteAnalysis } from './AnalyticsService'

export interface SmartSuggestion extends ShoppingListSuggestion {
  estimatedQuantity: number
  estimatedUnit: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  inventoryItemId?: string
  lastPurchaseDate?: Date
  averageConsumption?: number
}

class SmartSuggestionsService {
  private static instance: SmartSuggestionsService
  private analyticsService: AnalyticsService

  private constructor() {
    this.analyticsService = AnalyticsService.getInstance()
  }

  static getInstance(): SmartSuggestionsService {
    if (!SmartSuggestionsService.instance) {
      SmartSuggestionsService.instance = new SmartSuggestionsService()
    }
    return SmartSuggestionsService.instance
  }

  /**
   * Generate smart shopping suggestions based on inventory, consumption patterns, and waste analysis
   */
  generateSmartSuggestions(
    inventoryItems: InventoryItem[],
    shoppingLists: ShoppingList[],
    excludeItems: string[] = []
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // Get analytics data
    const analytics = this.analyticsService.generateAnalyticsReport(inventoryItems, shoppingLists)
    
    // 1. Low stock items
    const lowStockSuggestions = this.getLowStockSuggestions(inventoryItems, analytics.consumptionPatterns, excludeItems)
    suggestions.push(...lowStockSuggestions)
    
    // 2. Expired or expiring soon items
    const expiredSuggestions = this.getExpiredSuggestions(inventoryItems, excludeItems)
    suggestions.push(...expiredSuggestions)
    
    // 3. Frequently purchased items
    const frequentSuggestions = this.getFrequentSuggestions(analytics.consumptionPatterns, excludeItems)
    suggestions.push(...frequentSuggestions)
    
    // 4. Items with waste history
    const wasteSuggestions = this.getWasteSuggestions(analytics.wasteAnalysis, excludeItems)
    suggestions.push(...wasteSuggestions)
    
    // 5. Seasonal suggestions (simplified)
    const seasonalSuggestions = this.getSeasonalSuggestions(excludeItems)
    suggestions.push(...seasonalSuggestions)
    
    // Remove duplicates and apply scoring
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions)
    const scoredSuggestions = this.scoreSuggestions(uniqueSuggestions, analytics)
    
    // Sort by priority and return top suggestions
    return scoredSuggestions
      .sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a))
      .slice(0, 10) // Limit to top 10 suggestions
  }

  private getLowStockSuggestions(
    inventoryItems: InventoryItem[],
    consumptionPatterns: ConsumptionPattern[],
    excludeItems: string[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const now = new Date()
    
    inventoryItems.forEach(item => {
      // Skip excluded items
      if (excludeItems.includes(item.name.toLowerCase())) return
      
      // Check for low stock (quantity <= 2)
      if (item.quantity <= 2) {
        // Find consumption pattern for this item
        const pattern = consumptionPatterns.find(p => p.itemName === item.name)
        
        suggestions.push({
          itemName: item.name,
          category: item.category,
          reason: 'low_stock',
          confidence: pattern ? Math.min(0.9, 0.5 + (pattern.frequencyScore * 0.4)) : 0.7,
          estimatedQuantity: pattern 
            ? Math.max(item.quantity, Math.ceil(pattern.averageConsumption * 1.5)) 
            : Math.max(item.quantity, 3),
          estimatedUnit: item.unit,
          priority: item.quantity <= 1 ? 'urgent' : 'high',
          inventoryItemId: item.id,
          lastPurchaseDate: pattern?.lastPurchased,
          averageConsumption: pattern?.averageConsumption
        })
      }
    })
    
    return suggestions
  }

  private getExpiredSuggestions(
    inventoryItems: InventoryItem[],
    excludeItems: string[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const now = new Date()
    const threeDaysFromNow = addDays(now, 3)
    
    inventoryItems.forEach(item => {
      // Skip excluded items
      if (excludeItems.includes(item.name.toLowerCase())) return
      
      // Check for expired items
      if (item.expirationDate && isBefore(item.expirationDate, now)) {
        suggestions.push({
          itemName: item.name,
          category: item.category,
          reason: 'expired',
          confidence: 0.95,
          estimatedQuantity: item.quantity,
          estimatedUnit: item.unit,
          priority: 'urgent',
          inventoryItemId: item.id,
          lastPurchaseDate: item.purchaseDate
        })
      }
      // Check for items expiring soon (within 3 days)
      else if (item.expirationDate && isAfter(item.expirationDate, now) && isBefore(item.expirationDate, threeDaysFromNow)) {
        suggestions.push({
          itemName: item.name,
          category: item.category,
          reason: 'expired_soon',
          confidence: 0.85,
          estimatedQuantity: item.quantity,
          estimatedUnit: item.unit,
          priority: 'high',
          inventoryItemId: item.id,
          lastPurchaseDate: item.purchaseDate
        })
      }
    })
    
    return suggestions
  }

  private getFrequentSuggestions(
    consumptionPatterns: ConsumptionPattern[],
    excludeItems: string[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // Get top 5 most frequently purchased items
    const frequentItems = consumptionPatterns
      .filter(pattern => !excludeItems.includes(pattern.itemName.toLowerCase()))
      .sort((a, b) => b.frequencyScore - a.frequencyScore)
      .slice(0, 5)
    
    frequentItems.forEach(pattern => {
      // Only suggest items that are frequently purchased (frequency score > 0.5)
      if (pattern.frequencyScore > 0.5) {
        suggestions.push({
          itemName: pattern.itemName,
          category: pattern.category,
          reason: 'frequently_used',
          confidence: Math.min(0.9, pattern.frequencyScore + 0.3),
          estimatedQuantity: pattern.averageConsumption 
            ? Math.ceil(pattern.averageConsumption * 2) 
            : 3,
          estimatedUnit: this.getDefaultUnit(pattern.category),
          priority: pattern.frequencyScore > 0.8 ? 'high' : 'medium',
          lastPurchaseDate: pattern.lastPurchased,
          averageConsumption: pattern.averageConsumption
        })
      }
    })
    
    return suggestions
  }

  private getWasteSuggestions(
    wasteAnalysis: WasteAnalysis[],
    excludeItems: string[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // Get items with high waste scores
    const wastefulItems = wasteAnalysis
      .filter(waste => !excludeItems.includes(waste.itemName.toLowerCase()))
      .sort((a, b) => b.wasteScore - a.wasteScore)
      .slice(0, 3)
    
    wastefulItems.forEach(waste => {
      suggestions.push({
        itemName: waste.itemName,
        category: waste.category,
        reason: 'waste_reduction',
        confidence: Math.min(0.8, 0.5 + (waste.wasteScore * 0.3)),
        estimatedQuantity: 1, // Suggest replacing with just one unit to test demand
        estimatedUnit: this.getDefaultUnit(waste.category),
        priority: waste.wasteScore > 0.7 ? 'high' : 'medium',
        lastPurchaseDate: waste.expiredDate
      })
    })
    
    return suggestions
  }

  private getSeasonalSuggestions(excludeItems: string[]): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const currentMonth = new Date().getMonth()
    
    // Simple seasonal suggestions based on month
    const seasonalItems: Record<number, SmartSuggestion[]> = {
      // January - Winter items
      0: [
        {
          itemName: 'Citrus Fruits',
          category: 'produce',
          reason: 'seasonal',
          confidence: 0.7,
          estimatedQuantity: 3,
          estimatedUnit: 'pieces',
          priority: 'medium'
        },
        {
          itemName: 'Root Vegetables',
          category: 'produce',
          reason: 'seasonal',
          confidence: 0.65,
          estimatedQuantity: 2,
          estimatedUnit: 'lbs',
          priority: 'medium'
        }
      ],
      // July - Summer items
      6: [
        {
          itemName: 'Berries',
          category: 'produce',
          reason: 'seasonal',
          confidence: 0.8,
          estimatedQuantity: 1,
          estimatedUnit: 'pint',
          priority: 'medium'
        },
        {
          itemName: 'Grilled Vegetables',
          category: 'produce',
          reason: 'seasonal',
          confidence: 0.7,
          estimatedQuantity: 2,
          estimatedUnit: 'lbs',
          priority: 'medium'
        }
      ]
    }
    
    const monthSuggestions = seasonalItems[currentMonth] || []
    return monthSuggestions.filter(suggestion => 
      !excludeItems.includes(suggestion.itemName.toLowerCase())
    )
  }

  private deduplicateSuggestions(suggestions: SmartSuggestion[]): SmartSuggestion[] {
    const seenItems: Record<string, SmartSuggestion> = {}
    
    suggestions.forEach(suggestion => {
      const key = suggestion.itemName.toLowerCase()
      if (!seenItems[key] || suggestion.confidence > seenItems[key].confidence) {
        seenItems[key] = suggestion
      }
    })
    
    return Object.values(seenItems)
  }

  private scoreSuggestions(
    suggestions: SmartSuggestion[],
    analytics: ReturnType<typeof this.analyticsService.generateAnalyticsReport>
  ): SmartSuggestion[] {
    return suggestions.map(suggestion => {
      // Adjust confidence based on analytics
      let adjustedConfidence = suggestion.confidence
      
      // Boost confidence for items in unhealthy categories
      if (analytics.categoryHealth[suggestion.category] < 0.5) {
        adjustedConfidence = Math.min(1, adjustedConfidence + 0.1)
      }
      
      return {
        ...suggestion,
        confidence: adjustedConfidence
      }
    })
  }

  private getPriorityScore(suggestion: SmartSuggestion): number {
    const priorityScores: Record<string, number> = {
      'urgent': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    }
    
    // Priority score + confidence boost
    return (priorityScores[suggestion.priority] || 1) + (suggestion.confidence * 2)
  }

  private getDefaultUnit(category: string): string {
    const unitMap: Record<string, string> = {
      'produce': 'pieces',
      'dairy': 'gallons',
      'meat': 'lbs',
      'pantry': 'items',
      'frozen': 'packages',
      'beverages': 'bottles',
      'snacks': 'packages',
      'household': 'items'
    }
    
    return unitMap[category] || 'items'
  }
}

export default SmartSuggestionsService