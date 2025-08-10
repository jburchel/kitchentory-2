# Shopping List System Architecture - Kitchentory

## Overview

This document outlines the comprehensive architecture for the Shopping List system in Kitchentory, designed to integrate seamlessly with existing inventory and household management systems.

## Core Features

1. **Shopping List Creation** - Named lists with templates and household integration
2. **Smart Suggestions** - AI-powered suggestions based on inventory data and patterns
3. **List Sharing** - Real-time collaboration with household members
4. **Store Organization** - Customizable store section layouts for efficient shopping

## Integration Points

- **Household System**: Leverages existing roles, permissions, and member management
- **Inventory System**: Connects with stock levels, categories, and consumption patterns
- **Design System**: Follows emerald-500 brand colors and established UI patterns
- **Food Categories**: Uses existing 8-category system for organization

## Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Convex (when enabled), mock data for development
- **State Management**: Custom hooks following useInventory patterns
- **Real-time**: Convex subscriptions for collaborative features
- **UI Components**: Extends existing component library

---

## Data Models & TypeScript Interfaces

### Core Shopping List Types

```typescript
// Shopping List Status
export type ShoppingListStatus = 'active' | 'completed' | 'archived' | 'template'

// Item Status in Shopping List
export type ShoppingListItemStatus = 'pending' | 'purchased' | 'unavailable' | 'substituted'

// List Member Role
export type ShoppingListRole = 'owner' | 'editor' | 'viewer'

// Store Section for organization
export interface StoreSection {
  id: string
  name: string
  displayOrder: number
  color?: string
  isDefault: boolean
  householdId?: string // null for system defaults
}

// Main Shopping List Entity
export interface ShoppingList extends Doc<'shoppingLists'> {
  name: string
  description?: string
  householdId: Id<'households'>
  ownerId: Id<'users'>
  status: ShoppingListStatus
  isTemplate: boolean
  templateName?: string
  storeLayout?: Id<'storeLayouts'>
  itemCount: number
  completedItemCount: number
  totalEstimatedCost?: number
  scheduledDate?: number
  tags?: string[]
  lastModifiedBy: Id<'users'>
  archivedAt?: number
}

// Shopping List Item
export interface ShoppingListItem extends Doc<'shoppingListItems'> {
  listId: Id<'shoppingLists'>
  name: string
  category: FoodCategory
  quantity: number
  unit: string
  status: ShoppingListItemStatus
  priority: 'low' | 'medium' | 'high'
  estimatedCost?: number
  actualCost?: number
  notes?: string
  assignedTo?: Id<'users'>
  inventoryItemId?: Id<'products'> // Link to inventory if exists
  storeSectionId?: Id<'storeSections'>
  brand?: string
  size?: string
  substitutionNotes?: string
  purchasedAt?: number
  addedBy: Id<'users'>
  lastModifiedBy: Id<'users'>
  displayOrder: number
}

// List Sharing/Collaboration
export interface ShoppingListMember extends Doc<'shoppingListMembers'> {
  listId: Id<'shoppingLists'>
  userId: Id<'users'>
  role: ShoppingListRole
  canEdit: boolean
  canAssignItems: boolean
  canCompleteItems: boolean
  canInviteOthers: boolean
  joinedAt: number
  lastActiveAt?: number
  notificationSettings?: {
    itemAdded: boolean
    itemCompleted: boolean
    listCompleted: boolean
    itemAssigned: boolean
  }
}

// Store Layout Management
export interface StoreLayout extends Doc<'storeLayouts'> {
  name: string
  householdId: Id<'households'>
  sections: Array<{
    sectionId: Id<'storeSections'>
    displayOrder: number
  }>
  isDefault: boolean
  createdBy: Id<'users'>
}

// Smart Suggestions
export interface ShoppingSuggestion extends Doc<'shoppingSuggestions'> {
  householdId: Id<'households'>
  itemName: string
  category: FoodCategory
  reason: 'low_stock' | 'out_of_stock' | 'recurring_purchase' | 'seasonal' | 'frequently_bought'
  priority: number // 0-100 scoring
  inventoryItemId?: Id<'products'>
  lastPurchaseDate?: number
  averageDaysBetweenPurchases?: number
  suggestedQuantity?: number
  suggestedUnit?: string
  suggestedBrand?: string
  confidence: number // 0-1 confidence score
  createdAt: number
  expiresAt: number
}

// Shopping List Template
export interface ShoppingListTemplate extends Doc<'shoppingListTemplates'> {
  name: string
  description?: string
  householdId?: Id<'households'> // null for system templates
  isPublic: boolean
  category: 'weekly_groceries' | 'party_planning' | 'holiday_shopping' | 'custom'
  items: Array<{
    name: string
    category: FoodCategory
    quantity: number
    unit: string
    priority: 'low' | 'medium' | 'high'
    notes?: string
  }>
  usageCount: number
  createdBy: Id<'users'>
  tags?: string[]
}
```

