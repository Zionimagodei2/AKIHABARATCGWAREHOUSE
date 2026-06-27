import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Snake-case representation of a product for the frontend
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    // Build Prisma where clause
    const where: Prisma.ProductWhereInput = {};

    if (category && category.trim() !== '') {
      // Match either the primary category field or the categories JSON array.
      // SQLite is case-insensitive by default for ASCII LIKE/contains queries.
      where.OR = [
        { category: { equals: category } },
        { category: { contains: category } },
        { categories: { contains: category } },
      ];
    }

    if (subcategory && subcategory.trim() !== '') {
      // subcategory lives inside the categories JSON array
      where.categories = { contains: subcategory };
    }

    if (search && search.trim() !== '') {
      const searchFilter: Prisma.ProductWhereInput = {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { sku: { contains: search } },
        ],
      };

      if (where.AND) {
        where.AND = Array.isArray(where.AND)
          ? [...where.AND, searchFilter]
          : [where.AND, searchFilter];
      } else {
        where.AND = [searchFilter];
      }
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      const isFeatured = featured === 'true' || featured === '1';
      where.featured = isFeatured;
    }

    // Build orderBy based on sort param
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating-desc':
        orderBy = { rating: 'desc' };
        break;
      case 'review-count-desc':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'name-asc':
        orderBy = { title: 'asc' };
        break;
      case 'name-desc':
        orderBy = { title: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Determine limit
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const take =
      parsedLimit && !Number.isNaN(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : undefined;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        ...(take ? { take } : {}),
      }),
      db.product.count({ where }),
    ]);

    const transformed = products.map(transformProduct);

    return NextResponse.json({ products: transformed, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], total: 0 },
      { status: 500 },
    );
  }
}
