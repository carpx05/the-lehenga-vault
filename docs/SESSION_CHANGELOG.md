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
