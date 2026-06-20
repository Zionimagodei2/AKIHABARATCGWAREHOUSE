import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortParam = searchParams.get('sort') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sortParam) {
      const [field, direction] = sortParam.split(':')
      if (field && direction) {
        orderBy = { [field]: direction }
      }
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      db.product.count({ where }),
    ])

    // Parse JSON fields
    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      categories: JSON.parse(p.categories),
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: parsedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Products list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      inStock,
      featured,
      source,
      sku,
    } = body

    if (!title || price === undefined || !image || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, price, image, category' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        title,
        price: parseFloat(String(price)),
        originalPrice: originalPrice ? parseFloat(String(originalPrice)) : null,
        image,
        images: JSON.stringify(images || []),
        description: description || null,
        category,
        categories: JSON.stringify(categories || []),
        rating: rating ? parseFloat(String(rating)) : 4.5,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        source: source || null,
        sku: sku || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        images: JSON.parse(product.images),
        categories: JSON.parse(product.categories),
      },
    })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
