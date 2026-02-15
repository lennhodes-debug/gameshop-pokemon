import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OrderItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.number().positive(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
  shippingAddress: z.object({
    street: z.string(),
    number: z.string(),
    postcode: z.string(),
    city: z.string(),
  }),
  paymentMethod: z.string(),
  molliePaymentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = CreateOrderSchema.parse(body);

    // Generate order number
    const orderNumber = `GE-${Date.now().toString(36).toUpperCase()}`;

    // Create order object
    const orderData = {
      orderNumber,
      ...order,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // TODO: Store in Netlify Blobs (gameshop-orders)
    console.log('Order created:', orderNumber);

    return NextResponse.json({
      success: true,
      orderNumber,
      order: orderData,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
