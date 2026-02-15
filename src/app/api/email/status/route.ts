import { NextRequest } from 'next/server';
import { emailService } from '@/lib/email-service';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // Extract messageId from query parameters
    const messageId = request.nextUrl.searchParams.get('messageId');

    if (!messageId) {
      return createErrorResponse(
        'messageId query parameter is required',
        400
      );
    }

    // Get email status
    const status = emailService.getEmailStatus(messageId);

    if (!status) {
      return createErrorResponse(
        'Email not found',
        404
      );
    }

    return createApiResponse(
      {
        success: true,
        messageId: status.messageId,
        status: status.status,
        timestamp: status.timestamp,
        error: status.error || null,
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

export async function POST(request: NextRequest) {
  try {
    // Get all email statuses or stats
    const body = await request.json().catch(() => ({}));
    const action = (body as any).action || 'all';

    if (action === 'all') {
      const statuses = emailService.getAllEmailStatuses();
      return createApiResponse(
        {
          success: true,
          count: statuses.length,
          statuses,
        },
        200,
        'SHORT'
      );
    }

    if (action === 'cleanup') {
      const hoursOld = (body as any).hoursOld || 24;
      const cleaned = emailService.clearOldEmails(hoursOld);
      return createApiResponse(
        {
          success: true,
          cleaned,
          message: `Cleaned up ${cleaned} emails older than ${hoursOld} hours`,
        },
        200,
        'NONE'
      );
    }

    return createErrorResponse(
      `Unknown action: ${action}`,
      400
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return createErrorResponse(errorMessage, 500);
  }
}
