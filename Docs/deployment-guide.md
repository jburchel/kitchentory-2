# Kitchentory Vercel Deployment Guide

This comprehensive guide covers deploying Kitchentory's NextJS 14 application with Convex backend and Clerk authentication to production on Vercel, including CI/CD pipelines, performance optimization, and monitoring.

## Table of Contents

1. [Vercel Project Setup](#vercel-project-setup)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Build Optimization and Edge Runtime](#build-optimization-and-edge-runtime)
4. [CI/CD Pipelines with GitHub Actions](#cicd-pipelines-with-github-actions)
5. [Performance Monitoring and Analytics](#performance-monitoring-and-analytics)
6. [Domain Configuration and SSL](#domain-configuration-and-ssl)
7. [Preview Deployments and Branch Workflows](#preview-deployments-and-branch-workflows)
8. [Advanced Deployment Configurations](#advanced-deployment-configurations)
9. [Troubleshooting and Debugging](#troubleshooting-and-debugging)

## Vercel Project Setup

### 1. Initial Project Configuration

Create `vercel.json` in your project root for optimal Vercel configuration:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    },
    "app/api/webhooks/**/*.ts": {
      "maxDuration": 60,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/app",
      "destination": "/dashboard",
      "permanent": true
    },
    {
      "source": "/login",
      "destination": "/sign-in",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/convex/:path*",
      "destination": "https://:convex-deployment.convex.cloud/:path*"
    }
  ]
}
```

### 2. Next.js Configuration for Vercel

Update `next.config.js` for optimal Vercel deployment:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel optimizations
  experimental: {
    serverComponentsExternalPackages: ['convex'],
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react', 'date-fns'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          enforce: true,
        },
        clerk: {
          test: /[\\/]node_modules[\\/]@clerk[\\/]/,
          name: 'clerk',
          priority: 20,
          enforce: true,
        },
        convex: {
          test: /[\\/]node_modules[\\/]convex[\\/]/,
          name: 'convex',
          priority: 20,
          enforce: true,
        },
      },
    }

    return config
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accountsjs.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev wss://*.convex.cloud https://vitals.vercel-insights.com",
              "frame-src https://challenges.cloudflare.com",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          },
        ],
      },
    ]
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

// Bundle analyzer for optimization
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

### 3. Vercel CLI Setup

Install and configure Vercel CLI for local development and deployment:

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Pull environment variables for local development
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Project Structure for Vercel

Organize your project structure for optimal Vercel deployment:

```
kitchentory/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard
│   └── globals.css        # Global styles
├── components/            # React components
├── convex/               # Convex functions
├── lib/                  # Utilities
├── public/              # Static assets
├── .env.local           # Local environment
├── .env.example         # Environment template
├── next.config.js       # Next.js config
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## Environment Variables Configuration

### 1. Convex Environment Variables

Configure Convex for production deployment:

**Production Environment**:
```env
# Convex Production
CONVEX_DEPLOYMENT=your-prod-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment-name.convex.cloud
CONVEX_DEPLOY_KEY=prod_1234567890abcdef...

# Convex Auth (if using Convex Auth)
CONVEX_AUTH_ADAPTER=clerk
```

**Preview Environment**:
```env
# Convex Preview
CONVEX_DEPLOYMENT=your-preview-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-preview-deployment-name.convex.cloud
CONVEX_DEPLOY_KEY=dev_1234567890abcdef...
```

**Convex Configuration Script**:

```typescript
// scripts/setup-convex.ts
import { execSync } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production';
const deploymentName = isProduction ? 'kitchentory-prod' : 'kitchentory-dev';

// Deploy Convex functions
console.log(`Deploying to ${deploymentName}...`);
execSync(`npx convex deploy --prod=${isProduction}`, { stdio: 'inherit' });

// Set environment-specific configurations
if (isProduction) {
  execSync('npx convex env set NODE_ENV production --prod', { stdio: 'inherit' });
} else {
  execSync('npx convex env set NODE_ENV development', { stdio: 'inherit' });
}
```

### 2. Clerk Environment Variables

Configure Clerk for production authentication:

**Production Environment**:
```env
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX
CLERK_SECRET_KEY=sk_live_XXXXXXXXXX

# Clerk URLs - Production
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_live_1234567890abcdef...

# Clerk JWT Template (for Convex integration)
CLERK_JWT_TEMPLATE_NAME=convex
```

**Preview Environment**:
```env
# Clerk Test Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXX

# Clerk URLs - Preview
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Clerk Webhook - Test
CLERK_WEBHOOK_SECRET=whsec_test_1234567890abcdef...

# Clerk JWT Template
CLERK_JWT_TEMPLATE_NAME=convex
```

### 3. Application Environment Variables

Configure application-specific variables:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=https://kitchentory.com
NEXT_PUBLIC_APP_NAME=Kitchentory
NEXT_PUBLIC_APP_DESCRIPTION=Smart Kitchen Inventory Management

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# API Configuration
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW=900000

# Performance Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=prj_1234567890
VERCEL_ANALYTICS_ID=prj_1234567890

# Error Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=kitchentory
```

### 4. Environment Variable Validation

Create a utility to validate environment variables:

```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  // Convex
  CONVEX_DEPLOYMENT: z.string().min(1, 'CONVEX_DEPLOYMENT is required'),
  NEXT_PUBLIC_CONVEX_URL: z.string().url('NEXT_PUBLIC_CONVEX_URL must be a valid URL'),
  CONVEX_DEPLOY_KEY: z.string().min(1, 'CONVEX_DEPLOY_KEY is required'),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET is required'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function validateEnvironment() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Validate on app startup
if (typeof window === 'undefined') {
  validateEnvironment();
}
```

## Build Optimization and Edge Runtime

### 1. Edge Runtime Configuration

Configure Next.js for optimal edge performance:

```typescript
// app/api/edge-example/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Enable Edge Runtime for better performance
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Running on Edge Runtime',
    timestamp: new Date().toISOString(),
  });
}
```

### 2. Middleware for Edge Optimization

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Configure public routes
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/api/health',
  ],

  // Ignored routes for better performance
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/health',
    '/_next(.*)',
    '/favicon.ico',
  ],

  // Custom middleware logic
  beforeAuth: (req) => {
    // Add performance headers
    const response = NextResponse.next();
    
    // Cache static assets
    if (req.nextUrl.pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Add security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  },

  // Custom after auth logic
  afterAuth(auth, req, evt) {
    // Handle unauthenticated users trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Redirect authenticated users away from auth pages
    if (auth.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 3. Bundle Optimization

Create a bundle analysis script:

```javascript
// scripts/analyze-bundle.js
const { execSync } = require('child_process');

// Set environment for bundle analysis
process.env.ANALYZE = 'true';

console.log('🔍 Analyzing bundle size...');

try {
  // Build with bundle analyzer
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📊 Bundle analysis complete! Check the generated report.');
  console.log('💡 Tips for optimization:');
  console.log('  - Look for large dependencies');
  console.log('  - Check for duplicate code');
  console.log('  - Consider lazy loading for heavy components');
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
```

### 4. Static Generation and ISR

Configure static generation for better performance:

```typescript
// app/recipes/[slug]/page.tsx
import { Metadata } from 'next';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Generate static paths
export async function generateStaticParams() {
  // Fetch popular recipes for static generation
  const recipes = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/recipes/popular`)
    .then(res => res.json());
  
  return recipes.map((recipe: { slug: string }) => ({
    slug: recipe.slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const recipe = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/recipes/${params.slug}`)
    .then(res => res.json());
  
  return {
    title: `${recipe.name} | Kitchentory Recipes`,
    description: recipe.description,
    openGraph: {
      title: recipe.name,
      description: recipe.description,
      images: [recipe.imageUrl],
    },
  };
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  // Page content
  return <div>Recipe details</div>;
}
```

### 5. Image Optimization

Configure advanced image optimization:

```typescript
// components/optimized-image.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = '',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${error ? 'hidden' : 'block'}
        `}
      />
      
      {error && (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
}
```

## CI/CD Pipelines with GitHub Actions

### 1. Complete CI/CD Workflow

Create comprehensive GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-test:
    name: Lint and Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --frozen-lockfile

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          CI: true

      - name: Run integration tests
        run: npm run test:integration
        env:
          CI: true
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL_TEST }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST }}

      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  build-and-validate:
    name: Build and Validate
    runs-on: ubuntu-latest
    needs: lint-and-test
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --frozen-lockfile

      - name: Validate environment template
        run: |
          if [ ! -f ".env.example" ]; then
            echo "❌ .env.example file is missing"
            exit 1
          fi

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL_TEST }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST }}
          NEXT_PUBLIC_APP_URL: https://test.kitchentory.com

      - name: Analyze bundle size
        run: |
          npm install -g bundlesize
          bundlesize

      - name: Cache build artifacts
        uses: actions/cache@v3
        with:
          path: .next
          key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ github.sha }}

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: [lint-and-test, build-and-validate]
    if: github.event_name == 'pull_request'
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel (Preview)
        id: deploy-preview
        run: |
          vercel deploy --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "PREVIEW_URL=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT

      - name: Deploy Convex (Preview)
        run: |
          npm install -g convex
          npx convex deploy --cmd 'npm run build'
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY_PREVIEW }}

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const previewUrl = '${{ steps.deploy-preview.outputs.PREVIEW_URL }}';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Preview deployment ready!**
              
              📎 **Preview URL:** ${previewUrl}
              
              This preview will be available until the PR is closed.`
            });

  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: [lint-and-test, build-and-validate]
    if: github.ref == 'refs/heads/main'
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Convex (Production)
        run: |
          npm install -g convex
          npx convex deploy --prod --cmd 'npm run build'
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY_PROD }}

      - name: Deploy to Vercel (Production)
        id: deploy-prod
        run: |
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "PROD_URL=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT

      - name: Wait for deployment to be ready
        run: |
          echo "Waiting for deployment to be ready..."
          sleep 30
          curl -f ${{ steps.deploy-prod.outputs.PROD_URL }}/api/health || exit 1

      - name: Notify deployment success
        uses: actions/github-script@v7
        with:
          script: |
            const prodUrl = '${{ steps.deploy-prod.outputs.PROD_URL }}';
            github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: 'success',
              target_url: prodUrl,
              description: 'Production deployment successful',
              context: 'vercel/deployment'
            });

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: deploy-preview
    if: github.event_name == 'pull_request'
    timeout-minutes: 20

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --frozen-lockfile

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ needs.deploy-preview.outputs.PREVIEW_URL }}

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ github.run_number }}
          path: playwright-report/
          retention-days: 30

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint-and-test
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run npm audit
        run: npm audit --audit-level moderate
```

