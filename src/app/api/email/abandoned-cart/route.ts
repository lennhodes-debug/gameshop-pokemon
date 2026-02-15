import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService, type AbandonedCartData } from '@/lib/email-service';

// Request validation schema
const CartItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const AbandonedCartSchema = z.object({
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(1, 'Customer name is required'),
  cartItems: z.array(CartItemSchema).min(1, 'At least one item is required'),
  cartTotal: z.number().min(0),
  cartUrl: z.string().url('Invalid cart URL'),
  reminderType: z.enum(['first', 'second', 'third']).default('first'),
});

type AbandonedCartRequest = z.infer<typeof AbandonedCartSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AbandonedCartSchema.parse(body);

    // Send abandoned cart email
    const emailData: AbandonedCartData = {
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
      cartItems: validatedData.cartItems,
      cartTotal: validatedData.cartTotal,
      cartUrl: validatedData.cartUrl,
      reminderType: validatedData.reminderType,
    };

    const result = await emailService.sendAbandonedCartEmail(emailData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Abandoned cart email send failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        customerEmail: validatedData.customerEmail,
        reminderType: validatedData.reminderType,
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
      endpoint: '/api/email/abandoned-cart',
      method: 'POST',
      description: 'Send an abandoned cart recovery email',
      reminderTypes: ['first (5 min)', 'second (24h)', 'third (72h)'],
      schema: {
        customerEmail: 'string (email)',
        customerName: 'string',
        cartItems: [{ name: 'string', quantity: 'number', price: 'number' }],
        cartTotal: 'number',
        cartUrl: 'string (URL)',
        reminderType: 'string (first|second|third)',
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
