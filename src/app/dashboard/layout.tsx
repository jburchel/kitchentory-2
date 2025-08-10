import { SignedIn, UserButton } from '@clerk/nextjs'
import { Package, ShoppingCart, ChefHat, Settings, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Inventory', href: '/dashboard', icon: Package },
  { name: 'Shopping Lists', href: '/dashboard/shopping', icon: ShoppingCart },
  { name: 'Recipes', href: '/dashboard/recipes', icon: ChefHat },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SignedIn>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex h-16 items-center px-4 gap-4">
            <Link href="/dashboard" className="font-bold text-xl">
              Kitchentory
            </Link>
            <nav className="flex gap-6 ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="ml-auto">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SignedIn>
  )
}