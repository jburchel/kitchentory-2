import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { 
  ProduceIcon, 
  BeveragesIcon, 
  ProteinIcon,
  HouseholdIcon
} from '@/components/icons/svg'
import { 
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Welcome Card - Brand compliant with utility classes */}
            <Card className="p-6 border-2 bg-success border-success">
              <h2 className="text-xl font-semibold mb-3 text-success">
                Welcome!
              </h2>
              <p className="text-foreground">
                Your kitchen inventory management dashboard is ready to use.
                Start by creating your first household or joining an existing one.
              </p>
            </Card>
            
            {/* Quick Actions - Using food category brand colors with icons */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/inventory" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px] text-category-produce border-green-200 bg-green-50 hover:bg-green-100"
                  >
                    <ProduceIcon className="w-5 h-5 mr-3 text-category-produce" />
                    View Inventory
                  </Button>
                </Link>
                
                <Link href="/shopping-lists" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px] text-category-beverages border-cyan-200 bg-cyan-50 hover:bg-cyan-100"
                  >
                    <BeveragesIcon className="w-5 h-5 mr-3 text-category-beverages" />
                    Shopping Lists
                  </Button>
                </Link>
                
                <Link href="/alerts" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px] text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                  >
                    <AlertTriangle className="w-5 h-5 mr-3 text-red-600" />
                    Expiration Alerts
                  </Button>
                </Link>
                
                <Link href="/analytics" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px] text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                  >
                    <BarChart3 className="w-5 h-5 mr-3 text-blue-600" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3 mx-auto">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">No recent activity to show</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start by adding items to your inventory</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Category showcase with brand colors */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">Organize Your Kitchen by Category</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
              {[
                { 
                  icon: ProduceIcon, 
                  name: 'Produce', 
                  bgVar: '--color-category-produce',
                  colorVar: '--color-category-produce'
                },
                { 
                  icon: ProteinIcon, 
                  name: 'Protein', 
                  bgVar: '--color-category-protein',
                  colorVar: '--color-category-protein'
                },
                { 
                  icon: BeveragesIcon, 
                  name: 'Beverages', 
                  bgVar: '--color-category-beverages',
                  colorVar: '--color-category-beverages'
                }
              ].map((category, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div 
                    className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      category.name === 'Produce' ? 'bg-green-100' :
                      category.name === 'Protein' ? 'bg-purple-100' :
                      'bg-cyan-100'
                    }`}
                  >
                    <category.icon 
                      className={`w-6 h-6 ${
                        category.name === 'Produce' ? 'text-category-produce' :
                        category.name === 'Protein' ? 'text-category-protein' :
                        'text-category-beverages'
                      }`}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground">{category.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}