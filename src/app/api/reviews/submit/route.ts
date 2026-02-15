import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ReviewSchema = z.object({
  sku: z.string().regex(/^[A-Z0-9\-]+$/),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
  author: z.string().min(2).max(50),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const review = ReviewSchema.parse(body);

    const reviewData = {
      id: `review_${Date.now()}`,
      ...review,
      createdAt: new Date().toISOString(),
      approved: false, // Manual review required
    };

    // TODO: Store in Netlify Blobs (gameshop-reviews)
    console.log('Review submitted:', reviewData);

    return NextResponse.json({
      success: true,
      message: 'Dank je wel voor je review! We controleren deze voordat deze wordt gepubliceerd.',
      reviewId: reviewData.id,
    }, { status: 201 });
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

    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Kon review niet opslaan' },
      { status: 500 }
    );
  }
}
