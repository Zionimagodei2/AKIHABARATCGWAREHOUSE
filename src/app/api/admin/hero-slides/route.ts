import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const heroSlides = await db.heroSlide.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(heroSlides)
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, title, subtitle, accent, order, active } = body

    if (!image || !title) {
      return NextResponse.json(
        { error: 'Image and title are required' },
        { status: 400 }
      )
    }

    const heroSlide = await db.heroSlide.create({
      data: {
        image,
        title,
        subtitle: subtitle || '',
        accent: accent || '',
        order: order !== undefined ? parseInt(order) : 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(heroSlide, { status: 201 })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 }
    )
  }
}