### Enhanced Types with Relationships

```typescript
// Shopping List with populated relationships
export interface ShoppingListWithDetails extends ShoppingList {
  owner: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
  } | null
  household: EnhancedHousehold | null
  members: ShoppingListMemberWithUser[]
  recentActivity?: ShoppingListActivity[]
}

// Shopping List Member with user details
export interface ShoppingListMemberWithUser extends ShoppingListMember {
  user: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
  } | null
}

// Shopping List Item with additional context
export interface ShoppingListItemWithDetails extends ShoppingListItem {
  assignedUser?: {
    firstName?: string
    lastName?: string
    imageUrl?: string
  } | null
  inventoryItem?: {
    currentQuantity: number
    lastPurchasePrice?: number
    brand?: string
  } | null
  storeSection?: StoreSection | null
}

// Activity tracking for lists
export interface ShoppingListActivity extends Doc<'shoppingListActivities'> {
  listId: Id<'shoppingLists'>
  userId: Id<'users'>
  action: 'created' | 'item_added' | 'item_completed' | 'item_removed' | 'shared' | 'completed'
  itemName?: string
  details?: string
  metadata?: any
}

// Dashboard aggregations
export interface ShoppingListStats {
  totalLists: number
  activeLists: number
  completedLists: number
  totalItems: number
  completedItems: number
  averageItemsPerList: number
  totalEstimatedCost: number
  totalActualCost: number
  mostUsedCategories: Array<{
    category: FoodCategory
    count: number
  }>
  recentActivity: ShoppingListActivity[]
}
```

### Hook Return Types

```typescript
// Main shopping lists hook
export interface UseShoppingListsReturn {
  lists: ShoppingListWithDetails[]
  stats: ShoppingListStats
  suggestions: ShoppingSuggestion[]
  templates: ShoppingListTemplate[]
  loading: boolean
  error: string | null
  
  // List Management
  createList: (data: CreateListData) => Promise<ShoppingList>
  updateList: (listId: string, data: UpdateListData) => Promise<ShoppingList>
  deleteList: (listId: string) => Promise<void>
  archiveList: (listId: string) => Promise<void>
  duplicateList: (listId: string, name: string) => Promise<ShoppingList>
  
  // Template Management
  createTemplate: (data: CreateTemplateData) => Promise<ShoppingListTemplate>
  createListFromTemplate: (templateId: string, name: string) => Promise<ShoppingList>
  
  // Sharing & Collaboration
  shareList: (listId: string, userEmail: string, role: ShoppingListRole) => Promise<void>
  updateMemberRole: (listId: string, userId: string, role: ShoppingListRole) => Promise<void>
  removeMember: (listId: string, userId: string) => Promise<void>
  
  // Search & Filter
  searchLists: (query: string) => ShoppingListWithDetails[]
  filterLists: (filter: 'all' | 'active' | 'completed' | 'shared' | 'owned') => ShoppingListWithDetails[]
  
  // Smart Features
  generateSuggestions: (householdId: string) => Promise<void>
  refreshSuggestions: (householdId: string) => Promise<void>
}

// Individual list management hook
export interface UseShoppingListReturn {
  list: ShoppingListWithDetails | null
  items: ShoppingListItemWithDetails[]
  members: ShoppingListMemberWithUser[]
  storeLayout: StoreLayout | null
  loading: boolean
  error: string | null
  
  // Item Management
  addItem: (data: AddItemData) => Promise<ShoppingListItem>
  updateItem: (itemId: string, data: UpdateItemData) => Promise<ShoppingListItem>
  removeItem: (itemId: string) => Promise<void>
  completeItem: (itemId: string, actualCost?: number) => Promise<void>
  uncompleteItem: (itemId: string) => Promise<void>
  assignItem: (itemId: string, userId: string) => Promise<void>
  
  // Batch Operations
  addMultipleItems: (items: AddItemData[]) => Promise<void>
  completeMultipleItems: (itemIds: string[]) => Promise<void>
  clearCompletedItems: () => Promise<void>
  
  // Organization
  reorderItems: (itemIds: string[]) => Promise<void>
  groupByStoreSection: () => Record<string, ShoppingListItemWithDetails[]>
  groupByCategory: () => Record<FoodCategory, ShoppingListItemWithDetails[]>
  
  // Real-time Collaboration
  getActiveMembers: () => ShoppingListMemberWithUser[]
  trackMemberActivity: (action: string, details?: string) => Promise<void>
}

// Smart suggestions hook
export interface UseSmartSuggestionsReturn {
  suggestions: ShoppingSuggestion[]
  loading: boolean
  error: string | null
  
  generateSuggestions: (householdId: string) => Promise<void>
  addSuggestionToList: (suggestionId: string, listId: string) => Promise<void>
  dismissSuggestion: (suggestionId: string) => Promise<void>
  rateSuggestion: (suggestionId: string, rating: number) => Promise<void>
}
```

