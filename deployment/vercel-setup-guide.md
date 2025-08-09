# Vercel Deployment Guide for Kitchentory

This guide provides step-by-step instructions for deploying the Kitchentory NextJS application to Vercel.

## Prerequisites

- Vercel account (free or paid)
- GitHub repository access
- Node.js 18+ locally (for testing)

## Quick Setup

### 1. Connect GitHub Repository to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `kitchentory`
4. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### 2. Environment Variables Setup

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:

```bash
# Required Variables
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_production_secret_min_32_chars
API_KEY=your_production_api_key

# Public Variables
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional Variables
VERCEL_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
```

### 3. Domain Configuration (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your custom domain

### 4. Automatic Deployments

Deployments are automatically triggered by:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests to `main` branch

## Manual Deployment

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json

The project includes a `vercel.json` file with optimized settings:

- Security headers (CORS, XSS protection)
- Static asset caching
- API function timeouts
- Redirects and rewrites

### Environment Templates

- `.env.local.example` - Development environment
- `.env.production.example` - Production environment template

## Build Optimization

The project is configured with:

- **Framework**: Next.js with App Router
- **TypeScript**: Full type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Testing**: Jest with React Testing Library
- **Performance**: Image optimization, static asset caching

## GitHub Actions Integration

The project includes a GitHub Actions workflow (`.github/workflows/vercel-deploy.yml`) that:

1. Runs tests and linting
2. Builds the application
3. Deploys to Vercel
4. Comments on PRs with deployment status

### Required GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
```

To find these values:

- **VERCEL_TOKEN**: Vercel Dashboard → Settings → Tokens
- **ORG_ID**: Vercel Dashboard → Settings → General (Team ID)
- **PROJECT_ID**: Project Settings → General (Project ID)

## Performance Monitoring

### Built-in Analytics

Enable Vercel Analytics:

1. Go to **Analytics** tab in your project
2. Enable Web Analytics
3. Add `VERCEL_ANALYTICS_ID` to environment variables

### Speed Insights

Enable Vercel Speed Insights:

1. Go to **Speed Insights** tab
2. Enable the feature
3. Install package if needed: `npm install @vercel/speed-insights`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies: `npm ci`
   - Review build logs in Vercel dashboard

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Redeploy after adding variables

3. **API Routes**
   - Verify API routes are in correct directory structure
   - Check function timeout limits (30s default)
   - Review function logs in Vercel dashboard

4. **Domain Issues**
   - Verify DNS configuration
   - Check domain ownership
   - Allow up to 24 hours for DNS propagation

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All pages render without errors
- [ ] API endpoints respond correctly
- [ ] Environment variables are working
- [ ] Custom domains resolve correctly
- [ ] SSL certificates are active
- [ ] Analytics are tracking (if enabled)
- [ ] Error monitoring is configured (if using Sentry)

## Security Considerations

The deployment includes security headers:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

Additional security measures to consider:

- Enable Vercel Firewall (Pro plan)
- Configure rate limiting
- Use Vercel Password Protection for staging
- Enable audit logs (Pro plan)
