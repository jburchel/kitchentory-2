# Troubleshooting Guide - Modern Stack

## Overview

This comprehensive troubleshooting guide covers common issues and solutions for the Kitchentory modern stack: NextJS 14+ App Router, Convex real-time backend, Clerk authentication, shadcn/ui components, TailwindCSS styling, and Vercel deployment.

## Quick Diagnosis Tools

### Development Environment Check

```bash
# Run full system health check
npm run health-check

# Individual service checks
npx convex dev --check-connection
npx clerk-cli status
npm run type-check
```

### Environment Variables Validator

```typescript
// src/lib/env-validator.ts
import { z } from 'zod';

const envSchema = z.object({
  CONVEX_DEPLOYMENT: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
});

export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables valid');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}
```

## 1. Convex Backend Issues

### 1.1 Connection Problems

#### Symptom: "Failed to connect to Convex"

```typescript
// Debug connection issues
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: process.env.NODE_ENV === 'development',
});

// Add connection event listeners
convex.connectionState().subscribe((state) => {
  console.log('Convex connection state:', state);
  if (state.hasInflightRequests) {
    console.log('Pending requests:', state.outstandingRequests);
  }
});
```

**Solutions:**
1. **Check Environment Variables**
   ```bash
   # Verify CONVEX_URL is correct
   echo $NEXT_PUBLIC_CONVEX_URL
   
   # Should match: https://your-deployment.convex.cloud
   npx convex env get CONVEX_URL
   ```

2. **Network Connectivity**
   ```bash
   # Test direct connection
   curl -I https://your-deployment.convex.cloud/_system/ping
   
   # Check for corporate firewall/proxy issues
   npm config get proxy
   ```

3. **Development Server Issues**
   ```bash
   # Restart Convex dev server
   npx convex dev --clear
   
   # Check for port conflicts
   lsof -ti:3000,8080,3001
   ```

### 1.2 Function Execution Errors

#### Symptom: "ConvexError: Function failed"

```typescript
// Enhanced error handling in Convex functions
import { ConvexError } from 'convex/values';

export const addInventoryItem = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    try {
      // Function implementation
    } catch (error) {
      console.error('Mutation failed:', error);
      
      // Provide specific error messages
      if (error.message.includes('duplicate')) {
        throw new ConvexError('Item already exists in inventory');
      }
      
      throw new ConvexError(`Failed to add item: ${error.message}`);
    }
  },
});
```

**Common Issues & Solutions:**

1. **Authentication Required**
   ```typescript
   // Always check authentication in functions
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) {
     throw new ConvexError('Authentication required');
   }
   ```

2. **Invalid Arguments**
   ```bash
   # Test function with curl
   npx convex run myFunction --arg '{"field":"value"}'
   
   # Check function logs
   npx convex logs --tail --function myFunction
   ```

3. **Timeout Issues**
   ```typescript
   // For long-running operations, use actions
   export const longRunningTask = action({
     args: { /* ... */ },
     handler: async (ctx, args) => {
       // Use ctx.runMutation() or ctx.runQuery() 
       // to call other functions
     },
   });
   ```

### 1.3 Real-time Subscription Issues

#### Symptom: "UI not updating with real-time changes"

```typescript
// Debug subscription issues
import { useQuery } from 'convex/react';
import { useEffect } from 'react';

export function DebugSubscription() {
  const data = useQuery(api.inventory.list);
  
  useEffect(() => {
    console.log('Query data updated:', {
      hasData: !!data,
      length: data?.length,
      timestamp: new Date().toISOString()
    });
  }, [data]);

  return null;
}
```

**Solutions:**

1. **Subscription Not Triggered**
   ```typescript
   // Ensure queries are reactive
   const items = useQuery(api.inventory.list, { userId: user.id });
   
   // Not reactive (won't update):
   // const items = await convex.query(api.inventory.list);
   ```

2. **Component Not Re-rendering**
   ```typescript
   // Use React dev tools to check re-renders
   const [renderCount, setRenderCount] = useState(0);
   useEffect(() => {
     setRenderCount(c => c + 1);
   });
   
   console.log('Component render count:', renderCount);
   ```

3. **Network Issues**
   ```bash
   # Check WebSocket connection in browser dev tools
   # Network tab -> WS filter -> Look for convex connections
   
   # Test with manual refresh
   window.location.reload();
   ```

## 2. Clerk Authentication Issues

### 2.1 SSR Hydration Mismatches

#### Symptom: "Hydration failed" or "Text content does not match"

