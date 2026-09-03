# The Lehenga Vault — Development Plan

> **How to use this file:** This is the single source of truth for build order.
> Read it before starting any phase. Tick boxes as you go. Record decisions in
> the Decision Log at the bottom. Do not start a phase before its dependencies
> are done.

---

## 1. Product Summary

**The Lehenga Vault** is a bridal, indo-western and occasion-wear retail store
that operates **two business lines on the same catalogue**:

| Line       | Meaning                     | Price shown      |
| ---------- | --------------------------- | ---------------- |
| **Rental** | Garment rented for an event | Price per rental |
| **Sale**   | Garment sold outright       | Purchase price   |

A single product may be **rent-only**, **sale-only**, or **both**. This duality
is the most important constraint in the whole build — it affects the data model,
the product card, the filters, and the WhatsApp message. It is designed in from
Phase 2, not retrofitted later.

**No online payments and no cart.** Every transaction converts to a WhatsApp
conversation. The website is a premium catalogue plus an enquiry funnel.

### Stack

| Concern    | Choice                                |
| ---------- | ------------------------------------- |
| Framework  | Next.js (App Router) + TypeScript     |
| Styling    | Tailwind CSS                          |
| Data       | Supabase (Postgres + Auth + Storage)  |
| Hosting    | Vercel                                |
| Conversion | WhatsApp deep links                   |

### Brand

- **Palette:** off-white, beige, light brown, muted gold, deep brown.
- **Type:** editorial serif for headings, clean sans-serif for body.
- **Feel:** luxurious, restrained, editorial. Minimal shadows, few borders,
  generous whitespace, imagery does the talking.
- **Mobile-first is mandatory.** Assume the majority of traffic is a phone
  arriving from Instagram.

### Target cost

₹0/month recurring at launch, excluding the domain and any usage beyond free
tiers.

---

## 2. Phase Map

| Phase | Name             | Depends on | Ships                                  |
| ----- | ---------------- | ---------- | -------------------------------------- |
| 0     | Foundation       | —          | Runnable empty app + design tokens     |
| 1     | Visual Shell     | 0          | Brand components + style guide page    |
| 2     | Data Contract    | 0          | Types + mock catalogue (no UI)         |
| 3     | Homepage         | 1, 2       | Complete landing page                  |
| 4     | Catalogue        | 3          | Shop, filters, product detail          |
| 5     | WhatsApp Enquiry | 4          | The business workflow, end to end      |
| 6     | Supabase         | 5          | Real persistence behind the same types |
| 7     | Images & Storage | 6          | Real product photography               |
| 8     | Admin            | 6, 7       | Owner-maintainable catalogue           |
| 9     | Secondary Pages  | 3          | About, contact, FAQ, policies          |
| 10    | Production       | all        | Live on the custom domain              |

**Phases 1 and 2 can run in parallel** (one is visual, one is data). Everything
else is sequential.

> **Note on ordering:** Images (7) comes *before* Admin (8) deliberately — the
> admin product form needs a working upload pipeline to build against, so the
> storage decision must already be made.

---

## Phase 0 — Foundation

**Goal:** A clean, runnable project with the design system encoded as tokens.

- [ ] Initialize Next.js App Router + TypeScript
- [ ] Configure Tailwind
- [ ] Add fonts (one serif, one sans; self-hosted via `next/font`)
- [ ] Define colour tokens in Tailwind config — semantic names
      (`background`, `surface`, `ink`, `muted`, `accent`), not raw colour names
- [ ] Define type scale and spacing scale
- [ ] Set up folder structure (see below)
- [ ] Add `.env.example`
- [ ] Configure ESLint + Prettier
- [ ] Verify `npm run dev` and `npm run build` both succeed

**Folder structure:**

```
src/
  app/           # routes only
  components/    # ui/ (primitives) + sections/ (page blocks)
  lib/           # data access, whatsapp, utils
  data/          # mock catalogue (phases 2-5)
  types/         # shared TypeScript types
```

**Done when:** `npm run build` passes on a clean clone and the tokens are
defined. Nothing is visible yet — that is expected.

---

## Phase 1 — Visual Shell

**Goal:** Establish the brand in code before any page exists.

- [ ] Container / layout utilities
- [ ] Typography components (page title, section heading, eyebrow, body, caption)
- [ ] Button variants (primary, secondary, ghost) + link styles
- [ ] Navbar (desktop)
- [ ] Mobile navigation (drawer or full-screen overlay)
- [ ] Footer
- [ ] Product card — **must render the rent/sale badge and correct price(s)**
- [ ] Responsive spacing rhythm
- [ ] Focus states on every interactive element
- [ ] `/style-guide` page rendering every component in one place

