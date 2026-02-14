import { NextRequest, NextResponse } from 'next/server';
import createMollieClient, { PaymentMethod, Locale } from '@mollie/api-client';
import { createPaymentSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Mollie niet geconfigureerd' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige bestelling', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { items, customer, shipping, discount, discountCode, total } = parsed.data;

    const mollieClient = createMollieClient({ apiKey });

    const orderNumber = `GE-${Date.now().toString(36).toUpperCase()}`;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameshopenter.nl';

    // Gebruik Mollie Payments API (simpeler dan Orders API, geen address vereist)
    const payment = await mollieClient.payments.create({
      amount: { currency: 'EUR', value: total.toFixed(2) },
      description: `Gameshop Enter — ${orderNumber}`,
      redirectUrl: `${baseUrl}/afrekenen/status?order=${orderNumber}`,
      webhookUrl: `${baseUrl}/api/mollie/webhook`,
      method: customer.betaalmethode ? mapPaymentMethod(customer.betaalmethode) : undefined,
      locale: Locale.nl_NL,
      metadata: {
        orderNumber,
        customerName: `${customer.voornaam} ${customer.achternaam}`,
        customerEmail: customer.email,
        address: `${customer.straat} ${customer.huisnummer}, ${customer.postcode} ${customer.plaats}`,
        opmerkingen: customer.opmerkingen || '',
        items: JSON.stringify(items.map((item: { name: string; sku: string; quantity: number; price: number }) => ({
          name: item.name,
          sku: item.sku,
          qty: item.quantity,
          price: item.price,
        }))),
        shipping: String(shipping || 0),
        discount: String(discount || 0),
        discountCode: discountCode || '',
      },
    });

    return NextResponse.json({
      checkoutUrl: payment.getCheckoutUrl(),
      orderNumber,
      paymentId: payment.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Betaling aanmaken mislukt';
    console.error('Mollie create-payment error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mapPaymentMethod(method: string): PaymentMethod | undefined {
  const map: Record<string, PaymentMethod> = {
    ideal: PaymentMethod.ideal,
    creditcard: PaymentMethod.creditcard,
    paypal: PaymentMethod.paypal,
    bancontact: PaymentMethod.bancontact,
    applepay: PaymentMethod.applepay,
  };
  return map[method];
}
