import { NextResponse } from 'next/server';

/**
 * Response headers for different cache strategies
 */
export const CACHE_STRATEGIES = {
  // Static assets that never change
  IMMUTABLE: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'max-age=31536000',
  },
  // Long-term caching (1 week)
  LONG: {
    'Cache-Control': 'public, max-age=604800',
    'CDN-Cache-Control': 'max-age=604800',
  },
  // Medium-term caching (1 hour)
  MEDIUM: {
    'Cache-Control': 'public, max-age=3600',
    'CDN-Cache-Control': 'max-age=3600',
  },
  // Short-term caching (5 minutes)
  SHORT: {
    'Cache-Control': 'public, max-age=300',
    'CDN-Cache-Control': 'max-age=300',
  },
  // No caching (for dynamic content)
  NONE: {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'CDN-Cache-Control': 'no-store',
  },
};

/**
 * Security headers applied to all API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * CORS headers for API endpoints
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://gameshopenter.nl',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Compression-related headers
 */
export const COMPRESSION_HEADERS = {
  'Content-Encoding': 'gzip',
  'Vary': 'Accept-Encoding',
};

/**
 * Create a standardized API response with proper headers
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  cacheStrategy: keyof typeof CACHE_STRATEGIES = 'NONE',
  additionalHeaders: Record<string, string> = {}
): NextResponse<T> {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    ...SECURITY_HEADERS,
    ...CACHE_STRATEGIES[cacheStrategy],
    ...additionalHeaders,
  });

  return new NextResponse(JSON.stringify(data), {
    status,
    headers,
  });
}

/**
 * Create an error response with proper headers
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    ...SECURITY_HEADERS,
    ...CACHE_STRATEGIES.NONE,
    ...additionalHeaders,
  });

  return new NextResponse(
    JSON.stringify({
      success: false,
      error,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers,
    }
  );
}

/**
 * Rate limiting helpers (basic in-memory implementation)
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Check if a request exceeds rate limit
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  record.count++;
  return record.count <= limit;
}

/**
 * Get remaining requests in current window
 */
export function getRateLimit(
  identifier: string,
  limit: number = 100
): number {
  const record = rateLimitStore[identifier];
  if (!record) return limit;
  return Math.max(0, limit - record.count);
}

/**
 * Cleanup old rate limit records (run periodically)
 */
export function cleanupRateLimits(): number {
  const now = Date.now();
  const keys = Object.keys(rateLimitStore);
  let cleaned = 0;

  keys.forEach((key) => {
    if (now > rateLimitStore[key].resetTime) {
      delete rateLimitStore[key];
      cleaned++;
    }
  });

  return cleaned;
}

/**
 * Request logging helper
 */
export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number; // in ms
}

const requestLogs: RequestLog[] = [];
const MAX_LOGS = 1000;

export function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number
): void {
  if (requestLogs.length >= MAX_LOGS) {
    requestLogs.shift();
  }

  requestLogs.push({
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    duration,
  });
}

/**
 * Get recent request logs
 */
export function getRequestLogs(limit: number = 100): RequestLog[] {
  return requestLogs.slice(-limit);
}

/**
 * Get request statistics
 */
export function getRequestStats(): {
  total: number;
  byMethod: Record<string, number>;
  byStatus: Record<number, number>;
  averageDuration: number;
} {
  const stats = {
    total: requestLogs.length,
    byMethod: {} as Record<string, number>,
    byStatus: {} as Record<number, number>,
    averageDuration: 0,
  };

  if (requestLogs.length === 0) return stats;

  let totalDuration = 0;

  requestLogs.forEach((log) => {
    stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
    totalDuration += log.duration;
  });

  stats.averageDuration = Math.round(totalDuration / requestLogs.length);

  return stats;
}

/**
 * Validation helpers
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidDutchPostcode(postcode: string): boolean {
  const regex = /^\d{4}\s?[A-Z]{2}$/i;
  return regex.test(postcode);
}

export function isValidSKU(sku: string): boolean {
  const regex = /^[A-Z0-9\-]+$/;
  return regex.test(sku);
}

/**
 * Generate helpers
 */
export function generateOrderNumber(): string {
  return `GE-${Date.now().toString(36).toUpperCase()}`;
}

export function generateDiscountCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GE-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Mollie helpers
 */
export function formatMolliePrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Sanitize helpers
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 1000); // Max 1000 chars
}