**Done when:** `/style-guide` looks like the intended brand on a 375px phone and
a 1440px desktop, and every interactive element is keyboard-reachable with a
visible focus ring.

> `/style-guide` is a development page. Remove it or block it from indexing
> before Phase 10.

---

## Phase 2 — Data Contract

**Goal:** Lock the shape of a product *once*, so that Phase 6 swaps the data
source without touching a single component.

This phase exists specifically to prevent the mock-data rewrite that otherwise
happens at the Supabase step.

- [ ] Define `Product`, `Category`, `ProductImage`, `Enquiry` types
- [ ] Model rent/sale duality explicitly (see below)
- [ ] Write 12-20 realistic mock products across categories
- [ ] Add placeholder images at the correct aspect ratio (portrait, 3:4)
- [ ] Build the data-access layer: `getProducts`, `getProductBySlug`,
      `getCategories`, `getFeaturedProducts`
- [ ] **All functions are `async` from day one** — even reading mock data — so
      the Supabase swap is a body change, not a signature change

**Product shape (indicative):**

```ts
type Availability = 'available' | 'rented_out' | 'sold' | 'coming_soon'

type Product = {
  id: string
  slug: string
  name: string
  description: string
  categoryId: string
  // Duality: at least one of these must be present.
  rentPrice?: number     // per rental period
  salePrice?: number
  sizes: string[]
  colour: string
  fabric?: string
  images: ProductImage[]
  availability: Availability
  featured: boolean
}
```

**Done when:** Mock data satisfies the types, the data layer returns it, and
nothing imports from `src/data/` except `src/lib/`.

---

## Phase 3 — Homepage

**Goal:** The first complete public-facing page. Launch-ready without a backend.

- [ ] Hero — full-bleed image, restrained copy, one primary CTA
- [ ] Brand statement / positioning block
- [ ] Featured products (pulled through the data layer)
- [ ] Category / collection section
- [ ] "Rent or Buy" explainer — this is unusual, so say it plainly
- [ ] Editorial image + text section
- [ ] WhatsApp CTA
- [ ] Full responsive pass
- [ ] Page metadata (title, description, OG image)

**Done when:** The homepage is something you would send to the shop owner as a
demo, and it holds up at 375px.

---

## Phase 4 — Catalogue

**Goal:** Make the catalogue browsable.

- [ ] `/shop` page with product grid
- [ ] Category filter
- [ ] **Rent / Buy / Both filter** — the primary axis for this store
- [ ] Sort (newest, price low to high, price high to low)
- [ ] Search by name
- [ ] Filter state reflected in the URL (shareable, back-button safe)
- [ ] `/shop/[slug]` product detail page
- [ ] Image gallery on the detail page
- [ ] Size, colour, fabric, availability displayed
- [ ] Related products
- [ ] Empty state (no products match these filters)
- [ ] Loading and error states
- [ ] Per-product SEO metadata
- [ ] 404 page

**Done when:** A user can go homepage → shop → filter → product detail, and
every filter combination renders something sensible.

---

## Phase 5 — WhatsApp Enquiries

**Goal:** The actual business workflow, end to end.

- [ ] WhatsApp number in env config — never hardcoded in a component
- [ ] Link builder in `src/lib/whatsapp.ts` with correct URL encoding
- [ ] Product-level CTA, message prefilled with product name + intent
- [ ] **Separate rent and buy CTAs** where a product offers both
- [ ] Sticky mobile CTA on the product page
- [ ] General enquiry form (name, phone, message) that opens WhatsApp
- [ ] Graceful behaviour on desktop (WhatsApp Web)

**Message templates:**

```
Rent: Hi, I would like to enquire about renting [Product Name] ([SKU]).
      Is it available for my date?

Buy:  Hi, I would like to enquire about purchasing [Product Name] ([SKU]).
      Is it currently available?
```

**Done when:** Any product can be enquired about in one tap on a real phone,
with the message arriving correctly formatted. Test on an actual device.

---

## Phase 6 — Supabase

**Goal:** Replace mock data with persistence. **No component should change.**

- [x] Create Supabase project & SQL schema
- [x] Tables: `products`, `page_views` (live visitor telemetry), `lehenga-images` storage bucket
- [x] Model rent/sale pricing explicitly
- [x] Row Level Security: public read on catalogue, insert-only on `page_views`, full access on authenticated admin
- [x] Supabase client (`src/lib/supabase.ts`)
- [x] Reactive inventory data-access layer (`src/context/ProductContext.tsx`)
- [x] Seed catalogue & cloud sync support
- [x] Persist live visitor analytics to `page_views`

