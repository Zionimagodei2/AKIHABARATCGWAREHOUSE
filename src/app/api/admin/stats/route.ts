import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, countFrom, isSupabaseConfigured } from '@/lib/supabase-client'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        totalProducts: 0, totalOrders: 0, totalRevenue: 0,
        recentOrders: [], ordersByStatus: {}, totalReviews: 0,
      })
    }

    const [productsResult, ordersResult] = await Promise.all([
      countFrom('products'),
      selectFrom('orders', '*', {}, { order: 'created_at.desc', limit: 5 }),
    ])

    const totalProducts = productsResult.count
    const orders = ordersResult.data || []

    // Calculate revenue from delivered/shipped orders
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    // Orders by status
    const ordersByStatus: Record<string, number> = {}
    for (const o of orders) {
      const s = o.status || 'pending'
      ordersByStatus[s] = (ordersByStatus[s] || 0) + 1
    }

    return NextResponse.json({
      totalProducts,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders: orders,
      ordersByStatus,
      totalReviews: 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