### 2. Branch Protection Rules

Configure branch protection via GitHub API or UI:

```yaml
# .github/workflows/setup-branch-protection.yml
name: Setup Branch Protection

on:
  workflow_dispatch:

jobs:
  setup-protection:
    runs-on: ubuntu-latest
    steps:
      - name: Protect main branch
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.repos.updateBranchProtection({
              owner: context.repo.owner,
              repo: context.repo.repo,
              branch: 'main',
              required_status_checks: {
                strict: true,
                contexts: [
                  'Lint and Test',
                  'Build and Validate',
                  'Security Scan'
                ]
              },
              enforce_admins: true,
              required_pull_request_reviews: {
                required_approving_review_count: 1,
                dismiss_stale_reviews: true,
                require_code_owner_reviews: true
              },
              restrictions: null
            });
```

### 3. Deployment Notifications

```yaml
# .github/workflows/notify-deployment.yml
name: Deployment Notifications

on:
  deployment_status:

jobs:
  notify:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "🚀 Deployment successful!",
              attachments: [{
                color: 'good',
                fields: [{
                  title: 'Environment',
                  value: '${{ github.event.deployment.environment }}',
                  short: true
                }, {
                  title: 'URL',
                  value: '${{ github.event.deployment_status.target_url }}',
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Performance Monitoring and Analytics

### 1. Vercel Analytics Integration

Configure comprehensive analytics and monitoring:

```typescript
// app/layout.tsx - Analytics setup
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Vercel Analytics */}
        <Analytics 
          mode={process.env.NODE_ENV === 'production' ? 'production' : 'development'}
          debug={process.env.NODE_ENV === 'development'}
        />
        
        {/* Vercel Speed Insights */}
        <SpeedInsights 
          sampleRate={process.env.NODE_ENV === 'production' ? 0.1 : 1.0}
        />
      </body>
    </html>
  );
}
```

### 2. Custom Performance Monitoring

```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(label, value);
    }
  }

  getAverageMetric(label: string): number | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private sendToAnalytics(label: string, value: number): void {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && 'va' in window) {
      (window as any).va('track', 'performance', {
        metric: label,
        value: value,
        timestamp: Date.now(),
      });
    }
  }

  reportWebVitals(metric: any): void {
    // Core Web Vitals reporting
    const { name, value, delta, id } = metric;
    
    if (process.env.NODE_ENV === 'production') {
      // Send to multiple analytics services
      this.sendToAnalytics(`webvital_${name}`, value);
      
      // Log to console for debugging
      console.log(`${name}: ${value} (delta: ${delta}, id: ${id})`);
    }
  }
}

