import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, insertInto, isSupabaseConfigured } from '@/lib/supabase-client'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json([])
    }

    const { data, error } = await selectFrom('announcements', '*', {}, { order: 'order.asc' })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    if (!body.message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const { data, error } = await insertInto('announcements', {
      message: body.message,
      active: body.active ?? true,
      order: body.order ?? 0,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
