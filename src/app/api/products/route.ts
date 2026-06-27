import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (subcategory) {
      // categories is stored as a JSON string array, use string contains filter
      where.categories = { contains: subcategory };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Build order by
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sort) {
      case 'featured':
        orderBy = { featured: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { title: 'asc' };
        break;
      case 'name-desc':
        orderBy = { title: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Build findMany options
    const findOptions: Prisma.ProductFindManyArgs = {
      where,
      orderBy,
    };

    if (limit) {
      findOptions.take = parseInt(limit, 10);
    }

    const products = await db.product.findMany(findOptions);

    const transformed = products.map((p) => transformProduct(p as unknown as Record<string, unknown>));

    return NextResponse.json({ products: transformed, total: transformed.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
