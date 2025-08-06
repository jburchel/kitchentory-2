import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Kitchentory
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Your intelligent kitchen inventory management system. Keep track of
          ingredients, plan meals, and never run out of essentials again.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Track Inventory</h3>
            <p className="text-gray-600">
              Monitor your ingredients and get alerts when running low
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Plan Meals</h3>
            <p className="text-gray-600">
              Create meal plans based on your available ingredients
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Smart Shopping</h3>
            <p className="text-gray-600">
              Generate shopping lists automatically based on your needs
            </p>
          </Card>
        </div>
        
        <Button size="lg" className="mb-4">
          Get Started
        </Button>
      </div>
    </main>
  )
}