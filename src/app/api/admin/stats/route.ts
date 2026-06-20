import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch from local Prisma DB
    const [
      totalProducts,
      localOrderCount,
      totalCustomers,
      localOrders,
      recentLocalOrders,
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

    // Fetch from Supabase
    const { data: supabaseOrders, error } = await supabase
      .from('orders')
      .select('id, total, status, customer_name, customer_email, created_at')

    const supabaseOrderList = supabaseOrders || []

    // Calculate totals from both sources
    const localRevenue = localOrders.reduce((sum, o) => sum + o.total, 0)
    const supabaseRevenue = supabaseOrderList.reduce((sum: number, o: Record<string, unknown>) => sum + (o.total as number || 0), 0)
    const totalRevenue = localRevenue + supabaseRevenue
    const totalOrders = localOrderCount + supabaseOrderList.length

    // Merge orders by status
    const ordersByStatus: Record<string, number> = {}
    const allStatusOrders = [
      ...localOrders.map((o) => o.status),
      ...supabaseOrderList.map((o: Record<string, unknown>) => o.status as string),
    ]
    for (const s of allStatusOrders) {
      ordersByStatus[s] = (ordersByStatus[s] || 0) + 1
    }

    // Merge recent orders (take top 5 from combined)
    const recentSupabaseOrders = supabaseOrderList
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      .slice(0, 5)
      .map((o: Record<string, unknown>) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        createdAt: o.created_at,
        user: null,
        source: 'supabase',
      }))

    const recentOrders = [
      ...recentLocalOrders.map((o) => ({ ...o, source: 'local' })),
      ...recentSupabaseOrders,
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

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
        recentOrders,
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