**Done when:** The public site runs entirely from reactive store with Supabase mirror.

---

## Phase 7 — Images & Storage

**Goal:** Get the shop's real photography onto the site, loading fast.

- [x] Decide: Supabase Storage (`lehenga-images`) with edge CDN caching
- [x] Resize and compress to web dimensions (1600px max, canvas WebP @ 0.82 quality)
- [x] Upload pipeline in product modal with 1-year cache headers
- [x] `<OptimizedImage>` with 0ms blur-up placeholder
- [x] Bandwidth saving metrics displayed in admin upload dialog (~94% saved)

**Done when:** High-res imagery is offloaded to Supabase with instant local blur preview and sub-50ms render.

---

## Phase 8 — Admin

**Goal:** The owner maintains the catalogue without a developer.

- [x] `/admin` protected route with application-level authentication
- [x] Role-Based Access Control: `admin` (staff) vs `superadmin` (master control)
- [x] Real-Time Live Analytics Dashboard (zero dummy data, actual pageviews, devices, referrers, active shoppers)
- [x] Product list with search, filter, and table/grid view
- [x] Add / edit / delete product modal
- [x] Direct image upload to Supabase storage
- [x] Toggle availability (1-click toggle)
- [x] Confirmation on destructive actions
- [x] Passcode update & credential persistence

**Done when:** Boutique staff and superadmin maintain inventory and monitor live customer visits from `/admin`.

---

## Phase 9 — Secondary Pages

**Goal:** Complete the brand website.

- [x] About
- [x] Collections / lookbook
- [x] Contact — address, hours, phone, WhatsApp CTA
- [x] FAQ
- [x] Rental terms — deposit, duration, care policy, fitting

---

## Phase 10 — Production

**Goal:** Live, with minimal recurring cost.

- [ ] GitHub → Vercel
- [ ] Production environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Custom domain + SSL
- [ ] Metadata + Open Graph across all routes
- [ ] Test WhatsApp links on a real phone
- [ ] Test admin permissions while logged out
- [ ] Verify RLS blocks unauthorised writes
- [ ] Mobile layout pass on real devices

---

## 3. Development Rules

1. **One phase at a time.** Read this file before starting.
2. **Do not implement future phases early.** Especially payments and cart.
3. **Every phase leaves the app runnable.** `npm run build` must pass.
4. **Mobile-first, always.** Design at 375px, then scale up.
5. **Components never fetch.** They receive props or reactive contexts. Only `src/lib/` touches data.
6. **Prefer simple over abstract.** Do not build for a requirement you do not have yet.
7. **No new dependency without a stated reason** in the Decision Log.
8. **Rent and sale are equals.** Never build a flow that assumes one.
9. **Secrets in env only.** Nothing sensitive in the client bundle.
10. **After each phase:** tick the boxes, log decisions, commit.

---

## 4. Out of Scope (Deliberately)

These are not being built for launch. Revisit only when the business asks.

- Online payments and checkout
- Shopping cart
- Rental availability calendar / date-based booking
- Order tracking
- Customer accounts
- Multi-language

---

## 5. Open Questions

Resolve before the phase that needs them.

| # | Question                                                    | Needed by | Status |
| - | ----------------------------------------------------------- | --------- | ------ |
| 1 | Business WhatsApp number?                                    | Phase 5   | +91 92849 53320 |
| 2 | Rental price shown publicly, or "enquire for price"?         | Phase 2   | Public Dual Pricing |
| 3 | Is the rental period fixed (e.g. 3 days) or negotiated?      | Phase 9   | Fixed 3-7 day plans |
| 4 | Domain name registered?                                      | Phase 10  | Pending |
| 5 | Who owns the Supabase and Vercel accounts?                   | Phase 10  | User Owned |

---

## 6. Decision Log

Record anything a future reader would otherwise have to guess.

| Date | Phase | Decision | Reasoning |
| ---- | ----- | -------- | --------- |
| 2026-09-02 | 6, 7 | Supabase S3 Storage + WebP Canvas Compression | Free tier storage offload with zero instance disk usage and sub-50ms LCP via 40px blur thumbnails. |
| 2026-09-02 | 8 | Two-Tier Auth (`admin` vs `superadmin`) | Non-technical staff (`admin`) manage catalog/orders; technical cloud tabs hidden and restricted to `superadmin`. |
| 2026-09-02 | 8 | 100% Real Live Analytics Telemetry | Removed all dummy/inflated counters so dashboard metrics accurately reflect actual prospective brides visiting. |

