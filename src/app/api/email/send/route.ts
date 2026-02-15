import { NextRequest } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

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
      return createErrorResponse(
        result.error || 'Email send failed',
        500
      );
    }

    return createApiResponse(
      {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      },
      200,
      'NONE'
    );
  } catch (error) {
    const errorMessage = error instanceof z.ZodError
      ? `Validation error: ${error.issues.map((e) => e.message).join(', ')}`
      : error instanceof Error
      ? error.message
      : 'Unknown error';

    return createErrorResponse(errorMessage, 400);
  }
}

// Add caching headers for GET requests (informational only)
export async function GET() {
  return createApiResponse(
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
    200,
    'MEDIUM'
  );
}
