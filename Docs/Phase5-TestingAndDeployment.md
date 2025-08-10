# Phase 5: Testing & Production Deployment Guide

## Overview

This comprehensive guide covers testing and production deployment for Kitchentory's NextJS 14 + Convex + Clerk + Vercel tech stack. This phase ensures reliability, security, and scalability before launching to users.

## Prerequisites

- NextJS 14+ application with App Router
- Convex backend configured and deployed
- Clerk authentication integrated
- Vercel account set up for deployment
- GitHub repository with CI/CD workflows

## Testing Strategy

### 1. Development Environment Testing

#### Unit Testing with Jest

Configure Jest for comprehensive unit testing:

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/convex/(.*)$': '<rootDir>/convex/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### Component Testing

```typescript
// __tests__/components/InventoryItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { InventoryItem } from '@/components/InventoryItem'

const mockItem = {
  _id: '1' as any,
  name: 'Test Item',
  quantity: 2,
  unit: 'pieces',
  category: 'Food',
  expirationDate: Date.now() + 86400000, // Tomorrow
  householdId: '1' as any,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('InventoryItem', () => {
  it('renders item information correctly', () => {
    render(<InventoryItem item={mockItem} onEdit={jest.fn()} onDelete={jest.fn()} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('2 pieces')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<InventoryItem item={mockItem} onEdit={onEdit} onDelete={jest.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockItem)
  })

  it('shows expiration warning for items expiring soon', () => {
    const expiringItem = {
      ...mockItem,
      expirationDate: Date.now() + 3600000, // 1 hour from now
    }
    
    render(<InventoryItem item={expiringItem} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText(/expiring soon/i)).toBeInTheDocument()
  })
})
```

#### API Route Testing

```typescript
// __tests__/api/health.test.ts
import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('/api/health', () => {
  it('returns healthy status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.services).toBeDefined()
  })
})
```

### 2. Integration Testing

#### Convex Integration Testing

```typescript
// __tests__/integration/convex.test.ts
import { ConvexTestingHelper } from 'convex/testing'
import { api } from '@/convex/_generated/api'
import schema from '@/convex/schema'

describe('Convex Integration', () => {
  let t: ConvexTestingHelper<typeof schema>

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema)
    await t.run(async (ctx) => {
      // Set up test data
      await ctx.db.insert('users', {
        clerkId: 'test-user',
        email: 'test@example.com',
        subscriptionTier: 'free',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    })
  })

  afterEach(async () => {
    await t.cleanup()
  })

  it('creates inventory item successfully', async () => {
    const result = await t.mutation(api.inventory.createItem, {
      name: 'Test Item',
      category: 'Food',
      quantity: 1,
      unit: 'piece',
      householdId: 'household-1' as any,
    })

    expect(result).toBeDefined()
    
    const item = await t.query(api.inventory.getItem, { id: result })
    expect(item?.name).toBe('Test Item')
  })

  it('enforces subscription limits for free users', async () => {
    // Test that free users can't exceed item limits
    const promises = Array.from({ length: 51 }, (_, i) =>
      t.mutation(api.inventory.createItem, {
        name: `Item ${i}`,
        category: 'Food',
        quantity: 1,
        unit: 'piece',
        householdId: 'household-1' as any,
      })
    )

    // Should reject the 51st item
    await expect(Promise.all(promises)).rejects.toThrow(/limit exceeded/i)
  })
})
```

#### Authentication Flow Testing

```typescript
// __tests__/integration/auth.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { AuthGuard } from '@/components/AuthGuard'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: any) => children,
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Authentication Integration', () => {
  it('redirects unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      userId: null,
      isSignedIn: false,
    } as any)

    const mockPush = jest.fn()
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }))

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
  })

  it('shows content for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      userId: 'user-123',
      isSignedIn: true,
    } as any)

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
```

### 3. End-to-End Testing with Playwright

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Critical User Flows Testing

