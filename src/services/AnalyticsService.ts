import { InventoryItem } from '@/components/inventory/InventoryGrid'
import { ShoppingList, ShoppingItem } from '@/types/shopping'
import { differenceInDays, isAfter, isBefore, addDays, subDays } from 'date-fns'

export interface ConsumptionPattern {
  itemName: string
  category: string
  averageConsumption: number // items per week
  lastPurchased?: Date
  frequencyScore: number // 0-1 score based on purchase frequency
}

export interface WasteAnalysis {
  itemName: string
  category: string
  expiredDate?: Date
  daysExpired: number
  cost?: number
  wasteScore: number // 0-1 score based on waste impact
}

export interface CostAnalysis {
  totalSpent: number
  averageWeeklySpending: number
  categoryBreakdown: Record<string, number>
  trend: 'increasing' | 'decreasing' | 'stable'
  savingsOpportunity?: number
}

export interface AnalyticsData {
  consumptionPatterns: ConsumptionPattern[]
  wasteAnalysis: WasteAnalysis[]
  costAnalysis: CostAnalysis
  inventoryTurnover: number
  categoryHealth: Record<string, number> // 0-1 score for each category
}

class AnalyticsService {
  private static instance: AnalyticsService

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Analyze consumption patterns based on inventory and shopping history
   */
  analyzeConsumptionPatterns(
    inventoryItems: InventoryItem[],
    shoppingLists: ShoppingList[]
  ): ConsumptionPattern[] {
    const patterns: Record<string, { totalConsumed: number; purchaseDates: Date[]; category: string }> = {}

    // Analyze shopping history for purchase frequency
    shoppingLists.forEach(list => {
      list.items.forEach(item => {
        if (!patterns[item.name]) {
          patterns[item.name] = {
            totalConsumed: 0,
            purchaseDates: [],
            category: item.category
          }
        }
        
        patterns[item.name].totalConsumed += item.quantity
        patterns[item.name].purchaseDates.push(item.addedAt)
      })
    })

    // Calculate average consumption and frequency scores
    const consumptionPatterns: ConsumptionPattern[] = Object.entries(patterns).map(
      ([itemName, data]) => {
        // Calculate average consumption per week
        let averageConsumption = 0
        let frequencyScore = 0
        
        if (data.purchaseDates.length > 1) {
          // Sort dates chronologically
          const sortedDates = [...data.purchaseDates].sort((a, b) => a.getTime() - b.getTime())
          
          // Calculate total time span
          const firstPurchase = sortedDates[0]
          const lastPurchase = sortedDates[sortedDates.length - 1]
          const daysSpan = differenceInDays(lastPurchase, firstPurchase)
          
          if (daysSpan > 0) {
            // Average consumption per week
            averageConsumption = (data.totalConsumed / daysSpan) * 7
            
            // Frequency score based on purchase intervals
            const intervals = sortedDates
              .slice(1)
              .map((date, i) => differenceInDays(date, sortedDates[i]))
            
            const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
            frequencyScore = Math.max(0, Math.min(1, 1 - (avgInterval / 30))) // Normalize to 0-1
          }
        }

        return {
          itemName,
          category: data.category,
          averageConsumption,
          lastPurchased: data.purchaseDates.length > 0 
            ? data.purchaseDates[data.purchaseDates.length - 1] 
            : undefined,
          frequencyScore
        }
      }
    )

    return consumptionPatterns.sort((a, b) => b.frequencyScore - a.frequencyScore)
  }

  /**
   * Analyze waste based on expired items
   */
  analyzeWaste(inventoryItems: InventoryItem[]): WasteAnalysis[] {
    const now = new Date()
    const wasteAnalysis: WasteAnalysis[] = []

    inventoryItems.forEach(item => {
      if (item.expirationDate && isBefore(item.expirationDate, now)) {
        const daysExpired = differenceInDays(now, item.expirationDate)
        const wasteScore = Math.min(1, daysExpired / 30) // Normalize to 0-1 (30 days = max score)
        
        wasteAnalysis.push({
          itemName: item.name,
          category: item.category,
          expiredDate: item.expirationDate,
          daysExpired,
          cost: item.cost,
          wasteScore
        })
      }
    })

    return wasteAnalysis.sort((a, b) => b.wasteScore - a.wasteScore)
  }

