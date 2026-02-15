import { NextRequest } from 'next/server';
import { createApiResponse } from '@/lib/api-utils';

/**
 * Health check endpoint for monitoring and uptime checks
 * Used by Netlify, monitoring services, and load balancers
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check basic system health
    const checks = {
      api: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
    };

    const responseTime = Date.now() - startTime;

    return createApiResponse(
      {
        status: 'operational',
        checks,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
      200,
      'SHORT'
    );
  } catch (error) {
    return createApiResponse(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      503,
      'NONE'
    );
  }
}

/**
 * HEAD method for simple health checks (no response body)
 */
export async function HEAD() {
  // Return 200 to indicate service is up
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60',
      'X-Health-Status': 'operational',
    },
  });
}
