"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Package, Plus, User, Settings, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
  isActive?: boolean
  children?: NavItem[]
}

interface ResponsiveNavigationProps {
  items: NavItem[]
  user?: {
    name: string
    email: string
    avatar?: string
  }
  logo?: React.ReactNode
  className?: string
}

export function ResponsiveNavigation({ 
  items, 
  user, 
  logo, 
  className 
}: ResponsiveNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <nav className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              {logo || (
                <div className="flex items-center space-x-2">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg hidden sm:inline-block">
                    Kitchentory
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                {items.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-sm font-medium">
                          <span className="flex items-center space-x-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px]">
                            {item.children.map((child) => (
                              <NavigationMenuLink key={child.href} asChild>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    isActive(child.href) && "bg-accent"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    {child.icon}
                                    <div className="text-sm font-medium leading-none">
                                      {child.label}
                                    </div>
                                  </div>
                                  {child.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink 
                          className={cn(
                            navigationMenuTriggerStyle(),
                            isActive(item.href) && "bg-accent text-accent-foreground"
                          )}
                        >
                          <span className="flex items-center space-x-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </span>
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop User Menu & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-2">
                      <Package className="h-6 w-6 text-primary" />
                      <span className="font-bold">Kitchentory</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Navigation Items */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActive(item.href) && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                          {item.children && (
                            <div className="ml-6 mt-2 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive(child.href) && "bg-accent text-accent-foreground"
                                  )}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.icon}
                                  <span>{child.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Actions & User */}
                  <div className="border-t p-6">
                    <div className="space-y-4">
                      <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                      
                      {user && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </Button>
                            <Button variant="ghost" className="w-full justify-start">
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Button>
                          </div>
                          
                          <Button variant="outline" className="w-full">
                            Log out
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Usage example and default navigation items
export const defaultNavItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: <Package className="h-4 w-4" />,
    children: [
      {
        href: "/inventory",
        label: "All Items",
        icon: <Package className="h-4 w-4" />,
        description: "View and manage all your kitchen items",
      },
      {
        href: "/inventory/expiring",
        label: "Expiring Soon",
        icon: <Package className="h-4 w-4" />,
        description: "Items that need attention soon",
      },
      {
        href: "/inventory/out-of-stock",
        label: "Out of Stock",
        icon: <Package className="h-4 w-4" />,
        description: "Items that need restocking",
      },
    ],
  },
]