```typescript
// e2e/user-flows.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Authentication Flow', () => {
  test('user can sign up and sign in', async ({ page }) => {
    await page.goto('/')
    
    // Click sign up
    await page.getByRole('link', { name: /sign up/i }).click()
    
    // Fill sign up form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /sign up/i }).click()
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding')
    
    // Complete onboarding
    await page.getByLabel(/name/i).fill('Test User')
    await page.getByRole('button', { name: /continue/i }).click()
    
    // Should reach dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })
})

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard')
    // Assume user is already logged in via setup
  })

  test('user can add inventory item', async ({ page }) => {
    await page.getByRole('button', { name: /add item/i }).click()
    
    await page.getByLabel(/item name/i).fill('Milk')
    await page.getByLabel(/quantity/i).fill('1')
    await page.selectOption('select[name="unit"]', 'gallon')
    await page.selectOption('select[name="category"]', 'Dairy')
    await page.getByLabel(/expiration date/i).fill('2024-12-31')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    // Verify item appears in list
    await expect(page.getByText('Milk')).toBeVisible()
    await expect(page.getByText('1 gallon')).toBeVisible()
  })

  test('user can search inventory items', async ({ page }) => {
    // Assuming some items exist
    await page.getByPlaceholder(/search items/i).fill('milk')
    
    await expect(page.getByText('Milk')).toBeVisible()
    // Other items should be filtered out
  })

  test('user can edit inventory item', async ({ page }) => {
    await page.getByTestId('item-milk').getByRole('button', { name: /edit/i }).click()
    
    await page.getByLabel(/quantity/i).fill('2')
    await page.getByRole('button', { name: /save/i }).click()
    
    await expect(page.getByText('2 gallon')).toBeVisible()
  })
})

test.describe('Recipe Matching', () => {
  test('user can find recipes based on inventory', async ({ page }) => {
    await page.goto('/recipes')
    
    await page.getByRole('button', { name: /find recipes/i }).click()
    
    // Should show recipes that can be made with current inventory
    await expect(page.getByTestId('recipe-list')).toBeVisible()
    await expect(page.getByText(/recipes you can make/i)).toBeVisible()
  })

  test('user can save recipe to favorites', async ({ page }) => {
    await page.goto('/recipes')
    
    const firstRecipe = page.getByTestId('recipe-card').first()
    await firstRecipe.getByRole('button', { name: /favorite/i }).click()
    
    // Verify recipe is saved
    await page.goto('/recipes/favorites')
    await expect(firstRecipe).toBeVisible()
  })
})

test.describe('Shopping List Management', () => {
  test('user can create shopping list from recipe', async ({ page }) => {
    await page.goto('/recipes/pasta-marinara')
    
    await page.getByRole('button', { name: /add to shopping list/i }).click()
    
    await page.goto('/shopping')
    
    // Verify recipe ingredients are added
    await expect(page.getByText('Pasta')).toBeVisible()
    await expect(page.getByText('Marinara Sauce')).toBeVisible()
  })

  test('user can check off shopping list items', async ({ page }) => {
    await page.goto('/shopping')
    
    const firstItem = page.getByTestId('shopping-item').first()
    await firstItem.getByRole('checkbox').check()
    
    // Item should be marked as purchased
    await expect(firstItem).toHaveClass(/purchased/)
  })
})

test.describe('Subscription Management', () => {
  test('free user sees upgrade prompts', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Try to access premium feature
    await page.getByRole('button', { name: /advanced analytics/i }).click()
    
    // Should see upgrade prompt
    await expect(page.getByText(/upgrade to premium/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /upgrade now/i })).toBeVisible()
  })

  test('user can view pricing page', async ({ page }) => {
    await page.goto('/pricing')
    
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Premium')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    
    // Check pricing
    await expect(page.getByText('$4.99')).toBeVisible()
    await expect(page.getByText('$9.99')).toBeVisible()
  })
})
```

#### Performance Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('page loads within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3 second budget
  })

  test('inventory list handles large datasets', async ({ page }) => {
    // Mock API to return 1000 items
    await page.route('/api/inventory', (route) => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        quantity: 1,
        unit: 'piece',
        category: 'Food',
      }))
      route.fulfill({ json: { items } })
    })

    await page.goto('/inventory')
    
    // Should load without freezing
    await expect(page.getByTestId('inventory-list')).toBeVisible({ timeout: 5000 })
    
    // Should be scrollable
    await page.getByTestId('inventory-list').scroll({ scrollTop: 1000 })
    expect(page.getByText('Item 50')).toBeVisible()
  })
})
```

### 4. Accessibility Testing

#### Automated Accessibility Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('homepage meets WCAG standards', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('dashboard is keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Should be able to navigate to all interactive elements
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count()
    
    for (let i = 0; i < focusableElements; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    }
  })

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/inventory/add')
    
    // All form inputs should have associated labels
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledby = await input.getAttribute('aria-labelledby')
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toBeVisible()
      } else {
        expect(ariaLabel || ariaLabelledby).toBeTruthy()
      }
    }
  })
})
```

### 5. Security Testing

#### Authentication Security

