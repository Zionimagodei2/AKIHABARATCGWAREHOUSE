import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    if (
      !body ||
      typeof body !== 'object' ||
      Object.keys(body).length === 0
    ) {
      return NextResponse.json(
        { error: 'No settings provided' },
        { status: 400 },
      );
    }

    const operations = Object.entries(body).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: {
          key,
          value: String(value ?? ''),
        },
        update: {
          value: String(value ?? ''),
        },
      }),
    );

    await Promise.all(operations);

    const all = await db.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of all) {
      map[s.key] = s.value;
    }

    return NextResponse.json(map);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    );
  }
}
