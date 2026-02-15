import { NextRequest, NextResponse } from 'next/server';
import { getDeployStore } from '@netlify/blobs';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Geldig e-mailadres vereist' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate unique discount code: GE-XXXXX
    // Use 5 random uppercase letters + numbers
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GE-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Store in gameshop-discounts Blobs
    const store = getDeployStore('gameshop-discounts');

    // Check if this code already exists (unlikely but just in case)
    let exists = await store.get(code);
    let attempts = 0;
    while (exists && attempts < 10) {
      code = 'GE-';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      exists = await store.get(code);
      attempts++;
    }

    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Er ging iets mis. Probeer het opnieuw.' },
        { status: 500 },
      );
    }

    // Store code data: { email, discount, used, createdAt }
    const codeData = {
      email: normalizedEmail,
      discount: 10, // 10% discount for newsletter
      used: false,
      createdAt: new Date().toISOString(),
    };

    await store.setJSON(code, codeData);

    return NextResponse.json({
      success: true,
      message: `Code aangemaakt: ${code}`,
      code,
      discount: 10,
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Er ging iets mis. Probeer het opnieuw.' },
      { status: 500 },
    );
  }
}
