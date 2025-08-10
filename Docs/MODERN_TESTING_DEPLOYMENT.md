# Testing & Deployment Guide - Modern Stack

## Overview

This guide covers testing and deployment practices for Kitchentory's modern NextJS + Convex + TypeScript + Clerk + shadcn/ui stack, focusing on automated testing, CI/CD pipelines, and production deployment strategies.

## Testing Strategy

### 1. Testing Stack

#### Core Testing Tools
- **Unit Tests**: Vitest (faster than Jest, native ESM support)
- **Component Tests**: React Testing Library + Vitest
- **E2E Tests**: Playwright (cross-browser, reliable)
- **Convex Functions**: Built-in Convex testing utilities
- **Type Checking**: TypeScript compiler (`tsc --noEmit`)
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent config

#### Testing Configuration

```json
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### 2. Testing Patterns

#### 2.1 Convex Function Testing

```typescript
// convex/inventory.test.ts
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

describe("inventory functions", () => {
  it("should add inventory item with authentication", async () => {
    const t = convexTest(schema);
    
    // Mock authenticated user
    const asUser = t.withIdentity({
      subject: "user123",
      name: "Test User"
    });
    
    // Test mutation
    const itemId = await asUser.mutation(api.inventory.add, {
      productId: "prod_123" as any,
      quantity: 5,
      expirationDate: "2024-12-31"
    });
    
    expect(itemId).toBeDefined();
    
    // Verify item was added
    const items = await asUser.query(api.inventory.list);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });
});
```

#### 2.2 React Component Testing

```typescript
// src/components/__tests__/InventoryCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InventoryCard } from '../InventoryCard';
import { ConvexProvider } from 'convex/react';
import { convexTest } from 'convex-test';

const mockConvexClient = convexTest(schema).convex;