```typescript
// e2e/security.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('protected routes redirect unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('API endpoints require authentication', async ({ page }) => {
    const response = await page.request.get('/api/inventory')
    expect(response.status()).toBe(401)
  })

  test('CSRF protection is in place', async ({ page, context }) => {
    // Test that requests without proper headers are rejected
    const response = await context.request.post('/api/inventory', {
      data: { name: 'Test Item' },
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    })
    
    expect(response.status()).toBe(403)
  })

  test('sensitive data is not exposed in client', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check that API keys and secrets are not in the page source
    const content = await page.content()
    expect(content).not.toContain('sk_live_')
    expect(content).not.toContain('whsec_')
    expect(content).not.toContain('CLERK_SECRET_KEY')
  })
})
```

## Production Deployment Process

### 1. Pre-Deployment Checklist

#### Code Quality Verification

- [ ] All TypeScript errors resolved
- [ ] ESLint warnings below threshold (< 5)
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage above 80%
- [ ] Security vulnerabilities addressed
- [ ] Performance benchmarks met

#### Environment Configuration

- [ ] Production environment variables configured in Vercel
- [ ] Convex production deployment created
- [ ] Clerk production application set up
- [ ] Domain DNS configured correctly
- [ ] SSL certificates active
- [ ] Security headers configured

#### Database and Backend

- [ ] Convex schema deployed to production
- [ ] Database indexes created
- [ ] Functions tested in production environment
- [ ] Webhooks configured and tested
- [ ] Backup strategy implemented

### 2. Vercel Deployment Configuration

#### Environment Variables Setup

```bash
# Production Environment Variables (set in Vercel Dashboard)

# Convex
CONVEX_DEPLOYMENT=kitchentory-prod
NEXT_PUBLIC_CONVEX_URL=https://kitchentory-prod.convex.cloud
CONVEX_DEPLOY_KEY=prod_deploy_key_here

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Application
NEXT_PUBLIC_APP_URL=https://kitchentory.com
NODE_ENV=production

# Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

#### Deployment Script

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "deploy:prod": "vercel --prod",
    "deploy:preview": "vercel",
    "test:e2e:prod": "PLAYWRIGHT_TEST_BASE_URL=https://kitchentory.com playwright test"
  }
}
```

