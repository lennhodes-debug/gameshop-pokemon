import { NextRequest, NextResponse } from 'next/server';
import { sendShippingNotification } from '@/lib/email';

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

    const body = await request.json();
    const { customerEmail, customerName, orderNumber, trackingCode, carrier } = body;

    if (!customerEmail || !customerName || !orderNumber || !trackingCode || !carrier) {
      return NextResponse.json(
        { success: false, message: 'Ontbrekende gegevens' },
        { status: 400 },
      );
    }

    await sendShippingNotification({
      customerEmail,
      customerName,
      orderNumber,
      trackingCode,
      carrier,
    });

    return NextResponse.json({ success: true, message: 'Verzendmail verzonden' });
  } catch (error) {
    console.error('Shipping notification email error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij verzenden email' },
      { status: 500 },
    );
  }
}
