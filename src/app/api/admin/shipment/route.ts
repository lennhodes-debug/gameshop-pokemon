import { NextRequest, NextResponse } from 'next/server';
import { createShipment } from '@/lib/postnl';
import { sendTrackTrace } from '@/lib/email';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

// POST: Maak verzending aan en stuur track & trace e-mail
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderNumber, customer, items } = body;

    if (!orderNumber || !customer) {
      return NextResponse.json({ error: 'orderNumber en customer zijn verplicht' }, { status: 400 });
    }

    // Bereken totaal gewicht (gram)
    const totalWeight = items?.reduce(
      (sum: number, item: { weight?: number; quantity: number }) =>
        sum + (item.weight || 100) * item.quantity,
      0
    ) || 500;

    // PostNL zending aanmaken
    const shipment = await createShipment(
      {
        name: `${customer.voornaam} ${customer.achternaam}`,
        street: customer.straat,
        houseNumber: customer.huisnummer,
        postalCode: customer.postcode,
        city: customer.plaats,
        countryCode: 'NL',
      },
      orderNumber,
      Math.max(totalWeight, 100),
    );

    // Track & trace e-mail naar klant
    if (customer.email) {
      await sendTrackTrace({
        to: customer.email,
        orderNumber,
        customerName: `${customer.voornaam} ${customer.achternaam}`,
        trackingCode: shipment.trackingCode,
        trackingUrl: shipment.trackingUrl,
        items: items?.map((item: { name: string; quantity: number; price: number }) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })) || [],
      });
    }

    return NextResponse.json({
      trackingCode: shipment.trackingCode,
      trackingUrl: shipment.trackingUrl,
      labelPdf: shipment.labelPdf,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verzending aanmaken mislukt';
    console.error('Shipment error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
