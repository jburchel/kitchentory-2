'use client'

import React from 'react'
import { FoodCategoryIcon } from './FoodCategoryIcon'
import CategoryIcon from './CategoryIcon'
import { getAllCategories } from '@/lib/icons/food-categories'

/**
 * Showcase component demonstrating the new SVG icon system
 * Shows all food category icons in different sizes and variants
 */
export default function IconShowcase() {
  const categories = getAllCategories().filter(cat => cat !== 'unknown')
  
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">SVG Icon System Showcase</h1>
        <p className="text-muted-foreground mb-6">
          Brandbook-compliant SVG icons with 2px stroke weight, 24x24px grid system
        </p>
      </div>

      {/* Size variants */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Size Variants</h2>
        <div className="flex items-center gap-4 mb-4">
          <FoodCategoryIcon category="produce" size="xs" />
          <FoodCategoryIcon category="produce" size="sm" />
          <FoodCategoryIcon category="produce" size="md" />
          <FoodCategoryIcon category="produce" size="lg" />
          <FoodCategoryIcon category="produce" size="xl" />
        </div>
        <p className="text-sm text-muted-foreground">XS (16px), SM (20px), MD (24px), LG (32px), XL (48px)</p>
      </section>

      {/* Style variants */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Style Variants</h2>
        <div className="flex items-center gap-4 mb-4">
          <FoodCategoryIcon category="produce" variant="default" />
          <FoodCategoryIcon category="produce" variant="outline" />
          <FoodCategoryIcon category="produce" variant="solid" />
          <FoodCategoryIcon category="produce" variant="subtle" />
        </div>
        <p className="text-sm text-muted-foreground">Default, Outline, Solid, Subtle</p>
      </section>

      {/* All categories */}
      <section>
        <h2 className="text-lg font-semibold mb-4">All Food Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <div key={category} className="flex flex-col items-center space-y-2">
              <FoodCategoryIcon category={category} size="lg" />
              <span className="text-sm font-medium capitalize">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* With labels */}
      <section>
        <h2 className="text-lg font-semibold mb-4">With Labels</h2>
        <div className="space-y-2">
          {categories.slice(0, 4).map(category => (
            <FoodCategoryIcon 
              key={category} 
              category={category} 
              showLabel={true}
              size="md"
            />
          ))}
        </div>
      </section>

      {/* Interactive icons */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Interactive Icons</h2>
        <div className="flex gap-4">
          {categories.slice(0, 4).map(category => (
            <FoodCategoryIcon 
              key={category}
              category={category} 
              interactive={true}
              onClick={() => alert(`Clicked ${category}!`)}
              aria-label={`Select ${category} category`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Click the icons above to test interactivity</p>
      </section>

      {/* Backward compatibility - CategoryIcon component */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Legacy CategoryIcon Component</h2>
        <div className="flex gap-4">
          {categories.slice(0, 4).map(category => (
            <CategoryIcon 
              key={category}
              category={category} 
              size="md"
              variant="filled"
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Using the legacy CategoryIcon component (now with SVG)</p>
      </section>

      {/* Accessibility demonstration */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Accessibility Features</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Decorative (hidden from screen readers):</h3>
            <FoodCategoryIcon category="produce" aria-hidden={true} />
          </div>
          <div>
            <h3 className="font-medium mb-2">Semantic with custom label:</h3>
            <FoodCategoryIcon 
              category="produce" 
              aria-label="Fresh fruits and vegetables category"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Interactive with keyboard support:</h3>
            <FoodCategoryIcon 
              category="produce" 
              interactive={true}
              onClick={() => console.log('Keyboard accessible click')}
              aria-label="Select produce category"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Try tabbing to this icon and pressing Enter/Space
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}