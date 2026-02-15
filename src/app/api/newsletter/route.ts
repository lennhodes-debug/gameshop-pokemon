import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';

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
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Newsletter signup email send failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        email: validatedData.email,
        discountCode,
        discountPercentage,
        timestamp: new Date().toISOString(),
        message: 'Welkom! Check je inbox voor je kortingscode.',
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
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    }
  );
}
