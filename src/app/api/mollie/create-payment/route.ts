import { NextRequest, NextResponse } from 'next/server';

interface PaymentRequest {
  orderNumber: string;
  amount: string; // EUR, e.g. "45.00"
  customerName: string;
  customerEmail: string;
  returnUrl: string;
  description?: string;
}

interface MolliePayment {
  resource: string;
  id: string;
  status: string;
  amount: { value: string; currency: string };
  description: string;
  createdAt: string;
  links?: {
    checkout?: { href: string };
  };
}

/**
 * Create a Mollie payment
 * POST /api/mollie/create-payment
 *
 * Expects:
 * {
 *   "orderNumber": "GE-XXXXX",
 *   "amount": "45.00",
 *   "customerName": "John Doe",
 *   "customerEmail": "john@example.com",
 *   "returnUrl": "https://gameshopenter.nl/afrekenen?success=true",
 *   "description": "Bestelling GE-XXXXX"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PaymentRequest;

    // Validate input
    if (!body.orderNumber || !body.amount || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Ontbrekende verplichte velden' },
        { status: 400 },
      );
    }

    // Validate amount format (must be "XX.XX")
    if (!/^\d+\.\d{2}$/.test(body.amount)) {
      return NextResponse.json(
        { success: false, error: 'Ongeldig bedrag format' },
        { status: 400 },
      );
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      console.warn('MOLLIE_API_KEY not configured - using fallback');
      // Return fallback payment (for testing without Mollie credentials)
      return NextResponse.json({
        success: true,
        fallback: true,
        payment: {
          id: `tr_${Date.now()}`,
          status: 'open',
          amount: { value: body.amount, currency: 'EUR' },
          description: body.description || `Bestelling ${body.orderNumber}`,
          checkoutUrl: `${body.returnUrl}?fallback=true&orderId=${body.orderNumber}`,
        },
      });
    }

    // Call real Mollie API
    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          value: body.amount,
          currency: 'EUR',
        },
        description: body.description || `Bestelling ${body.orderNumber}`,
        redirectUrl: body.returnUrl,
        method: 'ideal',
        metadata: {
          orderNumber: body.orderNumber,
          customerEmail: body.customerEmail,
        },
      }),
    });

    if (!mollieResponse.ok) {
      const error = await mollieResponse.text();
      console.error('Mollie API error:', error);
      return NextResponse.json(
        { success: false, error: 'Fout bij betalingsverzoek' },
        { status: 500 },
      );
    }

    const payment = (await mollieResponse.json()) as MolliePayment;

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
        checkoutUrl: payment.links?.checkout?.href,
      },
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Fout bij aanmaken betaling' },
      { status: 500 },
    );
  }
}
