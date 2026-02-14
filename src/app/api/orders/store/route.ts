import { NextRequest, NextResponse } from 'next/server';

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discountCode?: string;
  voornaam: string;
  achternaam: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  opmerkingen?: string;
  betaalmethode: string;
}

interface StoredOrder extends OrderData {
  id: string;
  createdAt: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingLabel?: string;
  trackingCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderData;

    // Valideer verplichte velden
    if (!body.orderNumber || !body.customerEmail || !body.customerName || !body.items?.length) {
      return NextResponse.json(
        { success: false, message: 'Ontbrekende verplichte velden' },
        { status: 400 },
      );
    }

    // Importeer Netlify Blobs
    const { getDeployStore } = await import('@netlify/blobs');

    // Haal orders store
    const store = getDeployStore('gameshop-orders');

    // Maak order object
    const order: StoredOrder = {
      ...body,
      id: body.orderNumber,
      createdAt: new Date().toISOString(),
      status: 'processing',
    };

    // Sla op in Blobs
    await store.set(body.orderNumber, JSON.stringify(order));

    return NextResponse.json({
      success: true,
      message: 'Bestelling opgeslagen',
      orderId: body.orderNumber,
    });
  } catch (error) {
    console.error('Order storage error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij opslaan bestelling' },
      { status: 500 },
    );
  }
}
