# Convex Backend Implementation

## Overview

This document describes the comprehensive Convex backend implementation for the household management system. The backend provides a robust, secure, and scalable foundation for multi-user household inventory management.

## Architecture

### Database Schema

The backend uses Convex's document-based database with the following main tables:

- **users** - User profiles and preferences
- **households** - Household information and settings  
- **householdMemberships** - User-household relationships with roles and permissions
- **householdInvitations** - Invitation system for adding members
- **inventoryItems** - Household inventory items
- **products** - Global product database
- **categories** - Product categories
- **storageLocations** - Storage locations within households
- **activityFeed** - Real-time activity tracking
- **auditLog** - Security and compliance logging

### Core Modules

1. **Authentication (`auth.ts`)** - Clerk integration and permission management
2. **Households (`households.ts`)** - Household CRUD operations
3. **Memberships (`memberships.ts`)** - Member management and role assignments
4. **Invitations (`invitations.ts`)** - Invitation system for adding members
5. **Users (`users.ts`)** - User profile management
6. **Products (`products.ts`)** - Product lookup and search
7. **Validators (`validators.ts`)** - Data validation utilities
8. **Utils (`utils.ts`)** - Common utility functions

## Features

### 🔐 Authentication & Authorization

- **Clerk Integration**: Seamless authentication with Clerk
- **Role-Based Access Control**: Owner, Admin, Member, Viewer roles
- **Permission System**: Granular permissions (read, write, delete, invite, manage)
- **Row-Level Security**: Users can only access data they have permission for

### 🏠 Household Management

- **CRUD Operations**: Create, read, update, delete households
- **Settings Management**: Currency, units, expiration warnings, guest access
- **Member Management**: Add/remove members, update roles, transfer ownership
- **Activity Tracking**: Real-time feed of household activities

### 📧 Invitation System

- **Email Invitations**: Send invitations via email with secure tokens
- **Invite Codes**: Simple 6-character codes for easy sharing
- **Role Assignment**: Invite users with specific roles and permissions
- **Expiry Management**: Automatic expiration of old invitations

### 📊 Data Validation & Security

- **Comprehensive Validation**: All inputs are validated before processing
- **Audit Logging**: Complete audit trail of all operations
- **Error Handling**: Graceful error handling with meaningful messages
- **Security Checks**: Multiple layers of security validation

## API Reference

### Household Operations

```typescript
// Create household
const householdId = await createHousehold({
  name: "My Household",
  description: "Family household",
  settings: {
    currency: "USD",
    defaultUnit: "pieces",
    expirationWarningDays: 7,
    allowGuestView: false
  }
});

// Get household details
const household = await getHousehold({ householdId });

// Update household
await updateHousehold({
  householdId,
  name: "Updated Name",
  settings: { currency: "EUR" }
});

// Join via invite code
const joinedHouseholdId = await joinHouseholdByCode({ 
  inviteCode: "ABC123" 
});
```

### Membership Management

```typescript
// Get household members
const members = await getHouseholdMembers({ householdId });

// Update member role
await updateMemberRole({
  householdId,
  userId: "user_123",
  role: "admin",
  customPermissions: ["read", "write", "invite"]
});

// Transfer ownership
await transferOwnership({
  householdId,
  newOwnerId: "user_456"
});

// Remove member
await removeMember({
  householdId,
  userId: "user_789"
});
```

### Invitation System

```typescript
// Send invitation
const invitation = await sendInvitation({
  householdId,
  email: "friend@example.com",
  role: "member",
  message: "Join our household!"
});

// Accept invitation
await acceptInvitation({ token: "invitation_token" });

// Get user's pending invitations
const invitations = await getUserInvitations();
```

### User Management

```typescript
// Get current user
const user = await getCurrentUser();

// Update profile
await updateUserProfile({
  name: "John Doe",
  preferences: {
    notifications: {
      expiration: true,
      lowStock: false,
      invitations: true,
      activityFeed: true
    }
  }
});

// Get user statistics
const stats = await getUserStats();
```

## Permission System

### Roles

- **Owner**: Full control over household, can delete household
- **Admin**: Can manage members, settings, and all inventory
- **Member**: Can read/write inventory items
- **Viewer**: Read-only access to household data

### Permissions

- **read**: View household data
- **write**: Add/edit inventory items
- **delete**: Remove inventory items
- **invite**: Send invitations to new members
- **manage_members**: Add/remove members, change roles
- **manage_settings**: Modify household settings

## Security Features

### Authentication
- Integration with Clerk for secure authentication
- JWT token validation on all requests
- Automatic user creation and profile sync

### Authorization
- Role-based access control with granular permissions
- Row-level security ensuring users only access their data
- Permission checks on all operations

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection through proper data handling

### Audit & Compliance
- Complete audit log of all operations
- Security event tracking
- Data retention policies

## Error Handling

The backend provides comprehensive error handling with:

- **Meaningful Error Messages**: Clear, actionable error descriptions
- **Error Codes**: Standardized error codes for different scenarios
- **Graceful Degradation**: System continues to function even with partial failures
- **Audit Trail**: All errors are logged for debugging and monitoring

## Performance Optimizations

### Database Design
- Proper indexing on frequently queried fields
- Efficient query patterns using Convex indexes
- Minimal data fetching with targeted queries

### Caching Strategy
- Client-side caching of frequently accessed data
- Optimistic updates for better user experience
- Cache invalidation on data changes

### Scalability
- Designed to handle multiple households per user
- Efficient batch operations for bulk data updates
- Horizontal scaling capabilities

## Testing

The backend includes comprehensive test coverage:

- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow testing
- **Security Tests**: Permission and validation testing
- **Performance Tests**: Load and stress testing

Test files are located in `/tests/convex-backend.test.ts`

## Deployment

### Environment Setup
1. Install Convex CLI: `npm install -g convex`
2. Configure environment variables in `.env.local`
3. Deploy to Convex: `npx convex deploy`

### Required Environment Variables
- `CONVEX_DEPLOYMENT`: Convex deployment URL
- `CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key

### Production Considerations
- Set up monitoring and alerting
- Configure backup and disaster recovery
- Implement rate limiting
- Set up SSL/TLS certificates

## Monitoring & Analytics

### Metrics to Track
- User registration and onboarding rates
- Household creation and growth
- Invitation acceptance rates
- API response times and error rates

### Logging
- Structured logging with appropriate log levels
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time notifications for activities
- **Advanced Search**: Full-text search across inventory
- **Import/Export**: Bulk data import/export functionality
- **API Rate Limiting**: Advanced rate limiting and throttling
- **Multi-language Support**: Internationalization support

### Scalability Improvements
- **Caching Layer**: Redis caching for frequently accessed data
- **CDN Integration**: Asset delivery optimization
- **Database Sharding**: Horizontal scaling for large datasets
- **Microservices**: Breaking down into smaller, focused services

## Support & Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Clerk configuration
2. **Permission Denied**: Verify user roles and permissions
3. **Validation Errors**: Check input data format
4. **Rate Limiting**: Implement retry logic with exponential backoff

### Debug Mode
Enable debug logging by setting `NODE_ENV=development`

### Contact
For technical support or questions, refer to the project documentation or contact the development team.

---

*This backend implementation provides a solid foundation for the household management system with room for future growth and enhancements.*