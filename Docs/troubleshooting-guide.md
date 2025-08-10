# Kitchentory Troubleshooting Guide

This guide helps diagnose and resolve common issues with Kitchentory's modern Progressive Web App built on NextJS 14+, Convex, and Clerk.

## Table of Contents

1. [General Troubleshooting](#general-troubleshooting)
2. [PWA Installation Issues](#pwa-installation-issues)
3. [Clerk Authentication Problems](#clerk-authentication-problems)
4. [Convex Real-Time Sync Issues](#convex-real-time-sync-issues)
5. [Performance Problems](#performance-problems)
6. [Offline Functionality Issues](#offline-functionality-issues)
7. [Mobile & Touch Issues](#mobile--touch-issues)
8. [Vercel Deployment Problems](#vercel-deployment-problems)
9. [Data Import/Export Issues](#data-importexport-issues)
10. [Browser Compatibility](#browser-compatibility)

## General Troubleshooting

### Check System Status

First, verify that all services are operational:

1. **Application Status**: Visit [status.kitchentory.app](https://status.kitchentory.app)
2. **Vercel Status**: Check [vercel-status.com](https://vercel-status.com)
3. **Convex Status**: Visit [status.convex.dev](https://status.convex.dev)
4. **Clerk Status**: Check [status.clerk.dev](https://status.clerk.dev)

### Health Check Endpoints

```bash
# Check application health
curl https://yourdomain.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "convex": "connected",
    "clerk": "authenticated",
    "vercel": "deployed"
  }
}
```

### Browser Developer Tools

Open browser developer tools (F12) and check:

1. **Console tab** - Look for JavaScript errors
2. **Network tab** - Monitor API calls and sync status
3. **Application tab** - Check PWA installation and service worker
4. **Performance tab** - Identify slow operations

## PWA Installation Issues

### PWA Not Installing

**Problem**: "Add to Home Screen" option not appearing

**Check Requirements**:

- ✅ HTTPS connection (required)
- ✅ Web manifest present at `/manifest.json`
- ✅ Service worker registered
- ✅ Minimum required icons available

**Diagnosis**:

```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations);
  });
}

// Check manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => console.log('Manifest:', manifest));
```

**Solutions**:

1. **Clear Browser Cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Safari: Develop → Empty Caches (or Cmd+Opt+E)
   - Firefox: Settings → Privacy → Clear Data

2. **Check Browser Support**:
   - **iOS**: Use Safari (Chrome iOS doesn't support PWA installation)
   - **Android**: Chrome or Edge recommended
   - **Desktop**: Chrome, Edge, or Firefox

3. **Force PWA Criteria**:
   - Visit site multiple times over several days
   - Interact with site for at least 30 seconds
   - Ensure stable internet connection during visits

### PWA Installation Fails

**Problem**: Installation starts but fails to complete

**Solutions**:

1. **Check Available Storage**:
2. 
```javascript
// Check storage quota
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    console.log('Storage quota:', estimate.quota);
    console.log('Storage usage:', estimate.usage);
  });
}
```

1. **Verify Manifest.json**:
2. 
```json
{
  "name": "Kitchentory",
  "short_name": "Kitchentory",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

1. **Reset PWA Installation**:
   - Uninstall existing PWA
   - Clear browser data for the site
   - Wait 24 hours before reinstalling

## Clerk Authentication Problems

### Login Issues

**Problem**: Cannot sign in with valid credentials

**Diagnosis**:

```javascript
// Check Clerk configuration
console.log('Clerk publishable key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Check authentication state
import { useAuth } from '@clerk/nextjs';
const { isSignedIn, userId, sessionId } = useAuth();
console.log('Auth state:', { isSignedIn, userId, sessionId });
```

**Solutions**:

1. **Clear Authentication Cache**:
   - Sign out completely
   - Clear browser cookies for the domain
   - Clear localStorage: `localStorage.clear()`
   - Clear sessionStorage: `sessionStorage.clear()`

2. **Check Network Connectivity**:

```bash
# Test Clerk API connectivity
curl -I https://api.clerk.dev/v1/sessions

# Should return 200 OK
```

3. **Verify Environment Variables**:

```bash
# Check Next.js configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### OAuth Provider Issues

**Problem**: Social login (Google, GitHub) not working

**Solutions**:

1. **Check OAuth Configuration**:
   - Verify redirect URLs in OAuth provider settings
   - Ensure domains are properly configured
   - Check for HTTPS requirement

2. **Browser Popup Blockers**:
   - Disable popup blockers for the site
   - Try different browser
   - Use incognito/private mode

3. **Third-Party Cookies**:
   - Enable third-party cookies
   - Check browser privacy settings
   - Try disabling tracking protection temporarily

### Session Expires Frequently

**Problem**: Users logged out unexpectedly

**Solutions**:

1. **Check Session Configuration**:

```javascript
// In Clerk dashboard, verify session settings
// Session timeout: 7 days (recommended)
// Require authentication for: All pages
// Inactivity timeout: 30 days
```

1. **Browser Storage Issues**:
   - Check if cookies are enabled
   - Verify localStorage is available
   - Check for browser security extensions

## Convex Real-Time Sync Issues

### Sync Not Working

**Problem**: Changes not appearing in real-time across devices

**Diagnosis**:

```javascript
// Check Convex connection status
import { useQuery } from "convex/react";

function ConnectionStatus() {
  const status = useQuery("internal.connectionStatus");
  console.log('Convex connection:', status);
}
```

**Solutions**:

1. **Check WebSocket Connection**:

```javascript
// In browser developer tools
// Network tab → WS (WebSocket) filter
// Should see active WebSocket connection to convex.cloud
```

1. **Network Configuration**:
   - Check firewall settings for WebSocket connections
   - Verify proxy settings don't block WebSockets
   - Test on different network (cellular vs WiFi)

2. **Convex Function Errors**:

```bash
# Check Convex logs
npx convex logs

# Look for function errors or timeouts
```

### Slow Sync Performance

**Problem**: Updates take too long to propagate

**Solutions**:

1. **Optimize Convex Queries**:

```typescript
// Bad: Fetches all data
export const getAllItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("inventoryItems").collect();
  }
});

// Good: Paginated with limits
export const getItems = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("inventoryItems")
      .order("desc")
      .take(args.limit);
  }
});
```

1. **Check Network Quality**:

```javascript
// Monitor connection quality
if ('connection' in navigator) {
  const connection = navigator.connection;
  console.log('Connection type:', connection.effectiveType);
  console.log('Downlink:', connection.downlink);
}
```

1. **Reduce Data Size**:
   - Use pagination for large lists
   - Implement virtual scrolling
   - Cache frequently accessed data

### Offline-Online Sync Conflicts

**Problem**: Conflicting changes when coming back online

**Solutions**:

1. **Implement Conflict Resolution**:

```typescript
// Optimistic updates with conflict handling
export const updateItem = mutation({
  args: { id: v.id("inventoryItems"), updates: v.object({...}) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Item not found");
    }
    
    // Check for conflicts using timestamps
    if (args.updates.lastModified < existing.lastModified) {
      throw new Error("Conflict: Item was modified by another user");
    }
    
    return await ctx.db.patch(args.id, {
      ...args.updates,
      lastModified: Date.now()
    });
  }
});
```

1. **Show Conflict UI**:
   - Display merge options to users
   - Allow manual conflict resolution
   - Provide "keep both" options where appropriate

## Performance Problems

### Slow Page Loading

**Problem**: Pages take too long to load

**Diagnosis**:

```bash
# Check Core Web Vitals
npx lighthouse https://yourdomain.com --view

# Look for:
# - First Contentful Paint (FCP) < 2.5s
# - Largest Contentful Paint (LCP) < 2.5s
# - Cumulative Layout Shift (CLS) < 0.1
```

**Solutions**:

1. **NextJS 14+ Optimizations**:

```typescript
// Use App Router with Server Components
// app/page.tsx
export default async function HomePage() {
  // Server component - renders on server
  const data = await getServerData();
  
  return (
    <div>
      <ServerComponent data={data} />
      <ClientComponent />
    </div>
  );
}
```

1. **Image Optimization**:

```typescript
import Image from 'next/image';

// Optimized images with Next.js
<Image
  src="/product-image.jpg"
  alt="Product"
  width={300}
  height={200}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

1. **Code Splitting & Lazy Loading**:

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### High Memory Usage

**Problem**: App consuming too much memory

**Solutions**:

1. **React DevTools Profiler**:
   - Install React DevTools browser extension
   - Use Profiler tab to identify memory leaks
   - Look for components that don't unmount properly

2. **Optimize Re-renders**:

```typescript
import { memo, useCallback, useMemo } from 'react';

// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// Memoize callbacks
const MyComponent = ({ onUpdate }) => {
  const handleClick = useCallback(() => {
    onUpdate(newData);
  }, [onUpdate]);
  
  return <button onClick={handleClick}>Update</button>;
};
```

1. **Convex Query Optimization**:

```typescript
// Use query invalidation instead of polling
const items = useQuery(api.inventory.list);

// Invalidate specific queries instead of refetching all
const updateItem = useMutation(api.inventory.update);
```

## Offline Functionality Issues

### Offline Mode Not Working

**Problem**: App doesn't work without internet

**Diagnosis**:

```javascript
// Check service worker status
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker ready:', registration);
});

// Check cache storage
caches.keys().then(cacheNames => {
  console.log('Available caches:', cacheNames);
});
```

**Solutions**:

1. **Service Worker Registration**:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.convex\.dev/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'convex-cache',
        networkTimeoutSeconds: 3,
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

1. **Cache Strategy Implementation**:

```javascript
// Cache API responses for offline use
const cacheResponse = async (request, response) => {
  const cache = await caches.open('api-cache-v1');
  await cache.put(request, response.clone());
  return response;
};

// Serve from cache when offline
const getCachedResponse = async (request) => {
  const cache = await caches.open('api-cache-v1');
  return await cache.match(request);
};
```

### Sync Issues After Returning Online

**Problem**: Changes made offline not syncing properly

**Solutions**:

1. **Implement Queue System**:

```typescript
// Store offline operations
const queueOperation = (operation) => {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  queue.push({
    ...operation,
    timestamp: Date.now(),
    id: crypto.randomUUID()
  });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

// Process queue when online
const processQueue = async () => {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  
  for (const operation of queue) {
    try {
      await executeOperation(operation);
      // Remove from queue on success
      removeFromQueue(operation.id);
    } catch (error) {
      console.error('Failed to sync operation:', operation, error);
    }
  }
};
```

1. **Handle Network State Changes**:

```typescript
useEffect(() => {
  const handleOnline = () => {
    console.log('Back online');
    processQueue();
  };
  
  const handleOffline = () => {
    console.log('Gone offline');
    // Switch to offline mode
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

## Mobile & Touch Issues

### Touch Responsiveness Problems

**Problem**: Touch interactions feel sluggish or unresponsive

**Solutions**:

1. **Optimize Touch Events**:

```css
/* Improve touch responsiveness */
.touch-target {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  min-width: 44px;
}

/* Remove 300ms click delay */
* {
  touch-action: manipulation;
}
```

1. **Use shadcn/ui Touch-Optimized Components**:

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Components are pre-optimized for touch
<Button 
  size="lg" // Larger touch targets
  variant="default"
  className="min-h-[44px]" // iOS recommended minimum
>
  Tap me
</Button>
```

### Keyboard Issues on Mobile

**Problem**: Virtual keyboard causes layout issues

**Solutions**:

1. **Viewport Handling**:

```css
/* Fix viewport units with dynamic viewport */
.full-height {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
}

/* Prevent zoom on input focus */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

1. **Keyboard Event Handling**:

```typescript
useEffect(() => {
  const handleVisualViewportChange = () => {
    if (window.visualViewport) {
      document.body.style.height = 
        `${window.visualViewport.height}px`;
    }
  };
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      'resize', 
      handleVisualViewportChange
    );
  }
  
  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener(
        'resize',
        handleVisualViewportChange
      );
    }
  };
}, []);
```

### Camera/Scanner Issues

**Problem**: Barcode scanner not working on mobile

**Solutions**:

1. **Camera Permissions**:

```typescript
const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Camera access granted
    return stream;
  } catch (error) {
    console.error('Camera access denied:', error);
    throw error;
  }
};
```

1. **Barcode Scanner Optimization**:

```typescript
import { Html5QrcodeScanner } from 'html5-qrcode';

const scanner = new Html5QrcodeScanner('scanner', {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  showTorchButtonIfSupported: true,
  showZoomSliderIfSupported: true,
});
```

## Vercel Deployment Problems

### Build Failures

**Problem**: Deployment fails during build process

**Diagnosis**:
```bash
# Check build logs in Vercel dashboard
# Or run locally:
npm run build

# Check for:
# - TypeScript errors
# - Missing environment variables
# - Import/export issues
```

**Solutions**:

1. **Fix TypeScript Errors**:

```typescript
// Ensure all types are properly defined
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  // Add all required properties
}

// Use proper typing for Convex queries
export const getItems = query({
  args: {},
  handler: async (ctx): Promise<InventoryItem[]> => {
    return await ctx.db.query("inventoryItems").collect();
  }
});
```

1. **Environment Variables**:

```bash
# .env.local (for local development)
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Ensure same variables are set in Vercel dashboard
```

3. **Next.js Configuration**:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['images.clerk.dev'],
  },
};

module.exports = nextConfig;
```

### Runtime Errors

**Problem**: App builds successfully but crashes at runtime

**Solutions**:

1. **Check Function Logs**:

```bash
# View Vercel function logs
vercel logs --follow

# Look for uncaught exceptions and API errors
```

2. **Error Boundary Implementation**:

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## Data Import/Export Issues

### CSV Import Problems

**Problem**: Data import fails or produces incorrect results

**Solutions**:

1. **Validate CSV Format**:

```typescript
// Proper CSV validation
const validateCsvRow = (row: any): boolean => {
  const required = ['name', 'quantity', 'category'];
  return required.every(field => field in row && row[field]);
};

const processCsvImport = async (csvData: string) => {
  const rows = csvData.split('\n').map(row => row.split(','));
  const headers = rows[0];
  
  for (let i = 1; i < rows.length; i++) {
    const row = Object.fromEntries(
      headers.map((header, index) => [header, rows[i][index]])
    );
    
    if (validateCsvRow(row)) {
      await createInventoryItem(row);
    }
  }
};
```

1. **Handle Encoding Issues**:

```typescript
// Handle different text encodings
const readFileWithEncoding = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
};
```

### Export Functionality Issues

**Problem**: Data export not working or incomplete

**Solutions**:

1. **Implement Reliable Export**:

```typescript
const exportData = async () => {
  try {
    const data = await fetch('/api/export').then(res => res.json());
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitchentory-export-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

## Browser Compatibility

### Safari Issues

**Problem**: Features not working properly in Safari

**Solutions**:

1. **Safari-Specific Fixes**:

```css
/* Fix Safari viewport issues */
body {
  -webkit-overflow-scrolling: touch;
}

/* Fix Safari button styling */
button {
  -webkit-appearance: none;
}
```

1. **JavaScript Polyfills**:

```typescript
// Check for Safari-specific issues
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // Implement Safari-specific workarounds
}
```

### Chrome iOS Limitations

**Problem**: Limited PWA features in Chrome iOS

**Solutions**:

1. **Detect iOS Chrome**:

```typescript
const isIOSChrome = /CriOS/.test(navigator.userAgent);

if (isIOSChrome) {
  // Show message to use Safari for full PWA features
  showSafariRecommendation();
}
```

1. **Graceful Feature Degradation**:

```typescript
const checkPWASupport = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSChrome = /CriOS/.test(navigator.userAgent);
  
  if (isIOSChrome && !isStandalone) {
    // Provide alternative mobile experience
    return false;
  }
  
  return true;
};
```

## Emergency Recovery

### Complete System Recovery

If the application is completely broken:

1. **Check Service Status**:
   - Vercel deployment status
   - Convex database connectivity
   - Clerk authentication service

2. **Rollback Strategy**:

```bash
# Rollback to previous Vercel deployment
vercel rollback

# Check Convex function history
npx convex logs --tail

# Verify Clerk webhook endpoints
```

3. **Data Recovery**:

   - Convex automatically backs up data
   - Export user data before major changes
   - Use Convex dashboard to inspect data integrity

### Contact Support

For persistent issues:

- **Email**: support@kitchentory.app

- **Discord**: Join our development community
- **GitHub**: Report issues at github.com/kitchentory/app
- **Status Page**: Check status.kitchentory.app

### Support Request Information

Include in your support request:

- Browser type and version
- Device type (mobile/desktop)
- Operating system
- Error messages and screenshots
- Steps to reproduce the issue
- Network conditions (WiFi/cellular)
- PWA installation status

---

**Need immediate help?** Join our Discord community for real-time support from developers and power users.

This troubleshooting guide covers the most common issues with Kitchentory's modern tech stack. The real-time nature of Convex, combined with NextJS 14+ performance and PWA capabilities, provides a robust foundation that handles most issues automatically.