## Component Architecture

### File Structure

```
src/
├── components/
│   └── shopping/
│       ├── dashboard/
│       │   ├── ShoppingDashboard.tsx
│       │   ├── ShoppingListGrid.tsx
│       │   ├── ShoppingStats.tsx
│       │   └── QuickActions.tsx
│       ├── lists/
│       │   ├── ShoppingListView.tsx
│       │   ├── ShoppingListForm.tsx
│       │   ├── ShoppingListCard.tsx
│       │   └── ShoppingListHeader.tsx
│       ├── items/
│       │   ├── ShoppingListItem.tsx
│       │   ├── AddItemForm.tsx
│       │   ├── ItemDetails.tsx
│       │   └── BulkItemActions.tsx
│       ├── suggestions/
│       │   ├── SmartSuggestions.tsx
│       │   ├── SuggestionCard.tsx
│       │   └── SuggestionsPanel.tsx
│       ├── collaboration/
│       │   ├── ListSharing.tsx
│       │   ├── MemberManagement.tsx
│       │   ├── ActivityFeed.tsx
│       │   └── RealTimeIndicators.tsx
│       ├── organization/
│       │   ├── StoreSectionView.tsx
│       │   ├── CategoryView.tsx
│       │   ├── StoreLayoutEditor.tsx
│       │   └── SectionManagement.tsx
│       ├── templates/
│       │   ├── TemplateSelector.tsx
│       │   ├── TemplateCreator.tsx
│       │   └── TemplateCard.tsx
│       └── index.ts
├── app/
│   └── shopping/
│       ├── page.tsx                    # Shopping dashboard
│       ├── [listId]/
│       │   ├── page.tsx               # Individual list view
│       │   ├── edit/page.tsx          # Edit list
│       │   └── share/page.tsx         # Sharing settings
│       ├── templates/
│       │   ├── page.tsx               # Template library
│       │   └── create/page.tsx        # Create template
│       └── new/page.tsx               # Create new list
├── hooks/
│   ├── useShopping.ts                 # Main shopping lists hook
│   ├── useShoppingList.ts             # Individual list hook
│   ├── useSmartSuggestions.ts         # Suggestions hook
│   └── useStoreLayout.ts              # Store organization hook
└── types/
    └── shopping.ts                    # All shopping-related types
```

### Key Components

#### 1. ShoppingDashboard.tsx
```typescript
interface ShoppingDashboardProps {
  householdId: string
}

// Main dashboard showing all lists, stats, and suggestions
// Integrates with existing dashboard patterns
```

#### 2. ShoppingListView.tsx
```typescript
interface ShoppingListViewProps {
  listId: string
  viewMode: 'default' | 'store-sections' | 'categories'
}

// Individual list view with real-time collaboration
// Supports different organization modes
```

#### 3. SmartSuggestions.tsx
```typescript
interface SmartSuggestionsProps {
  householdId: string
  targetListId?: string
  maxSuggestions?: number
}

// AI-powered suggestions based on inventory and patterns
```

