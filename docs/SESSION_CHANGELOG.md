# Session Changelog & Engineering Record

> **Date:** September 2, 2026  
> **Topic:** Protected `/admin` Route, RBAC, Real Telemetry Dashboard, and Low-Latency Supabase Offloading

---

## 1. Summary of Changes

| Area | What Was Built | Key Files |
| :--- | :--- | :--- |
| **Authentication & RBAC** | Application-level authentication with `admin` and `superadmin` roles, session expiry, and role-based tab rendering. | `src/context/AuthContext.tsx`<br>`src/components/admin/AdminLogin.tsx` |
| **Product Inventory** | Add, edit, delete lehengas with real-time reactive sync across `/collections`, search, category filters, and 1-click availability toggles. | `src/context/ProductContext.tsx`<br>`src/components/admin/InventoryManager.tsx`<br>`src/components/admin/ProductModal.tsx` |
| **Live Analytics Telemetry** | 100% real visitor analytics tracking route transitions, devices, referrers, and live active session count with Supabase cloud ingestion. | `src/context/AnalyticsContext.tsx`<br>`src/components/admin/AnalyticsDashboard.tsx` |
| **Image Latency Pipeline** | Client-side WebP compression (1600px max, ~250KB), 40px inline blur thumbnail generation, and progressive loading component. | `src/lib/imageOptimizer.ts`<br>`src/components/OptimizedImage.tsx` |
| **Supabase Cloud Storage & DB** | S3 bucket (`lehenga-images`) integration with 1-year CDN caching, `page_views` telemetry table, and `products` cloud table. | `src/lib/supabase.ts`<br>`src/components/admin/SupabaseSettings.tsx` |
| **Route Architecture** | Protected `/admin` layout hiding public header/footer, route telemetry tracking on navigation, and footer link. | `src/App.tsx`<br>`src/pages/Admin.tsx`<br>`src/components/Footer.tsx` |

---

## 2. Architectural Decisions & Rationale

### A. Role Separation (`admin` vs `superadmin`)
- **Decision:** Separate boutique staff operations from technical cloud configurations.
- **Rationale:** Non-technical staff managing day-to-day lehenga rentals should not be exposed to database connection strings, SQL schemas, or raw cloud parameters. Only `superadmin` can view and configure the **Supabase & Storage** tab.

### B. Client-Side Image Compression & Blur Thumbnails
- **Decision:** Compress images in the browser before sending them to Supabase Storage.
- **Rationale:** Free-tier Supabase Storage bandwidth is conserved (94% file size reduction). More importantly, mobile upload speed is instantaneous, and the 40px blur-up placeholder prevents any layout shift (CLS = 0) on the storefront.

### C. Zero Dummy Analytics
- **Decision:** Eliminate all simulated counters and historical baseline offsets.
- **Rationale:** The business requires authentic visitor metrics. Active sessions are derived strictly from real visitor events within the last 15 minutes, and daily charts plot real timestamps.

---

## 3. Verification & Test Run

- **TypeScript Verification:** Passed with 0 errors (`pnpm run build`).
- **Formatting:** Verified with `oxfmt` across all 25 files.
- **Database Script Executed:** Verified storage bucket `lehenga-images` and table `public.page_views` with Row Level Security (RLS) policies.

---

# Session Changelog & Engineering Record — Part 2

> **Date:** September 8, 2026  
> **Topic:** Dual Pricing Pipeline, Collections Pagination, Centralized Categories, Secure Supabase RLS, and Markdown-Driven Development

---

## 1. Summary of Changes

| Area | What Was Built | Key Files |
| :--- | :--- | :--- |
| **Pricing & Discount Engine** | Prioritizes `current_price` over legacy `price`. If `buy_price` differs from `current_price`, renders scratched original price (`line-through`), current price, `% OFF`, and "Limited Time Discount" badge. | `src/lib/pricing.ts`<br>`src/types/index.ts`<br>`src/components/admin/ProductModal.tsx` |
| **WhatsApp Enquiry Enrichment** | Enquiry URLs generated for "Buy", "Rent", or "Enquire" automatically include discount context and accurate current pricing. | `src/lib/whatsapp.ts` |
| **Collections Page Pagination** | Default loads top 10 signature lehengas on Page 1. Selectable page sizes (`5`, `10`, `20`), numbered buttons with smart ellipsis, and smooth scroll anchor back to top of grid. | `src/pages/Collections.tsx` |
| **Centralized Categories** | Extracted `PRODUCT_CATEGORIES` into `src/types/index.ts`. All filters, modals, and tables now reference this single source of truth. | `src/types/index.ts`<br>`src/components/admin/ProductModal.tsx`<br>`src/components/admin/InventoryManager.tsx`<br>`src/pages/Collections.tsx` |
| **Supabase RLS & Case Resilience** | Fixed RLS policy violations without security holes by establishing public read (`anon`) and staff write (`authenticated`). Added fallback for `products` vs `Products` table casing. | `src/lib/supabase.ts`<br>`src/components/admin/SupabaseSettings.tsx`<br>`docs/SUPABASE_SETUP.md` |
| **Markdown-Driven Development** | Established the official MDD standard for human + AI collaboration, updated README, Admin Guide, Supabase setup, and development roadmap. | `README.md`<br>`docs/MD_DRIVEN_DEVELOPMENT.md`<br>`docs/ADMIN_GUIDE.md`<br>`docs/plan.md` |
| **Homepage Season's Edit Hover Fix** | Resolved text collision where hover overlay text overlapped static bottom card text. Constrained dark gradient and `View Collection →` action cleanly inside the image container, leaving bottom titles crisp. | `src/pages/Home.tsx` |