// Usage in components
export function usePerformanceTimer(label: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTimer: () => monitor.startTiming(label),
    recordMetric: (value: number) => monitor.recordMetric(label, value),
    getAverage: () => monitor.getAverageMetric(label),
  };
}
```

### 3. Real User Monitoring

```typescript
// lib/real-user-monitoring.ts
export class RealUserMonitoring {
  private static initialized = false;

  static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Monitor route changes
    this.monitorRouteChanges();
    
    // Monitor user interactions
    this.monitorUserInteractions();
    
    // Monitor errors
    this.monitorErrors();
    
    // Monitor resource loading
    this.monitorResources();
    
    this.initialized = true;
  }

  private static monitorRouteChanges(): void {
    let routeChangeStart = 0;
    
    // Next.js router events
    if (typeof window !== 'undefined') {
      const handleRouteChangeStart = () => {
        routeChangeStart = performance.now();
      };

      const handleRouteChangeComplete = () => {
        if (routeChangeStart > 0) {
          const duration = performance.now() - routeChangeStart;
          PerformanceMonitor.getInstance().recordMetric('route_change', duration);
          routeChangeStart = 0;
        }
      };

      // Listen for route changes (Next.js App Router)
      window.addEventListener('beforeunload', handleRouteChangeStart);
      window.addEventListener('load', handleRouteChangeComplete);
    }
  }

  private static monitorUserInteractions(): void {
    if (typeof window === 'undefined') return;

    // Monitor clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      if (['button', 'a', 'input'].includes(tagName)) {
        this.trackInteraction('click', tagName, target.id || target.className);
      }
    });

    // Monitor form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackInteraction('form_submit', 'form', form.id || form.className);
    });
  }

  private static monitorErrors(): void {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason,
      });
    });
  }

  private static monitorResources(): void {
    if (typeof window === 'undefined') return;

    // Monitor resource loading performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          PerformanceMonitor.getInstance().recordMetric(
            `resource_${resourceEntry.initiatorType}`,
            resourceEntry.duration
          );
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private static trackInteraction(type: string, element: string, identifier: string): void {
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Send to analytics
      if ('va' in window) {
        (window as any).va('track', 'interaction', {
          type,
          element,
          identifier,
          timestamp: Date.now(),
        });
      }
    }
  }

  private static trackError(type: string, details: any): void {
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      console.error(`${type}:`, details);
      
      // Send to analytics
      if ('va' in window) {
        (window as any).va('track', 'error', {
          type,
          details: JSON.stringify(details),
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      }
    }
  }
}

