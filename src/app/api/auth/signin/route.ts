import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, isSupabaseConfigured } from '@/lib/supabase-client'
import crypto from 'crypto'

const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex')

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
    const hashed = hashPassword(password)

    const { data, error } = await selectFrom('users', '*', { email: `eq.${normalizedEmail}` })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = data[0]
    if (user.password !== hashed) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
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
