import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Failed to fetch hero slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, title, subtitle, accent, order, active } = body;

    if (!image || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: image, title' },
        { status: 400 },
      );
    }

    const slide = await db.heroSlide.create({
      data: {
        image,
        title,
        subtitle: subtitle || '',
        accent: accent || '',
        order: order !== undefined ? Number(order) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('Failed to create hero slide:', error);
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 },
    );
  }
}
