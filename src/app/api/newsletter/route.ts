import { NextRequest } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

// Request validation schema
const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type NewsletterRequest = z.infer<typeof NewsletterSchema>;

// Generate unique discount code
function generateDiscountCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GE-${timestamp}${random}`.substring(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = NewsletterSchema.parse(body);

    // Generate unique discount code
    const discountCode = generateDiscountCode();
    const discountPercentage = 10;

    // Send welcome email with discount code
    const result = await emailService.sendWelcomeEmail({
      email: validatedData.email,
      discountCode,
      discountPercentage,
    });

    if (!result.success) {
      return createErrorResponse(
        result.error || 'Newsletter signup email send failed',
        500
      );
    }

    return createApiResponse(
      {
        success: true,
        email: validatedData.email,
        discountCode,
        discountPercentage,
        timestamp: new Date().toISOString(),
        message: 'Welkom! Check je inbox voor je kortingscode.',
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
      endpoint: '/api/newsletter',
      method: 'POST',
      description: 'Subscribe to newsletter and receive welcome email with discount code',
      schema: {
        email: 'string (email)',
      },
      response: {
        success: 'boolean',
        email: 'string',
        discountCode: 'string (GE-XXXXXXX)',
        discountPercentage: 'number (10)',
        message: 'string',
      },
    },
    200,
    'MEDIUM'
  );
}
