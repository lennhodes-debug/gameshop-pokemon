import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService, type OrderConfirmationData } from '@/lib/email-service';

// Request validation schema
const OrderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const ShippingAddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  postcode: z.string().min(1),
  city: z.string().min(1),
});

const OrderConfirmationSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().min(0),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

type OrderConfirmationRequest = z.infer<typeof OrderConfirmationSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = OrderConfirmationSchema.parse(body);

    // Send order confirmation email
    const emailData: OrderConfirmationData = {
      ...validatedData,
      timestamp: new Date().toISOString(),
    };

    const result = await emailService.sendOrderConfirmation(emailData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Order confirmation email send failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        orderNumber: validatedData.orderNumber,
        customerEmail: validatedData.customerEmail,
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
      endpoint: '/api/email/order-confirmation',
      method: 'POST',
      description: 'Send an order confirmation email',
      schema: {
        orderNumber: 'string',
        customerName: 'string',
        customerEmail: 'string (email)',
        items: [{ name: 'string', quantity: 'number', price: 'number' }],
        subtotal: 'number',
        shipping: 'number',
        total: 'number',
        shippingAddress: {
          street: 'string',
          number: 'string',
          postcode: 'string',
          city: 'string',
        },
        paymentMethod: 'string',
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
