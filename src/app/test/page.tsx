'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log('Test page mounted successfully')
      setMounted(true)
    } catch (err) {
      console.error('Test page error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Test Page Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Loading Test Page...</h1>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">✅ Test Page Working</h1>
      <p className="mt-4">If you can see this styled page, then:</p>
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li>Next.js is working</li>
        <li>Tailwind CSS is loading</li>
        <li>Client-side hydration is working</li>
        <li>No critical JavaScript errors</li>
      </ul>
      
      <div className="mt-8 p-4 bg-blue-100 rounded">
        <p className="text-blue-800">
          Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
        </p>
        <p className="text-blue-800">
          Environment: {process.env.NODE_ENV}
        </p>
      </div>
    </div>
  )
}