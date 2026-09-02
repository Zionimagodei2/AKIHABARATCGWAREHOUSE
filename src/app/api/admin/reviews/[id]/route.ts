import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { author, rating, comment, approved, avatar, date } = body

    const existingReview = await db.review.findUnique({ where: { id } })
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (author !== undefined) updateData.author = author
    if (rating !== undefined) updateData.rating = parseFloat(String(rating))
    if (comment !== undefined) updateData.comment = comment
    if (approved !== undefined) updateData.approved = Boolean(approved)
    if (avatar !== undefined) updateData.avatar = avatar
    if (date !== undefined) updateData.date = date

    const review = await db.review.update({
      where: { id },
      data: updateData,
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
    console.error('Review update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingReview = await db.review.findUnique({ where: { id } })
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { id },
    })
  } catch (error) {
    console.error('Review delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
