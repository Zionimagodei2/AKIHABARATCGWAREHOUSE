import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, updateIn, isSupabaseConfigured } from '@/lib/supabase-client'
import { hashPassword, isLegacySha256Hash, verifyPassword } from '@/lib/password'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await selectFrom('users', '*', { email: `eq.${normalizedEmail}` })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = data[0] as { id?: string; email?: string; name?: string | null; role?: string; password?: string }
    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Transparently upgrade legacy unsalted SHA-256 hashes to scrypt.
    if (isLegacySha256Hash(user.password)) {
      const upgraded = await hashPassword(password)
      const filter: Record<string, string> = user.id ? { id: `eq.${user.id}` } : { email: `eq.${normalizedEmail}` }
      await updateIn('users', filter, { password: upgraded }).catch(() => undefined)
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, { status: 200 })
  } catch (error) {
    console.error('Signin failed:', error)
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 })
  }
}
