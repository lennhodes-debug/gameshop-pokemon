import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';

// Request validation schema
const SendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().optional(),
  replyTo: z.string().email('Invalid reply-to email').optional(),
});

type SendEmailRequest = z.infer<typeof SendEmailSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = SendEmailSchema.parse(body);

    // Send email through service
    const result = await emailService.sendEmail(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Email send failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof z.ZodError
      ? `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
      : error instanceof Error
      ? error.message
      : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}

// Add caching headers for GET requests (informational only)
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/email/send',
      method: 'POST',
      description: 'Send a generic email',
      schema: {
        to: 'string (email)',
        subject: 'string',
        html: 'string',
        text: 'string (optional)',
        replyTo: 'string (email, optional)',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    }
  );
}
