'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react'

export default function DebugPage() {
  const [mounted, setMounted] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  React.useEffect(() => {
    setMounted(true)
    
    // Test core imports
    try {
      console.log('Testing core components...')
      
      // Test store services
      import('@/services/StoreAPIManager').then(() => {
        console.log('✅ StoreAPIManager loaded')
      }).catch(err => {
        console.error('❌ StoreAPIManager failed:', err)
        setErrors(prev => [...prev, `StoreAPIManager: ${err.message}`])
      })
      
      import('@/services/ReceiptOCRService').then(() => {
        console.log('✅ ReceiptOCRService loaded')
      }).catch(err => {
        console.error('❌ ReceiptOCRService failed:', err)
        setErrors(prev => [...prev, `ReceiptOCRService: ${err.message}`])
      })
      
      import('@/services/OrderCompletionService').then(() => {
        console.log('✅ OrderCompletionService loaded')
      }).catch(err => {
        console.error('❌ OrderCompletionService failed:', err)
        setErrors(prev => [...prev, `OrderCompletionService: ${err.message}`])
      })
      
      // Test store components
      import('@/components/stores/StoreSelectionDashboard').then(() => {
        console.log('✅ StoreSelectionDashboard loaded')
      }).catch(err => {
        console.error('❌ StoreSelectionDashboard failed:', err)
        setErrors(prev => [...prev, `StoreSelectionDashboard: ${err.message}`])
      })
      
    } catch (error) {
      console.error('Debug test failed:', error)
      setErrors(prev => [...prev, `General error: ${error}`])
    }
  }, [])

  if (!mounted) {
    return <div>Loading debug page...</div>
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Debug Page
          </h1>
          <p className="text-muted-foreground">
            Testing Phase 1 components and services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Component Loading Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Debug page rendered successfully</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>React hooks working</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>UI components rendering</span>
            </div>
            
            {errors.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>All core services loading</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600">Service loading errors detected</span>
                </div>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                      <code className="text-sm text-red-700">{error}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Page loaded at:</p>
                <p className="text-sm text-muted-foreground">{new Date().toISOString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User Agent:</p>
                <p className="text-sm text-muted-foreground">{navigator.userAgent.slice(0, 50)}...</p>
              </div>
              <div>
                <p className="text-sm font-medium">URL:</p>
                <p className="text-sm text-muted-foreground">{window.location.href}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Console errors:</p>
                <Badge variant={errors.length > 0 ? "destructive" : "default"}>
                  {errors.length} errors
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/inventory" 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Test Inventory Page</p>
                <p className="text-sm text-muted-foreground">Check if inventory loads</p>
              </a>
              
              <a 
                href="/shopping-lists" 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Test Shopping Lists</p>
                <p className="text-sm text-muted-foreground">Check if shopping lists load</p>
              </a>
              
              <a 
                href="/recipes" 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Test Recipes Page</p>
                <p className="text-sm text-muted-foreground">Check if recipes load</p>
              </a>
              
              <a 
                href="/" 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Test Home Page</p>
                <p className="text-sm text-muted-foreground">Check if dashboard loads</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}