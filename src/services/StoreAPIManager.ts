import { 
  StoreProvider, 
  Store, 
  StoreProduct, 
  StoreCart, 
  StoreOrder, 
  StoreSearchParams, 
  StoreSearchResult,
  CartSyncRequest,
  CartSyncResult,
  PriceComparison,
  StoreAPIResponse,
  StoreAPIError,
  UserStoreConnection
} from '../types/stores'

export interface IStoreAPI {
  providerId: string
  name: string
  
  // Authentication
  authenticate(credentials: any): Promise<StoreAPIResponse<UserStoreConnection>>
  refreshToken(connection: UserStoreConnection): Promise<StoreAPIResponse<UserStoreConnection>>
  
  // Store operations
  getStores(location?: { lat: number; lng: number; radius?: number }): Promise<StoreAPIResponse<Store[]>>
  getStore(storeId: string): Promise<StoreAPIResponse<Store>>
  
  // Product operations
  searchProducts(params: StoreSearchParams): Promise<StoreAPIResponse<StoreSearchResult>>
  getProduct(productId: string, storeId: string): Promise<StoreAPIResponse<StoreProduct>>
  
  // Cart operations
  getCart(storeId: string): Promise<StoreAPIResponse<StoreCart>>
  addToCart(storeId: string, productId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>>
  updateCartItem(storeId: string, itemId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>>
  removeFromCart(storeId: string, itemId: string): Promise<StoreAPIResponse<StoreCart>>
  clearCart(storeId: string): Promise<StoreAPIResponse<void>>
  
  // Order operations
  createOrder(cart: StoreCart): Promise<StoreAPIResponse<StoreOrder>>
  getOrder(orderId: string): Promise<StoreAPIResponse<StoreOrder>>
  getOrders(userId: string, limit?: number): Promise<StoreAPIResponse<StoreOrder[]>>
  cancelOrder(orderId: string): Promise<StoreAPIResponse<void>>
}

export class StoreAPIManager {
  private static instance: StoreAPIManager
  private providers: Map<string, IStoreAPI> = new Map()
  private supportedProviders: StoreProvider[] = []

  private constructor() {
    this.initializeProviders()
  }

  public static getInstance(): StoreAPIManager {
    if (!StoreAPIManager.instance) {
      StoreAPIManager.instance = new StoreAPIManager()
    }
    return StoreAPIManager.instance
  }

  private initializeProviders() {
    this.supportedProviders = [
      {
        id: 'instacart',
        name: 'instacart',
        displayName: 'Instacart',
        logo: '/logos/instacart.png',
        website: 'https://instacart.com',
        apiType: 'official',
        supported: true,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: true },
          { id: 'cart', name: 'Cart Management', description: 'Add/remove items from cart', available: true },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: true },
          { id: 'pickup', name: 'Pickup', description: 'Schedule pickup', available: true },
          { id: 'substitutions', name: 'Substitutions', description: 'Handle out-of-stock items', available: true }
        ],
        regions: ['US', 'CA']
      },
      {
        id: 'kroger',
        name: 'kroger',
        displayName: 'Kroger',
        logo: '/logos/kroger.png',
        website: 'https://kroger.com',
        apiType: 'official',
        supported: true,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: true },
          { id: 'cart', name: 'Cart Management', description: 'Add/remove items from cart', available: false },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: false },
          { id: 'pickup', name: 'Pickup', description: 'Schedule pickup', available: false }
        ],
        regions: ['US']
      },
      {
        id: 'walmart',
        name: 'walmart',
        displayName: 'Walmart',
        logo: '/logos/walmart.png',
        website: 'https://walmart.com',
        apiType: 'official',
        supported: true,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: true },
          { id: 'cart', name: 'Cart Management', description: 'Add/remove items from cart', available: false },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: false },
          { id: 'pickup', name: 'Pickup', description: 'Schedule pickup', available: false }
        ],
        regions: ['US']
      },
      {
        id: 'amazon-fresh',
        name: 'amazon-fresh',
        displayName: 'Amazon Fresh',
        logo: '/logos/amazon-fresh.png',
        website: 'https://amazon.com/fresh',
        apiType: 'third-party',
        supported: false,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: false },
          { id: 'cart', name: 'Cart Management', description: 'Add/remove items from cart', available: false },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: false }
        ],
        regions: ['US']
      },
      {
        id: 'whole-foods',
        name: 'whole-foods',
        displayName: 'Whole Foods',
        logo: '/logos/whole-foods.png',
        website: 'https://wholefoodsmarket.com',
        apiType: 'third-party',
        supported: false,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: false },
          { id: 'cart', name: 'Cart Management', description: 'Add/remove items from cart', available: false },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: false }
        ],
        regions: ['US']
      },
      {
        id: 'publix',
        name: 'publix',
        displayName: 'Publix',
        logo: '/logos/publix.png',
        website: 'https://publix.com',
        apiType: 'third-party',
        supported: false,
        features: [
          { id: 'search', name: 'Product Search', description: 'Search for products', available: false },
          { id: 'delivery', name: 'Delivery', description: 'Schedule delivery', available: false }
        ],
        regions: ['US-Southeast']
      }
    ]
  }

  public registerProvider(provider: IStoreAPI) {
    this.providers.set(provider.providerId, provider)
  }

  public getProvider(providerId: string): IStoreAPI | undefined {
    return this.providers.get(providerId)
  }

  public getSupportedProviders(): StoreProvider[] {
    return this.supportedProviders.filter(p => p.supported)
  }

  public getAllProviders(): StoreProvider[] {
    return this.supportedProviders
  }

  public async searchProductsAcrossStores(
    params: StoreSearchParams,
    storeIds: string[]
  ): Promise<StoreAPIResponse<{ [storeId: string]: StoreSearchResult }>> {
    try {
      const results: { [storeId: string]: StoreSearchResult } = {}
      const promises = storeIds.map(async (storeId) => {
        // Extract provider from storeId (assuming format: providerId:storeId)
        const [providerId] = storeId.split(':')
        const provider = this.getProvider(providerId)
        
        if (provider) {
          try {
            const response = await provider.searchProducts(params)
            if (response.success && response.data) {
              results[storeId] = response.data
            }
          } catch (error) {
            console.error(`Error searching ${providerId}:`, error)
          }
        }
      })

      await Promise.all(promises)

      return {
        success: true,
        data: results,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: 'Failed to search products across stores',
          details: error,
          retryable: true
        }
      }
    }
  }

  public async syncShoppingListToCarts(
    request: CartSyncRequest
  ): Promise<StoreAPIResponse<CartSyncResult[]>> {
    try {
      const results: CartSyncResult[] = []
      
      for (const storeId of request.targetStores) {
        const [providerId] = storeId.split(':')
        const provider = this.getProvider(providerId)
        
        if (!provider) {
          continue
        }

        // This is a simplified implementation
        // In reality, you'd need to match shopping list items to store products
        // and handle the cart population logic
        const syncResult: CartSyncResult = {
          storeId,
          cartId: `cart_${storeId}_${Date.now()}`,
          syncedItems: [],
          totalItems: 0,
          totalPrice: 0,
          unavailableItems: []
        }

        results.push(syncResult)
      }

      return {
        success: true,
        data: results,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SYNC_FAILED',
          message: 'Failed to sync shopping list to carts',
          details: error,
          retryable: true
        }
      }
    }
  }

  public async comparePrices(
    productName: string,
    storeIds: string[]
  ): Promise<StoreAPIResponse<PriceComparison>> {
    try {
      const comparison: PriceComparison = {
        shoppingItemName: productName,
        stores: [],
        recommendations: {
          cheapest: '',
          fastest: '',
          bestValue: ''
        }
      }

      // Search for the product in each store
      for (const storeId of storeIds) {
        const [providerId] = storeId.split(':')
        const provider = this.getProvider(providerId)
        
        if (provider) {
          try {
            const searchResult = await provider.searchProducts({
              query: productName,
              limit: 1
            })

            if (searchResult.success && searchResult.data?.products.length > 0) {
              const product = searchResult.data.products[0]
              comparison.stores.push({
                storeId,
                storeName: this.getProviderDisplayName(providerId),
                product,
                price: product.price,
                availability: product.availability === 'in-stock' ? 'available' : 'unavailable',
                totalCost: product.price
              })
            } else {
              comparison.stores.push({
                storeId,
                storeName: this.getProviderDisplayName(providerId),
                availability: 'unavailable'
              })
            }
          } catch (error) {
            comparison.stores.push({
              storeId,
              storeName: this.getProviderDisplayName(providerId),
              availability: 'unknown'
            })
          }
        }
      }

      // Calculate recommendations
      const availableStores = comparison.stores.filter(s => s.availability === 'available' && s.price)
      if (availableStores.length > 0) {
        const cheapest = availableStores.reduce((min, store) => 
          (store.price! < min.price!) ? store : min
        )
        comparison.recommendations.cheapest = cheapest.storeId
        comparison.recommendations.bestValue = cheapest.storeId
        comparison.recommendations.fastest = availableStores[0].storeId // Simplified
      }

      return {
        success: true,
        data: comparison,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PRICE_COMPARISON_FAILED',
          message: 'Failed to compare prices',
          details: error,
          retryable: true
        }
      }
    }
  }

  private getProviderDisplayName(providerId: string): string {
    const provider = this.supportedProviders.find(p => p.id === providerId)
    return provider?.displayName || providerId
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public async validateConnection(connection: UserStoreConnection): Promise<boolean> {
    const provider = this.getProvider(connection.providerId)
    if (!provider) {
      return false
    }

    try {
      // Try to refresh the token to validate the connection
      const response = await provider.refreshToken(connection)
      return response.success
    } catch (error) {
      return false
    }
  }

  public async getConnectedStores(userId: string): Promise<UserStoreConnection[]> {
    // This would typically fetch from a database
    // For now, return empty array as this is a mock implementation
    return []
  }

  public async disconnectStore(connectionId: string): Promise<boolean> {
    // Implementation would remove the connection from database
    return true
  }
}