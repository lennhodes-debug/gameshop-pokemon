import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    // Extract messageId from query parameters
    const messageId = request.nextUrl.searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'messageId query parameter is required',
        },
        { status: 400 }
      );
    }

    // Get email status
    const status = emailService.getEmailStatus(messageId);

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: status.messageId,
        status: status.status,
        timestamp: status.timestamp,
        error: status.error || null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get all email statuses or stats
    const body = await request.json().catch(() => ({}));
    const action = (body as any).action || 'all';

    if (action === 'all') {
      const statuses = emailService.getAllEmailStatuses();
      return NextResponse.json(
        {
          success: true,
          count: statuses.length,
          statuses,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=30',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (action === 'cleanup') {
      const hoursOld = (body as any).hoursOld || 24;
      const cleaned = emailService.clearOldEmails(hoursOld);
      return NextResponse.json(
        {
          success: true,
          cleaned,
          message: `Cleaned up ${cleaned} emails older than ${hoursOld} hours`,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unknown action: ${action}`,
      },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
