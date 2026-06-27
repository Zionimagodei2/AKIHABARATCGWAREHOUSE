import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

const VALID_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
type OrderStatus = (typeof VALID_STATUSES)[number]

interface OrderItemInput {
  productId?: string | null
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
    const body = (await request.json()) as CreateOrderBody

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    // Validate each item has required fields
    for (const item of body.items) {
      if (!item.title || item.price == null || item.quantity == null) {
        return NextResponse.json(
          { error: 'Each item must have title, price, and quantity' },
          { status: 400 }
        )
      }
      if (Number(item.quantity) <= 0) {
        return NextResponse.json(
          { error: 'Item quantity must be greater than 0' },
          { status: 400 }
        )
      }
    }

    // Calculate total from items
    const total = body.items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity)
    }, 0)

    // If paymentMethod is provided but not in schema, append to notes for record
    const combinedNotes = [body.notes, body.paymentMethod ? `Payment method: ${body.paymentMethod}` : null]
      .filter(Boolean)
      .join('\n') || null

    const order = await db.order.create({
      data: {
        customerName: body.customerName ?? null,
        customerEmail: body.customerEmail ?? null,
        customerPhone: body.customerPhone ?? null,
        shippingAddress: body.shippingAddress ?? null,
        shippingCity: body.shippingCity ?? null,
        shippingCountry: body.shippingCountry ?? null,
        shippingZip: body.shippingZip ?? null,
        notes: combinedNotes,
        total,
        status: 'pending',
        items: {
          create: body.items.map((item) => ({
            productId: item.productId ?? null,
            title: item.title,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image ?? null,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim() ?? ''
    const sort = searchParams.get('sort') ?? 'newest'
    const limitRaw = parseInt(searchParams.get('limit') ?? '10', 10)
    const pageRaw = parseInt(searchParams.get('page') ?? '1', 10)

    const where: Prisma.OrderWhereInput = {}

    if (status && VALID_STATUSES.includes(status as OrderStatus)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { id: { contains: search } },
      ]
    }

    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'total-desc':
        orderBy = { total: 'desc' }
        break
      case 'total-asc':
        orderBy = { total: 'asc' }
        break
      case 'status':
        orderBy = [{ status: 'asc' }, { createdAt: 'desc' }]
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const safeLimit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 10
    const safePage = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1
    const skip = (safePage - 1) * safeLimit

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: { items: true },
      }),
      db.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / safeLimit)

    return NextResponse.json({
      orders,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    })
  } catch (error) {
    console.error('Failed to list orders:', error)
    return NextResponse.json(
      { error: 'Failed to list orders' },
      { status: 500 }
    )
  }
}
