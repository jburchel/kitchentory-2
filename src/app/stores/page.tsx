'use client'

export default function StoresPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Store Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite grocery stores for automated shopping and inventory management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Instacart</h3>
            <p className="text-muted-foreground mb-4">Multi-store delivery platform</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Connect</button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Kroger</h3>
            <p className="text-muted-foreground mb-4">Kroger family stores</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Connect</button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Walmart</h3>
            <p className="text-muted-foreground mb-4">Walmart grocery delivery</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Connect</button>
          </div>
        </div>
      </div>
    </div>
  )
}