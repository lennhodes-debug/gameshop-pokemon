import { NextRequest, NextResponse } from 'next/server';
import createMollieClient from '@mollie/api-client';
import { sendOrderConfirmation, sendOrderNotificationToOwner } from '@/lib/email';

interface PaymentMetadata {
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  address?: string;
  opmerkingen?: string;
  items?: string;
  shipping?: string;
  discount?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Niet geconfigureerd' }, { status: 500 });
  }

  try {
    const body = await request.formData();
    const paymentId = body.get('id') as string;

    if (!paymentId) {
      return NextResponse.json({ error: 'Geen payment ID' }, { status: 400 });
    }

    const mollieClient = createMollieClient({ apiKey });
    const payment = await mollieClient.payments.get(paymentId);

    if (payment.status === 'paid') {
      const metadata = payment.metadata as PaymentMetadata | null;
      const orderNumber = metadata?.orderNumber || paymentId;
      const customerEmail = metadata?.customerEmail || '';
      const customerName = metadata?.customerName || '';
      const address = metadata?.address || '';

      let items: { name: string; sku: string; qty: number; price: number }[] = [];
      try {
        items = metadata?.items ? JSON.parse(metadata.items) : [];
      } catch { /* ignore */ }

      // E-mail naar klant: bevestiging
      if (customerEmail) {
        await sendOrderConfirmation({
          to: customerEmail,
          orderNumber,
          customerName,
          items: items.map(i => ({ name: i.name, quantity: i.qty, price: i.price * i.qty })),
          total: parseFloat(payment.amount.value),
          address,
        });
      }

      // E-mail naar shop eigenaar: nieuw order
      await sendOrderNotificationToOwner({
        orderNumber,
        customerName,
        customerEmail,
        total: parseFloat(payment.amount.value),
        address,
        opmerkingen: metadata?.opmerkingen || '',
        items: items.map(i => ({ name: i.name, sku: i.sku, quantity: i.qty, price: i.price * i.qty })),
      });
    }

    // Mollie verwacht altijd een 200 response
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook fout';
    console.error('Mollie webhook error:', message);
    return NextResponse.json({ received: true, error: message });
  }
}
