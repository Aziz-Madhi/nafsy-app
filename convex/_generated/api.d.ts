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
import type * as ai from "../ai.js";
import type * as aiHelpers from "../aiHelpers.js";
import type * as conversations from "../conversations.js";
import type * as emergencyContacts from "../emergencyContacts.js";
import type * as exercises from "../exercises.js";
import type * as init from "../init.js";
import type * as messages from "../messages.js";
import type * as moods from "../moods.js";
import type * as optimizedQueries from "../optimizedQueries.js";
import type * as resources from "../resources.js";
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
  ai: typeof ai;
  aiHelpers: typeof aiHelpers;
  conversations: typeof conversations;
  emergencyContacts: typeof emergencyContacts;
  exercises: typeof exercises;
  init: typeof init;
  messages: typeof messages;
  moods: typeof moods;
  optimizedQueries: typeof optimizedQueries;
  resources: typeof resources;
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