```typescript
// Fix hydration issues with proper auth guards
import { useAuth } from '@clerk/nextjs';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted || !isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <SignInButton />;
  }

  return <>{children}</>;
}
```

**Solutions:**

1. **Dynamic Imports for Auth Components**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const AuthenticatedContent = dynamic(
     () => import('@/components/AuthenticatedContent'),
     { 
       ssr: false,
       loading: () => <div>Loading...</div>
     }
   );
   ```

2. **Proper Middleware Configuration**
   ```typescript
   // middleware.ts
   import { authMiddleware } from "@clerk/nextjs";
   
   export default authMiddleware({
     publicRoutes: ["/", "/api/webhooks/(.*)"],
     ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)"],
   });
   
   export const config = {
     matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
   };
   ```

### 2.2 Session Synchronization Issues

#### Symptom: "User logged in but Convex queries fail"

```typescript
// Debug Clerk + Convex integration
import { useAuth } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';

export function AuthDebugger() {
  const clerkAuth = useAuth();
  const convexAuth = useConvexAuth();
  
  useEffect(() => {
    console.log('Clerk auth:', {
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn,
      userId: clerkAuth.userId,
    });
    
    console.log('Convex auth:', {
      isLoading: convexAuth.isLoading,
      isAuthenticated: convexAuth.isAuthenticated,
    });
    
    // Check token sync
    clerkAuth.getToken({ template: 'convex' }).then(token => {
      console.log('Convex token valid:', !!token);
    });
  }, [clerkAuth, convexAuth]);

  return null;
}
```

**Solutions:**

1. **JWT Template Configuration**
   ```typescript
   // In Clerk Dashboard > JWT Templates
   // Create "convex" template with claims:
   {
     "aud": "convex",
     "iss": "https://your-app.clerk.accounts.dev",
     "sub": "{{user.id}}",
     "iat": {{date.unix}},
     "exp": {{date.unix + 3600}}
   }
   ```

2. **ConvexProviderWithClerk Setup**
   ```typescript
   // app/layout.tsx
   import { ConvexProviderWithClerk } from 'convex/react-clerk';
   import { ClerkProvider, useAuth } from '@clerk/nextjs';

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
         <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
           {children}
         </ConvexProviderWithClerk>
       </ClerkProvider>
     );
   }
   ```

### 2.3 Sign-in/Sign-up Flow Issues

#### Symptom: "Redirects not working" or "Sign-in modal not appearing"

```typescript
// Custom sign-in component with error handling
import { SignIn, SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function AuthModal({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  
  const handleSuccess = () => {
    console.log('Auth success, redirecting...');
    router.push('/dashboard');
  };
  
  const handleError = (error: any) => {
    console.error('Auth error:', error);
    // Handle specific error cases
  };
  
  return (
    <div className="auth-modal">
      {mode === 'signin' ? (
        <SignIn
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      ) : (
        <SignUp
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
```

## 3. NextJS App Router Issues

### 3.1 Route Caching Problems

#### Symptom: "Page shows stale data" or "Changes not reflected"

```typescript
// Force dynamic rendering for specific routes
// app/inventory/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function InventoryPage() {
  // Page content
}
```

**Solutions:**

1. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

2. **Router Cache Management**
   ```typescript
   import { useRouter } from 'next/navigation';
   
   const router = useRouter();
   
   // Force refresh after mutation
   const handleUpdate = async () => {
     await updateItem();
     router.refresh(); // Clear router cache
   };
   ```

3. **Server Component Caching**
   ```typescript
   // Disable caching for dynamic data
   const { cache } = await import('react');
   
   const getData = cache(async () => {
     const data = await fetch('/api/data', { 
       cache: 'no-store' // Disable caching
     });
     return data.json();
   });
   ```

### 3.2 Server vs Client Component Issues

#### Symptom: "You're importing a component that needs X. It only works in a Client Component"

```typescript
// Fix server/client boundary issues
'use client'; // Add to client components

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';

export function ClientInventoryList() {
  const items = useQuery(api.inventory.list);
  
  // Client-side logic here
}

// Keep server components separate
export function ServerInventoryHeader() {
  // Server-side logic, no hooks
  return <h1>Inventory</h1>;
}
```

**Solutions:**

1. **Component Architecture**
   ```typescript
   // app/inventory/page.tsx (Server Component)
   import { ServerInventoryHeader } from '@/components/ServerInventoryHeader';
   import { ClientInventoryList } from '@/components/ClientInventoryList';
   
   export default function InventoryPage() {
     return (
       <div>
         <ServerInventoryHeader />
         <ClientInventoryList />
       </div>
     );
   }
   ```

2. **Dynamic Imports**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const DynamicComponent = dynamic(
     () => import('@/components/ClientComponent'),
     { ssr: false }
   );
   ```

### 3.3 Route Handler Issues

#### Symptom: "API route not found" or "405 Method Not Allowed"

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle webhook
    console.log('Webhook received:', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Export other methods as needed
export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint active' });
}
```

## 4. shadcn/ui Component Issues

### 4.1 Component Import Errors

#### Symptom: "Module not found" or "Component undefined"

```typescript
// Check component installation
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// If missing, install:
// npx shadcn-ui@latest add button card
```

**Solutions:**

1. **Verify Component Files**
   ```bash
   ls -la src/components/ui/
   # Should contain button.tsx, card.tsx, etc.
   ```

2. **Check Import Paths**
   ```typescript
   // Verify path aliases in tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Component Registry**
   ```bash
   # Reinstall specific component
   npx shadcn-ui@latest add button --overwrite
   ```

### 4.2 Styling Issues

#### Symptom: "Component not styled" or "CSS not applied"

```typescript
// Check TailwindCSS configuration
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // shadcn/ui theme variables
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

**Solutions:**

1. **CSS Import Order**
   ```css
   /* app/globals.css */
   @tailwind base;
   @tailwind components; 
   @tailwind utilities;
   
   /* shadcn/ui variables */
   @layer base {
     :root {
       /* CSS variables */
     }
   }
   ```

2. **Dark Mode Issues**
   ```typescript
   // app/layout.tsx
   import { ThemeProvider } from '@/components/theme-provider';
   
   export default function RootLayout({ children }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <body>
           <ThemeProvider>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

## 5. Vercel Deployment Issues

### 5.1 Build Failures

#### Symptom: "Build failed" or "Type errors in production"

```bash
# Local production build test
npm run build

# Check build output
ls -la .next/

# Analyze bundle
ANALYZE=true npm run build
```

**Solutions:**

1. **TypeScript Strict Mode**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noUnusedLocals": false, // Temporary for build
       "noUnusedParameters": false
     }
   }
   ```

2. **Environment Variables**
   ```bash
   # Verify all required env vars are set in Vercel
   vercel env ls
   
   # Add missing variables
   vercel env add CONVEX_DEPLOYMENT
   ```

### 5.2 Function Timeout Issues

#### Symptom: "Function execution timed out"

```typescript
// Optimize slow API routes
export const maxDuration = 30; // seconds
export const runtime = 'nodejs18';

export async function POST(request: NextRequest) {
  // Implement timeout handling
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 25000)
  );
  
  try {
    const result = await Promise.race([
      processRequest(request),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error('Function timeout:', error);
    return NextResponse.json(
      { error: 'Request timeout' },
      { status: 408 }
    );
  }
}
```

## Emergency Recovery Procedures

### 1. Complete Development Reset

```bash
#!/bin/bash
# reset-dev-environment.sh

echo "🚨 Resetting development environment..."

# Clear all caches
rm -rf node_modules .next .convex-cache
npm cache clean --force

# Reinstall dependencies
npm install

# Reset Convex
npx convex dev --clear --yes

# Restart development servers
npm run dev &
npx convex dev &

echo "✅ Development environment reset complete"
```

### 2. Production Rollback

```bash
# Rollback Convex deployment
npx convex rollback --deployment prod:my-app

# Rollback Vercel deployment
vercel rollback https://my-app.vercel.app

# Check deployment status
vercel ls
npx convex deployments list
```

### 3. Database Recovery

```bash
# Export Convex data (backup)
npx convex export --format jsonl > backup.jsonl

# Import data (restore)
npx convex import backup.jsonl
```

## Support Escalation

### When to Contact Support

1. **Convex Issues**: Platform-wide outages, billing issues
2. **Clerk Issues**: Authentication provider problems, JWT issues
3. **Vercel Issues**: Platform deployment failures, domain issues

### Information to Provide

```typescript
// Generate diagnostic report
export function generateDiagnostics() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    versions: {
      node: process.version,
      next: require('next/package.json').version,
      convex: require('convex/package.json').version,
      clerk: require('@clerk/nextjs/package.json').version,
    },
    deployment: {
      convex: process.env.CONVEX_DEPLOYMENT,
      vercel: process.env.VERCEL_URL,
    },
    // Add relevant error logs
  };
  
  console.log('Diagnostic Report:', JSON.stringify(report, null, 2));
  return report;
}
```

This troubleshooting guide provides systematic approaches to diagnose and resolve issues in the modern Convex + NextJS + Clerk stack, ensuring minimal downtime and rapid issue resolution.