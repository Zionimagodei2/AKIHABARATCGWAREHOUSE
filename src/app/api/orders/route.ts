import { NextResponse, NextRequest } from 'next/server'
import { insertInto, selectFrom, isSupabaseConfigured } from '@/lib/supabase-client'

interface OrderItemInput {
  product_id?: string | null
  title: string
  price: number
  quantity: number
  image?: string | null
}

interface CreateOrderBody {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: string
  shippingCity?: string
  shippingCountry?: string
  shippingZip?: string
  paymentMethod?: string
  notes?: string
  items?: OrderItemInput[]
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = (await request.json()) as CreateOrderBody

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
    }

    // Calculate total
    const total = body.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)

    // Create order
    const orderData = {
      total,
      status: 'pending',
      customer_name: body.customerName ?? null,
      customer_email: body.customerEmail ?? null,
      customer_phone: body.customerPhone ?? null,
      shipping_address: body.shippingAddress ?? null,
      shipping_city: body.shippingCity ?? null,
      shipping_country: body.shippingCountry ?? null,
      shipping_zip: body.shippingZip ?? null,
      payment_method: body.paymentMethod ?? null,
      notes: body.notes ?? null,
    }

    const { data: orderResult, error: orderError } = await insertInto('orders', orderData)

    if (orderError || !orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: orderError || 'Failed to create order' }, { status: 500 })
    }

    const order = orderResult[0]

    // Create order items
    const itemsData = body.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      title: item.title,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image ?? null,
    }))

    const { error: itemsError } = await insertInto('order_items', itemsData)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Failed to create order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ orders: [], total: 0 }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim() ?? ''
    const limitRaw = parseInt(searchParams.get('limit') ?? '20', 10)
    const pageRaw = parseInt(searchParams.get('page') ?? '1', 10)

    const filters: Record<string, string> = {}
    if (status && status !== 'all') filters.status = `eq.${status}`

    const safeLimit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 20
    const safePage = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1

    const { data, error } = await selectFrom('orders', '*', filters, {
      order: 'created_at.desc',
      limit: safeLimit,
      range: `${(safePage - 1) * safeLimit}-${safePage * safeLimit - 1}`,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    let orders = data || []

    // Client-side search
    if (search) {
      const q = search.toLowerCase()
      orders = orders.filter((o: Record<string, unknown>) =>
        String(o.customer_name || '').toLowerCase().includes(q) ||
        String(o.customer_email || '').toLowerCase().includes(q) ||
        String(o.id || '').toLowerCase().includes(q)
      )
    }

    return NextResponse.json({
      orders,
      total: orders.length,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(orders.length / safeLimit),
    })
  } catch (error) {
    console.error('Failed to list orders:', error)
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 })
  }
}
