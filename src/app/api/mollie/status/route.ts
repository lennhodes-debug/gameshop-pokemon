import { NextRequest, NextResponse } from 'next/server';
import createMollieClient from '@mollie/api-client';

export async function GET(request: NextRequest) {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Niet geconfigureerd' }, { status: 500 });
  }

  const orderNumber = request.nextUrl.searchParams.get('order');
  if (!orderNumber) {
    return NextResponse.json({ error: 'Geen bestelnummer' }, { status: 400 });
  }

  try {
    const mollieClient = createMollieClient({ apiKey });

    // Zoek payment op basis van orderNumber in metadata
    const payments = await mollieClient.payments.page();
    const payment = Array.from(payments).find(p => {
      const meta = p.metadata as { orderNumber?: string } | null;
      return meta?.orderNumber === orderNumber;
    });

    if (!payment) {
      return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Status ophalen mislukt';
    console.error('Mollie status error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
