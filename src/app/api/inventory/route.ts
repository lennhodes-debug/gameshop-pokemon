import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const InventorySchema = z.object({
  sku: z.string().regex(/^[A-Z0-9\-]+$/),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sku = searchParams.get('sku');

    if (sku) {
      // Get specific product inventory
      const parsed = InventorySchema.parse({ sku });

      // TODO: Fetch from Netlify Blobs (gameshop-stock)
      const inventory = {
        sku: parsed.sku,
        stock: 5,
        reserved: 1,
        available: 4,
        condition: 'Gebruikt',
        location: 'A-12',
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(inventory);
    }

    // Get all inventory
    // TODO: Fetch from Netlify Blobs
    const allInventory: Array<{
      sku: string;
      stock: number;
      reserved: number;
      available: number;
    }> = [];

    return NextResponse.json({
      items: allInventory,
      totalProducts: allInventory.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid SKU format' },
        { status: 400 }
      );
    }

    console.error('Inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
