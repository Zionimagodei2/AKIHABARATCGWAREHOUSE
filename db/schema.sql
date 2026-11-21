-- Akihabara TCG Warehouse — Postgres schema (post-Supabase migration)
--
-- Apply with:  psql "$DATABASE_URL" -f db/schema.sql
-- Data import: node scripts/migrate-from-supabase.mjs
--
-- Ids are text: customer-facing order ids use the AKI-XXX format, and
-- user/item ids carried over from Supabase are UUID strings. New rows
-- get a UUID default so server inserts that omit `id` keep working
-- (gen_random_uuid() is built into Postgres 13+).

create table if not exists users (
  id         text primary key default gen_random_uuid()::text,
  email      text unique not null,
  name       text,
  role       text not null default 'customer',
  password   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id               text primary key,
  user_id          text,
  total            numeric not null default 0,
  status           text not null default 'pending',
  customer_name    text,
  customer_email   text,
  customer_phone   text,
  shipping_address text,
  shipping_city    text,
  shipping_country text,
  shipping_zip     text,
  payment_method   text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id         text primary key default gen_random_uuid()::text,
  order_id   text not null references orders(id) on delete cascade,
  product_id text,
  title      text,
  price      numeric not null default 0,
  quantity   integer not null default 1,
  image      text
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- Columns mirror the ProductRow shape selected by
-- src/app/api/products/route.ts and src/app/api/products/[id]/route.ts.
-- `images`/`categories` were string-or-array in the old store, so they
-- are jsonb here (the routes accept either). `data` keeps any extra
-- product payload that has no dedicated column.
create table if not exists products (
  id             text primary key,
  title          text,
  price          numeric,
  original_price numeric,
  image          text,
  images         jsonb,
  description    text,
  category       text,
  categories     jsonb,
  rating         numeric,
  review_count   integer,
  in_stock       boolean not null default true,
  featured       boolean not null default false,
  source         text,
  sku            text,
  data           jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_created_at_idx on products (created_at desc);

-- Keep updated_at fresh on UPDATE (the old PostgREST flow set it
-- explicitly from the client; the API routes now just patch fields).
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();
