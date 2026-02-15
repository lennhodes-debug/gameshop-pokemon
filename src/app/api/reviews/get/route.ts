import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GetReviewsSchema = z.object({
  sku: z.string().regex(/^[A-Z0-9\-]+$/),
});

interface Review {
  id: string;
  sku: string;
  rating: number;
  title: string;
  comment: string;
  author: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sku = searchParams.get('sku');

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter required' },
        { status: 400 }
      );
    }

    const parsed = GetReviewsSchema.parse({ sku });

    // TODO: Fetch from Netlify Blobs (gameshop-reviews)
    // Filter by SKU and approved = true
    const reviews: Review[] = [];
    const averageRating = 0;
    const totalReviews = 0;

    return NextResponse.json({
      sku: parsed.sku,
      reviews,
      averageRating,
      totalReviews,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid SKU format' },
        { status: 400 }
      );
    }

    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Kon reviews niet ophalen' },
      { status: 500 }
    );
  }
}
