import { NextRequest } from 'next/server';
import { z } from 'zod';
import { emailService, type WelcomeEmailData } from '@/lib/email-service';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

// Request validation schema
const WelcomeEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  discountCode: z.string().min(1, 'Discount code is required'),
  discountPercentage: z.number().min(1).max(100),
});

type WelcomeEmailRequest = z.infer<typeof WelcomeEmailSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = WelcomeEmailSchema.parse(body);

    // Send welcome email
    const emailData: WelcomeEmailData = {
      email: validatedData.email,
      discountCode: validatedData.discountCode,
      discountPercentage: validatedData.discountPercentage,
    };

    const result = await emailService.sendWelcomeEmail(emailData);

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Welcome email send failed',
        500
      );
    }

    return createApiResponse(
      {
        success: true,
        messageId: result.messageId,
        email: validatedData.email,
        timestamp: new Date().toISOString(),
      },
      200,
      'NONE'
    );
  } catch (error) {
    const errorMessage = error instanceof z.ZodError
      ? `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
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
      endpoint: '/api/email/welcome',
      method: 'POST',
      description: 'Send a welcome email to new newsletter subscribers',
      schema: {
        email: 'string (email)',
        discountCode: 'string',
        discountPercentage: 'number (1-100)',
      },
    },
    200,
    'MEDIUM'
  );
}
