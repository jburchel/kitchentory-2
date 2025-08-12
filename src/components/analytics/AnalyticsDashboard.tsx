'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  Package,
  DollarSign,
  RotateCcw,
  Leaf,
  AlertTriangle
} from 'lucide-react'
import { AnalyticsData } from '@/services/AnalyticsService'
import { format } from 'date-fns'

export interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData
  loading: boolean
  error: string | null
  onRefresh: () => void
  className?: string
}

export function AnalyticsDashboard({
  analyticsData,
  loading,
  error,
  onRefresh,
  className
}: AnalyticsDashboardProps) {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Analytics</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">Add items to your inventory to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  const { consumptionPatterns, wasteAnalysis, costAnalysis, inventoryTurnover, categoryHealth } = analyticsData

  // Get top consumption patterns
  const topConsumption = consumptionPatterns.slice(0, 5)
  
  // Get top waste items
  const topWaste = wasteAnalysis.slice(0, 5)
  
  // Get category health sorted by health score
  const sortedCategoryHealth = Object.entries(categoryHealth)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Turnover</p>
                <p className="text-2xl font-bold">{inventoryTurnover.toFixed(2)}</p>
              </div>
              <RotateCcw className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Times inventory is replaced per period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Spending</p>
                <p className="text-2xl font-bold">${costAnalysis.averageWeeklySpending.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average weekly spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Consumed</p>
                <p className="text-2xl font-bold">
                  {topConsumption.length > 0 ? topConsumption[0].itemName : 'None'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                {topConsumption.length > 0 
                  ? `${topConsumption[0].averageConsumption.toFixed(1)}/week avg` 
                  : 'No consumption data'}
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waste Items</p>
                <p className="text-2xl font-bold">{wasteAnalysis.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Items that have expired
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Consumed Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConsumption.length > 0 ? (
                topConsumption.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pattern.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {pattern.category} • {pattern.averageConsumption.toFixed(1)}/week
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {(pattern.frequencyScore * 100).toFixed(0)}% frequency
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No consumption patterns detected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waste Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Waste Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topWaste.length > 0 ? (
                topWaste.map((waste, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{waste.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {waste.category} • Expired {waste.daysExpired} days ago
                      </p>
                    </div>
                    <Badge variant={waste.wasteScore > 0.7 ? "destructive" : "secondary"}>
                      {(waste.wasteScore * 100).toFixed(0)}% impact
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No waste detected - great job!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Category Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCategoryHealth.length > 0 ? (
                sortedCategoryHealth.map(([category, health], index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm">{(health * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={health * 100} 
                      className={health > 0.8 ? "bg-green-200" : health > 0.6 ? "bg-yellow-200" : "bg-red-200"} 
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No category data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(costAnalysis.categoryBreakdown).length > 0 ? (
                Object.entries(costAnalysis.categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No spending data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}