#### 4. ListSharing.tsx
```typescript
interface ListSharingProps {
  listId: string
  currentMembers: ShoppingListMemberWithUser[]
  householdMembers: HouseholdMemberWithUser[]
}

// Collaboration and sharing interface
```

## API Design & Backend Integration

### Convex Schema Extensions

```typescript
// Add to existing schema.ts
export default defineSchema({
  // ... existing schemas
  
  shoppingLists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    householdId: v.id('households'),
    ownerId: v.id('users'),
    status: v.union(v.literal('active'), v.literal('completed'), v.literal('archived'), v.literal('template')),
    isTemplate: v.boolean(),
    templateName: v.optional(v.string()),
    storeLayoutId: v.optional(v.id('storeLayouts')),
    itemCount: v.number(),
    completedItemCount: v.number(),
    totalEstimatedCost: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    lastModifiedBy: v.id('users'),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_owner', ['ownerId'])
    .index('by_status', ['status'])
    .index('by_household_status', ['householdId', 'status']),

  shoppingListItems: defineTable({
    listId: v.id('shoppingLists'),
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    status: v.union(v.literal('pending'), v.literal('purchased'), v.literal('unavailable'), v.literal('substituted')),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id('users')),
    inventoryItemId: v.optional(v.id('products')),
    storeSectionId: v.optional(v.id('storeSections')),
    brand: v.optional(v.string()),
    size: v.optional(v.string()),
    substitutionNotes: v.optional(v.string()),
    purchasedAt: v.optional(v.number()),
    addedBy: v.id('users'),
    lastModifiedBy: v.id('users'),
    displayOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_list', ['listId'])
    .index('by_list_status', ['listId', 'status'])
    .index('by_assigned', ['assignedTo'])
    .index('by_category', ['category']),

  // ... additional tables for members, suggestions, templates, etc.
})
```

### Hook Implementation Patterns

```typescript
// useShopping.ts - Main hook following useInventory patterns
export function useShopping(householdId: string): UseShoppingListsReturn {
  const [lists, setLists] = useState<ShoppingListWithDetails[]>([])
  const [suggestions, setSuggestions] = useState<ShoppingSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time subscriptions when Convex is enabled
  // Mock data management for development
  // CRUD operations following inventory patterns
  // Search and filtering capabilities
  // Smart suggestions integration

  return {
    lists,
    suggestions,
    stats,
    loading,
    error,
    // ... all operations
  }
}
```

## User Experience Flows

### 1. Create Shopping List Flow
```
Dashboard → "New List" → Name & Settings → Template (Optional) → 
Share with Members → Smart Suggestions → Add Initial Items → Save
```

### 2. Shopping Experience Flow
```
List View → Store Sections Mode → Navigate Store → 
Check Off Items → Add Notes/Costs → Mark Complete
```

### 3. Collaboration Flow
```
Share List → Invite Members → Assign Roles → 
Real-time Editing → Activity Notifications → Completion Tracking
```

### 4. Smart Suggestions Flow
```
Analyze Inventory → Generate Suggestions → 
Review & Filter → Add to List → Learn from Actions
```

## Integration with Existing Systems

### Household System Integration
- Uses existing household membership and roles
- Extends permissions with shopping-specific capabilities
- Integrates with household invitation system
- Respects household settings for thresholds and preferences

### Inventory System Integration
- Links shopping list items to inventory items
- Uses inventory data for smart suggestions
- Tracks purchase-to-inventory flow
- Analyzes consumption patterns for suggestions

### Design System Integration
- Follows emerald-500 (#10B981) brand color scheme
- Uses existing component patterns and utilities
- Maintains consistent spacing and typography
- Implements responsive design principles

## Performance Considerations

### Optimization Strategies
1. **Virtual scrolling** for large lists
2. **Lazy loading** of list details
3. **Caching** of suggestions and templates
4. **Debounced search** and filtering
5. **Real-time updates** with conflict resolution
6. **Offline support** for shopping experience

### Scalability Factors
1. **Pagination** for dashboard views
2. **Indexed queries** for fast filtering
3. **Background processing** for suggestions
4. **CDN optimization** for static assets
5. **Database optimization** for collaboration queries

This comprehensive architecture provides a robust, scalable shopping list system that seamlessly integrates with Kitchentory's existing codebase while offering powerful collaboration and smart suggestion features.