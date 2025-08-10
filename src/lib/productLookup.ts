interface ProductInfo {
  barcode?: string
  name: string
  brand?: string
  category?: string
  image?: string
  description?: string
}

export class ProductLookupService {
  static async lookupProduct(barcode: string): Promise<ProductInfo | null> {
    try {
      // Try Open Food Facts API first
      const openFoodFactsResponse = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      )
      
      if (openFoodFactsResponse.ok) {
        const data = await openFoodFactsResponse.json()
        if (data.product) {
          const product = data.product
          return {
            barcode,
            name: product.product_name || product.generic_name || `Product ${barcode}`,
            brand: product.brands?.split(',')[0]?.trim(),
            category: this.mapCategory(product.categories_tags?.[0]),
            image: product.image_url,
            description: product.ingredients_text
          }
        }
      }

      // Fallback to UPC Database
      const upcResponse = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      )
      
      if (upcResponse.ok) {
        const upcData = await upcResponse.json()
        if (upcData.items && upcData.items.length > 0) {
          const item = upcData.items[0]
          return {
            barcode,
            name: item.title || `Product ${barcode}`,
            brand: item.brand,
            category: this.mapCategory(item.category),
            image: item.images?.[0],
            description: item.description
          }
        }
      }

      return null
    } catch (error) {
      console.error('Product lookup failed:', error)
      return null
    }
  }

  private static mapCategory(category?: string): string {
    if (!category) return 'pantry'
    
    const categoryMap: Record<string, string> = {
      'en:beverages': 'beverages',
      'en:dairy': 'dairy',
      'en:fruits': 'produce',
      'en:vegetables': 'produce',
      'en:meat': 'protein',
      'en:fish': 'protein',
      'en:cereals': 'grains',
      'en:bread': 'grains',
      'en:frozen': 'frozen',
      'en:snacks': 'pantry',
      'en:condiments': 'pantry'
    }

    const lowercaseCategory = category.toLowerCase()
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowercaseCategory.includes(key.replace('en:', ''))) {
        return value
      }
    }

    return 'pantry'
  }
}