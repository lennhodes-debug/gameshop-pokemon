import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return authHeader === `Bearer ${adminPassword}`;
}

interface Order {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; sku: string; qty: number; price: number }[];
  address: string;
  status: string;
  paidAt: string;
  discountCode?: string;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  try {
    // Haal alle data parallel op
    const [stockData, subscriberData, orderData, discountData] = await Promise.all([
      getStockData(),
      getSubscriberData(),
      getOrderData(),
      getDiscountData(),
    ]);

    // Bereken statistieken
    const totalRevenue = orderData.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orderData.length;

    // Vandaag / deze week / deze maand
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayOrders = orderData.filter(o => o.paidAt.startsWith(todayStr));
    const weekOrders = orderData.filter(o => new Date(o.paidAt) >= weekAgo);
    const monthOrders = orderData.filter(o => new Date(o.paidAt) >= monthAgo);

    // Voorraad stats
    const stockEntries = Object.entries(stockData);
    const outOfStock = stockEntries.filter(([, v]) => v === 0).length;
    const lowStock = stockEntries.filter(([, v]) => v > 0 && v <= 3).length;

    // Top verkochte producten (uit orders)
    const productSales: Record<string, { name: string; sku: string; qty: number; revenue: number }> = {};
    for (const order of orderData) {
      for (const item of order.items) {
        if (!productSales[item.sku]) {
          productSales[item.sku] = { name: item.name, sku: item.sku, qty: 0, revenue: 0 };
        }
        productSales[item.sku].qty += item.qty;
        productSales[item.sku].revenue += item.price * item.qty;
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
        todayOrders: todayOrders.length,
        weekRevenue: weekOrders.reduce((s, o) => s + o.total, 0),
        weekOrders: weekOrders.length,
        monthRevenue: monthOrders.reduce((s, o) => s + o.total, 0),
        monthOrders: monthOrders.length,
        subscribers: subscriberData.count,
        outOfStock,
        lowStock,
        usedDiscounts: discountData.used,
        totalDiscounts: discountData.total,
      },
      recentOrders: orderData.slice(0, 20),
      topProducts,
      lowStockProducts: stockEntries
        .filter(([, v]) => v <= 3)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 20)
        .map(([sku, stock]) => ({ sku, stock })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dashboard laden mislukt';
    console.error('Dashboard error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getStockData(): Promise<Record<string, number>> {
  try {
    const store = getStore('gameshop-stock');
    const data = await store.get('stock', { type: 'json' });
    return (data as Record<string, number>) || {};
  } catch {
    return {};
  }
}

async function getSubscriberData(): Promise<{ count: number }> {
  try {
    const store = getStore('gameshop-newsletter');
    const data = await store.get('subscribers', { type: 'json' });
    if (Array.isArray(data)) return { count: data.length };
    if (data && typeof data === 'object') return { count: Object.keys(data).length };
    return { count: 0 };
  } catch {
    return { count: 0 };
  }
}

async function getOrderData(): Promise<Order[]> {
  try {
    const store = getStore('gameshop-orders');
    const data = await store.get('orders', { type: 'json' });
    if (Array.isArray(data)) {
      return (data as Order[]).sort((a, b) =>
        new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      );
    }
    return [];
  } catch {
    return [];
  }
}

async function getDiscountData(): Promise<{ used: number; total: number }> {
  try {
    const store = getStore('gameshop-discounts');
    const data = await store.get('newsletter-codes', { type: 'json' });
    if (data && typeof data === 'object') {
      const codes = Object.values(data as Record<string, { used: boolean }>);
      return {
        total: codes.length,
        used: codes.filter(c => c.used).length,
      };
    }
    return { used: 0, total: 0 };
  } catch {
    return { used: 0, total: 0 };
  }
}
