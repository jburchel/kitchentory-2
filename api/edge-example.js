// Example Vercel Edge Function
// This file demonstrates how to create edge functions for Vercel deployment

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'World'

  return new Response(
    JSON.stringify({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
      location: request.headers.get('x-vercel-ip-city') || 'Unknown',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60',
      },
    }
  )
}

// Usage: https://your-app.vercel.app/api/edge-example?name=Kitchentory