// Initialize on app load
if (typeof window !== 'undefined') {
  RealUserMonitoring.init();
}
```

### 4. Performance Dashboard

```typescript
// app/admin/performance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/lib/performance-monitor';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    // Collect current metrics
    const currentMetrics: Record<string, number> = {};
    const metricLabels = ['route_change', 'api_request', 'component_render'];
    
    metricLabels.forEach(label => {
      const average = monitor.getAverageMetric(label);
      if (average !== null) {
        currentMetrics[label] = average;
      }
    });
    
    setMetrics(currentMetrics);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(metrics).map(([label, value]) => (
          <div key={label} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold capitalize">
              {label.replace('_', ' ')}
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(value)}ms
            </p>
            <p className="text-sm text-gray-500">Average response time</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Domain Configuration and SSL

### 1. Custom Domain Setup

Configure custom domain in Vercel dashboard and DNS:

```bash
# Add domain to Vercel project
vercel domains add kitchentory.com --token=$VERCEL_TOKEN

# Verify domain ownership
vercel domains verify kitchentory.com --token=$VERCEL_TOKEN
```

**DNS Configuration**:
```dns
# For apex domain (kitchentory.com)
A     @     76.76.19.61

# For www subdomain
CNAME www   cname.vercel-dns.com.

# For email (if using external email provider)
MX    @     10 mail.protonmail.ch
MX    @     20 mailsec.protonmail.ch

# For security
TXT   @     "v=spf1 include:_spf.protonmail.ch mx ~all"
TXT   _dmarc.@ "v=DMARC1; p=quarantine; rua=mailto:admin@kitchentory.com"
```

### 2. SSL Certificate Management

Vercel automatically provisions SSL certificates, but you can monitor them:

```typescript
// scripts/check-ssl.ts
import https from 'https';
import { URL } from 'url';

interface SSLInfo {
  valid: boolean;
  validFrom: Date;
  validTo: Date;
  issuer: string;
  subject: string;
  daysUntilExpiry: number;
}

export async function checkSSLCertificate(domain: string): Promise<SSLInfo> {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${domain}`);
    
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      method: 'GET',
      timeout: 10000,
    }, (res) => {
      const cert = res.socket?.getPeerCertificate();
      
      if (!cert) {
        reject(new Error('No certificate found'));
        return;
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      resolve({
        valid: cert.valid_from && cert.valid_to && now >= validFrom && now <= validTo,
        validFrom,
        validTo,
        issuer: cert.issuer?.CN || 'Unknown',
        subject: cert.subject?.CN || 'Unknown',
        daysUntilExpiry,
      });
      
      res.destroy();
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Usage
async function monitorSSL() {
  try {
    const domains = ['kitchentory.com', 'www.kitchentory.com'];
    
    for (const domain of domains) {
      const sslInfo = await checkSSLCertificate(domain);
      
      console.log(`${domain}:`);
      console.log(`  Valid: ${sslInfo.valid ? '✅' : '❌'}`);
      console.log(`  Issuer: ${sslInfo.issuer}`);
      console.log(`  Valid until: ${sslInfo.validTo.toISOString()}`);
      console.log(`  Days until expiry: ${sslInfo.daysUntilExpiry}`);
      
      if (sslInfo.daysUntilExpiry < 30) {
        console.warn(`⚠️  Certificate for ${domain} expires soon!`);
      }
    }
  } catch (error) {
    console.error('SSL check failed:', error);
  }
}

monitorSSL();
```

### 3. Security Headers Configuration

```typescript
// next.config.js - Enhanced security headers
const securityHeaders = [
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
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accountsjs.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev wss://*.convex.cloud https://vitals.vercel-insights.com",
      "frame-src https://challenges.cloudflare.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Preview Deployments and Branch Workflows

### 1. Automated Preview Deployments

Configure automatic preview deployments for all branches:

```yaml
# .github/workflows/preview-deployment.yml
name: Preview Deployment

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

concurrency:
  group: preview-${{ github.head_ref }}
  cancel-in-progress: true

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    outputs:
      preview-url: ${{ steps.deploy.outputs.preview-url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate preview environment name
        id: env-name
        run: |
          BRANCH_NAME="${{ github.head_ref }}"
          CLEAN_BRANCH=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
          echo "env-name=kitchentory-preview-$CLEAN_BRANCH" >> $GITHUB_OUTPUT

      - name: Deploy Convex (Preview)
        run: |
          npm install -g convex
          npx convex deploy --cmd 'npm run build'
        env:
          CONVEX_DEPLOYMENT: ${{ steps.env-name.outputs.env-name }}
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY_PREVIEW }}

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Deploy to Vercel (Preview)
        id: deploy
        run: |
          # Set environment variables for this deployment
          vercel env add NEXT_PUBLIC_CONVEX_URL "https://${{ steps.env-name.outputs.env-name }}.convex.cloud" preview --token=${{ secrets.VERCEL_TOKEN }}
          vercel env add CONVEX_DEPLOYMENT "${{ steps.env-name.outputs.env-name }}" preview --token=${{ secrets.VERCEL_TOKEN }}
          
          # Deploy to preview
          PREVIEW_URL=$(vercel deploy --token=${{ secrets.VERCEL_TOKEN }})
          echo "preview-url=$PREVIEW_URL" >> $GITHUB_OUTPUT
          echo "PREVIEW_URL=$PREVIEW_URL" >> $GITHUB_ENV

      - name: Update PR with preview link
        uses: actions/github-script@v7
        with:
          script: |
            const previewUrl = '${{ steps.deploy.outputs.preview-url }}';
            const envName = '${{ steps.env-name.outputs.env-name }}';
            
            // Find existing comment
            const comments = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            
            const botComment = comments.data.find(comment => 
              comment.user?.type === 'User' && 
              comment.body?.includes('🚀 Preview deployment')
            );
            
            const body = `🚀 **Preview deployment ready!**
            
            📎 **Preview URL:** [${previewUrl}](${previewUrl})
            🔧 **Convex Environment:** \`${envName}\`
            📝 **Branch:** \`${{ github.head_ref }}\`
            📊 **Commit:** \`${{ github.event.pull_request.head.sha }}\`
            
            ---
            
            ### 🧪 Test Checklist
            - [ ] Authentication flow works
            - [ ] Database operations function correctly
            - [ ] UI/UX changes look good on mobile
            - [ ] Performance is acceptable
            
            *This preview will automatically update with new commits.*`;
            
            if (botComment) {
              // Update existing comment
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body
              });
            } else {
              // Create new comment
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
              });
            }

  lighthouse-audit:
    needs: deploy-preview
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL: ${{ needs.deploy-preview.outputs.preview-url }}

  cleanup-preview:
    runs-on: ubuntu-latest
    if: github.event.action == 'closed'

    steps:
      - name: Cleanup Convex deployment
        run: |
          BRANCH_NAME="${{ github.head_ref }}"
          CLEAN_BRANCH=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
          ENV_NAME="kitchentory-preview-$CLEAN_BRANCH"
          
          # Note: Convex doesn't have automatic cleanup, you might need to implement this
          echo "Would cleanup Convex deployment: $ENV_NAME"
