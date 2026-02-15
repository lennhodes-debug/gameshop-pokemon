import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware voor request logging en monitoring
 * - Logt alle API requests
 * - Track request timing
 * - Voeg security headers toe
 * - Rate limiting voorbereiding (IP tracking)
 */

export function middleware(request: NextRequest) {
  const startTime = performance.now();
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Log API requests
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Create response
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Log timing information
    const duration = performance.now() - startTime;
    console.log(`[API] ${method} ${pathname} from ${ip} - ${Math.round(duration)}ms`);

    return response;
  }

  // For other routes, just add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (we'll handle it separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
