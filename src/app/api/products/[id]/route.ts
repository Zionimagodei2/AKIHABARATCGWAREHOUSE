import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

type ProductSnake = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  image: string;
  images: string[];
  description: string | null;
  category: string;
  categories: string[];
  rating: number;
  review_count: number;
  in_stock: boolean;
  featured: boolean;
  source: string | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
};

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
    if (typeof parsed === 'string') {
      return [parsed];
    }
    return [];
  } catch {
    return [];
  }
}

function transformProduct(product: {
  id: string;
  title: string;
  price: Prisma.Decimal | number;
  originalPrice: Prisma.Decimal | number | null;
  image: string;
  images: string;
  description: string | null;
  category: string;
  categories: string;
  rating: Prisma.Decimal | number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  source: string | null;
  sku: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProductSnake {
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price),
    original_price:
      product.originalPrice === null || product.originalPrice === undefined
        ? null
        : Number(product.originalPrice),
    image: product.image,
    images: parseJsonArray(product.images),
    description: product.description,
    category: product.category,
    categories: parseJsonArray(product.categories),
    rating: Number(product.rating),
    review_count: product.reviewCount,
    in_stock: product.inStock,
    featured: product.featured,
    source: product.source,
    sku: product.sku,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing product id' },
        { status: 400 },
      );
    }

    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ product: transformProduct(product) });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}
