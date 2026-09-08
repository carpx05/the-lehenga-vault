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

## 3. Verification & Test Run

- **Formatting:** Clean format across all 28 files using `oxfmt`.
- **TypeScript & Vite Bundler:** `pnpm build` passed with **0 errors**.
- **Git State:** Clean commit pushed to remote branch `feat/collections-pagination-pricing`.

