import { NextRequest, NextResponse } from 'next/server';

interface Params {
  orderNumber: string;
}

/**
 * GET /api/admin/label/[orderNumber]
 * Download shipping label PDF for an order
 */
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const resolvedParams = await params;
    const { orderNumber } = resolvedParams;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Order number required' },
        { status: 400 },
      );
    }

    // Check bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Niet geautoriseerd' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, message: 'Ongeldig token' }, { status: 401 });
    }

    // Haal label uit Netlify Blobs
    try {
      const { getDeployStore } = await import('@netlify/blobs');
      const store = getDeployStore('gameshop-labels');

      const filename = `${orderNumber}-label.pdf`;
      const labelData = await store.get(filename);

      if (!labelData) {
        return NextResponse.json(
          { success: false, message: 'Label niet gevonden' },
          { status: 404 },
        );
      }

      // Return as PDF
      return new NextResponse(labelData, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (blobError) {
      console.error('Error retrieving label from Blobs:', blobError);
      return NextResponse.json(
        { success: false, message: 'Fout bij ophalen label' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Label retrieval error:', error);
    return NextResponse.json(
      { success: false, message: 'Fout bij downloads label' },
      { status: 500 },
    );
  }
}
