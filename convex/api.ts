/**
 * Convex API - Centralized export of all backend functions
 * 
 * This file serves as the main API interface for the household management system.
 * It exports all queries, mutations, and actions from various modules.
 */

// Authentication and utilities
export * from "./auth";

// Household management
export * as households from "./households";

// Membership management  
export * as memberships from "./memberships";

// Invitation system
export * as invitations from "./invitations";

// User management
export * as users from "./users";

// Product management (existing)
export * as products from "./products";

// Shopping list management
export * as shoppingLists from "./shoppingLists";

// Validators and utilities
export * from "./validators";

// Re-export individual functions for convenience
export {
  // Household functions
  createHousehold,
  getHousehold, 
  getUserHouseholdsList,
  updateHousehold,
  deleteHousehold,
  regenerateInviteCode,
  joinHouseholdByCode,
  leaveHousehold,
  getHouseholdActivity,
  markActivityRead
} from "./households";

export {
  // Membership functions
  getHouseholdMembers,
  updateMemberRole,
  removeMember,
  transferOwnership,
  getMemberActivity,
  updateLastActive
} from "./memberships";

export {
  // Invitation functions
  sendInvitation,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  getHouseholdInvitations,
  getUserInvitations,
  cleanupExpiredInvitations
} from "./invitations";

export {
  // User functions
  getCurrentUser,
  updateUserProfile,
  completeOnboarding,
  updateLastSeen,
  getUserStats,
  searchUsersByEmail,
  deleteUserAccount
} from "./users";

export {
  // Product functions (existing)
  lookupProductByBarcode,
  searchProducts,
  getRecentSearches,
  addSearch
} from "./products";

export {
  // Shopping list functions
  createShoppingList,
  getShoppingLists,
  getShoppingList,
  addItemToList,
  updateShoppingItem,
  deleteShoppingItem,
  generateSmartSuggestions
} from "./shoppingLists";\n\nexport {\n  // Inventory item functions\n  createInventoryItem,\n  getInventoryItems,\n  updateInventoryItem,\n  deleteInventoryItem,\n  updateItemQuantity,\n  getInventoryStats,\n  createStorageLocation,\n  getStorageLocations\n} from "./inventoryItems";