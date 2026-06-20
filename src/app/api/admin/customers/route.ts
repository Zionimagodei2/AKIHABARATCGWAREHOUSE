import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = { role: 'customer' }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
          },
        },
      }),
      db.user.count({ where }),
    ])

    // Calculate total spent for each customer
    const customers = users.map((user) => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
      const { orders, ...userData } = user
      return {
        ...userData,
        orderCount: user._count.orders,
        totalSpent,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Customers list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
