import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, active, order } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const announcement = await db.announcement.create({
      data: {
        message: message.trim(),
        active: active !== undefined ? Boolean(active) : true,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 },
    );
  }
}
