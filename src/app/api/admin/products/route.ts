import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      price,
      originalPrice,
      image,
      images,
      description,
      category,
      categories,
      rating,
      reviewCount,
      inStock,
      featured,
      source,
      sku,
    } = body;

    if (!title || price === undefined || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, image' },
        { status: 400 },
      );
    }

    const product = await db.product.create({
      data: {
        title,
        price: Number(price),
        originalPrice:
          originalPrice !== undefined && originalPrice !== null
            ? Number(originalPrice)
            : null,
        image,
        images:
          typeof images === 'string'
            ? images
            : JSON.stringify(images || []),
        description: description || null,
        category: category || 'Uncategorized',
        categories:
          typeof categories === 'string'
            ? categories
            : JSON.stringify(categories || []),
        rating: rating !== undefined ? Number(rating) : 4.5,
        reviewCount: reviewCount !== undefined ? Number(reviewCount) : 0,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        source: source || null,
        sku: sku || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing product id' },
        { status: 400 },
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};
    const fields = [
      'title',
      'description',
      'image',
      'category',
      'source',
      'sku',
    ];
    const numberFields = [
      'price',
      'originalPrice',
      'rating',
      'reviewCount',
    ];
    const booleanFields = ['inStock', 'featured'];

    for (const f of fields) {
      if (rest[f] !== undefined) data[f] = rest[f];
    }
    for (const f of numberFields) {
      if (rest[f] !== undefined && rest[f] !== null) {
        data[f] = Number(rest[f]);
      } else if (rest[f] === null) {
        data[f] = null;
      }
    }
    for (const f of booleanFields) {
      if (rest[f] !== undefined) data[f] = Boolean(rest[f]);
    }
    if (rest.images !== undefined) {
      data.images =
        typeof rest.images === 'string'
          ? rest.images
          : JSON.stringify(rest.images || []);
    }
    if (rest.categories !== undefined) {
      data.categories =
        typeof rest.categories === 'string'
          ? rest.categories
          : JSON.stringify(rest.categories || []);
    }

    const updated = await db.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}
