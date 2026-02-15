import { NextRequest, NextResponse } from 'next/server';

interface MollieWebhookPayload {
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as MollieWebhookPayload;

    if (!body.id) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Verify webhook signature (in production)
    // See: https://docs.mollie.com/guides/handling-webhooks

    // Log webhook for debugging
    console.log('Mollie webhook received for payment:', body.id);

    // Fetch payment status from Mollie
    const mollieApiKey = process.env.MOLLIE_API_KEY;
    if (!mollieApiKey && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Mollie API key not configured' },
        { status: 500 }
      );
    }

    if (mollieApiKey) {
      const response = await fetch(`https://api.mollie.com/v2/payments/${body.id}`, {
        headers: {
          'Authorization': `Bearer ${mollieApiKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch payment status:', response.statusText);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      const payment = await response.json();

      // Handle payment status updates
      if (payment.status === 'paid') {
        console.log('Payment confirmed:', body.id);
        // TODO: Update order status in database/blob storage
        // TODO: Send confirmation email
      } else if (payment.status === 'failed' || payment.status === 'cancelled') {
        console.log('Payment failed/cancelled:', body.id);
        // TODO: Notify customer
      }
    }

    // Respond to Mollie
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
