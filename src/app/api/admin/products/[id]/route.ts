import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        images: JSON.parse(product.images),
        categories: JSON.parse(product.categories),
      },
    })
  } catch (error) {
    console.error('Product get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const existingProduct = await db.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (price !== undefined) updateData.price = parseFloat(String(price))
    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice ? parseFloat(String(originalPrice)) : null
    }
    if (image !== undefined) updateData.image = image
    if (images !== undefined) updateData.images = JSON.stringify(images)
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (categories !== undefined) updateData.categories = JSON.stringify(categories)
    if (rating !== undefined) updateData.rating = parseFloat(String(rating))
    if (inStock !== undefined) updateData.inStock = Boolean(inStock)
    if (featured !== undefined) updateData.featured = Boolean(featured)
    if (source !== undefined) updateData.source = source
    if (sku !== undefined) updateData.sku = sku

    const product = await db.product.update({
      where: { id },
      data: updateData,
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
    console.error('Product update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingProduct = await db.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    await db.product.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { id },
    })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
