-- ============================================================
-- AKIHABARA TCG WAREHOUSE — Supabase SQL Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  image TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  categories TEXT DEFAULT '[]',
  rating REAL DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  source TEXT,
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id),
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_country TEXT,
  shipping_zip TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  title TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id),
  user_id TEXT REFERENCES users(id),
  author TEXT NOT NULL,
  rating REAL DEFAULT 5,
  comment TEXT NOT NULL,
  date TEXT,
  avatar TEXT,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS hero_slides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  accent TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read, only admin can write
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders: anyone can insert (checkout), admin can read all
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are readable" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (true);

-- Order items: anyone can insert, admin can read
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items are readable" ON order_items FOR SELECT USING (true);

-- Reviews: anyone can read, anyone can insert, admin can update/delete
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Hero slides: publicly readable, admin can manage
CREATE POLICY "Hero slides are publicly readable" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Admin can manage hero slides" ON hero_slides FOR ALL USING (true) WITH CHECK (true);

-- Announcements: publicly readable, admin can manage
CREATE POLICY "Announcements are publicly readable" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin can manage announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- Settings: publicly readable, admin can manage
CREATE POLICY "Settings are publicly readable" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Users: admin can manage, customers can read own profile
CREATE POLICY "Users readable" ON users FOR SELECT USING (true);
CREATE POLICY "Admin can manage users" ON users FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) WHERE in_stock = false;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides("order");

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update updated_at on row change)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA: Admin user (password: Akihabarat1$)
-- ============================================================
INSERT INTO users (email, name, password, role) VALUES
  ('admin@akihabara.com', 'Admin', 'Akihabarat1$', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Update existing admin password if already present
UPDATE users SET password = 'Akihabarat1$' WHERE email = 'admin@akihabara.com' AND password != 'Akihabarat1$';

-- ============================================================
-- SEED DATA: Default site settings
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('siteName', 'Akihabara TCG Warehouse'),
  ('whatsappNumber', '+81 80-2935-0455'),
  ('currency', 'USD'),
  ('currencyUSD', '1'),
  ('currencyJPY', '149.5'),
  ('currencyEUR', '0.92'),
  ('currencyGBP', '0.79')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED DATA: Default announcements
-- ============================================================
INSERT INTO announcements (message, active, "order") VALUES
  ('Free Shipping on Orders Over $150', true, 0),
  ('Direct from Japan — 100% Authentic Sealed Products', true, 1),
  ('Ships Worldwide — Secure Packaging Guaranteed', true, 2),
  ('Trusted by Thousands of Collectors Worldwide', true, 3),
  ('Guaranteed Authenticity on Every Item We Sell', true, 4);

-- ============================================================
-- SEED DATA: Default hero slides
-- ============================================================
INSERT INTO hero_slides (image, title, subtitle, accent, "order", active) VALUES
  ('/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.avif', 'Japanese Pokémon TCG', 'Direct from Akihabara — Authentic & Sealed', 'New Arrivals', 0, true),
  ('/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif', 'VSTAR Universe', 'Rare pulls & exclusive artwork from Japan', 'Limited Stock', 1, true),
  ('/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif', 'Ruler of the Black Flame', 'Charizard ex & more — Sealed Booster Boxes', 'Hot', 2, true),
  ('/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif', 'Snow Hazard Collection', 'Complete your Japanese set before they''re gone', 'Sale', 3, true);

-- ============================================================
-- MIGRATION: Run these if updating an EXISTING database
-- ============================================================

-- Add subcategory column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'subcategory') THEN
    ALTER TABLE products ADD COLUMN subcategory TEXT;
  END IF;
END $$;

-- Update admin password
UPDATE users SET password = 'Akihabarat1$' WHERE email = 'admin@akihabara.com';

-- Add index for subcategory if not exists
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
