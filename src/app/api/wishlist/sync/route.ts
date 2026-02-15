import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const WishlistSyncSchema = z.object({
  items: z.array(
    z.object({
      sku: z.string().regex(/^[A-Z0-9\-]+$/),
      addedAt: z.string().datetime().optional(),
    })
  ),
  userId: z.string().optional(), // For future user accounts
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wishlistData = WishlistSyncSchema.parse(body);

    // TODO: Store in Netlify Blobs or user account
    console.log('Wishlist synced:', wishlistData.items.length, 'items');

    return NextResponse.json({
      success: true,
      message: 'Wishlist opgeslagen',
      itemCount: wishlistData.items.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    console.error('Wishlist sync error:', error);
    return NextResponse.json(
      { error: 'Kon wishlist niet opslaan' },
      { status: 500 }
    );
  }
}
