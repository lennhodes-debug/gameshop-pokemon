'use server';

import { NextRequest, NextResponse } from 'next/server';

// Logger utility
function logRequest(method: string, path: string, status: number, duration: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} - ${status} (${duration}ms)`);
}

// Response headers with performance caching
function getCacheHeaders(isError: boolean = false): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': isError
      ? 'private, max-age=0, no-store, must-revalidate'
      : 'private, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * POST /api/shipment
 * Create shipment label via PostNL API
 * Request body: { orderId, address: {street, number, postcode, city}, items: [{sku, quantity}] }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400, headers: getCacheHeaders(true) }
      );
    }

    const body = await request.json();
    const { orderId, address, items } = body;

    // Validate required fields
    if (!orderId || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: orderId, address, items' },
        { status: 400, headers: getCacheHeaders(true) }
      );
    }

    // Validate address object
    const requiredAddressFields = ['street', 'number', 'postcode', 'city'];
    const missingAddressFields = requiredAddressFields.filter(field => !address[field]);
    if (missingAddressFields.length > 0) {
      return NextResponse.json(
        { error: `Missing address fields: ${missingAddressFields.join(', ')}` },
        { status: 400, headers: getCacheHeaders(true) }
      );
    }

    // Validate postcode format
    const postcodeRegex = /^\d{4}\s?[A-Za-z]{2}$/;
    if (!postcodeRegex.test(address.postcode)) {
      return NextResponse.json(
        { error: 'Invalid postcode format (must be: XXXX AB)' },
        { status: 400, headers: getCacheHeaders(true) }
      );
    }

    // TODO: In production
    // 1. Validate order exists and is paid
    // 2. Call PostNL API to create shipment
    // 3. Store shipment data in Netlify Blobs 'gameshop-orders' store
    // 4. Send shipment confirmation email to customer

    // Simulate shipment creation
    const barcode = `3S${Math.random().toString().slice(2, 11).padEnd(9, '0')}NL`;
    const trackingUrl = `https://track.postnl.nl/${barcode}`;

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 201, Math.round(duration));

    return NextResponse.json(
      {
        success: true,
        shipmentId: `SHIP-${Date.now()}`,
        orderId,
        barcode,
        trackingUrl,
        carrier: 'PostNL',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      { status: 201, headers: getCacheHeaders() }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500, headers: getCacheHeaders(true) }
    );
  }
}

/**
 * GET /api/shipment?orderId=ORDER_ID
 * Track shipment status
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const barcode = searchParams.get('barcode');

    if (!orderId && !barcode) {
      return NextResponse.json(
        { error: 'orderId or barcode is required' },
        { status: 400, headers: getCacheHeaders(true) }
      );
    }

    // TODO: In production
    // 1. Look up shipment in database by orderId or barcode
    // 2. Call PostNL API for current status
    // 3. Return tracking information

    // Simulate shipment tracking
    const status = ['pending', 'picked_up', 'in_transit', 'delivered'][Math.floor(Math.random() * 4)];

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      {
        barcode: `3S${Math.random().toString().slice(2, 11).padEnd(9, '0')}NL`,
        status,
        statusLabel: {
          pending: 'In voorbereiding',
          picked_up: 'Opgehaald',
          in_transit: 'Onderweg',
          delivered: 'Bezorgd',
        }[status],
        carrier: 'PostNL',
        trackingUrl: 'https://track.postnl.nl/...',
        lastUpdate: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          ...getCacheHeaders(),
          'Cache-Control': 'private, max-age=300, must-revalidate', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Failed to retrieve shipment information' },
      { status: 500, headers: getCacheHeaders(true) }
    );
  }
}
