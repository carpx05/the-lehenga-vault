# The Lehenga Vault (TLV)

> **High-End Luxury Bridal & Indo-Western Couture Rental & Retail Atelier**  
> Built with React 19, Vite 8, Tailwind CSS v4, and Supabase Cloud.

---

## 📖 Executive Summary

**The Lehenga Vault** is a high-conversion digital storefront and boutique management platform for premium bridal and Indo-Western wear. The atelier operates two parallel revenue streams on a unified luxury catalog:

1. **Vault Rental**: Curated designer lehengas available for multi-day rental.
2. **Atelier Purchase**: Direct retail sales with dynamic limited-time discounts.

Instead of generic e-commerce carts, high-ticket couture purchases and bookings convert directly through **custom WhatsApp enquiry deep links** pre-filled with garment details, rental/purchase intent, pricing, and sizing.

---

## 🛠️ Technology Stack

| Domain | Technology | Details |
| :--- | :--- | :--- |
| **Runtime & Core** | **React 19** + **TypeScript 5.7** | Modern functional components, hooks, strict typing |
| **Build & Bundler** | **Vite 8** | Sub-second HMR, optimized production build |
| **Styling** | **Tailwind CSS v4** | `@tailwindcss/vite` plugin, customized luxury earth-tone palette |
| **Routing** | **React Router v7** | Client-side routing with deep link support |
| **Icons & Visuals** | **Lucide React** | Clean, minimalist icon set |
| **Animations** | **GSAP** (GreenSock) | Scroll-triggered luxury reveal interactions |
| **Cloud Database** | **Supabase (PostgreSQL)** | Persistent cloud catalog & multi-user telemetry |
| **Storage & CDN** | **Supabase Storage (S3)** | High-resolution image bucket (`lehenga-images`) with 1-year CDN cache |
| **Optimization** | **Canvas API & WebP** | In-browser image compression (10MB → ~250KB) + 40px blur skeletons |

---

## ✨ Key Architectural Features

### 1. 👗 Catalog & Responsive Pagination (`/collections`)
- **Default Top 10 Display**: System default displays the top 10 signature pieces on Page 1.
- **Pieces Per Page Selector**: Instant switching between `5`, `10` (default), or `20` pieces per page.
- **Smart Page Navigation**: Numbered controls with smart ellipsis handling, previous/next triggers, and live counts (`Showing 1–10 of 12 pieces`).
- **Smooth Scroll-to-Top**: Viewport automatically glides back to the top of the collection grid on page or filter change (`scroll-mt-28` factoring in the luxury fixed header).
- **Centralized Category Mapping**: Powered by a single source of truth (`PRODUCT_CATEGORIES` in [`src/types/index.ts`](src/types/index.ts)).

### 2. 💎 Dual Pricing & Discount Engine (`src/lib/pricing.ts`)
- **Dual Price Support**: Supports both original `buy_price` and active `current_price`.
- **Automatic Discount Detection**: When `buy_price` differs from `current_price`, the interface renders:
  - Scratched original price (`line-through`)
  - Prominent current selling price
  - Percentage discount indicator (e.g. `20% OFF`)
  - Luxury "Limited Time Discount" badge
- **Fallback Compatibility**: Gracefully falls back to legacy single `price` field if newer fields are not provided.

### 3. 💬 Custom WhatsApp Enquiry Funnel (`src/lib/whatsapp.ts`)
- **Intent-Driven Links**: Generates bespoke WhatsApp URLs based on whether the customer chooses "Enquire to Buy", "Enquire to Rent", or "Book / Enquire".
- **Structured Message Format**: Pre-fills SKU, piece title, designer label, current pricing, and customer intent directly into the chat prompt.

### 4. 🔒 Protected Staff & Owner Admin Portal (`/admin`)
- **Role-Based Access Control (RBAC)**:
  - **`admin` (Staff)**: Inventory management (add, edit, delete, toggle availability) and real-time visitor analytics.
  - **`superadmin` (Owner / Tech)**: All staff tools plus Supabase credentials, storage buckets, RLS security tools, and SQL runners.
- **Zero-Dummy Analytics Dashboard**: 100% authentic visitor metrics capturing route transitions, unique sessions, live 15-minute active visitors, device breakdowns, and referrers.
- **Client-Side Image Optimization**: Compresses raw photos in the browser before upload, generating an instant 0ms blur thumbnail placeholder to guarantee CLS = 0.

### 5. ☁️ Supabase Cloud & Zero-Vulnerability Security
- **Role-Level Security (RLS)**:
  - Public visitors (`anon`): Read-only access to published products (`SELECT`).
  - Authenticated staff (`authenticated`): Full write access (`INSERT`, `UPDATE`, `DELETE`).
- **Fault-Tolerant Table Resolution**: Automatic fallback between `products` and capitalized `Products` tables with descriptive diagnostics.

---

## 📁 Repository Structure

