'use client'

export default function TestStyles() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="heading-display text-brand">Kitchentory Brand System Test</h1>
      
      {/* Brand Colors */}
      <section className="space-y-4">
        <h2 className="heading-section">Brand Colors</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-brand-gradient text-white rounded-lg">
            Primary Gradient
          </div>
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            Primary Color
          </div>
          <div className="p-4 bg-surface-gradient border rounded-lg">
            Surface Gradient
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="space-y-4">
        <h2 className="heading-section">Food Categories</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded mb-2"></div>
            <span className="text-category-produce font-semibold">Produce</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-purple-500 rounded mb-2"></div>
            <span className="text-category-protein font-semibold">Protein</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded mb-2"></div>
            <span className="text-category-dairy font-semibold">Dairy</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-yellow-500 rounded mb-2"></div>
            <span className="text-category-grains font-semibold">Grains</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-cyan-500 rounded mb-2"></div>
            <span className="text-category-beverages font-semibold">Beverages</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-sky-500 rounded mb-2"></div>
            <span className="text-category-frozen font-semibold">Frozen</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-orange-500 rounded mb-2"></div>
            <span className="text-category-pantry font-semibold">Pantry</span>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="w-4 h-4 bg-lime-500 rounded mb-2"></div>
            <span className="text-category-household font-semibold">Household</span>
          </div>
        </div>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-4">
        <h2 className="heading-section">Semantic Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-success border-success border rounded-lg">
            <span className="text-success font-semibold">Success Message</span>
            <p className="text-sm mt-1">Operation completed successfully</p>
          </div>
          <div className="p-4 bg-warning border-warning border rounded-lg">
            <span className="text-warning font-semibold">Warning Message</span>
            <p className="text-sm mt-1">Please review this action</p>
          </div>
          <div className="p-4 bg-error border-error border rounded-lg">
            <span className="text-error font-semibold">Error Message</span>
            <p className="text-sm mt-1">Something went wrong</p>
          </div>
          <div className="p-4 bg-info border-info border rounded-lg">
            <span className="text-info font-semibold">Info Message</span>
            <p className="text-sm mt-1">Here's some helpful information</p>
          </div>
        </div>
      </section>

      {/* Text Hierarchy */}
      <section className="space-y-4">
        <h2 className="heading-section">Text Hierarchy</h2>
        <div className="space-y-2">
          <p className="text-large text-primary">Primary text - most important content</p>
          <p className="text-body text-secondary">Secondary text - supporting information</p>
          <p className="text-small text-muted">Muted text - less important details</p>
          <p className="text-small text-disabled">Disabled text - inactive content</p>
        </div>
      </section>

      {/* Dark Mode Toggle Button */}
      <section className="space-y-4">
        <h2 className="heading-section">Dark Mode Test</h2>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg focus-brand hover:opacity-90 transition-opacity"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          Toggle Dark Mode
        </button>
        <p className="text-small text-muted">Click the button above to test dark mode theming</p>
      </section>
    </div>
  );
}