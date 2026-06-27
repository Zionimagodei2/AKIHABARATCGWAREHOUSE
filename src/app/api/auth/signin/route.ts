import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Signin failed:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 },
    );
  }
}