  /**
   * Analyze spending patterns and cost trends
   */
  analyzeCosts(
    inventoryItems: InventoryItem[],
    shoppingLists: ShoppingList[],
    periodDays: number = 30
  ): CostAnalysis {
    const now = new Date()
    const cutoffDate = subDays(now, periodDays)
    
    let totalSpent = 0
    const categoryBreakdown: Record<string, number> = {}
    
    // Analyze inventory items purchased in the period
    inventoryItems.forEach(item => {
      if (item.purchaseDate && isAfter(item.purchaseDate, cutoffDate) && item.cost) {
        totalSpent += item.cost
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.cost
      }
    })
    
    // Analyze shopping list items
    shoppingLists.forEach(list => {
      list.items.forEach(item => {
        if (isAfter(item.addedAt, cutoffDate) && item.estimatedPrice) {
          totalSpent += item.estimatedPrice
          categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.estimatedPrice
        }
      })
    })
    
    // Calculate average weekly spending
    const averageWeeklySpending = (totalSpent / periodDays) * 7
    
    // Determine trend (simplified for now)
    const trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    
    return {
      totalSpent,
      averageWeeklySpending,
      categoryBreakdown,
      trend
    }
  }

  /**
   * Calculate inventory turnover rate
   */
  calculateInventoryTurnover(
    inventoryItems: InventoryItem[],
    shoppingLists: ShoppingList[],
    periodDays: number = 30
  ): number {
    const now = new Date()
    const cutoffDate = subDays(now, periodDays)
    
    // Count items added in the period
    let itemsAdded = 0
    let itemsRemoved = 0
    
    // Check inventory items
    inventoryItems.forEach(item => {
      if (item.purchaseDate && isAfter(item.purchaseDate, cutoffDate)) {
        itemsAdded += item.quantity
      }
      // This is a simplified approach - in a real system we'd track actual removals
    })
    
    // Check shopping list items (purchased items)
    shoppingLists.forEach(list => {
      list.items.forEach(item => {
        if (isAfter(item.addedAt, cutoffDate) && item.completed) {
          itemsRemoved += item.quantity
        }
      })
    })
    
    // Calculate turnover rate
    const averageInventory = (itemsAdded + (itemsAdded - itemsRemoved)) / 2
    return averageInventory > 0 ? itemsRemoved / averageInventory : 0
  }

  /**
   * Calculate category health scores
   */
  calculateCategoryHealth(inventoryItems: InventoryItem[]): Record<string, number> {
    const categoryStats: Record<string, { totalItems: number; expiredItems: number; lowStockItems: number }> = {}
    
    // Initialize stats for all categories
    Object.keys(inventoryItems.reduce((acc, item) => {
      acc[item.category] = true
      return acc
    }, {} as Record<string, boolean>)).forEach(category => {
      categoryStats[category] = { totalItems: 0, expiredItems: 0, lowStockItems: 0 }
    })
    
    // Calculate stats for each category
    inventoryItems.forEach(item => {
      const stats = categoryStats[item.category]
      if (stats) {
        stats.totalItems += 1
        
        // Check if expired
        if (item.expirationDate && isBefore(item.expirationDate, new Date())) {
          stats.expiredItems += 1
        }
        
        // Check if low stock
        if (item.quantity <= 2) {
          stats.lowStockItems += 1
        }
      }
    })
    
    // Calculate health scores (0-1, where 1 is perfect health)
    const healthScores: Record<string, number> = {}
    Object.entries(categoryStats).forEach(([category, stats]) => {
      // Health score considers:
      // - Percentage of non-expired items (50% weight)
      // - Percentage of adequately stocked items (50% weight)
      const expirationHealth = stats.totalItems > 0 
        ? 1 - (stats.expiredItems / stats.totalItems) 
        : 1
        
      const stockHealth = stats.totalItems > 0 
        ? 1 - (stats.lowStockItems / stats.totalItems) 
        : 1
        
      healthScores[category] = (expirationHealth * 0.5) + (stockHealth * 0.5)
    })
    
    return healthScores
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(
    inventoryItems: InventoryItem[],
    shoppingLists: ShoppingList[]
  ): AnalyticsData {
    const consumptionPatterns = this.analyzeConsumptionPatterns(inventoryItems, shoppingLists)
    const wasteAnalysis = this.analyzeWaste(inventoryItems)
    const costAnalysis = this.analyzeCosts(inventoryItems, shoppingLists)
    const inventoryTurnover = this.calculateInventoryTurnover(inventoryItems, shoppingLists)
    const categoryHealth = this.calculateCategoryHealth(inventoryItems)
    
    return {
      consumptionPatterns,
      wasteAnalysis,
      costAnalysis,
      inventoryTurnover,
      categoryHealth
    }
  }
}

export default AnalyticsService