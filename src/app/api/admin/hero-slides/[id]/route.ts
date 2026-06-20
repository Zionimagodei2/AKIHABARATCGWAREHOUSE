import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { image, title, subtitle, accent, order, active } = body

    const existingSlide = await db.heroSlide.findUnique({ where: { id } })
    if (!existingSlide) {
      return NextResponse.json(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (image !== undefined) updateData.image = image
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (accent !== undefined) updateData.accent = accent
    if (order !== undefined) updateData.order = parseInt(String(order))
    if (active !== undefined) updateData.active = Boolean(active)

    const slide = await db.heroSlide.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: slide,
    })
  } catch (error) {
    console.error('Hero slide update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update hero slide' },
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

    const existingSlide = await db.heroSlide.findUnique({ where: { id } })
    if (!existingSlide) {
      return NextResponse.json(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      )
    }

    await db.heroSlide.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { id },
    })
  } catch (error) {
    console.error('Hero slide delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero slide' },
      { status: 500 }
    )
  }
}
