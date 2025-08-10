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
import type * as api_ from "../api.js";
import type * as auth from "../auth.js";
import type * as households from "../households.js";
import type * as inventoryItems from "../inventoryItems.js";
import type * as invitations from "../invitations.js";
import type * as memberships from "../memberships.js";
import type * as products from "../products.js";
import type * as shoppingLists from "../shoppingLists.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  api: typeof api_;
  auth: typeof auth;
  households: typeof households;
  inventoryItems: typeof inventoryItems;
  invitations: typeof invitations;
  memberships: typeof memberships;
  products: typeof products;
  shoppingLists: typeof shoppingLists;
  users: typeof users;
  utils: typeof utils;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
