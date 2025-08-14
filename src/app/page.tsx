'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(process.env.NODE_ENV === 'development')
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  // In development, show fallback immediately to bypass Clerk loading
  useEffect(() => {
    if (isDevelopment) {
      setShowFallback(true)
      return
    }
    
    const timeout = setTimeout(() => {
      console.log('Clerk loading timeout, showing fallback. isLoaded:', isLoaded)
      setShowFallback(true)
    }, 1500) // 1.5s in production

    if (isLoaded) {
      console.log('Clerk loaded successfully')
      clearTimeout(timeout)
    }

    return () => clearTimeout(timeout)
  }, [isLoaded, isDevelopment])
  
  // Debug effect
  useEffect(() => {
    console.log('Clerk auth state:', { isLoaded, isSignedIn, showFallback })
  }, [isLoaded, isSignedIn, showFallback])

  // Show loading while checking auth state (with timeout fallback)
  if (!isLoaded && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading Kitchentory...</p>
          <p className="mt-2 text-sm text-gray-400">
            Initializing authentication... (fallback in {2 - Math.floor((Date.now() % 2000) / 1000)}s)
          </p>
          <button 
            onClick={() => setShowFallback(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
          >
            Skip to App
          </button>
        </div>
      </div>
    )
  }

  // If user is signed in, show brief loading state while redirecting
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to Kitchentory
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-gray-600">
          Your intelligent kitchen inventory management system. Keep track of
          ingredients, plan meals, and never run out of essentials again.
        </p>

        <div className="mb-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Track Inventory</h3>
            <p className="text-gray-600">
              Monitor your ingredients and get alerts when running low
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Plan Meals</h3>
            <p className="text-gray-600">
              Create meal plans based on your available ingredients
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Smart Shopping</h3>
            <p className="text-gray-600">
              Generate shopping lists automatically based on your needs
            </p>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}