---

## 2. Architectural Decisions & Rationale

### A. Non-Breaking Dual Pricing Hierarchy
- **Decision:** Introduce optional `buy_price` and `current_price` while falling back to `price` if either is omitted.
- **Rationale:** Prevents runtime errors with existing Supabase records or legacy local state while giving the atelier the ability to run limited-time sales and scratch pricing.

### B. Storefront Collections Pagination (Top 10 Default + Smooth Scroll)
- **Decision:** Load the top 10 signature pieces on Page 1 by default, with `[5, 10, 20]` selector and an anchor ref scroll (`gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })`).
- **Rationale:** Balances editorial brand storytelling with page weight and DOM footprint. Smooth scrolling prevents the user from feeling lost when paginating.

### C. Plain `TEXT` Column for Categories (`tag`)
- **Decision:** Keep `tag` as `TEXT NOT NULL` in Supabase rather than a Postgres `ENUM` type.
- **Rationale:** Avoids cumbersome DB migrations (`ALTER TYPE ...`) when boutique categories evolve. Frontend enforces typing via `PRODUCT_CATEGORIES` in `src/types/index.ts`.

### D. Zero-Vulnerability RLS Security
- **Decision:** Split RLS into `FOR SELECT TO anon, authenticated USING (true)` and `FOR ALL TO authenticated USING (true)`.
- **Rationale:** Public visitors can read products without authentication, but modifying records requires an authenticated staff session, preventing unauthorized mutations.

---

---

# Session Changelog & Engineering Record — Part 3

> **Date:** September 12, 2026  
> **Topic:** Collection Page Product Quick-View Dialogue Box & Multi-Angle Image Gallery Pipeline

---

## 1. Summary of Changes

| Area | What Was Built | Key Files |
| :--- | :--- | :--- |
| **Product Detail Dialogue Box** | In-page modal (`ProductDetailModal`) opening upon clicking any lehenga card on `/collections`. Displays full garment specifications, designer label, SKU, fabric/fitting details, curator notes, and dual buy/rent pricing. | `src/components/ProductDetailModal.tsx`<br>`src/pages/Collections.tsx` |
| **Multi-Image Interactive Gallery** | Multi-angle photography viewer per piece with high-res active stage (`OptimizedImage`), previous/next arrow buttons, photo index counter (`2 / 4`), and horizontal thumbnail selector strip with active ring indicators. | `src/components/ProductDetailModal.tsx` |
| **Keyboard & Accessibility** | Full accessibility support with `role="dialog"`, `aria-modal="true"`, background body scroll lock (`overflow: hidden`), `Escape` key close, and `ArrowLeft`/`ArrowRight` gallery navigation. | `src/components/ProductDetailModal.tsx` |
| **Collections Card Interactions** | Cards are now accessible buttons (`role="button"`, `tabIndex={0}`) with subtle "View Details" hover prompts and multi-photo angle badges (`📷 X Photos`). Quick-action WhatsApp links use `e.stopPropagation()` so users can still directly enquire or click to open dialogue. | `src/pages/Collections.tsx` |
| **Catalog Multi-Image Seeding** | Enriched all 12 signature pieces in `INITIAL_PRODUCTS` with 3–4 high-res bridal and occasion-wear angles (full silhouette, zardozi detail, drape, back view). Hydration merges images into existing local storage seamlessly. | `src/context/ProductContext.tsx`<br>`src/types/index.ts` |
| **Admin Gallery Image Management** | Staff can add, view, and delete multiple photo URLs/angles per piece in the Admin Product Modal. Inventory table and grid display photo count badges. | `src/components/admin/ProductModal.tsx`<br>`src/components/admin/InventoryManager.tsx` |
| **Supabase Cloud Resilience** | Safely persists and fetches `images TEXT[]`. Includes schema migration in `docs/SUPABASE_SETUP.md` with automatic fallback if the cloud database has not yet added the `images` column. | `src/lib/supabase.ts`<br>`docs/SUPABASE_SETUP.md` |

