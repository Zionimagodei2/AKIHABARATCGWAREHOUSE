import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    // Fetch from local Prisma DB
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }

    const [localOrders] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
        },
      }),
    ])

    // Fetch from Supabase
    let supabaseQuery = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status)
    }
    if (search) {
      supabaseQuery = supabaseQuery.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`)
    }

    const { data: supabaseOrders, error: supabaseError } = await supabaseQuery

    // Normalize Supabase orders to match local format
    const normalizedSupabaseOrders = (supabaseOrders || []).map((order: Record<string, unknown>) => ({
      id: order.id,
      userId: order.user_id,
      total: order.total,
      status: order.status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingCountry: order.shipping_country,
      shippingZip: order.shipping_zip,
      paymentMethod: order.payment_method,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      source: 'supabase',
      user: null,
      items: (order.order_items || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    }))

    // Merge and deduplicate (by ID)
    const localIds = new Set(localOrders.map((o) => o.id))
    const merged = [
      ...localOrders.map((o) => ({ ...o, source: 'local' })),
      ...normalizedSupabaseOrders.filter((o: { id: string }) => !localIds.has(o.id)),
    ]

    // Sort by date descending
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination
    const total = merged.length
    const paginatedOrders = merged.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Orders list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
