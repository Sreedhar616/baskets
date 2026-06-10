-- ============================================================================
--  D's Designs — Supabase schema, RLS, storage & seed
--  Run this ENTIRE file once in the Supabase SQL Editor (Dashboard → SQL).
--  Safe to re-run: it uses IF NOT EXISTS / OR REPLACE / DROP POLICY guards.
--  Money is stored as INTEGER PAISE (₹1 = 100 paise).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
do $$ begin
  create type order_status as enum
    ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('razorpay','cod');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
--  PROFILES (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check helper (SECURITY DEFINER bypasses RLS to avoid policy recursion).
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ============================================================================
--  CATEGORIES
-- ============================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_active on public.categories(is_active);

-- ============================================================================
--  PRODUCTS  (images = array of public Storage URLs)
-- ============================================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  price         integer not null check (price >= 0),       -- paise
  compare_price integer check (compare_price >= 0),         -- optional MRP
  images        text[] not null default '{}',
  sizes         jsonb not null default '[]',                -- [{label,price}] paise; [] = no sizes
  stock         integer not null default 0 check (stock >= 0),
  is_active     boolean not null default true,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
-- Adds the sizes column to databases created before sizes existed (safe to re-run).
alter table public.products add column if not exists sizes jsonb not null default '[]';
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured;

-- ============================================================================
--  ADDRESSES
-- ============================================================================
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_addresses_updated on public.addresses;
create trigger trg_addresses_updated before update on public.addresses
  for each row execute function public.set_updated_at();
create index if not exists idx_addresses_user on public.addresses(user_id);

-- ============================================================================
--  ORDERS
-- ============================================================================
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique
                        default ('DD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id             uuid references auth.users(id) on delete set null,  -- null = guest
  status              order_status not null default 'pending',
  payment_method      payment_method not null,
  payment_status      payment_status not null default 'pending',
  customer_name       text not null,
  customer_email      text,
  customer_phone      text not null,
  shipping_address    jsonb not null,                 -- {line1,line2,city,state,pincode}
  subtotal            integer not null check (subtotal >= 0),
  shipping_fee        integer not null default 0 check (shipping_fee >= 0),
  tax_amount          integer not null default 0 check (tax_amount >= 0),
  total               integer not null check (total >= 0),
  razorpay_order_id   text,
  razorpay_payment_id text,
  razorpay_signature  text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_rzp on public.orders(razorpay_order_id);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ============================================================================
--  ORDER ITEMS (price snapshot at purchase time)
-- ============================================================================
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_image text,
  unit_price    integer not null check (unit_price >= 0),
  quantity      integer not null check (quantity > 0),
  line_total    integer not null check (line_total >= 0),
  created_at    timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================================================
--  REVIEWS (admin-curated)
-- ============================================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete set null,
  author_name text not null,
  rating      smallint not null check (rating between 1 and 5),
  body        text not null,
  photo_url   text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_reviews_updated on public.reviews;
create trigger trg_reviews_updated before update on public.reviews
  for each row execute function public.set_updated_at();
create index if not exists idx_reviews_active on public.reviews(is_active);

-- ============================================================================
--  INSTAGRAM POSTS (manual curated embeds)
-- ============================================================================
create table if not exists public.instagram_posts (
  id          uuid primary key default gen_random_uuid(),
  post_url    text not null,
  embed_html  text,
  caption     text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_instagram_updated on public.instagram_posts;
create trigger trg_instagram_updated before update on public.instagram_posts
  for each row execute function public.set_updated_at();
create index if not exists idx_instagram_active on public.instagram_posts(is_active);

-- ============================================================================
--  SITE SETTINGS (single pinned row: shipping + contact)
-- ============================================================================
create table if not exists public.site_settings (
  id                      int primary key default 1 check (id = 1),
  store_name              text not null default 'D''s Designs',
  contact_phone           text not null default '9344773028',
  contact_email           text,
  instagram_url           text default 'https://www.instagram.com/designsofds',
  whatsapp_catalog_url    text default 'https://wa.me/c/919344773028',
  flat_shipping_fee       integer not null default 7000 check (flat_shipping_fee >= 0),
  free_shipping_threshold integer default 99900 check (free_shipping_threshold >= 0),
  cod_enabled             boolean not null default true,
  online_payment_enabled  boolean not null default true,
  announcement_text       text default 'Handmade with love · Free shipping over ₹999 · COD available',
  updated_at              timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.addresses       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.reviews         enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.site_settings   enable row level security;

-- ----- PROFILES -----
drop policy if exists "profiles self read"   on public.profiles;
create policy "profiles self read"   on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles admin all"   on public.profiles;
create policy "profiles admin all"   on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- CATEGORIES -----
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select
  using (is_active or public.is_admin());
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- PRODUCTS -----
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select
  using (is_active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- ADDRESSES -----
drop policy if exists "addresses owner all" on public.addresses;
create policy "addresses owner all" on public.addresses for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ----- ORDERS (insert/update done server-side with the service role) -----
drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders for delete
  using (public.is_admin());

-- ----- ORDER ITEMS -----
drop policy if exists "order_items owner read" on public.order_items;
create policy "order_items owner read" on public.order_items for select
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ----- REVIEWS -----
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select
  using (is_active or public.is_admin());
drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- INSTAGRAM POSTS -----
drop policy if exists "instagram public read" on public.instagram_posts;
create policy "instagram public read" on public.instagram_posts for select
  using (is_active or public.is_admin());
drop policy if exists "instagram admin write" on public.instagram_posts;
create policy "instagram admin write" on public.instagram_posts for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- SITE SETTINGS -----
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);
drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
--  STORAGE — public bucket for product / category / review images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product-images admin insert" on storage.objects;
create policy "product-images admin insert" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images admin update" on storage.objects;
create policy "product-images admin update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images admin delete" on storage.objects;
create policy "product-images admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================================
--  SEED — the nine categories (idempotent on slug)
-- ============================================================================
insert into public.categories (name, slug, description, sort_order) values
  ('Chettinad Set',        'chettinad-set',        'Vibrant traditional Chettinad-style woven sets in bold checks.', 0),
  ('Train Set',            'train-set',            'Neatly nesting graduated baskets that stack like a train.',      1),
  ('Casserole Set',        'casserole-set',        'Roomy woven carriers for casseroles and tiffins.',               2),
  ('Designer Baskets Set', 'designer-baskets-set', 'Our most colourful, statement-making designer weave.',           3),
  ('Pooja Baskets',        'pooja-baskets',        'Elegant baskets for festivals, return gifts and pooja.',         4),
  ('Imported Baskets',     'imported-baskets',     'Premium imported-style weaves with a refined finish.',           5),
  ('Wire Baskets',         'wire-baskets',         'Sturdy little wire-woven baskets for storage and gifting.',      6),
  ('Wire Bags',            'wire-bags',            'Durable handwoven wire bags that hold their shape.',             7),
  ('Picnic Baskets',       'picnic-baskets',       'Bright, roomy picnic baskets for outings and markets.',          8)
on conflict (slug) do nothing;

-- ============================================================================
--  AFTER you sign up your own account in the app, make yourself ADMIN:
--  (replace the email with the one you registered with)
-- ============================================================================
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
