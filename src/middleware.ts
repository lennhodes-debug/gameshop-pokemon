import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Log all API requests for monitoring
export function middleware(request: NextRequest) {
  // Add request ID for tracing
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add timing information
  const start = Date.now();

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Only log API routes in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API] ${request.method} ${request.nextUrl.pathname}`, {
      requestId,
      userAgent: request.headers.get('user-agent'),
    });
  }

  return response;
}

// Apply middleware to API routes
export const config = {
  matcher: ['/api/:path*'],
};
