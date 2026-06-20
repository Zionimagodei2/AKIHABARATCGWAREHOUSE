import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      orders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count({ where: { role: 'customer' } }),
      db.order.findMany({ select: { total: true, status: true } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      db.product.findMany({
        where: { inStock: false },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

    // Group orders by status
    const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    // Parse JSON fields on recent orders and low stock products
    const parsedRecentOrders = recentOrders.map((order) => ({
      ...order,
    }))

    const parsedLowStock = lowStockProducts.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      categories: JSON.parse(p.categories),
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
        recentOrders: parsedRecentOrders,
        lowStockProducts: parsedLowStock,
        ordersByStatus,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
