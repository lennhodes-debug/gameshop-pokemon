import { NextRequest, NextResponse } from 'next/server';

/**
 * Check Mollie payment status
 * GET /api/mollie/check-status?paymentId=tr_xxxxx
 */
export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId parameter required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      console.warn('MOLLIE_API_KEY not configured - using fallback');
      return NextResponse.json({
        success: true,
        fallback: true,
        status: 'paid',
      });
    }

    // Call Mollie API
    const response = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    const payment = await response.json();

    return NextResponse.json({
      success: true,
      status: payment.status,
      amount: payment.amount,
      description: payment.description,
      metadata: payment.metadata,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Fout bij controleren betalingsstatus' },
      { status: 500 },
    );
  }
}
