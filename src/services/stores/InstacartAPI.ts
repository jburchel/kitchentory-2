import { 
  Store, 
  StoreProduct, 
  StoreCart, 
  StoreOrder, 
  StoreSearchParams, 
  StoreSearchResult,
  StoreAPIResponse,
  UserStoreConnection
} from '../../types/stores'
import { IStoreAPI } from '../StoreAPIManager'

export class InstacartAPI implements IStoreAPI {
  public readonly providerId = 'instacart'
  public readonly name = 'Instacart'
  
  private baseUrl = 'https://api.instacart.com/v2'
  private apiKey: string | null = null
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.INSTACART_API_KEY || null
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<StoreAPIResponse<T>> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: {
            code: 'NO_API_KEY',
            message: 'Instacart API key not configured',
            retryable: false
          }
        }
      }

      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `Instacart API error: ${response.statusText}`,
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
          requestId: response.headers.get('x-request-id') || 'unknown',
          timestamp: new Date(),
          rateLimit: {
            remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
            resetAt: new Date(Date.now() + (parseInt(response.headers.get('x-ratelimit-reset') || '0') * 1000))
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
    // Note: In a real implementation, this would use OAuth flow
    // For demo purposes, we'll simulate a successful authentication
    const connection: UserStoreConnection = {
      id: `instacart_${Date.now()}`,
      userId: credentials.email,
      providerId: this.providerId,
      accessToken: 'demo_access_token',
      refreshToken: 'demo_refresh_token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      isActive: true,
      preferences: {
        isDefault: false,
        priority: 1,
        autoPopulateCart: true,
        priceAlerts: true,
        deliveryPreference: 'both',
        notificationSettings: {
          orderUpdates: true,
          priceChanges: true,
          promotions: false
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
    // Simulate token refresh
    const updatedConnection: UserStoreConnection = {
      ...connection,
      accessToken: 'new_demo_access_token',
      expiresAt: new Date(Date.now() + 3600000),
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
    const params = new URLSearchParams()
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
      if (location.radius) {
        params.append('radius', location.radius.toString())
      }
    }

    // Return mock data for demo
    const stores: Store[] = [
      {
        id: 'instacart:kroger_123',
        providerId: 'instacart',
        name: 'Kroger',
        address: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        phone: '(404) 555-0123',
        coordinates: { lat: 33.7490, lng: -84.3880 },
        distance: 2.1,
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryFee: 3.99,
        minimumOrder: 35.00,
        hours: [
          { dayOfWeek: 0, openTime: '08:00', closeTime: '22:00', closed: false },
          { dayOfWeek: 1, openTime: '07:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 2, openTime: '07:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 3, openTime: '07:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 4, openTime: '07:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 5, openTime: '07:00', closeTime: '23:00', closed: false },
          { dayOfWeek: 6, openTime: '07:00', closeTime: '23:00', closed: false }
        ]
      },
      {
        id: 'instacart:publix_456',
        providerId: 'instacart',
        name: 'Publix',
        address: '456 Peachtree St',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        phone: '(404) 555-0456',
        coordinates: { lat: 33.7510, lng: -84.3900 },
        distance: 1.8,
        deliveryAvailable: true,
        pickupAvailable: false,
        deliveryFee: 4.99,
        minimumOrder: 25.00
      },
      {
        id: 'instacart:aldi_789',
        providerId: 'instacart',
        name: 'ALDI',
        address: '789 Piedmont Ave',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        phone: '(404) 555-0789',
        coordinates: { lat: 33.7530, lng: -84.3850 },
        distance: 2.5,
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryFee: 2.99,
        minimumOrder: 30.00
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
    // For demo, return the first store from getStores
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
        message: `Store ${storeId} not found`,
        retryable: false
      }
    }
  }

  async searchProducts(params: StoreSearchParams): Promise<StoreAPIResponse<StoreSearchResult>> {
    const queryParams = new URLSearchParams()
    if (params.query) queryParams.append('query', params.query)
    if (params.category) queryParams.append('category', params.category)
    if (params.minPrice) queryParams.append('min_price', params.minPrice.toString())
    if (params.maxPrice) queryParams.append('max_price', params.maxPrice.toString())
    if (params.sortBy) queryParams.append('sort_by', params.sortBy)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    // Return mock search results for demo
    const mockProducts: StoreProduct[] = [
      {
        id: 'instacart:product_1',
        storeId: 'instacart:kroger_123',
        providerId: 'instacart',
        name: 'Organic Bananas',
        brand: 'Kroger Simple Truth',
        description: 'Fresh organic bananas, perfect for snacking',
        category: 'produce',
        subcategory: 'fruit',
        price: 2.49,
        originalPrice: 2.99,
        currency: 'USD',
        unit: 'lb',
        unitSize: '1 lb',
        availability: 'in-stock',
        images: ['/products/bananas.jpg'],
        barcode: '1234567890123',
        tags: ['organic', 'fresh', 'healthy'],
        promotions: [{
          id: 'promo_1',
          type: 'percentage',
          description: '17% off',
          discount: 17,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }],
        lastUpdated: new Date()
      },
      {
        id: 'instacart:product_2',
        storeId: 'instacart:kroger_123',
        providerId: 'instacart',
        name: 'Whole Milk',
        brand: 'Kroger',
        description: 'Fresh whole milk, 1 gallon',
        category: 'dairy',
        subcategory: 'milk',
        price: 3.99,
        currency: 'USD',
        unit: 'gallon',
        unitSize: '1 gallon',
        availability: 'in-stock',
        images: ['/products/milk.jpg'],
        barcode: '2345678901234',
        tags: ['fresh', 'dairy'],
        lastUpdated: new Date()
      }
    ]

    const result: StoreSearchResult = {
      products: mockProducts,
      total: mockProducts.length,
      filters: {
        categories: [
          { name: 'produce', count: 1 },
          { name: 'dairy', count: 1 }
        ],
        brands: [
          { name: 'Kroger Simple Truth', count: 1 },
          { name: 'Kroger', count: 1 }
        ],
        priceRanges: [
          { min: 0, max: 5, count: 2 }
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
    // Return first product from search for demo
    const searchResponse = await this.searchProducts({ limit: 1 })
    if (searchResponse.success && searchResponse.data?.products.length > 0) {
      return {
        success: true,
        data: searchResponse.data.products[0],
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date()
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: `Product ${productId} not found`,
        retryable: false
      }
    }
  }

  async getCart(storeId: string): Promise<StoreAPIResponse<StoreCart>> {
    // Return empty cart for demo
    const cart: StoreCart = {
      id: `cart_${storeId}_${Date.now()}`,
      storeId,
      providerId: this.providerId,
      userId: 'demo_user',
      items: [],
      subtotal: 0,
      total: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      data: cart,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async addToCart(storeId: string, productId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>> {
    // For demo, just return the cart with simulated item
    const cart = await this.getCart(storeId)
    return cart
  }

  async updateCartItem(storeId: string, itemId: string, quantity: number): Promise<StoreAPIResponse<StoreCart>> {
    const cart = await this.getCart(storeId)
    return cart
  }

  async removeFromCart(storeId: string, itemId: string): Promise<StoreAPIResponse<StoreCart>> {
    const cart = await this.getCart(storeId)
    return cart
  }

  async clearCart(storeId: string): Promise<StoreAPIResponse<void>> {
    return {
      success: true,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async createOrder(cart: StoreCart): Promise<StoreAPIResponse<StoreOrder>> {
    // Demo implementation - would create actual order
    const order: StoreOrder = {
      id: `order_${Date.now()}`,
      storeOrderId: `instacart_order_${Date.now()}`,
      storeId: cart.storeId,
      providerId: this.providerId,
      userId: cart.userId,
      status: 'pending',
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantityOrdered: item.quantity,
        quantityDelivered: 0,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal: cart.subtotal,
      tax: cart.subtotal * 0.08, // 8% tax
      fees: cart.fees || [],
      total: cart.total,
      currency: cart.currency,
      deliveryOption: cart.deliveryOption || 'delivery',
      deliveryAddress: cart.deliveryAddress,
      scheduledTime: cart.deliveryTime ? new Date(cart.deliveryTime) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      data: order,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  async getOrder(orderId: string): Promise<StoreAPIResponse<StoreOrder>> {
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Get order not implemented in demo',
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
      success: true,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date()
      }
    }
  }

  private generateRequestId(): string {
    return `instacart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}