describe('InventoryCard', () => {
  it('renders inventory item with correct data', () => {
    const mockItem = {
      _id: 'item_123' as any,
      name: 'Milk',
      quantity: 2,
      expirationDate: '2024-01-15',
      category: 'dairy'
    };

    render(
      <ConvexProvider client={mockConvexClient}>
        <InventoryCard item={mockItem} />
      </ConvexProvider>
    );

    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();
    expect(screen.getByText('Expires: 2024-01-15')).toBeInTheDocument();
  });

  it('handles quantity update optimistically', async () => {
    const mockUpdate = vi.fn();
    // Test implementation with optimistic updates
  });
});
```

#### 2.3 E2E Testing with Playwright

```typescript
// e2e/inventory.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication or use test user
    await page.goto('/');
    await page.click('[data-testid="auth-signin"]');
    // Complete auth flow
  });

  test('should add new inventory item', async ({ page }) => {
    await page.click('[data-testid="add-item-button"]');
    
    // Fill form using shadcn/ui components
    await page.fill('[data-testid="product-name"]', 'Test Product');
    await page.fill('[data-testid="quantity"]', '3');
    await page.fill('[data-testid="expiration-date"]', '2024-12-31');
    
    await page.click('[data-testid="save-item"]');
    
    // Verify real-time update
    await expect(page.locator('[data-testid="inventory-list"]')).toContainText('Test Product');
    await expect(page.locator('[data-testid="quantity-display"]')).toContainText('3');
  });

  test('should sync across multiple tabs', async ({ context }) => {
    // Test real-time synchronization
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    await page1.goto('/inventory');
    await page2.goto('/inventory');
    
    // Add item in page1
    await page1.click('[data-testid="add-item-button"]');
    // ... fill form
    
    // Verify it appears in page2 automatically
    await expect(page2.locator('[data-testid="inventory-list"]')).toContainText('New Item');
  });
});
```

### 3. Testing Best Practices

#### 3.1 Test Data Management

```typescript
// src/test-utils/fixtures.ts
export const createMockInventoryItem = (overrides = {}) => ({
  _id: 'item_' + Math.random().toString(36).substr(2, 9),
  name: 'Mock Item',
  quantity: 1,
  category: 'pantry',
  expirationDate: '2024-12-31',
  createdAt: Date.now(),
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  subject: 'user_' + Math.random().toString(36).substr(2, 9),
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

#### 3.2 Mock Strategies

```typescript
// src/test-utils/convex-mocks.ts
import { vi } from 'vitest';

export const mockConvexQuery = (queryPath: string, returnValue: any) => {
  vi.mock('convex/react', () => ({
    useQuery: vi.fn().mockImplementation((query) => {
      if (query._queryPath === queryPath) {
        return returnValue;
      }
      return undefined;
    }),
    useMutation: vi.fn().mockReturnValue(vi.fn()),
  }));
};
```

## Deployment Pipeline

### 1. CI/CD Configuration

#### 1.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Linting
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: Convex function tests
        run: npm run test:convex
        env:
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_TEST_DEPLOYMENT }}
      
      - name: Build application
        run: npm run build
      
      - name: E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: false
  
  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Convex (preview)
        run: |
          npx convex deploy --cmd "npm run build" --preview
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      
      - name: Deploy to Vercel (preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Convex (production)
        run: |
          npx convex deploy --cmd "npm run build" --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      
      - name: Deploy to Vercel (production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 1.2 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "test": "npm run test:unit && npm run test:convex",
    "test:unit": "vitest run --coverage",
    "test:convex": "vitest run --config vitest.convex.config.ts",
    "test:e2e": "playwright test",
    "test:watch": "vitest",
    "prepare": "husky install"
  }
}
```

### 2. Environment Management

#### 2.1 Environment Variables Structure

```bash
# .env.local (development)
CONVEX_DEPLOYMENT=dev:my-project-123
NEXT_PUBLIC_CONVEX_URL=https://my-project-123.convex.cloud

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true
```

```bash
# .env.production (via Vercel)
CONVEX_DEPLOYMENT=prod:my-project-456
NEXT_PUBLIC_CONVEX_URL=https://my-project-456.convex.cloud

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Analytics & Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS=true
SENTRY_DSN=https://...
```

#### 2.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/convex/:path*",
      "destination": "https://my-project.convex.cloud/:path*"
    }
  ]
}
```

### 3. Production Optimizations

#### 3.1 Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
  
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### 4. Monitoring & Analytics

#### 4.1 Error Tracking with Sentry

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.vercel\.app/],
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### 4.2 Performance Monitoring

```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function AnalyticsProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

### 5. Troubleshooting Common Issues

#### 5.1 Convex Deployment Issues

```bash
# Clear Convex cache
npx convex dev --clear

# Debug function execution
npx convex logs --tail

# Test function locally
npx convex run inventory:list --arg '{"userId":"test"}'
```

#### 5.2 NextJS Build Problems

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Analyze bundle size
ANALYZE=true npm run build

# Debug production build
npm run start
```

#### 5.3 Authentication Issues

```typescript
// Debug Clerk authentication state
import { useAuth } from '@clerk/nextjs';

export function AuthDebug() {
  const { isSignedIn, userId, getToken } = useAuth();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth state:', { isSignedIn, userId });
    getToken().then(token => console.log('Convex token:', token));
  }
  
  return null;
}
```

## Testing Checklist

### Pre-deployment
- [ ] All unit tests pass (>80% coverage)
- [ ] Convex functions tested with mocked data
- [ ] Component tests verify UI interactions
- [ ] E2E tests cover critical user flows
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with zero errors
- [ ] Build succeeds without warnings

### Post-deployment
- [ ] Production health checks pass
- [ ] Real-time synchronization working
- [ ] Authentication flows functional
- [ ] Performance metrics within targets
- [ ] Error rates below threshold
- [ ] All external integrations working

This modern testing and deployment strategy ensures high-quality releases while maintaining the fast development velocity enabled by the Convex + NextJS + TypeScript stack.