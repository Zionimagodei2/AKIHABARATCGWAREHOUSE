import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, updateIn, insertInto, isSupabaseConfigured } from '@/lib/supabase-client'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({})
    }

    const { data, error } = await selectFrom('site_settings', '*')

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    const settings: Record<string, string> = {}
    for (const row of data || []) {
      settings[row.key] = row.value
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const settings = body.settings || body

    for (const [key, value] of Object.entries(settings)) {
      // Try update first
      const { error: updateError } = await updateIn('site_settings', { key: `eq.${key}` }, { value: String(value) })
      if (updateError) {
        // If update fails, try insert
        await insertInto('site_settings', { key, value: String(value) })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
