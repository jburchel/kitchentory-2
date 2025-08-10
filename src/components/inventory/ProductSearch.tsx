'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, History, Package, Camera, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
// import { useAction, useQuery } from 'convex/react'
// import { api } from '@/../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import BarcodeScanner from '@/components/barcode/BarcodeScanner'
import { ProductLookupService } from '@/lib/productLookup'
import { CategoryIcon } from '@/components/icons'

interface ProductInfo {
  barcode?: string
  name: string
  brand?: string
  category?: string
  image?: string
  description?: string
}

interface ProductSearchProps {
  onProductSelect: (product: ProductInfo) => void
  placeholder?: string
  className?: string
}

export default function ProductSearch({ 
  onProductSelect, 
  placeholder = "Search products or scan barcode...",
  className 
}: ProductSearchProps) {
  const { user } = useUser()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [searchResults, setSearchResults] = useState<ProductInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Convex queries and actions - temporarily mocked for brand verification
  const recentSearches = null
  const searchProducts = async ({ query }: any) => {
    return [
      {
        name: `Demo ${query}`,
        brand: 'Demo Brand',
        category: 'produce',
        image: undefined,
        barcode: '123456789',
        description: undefined
      }
    ]
  }
  const addSearch = async () => {}

  // Debounced search effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchProducts({ query, limit: 10 })
        setSearchResults(results.map(result => ({
          name: result.name || 'Unknown Product',
          brand: result.brand,
          category: result.category,
          image: result.image,
          barcode: result.barcode,
          description: result.description
        })))
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchProducts])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductSelect = async (product: ProductInfo) => {
    if (user && query.trim()) {
      try {
        await addSearch()
      } catch (error) {
        console.error('Failed to save search:', error)
      }
    }
    
    onProductSelect(product)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleRecentSearchClick = async (searchQuery: string) => {
    setQuery(searchQuery)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleBarcodeDetected = async (barcode: string) => {
    setShowScanner(false)
    setIsLoading(true)
    
    try {
      const productInfo = await ProductLookupService.lookupProduct(barcode)
      if (productInfo) {
        await handleProductSelect(productInfo)
      } else {
        // Create basic product from barcode
        await handleProductSelect({
          barcode,
          name: `Product ${barcode}`,
          category: 'Unknown'
        })
      }
    } catch (error) {
      console.error('Barcode lookup failed:', error)
      await handleProductSelect({
        barcode,
        name: `Product ${barcode}`,
        category: 'Unknown'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCustomProduct = () => {
    if (!query.trim()) return
    
    handleProductSelect({
      name: query.trim(),
      category: 'Custom'
    })
  }

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-12 pr-16 bg-background border-2 border-primary-200 focus:border-primary-500 focus:ring-primary-500/20 rounded-xl"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowScanner(true)}
            className="h-10 w-10 p-0 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
            aria-label="Scan barcode"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-auto border-2 border-primary-200 shadow-elevated rounded-xl">
          <CardContent className="p-0">
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 text-center text-base text-primary-600">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Searching products...</span>
                </div>
              </div>
            )}

            {/* Search results */}
            {!isLoading && searchResults.length > 0 && (
              <div className="border-b border-primary-100">
                <div className="px-4 py-3 text-sm font-semibold text-primary-700 uppercase tracking-wide bg-primary-50">
                  Products
                </div>
                {searchResults.map((product, index) => (
                  <button
                    key={`${product.barcode || product.name}-${index}`}
                    className="w-full px-4 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none transition-colors duration-150 border-b border-primary-50 last:border-b-0"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-primary-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate text-base">{product.name}</div>
                        <div className="flex gap-2 text-sm items-center mt-1">
                          {product.brand && <span className="text-muted-foreground">{product.brand}</span>}
                          {product.category && (
                            <div className="flex items-center gap-1">
                              <CategoryIcon
                                category={product.category}
                                size="xs"
                                variant="subtle"
                                aria-label={`${product.category} category`}
                              />
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Create custom product option */}
            {!isLoading && query.trim() && searchResults.length === 0 && (
              <div className="border-b border-primary-100">
                <div className="px-4 py-3 text-sm font-semibold text-primary-700 uppercase tracking-wide bg-primary-50">
                  Create New
                </div>
                <button
                  className="w-full px-4 py-4 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none transition-colors duration-150"
                  onClick={handleCreateCustomProduct}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shadow-brand">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-base">Create "{query}"</div>
                      <div className="text-sm text-muted-foreground mt-1">Add as custom product</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Recent searches */}
            {false && (
              <div>
                <div className="px-4 py-3 text-sm font-semibold text-primary-700 uppercase tracking-wide bg-primary-50">
                  Recent Searches
                </div>
                {[].map((search: any) => (
                  <button
                    key={search.id}
                    className="w-full px-4 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none transition-colors duration-150 border-b border-primary-50 last:border-b-0"
                    onClick={() => handleRecentSearchClick(search.query)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{search.query}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !query.trim() && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary-500" />
                </div>
                <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
                  Start typing to search products or use the camera icon to scan barcodes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}
    </div>
  )
}