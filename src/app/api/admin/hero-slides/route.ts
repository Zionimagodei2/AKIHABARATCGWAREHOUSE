import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, insertInto, isSupabaseConfigured } from '@/lib/supabase-client'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json([])
    }

    const { data, error } = await selectFrom('hero_slides', '*', {}, { order: 'order.asc' })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    if (!body.image || !body.title) {
      return NextResponse.json({ error: 'Image and title required' }, { status: 400 })
    }

    const { data, error } = await insertInto('hero_slides', {
      image: body.image,
      title: body.title,
      subtitle: body.subtitle || '',
      accent: body.accent || '',
      order: body.order ?? 0,
      active: body.active ?? true,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 })
  }
}
