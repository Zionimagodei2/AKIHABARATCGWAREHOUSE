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
      password: 'admin123', // In production, this would be hashed
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

  // Create announcements
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

  // Create hero slides
  const slides = [
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
