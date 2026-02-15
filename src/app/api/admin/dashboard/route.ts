'use server';

import { NextRequest, NextResponse } from 'next/server';

// Logger utility
function logRequest(method: string, path: string, status: number, duration: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} - ${status} (${duration}ms)`);
}

// Admin auth validation
function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  // TODO: In production, validate token against database
  const token = authHeader.substring(7);
  const expectedToken = process.env.ADMIN_API_TOKEN || 'dev-token';

  return token === expectedToken;
}

// Response headers
function getAdminHeaders(isError: boolean = false): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': isError
      ? 'private, max-age=0, no-store'
      : 'private, max-age=300, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * GET /api/admin/dashboard
 * Get admin dashboard data (orders, revenue, stats)
 * Requires: Bearer token authentication
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // Validate admin authentication
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getAdminHeaders(true) }
      );
    }

    // TODO: In production
    // 1. Fetch orders from database or Netlify Blobs
    // 2. Calculate revenue, order count, etc.
    // 3. Fetch inventory status
    // 4. Return aggregated dashboard data

    const dashboardData = {
      overview: {
        totalOrders: 0,
        revenue: '€0.00',
        averageOrderValue: '€0.00',
        pendingOrders: 0,
      },
      recentOrders: [],
      inventory: {
        totalProducts: 118,
        lowStock: [],
        outOfStock: [],
      },
      performance: {
        views: 0,
        conversions: 0,
        conversionRate: '0%',
      },
      lastUpdated: new Date().toISOString(),
    };

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(dashboardData, {
      status: 200,
      headers: getAdminHeaders(),
    });
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500, headers: getAdminHeaders(true) }
    );
  }
}
