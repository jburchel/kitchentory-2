import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserButton } from '@/components/auth/UserButton'
import { ProduceIcon, BeveragesIcon, ProteinIcon } from '@/components/icons/svg'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Brand-compliant header */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Kitchentory</h1>
                <p className="text-sm text-muted-foreground">Manage your kitchen inventory</p>
              </div>
              <div className="flex items-center space-x-4">
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Welcome Card - Brand compliant using CSS variables */}
            <Card className="p-6 border-2" style={{
              background: 'hsl(var(--color-success-bg))',
              borderColor: 'hsl(var(--color-success-border))'
            }}>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'hsl(var(--color-success))' }}>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                  style={{
                    backgroundColor: 'hsl(var(--color-category-produce) / 0.1)',
                    borderColor: 'hsl(var(--color-category-produce) / 0.3)',
                    color: 'hsl(var(--color-category-produce))'
                  }}
                >
                  <ProduceIcon className="w-5 h-5 mr-3" />
                  Add New Item
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                  style={{
                    backgroundColor: 'hsl(var(--color-category-beverages) / 0.1)',
                    borderColor: 'hsl(var(--color-category-beverages) / 0.3)',
                    color: 'hsl(var(--color-category-beverages))'
                  }}
                >
                  <BeveragesIcon className="w-5 h-5 mr-3" />
                  Create Shopping List
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                  style={{
                    backgroundColor: 'hsl(var(--color-category-protein) / 0.1)',
                    borderColor: 'hsl(var(--color-category-protein) / 0.3)',
                    color: 'hsl(var(--color-category-protein))'
                  }}
                >
                  <ProteinIcon className="w-5 h-5 mr-3" />
                  Manage Categories
                </Button>
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
                    className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `hsl(var(${category.bgVar}) / 0.15)`
                    }}
                  >
                    <category.icon 
                      className="w-6 h-6" 
                      style={{ color: `hsl(var(${category.colorVar}))` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground">{category.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}