### 3. Automated Deployment Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '*.md'

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run SAST scan
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy-convex:
    runs-on: ubuntu-latest
    needs: [quality-checks, security-scan]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Deploy Convex
        run: |
          npm install -g convex
          npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}

  deploy-vercel:
    runs-on: ubuntu-latest
    needs: [quality-checks, security-scan, deploy-convex]
    outputs:
      preview-url: ${{ steps.deploy.outputs.preview-url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: echo "preview-url=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})" >> $GITHUB_OUTPUT

  e2e-tests:
    runs-on: ubuntu-latest
    needs: deploy-vercel
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ needs.deploy-vercel.outputs.preview-url }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  performance-audit:
    runs-on: ubuntu-latest
    needs: deploy-vercel
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Audit URLs using Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            ${{ needs.deploy-vercel.outputs.preview-url }}
            ${{ needs.deploy-vercel.outputs.preview-url }}/dashboard
            ${{ needs.deploy-vercel.outputs.preview-url }}/inventory
          uploadArtifacts: true
          temporaryPublicStorage: true

  notify-deployment:
    runs-on: ubuntu-latest
    needs: [deploy-vercel, e2e-tests, performance-audit]
    if: always()
    steps:
      - name: Notify Slack on success
        if: ${{ needs.e2e-tests.result == 'success' && needs.performance-audit.result == 'success' }}
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: "✅ Production deployment successful! URL: ${{ needs.deploy-vercel.outputs.preview-url }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify Slack on failure
        if: ${{ needs.e2e-tests.result == 'failure' || needs.performance-audit.result == 'failure' }}
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: "❌ Production deployment failed! Check the logs."
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 4. Post-Deployment Verification

#### Health Check Script

```typescript
// scripts/health-check.ts
interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy'
  responseTime?: number
  error?: string
}

async function checkEndpoint(url: string, timeout = 5000): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Kitchentory-HealthCheck/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        service: url,
        status: 'healthy',
        responseTime
      }
    } else {
      return {
        service: url,
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      service: url,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runHealthChecks() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchentory.com'
  
  const checks = await Promise.all([
    checkEndpoint(`${baseUrl}/api/health`),
    checkEndpoint(`${baseUrl}/`),
    checkEndpoint(`${baseUrl}/dashboard`),
    checkEndpoint(`${baseUrl}/api/inventory`),
  ])
  
  console.log('Health Check Results:')
  console.table(checks)
  
  const unhealthyServices = checks.filter(check => check.status === 'unhealthy')
  
  if (unhealthyServices.length > 0) {
    console.error(`❌ ${unhealthyServices.length} service(s) are unhealthy`)
    process.exit(1)
  } else {
    console.log('✅ All services are healthy')
  }
}

runHealthChecks().catch(console.error)
```

#### Monitoring Setup

```typescript
// lib/monitoring.ts
interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

class MonitoringClient {
  private apiEndpoint: string

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint
  }

  async trackMetric(metric: MetricData) {
    if (process.env.NODE_ENV !== 'production') return

    try {
      await fetch(`${this.apiEndpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
        },
        body: JSON.stringify({
          ...metric,
          timestamp: metric.timestamp || Date.now()
        })
      })
    } catch (error) {
      console.warn('Failed to send metric:', error)
    }
  }

  async trackError(error: Error, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') return

    try {
      await fetch(`${this.apiEndpoint}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: Date.now()
        })
      })
    } catch (err) {
      console.warn('Failed to send error:', err)
    }
  }
}

export const monitoring = new MonitoringClient(
  process.env.MONITORING_ENDPOINT || 'https://api.monitoring.com'
)

// Usage in components
export function useErrorTracking() {
  return {
    trackError: (error: Error, context?: Record<string, any>) => {
      monitoring.trackError(error, context)
    }
  }
}
```

### 5. Performance Optimization

#### Bundle Analysis

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
    serverComponentsExternalPackages: ['convex'],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
```

#### Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {error ? (
        <div className="flex items-center justify-center bg-gray-100 rounded h-full">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  )
}
```

## Launch Strategy

### 1. Pre-Launch Phase (Week 1-2)

#### Internal Testing

- [ ] Deploy to production environment
- [ ] Complete internal team testing (5-10 people)
- [ ] Test all critical user flows
- [ ] Verify payment processing (test mode)
- [ ] Check mobile responsiveness
- [ ] Performance testing under load
- [ ] Security penetration testing

#### Beta Testing

- [ ] Recruit 50-100 beta testers
- [ ] Set up feedback collection system
- [ ] Create beta testing guidelines
- [ ] Monitor usage analytics
- [ ] Collect and analyze feedback
- [ ] Fix critical bugs and issues

### 2. Soft Launch Phase (Week 3)

#### Limited Public Access

- [ ] Remove beta restrictions
- [ ] Enable production payment processing
- [ ] Monitor system performance closely
- [ ] Implement customer support processes
- [ ] Track key performance indicators
- [ ] Be prepared for emergency rollbacks

#### Marketing Preparation

- [ ] Prepare launch announcement content
- [ ] Set up social media accounts
- [ ] Create press release
- [ ] Prepare Product Hunt submission
- [ ] Set up customer support channels
- [ ] Create launch day timeline

### 3. Public Launch Phase (Week 4)

#### Launch Day Execution

- [ ] Monitor system health throughout the day
- [ ] Post on social media channels
- [ ] Submit to Product Hunt
- [ ] Send email to mailing list
- [ ] Monitor traffic and performance
- [ ] Respond to user feedback promptly
- [ ] Track conversion metrics

#### Post-Launch Monitoring

- [ ] Daily performance reviews (first week)
- [ ] Weekly performance reviews (first month)
- [ ] User feedback analysis
- [ ] Feature usage analytics
- [ ] Customer support ticket analysis
- [ ] Plan iterative improvements

## Success Metrics and KPIs

### Technical Metrics

- **Uptime**: > 99.9% (target: 99.95%)
- **Response Time**: < 300ms median, < 1s 95th percentile
- **Error Rate**: < 0.1%
- **Build Time**: < 5 minutes
- **Test Coverage**: > 85%
- **Core Web Vitals**: All green scores
- **Security Vulnerabilities**: Zero critical, < 5 medium

### Business Metrics

- **User Registration**: Track daily/weekly signups
- **User Activation**: % of users who complete onboarding
- **User Retention**: 1-day (>40%), 7-day (>20%), 30-day (>10%)
- **Conversion Rate**: Free to paid (target: 5-10%)
- **Churn Rate**: Monthly churn < 5%
- **Customer Lifetime Value**: Track average revenue per user
- **Net Promoter Score**: Target NPS > 50

### User Experience Metrics

- **Time to First Value**: < 2 minutes from signup
- **Feature Adoption**: Track usage of key features
- **User Satisfaction**: Survey scores > 4.0/5.0
- **Customer Support**: Response time < 2 hours, resolution < 24 hours
- **Mobile Usage**: Track mobile vs desktop usage patterns

This comprehensive testing and deployment guide ensures your NextJS 14 + Convex + Clerk application launches successfully with robust quality assurance, security measures, and monitoring in place.