```

### 2. Feature Branch Workflow

```yaml
# .github/workflows/feature-branch.yml
name: Feature Branch Workflow

on:
  push:
    branches:
      - 'feature/*'
      - 'hotfix/*'
      - 'release/*'

jobs:
  validate-branch:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check branch naming
        run: |
          BRANCH_NAME="${{ github.ref_name }}"
          
          if [[ "$BRANCH_NAME" =~ ^(feature|hotfix|release)\/[a-z0-9-]+$ ]]; then
            echo "✅ Branch name follows convention: $BRANCH_NAME"
          else
            echo "❌ Branch name doesn't follow convention. Expected: feature/name, hotfix/name, or release/name"
            exit 1
          fi

      - name: Check for breaking changes
        run: |
          # Check for breaking changes in package.json
          if git diff HEAD~1 package.json | grep -E '^[+-].*"@|^[+-].*"next|^[+-].*"react'; then
            echo "📦 Dependencies changed - triggering full test suite"
            echo "FULL_TEST_SUITE=true" >> $GITHUB_ENV
          fi

  test-feature:
    needs: validate-branch
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          if [[ "${{ env.FULL_TEST_SUITE }}" == "true" ]]; then
            npm run test:all
          else
            npm run test:changed
          fi
```

### 3. Environment-specific Configuration

```typescript
// lib/env-config.ts
type Environment = 'development' | 'preview' | 'production';

