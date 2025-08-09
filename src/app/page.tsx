import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to Kitchentory
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-gray-600">
          Your intelligent kitchen inventory management system. Keep track of
          ingredients, plan meals, and never run out of essentials again.
        </p>

        <div className="mb-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Track Inventory</h3>
            <p className="text-gray-600">
              Monitor your ingredients and get alerts when running low
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Plan Meals</h3>
            <p className="text-gray-600">
              Create meal plans based on your available ingredients
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Smart Shopping</h3>
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