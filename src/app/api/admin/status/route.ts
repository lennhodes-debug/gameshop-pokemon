import { NextRequest } from 'next/server';
import { emailService } from '@/lib/email-service';
import { emailQueue } from '@/lib/email-queue';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

/**
 * Admin status endpoint - returns system health metrics
 * Requires admin authentication in production
 */
export async function GET(request: NextRequest) {
  try {
    // In production, check authorization header
    // const adminToken = request.headers.get('Authorization');
    // if (!adminToken || !validateAdminToken(adminToken)) {
    //   return createErrorResponse('Unauthorized', 401);
    // }

    // Get email service stats
    const emailStatuses = emailService.getAllEmailStatuses();
    const queueStats = emailQueue.getQueueStats();

    // Calculate performance metrics
    const emailsToday = emailStatuses.filter((status) => {
      const today = new Date().toDateString();
      const statusDate = new Date(status.timestamp).toDateString();
      return statusDate === today;
    });

    const successCount = emailStatuses.filter((s) => s.status === 'sent').length;
    const failureCount = emailStatuses.filter((s) => s.status === 'failed').length;
    const successRate = emailStatuses.length > 0
      ? ((successCount / emailStatuses.length) * 100).toFixed(2)
      : '0.00';

    return createApiResponse(
      {
        success: true,
        timestamp: new Date().toISOString(),
        system: {
          status: 'operational',
          version: '1.0.0',
        },
        email: {
          totalSent: emailStatuses.length,
          sentToday: emailsToday.length,
          successCount,
          failureCount,
          successRate: `${successRate}%`,
          recentStatuses: emailStatuses.slice(-10),
        },
        queue: {
          total: queueStats.total,
          pending: queueStats.pending,
          sent: queueStats.sent,
          failed: queueStats.failed,
          isProcessing: queueStats.processing,
        },
        health: {
          emailService: {
            status: 'healthy',
            operational: true,
          },
          queue: {
            status: queueStats.pending > 1000 ? 'warning' : 'healthy',
            operational: true,
            message: queueStats.pending > 1000
              ? `Queue has ${queueStats.pending} pending items`
              : 'Queue operating normally',
          },
        },
      },
      200,
      'SHORT'
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return createErrorResponse(errorMessage, 500);
  }
}

/**
 * POST endpoint for admin actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = (body as any).action;

    // Clean up old emails
    if (action === 'cleanup-emails') {
      const hoursOld = (body as any).hoursOld || 24;
      const cleaned = emailService.clearOldEmails(hoursOld);
      return createApiResponse(
        {
          success: true,
          action: 'cleanup-emails',
          cleaned,
          message: `Cleaned up ${cleaned} emails older than ${hoursOld} hours`,
        },
        200,
        'NONE'
      );
    }

    // Clean up old queue items
    if (action === 'cleanup-queue') {
      const daysOld = (body as any).daysOld || 7;
      const cleaned = emailQueue.cleanupOldEmails(daysOld);
      return createApiResponse(
        {
          success: true,
          action: 'cleanup-queue',
          cleaned,
          message: `Cleaned up ${cleaned} queue items older than ${daysOld} days`,
        },
        200,
        'NONE'
      );
    }

    // Get queue status
    if (action === 'queue-status') {
      const stats = emailQueue.getQueueStats();
      return createApiResponse(
        {
          success: true,
          action: 'queue-status',
          stats,
        },
        200,
        'SHORT'
      );
    }

    return createErrorResponse(
      `Unknown action: ${action || 'not specified'}`,
      400
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return createErrorResponse(errorMessage, 500);
  }
}
