# Developer Account Setup Guide

This guide covers setting up all required developer accounts and services for Kitchentory's NextJS 14 + Convex + Clerk + Vercel tech stack.

## Table of Contents

1. [Vercel Account Setup](#vercel-account-setup)
2. [Convex Account Setup](#convex-account-setup)
3. [Clerk Account Setup](#clerk-account-setup)
4. [GitHub Account Configuration](#github-account-configuration)
5. [Domain and DNS Setup](#domain-and-dns-setup)
6. [Environment Variables Configuration](#environment-variables-configuration)
7. [Development Environment Setup](#development-environment-setup)
8. [Production Deployment Checklist](#production-deployment-checklist)

## Vercel Account Setup

### Prerequisites

- GitHub account with access to your repository
- Valid email address
- Optional: Credit card for Pro features

### Account Creation

#### Step 1: Sign Up

1. Visit [vercel.com](https://vercel.com)
2. Click "Sign Up" 
3. Choose "Continue with GitHub" (recommended for seamless integration)
4. Authorize Vercel to access your GitHub repositories
5. Complete profile setup with your details

#### Step 2: Team Setup (Optional)

1. **Individual Account**: Free tier includes:
   - Unlimited personal projects
   - 100GB bandwidth/month
   - Serverless functions
   - Analytics (basic)

2. **Team Account**: Pro tier ($20/month) includes:
   - Team collaboration
   - Unlimited bandwidth
   - Enhanced analytics
   - Password protection for previews
   - Priority support

#### Step 3: Project Configuration

1. **Import Project**:
   - Connect your GitHub repository
   - Select the Kitchentory repository
   - Configure build settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next` (default)
     - Install Command: `npm install`

2. **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add required variables (see Environment Variables section)
   - Configure different values for Development, Preview, and Production

### Domain Configuration

#### Custom Domain Setup

1. **Add Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `kitchentory.com`)
   - Follow DNS configuration instructions

2. **DNS Configuration**:

```
   # A Record
   Type: A
   Name: @
   Value: 76.76.19.19
   
   # CNAME Record
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Vercel automatically provisions SSL certificates
   - Certificates auto-renew
   - HTTPS redirect is enabled by default

### Deployment Settings

#### Build & Development Settings

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

#### Function Configuration

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Convex Account Setup

### Prerequisites

- Valid email address
- GitHub account (for authentication)
- Node.js 18+ installed locally

### Account Creation

#### Step 1: Sign Up

1. Visit [convex.dev](https://www.convex.dev)
2. Click "Start Building"
3. Sign up with GitHub or email
4. Verify your email address
5. Complete onboarding tutorial

#### Step 2: Create Project

1. **New Project**:
   - Click "Create a Project"
   - Choose project name: "kitchentory" or "kitchentory-prod"
   - Select region closest to your users
   - Initialize with TypeScript templates

2. **Development Setup**:

```bash
   # Install Convex CLI
   npm install -g convex
   
   # Login to Convex
   npx convex login
   
   # Initialize in your project
   npx convex dev
   ```

#### Step 3: Database Configuration

1. **Schema Setup**:
   - Create `convex/schema.ts` with your data models
   - Define tables for users, households, inventory, recipes, shopping lists
   - Set up indexes for optimal query performance

2. **Functions Setup**:
   - Create queries for data retrieval
   - Create mutations for data modifications
   - Set up authentication helpers
   - Configure real-time subscriptions

### Production Deployment

#### Create Production Environment

1. **Production Project**:
   - Create separate production deployment
   - Use naming convention: `kitchentory-prod`
   - Deploy schema and functions:
  
   ```bash
   npx convex deploy --prod
   ```

2. **Environment Variables**:
   - Set Clerk webhook secrets
   - Configure any external API keys
   - Set up monitoring and logging

#### Billing and Limits

- **Free Tier**: 1M function calls/month, 8GB storage
- **Pro Tier**: $25/month base + usage
- **Enterprise**: Custom pricing for high-volume applications

## Clerk Account Setup

### Prerequisites

- Valid email address
- Domain for your application
- Understanding of authentication flows

### Account Creation

#### Step 1: Sign Up

1. Visit [clerk.com](https://clerk.com)
2. Click "Start building for free"
3. Sign up with email or GitHub
4. Verify email and complete profile
5. Accept terms of service

#### Step 2: Create Application

1. **Application Setup**:
   - Click "Create Application"
   - Name: "Kitchentory" 
   - Choose authentication methods:
     - ✅ Email address
     - ✅ Password
     - ✅ Google (optional)
     - ✅ Apple (for mobile)
   - Select appearance theme

2. **Application Configuration**:
   - **Domain Settings**:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`
   - **Redirect URLs**:
     - Sign-in: `/dashboard`
     - Sign-up: `/onboarding`
     - Sign-out: `/`

### Authentication Methods

#### Email & Password

- Default configuration works out of the box
- Password requirements: 8+ characters, mixed case, numbers
- Email verification required

#### Social Authentication

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add redirect URIs from Clerk dashboard

2. **Apple Sign-In**:
   - Go to [Apple Developer](https://developer.apple.com)
   - Create App ID with Sign in with Apple capability
   - Create Service ID
   - Configure domains and redirect URLs
   - Generate private key for authentication

### User Management

#### User Profile Configuration

```typescript
// Configure user profile fields
{
  "first_name": { "required": false },
  "last_name": { "required": false },
  "profile_image": { "required": false },
  "phone_number": { "required": false },
  "username": { "required": false }
}
```

#### Subscription Management

1. **Public Metadata**:
   - `subscription_tier`: "free" | "premium" | "pro"
   - `subscription_status`: "active" | "canceled" | "past_due"
   - `subscription_id`: Stripe subscription ID

2. **Private Metadata**:
   - Internal tracking data
   - Admin notes
   - Feature flags

### Webhooks Configuration

#### Required Webhooks

1. **User Events**:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
   - `session.ended`

2. **Webhook Endpoint**:
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: Select all user-related events
   - Copy webhook secret for environment variables

#### Webhook Security

```typescript
// Verify webhook signatures
import { Webhook } from 'svix'

const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

try {
  const evt = webhook.verify(body, headers) as WebhookEvent
  // Process event
} catch (err) {
  return new Response('Invalid signature', { status: 400 })
}
```

### Billing and Pricing

#### Free Tier

- 10,000 Monthly Active Users (MAU)
- Standard authentication
- Basic user management
- Community support

#### Pro Tier ($25/month + usage)

- 100,000 MAU included
- Advanced features (MFA, custom fields)
- Advanced user management
- Priority support

## GitHub Account Configuration

### Repository Setup

#### Repository Creation

1. **Create Repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: "kitchentory" or your preferred name
   - Set to Public or Private
   - Initialize with README.md
   - Add .gitignore for Node.js

2. **Repository Settings**:
   - Enable GitHub Pages (optional)
   - Configure branch protection rules
   - Set up security policies
   - Enable Dependabot alerts

#### Secrets Configuration

Add these secrets in Settings → Secrets and variables → Actions:

```
# Vercel Integration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id
VERCEL_PROJECT_ID=your_project_id

# Convex Integration
CONVEX_DEPLOY_KEY=your_convex_deploy_key
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Integration  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Optional: Backup and monitoring
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### Actions and Workflows

#### CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g vercel
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Domain and DNS Setup

### Domain Registration

#### Domain Registrars

Popular options:

- **Vercel Domains**: Integrated with Vercel platform
- **Cloudflare**: Free DNS management
- **Namecheap**: Competitive pricing
- **Google Domains**: Simple management

#### Domain Selection

- Primary: `kitchentory.com`
- Alternatives: `kitchentory.app`, `getkitchentory.com`
- Consider trademark searches
- Purchase common TLDs to protect brand

### DNS Configuration

#### Vercel DNS Setup

1. **A Records**:

```
   Type: A
   Name: @
   Value: 76.76.19.19
   TTL: 300
   ```

2. **CNAME Records**:

```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 300
   ```

1. **Verification**:

   ```bash
   # Check DNS propagation
   dig kitchentory.com
   dig www.kitchentory.com
   
   # Test HTTPS
   curl -I https://kitchentory.com
   ```

#### Advanced DNS Setup

1. **Subdomains**:
   - `api.kitchentory.com` → API endpoint (optional)
   - `blog.kitchentory.com` → Blog/marketing site
   - `status.kitchentory.com` → Status page

2. **Email Setup**:
   - MX records for custom email
   - SPF records for email security
   - DKIM configuration for authentication

## Environment Variables Configuration

### Development Environment

Create `.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=your-dev-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production Environment

Configure in Vercel Dashboard:

```env
# Convex Production
CONVEX_DEPLOYMENT=your-prod-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Clerk Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# Application Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Analytics and Monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Security Best Practices

#### Environment Variable Security

1. **Public vs Private Variables**:
   - `NEXT_PUBLIC_*`: Exposed to browser, use for non-sensitive data
   - Regular variables: Server-side only, use for secrets

2. **Rotation Policy**:
   - Rotate secrets monthly
   - Use different keys for dev/staging/production
   - Implement key versioning

3. **Access Control**:
   - Limit team access to production secrets
   - Use Vercel Teams for role-based access
   - Enable audit logging

## Development Environment Setup

### Local Development

#### Prerequisites

- Node.js 18+ or 20+
- Git installed
- Code editor (VS Code recommended)
- Terminal/command line access

#### Project Setup

```bash
# Clone repository
git clone https://github.com/yourusername/kitchentory.git
cd kitchentory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Initialize Convex
npx convex dev

# Start development server
npm run dev
```

#### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

#### Recommended Extensions

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### Testing Environment

#### Jest Configuration

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
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
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
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Production Deployment Checklist

### Pre-Deployment Verification

#### Code Quality

- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Tests passing (unit and integration)
- [ ] End-to-end tests passing
- [ ] Code review completed
- [ ] Performance audit completed

#### Environment Configuration

- [ ] Production environment variables set
- [ ] Webhook endpoints configured
- [ ] Domain DNS properly configured
- [ ] SSL certificates active
- [ ] Security headers configured

#### Database and Backend

- [ ] Convex production deployment created
- [ ] Database schema deployed
- [ ] Indexes created for performance
- [ ] Functions deployed and tested
- [ ] Backup strategy implemented

### Deployment Process

#### Automated Deployment

1. **Merge to Main Branch**:

   ```bash
   git checkout main
   git merge feature-branch
   git push origin main
   ```

2. **Monitor Deployment**:
   - Check GitHub Actions workflow
   - Verify Vercel deployment logs
   - Test production URL
   - Verify all features working

3. **Post-Deployment Testing**:
   - User authentication flows
   - Database operations
   - API endpoints
   - Mobile responsiveness
   - Performance metrics

### Monitoring Setup

#### Analytics Configuration

- Vercel Analytics enabled
- Speed Insights configured
- Error tracking active
- Performance monitoring set up

#### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    // Check external services
    // Verify authentication
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        auth: 'operational',
        api: 'responding'
      }
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: 'Service check failed'
    }, { status: 503 });
  }
}
```

### Launch Strategy

#### Soft Launch (Week 1)

- Deploy to production environment
- Test with internal team (5-10 people)
- Monitor performance and errors
- Fix any critical issues
- Collect initial feedback

#### Beta Launch (Week 2-3)

- Open to beta testers (50-100 people)
- Send invitations to email list
- Gather user feedback
- Monitor usage patterns
- Iterate based on feedback

#### Public Launch (Week 4)

- Remove beta restrictions
- Announce on social media
- Submit to Product Hunt
- Monitor traffic and performance
- Be ready for scaling issues

### Success Metrics

#### Technical Metrics

- **Uptime**: > 99.5%
- **Response Time**: < 500ms (95th percentile)
- **Error Rate**: < 0.1%
- **Build Time**: < 3 minutes
- **Core Web Vitals**: All green

#### Business Metrics

- **User Registration**: Track daily signups
- **Conversion Rate**: Free to paid conversions
- **User Engagement**: Daily/weekly active users
- **Feature Usage**: Track feature adoption
- **Support Tickets**: Monitor volume and resolution time

This comprehensive setup guide ensures all developer accounts and services are properly configured for successful deployment and operation of your Kitchentory application.