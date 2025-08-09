import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserButton } from '@/components/auth/UserButton'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kitchentory</h1>
                <p className="text-sm text-gray-600">Manage your kitchen inventory</p>
              </div>
              <div className="flex items-center space-x-4">
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard cards will go here */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-600">
                Your kitchen inventory management dashboard is ready to use.
                Start by creating your first household or joining an existing one.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                  Add New Item
                </button>
                <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                  Create Shopping List
                </button>
                <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors">
                  Manage Categories
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-500 text-sm">No recent activity to show</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}