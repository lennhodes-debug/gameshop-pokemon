import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Importeer Netlify Blobs
    const { getDeployStore } = await import('@netlify/blobs');

    // Haal orders store
    const store = getDeployStore('gameshop-orders');

    // Haal alle orders
    const { blobs } = await store.list();

    // Sorteer op createdAt descending (nieuwste eerst)
    const orders = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key);
        if (data) {
          return JSON.parse(new TextDecoder().decode(data));
        }
        return null;
      }),
    );

    const filteredOrders = orders.filter((o) => o !== null);
    const sorted = filteredOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      orders: sorted,
      total: sorted.length,
    });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij ophalen bestellingen' },
      { status: 500 },
    );
  }
}
