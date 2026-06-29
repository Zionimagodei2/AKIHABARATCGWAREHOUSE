import { PrismaClient } from '@prisma/client';
import productsData from '../public/products.json';

const prisma = new PrismaClient();

interface ProductJSON {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  image: string;
  description?: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  rating?: number;
  in_stock?: boolean;
  source?: string;
  url?: string;
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@akihabara-tcg.com' },
    update: {},
    create: {
      email: 'admin@akihabara-tcg.com',
      name: 'Admin',
      password: 'admin123',
      role: 'admin',
    },
  });
  console.log('Created admin user:', adminUser.email);

  // Create site settings
  const settings = [
    { key: 'store_name', value: 'Akihabara TCG Warehouse' },
    { key: 'announcement_active', value: 'true' },
    { key: 'whatsapp_number', value: '' },
    { key: 'currency_default', value: 'USD' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('Created site settings');

  // Clear existing announcements and recreate
  await prisma.announcement.deleteMany({});
  const announcements = [
    { message: 'Free Shipping on Orders Over $500', active: true, order: 0 },
    { message: 'Direct from Japan — 100% Authentic Sealed Products', active: true, order: 1 },
    { message: 'Ships Worldwide — Secure Packaging Guaranteed', active: true, order: 2 },
    { message: 'Trusted by Thousands of Collectors Worldwide', active: true, order: 3 },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }
  console.log('Created announcements');

  // Clear existing hero slides and recreate
  await prisma.heroSlide.deleteMany({});
  const slides = [
    {
      image: '/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.webp',
      title: 'Japanese Pokémon TCG',
      subtitle: 'Direct from Akihabara — Authentic & Sealed',
      accent: 'New Arrivals',
      order: 0,
      active: true,
    },
    {
      image: '/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp',
      title: 'VSTAR Universe',
      subtitle: 'Rare pulls & exclusive artwork from Japan',
      accent: 'Limited Stock',
      order: 1,
      active: true,
    },
    {
      image: '/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp',
      title: 'Ruler of the Black Flame',
      subtitle: 'Charizard ex & more — Sealed Booster Boxes',
      accent: 'Hot',
      order: 2,
      active: true,
    },
    {
      image: '/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp',
      title: 'Snow Hazard Collection',
      subtitle: "Complete your Japanese set before they're gone",
      accent: 'Sale',
      order: 3,
      active: true,
    },
  ];

  for (const s of slides) {
    await prisma.heroSlide.create({ data: s });
  }
  console.log('Created hero slides');

  // Seed products from JSON
  const products = productsData as ProductJSON[];
  let count = 0;

  for (const p of products) {
    if (!p.title || !p.image || p.price <= 0) continue;

    await prisma.product.upsert({
      where: { id: `prod_${p.id}` },
      update: {
        title: p.title,
        price: p.price,
        originalPrice: p.original_price || null,
        image: p.image,
        images: JSON.stringify(p.image ? [p.image] : []),
        description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed.`,
        category: p.category || 'Other TCG',
        categories: JSON.stringify(p.categories || [p.category || 'Other TCG']),
        rating: p.rating || 4.5,
        inStock: p.in_stock !== false,
        featured: p.rating && p.rating >= 4.7 && p.in_stock !== false,
        source: p.source || null,
      },
      create: {
        id: `prod_${p.id}`,
        title: p.title,
        price: p.price,
        originalPrice: p.original_price || null,
        image: p.image,
        images: JSON.stringify(p.image ? [p.image] : []),
        description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed.`,
        category: p.category || 'Other TCG',
        categories: JSON.stringify(p.categories || [p.category || 'Other TCG']),
        rating: p.rating || 4.5,
        inStock: p.in_stock !== false,
        featured: p.rating && p.rating >= 4.7 && p.in_stock !== false,
        source: p.source || null,
      },
    });
    count++;
  }

  console.log(`Seeded ${count} products`);

  // Create sample orders if none exist
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    console.log('Creating sample orders...');

    // Get some product IDs for the orders
    const sampleProducts = await prisma.product.findMany({ take: 6 });

    const sampleOrders = [
      {
        customerName: 'John Smith',
        customerEmail: 'john.smith@example.com',
        customerPhone: '+1 555-0123',
        shippingAddress: '123 Main St, Apt 4B',
        shippingCity: 'New York',
        shippingCountry: 'United States',
        shippingZip: '10001',
        total: 1214.40,
        status: 'pending',
        notes: 'Please gift wrap if possible',
        items: [
          { productId: sampleProducts[0]?.id || null, title: sampleProducts[0]?.title || 'Pokemon Booster Box', price: 1214.40, quantity: 1, image: sampleProducts[0]?.image || null },
        ],
      },
      {
        customerName: 'Yuki Tanaka',
        customerEmail: 'yuki.tanaka@example.com',
        customerPhone: '+81 90-1234-5678',
        shippingAddress: '1-2-3 Shibuya',
        shippingCity: 'Tokyo',
        shippingCountry: 'Japan',
        shippingZip: '150-0001',
        total: 389.84,
        status: 'processing',
        notes: '',
        items: [
          { productId: sampleProducts[1]?.id || null, title: sampleProducts[1]?.title || 'One Piece Booster', price: 187.44, quantity: 1, image: sampleProducts[1]?.image || null },
          { productId: sampleProducts[2]?.id || null, title: sampleProducts[2]?.title || 'Pokemon Elite Trainer', price: 202.40, quantity: 1, image: sampleProducts[2]?.image || null },
        ],
      },
      {
        customerName: 'Hans Mueller',
        customerEmail: 'hans.mueller@example.com',
        customerPhone: '+49 170-1234567',
        shippingAddress: 'Hauptstrasse 45',
        shippingCity: 'Berlin',
        shippingCountry: 'Germany',
        shippingZip: '10115',
        total: 434.72,
        status: 'shipped',
        notes: 'Tracking number needed',
        items: [
          { productId: sampleProducts[3]?.id || null, title: sampleProducts[3]?.title || 'Dragon Ball Booster', price: 308.00, quantity: 1, image: sampleProducts[3]?.image || null },
          { productId: sampleProducts[4]?.id || null, title: sampleProducts[4]?.title || 'Weiss Schwarz', price: 126.72, quantity: 1, image: sampleProducts[4]?.image || null },
        ],
      },
      {
        customerName: 'Maria Garcia',
        customerEmail: 'maria.garcia@example.com',
        customerPhone: '+34 612-345-678',
        shippingAddress: 'Calle Mayor 12',
        shippingCity: 'Madrid',
        shippingCountry: 'Spain',
        shippingZip: '28001',
        total: 95.92,
        status: 'delivered',
        notes: '',
        items: [
          { productId: sampleProducts[5]?.id || null, title: sampleProducts[5]?.title || 'Union Arena Booster', price: 95.92, quantity: 1, image: sampleProducts[5]?.image || null },
        ],
      },
      {
        customerName: 'David Kim',
        customerEmail: 'david.kim@example.com',
        customerPhone: '+82 10-1234-5678',
        shippingAddress: 'Gangnam-gu, Seoul',
        shippingCity: 'Seoul',
        shippingCountry: 'South Korea',
        shippingZip: '06236',
        total: 5140.08,
        status: 'pending',
        notes: 'Bulk order — please confirm availability',
        items: [
          { productId: sampleProducts[0]?.id || null, title: sampleProducts[0]?.title || 'Sealed Case', price: 5140.08, quantity: 1, image: sampleProducts[0]?.image || null },
        ],
      },
    ];

    for (const order of sampleOrders) {
      await prisma.order.create({
        data: {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          shippingCity: order.shippingCity,
          shippingCountry: order.shippingCountry,
          shippingZip: order.shippingZip,
          total: order.total,
          status: order.status,
          notes: order.notes,
          items: {
            create: order.items,
          },
        },
      });
    }
    console.log(`Created ${sampleOrders.length} sample orders`);
  } else {
    console.log(`Orders already exist (${existingOrders}) — skipping sample orders`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
