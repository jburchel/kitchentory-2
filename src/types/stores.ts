export interface StoreProvider {
  id: string
  name: string
  displayName: string
  logo: string
  website: string
  apiType: 'official' | 'third-party' | 'scraping'
  supported: boolean
  features: StoreFeature[]
  regions: string[]
}

export interface StoreFeature {
  id: string
  name: string
  description: string
  available: boolean
}

export interface Store {
  id: string
  providerId: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  hours?: StoreHours[]
  coordinates?: {
    lat: number
    lng: number
  }
  distance?: number
  deliveryAvailable: boolean
  pickupAvailable: boolean
  deliveryFee?: number
  minimumOrder?: number
}

export interface StoreHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday
  openTime: string // "09:00"
  closeTime: string // "21:00"
  closed: boolean
}

export interface UserStoreConnection {
  id: string
  userId: string
  providerId: string
  storeId?: string
  accountId?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  isActive: boolean
  preferences: StorePreferences
  createdAt: Date
  updatedAt: Date
}

export interface StorePreferences {
  isDefault: boolean
  priority: number
  autoPopulateCart: boolean
  priceAlerts: boolean
  deliveryPreference: 'delivery' | 'pickup' | 'both'
  notificationSettings: {
    orderUpdates: boolean
    priceChanges: boolean
    promotions: boolean
  }
}

export interface StoreProduct {
  id: string
  storeId: string
  providerId: string
  name: string
  brand?: string
  description?: string
  category: string
  subcategory?: string
  price: number
  originalPrice?: number
  currency: string
  unit: string
  unitSize?: string
  availability: 'in-stock' | 'out-of-stock' | 'limited'
  images: string[]
  barcode?: string
  nutritionInfo?: NutritionInfo
  ingredients?: string[]
  allergens?: string[]
  tags?: string[]
  promotions?: StorePromotion[]
  lastUpdated: Date
}

export interface NutritionInfo {
  servingSize: string
  servingsPerContainer?: number
  calories?: number
  totalFat?: number
  saturatedFat?: number
  transFat?: number
  cholesterol?: number
  sodium?: number
  totalCarbohydrates?: number
  dietaryFiber?: number
  sugars?: number
  protein?: number
  vitaminA?: number
  vitaminC?: number
  calcium?: number
  iron?: number
}

export interface StorePromotion {
  id: string
  type: 'percentage' | 'fixed-amount' | 'bogo' | 'bulk-discount'
  description: string
  discount: number
  minimumQuantity?: number
  validFrom: Date
  validUntil: Date
}

export interface StoreCart {
  id: string
  storeId: string
  providerId: string
  userId: string
  items: StoreCartItem[]
  subtotal: number
  tax?: number
  fees?: StoreFee[]
  total: number
  currency: string
  deliveryOption?: 'delivery' | 'pickup'
  deliveryAddress?: DeliveryAddress
  deliveryTime?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface StoreCartItem {
  id: string
  productId: string
  product: StoreProduct
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
  substitutionPreference?: 'allow' | 'deny' | 'contact'
  substitutionOptions?: StoreProduct[]
}

export interface StoreFee {
  type: 'delivery' | 'service' | 'bag' | 'tip' | 'processing'
  name: string
  amount: number
  description?: string
}

export interface DeliveryAddress {
  street: string
  unit?: string
  city: string
  state: string
  zipCode: string
  country: string
  instructions?: string
}

export interface StoreOrder {
  id: string
  storeOrderId: string
  storeId: string
  providerId: string
  userId: string
  status: StoreOrderStatus
  items: StoreOrderItem[]
  subtotal: number
  tax: number
  fees: StoreFee[]
  total: number
  currency: string
  paymentMethod?: string
  deliveryOption: 'delivery' | 'pickup'
  deliveryAddress?: DeliveryAddress
  scheduledTime?: Date
  actualDeliveryTime?: Date
  trackingUrl?: string
  receipt?: OrderReceipt
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type StoreOrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shopping'
  | 'ready-for-pickup'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface StoreOrderItem {
  id: string
  productId: string
  product: StoreProduct
  quantityOrdered: number
  quantityDelivered: number
  unitPrice: number
  totalPrice: number
  substitution?: {
    originalProduct: StoreProduct
    replacementProduct: StoreProduct
    reason: string
  }
  unavailable?: boolean
  refundAmount?: number
}

export interface OrderReceipt {
  url?: string
  imageData?: string
  items: ReceiptItem[]
  total: number
  tax: number
  date: Date
  storeInfo: {
    name: string
    address: string
    phone?: string
  }
}

export interface ReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  barcode?: string
}

export interface StoreSearchParams {
  query?: string
  category?: string
  storeIds?: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  onSaleOnly?: boolean
  brands?: string[]
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'name' | 'rating'
  limit?: number
  offset?: number
}

export interface StoreSearchResult {
  products: StoreProduct[]
  total: number
  filters: {
    categories: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
  }
}

export interface CartSyncRequest {
  shoppingListId: string
  targetStores: string[]
  preferences: {
    allowSubstitutions: boolean
    preferredBrands?: string[]
    maxPriceIncrease?: number // percentage
    prioritizeAvailability: boolean
  }
}

export interface CartSyncResult {
  storeId: string
  cartId: string
  syncedItems: Array<{
    shoppingItemId: string
    storeProduct?: StoreProduct
    status: 'matched' | 'substituted' | 'not-found'
    substitutionReason?: string
  }>
  totalItems: number
  totalPrice: number
  unavailableItems: string[]
}

export interface PriceComparison {
  shoppingItemName: string
  stores: Array<{
    storeId: string
    storeName: string
    product?: StoreProduct
    price?: number
    availability: 'available' | 'unavailable' | 'unknown'
    deliveryFee?: number
    totalCost?: number // price + delivery fee
  }>
  recommendations: {
    cheapest: string // storeId
    fastest: string // storeId
    bestValue: string // storeId
  }
}

export interface StoreAPIError {
  code: string
  message: string
  details?: any
  retryable: boolean
  storeId?: string
  providerId?: string
}

export interface StoreAPIResponse<T> {
  success: boolean
  data?: T
  error?: StoreAPIError
  metadata?: {
    requestId: string
    timestamp: Date
    rateLimit?: {
      remaining: number
      resetAt: Date
    }
  }
}