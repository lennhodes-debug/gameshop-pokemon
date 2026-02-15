import { NextRequest, NextResponse } from 'next/server';
import { getDeployStore } from '@netlify/blobs';

export async function POST(request: NextRequest) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Geen geldige code opgegeven' },
        { status: 400 },
      );
    }

    const normalized = code.trim().toUpperCase();

    // Get discount codes store
    const store = getDeployStore('gameshop-discounts');

    // Check if code exists
    const codeEntry = await store.get(normalized);
    if (!codeEntry) {
      return NextResponse.json(
        { success: false, message: 'Ongeldige kortingscode' },
        { status: 400 },
      );
    }

    // Parse code data
    let codeData: { email: string; discount: number; used: boolean; createdAt: string };
    try {
      const text = new TextDecoder().decode(codeEntry);
      codeData = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Fout bij het verwerken van de code' },
        { status: 500 },
      );
    }

    // Check if already used
    if (codeData.used) {
      return NextResponse.json(
        { success: false, message: 'Deze code is al gebruikt' },
        { status: 400 },
      );
    }

    // Mark as used
    const updatedData = { ...codeData, used: true };
    await store.setJSON(normalized, updatedData);

    return NextResponse.json({
      success: true,
      message: `${codeData.discount}% korting toegepast!`,
      discount: codeData.discount,
      code: normalized,
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Er ging iets mis bij het valideren van de code' },
      { status: 500 },
    );
  }
}
