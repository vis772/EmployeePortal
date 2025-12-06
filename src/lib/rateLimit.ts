/**
 * Simple in-memory rate limiter
 * Note: For production with multiple serverless instances, use Redis instead
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxAttempts: number;  // Max attempts per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;  // Seconds until reset
}

/**
 * Check and update rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry or entry has expired, create new one
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  // Check if over limit
  if (entry.count > config.maxAttempts) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }
  
  return {
    success: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    return {
      success: true,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
    };
  }
  
  return {
    success: entry.count < config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime,
    retryAfter: entry.count >= config.maxAttempts 
      ? Math.ceil((entry.resetTime - now) / 1000) 
      : undefined,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Default configs for different use cases
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxAttempts: 5,  // 5 attempts per 15 minutes
};

export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxAttempts: 100,  // 100 requests per minute
};

