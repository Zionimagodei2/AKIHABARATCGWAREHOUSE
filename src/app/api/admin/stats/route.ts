import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const [
      totalProducts,
      totalOrders,
      orders,
      lowStockProducts,
      totalReviews,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.findMany({
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.product.findMany({
        where: {
          inStock: false,
        },
        take: 10,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      db.review.count(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items,
    }));

    const ordersByStatus = orders.reduce(
      (acc, o) => {
        const status = o.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      lowStockProducts,
      totalReviews,
    });
  } catch (error) {
    console.error('Failed to load admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 },
    );
  }
}