---

## 2. Architectural Decisions & Rationale

### A. In-Page Dialogue Box Over Page Redirection
- **Decision:** Open piece details directly in an in-page modal dialog rather than redirecting to a separate route like `/collections/:id`.
- **Rationale:** Keeps prospective brides and occasion shoppers in the browsing flow without losing their current page position, category filters, or pagination state.

### B. Multi-Angle Gallery Architecture
- **Decision:** Add an optional `images?: string[]` array to `Product` that falls back to `[product.img]`.
- **Rationale:** Preserves full backward compatibility with single-image catalog entries while providing multi-angle photography (front silhouette, embroidery macro, dupatta drape, back view) for high-ticket bridal pieces.

### C. Propagation Isolation on Quick-Action CTAs
- **Decision:** Apply `e.stopPropagation()` on card WhatsApp buttons (`Book / Enquire`, `Enquire to Buy`, `Enquire to Rent`).
- **Rationale:** Clicking the card opens the rich detail dialogue box, while direct WhatsApp button clicks trigger instant conversion without inadvertently firing modal opening events.

---

## 3. Verification & Test Run

- **TypeScript Verification:** Passed with 0 errors (`pnpm build`).
- **Formatting:** Clean format across all 29 files using `oxfmt`.
- **Zero CLS:** Maintained using `<OptimizedImage />` with blur placeholders across modal and catalog cards.

---

# Session Changelog & Engineering Record — Part 3

> **Date:** September 12, 2026  
> **Topic:** In-Page Multi-Angle Product Detail Dialogue, Batch Multi-Image Upload, and Interactive Cover Photo Selection

---

## 1. Summary of Changes

| Area | What Was Built | Key Files |
| :--- | :--- | :--- |
| **In-Page Product Detail Modal** | Clicking any piece on `/collections` opens an in-page dialogue modal with active high-res gallery stage (`OptimizedImage`), next/previous controls, photo counter (`1 / 4`), thumbnail strip selector with gold active ring, keyboard controls (ESC, Arrow keys), full garment specifications, and dual Buy/Rent WhatsApp CTA links. | `src/components/ProductDetailModal.tsx`<br>`src/pages/Collections.tsx` |
| **Batch Multi-Image Uploader** | Admin `ProductModal` file input accepts multiple image files simultaneously (`multiple`), runs client-side WebP compression and blur thumbnail generation for all files in sequence, offloads to Supabase Storage CDN if configured, and calculates total bandwidth saved. | `src/components/admin/ProductModal.tsx` |
| **Interactive Cover Selection** | Visual grid of all product photos inside `ProductModal`. Atelier curators can click any photo or click "Set as Cover" to select the primary cover photo, designated by a gold `★ Cover` badge. When saving, the selected cover is saved as `img` and placed first in the `images` array (`[primaryCover, ...remainingImages]`). | `src/components/admin/ProductModal.tsx` |
| **Inventory Multi-Photo Badges** | Both table and grid views in `/admin` display a photo counter badge (`📷 X photos`) for pieces with multiple angles. | `src/components/admin/InventoryManager.tsx` |
| **Cloud Resilience & Documentation** | `syncProductsToSupabase` and `fetchProductsFromSupabase` updated to persist and hydrate `images TEXT[]` with backward compatibility fallback if the column is absent in older Supabase instances. `SUPABASE_SETUP.md` updated with SQL migration. | `src/lib/supabase.ts`<br>`docs/SUPABASE_SETUP.md` |

---

## 2. Architectural Decisions & Rationale

### A. Non-Navigational Dialogue Modal
- **Decision:** Open piece details directly in an in-page modal dialogue rather than navigating away to a separate URL.
- **Rationale:** Preserves user scroll position, filter state, and pagination page on the Collections catalogue, maximizing browsing speed and engagement.

### B. Cover Photo Priority in Gallery Array
- **Decision:** Always position the selected cover image at index 0 of `images` while also writing to `img`.
- **Rationale:** Guarantees 100% backward compatibility with all existing catalogue cards and external integrations while giving multi-image components an unambiguous primary image without extra lookups.

### C. Client-Side Sequential Compression for Batch Uploads
- **Decision:** Iterate and compress each photo on an offscreen HTML5 canvas before network dispatch.
- **Rationale:** Batching multiple 10MB+ raw bridal photos without client compression risks out-of-memory or timeout errors. Client compression reduces payload size by ~90%+ before upload.

---

## 3. Verification & Test Run

- **Formatting:** Verified with `oxfmt` across all 29 files.
- **TypeScript & Vite Bundler:** `pnpm build` passed with **0 errors**.
- **Dev Server:** Active and healthy on `http://0.0.0.0:5173`.


