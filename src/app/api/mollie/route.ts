'use server';

import { NextRequest, NextResponse } from 'next/server';

// Logger utility
function logRequest(method: string, path: string, status: number, duration: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} - ${status} (${duration}ms)`);
}

// Request/response compression middleware
function getCompressionHeaders(): Record<string, string> {
  return {
    'Content-Encoding': 'gzip',
    'Cache-Control': 'private, max-age=0, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * POST /api/mollie
 * Payment processing endpoint for Mollie integration
 * In production: validates payment data, initiates Mollie payment link, returns redirect URL
 * Currently: simulates payment processing for frontend-only mode
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // Validate request method and content type
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405, headers: getCompressionHeaders() }
      );
    }

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400, headers: getCompressionHeaders() }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Required fields validation
    const requiredFields = ['amount', 'description', 'redirectUrl'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: getCompressionHeaders() }
      );
    }

    // Validate amount format
    if (typeof body.amount !== 'string' || !/^\d+\.\d{2}$/.test(body.amount)) {
      return NextResponse.json(
        { error: 'Amount must be a string in format: "XX.XX"' },
        { status: 400, headers: getCompressionHeaders() }
      );
    }

    // TODO: In production, call Mollie API
    // const molliePayment = await mollieClient.payments.create({...})

    // Simulate successful payment
    const responseData = {
      id: `mollie_${Date.now()}`,
      status: 'pending',
      checkoutUrl: `https://www.mollie.com/checkout/test-${Date.now()}`,
      description: body.description,
      amount: body.amount,
      locale: body.locale || 'nl_NL',
    };

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        ...getCompressionHeaders(),
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCompressionHeaders() }
    );
  }
}

/**
 * GET /api/mollie/:id
 * Check payment status
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // Extract payment ID from URL
    const id = path.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400, headers: getCompressionHeaders() }
      );
    }

    // TODO: In production, fetch payment status from Mollie
    // const status = await mollieClient.payments.get(id)

    const responseData = {
      id,
      status: 'paid',
      isPaid: true,
      updatedAt: new Date().toISOString(),
    };

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        ...getCompressionHeaders(),
        'Cache-Control': 'private, max-age=60, must-revalidate',
      },
    });
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCompressionHeaders() }
    );
  }
}
