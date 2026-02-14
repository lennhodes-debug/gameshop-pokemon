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

interface PostNLBarcode {
  barcode: string;
  range?: string;
}

interface PostNLLabel {
  shipmentId?: string;
  label?: string; // Base64 encoded label
  barcode?: string;
  tracking?: string;
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

    let trackingCode = '';
    let label = '';
    let labelUrl = '';

    // Probeer PostNL API te gebruiken
    const apiKey = process.env.POSTNL_API_KEY;
    const customerCode = process.env.POSTNL_CUSTOMER_CODE;
    const customerNumber = process.env.POSTNL_CUSTOMER_NUMBER;

    if (apiKey && customerCode && customerNumber) {
      try {
        // Genereer barcode via PostNL
        const barcodeResponse = await generatePostNLBarcode(apiKey, customerCode, customerNumber);
        if (barcodeResponse.barcode) {
          trackingCode = barcodeResponse.barcode;

          // Genereer label via PostNL
          const labelResponse = await generatePostNLLabel(apiKey, customerCode, customerNumber, {
            orderNumber: body.orderNumber,
            customerName: body.customerName,
            street: body.street,
            houseNumber: body.houseNumber,
            postcode: body.postcode,
            city: body.city,
            barcode: trackingCode,
            weight: body.weight || 0.5,
          });

          if (labelResponse.label) {
            label = labelResponse.label;
            // Label URL zou geupload kunnen worden naar blob storage
            labelUrl = await saveShippingLabel(body.orderNumber, label);
          }
        }
      } catch (apiErr) {
        console.warn('PostNL API error, using fallback:', apiErr);
        // Fallback: genereer placeholder als API faalt
        trackingCode = generateFallbackBarcode();
      }
    } else {
      // Geen credentials, use fallback
      trackingCode = generateFallbackBarcode();
    }

    // Update order in Netlify Blobs met tracking info
    try {
      const { getDeployStore } = await import('@netlify/blobs');
      const store = getDeployStore('gameshop-orders');

      const orderData = await store.get(body.orderNumber);
      if (orderData) {
        const order = JSON.parse(new TextDecoder().decode(orderData));
        order.status = 'shipped';
        order.trackingCode = trackingCode;
        if (labelUrl) order.labelUrl = labelUrl;
        await store.set(body.orderNumber, JSON.stringify(order));
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Verzendlabel aangemaakt',
      trackingCode,
      labelUrl: labelUrl || null,
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

// Helper: Generate barcode via PostNL API
async function generatePostNLBarcode(
  apiKey: string,
  customerCode: string,
  customerNumber: string,
): Promise<PostNLBarcode> {
  const type = '3S'; // Domestic NL parcel
  const opts = { serie: '000000000-999999999' };

  try {
    // Direct HTTP call naar PostNL Shipment V4 API
    const response = await fetch('https://api.postnl.nl/shipment/v4_1/barcode', {
      method: 'GET',
      headers: {
        apikey: apiKey,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        customerCode,
        customerNumber,
        type,
        ...opts,
      }),
    });

    if (!response.ok) {
      throw new Error(`PostNL API error: ${response.status}`);
    }

    const data = (await response.json()) as PostNLBarcode;
    return data;
  } catch (error) {
    console.error('PostNL barcode generation failed:', error);
    throw error;
  }
}

// Helper: Generate label via PostNL API
async function generatePostNLLabel(
  apiKey: string,
  customerCode: string,
  customerNumber: string,
  shipmentData: {
    orderNumber: string;
    customerName: string;
    street: string;
    houseNumber: string;
    postcode: string;
    city: string;
    barcode: string;
    weight: number;
  },
): Promise<PostNLLabel> {
  try {
    const response = await fetch('https://api.postnl.nl/shipment/v4_1/label', {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipments: [
          {
            barcode: shipmentData.barcode,
            addressee: {
              name: shipmentData.customerName,
              street: shipmentData.street,
              number: shipmentData.houseNumber,
              postalCode: shipmentData.postcode,
              city: shipmentData.city,
              countryCode: 'NL',
            },
            parcel: {
              weight: shipmentData.weight * 1000, // Convert kg to grams
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`PostNL label API error: ${response.status}`);
    }

    const data = (await response.json()) as PostNLLabel;
    return data;
  } catch (error) {
    console.error('PostNL label generation failed:', error);
    throw error;
  }
}

// Helper: Save label to Netlify Blobs
async function saveShippingLabel(orderNumber: string, labelBase64: string): Promise<string> {
  try {
    const { getDeployStore } = await import('@netlify/blobs');
    const store = getDeployStore('gameshop-labels');

    // Netlify Blobs expects string or Blob/ArrayBuffer
    // Store as base64 string directly for simplicity
    const filename = `${orderNumber}-label.pdf`;
    await store.set(filename, labelBase64);

    // Return public URL (construct based on your setup)
    return `/api/admin/label/${orderNumber}`;
  } catch (error) {
    console.error('Error saving label:', error);
    return '';
  }
}

// Fallback: Generate placeholder barcode when API unavailable
function generateFallbackBarcode(): string {
  const timestamp = Date.now().toString().slice(-8);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `3S${timestamp}${randomStr}NL`;
}
