import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const StatusSchema = z.object({
  paymentId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    const parsed = StatusSchema.parse({ paymentId });

    // Development: simulate status check
    if (process.env.NODE_ENV !== 'production') {
      // Simulate various statuses for testing
      const statuses = ['open', 'pending', 'authorized', 'paid', 'failed', 'expired'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return NextResponse.json({
        id: parsed.paymentId,
        status: randomStatus,
        isPaid: randomStatus === 'paid',
        amount: {
          currency: 'EUR',
          value: '45.00',
        },
      });
    }

    // Production: call Mollie API
    const mollieApiKey = process.env.MOLLIE_API_KEY;
    if (!mollieApiKey) {
      return NextResponse.json(
        { error: 'Mollie API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.mollie.com/v2/payments/${parsed.paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = await response.json();
    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      isPaid: payment.status === 'paid',
      amount: payment.amount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
