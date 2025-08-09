# Convex Integration Setup Guide

## Overview

This document outlines the complete Convex integration that has been implemented for the Kitchentory project. The integration includes a comprehensive database schema, real-time subscriptions, and complete CRUD operations for all kitchen inventory management features.

## What's Been Implemented

### 1. ✅ Package Installation
- `convex` package installed
- `concurrently` for running dev servers together

### 2. ✅ Database Schema (`convex/schema.ts`)
Complete schema with the following tables:
- `households` - Multi-tenant household management
- `householdMembers` - User roles and permissions
- `categories` - Hierarchical category system
- `products` - Master product catalog
- `inventoryItems` - Actual inventory tracking
- `shoppingLists` - Shopping list management
- `shoppingListItems` - Individual shopping items
- `notifications` - User notifications
- `activityLog` - Audit trail

### 3. ✅ Convex Functions
Complete CRUD operations for all entities:
- `convex/households.ts` - Household management
- `convex/categories.ts` - Category operations
- `convex/products.ts` - Product management
- `convex/inventoryItems.ts` - Inventory operations
- `convex/shoppingLists.ts` - Shopping list features

### 4. ✅ Client Configuration
- `src/lib/convex.ts` - Convex client setup
- `src/components/providers/ConvexProvider.tsx` - React provider
- `src/hooks/useConvex.ts` - Custom hooks for all operations
- `src/types/convex.ts` - TypeScript type definitions
- `src/lib/convex-utils.ts` - Utility functions

### 5. ✅ NextJS Integration
- Root layout updated with ConvexProvider
- Environment variables configured
- Development scripts added

## Next Steps to Complete Setup

### Step 1: Create Convex Account and Project

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign up or log in
3. Create a new project for Kitchentory
4. Copy your deployment URL

### Step 2: Configure Environment Variables

Update your `.env.local` file with your actual Convex deployment URL:

```bash
# Replace with your actual Convex deployment URL
NEXT_PUBLIC_CONVEX_URL="https://your-deployment-name.convex.cloud"
CONVEX_DEPLOY_KEY="your-deploy-key"
```

### Step 3: Deploy Schema and Functions

```bash
# Login to Convex (first time only)
npx convex login

# Deploy schema and functions
npx convex dev
```

This will:
- Deploy the database schema
- Deploy all the Convex functions
- Generate proper TypeScript types
- Start the development server

### Step 4: Start Development

```bash
# Run both Next.js and Convex dev servers
npm run dev:with-convex

# Or run them separately:
# Terminal 1:
npm run convex:dev

# Terminal 2:
npm run dev
```

## Features Included

### Multi-Household Support
- Each household is isolated
- Role-based access control (owner/admin/member)
- Granular permissions system

### Inventory Management
- Product catalog with categories
- Real-time inventory tracking
- Expiration date monitoring
- Low stock alerts
- Location-based organization

### Shopping Lists
- Multiple shopping lists per household
- Auto-generation from low stock items
- Item completion tracking
- Price tracking (estimated vs actual)

### Real-time Updates
- All data updates in real-time across devices
- Optimistic UI updates
- Automatic conflict resolution

### Search and Filtering
- Full-text search across products
- Category-based filtering
- Barcode lookup support
- Tag-based organization

## Database Schema Highlights

### Households Table
- Multi-tenant support
- Custom settings per household
- Currency and timezone support

### Products with Rich Metadata
- Nutritional information
- Barcode support
- Category hierarchies
- Custom tags

### Smart Inventory Tracking
- Expiration monitoring
- Purchase price tracking
- Location management
- Consumption history

### Flexible Shopping Lists
- Product-based or custom items
- Priority levels
- Price estimation
- Completion tracking

## TypeScript Integration

All Convex functions are fully typed with:
- Generated API types
- Custom hook types
- Form validation types
- UI state types

## Error Handling

- Comprehensive error boundaries
- Graceful fallbacks
- Retry mechanisms
- Loading states

## Performance Optimizations

- Efficient queries with proper indexing
- Real-time subscriptions only where needed
- Optimistic updates for better UX
- Proper data pagination

## Security Features

- Row-level security through household isolation
- Role-based access control
- Input validation on all mutations
- Audit trail for all changes

## Development Workflow

1. Make schema changes in `convex/schema.ts`
2. Add/modify functions in respective files
3. Update TypeScript types in `src/types/convex.ts`
4. Create/update React hooks in `src/hooks/useConvex.ts`
5. Build UI components using the hooks

## Testing

The schema and functions are designed to be testable with:
- Unit tests for individual functions
- Integration tests for complex workflows
- End-to-end tests for complete user journeys

## Migration Path

For existing data:
1. Export current data
2. Transform to match new schema
3. Use Convex import functions
4. Verify data integrity

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npx convex dev` to generate proper types
2. **Environment Variables**: Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly
3. **Authentication**: Make sure you're logged in with `npx convex login`

### Support Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Discord Community](https://discord.gg/convex)
- [GitHub Issues](https://github.com/get-convex/convex-js/issues)

---

The Convex integration is now complete and ready for development. Simply follow the setup steps above to get started!