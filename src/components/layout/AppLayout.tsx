'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@/components/auth/UserButton'
import { ProduceIcon, BeveragesIcon, HouseholdIcon } from '@/components/icons/svg'
import { HeaderInstallButton } from '@/components/ui/InstallPrompt'
import { ConnectionStatus, MobileConnectionStatus } from '@/components/ui/ConnectionStatus'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: HouseholdIcon,
      active: pathname === '/dashboard'
    },
    {
      href: '/inventory',
      label: 'Inventory',
      icon: ProduceIcon,
      active: pathname.startsWith('/inventory')
    },
    {
      href: '/shopping-lists',
      label: 'Shopping Lists',
      icon: BeveragesIcon,
      active: pathname.startsWith('/shopping-lists')
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Connection Status */}
      <MobileConnectionStatus />
      
      {/* Header Navigation */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-primary">Kitchentory</h1>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <ConnectionStatus showLabel={false} size="sm" className="hidden md:flex" />
              <HeaderInstallButton />
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 min-w-[64px]",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}