import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, isSupabaseConfigured } from '@/lib/supabase-client'
import { isAdminRequest } from '@/lib/admin-auth'

/**
 * GET /api/admin/orders — admin panel order feed.
 *
 * Replaces the admin panel's old direct-to-database reads: returns the
 * latest 200 orders (newest first), each with its order_items nested
 * as `items`. Gated by the admin session cookie (see admin-auth.ts).
 */
export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: orders, error } = await selectFrom<Record<string, unknown>>(
      'orders',
      '*',
      undefined,
      { order: 'created_at.desc', limit: 200 }
    )
    if (error || !orders) {
      return NextResponse.json({ error: error || 'Failed to fetch orders' }, { status: 500 })
    }

    // Fetch line items and group them by order (items failure is
    // non-fatal — orders still load without line items).
    const itemsByOrder = new Map<string, Record<string, unknown>[]>()
    try {
      const { data: items, error: itemsError } = await selectFrom<Record<string, unknown>>(
        'order_items',
        '*',
        undefined,
        { limit: 1000 }
      )
      if (!itemsError && items) {
        for (const item of items) {
          const oid = String(item.order_id ?? '')
          if (!oid) continue
          const list = itemsByOrder.get(oid) || []
          list.push(item)
          itemsByOrder.set(oid, list)
        }
      }
    } catch {
      /* items unavailable — orders still load without line items */
    }

    const withItems = orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(String(order.id ?? '')) || [],
    }))

    return NextResponse.json({ orders: withItems })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
