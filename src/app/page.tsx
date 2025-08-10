import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, BarChart, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <main className="container mx-auto px-4 py-8">
        <SignedOut>
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Kitchentory
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Smart kitchen inventory management with barcode scanning, recipe matching, and automated shopping lists.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="px-8">Get Started</Button>
              <Button size="lg" variant="outline" className="px-8">Sign Up</Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Barcode Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instantly add products by scanning barcodes with your camera
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShoppingCart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically generated shopping lists based on your inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Recipe Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find recipes you can make with ingredients you have
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Family Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your inventory with family members in real-time
                </p>
              </CardContent>
            </Card>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome back!</h1>
            <p className="text-muted-foreground mb-8">
              Ready to manage your kitchen inventory?
            </p>
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </div>
        </SignedIn>
      </main>
    </div>
  )
}