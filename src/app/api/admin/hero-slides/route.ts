import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: slides,
    })
  } catch (error) {
    console.error('Hero slides list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero slides' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, title, subtitle, accent, order, active } = body

    if (!image || !title || !subtitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: image, title, subtitle' },
        { status: 400 }
      )
    }

    const slide = await db.heroSlide.create({
      data: {
        image,
        title,
        subtitle,
        accent: accent || '',
        order: order !== undefined ? parseInt(String(order)) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: slide,
    })
  } catch (error) {
    console.error('Hero slide create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create hero slide' },
      { status: 500 }
    )
  }
}
