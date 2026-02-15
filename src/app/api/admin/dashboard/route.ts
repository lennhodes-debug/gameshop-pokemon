import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Implement bearer token auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // TODO: Verify token against ADMIN_TOKEN env var
  // const token = authHeader.substring(7);
  // if (token !== process.env.ADMIN_TOKEN) {
  //   return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  // }

  try {
    // TODO: Fetch from Netlify Blobs
    const dashboardData = {
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
      },
      recentOrders: [],
      topProducts: [],
      inventory: {
        totalItems: 0,
        lowStockItems: 0,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
