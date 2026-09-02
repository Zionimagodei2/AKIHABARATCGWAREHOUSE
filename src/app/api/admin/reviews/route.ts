import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const productId = searchParams.get('productId') || ''
    const approved = searchParams.get('approved') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (productId) {
      where.productId = productId
    }

    if (approved !== '') {
      where.approved = approved === 'true'
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, title: true, image: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.review.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Reviews list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, author, rating, comment, date, avatar, approved } = body

    if (!author || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: author, comment' },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        productId: productId || null,
        userId: userId || null,
        author,
        rating: rating ? parseFloat(String(rating)) : 5,
        comment,
        date: date || new Date().toISOString().split('T')[0],
        avatar: avatar || null,
        approved: approved !== undefined ? Boolean(approved) : true,
      },
      include: {
        product: { select: { id: true, title: true, image: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error('Review create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
