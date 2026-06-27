import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body || {};

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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 },
      );
    }

    const hashed = hashPassword(password);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: name?.trim() || null,
        role: 'customer',
      },
    });

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
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup failed:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }
}
