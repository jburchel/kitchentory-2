/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activityFeed from "../activityFeed.js";
import type * as categories from "../categories.js";
import type * as householdInvitations from "../householdInvitations.js";
import type * as households from "../households.js";
import type * as inventoryItems from "../inventoryItems.js";
import type * as permissions from "../permissions.js";
import type * as products from "../products.js";
import type * as seed_sampleData from "../seed/sampleData.js";
import type * as seed_seedDatabase from "../seed/seedDatabase.js";
import type * as shoppingLists from "../shoppingLists.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activityFeed: typeof activityFeed;
  categories: typeof categories;
  householdInvitations: typeof householdInvitations;
  households: typeof households;
  inventoryItems: typeof inventoryItems;
  permissions: typeof permissions;
  products: typeof products;
  "seed/sampleData": typeof seed_sampleData;
  "seed/seedDatabase": typeof seed_seedDatabase;
  shoppingLists: typeof shoppingLists;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