interface EnvironmentConfig {
  apiUrl: string;
  convexUrl: string;
  clerkPublishableKey: string;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  featureFlags: Record<string, boolean>;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getEnvironmentType();
  
  const baseConfig = {
    apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  };

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        enableAnalytics: true,
        enableDebugMode: false,
        logLevel: 'warn',
        featureFlags: {
          betaFeatures: false,
          experimentalUI: false,
          advancedAnalytics: true,
        },
      };

    case 'preview':
      return {
        ...baseConfig,
        enableAnalytics: false,
        enableDebugMode: true,
        logLevel: 'debug',
        featureFlags: {
          betaFeatures: true,
          experimentalUI: true,
          advancedAnalytics: false,
        },
      };

    default: // development
      return {
        ...baseConfig,
        enableAnalytics: false,
        enableDebugMode: true,
        logLevel: 'debug',
        featureFlags: {
          betaFeatures: true,
          experimentalUI: true,
          advancedAnalytics: false,
        },
      };
  }
}

function getEnvironmentType(): Environment {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  
  return 'development';
}

export const config = getEnvironmentConfig();
```

## Advanced Deployment Configurations

### 1. Multi-region Deployment

```json
{
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "app/api/auth/**/*.ts": {
      "regions": ["iad1", "sfo1", "lhr1"]
    },
    "app/api/data/**/*.ts": {
      "regions": ["iad1"]
    }
  }
}
```

### 2. Edge Configuration

```typescript
// edge.config.ts
import { unstable_flag as flag } from '@vercel/flags/next';

