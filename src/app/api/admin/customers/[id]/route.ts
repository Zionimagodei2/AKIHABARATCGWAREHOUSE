import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await db.user.findUnique({
      where: { id, role: 'customer' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              select: {
                id: true,
                title: true,
                price: true,
                quantity: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        orderCount: customer.orders.length,
        totalSpent,
      },
    })
  } catch (error) {
    console.error('Customer get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}
