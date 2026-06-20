import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Default hero slides data
const DEFAULT_HERO_SLIDES = [
  {
    image: '/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.avif',
    title: 'Japanese Pokémon TCG',
    subtitle: 'Direct from Akihabara — Authentic & Sealed',
    accent: 'New Arrivals',
    order: 0,
    active: true,
  },
  {
    image: '/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif',
    title: 'VSTAR Universe',
    subtitle: 'Rare pulls & exclusive artwork from Japan',
    accent: 'Limited Stock',
    order: 1,
    active: true,
  },
  {
    image: '/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif',
    title: 'Ruler of the Black Flame',
    subtitle: 'Charizard ex & more — Sealed Booster Boxes',
    accent: 'Hot',
    order: 2,
    active: true,
  },
  {
    image: '/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif',
    title: 'Snow Hazard Collection',
    subtitle: 'Complete your Japanese set before they\'re gone',
    accent: 'Sale',
    order: 3,
    active: true,
  },
]

// Default announcements
const DEFAULT_ANNOUNCEMENTS = [
  { message: 'Free Shipping on Orders Over $150', active: true, order: 0 },
  { message: 'Direct from Japan — 100% Authentic Sealed Products', active: true, order: 1 },
  { message: 'Ships Worldwide — Secure Packaging Guaranteed', active: true, order: 2 },
  { message: 'Trusted by Thousands of Collectors Worldwide', active: true, order: 3 },
  { message: 'Guaranteed Authenticity on Every Item We Sell', active: true, order: 4 },
]

interface ProductJSON {
  id: string
  title: string
  price: number
  original_price?: number
  image: string
  images?: string[]
  description?: string
  category: string
  categories?: string[]
  rating?: number
  in_stock?: boolean
  featured?: boolean
  source?: string
  sku?: string
}

export async function POST() {
  try {
    // Read products.json
    const productsPath = path.join(process.cwd(), 'public', 'products.json')
    const productsRaw = await readFile(productsPath, 'utf-8')
    const productsJSON: ProductJSON[] = JSON.parse(productsRaw)

    // Clear existing data (in reverse dependency order)
    await db.orderItem.deleteMany()
    await db.order.deleteMany()
    await db.review.deleteMany()
    await db.product.deleteMany()
    await db.heroSlide.deleteMany()
    await db.announcement.deleteMany()
    await db.siteSetting.deleteMany()
    // Don't delete all users - we'll create admin only if not exists

    // Insert products using createMany for efficiency
    const productData = productsJSON.map((p) => ({
      title: p.title,
      price: p.price,
      originalPrice: p.original_price || null,
      image: p.image,
      images: JSON.stringify(p.images || []),
      description: p.description || null,
      category: p.category,
      categories: JSON.stringify(p.categories || []),
      rating: p.rating || 4.5,
      reviewCount: 0,
      inStock: p.in_stock !== undefined ? p.in_stock : true,
      featured: p.featured || false,
      source: p.source || null,
      sku: p.sku || null,
    }))

    const productsResult = await db.product.createMany({
      data: productData,
    })

    // Create admin user (if not exists)
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@akihabara.com' },
    })

    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'admin@akihabara.com',
          password: 'admin123',
          name: 'Admin',
          role: 'admin',
        },
      })
    }

    // Create hero slides
    const slidesResult = await db.heroSlide.createMany({
      data: DEFAULT_HERO_SLIDES,
    })

    // Create announcements
    const announcementsResult = await db.announcement.createMany({
      data: DEFAULT_ANNOUNCEMENTS,
    })

    // Create sample customers
    const sampleCustomers = [
      { email: 'tanaka@example.com', name: 'Yuki Tanaka', password: 'customer123', role: 'customer', phone: '+81 90-1234-5678', city: 'Tokyo', country: 'Japan' },
      { email: 'smith@example.com', name: 'John Smith', password: 'customer123', role: 'customer', phone: '+1 555-0123', city: 'New York', country: 'USA' },
      { email: 'mueller@example.com', name: 'Hans Mueller', password: 'customer123', role: 'customer', phone: '+49 170-1234567', city: 'Berlin', country: 'Germany' },
      { email: 'garcia@example.com', name: 'Maria Garcia', password: 'customer123', role: 'customer', phone: '+34 612-345-678', city: 'Madrid', country: 'Spain' },
      { email: 'kim@example.com', name: 'Ji-woo Kim', password: 'customer123', role: 'customer', phone: '+82 10-1234-5678', city: 'Seoul', country: 'South Korea' },
    ]
    await db.user.deleteMany({ where: { role: 'customer' } })
    const customers = []
    for (const c of sampleCustomers) {
      const existing = await db.user.findUnique({ where: { email: c.email } })
      if (!existing) {
        customers.push(await db.user.create({ data: c }))
      } else {
        customers.push(existing)
      }
    }

    // Create sample orders
    const allProducts = await db.product.findMany({ take: 20 })
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    const orders = []
    for (let i = 0; i < 8; i++) {
      const customer = customers[i % customers.length]
      const numItems = Math.floor(Math.random() * 3) + 1
      const orderProducts = allProducts.slice(i * 2, i * 2 + numItems)
      const total = orderProducts.reduce((sum, p) => sum + p.price, 0)
      const status = statuses[i % statuses.length]

      const order = await db.order.create({
        data: {
          userId: customer.id,
          total: Math.round(total * 100) / 100,
          status,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: `${i + 1}-${i * 10 + 5} Shibuya`,
          shippingCity: customer.city,
          shippingCountry: customer.country,
          shippingZip: `150-${1000 + i}`,
          items: {
            create: orderProducts.map(p => ({
              productId: p.id,
              title: p.title,
              price: p.price,
              quantity: 1,
              image: p.image,
            })),
          },
        },
      })
      orders.push(order)
    }

    // Create default site settings
    await db.siteSetting.upsert({ where: { key: 'siteName' }, update: {}, create: { key: 'siteName', value: 'Akihabara TCG Warehouse' } })
    await db.siteSetting.upsert({ where: { key: 'whatsappNumber' }, update: {}, create: { key: 'whatsappNumber', value: '+81 80-2935-0455' } })
    await db.siteSetting.upsert({ where: { key: 'currencyUSD' }, update: {}, create: { key: 'currencyUSD', value: '1' } })
    await db.siteSetting.upsert({ where: { key: 'currencyJPY' }, update: {}, create: { key: 'currencyJPY', value: '149.5' } })
    await db.siteSetting.upsert({ where: { key: 'currencyEUR' }, update: {}, create: { key: 'currencyEUR', value: '0.92' } })
    await db.siteSetting.upsert({ where: { key: 'currencyGBP' }, update: {}, create: { key: 'currencyGBP', value: '0.79' } })

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          products: productsResult.count,
          user: existingAdmin ? 0 : 1,
          slides: slidesResult.count,
          announcements: announcementsResult.count,
          customers: customers.length,
          orders: orders.length,
        },
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
