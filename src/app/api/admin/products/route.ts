import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
      reviewCount,
      inStock,
      featured,
      source,
      sku,
    } = body

    // Validate required fields
    if (!title || price === undefined || !image || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, image, category' },
        { status: 400 }
      )
    }

    // Convert arrays to JSON strings for storage
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : (images || '[]')
    const categoriesStr = Array.isArray(categories) ? JSON.stringify(categories) : (categories || '[]')

    const product = await db.product.create({
      data: {
        title,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        images: imagesStr,
        description: description || null,
        category,
        categories: categoriesStr,
        rating: rating ? parseFloat(rating) : 4.5,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
        inStock: inStock !== undefined ? inStock : true,
        featured: featured || false,
        source: source || null,
        sku: sku || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product id is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Build update payload, converting arrays to JSON strings
    const data: Record<string, unknown> = {}

    if (updateData.title !== undefined) data.title = updateData.title
    if (updateData.price !== undefined) data.price = parseFloat(updateData.price)
    if (updateData.originalPrice !== undefined) data.originalPrice = updateData.originalPrice ? parseFloat(updateData.originalPrice) : null
    if (updateData.image !== undefined) data.image = updateData.image
    if (updateData.images !== undefined) {
      data.images = Array.isArray(updateData.images) ? JSON.stringify(updateData.images) : updateData.images
    }
    if (updateData.description !== undefined) data.description = updateData.description
    if (updateData.category !== undefined) data.category = updateData.category
    if (updateData.categories !== undefined) {
      data.categories = Array.isArray(updateData.categories) ? JSON.stringify(updateData.categories) : updateData.categories
    }
    if (updateData.rating !== undefined) data.rating = parseFloat(updateData.rating)
    if (updateData.reviewCount !== undefined) data.reviewCount = parseInt(updateData.reviewCount)
    if (updateData.inStock !== undefined) data.inStock = updateData.inStock
    if (updateData.featured !== undefined) data.featured = updateData.featured
    if (updateData.source !== undefined) data.source = updateData.source
    if (updateData.sku !== undefined) data.sku = updateData.sku

    const product = await db.product.update({
      where: { id },
      data,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
