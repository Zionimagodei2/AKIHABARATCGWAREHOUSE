import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, updateIn, isSupabaseConfigured } from '@/lib/supabase-client'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    const { data: orders, error: orderError } = await selectFrom('orders', '*', { id: `eq.${id}` })
    if (orderError || !orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: items, error: itemsError } = await selectFrom('order_items', '*', { order_id: `eq.${id}` })

    return NextResponse.json({
      ...orders[0],
      items: itemsError ? [] : (items || []),
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await updateIn('orders', { id: `eq.${id}` }, { status })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { success: true })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
