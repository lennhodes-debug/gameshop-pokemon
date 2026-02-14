import { NextRequest, NextResponse } from 'next/server';

interface ShipmentRequest {
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  weight?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check bearer token for admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Niet geautoriseerd' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, message: 'Ongeldig token' }, { status: 401 });
    }

    const body = (await request.json()) as ShipmentRequest;

    // Validatie
    if (!body.orderNumber || !body.customerName || !body.street || !body.postcode) {
      return NextResponse.json(
        { success: false, message: 'Ontbrekende verplichte velden' },
        { status: 400 },
      );
    }

    // In production, deze gegevens zouden naar PostNL API gaan
    // Voor nu geven we een placeholder tracking code terug
    const trackingCode = `3S${Date.now().toString().slice(-10)}NL`;

    // Update order in Netlify Blobs met tracking info
    try {
      const { getDeployStore } = await import('@netlify/blobs');
      const store = getDeployStore('gameshop-orders');

      const orderData = await store.get(body.orderNumber);
      if (orderData) {
        const order = JSON.parse(new TextDecoder().decode(orderData));
        order.status = 'shipped';
        order.trackingCode = trackingCode;
        await store.set(body.orderNumber, JSON.stringify(order));
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Verzendlabel aangemaakt',
      trackingCode,
      orderId: body.orderNumber,
    });
  } catch (error) {
    console.error('Shipment creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij aanmaken verzendlabel' },
      { status: 500 },
    );
  }
}
