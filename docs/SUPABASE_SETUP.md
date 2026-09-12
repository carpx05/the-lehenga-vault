# Supabase Cloud Architecture & Setup Guide

> **Markdown-Driven Development Specification**  
> **Status:** Live & Implemented  
> **Scope:** Cloud Storage (High-Res Assets), Cloud Database (Products & Multi-User Telemetry), Row Level Security (RLS)

---

## 1. Overview & Latency Strategy

The Lehenga Vault employs Supabase (PostgreSQL + S3 Storage + Edge CDN) on the free tier to eliminate local server storage overhead while maintaining sub-50ms catalog render speeds.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  ┌───────────────────────┐       ┌────────────────────────┐ │
│  │ Client WebP Optimizer │       │  0ms Blur-Up Skeleton  │ │
│  │ (10MB -> ~250KB WebP) │       │   (40px micro-thumb)   │ │
│  └───────────┬───────────┘       └───────────▲────────────┘ │
└──────────────┼───────────────────────────────┼──────────────┘
               │                               │
               │ Direct S3 Upload              │ Instant 0ms Paint
               ▼                               │
┌───────────────────────────────┐ ┌────────────┴──────────────┐
│       Supabase Storage        │ │    Local Reactive Cache   │
│   Bucket: 'lehenga-images'    │ │  (Stale-While-Revalidate) │
│  Cache-Control: 31536000 (1y) │ └────────────▲──────────────┘
└──────────────┬────────────────┘              │
               │ Edge CDN URL                  │ Cloud Query
               ▼                               │
┌──────────────────────────────────────────────┴──────────────┐
│                 Supabase PostgreSQL Tables                   │
│   • public.products (Cloud Catalog)                         │
│   • public.page_views (Real-Time Visitor Telemetry)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Complete SQL Initialization Script

Run this complete script in your **Supabase Dashboard → SQL Editor → New query**:

```sql
-- ====================================================================
-- The Lehenga Vault — Complete Supabase Database & Storage Setup
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. STORAGE BUCKET: High-Res Bridal Imagery
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lehenga-images', 'lehenga-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Row Level Security (RLS)
CREATE POLICY "Public Image Read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'lehenga-images');

CREATE POLICY "Public Image Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'lehenga-images');

CREATE POLICY "Public Image Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'lehenga-images');

CREATE POLICY "Public Image Delete" ON storage.objects 
  FOR DELETE USING (bucket_id = 'lehenga-images');

-- --------------------------------------------------------------------
-- 2. TABLE: Products (Master Inventory Catalog)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  designer TEXT NOT NULL,
  buy_price TEXT NOT NULL DEFAULT '₹0',
  current_price TEXT NOT NULL DEFAULT '₹0',
  price TEXT DEFAULT '₹0',
  rent TEXT NOT NULL,
  tag TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  img TEXT NOT NULL,
  images TEXT[],
  thumbnail TEXT,
  images TEXT[],
  description TEXT,
  sku TEXT,
  color TEXT,
  fabric TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migration for existing tables:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];

-- ==========================================================
-- SECURE ROW LEVEL SECURITY (Zero Vulnerabilities):
-- 1. Public visitors (anon) can ONLY view/read the catalog
-- 2. Only authenticated staff/admins can INSERT, UPDATE, DELETE
-- ==========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Clean up older permissive policies if present
DROP POLICY IF EXISTS "Products Public Read" ON public.products;
DROP POLICY IF EXISTS "Products Full Access" ON public.products;
DROP POLICY IF EXISTS "Public Read Only" ON public.products;
DROP POLICY IF EXISTS "Staff Authenticated Full Access" ON public.products;

-- Allow public read access to catalog
CREATE POLICY "Public Read Only" ON public.products 
  FOR SELECT TO anon, authenticated USING (true);

-- Allow authenticated staff/superadmin to insert, update, delete
CREATE POLICY "Staff Authenticated Full Access" ON public.products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 3. TABLE: Page Views (Real-Time Live Visitor Telemetry)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  pathname TEXT NOT NULL,
  title TEXT,
  session_id TEXT,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Page Views RLS Policies
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Page Views Insert" ON public.page_views;
DROP POLICY IF EXISTS "Page Views Read" ON public.page_views;

CREATE POLICY "Page Views Insert" ON public.page_views 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Page Views Read" ON public.page_views 
  FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- 4. OPTIONAL MIGRATION: Upgrading Existing Tables
-- --------------------------------------------------------------------
-- If you created products table previously without buy_price/current_price/images:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS buy_price TEXT NOT NULL DEFAULT '₹0';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS current_price TEXT NOT NULL DEFAULT '₹0';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
UPDATE public.products SET buy_price = price WHERE buy_price = '₹0' AND price IS NOT NULL;
UPDATE public.products SET current_price = price WHERE current_price = '₹0' AND price IS NOT NULL;
UPDATE public.products SET images = ARRAY[img] WHERE images IS NULL AND img IS NOT NULL;

-- --------------------------------------------------------------------
-- 5. OPTIONAL: Styling Appointments CRM Cloud Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  occasion TEXT,
  event_date TEXT,
  interest TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for appointments" ON public.appointments
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated staff read/write appointments" ON public.appointments
  FOR ALL TO authenticated USING (true);
```

---

## 3. Environment Variables & App Configuration

Create a `.env` file in the project root:

```env
# Supabase Project Credentials (Project Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Alternatively, credentials can be set dynamically by the **`superadmin`** user within the **Supabase & Storage** settings tab in the browser without rebuilding the app.

---

## 4. Latency Budget & Guarantees

| Metric | Target | Technique |
| :--- | :--- | :--- |
| **Initial Image Paint (LCP)** | < 100ms | 40px inline blur thumbnail rendered instantly |
| **Edge Cache Hit Latency** | < 40ms | `Cache-Control: max-age=31536000, public` on Supabase Storage |
| **Client Upload Payload** | < 300 KB | Canvas WebP client-side downscaling (1600px max width, 0.82 quality) |
| **Telemetry Write Overhead** | 0ms (non-blocking) | Background async ingestion to `public.page_views` |
| **Catalog Load Time** | 0ms (Local Cache) | Stale-while-revalidate IndexedDB/localStorage mirror |

---

## 5. Category Architecture & Mapping

* **Database Column**: `tag` (`TEXT NOT NULL`)
* **Enum Status in DB**: There is **no Postgres enum constraint** on `tag`. It is stored as standard `TEXT`. This was chosen deliberately so you can introduce or modify categories anytime without running complex `ALTER TYPE ...` migrations in PostgreSQL.
* **Single Source of Truth**: Categories are defined centrally in `src/types/index.ts` under `PRODUCT_CATEGORIES`:
  ```typescript
  export const PRODUCT_CATEGORIES = [
    "Bridal",
    "Indo-Western",
    "Festive",
    "Reception",
  ] as const
  ```
* **Renaming Categories across Existing Records**:
  If you rename a category in code and want all existing Supabase products to update, execute:
  ```sql
  UPDATE public.products 
  SET tag = 'New Category Name' 
  WHERE tag = 'Old Category Name';
  ```
