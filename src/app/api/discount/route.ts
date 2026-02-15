'use server';

import { NextRequest, NextResponse } from 'next/server';

// Logger utility
function logRequest(method: string, path: string, status: number, duration: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} - ${status} (${duration}ms)`);
}

// Request/response headers with caching
function getCacheHeaders(maxAge: number = 0): Record<string, string> {
  return {
    'Content-Encoding': 'gzip',
    'Cache-Control': maxAge > 0
      ? `public, max-age=${maxAge}, s-maxage=${maxAge}`
      : 'private, max-age=0, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * POST /api/discount
 * Validate and apply discount code
 * Request body: { code: string, subtotal: number }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    const body = await request.json();
    const { code, subtotal } = body;

    // Validate inputs
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 400, headers: getCacheHeaders() }
      );
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json(
        { error: 'Invalid subtotal' },
        { status: 400, headers: getCacheHeaders() }
      );
    }

    // TODO: In production, validate code against database
    // Check if code exists, is valid, not used up, etc.
    // const discount = await getDiscountByCode(code.toUpperCase());

    // Simulate valid discount code (10% off for newsletter signup codes like GE-XXXXX)
    const codeUpper = code.toUpperCase();
    const isNewsletterCode = /^GE-[A-Z0-9]{6}$/.test(codeUpper);

    if (!isNewsletterCode) {
      return NextResponse.json(
        { valid: false, error: 'Ongeldig kortingscode' },
        { status: 400, headers: getCacheHeaders() }
      );
    }

    // Calculate discount (10% for newsletter)
    const discountPercentage = 10;
    const discountAmount = Math.round(subtotal * (discountPercentage / 100) * 100) / 100;

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      {
        valid: true,
        code: codeUpper,
        discountPercentage,
        discountAmount,
        description: `${discountPercentage}% korting - Nieuwsbrief abonnement`,
        maxUses: 1,
      },
      {
        status: 200,
        headers: {
          ...getCacheHeaders(300), // Cache validation result for 5 minutes
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCacheHeaders() }
    );
  }
}

/**
 * GET /api/discount?code=CODE
 * Quick validation of discount code
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400, headers: getCacheHeaders() }
      );
    }

    // Quick validation check
    const codeUpper = code.toUpperCase();
    const isValid = /^GE-[A-Z0-9]{6}$/.test(codeUpper);

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      { code: codeUpper, isValid },
      {
        status: 200,
        headers: {
          ...getCacheHeaders(600), // Cache for 10 minutes
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCacheHeaders() }
    );
  }
}
