import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Total products
    const totalProducts = await db.product.count()

    // Total orders
    const totalOrders = await db.order.count()

    // Total revenue from delivered orders
    const deliveredOrders = await db.order.findMany({
      where: { status: 'delivered' },
      select: { total: true },
    })
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0)

    // Recent orders (last 5)
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    })

    // Orders by status
    const allOrders = await db.order.findMany({
      select: { status: true },
    })
    const ordersByStatus: Record<string, number> = {}
    for (const order of allOrders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
    }

    // Low stock products (inStock = false)
    const lowStockProducts = await db.product.findMany({
      where: { inStock: false },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    })

    // Total reviews
    const totalReviews = await db.review.count()

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      lowStockProducts,
      totalReviews,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
