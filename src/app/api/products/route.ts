import { NextResponse, NextRequest } from 'next/server'
import { selectFrom, isSupabaseConfigured } from '@/lib/supabase-client'

interface ProductRow {
  id: string
  title: string
  price: number
  original_price: number | null
  image: string
  images: string | string[]
  description: string | null
  category: string
  categories: string | string[]
  rating: number
  review_count: number
  in_stock: boolean
  featured: boolean
  source: string | null
  sku: string | null
  created_at: string
  updated_at: string
}

function transformProduct(p: ProductRow) {
  let categories: string[] = []
  try {
    categories = typeof p.categories === 'string' ? JSON.parse(p.categories) : (p.categories || [])
  } catch { categories = [] }

  let images: string[] = []
  try {
    images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
  } catch { images = [] }

  return {
    id: p.id,
    title: p.title,
    price: p.price,
    original_price: p.original_price ?? null,
    image: p.image,
    images,
    description: p.description ?? null,
    category: p.category,
    categories,
    rating: p.rating ?? 4.5,
    review_count: p.review_count ?? 0,
    in_stock: p.in_stock ?? true,
    featured: p.featured ?? false,
    source: p.source ?? null,
    sku: p.sku ?? null,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ products: [], total: 0, error: 'Database not configured' }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured')
    const limitRaw = searchParams.get('limit')

    // Build filters
    const filters: Record<string, string> = {}
    if (category && category !== 'all') filters.category = `eq.${category}`
    if (featured === 'true') filters.featured = 'eq.true'

    // Build order
    let order = 'created_at.desc'
    switch (sort) {
      case 'price-asc': order = 'price.asc'; break
      case 'price-desc': order = 'price.desc'; break
      case 'name-asc': order = 'title.asc'; break
      case 'name-desc': order = 'title.desc'; break
      case 'rating': order = 'rating.desc'; break
      case 'featured': order = 'featured.desc'; break
      default: order = 'created_at.desc'
    }

    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined

    let { data, error } = await selectFrom<ProductRow>('products', '*', filters, { order, limit })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    let products = data || []

    // Client-side search (Supabase REST doesn't support ILIKE in query params easily)
    if (search) {
      const q = search.toLowerCase()
      products = products.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }

    // Client-side subcategory filter
    if (subcategory && subcategory !== 'all') {
      products = products.filter(p => {
        try {
          const cats = typeof p.categories === 'string' ? JSON.parse(p.categories) : (p.categories || [])
          return cats.some((c: string) => c.toLowerCase() === subcategory.toLowerCase())
        } catch {
          return false
        }
      })
    }

    const transformed = products.map(transformProduct)

    return NextResponse.json({ products: transformed, total: transformed.length })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
