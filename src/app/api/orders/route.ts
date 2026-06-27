import { db } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

// Valid order statuses
const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingZip,
      notes,
      paymentMethod,
      items,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.title || item.price == null || !item.quantity) {
        return NextResponse.json(
          { error: 'Each item must have title, price, and quantity' },
          { status: 400 }
        )
      }
      if (item.quantity < 1) {
        return NextResponse.json(
          { error: 'Item quantity must be at least 1' },
          { status: 400 }
        )
      }
      if (item.price < 0) {
        return NextResponse.json(
          { error: 'Item price cannot be negative' },
          { status: 400 }
        )
      }
    }

    // Calculate total from items
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    // Round to 2 decimal places
    const roundedTotal = Math.round(total * 100) / 100

    // Create the order with items
    const order = await db.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        shippingCity: shippingCity || null,
        shippingCountry: shippingCountry || null,
        shippingZip: shippingZip || null,
        notes: notes || null,
        total: roundedTotal,
        status: 'pending',
        items: {
          create: items.map(
            (item: {
              productId?: string
              title: string
              price: number
              quantity: number
              image?: string
            }) => ({
              productId: item.productId || null,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image || null,
            })
          ),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET /api/orders - List orders (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt_desc'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)

    // Validate pagination
    const validLimit = Math.max(1, Math.min(100, limit))
    const validPage = Math.max(1, page)
    const skip = (validPage - 1) * validLimit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }

    // Parse sort parameter
    const [sortField, sortDirection] = sort.split('_')
    const validSortFields = ['createdAt', 'total', 'status', 'customerName']
    const validSortDirections = ['asc', 'desc']

    const orderBy = {
      [validSortFields.includes(sortField) ? sortField : 'createdAt']:
        validSortDirections.includes(sortDirection) ? sortDirection : 'desc',
    }

    // Get total count for pagination
    const totalCount = await db.order.count({ where })

    // Fetch orders with items
    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy,
      skip,
      take: validLimit,
    })

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(totalCount / validLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
