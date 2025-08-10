/**
 * Utility functions for the household management system
 */

import { Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Date/Time utilities
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function daysFromNow(days: number): number {
  return Date.now() + (days * 24 * 60 * 60 * 1000);
}

export function daysAgo(days: number): number {
  return Date.now() - (days * 24 * 60 * 60 * 1000);
}

export function isExpired(timestamp: number): boolean {
  return timestamp < Date.now();
}

export function isExpiringSoon(timestamp: number, warningDays: number = 7): boolean {
  return timestamp < daysFromNow(warningDays);
}

/**
 * String utilities
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Array utilities
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Permission utilities
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Activity feed helpers
 */
export function createActivityMetadata(data: Record<string, any>): Record<string, any> {
  // Filter out undefined values and ensure serializable data
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      // Ensure value is serializable (basic types only)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        filtered[key] = value;
      } else if (Array.isArray(value)) {
        filtered[key] = value.filter(v => 
          typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
        );
      }
    }
  }
  return filtered;
}

/**
 * Error handling utilities
 */
export class HouseholdError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HouseholdError';
  }
}

export function createError(code: string, message: string, details?: any): HouseholdError {
  return new HouseholdError(message, code, details);
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  EXPIRED: 'EXPIRED',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

/**
 * Pagination helpers
 */
export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

export function createPaginatedResult<T>(
  items: T[],
  limit: number,
  hasMore: boolean,
  nextCursor?: string
): PaginatedResult<T> {
  return {
    items,
    nextCursor,
    hasMore,
  };
}

/**
 * Database query helpers
 */
export async function batchGet<T>(
  ctx: QueryCtx | MutationCtx,
  table: string,
  ids: Id<any>[]
): Promise<(T | null)[]> {
  return Promise.all(ids.map(id => ctx.db.get(id as any)));
}

export function buildSearchQuery(query: string): string {
  // Clean and prepare search query
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Cache utilities (for client-side caching)
 */
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

/**
 * Type guard utilities
 */
export function isValidId(value: any): value is Id<any> {
  return typeof value === 'string' && value.length > 0;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Data transformation utilities
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Retry utilities for external API calls
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Retry failed');
}

/**
 * Environment utilities
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Performance monitoring helpers
 */
export function measureTime<T>(label: string, fn: () => T): T {
  if (isDevelopment()) {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  }
  return fn();
}

export async function measureTimeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (isDevelopment()) {
    console.time(label);
    const result = await fn();
    console.timeEnd(label);
    return result;
  }
  return fn();
}

/**
 * Constants
 */
export const CONSTANTS = {
  MAX_HOUSEHOLD_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_MEMBERS_PER_HOUSEHOLD: 50,
  INVITATION_EXPIRY_DAYS: 7,
  INVITE_CODE_EXPIRY_DAYS: 30,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_SEARCH_RESULTS: 50,
  ACTIVITY_RETENTION_DAYS: 90,
  AUDIT_LOG_RETENTION_DAYS: 365
} as const;