export const showBetaFeatures = flag({
  key: 'beta-features',
  decide: ({ cookies, headers }) => {
    const isBetaUser = cookies.get('beta-user')?.value === 'true';
    const isInternal = headers.get('x-forwarded-for')?.includes('internal-ip');
    return isBetaUser || isInternal;
  },
});
```

### 3. A/B Testing Setup

```typescript
// lib/ab-testing.ts
export function getVariant(testId: string, userId: string): 'A' | 'B' {
  // Simple hash-based variant assignment
  const hash = hashString(`${testId}-${userId}`);
  return hash % 2 === 0 ? 'A' : 'B';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Usage in components
export function useABTest(testId: string) {
  const { userId } = useAuth();
  const variant = userId ? getVariant(testId, userId) : 'A';
  
  useEffect(() => {
    // Track variant assignment
    if (process.env.NODE_ENV === 'production') {
      analytics.track('ab_test_assignment', {
        testId,
        variant,
        userId,
      });
    }
  }, [testId, variant, userId]);

  return variant;
}
```

## Troubleshooting and Debugging

### 1. Common Deployment Issues

**Build Failures:**
```bash
# Debug build issues locally
npm run build 2>&1 | tee build.log

# Check specific errors
grep -i error build.log
grep -i warning build.log

# Analyze bundle
ANALYZE=true npm run build
```

**Environment Variable Issues:**
```typescript
// utils/debug-env.ts
export function debugEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CONVEX_DEPLOYMENT',
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  console.log('Environment Variables Check:');
  console.log('✅ Present:', present.join(', '));
  
  if (missing.length > 0) {
    console.error('❌ Missing:', missing.join(', '));
    return false;
  }

  return true;
}
```

### 2. Performance Debugging

```typescript
// utils/performance-debug.ts
export function debugPerformance() {
  if (typeof window === 'undefined') return;

  // Check Core Web Vitals
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.log(`${entry.name}: ${entry.value}ms`);
    });
  }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

  // Check resource loading
  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources
      .filter(resource => resource.duration > 1000)
      .sort((a, b) => b.duration - a.duration);

    if (slowResources.length > 0) {
      console.warn('Slow loading resources:', slowResources);
    }
  });
}
```

### 3. Error Boundary and Logging

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send to logging service (e.g., Sentry, LogRocket, etc.)
    fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(logError => {
      console.error('Failed to log error:', logError);
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

This comprehensive deployment guide provides everything needed to successfully deploy and maintain a NextJS 14 application with Convex and Clerk on Vercel, including robust CI/CD pipelines, performance monitoring, and troubleshooting procedures.