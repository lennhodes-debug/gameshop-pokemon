import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerEmail,
      customerName,
      orderNumber,
      items,
      subtotal,
      shipping,
      discount,
      total,
      discountCode,
    } = body;

    if (!customerEmail || !customerName || !orderNumber || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ontbrekende gegevens' },
        { status: 400 },
      );
    }

    await sendOrderConfirmation({
      customerEmail,
      customerName,
      orderNumber,
      items,
      subtotal,
      shipping,
      discount,
      total,
      discountCode,
    });

    return NextResponse.json({ success: true, message: 'Email verzonden' });
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij verzenden email' },
      { status: 500 },
    );
  }
}