```
the-lehenga-vault/
├── .mise.toml                  # Toolchain configuration (Node & pnpm)
├── AGENTS.md                   # Rules and guidelines for AI programming agents
├── CLAUDE.md                   # Pointer to AGENTS.md for Claude agents
├── README.md                   # Master project documentation
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite 8 config with React & Tailwind v4
│
├── docs/                       # Markdown-Driven Development (MDD) specifications
│   ├── ADMIN_GUIDE.md          # Guide for staff and owner portal usage
│   ├── MD_DRIVEN_DEVELOPMENT.md# Guide to Markdown-Driven Development workflow
│   ├── SESSION_CHANGELOG.md    # Historical changelog of features and refactors
│   ├── SUPABASE_SETUP.md       # Up-to-date SQL schema & RLS policies
│   └── plan.md                 # Project roadmap and phase checklist
│
├── public/                     # Static assets (robots.txt, favicon, etc.)
│
└── src/
    ├── App.tsx                 # App entry point, route definitions, layout wrapper
    ├── main.tsx                # Mounts React 19 to #root with global CSS
    ├── index.css               # Tailwind CSS v4 import and custom luxury styles
    │
    ├── components/             # Reusable visual components
    │   ├── Footer.tsx          # Atelier footer with navigation and admin link
    │   ├── Navbar.tsx          # Fixed luxury header with navigation and mobile menu
    │   ├── OptimizedImage.tsx  # Progressive image component with blur-up skeleton
    │   └── admin/              # Admin-specific UI modules
    │       ├── AdminLogin.tsx          # Passcode login modal
    │       ├── AnalyticsDashboard.tsx  # Real-time traffic and visitor metrics
    │       ├── InventoryManager.tsx    # Inventory table, search, availability toggle
    │       ├── ProductModal.tsx        # Add/edit product modal with live discount preview
    │       ├── SecuritySettings.tsx    # Passcode rotation module
    │       └── SupabaseSettings.tsx    # Cloud sync, latency diagnostics, SQL snippet
    │
    ├── context/                # Global state management
    │   ├── AnalyticsContext.tsx# Real visitor tracking & telemetry ingestion
    │   ├── AuthContext.tsx     # Session management and RBAC rules
    │   └── ProductContext.tsx  # Inventory state, local cache, Supabase cloud sync
    │
    ├── lib/                    # Utilities and business logic
    │   ├── gsap.ts             # GSAP animation triggers and matchMedia utilities
    │   ├── imageOptimizer.ts   # Browser-side WebP compression & blur generation
    │   ├── pricing.ts          # Price parsing, discount calculations, currency formatting
    │   ├── supabase.ts         # Supabase client, error handlers, and table sync
    │   └── whatsapp.ts         # WhatsApp deep link query builders
    │
    ├── pages/                  # Top-level view routes
    │   ├── About.tsx           # Atelier story, craftsmanship, designer pedigree
    │   ├── Admin.tsx           # Protected portal view
    │   ├── Collections.tsx     # Filterable, paginated lehenga catalog
    │   ├── Contact.tsx         # Consultation booking & atelier location info
    │   ├── Home.tsx            # Hero showcase, signature styles, testimonials
    │   └── RentBuy.tsx         # Transparent explanation of the rental vs purchase model
    │
    └── types/
        └── index.ts            # Central TypeScript interfaces & PRODUCT_CATEGORIES
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or later
- **pnpm**: v9.x or later

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/carpx05/the-lehenga-vault.git
cd the-lehenga-vault

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```
The application runs by default at `http://localhost:8443` (or the configured `$PORT`).

### Build & Format
```bash
# Type check and production build
pnpm build

# Format codebase
pnpm format
```

---

## 🗄️ Database & Cloud Setup

The application works out of the box with an initial catalog stored in memory and `localStorage`. To connect Supabase:

1. Create a free project at [supabase.com](https://supabase.com).
2. Follow the instructions in [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) to initialize:
   - Storage bucket: `lehenga-images` (Public).
   - Table: `public.products` (with `buy_price`, `current_price`, and RLS policies).
   - Table: `public.page_views` (for cross-user visitor analytics).
3. Log in to the `/admin` portal as `ayush.b302@gmail.com` (`superadmin`), open the **Supabase & Storage** tab, and enter your Supabase Project URL and Public Anon Key.

---

## 📝 Markdown-Driven Development (MDD)

This project follows **Markdown-Driven Development** (MDD), where markdown specifications serve as the single source of truth for both human engineers and AI coding agents.

* Read [`docs/MD_DRIVEN_DEVELOPMENT.md`](docs/MD_DRIVEN_DEVELOPMENT.md) for full details on how to propose, implement, and document new features using the MDD framework.
* Consult [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) for staff training and portal workflows.
* Consult [`docs/SESSION_CHANGELOG.md`](docs/SESSION_CHANGELOG.md) for engineering history.