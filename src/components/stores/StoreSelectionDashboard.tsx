'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Store as StoreIcon, 
  Plus, 
  MapPin, 
  Clock, 
  Truck, 
  ShoppingCart,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  DollarSign,
  Star,
  Navigation
} from 'lucide-react'
import { StoreProvider, Store, UserStoreConnection } from '@/types/stores'
import { StoreAPIManager } from '@/services/StoreAPIManager'
import { InstacartAPI } from '@/services/stores/InstacartAPI'
import { KrogerAPI } from '@/services/stores/KrogerAPI'
import { WalmartAPI } from '@/services/stores/WalmartAPI'
import { toast } from 'sonner'

export interface StoreSelectionDashboardProps {
  householdId: string
  onStoreConnected?: (connection: UserStoreConnection) => void
}

export function StoreSelectionDashboard({ 
  householdId, 
  onStoreConnected 
}: StoreSelectionDashboardProps) {
  const [storeManager] = useState(() => {
    const manager = StoreAPIManager.getInstance()
    // Register API providers
    manager.registerProvider(new InstacartAPI())
    manager.registerProvider(new KrogerAPI())
    manager.registerProvider(new WalmartAPI())
    return manager
  })
  
  const [supportedProviders, setSupportedProviders] = useState<StoreProvider[]>([])
  const [connectedStores, setConnectedStores] = useState<UserStoreConnection[]>([])
  const [nearbyStores, setNearbyStores] = useState<Store[]>([])
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<StoreProvider | null>(null)
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    loadProviders()
    loadConnectedStores()
    requestLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      loadNearbyStores()
    }
  }, [userLocation])

  const loadProviders = () => {
    const providers = storeManager.getSupportedProviders()
    setSupportedProviders(providers)
  }

  const loadConnectedStores = async () => {
    try {
      const connections = await storeManager.getConnectedStores(householdId)
      setConnectedStores(connections)
    } catch (error) {
      console.error('Failed to load connected stores:', error)
    }
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Failed to get location:', error)
          // Use default location (Atlanta, GA)
          setUserLocation({ lat: 33.7490, lng: -84.3880 })
        }
      )
    } else {
      // Use default location
      setUserLocation({ lat: 33.7490, lng: -84.3880 })
    }
  }

  const loadNearbyStores = async () => {
    if (!userLocation) return

    setLoading(true)
    try {
      // Load stores from all connected providers
      const allStores: Store[] = []
      
      for (const provider of supportedProviders) {
        const api = storeManager.getProvider(provider.id)
        if (api) {
          const response = await api.getStores(userLocation)
          if (response.success && response.data) {
            allStores.push(...response.data)
          }
        }
      }

      setNearbyStores(allStores)
    } catch (error) {
      console.error('Failed to load nearby stores:', error)
      toast.error('Failed to load nearby stores')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStore = (provider: StoreProvider) => {
    setSelectedProvider(provider)
    setShowConnectDialog(true)
  }

  const handleStoreConnection = async (credentials: any) => {
    if (!selectedProvider) return

    setLoading(true)
    try {
      const api = storeManager.getProvider(selectedProvider.id)
      if (!api) {
        throw new Error('Provider API not available')
      }

      const response = await api.authenticate(credentials)
      if (response.success && response.data) {
        setConnectedStores(prev => [...prev, response.data!])
        setShowConnectDialog(false)
        setSelectedProvider(null)
        toast.success(`Successfully connected to ${selectedProvider.displayName}`)
        onStoreConnected?.(response.data)
      } else {
        throw new Error(response.error?.message || 'Authentication failed')
      }
    } catch (error) {
      console.error('Failed to connect store:', error)
      toast.error(`Failed to connect to ${selectedProvider?.displayName}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectStore = async (connectionId: string) => {
    try {
      await storeManager.disconnectStore(connectionId)
      setConnectedStores(prev => prev.filter(c => c.id !== connectionId))
      toast.success('Store disconnected successfully')
    } catch (error) {
      console.error('Failed to disconnect store:', error)
      toast.error('Failed to disconnect store')
    }
  }

  const updateStorePreferences = (connectionId: string, preferences: any) => {
    setConnectedStores(prev => prev.map(c => 
      c.id === connectionId 
        ? { ...c, preferences: { ...c.preferences, ...preferences }, updatedAt: new Date() }
        : c
    ))
  }

  const getProviderStats = () => {
    const total = supportedProviders.length
    const connected = connectedStores.length
    const available = supportedProviders.filter(p => p.supported).length
    
    return { total, connected, available }
  }

  const stats = getProviderStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StoreIcon className="w-8 h-8 text-blue-600" />
            Store Connections
          </h1>
          <p className="text-muted-foreground">
            Connect to grocery stores for automated shopping
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Stores</p>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Stores</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
              <StoreIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nearby Stores</p>
                <p className="text-2xl font-bold">{nearbyStores.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Store Providers</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Stores</TabsTrigger>
          <TabsTrigger value="connected">Connected Stores</TabsTrigger>
        </TabsList>

        {/* Store Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedProviders.map((provider) => {
              const isConnected = connectedStores.some(c => c.providerId === provider.id)
              
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <img 
                          src={provider.logo} 
                          alt={provider.displayName}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {provider.displayName}
                      </CardTitle>
                      <Badge variant={provider.supported ? "default" : "secondary"}>
                        {provider.supported ? "Available" : "Coming Soon"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      API Type: {provider.apiType}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature) => (
                          <Badge 
                            key={feature.id} 
                            variant={feature.available ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {feature.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleConnectStore(provider)}
                          disabled={!provider.supported}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Connect Store
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Nearby Stores Tab */}
        <TabsContent value="nearby" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading nearby stores...</p>
            </div>
          ) : nearbyStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyStores.map((store) => (
                <Card key={store.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {store.distance?.toFixed(1)} miles away
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p>{store.address}</p>
                      <p>{store.city}, {store.state} {store.zipCode}</p>
                      {store.phone && <p>{store.phone}</p>}
                    </div>

                    <div className="flex gap-2">
                      {store.deliveryAvailable && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Delivery
                        </Badge>
                      )}
                      {store.pickupAvailable && (
                        <Badge variant="outline" className="text-xs">
                          <StoreIcon className="w-3 h-3 mr-1" />
                          Pickup
                        </Badge>
                      )}
                    </div>

                    {store.deliveryFee && (
                      <div className="text-sm text-muted-foreground">
                        Delivery: ${store.deliveryFee.toFixed(2)}
                        {store.minimumOrder && ` (min $${store.minimumOrder.toFixed(2)})`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No nearby stores found</h3>
                <p className="text-muted-foreground">
                  Connect to store providers to see nearby locations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connected Stores Tab */}
        <TabsContent value="connected" className="space-y-4">
          {connectedStores.length > 0 ? (
            <div className="space-y-4">
              {connectedStores.map((connection) => {
                const provider = supportedProviders.find(p => p.id === connection.providerId)
                
                return (
                  <Card key={connection.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {provider && (
                            <img 
                              src={provider.logo} 
                              alt={provider.displayName}
                              className="w-6 h-6"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {provider?.displayName || connection.providerId}
                          {connection.preferences.isDefault && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnectStore(connection.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Auto-populate cart</label>
                            <Switch
                              checked={connection.preferences.autoPopulateCart}
                              onCheckedChange={(checked) => 
                                updateStorePreferences(connection.id, { autoPopulateCart: checked })
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Price alerts</label>
                            <Switch
                              checked={connection.preferences.priceAlerts}
                              onCheckedChange={(checked) => 
                                updateStorePreferences(connection.id, { priceAlerts: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Set as default</label>
                            <Switch
                              checked={connection.preferences.isDefault}
                              onCheckedChange={(checked) => 
                                updateStorePreferences(connection.id, { isDefault: checked })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Delivery preference</label>
                            <select 
                              value={connection.preferences.deliveryPreference}
                              onChange={(e) => 
                                updateStorePreferences(connection.id, { 
                                  deliveryPreference: e.target.value 
                                })
                              }
                              className="w-full mt-1 p-2 border rounded-md text-sm"
                            >
                              <option value="delivery">Delivery only</option>
                              <option value="pickup">Pickup only</option>
                              <option value="both">Both delivery & pickup</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={connection.preferences.priority}
                              onChange={(e) => 
                                updateStorePreferences(connection.id, { 
                                  priority: parseInt(e.target.value) || 1 
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Connected: {connection.createdAt.toLocaleDateString()}
                        {connection.updatedAt > connection.createdAt && (
                          <span> • Updated: {connection.updatedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <StoreIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No connected stores</h3>
                <p className="text-muted-foreground mb-4">
                  Connect to store providers to start automated shopping
                </p>
                <Button onClick={() => {
                  const firstProvider = supportedProviders.find(p => p.supported)
                  if (firstProvider) handleConnectStore(firstProvider)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Store
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Store Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Connect to {selectedProvider?.displayName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your {selectedProvider?.displayName} account to enable automated shopping features.
            </p>
            
            {/* Demo connection form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setShowConnectDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleStoreConnection({ 
                  email: 'demo@example.com', 
                  password: 'demo' 
                })}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}