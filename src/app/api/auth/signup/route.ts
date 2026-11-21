import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, insertInto, isSupabaseConfigured } from '@/lib/supabase-client'
import { hashPassword } from '@/lib/password'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { email, password, name } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user exists
    const { data: existing } = await selectFrom('users', '*', { email: `eq.${normalizedEmail}` })

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashed = await hashPassword(password)

    const { data, error } = await insertInto('users', {
      email: normalizedEmail,
      password: hashed,
      name: name?.trim() || null,
      role: 'customer',
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    const user = (data?.[0] || {}) as { id?: string; email?: string; name?: string | null; role?: string }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, { status: 201 })
  } catch (error) {
    console.error('Signup failed:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
