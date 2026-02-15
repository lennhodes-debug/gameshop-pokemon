'use server';

import { NextRequest, NextResponse } from 'next/server';

// Logger utility
function logRequest(method: string, path: string, status: number, duration: number, details?: string) {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${details}` : '';
  console.log(`[${timestamp}] ${method} ${path} - ${status} (${duration}ms)${detailsStr}`);
}

// Response headers
function getResponseHeaders(cacheControl: string = 'no-store'): Record<string, string> {
  return {
    'Cache-Control': cacheControl,
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

/**
 * POST /api/newsletter
 * Subscribe email to newsletter
 * Request body: { email: string, name?: string }
 * Response: { success: boolean, discountCode?: string, message: string }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // Validate request
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400, headers: getResponseHeaders() }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400, headers: getResponseHeaders() }
      );
    }

    // Validate name if provided
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Invalid name' },
        { status: 400, headers: getResponseHeaders() }
      );
    }

    // TODO: In production
    // 1. Check if email already exists in database
    // 2. Store email in database
    // 3. Send confirmation email via Nodemailer
    // 4. Generate unique discount code

    // Simulate subscription - generate unique discount code
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountCode = `GE-${uniqueId}`;

    // In production: store in Netlify Blobs 'gameshop-newsletter' store
    // const newsletterStore = getBlobs('gameshop-newsletter');
    // await newsletterStore.set(email, JSON.stringify({ email, name, subscribed: new Date(), discountCode }));

    // In production: send welcome email
    // await nodemailer.sendMail({
    //   to: email,
    //   subject: 'Welkom bij Gameshop Enter!',
    //   html: `Bedankt voor je aanmelding. Hier is je 10% kortingscode: ${discountCode}`
    // });

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration), email);

    return NextResponse.json(
      {
        success: true,
        email,
        discountCode,
        message: 'Welkom! Je ontvangt een bevestigingsmail met je 10% kortingscode.',
      },
      { status: 201, headers: getResponseHeaders('private, max-age=0, must-revalidate') }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration), 'exception');

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: getResponseHeaders() }
    );
  }
}

/**
 * GET /api/newsletter
 * Health check / list endpoint (rate-limited in production)
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;

  try {
    // In production: check rate limiting header (IP-based)
    // const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    const duration = performance.now() - startTime;
    logRequest(request.method, path, 200, Math.round(duration));

    return NextResponse.json(
      {
        status: 'ok',
        endpoint: '/api/newsletter',
        method: 'POST to subscribe',
      },
      {
        status: 200,
        headers: getResponseHeaders('public, max-age=300'),
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ERROR] ${request.method} ${path}:`, errorMessage);
    logRequest(request.method, path, 500, Math.round(duration));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getResponseHeaders() }
    );
  }
}
