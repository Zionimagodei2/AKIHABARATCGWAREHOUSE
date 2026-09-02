import { NextResponse, NextRequest } from 'next/server'
import { insertInto, updateIn, isSupabaseConfigured } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    const productData = {
      id: body.id || undefined,
      title: body.title,
      price: Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      image: body.image,
      images: JSON.stringify(body.images || []),
      description: body.description || null,
      category: body.category,
      categories: JSON.stringify(body.categories || [body.category]),
      rating: body.rating ? Number(body.rating) : 4.5,
      review_count: 0,
      in_stock: body.inStock ?? true,
      featured: body.featured ?? false,
      source: body.source || null,
      sku: body.sku || null,
    }

    const { data, error } = await insertInto('products', productData)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.price !== undefined) updateData.price = Number(updates.price)
    if (updates.originalPrice !== undefined) updateData.original_price = updates.originalPrice ? Number(updates.originalPrice) : null
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.images !== undefined) updateData.images = JSON.stringify(updates.images)
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.categories !== undefined) updateData.categories = JSON.stringify(updates.categories)
    if (updates.rating !== undefined) updateData.rating = Number(updates.rating)
    if (updates.inStock !== undefined) updateData.in_stock = updates.inStock
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.source !== undefined) updateData.source = updates.source
    if (updates.sku !== undefined) updateData.sku = updates.sku

    const { data, error } = await updateIn('products', { id: `eq.${id}` }, updateData)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { success: true })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
