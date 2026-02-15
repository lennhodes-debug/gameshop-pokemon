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

  const token = authHeader.substring(7);
  const expectedToken = process.env.ADMIN_API_TOKEN || 'dev-token';

  return token === expectedToken;
}

// Response headers
function getAdminHeaders(cacheMaxAge: number = 0): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheMaxAge > 0
      ? `private, max-age=${cacheMaxAge}, must-revalidate`
      : 'private, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * GET /api/admin/inventory?sku=SKU
 * Get inventory for product(s)
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getAdminHeaders() }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const sku = searchParams.get('sku');

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter is required' },
        { status: 400, headers: getAdminHeaders() }
      );
    }

    // TODO: In production
    // const inventory = await getInventory(sku) from Netlify Blobs 'gameshop-stock'

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      {
        sku,
        stock: 0,
        reserved: 0,
        available: 0,
        reorderLevel: 2,
        lastUpdated: new Date().toISOString(),
      },
      {
        status: 200,
        headers: getAdminHeaders(60), // Cache for 1 minute
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[ERROR] ${request.method} ${path}:`, error);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500, headers: getAdminHeaders() }
    );
  }
}

/**
 * PATCH /api/admin/inventory
 * Update inventory for product
 * Request body: { sku, stock: number }
 */
export async function PATCH(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getAdminHeaders() }
      );
    }

    const body = await request.json();
    const { sku, stock } = body;

    if (!sku || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json(
        { error: 'Invalid request body: sku and stock (>=0) required' },
        { status: 400, headers: getAdminHeaders() }
      );
    }

    // TODO: In production
    // Validate SKU exists
    // Update inventory in Netlify Blobs
    // Log change for audit trail

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      {
        success: true,
        sku,
        stock,
        updatedAt: new Date().toISOString(),
      },
      { status: 200, headers: getAdminHeaders() }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[ERROR] ${request.method} ${path}:`, error);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500, headers: getAdminHeaders() }
    );
  }
}
