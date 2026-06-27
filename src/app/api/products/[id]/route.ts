import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function transformProduct(product: Record<string, unknown>) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    original_price: product.originalPrice ?? null,
    image: product.image,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    description: product.description ?? null,
    category: product.category,
    categories: typeof product.categories === 'string' ? JSON.parse(product.categories) : product.categories,
    rating: product.rating,
    review_count: product.reviewCount,
    in_stock: product.inStock,
    featured: product.featured,
    source: product.source ?? null,
    sku: product.sku ?? null,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const transformed = transformProduct(product as unknown as Record<string, unknown>);

    return NextResponse.json({ product: transformed });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
