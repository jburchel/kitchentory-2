import { 
  IStoreAPI,
  Store, 
  StoreProduct, 
  StoreCart, 
  StoreOrder, 
  StoreSearchParams, 
  StoreSearchResult,
  StoreAPIResponse,
  UserStoreConnection
} from '@/types/stores'

export class WalmartAPI implements IStoreAPI {
  public readonly providerId = 'walmart'
  public readonly name = 'Walmart'
  
  private baseUrl = 'https://marketplace.walmartapis.com/v3'
  private apiKey: string | null = null
  private consumerId: string | null = null
  private privateKey: string | null = null
  
  constructor(config?: { apiKey?: string; consumerId?: string; privateKey?: string }) {
    this.apiKey = config?.apiKey || process.env.WALMART_API_KEY || null
    this.consumerId = config?.consumerId || process.env.WALMART_CONSUMER_ID || null
    this.privateKey = config?.privateKey || process.env.WALMART_PRIVATE_KEY || null
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<StoreAPIResponse<T>> {
    try {
      if (!this.apiKey || !this.consumerId) {
        return {
          success: false,
          error: {
            code: 'NO_API_CREDENTIALS',
            message: 'Walmart API credentials not configured',
            retryable: false
          }
        }
      }

      const url = `${this.baseUrl}${endpoint}`
      const timestamp = Date.now().toString()
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'WM_CONSUMER.ID': this.consumerId,
          'WM_SEC.ACCESS_TOKEN': this.apiKey,
          'WM_SEC.TIMESTAMP': timestamp,
          'WM_QOS.CORRELATION_ID': this.generateRequestId(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Walmart API error: ${response.statusText}`,
            details: errorText,
            retryable: response.status >= 500
          }
        }
      }

      const data = await response.json()
      
      return {
        success: true,
        data,
        metadata: {
          requestId: response.headers.get('WM_QOS.CORRELATION_ID') || this.generateRequestId(),
          timestamp: new Date(),
          rateLimit: {
            remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '1000'),
            resetAt: new Date(Date.now() + 60000) // 1 minute reset window
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
          details: error,
          retryable: true
        }
      }
    }
  }

  async authenticate(credentials: {
    email: string
    password: string
  }): Promise<StoreAPIResponse<UserStoreConnection>> {
    // Note: Walmart uses developer API keys rather than user authentication
    // For demo purposes, we'll simulate a successful authentication
    const connection: UserStoreConnection = {
      id: `walmart_${Date.now()}`,
      userId: credentials.email,
      providerId: this.providerId,
      accessToken: 'demo_walmart_access_token',
      refreshToken: 'demo_walmart_refresh_token',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      isActive: true,
      preferences: {
        isDefault: false,
        priority: 3,
        autoPopulateCart: false, // Walmart doesn't support cart API
        priceAlerts: true,
        deliveryPreference: 'both',
        notificationSettings: {
          orderUpdates: false,
          priceChanges: true,
          promotions: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      data: connection,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async refreshToken(connection: UserStoreConnection): Promise<StoreAPIResponse<UserStoreConnection>> {
    // Walmart API tokens are long-lived, simulate refresh
    const updatedConnection: UserStoreConnection = {
      ...connection,
      accessToken: 'new_demo_walmart_access_token',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      updatedAt: new Date()
    }

    return {
      success: true,
      data: updatedConnection,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async getStores(location?: { 
    lat: number; 
    lng: number; 
    radius?: number 
  }): Promise<StoreAPIResponse<Store[]>> {
    // Return mock Walmart stores for demo
    const stores: Store[] = [
      {
        id: 'walmart:store_5260',
        providerId: 'walmart',
        name: 'Walmart Supercenter',
        address: '3580 Memorial Dr SE',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30032',
        phone: '(404) 292-9677',
        coordinates: { lat: 33.7479, lng: -84.3178 },
        distance: 3.2,
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryFee: 7.95,
        minimumOrder: 35.00,
        hours: [
          { dayOfWeek: 0, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 1, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '23:00', closed: false }
        ]
      },
      {
        id: 'walmart:store_0927',
        providerId: 'walmart',
        name: 'Walmart Neighborhood Market',
        address: '1105 West Peachtree St NW',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        phone: '(404) 541-1434',
        coordinates: { lat: 33.7839, lng: -84.3876 },
        distance: 1.8,
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryFee: 7.95,
        minimumOrder: 35.00
      },
      {
        id: 'walmart:store_4019',
        providerId: 'walmart',
        name: 'Walmart Supercenter',
        address: '2427 Gresham Rd SE',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30316',
        phone: '(404) 241-2243',
        coordinates: { lat: 33.7219, lng: -84.3342 },
        distance: 4.1,
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryFee: 7.95,
        minimumOrder: 35.00
      }
    ]

    return {
      success: true,
      data: stores,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async getStore(storeId: string): Promise<StoreAPIResponse<Store>> {
    const storesResponse = await this.getStores()
    if (storesResponse.success && storesResponse.data) {
      const store = storesResponse.data.find(s => s.id === storeId)
      if (store) {
        return {
          success: true,
          data: store,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date()
          }
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'STORE_NOT_FOUND',
        message: `Walmart store ${storeId} not found`,
        retryable: false
      }
    }
  }

  async searchProducts(params: StoreSearchParams): Promise<StoreAPIResponse<StoreSearchResult>> {
    const queryParams = new URLSearchParams()
    if (params.query) queryParams.append('query', params.query)
    if (params.category) queryParams.append('categoryId', params.category)
    if (params.limit) queryParams.append('numItems', params.limit.toString())
    if (params.offset) queryParams.append('start', (params.offset + 1).toString())

    // Return mock Walmart products for demo
    const mockProducts: StoreProduct[] = [
      {
        id: 'walmart:product_10450114',
        storeId: 'walmart:store_5260',
        providerId: 'walmart',
        name: 'Great Value Bananas, each',
        brand: 'Great Value',
        description: 'Fresh yellow bananas',
        category: 'food',
        subcategory: 'produce',
        price: 0.58,
        currency: 'USD',
        unit: 'each',
        unitSize: '1 each',
        availability: 'in-stock',
        images: ['/walmart/products/bananas.jpg'],
        barcode: '0681131055017',
        tags: ['fresh', 'produce', 'great-value'],
        lastUpdated: new Date()
      },
      {
        id: 'walmart:product_10450115',
        storeId: 'walmart:store_5260',
        providerId: 'walmart',
        name: 'Great Value Whole Milk, 1 Gallon',
        brand: 'Great Value',
        description: 'Grade A pasteurized whole milk',
        category: 'food',
        subcategory: 'dairy',
        price: 3.42,
        currency: 'USD',
        unit: 'gallon',
        unitSize: '1 gallon',
        availability: 'in-stock',
        images: ['/walmart/products/whole-milk.jpg'],
        barcode: '0681131001595',
        tags: ['dairy', 'fresh', 'great-value'],
        nutritionInfo: {
          servingSize: '1 cup (240ml)',
          servingsPerContainer: 16,
          calories: 150,
          totalFat: 8,
          saturatedFat: 5,
          cholesterol: 35,
          sodium: 125,
          totalCarbohydrates: 12,
          sugars: 12,
          protein: 8,
          calcium: 30,
          vitaminD: 25
        },
        lastUpdated: new Date()
      },
      {
        id: 'walmart:product_10525033',
        storeId: 'walmart:store_5260',
        providerId: 'walmart',
        name: 'Wonder Bread Classic White, 20 oz',
        brand: 'Wonder',
        description: 'Classic white enriched bread',
        category: 'food',
        subcategory: 'bakery',
        price: 1.25,
        originalPrice: 1.48,
        currency: 'USD',
        unit: 'loaf',
        unitSize: '20 oz loaf',
        availability: 'in-stock',
        images: ['/walmart/products/wonder-bread.jpg'],
        barcode: '0884912113764',
        tags: ['bread', 'bakery', 'wonder'],
        promotions: [{
          id: 'walmart_rollback_1',
          type: 'fixed-amount',
          description: 'Rollback',
          discount: 0.23,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }],
        lastUpdated: new Date()
      }
    ]

    // Filter products based on search params
    let filteredProducts = mockProducts
    if (params.query) {
      const query = params.query.toLowerCase()
      filteredProducts = mockProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    const result: StoreSearchResult = {
      products: filteredProducts,
      total: filteredProducts.length,
      filters: {
        categories: [
          { name: 'produce', count: 1 },
          { name: 'dairy', count: 1 },
          { name: 'bakery', count: 1 }
        ],
        brands: [
          { name: 'Great Value', count: 2 },
          { name: 'Wonder', count: 1 }
        ],
        priceRanges: [
          { min: 0, max: 2, count: 2 },
          { min: 3, max: 4, count: 1 }
        ]
      }
    }

    return {
      success: true,
      data: result,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async getProduct(productId: string, storeId: string): Promise<StoreAPIResponse<StoreProduct>> {
    const searchResponse = await this.searchProducts({ limit: 10 })
    if (searchResponse.success && searchResponse.data?.products.length > 0) {
      const product = searchResponse.data.products.find(p => p.id === productId)
      if (product) {
        return {
          success: true,
          data: product,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date()
          }
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `Walmart product ${productId} not found in store ${storeId}`,
        retryable: false
      }
    }
  }

  async getCart(storeId: string): Promise<StoreAPIResponse<StoreCart>> {
    // Walmart API doesn't support cart management
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Cart management not available via Walmart API',
        retryable: false,
        details: {
          reason: 'Walmart API is primarily for product search and inventory. Cart management requires web interface.',
          redirectUrl: 'https://www.walmart.com/cart'
        }
      }
    }
  }

  async addToCart(storeId: string, productId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Adding to cart not available via API. Redirecting to Walmart website.',
        retryable: false,
        details: {
          redirectUrl: `https://www.walmart.com/ip/${productId.split(':')[1]}`
        }
      }
    }
  }

  async updateCartItem(storeId: string, itemId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Cart updates not available via API',
        retryable: false
      }
    }
  }

  async removeFromCart(storeId: string, itemId: string): Promise<StoreAPIResponse<StoreCart>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Cart item removal not available via API',
        retryable: false
      }
    }
  }

  async clearCart(storeId: string): Promise<StoreAPIResponse<void>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Cart clearing not available via API',
        retryable: false
      }
    }
  }

  async createOrder(cart: StoreCart): Promise<StoreAPIResponse<StoreOrder>> {
    // Walmart API doesn't support order creation
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Order creation not available via API. Use Walmart website.',
        retryable: false,
        details: {
          redirectUrl: 'https://www.walmart.com/checkout'
        }
      }
    }
  }

  async getOrder(orderId: string): Promise<StoreAPIResponse<StoreOrder>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Order retrieval not available via public API',
        retryable: false
      }
    }
  }

  async getOrders(userId: string, limit?: number): Promise<StoreAPIResponse<StoreOrder[]>> {
    return {
      success: true,
      data: [],
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async cancelOrder(orderId: string): Promise<StoreAPIResponse<void>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Order cancellation not available via API',
        retryable: false
      }
    }
  }

  private generateRequestId(): string {
    return `walmart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}