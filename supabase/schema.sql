-- Desi Occasions (MVP) schema
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  whatsapp_e164 text not null,
  map_url text,
  hero_url text,
  created_at timestamptz not null default now()
);

create table if not exists vendor_catalog (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  kind text not null check (kind in ('daily','occasion')),
  meal_slot text check (meal_slot in ('breakfast','lunch','dinner')),
  title text not null,
  description text,
  price_gbp int,
  is_veg boolean,
  created_at timestamptz not null default now()
);

create table if not exists vendor_gallery (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete restrict,
  order_type text not null check (order_type in ('daily','occasion')),
  meal_slot text,
  status text not null default 'sent',
  items jsonb not null,
  note text,
  created_at timestamptz not null default now()
);

-- RLS (basic open read for storefront; tighten later)
alter table vendors enable row level security;
alter table vendor_catalog enable row level security;
alter table vendor_gallery enable row level security;
alter table orders enable row level security;

create policy "vendors_read" on vendors for select using (true);
create policy "catalog_read" on vendor_catalog for select using (true);
create policy "gallery_read" on vendor_gallery for select using (true);
create policy "orders_read" on orders for select using (true);

-- For MVP write access is open; in production restrict by auth user/vendor ownership.
create policy "vendors_write" on vendors for insert with check (true);
create policy "vendors_update" on vendors for update using (true);

create policy "catalog_write" on vendor_catalog for insert with check (true);
create policy "catalog_update" on vendor_catalog for update using (true);

create policy "gallery_write" on vendor_gallery for insert with check (true);

create policy "orders_write" on orders for insert with check (true);
create policy "orders_update" on orders for update using (true);

-- v2 additions: customer + delivery fields
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_whatsapp_e164 text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_map_url text;
alter table orders add column if not exists delivery_time text;

-- v3 additions: totals
alter table orders add column if not exists total_gbp numeric;
alter table orders add column if not exists delivery_fee_gbp numeric;

-- v4 additions: delivery_date
alter table orders add column if not exists delivery_date date;

-- v4 additions: vendor capacities
alter table vendors add column if not exists breakfast_capacity integer;
alter table vendors add column if not exists lunch_capacity integer;
alter table vendors add column if not exists dinner_capacity integer;

-- v5 additions: vendor discovery
alter table vendors add column if not exists is_featured boolean;
alter table vendors add column if not exists categories text[];

-- v5 additions: cutoffs
alter table vendors add column if not exists breakfast_cutoff time;
alter table vendors add column if not exists lunch_cutoff time;
alter table vendors add column if not exists dinner_cutoff time;

-- v5 additions: customer address book
create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text,
  address text not null,
  map_url text,
  created_at timestamptz default now()
);

-- v8 additions: vendor media
alter table vendors add column if not exists cover_image_url text;
alter table vendors add column if not exists gallery_urls text[];

-- v9 additions: vendor brochure/menu + verification
alter table vendors add column if not exists menu_pdf_url text;
alter table vendors add column if not exists is_verified boolean;
alter table vendors add column if not exists verified_at timestamptz;

-- v10 additions: occasions + dietary filters + packages
alter table vendors add column if not exists supported_occasions text[];
alter table vendors add column if not exists dietary_tags text[];
alter table vendors add column if not exists packages jsonb;
