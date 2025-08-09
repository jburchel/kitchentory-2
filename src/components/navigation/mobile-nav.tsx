"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Package, Plus, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"

interface MobileNavProps {
  className?: string
}

const navigation = [
  { name: "Home", href: "/", icon: Home, badge: null },
  { name: "Inventory", href: "/inventory", icon: Package, badge: "12" },
  { name: "Add Item", href: "/add", icon: Plus, badge: null },
  { name: "Search", href: "/search", icon: Search, badge: null },
  { name: "Profile", href: "/profile", icon: User, badge: null },
]

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden",
        className
      )}>
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold">Kitchentory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold">Kitchentory</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="ml-auto px-0 text-base hover:bg-transparent"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>
        <nav className="space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}