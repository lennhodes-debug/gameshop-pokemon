import { NextRequest, NextResponse } from 'next/server';
import createMollieClient from '@mollie/api-client';
import { getStore } from '@netlify/blobs';
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
  discountCode?: string;
}

interface StoredOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; sku: string; qty: number; price: number }[];
  address: string;
  status: string;
  paidAt: string;
  discountCode?: string;
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

      const total = parseFloat(payment.amount.value);
      const paidAt = payment.paidAt || new Date().toISOString();

      // Order opslaan in Netlify Blobs voor dashboard
      try {
        const orderStore = getStore('gameshop-orders');
        let orders: StoredOrder[] = [];
        try {
          const existing = await orderStore.get('orders', { type: 'json' });
          if (Array.isArray(existing)) orders = existing as StoredOrder[];
        } catch { /* eerste order */ }

        // Dubbele orders voorkomen
        if (!orders.some(o => o.orderNumber === orderNumber)) {
          orders.push({
            orderNumber,
            customerName,
            customerEmail,
            total,
            items,
            address,
            status: 'paid',
            paidAt: typeof paidAt === 'string' ? paidAt : new Date().toISOString(),
            discountCode: metadata?.discountCode || undefined,
          });
          await orderStore.setJSON('orders', orders);
        }
      } catch (e) {
        console.warn('Kon order niet opslaan:', e);
      }

      // E-mail naar klant: bevestiging
      if (customerEmail) {
        await sendOrderConfirmation({
          to: customerEmail,
          orderNumber,
          customerName,
          items: items.map(i => ({ name: i.name, quantity: i.qty, price: i.price * i.qty })),
          total,
          address,
        });
      }

      // Kortingscode als gebruikt markeren (nieuwsbriefcodes)
      const usedDiscountCode = metadata?.discountCode;
      if (usedDiscountCode && usedDiscountCode.startsWith('GE-')) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameshopenter.nl';
          await fetch(`${baseUrl}/api/discount/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: usedDiscountCode, orderNumber }),
          });
        } catch {
          console.warn('Kon kortingscode niet als gebruikt markeren:', usedDiscountCode);
        }
      }

      // E-mail naar shop eigenaar: nieuw order
      await sendOrderNotificationToOwner({
        orderNumber,
        customerName,
        customerEmail,
        total,
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
