import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreatePaymentSchema = z.object({
  amount: z.object({
    currency: z.literal('EUR'),
    value: z.string().regex(/^\d+\.\d{2}$/), // "45.00" format
  }),
  description: z.string().min(1).max(255),
  redirectUrl: z.string().url(),
  webhookUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

interface MolliePayment {
  id: string;
  status: 'open' | 'pending' | 'authorized' | 'cancelled' | 'paid' | 'expired';
  amount: {
    currency: string;
    value: string;
  };
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  createdAt: string;
  expiresAt: string;
  checkoutUrl: string;
}

// Simulate Mollie API in development
// In production, call actual Mollie API: https://api.mollie.com/v2/payments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const parsed = CreatePaymentSchema.parse(body);

    // In development, simulate Mollie response
    if (process.env.NODE_ENV !== 'production') {
      const paymentId = `tr_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const mockPayment: MolliePayment = {
        id: paymentId,
        status: 'open',
        amount: parsed.amount,
        description: parsed.description,
        redirectUrl: parsed.redirectUrl,
        webhookUrl: parsed.webhookUrl,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes
        checkoutUrl: `https://www.mollie.com/checkout/select-method/${paymentId}`,
      };

      return NextResponse.json(mockPayment, { status: 201 });
    }

    // Production: Call actual Mollie API
    const mollieApiKey = process.env.MOLLIE_API_KEY;
    if (!mollieApiKey) {
      return NextResponse.json(
        { error: 'Mollie API key not configured' },
        { status: 500 }
      );
    }

    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parsed.amount,
        description: parsed.description,
        redirectUrl: parsed.redirectUrl,
        webhookUrl: parsed.webhookUrl,
        metadata: parsed.metadata,
        locale: 'nl_NL',
        method: 'ideal',
      }),
    });

    if (!mollieResponse.ok) {
      const error = await mollieResponse.text();
      console.error('Mollie API error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: mollieResponse.status }
      );
    }

    const payment = await mollieResponse.json();
    return NextResponse.json(payment, { status: 201 });
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

    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
