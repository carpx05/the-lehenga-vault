# The Lehenga Vault — Admin & Staff Portal Guide

> **Markdown-Driven Development Specification**  
> **Route:** `/admin`  
> **Target Users:** Boutique Staff (`admin`) & Technical Administrators (`superadmin`)

---

## 1. User Roles & Permission Matrix

The application implements client-enforced role-based access control (RBAC):

```
                       ┌───────────────────────┐
                       │      /admin Login     │
                       └───────────┬───────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
      ┌─────────────────────────┐       ┌─────────────────────────┐
      │      Role: 'admin'      │       │    Role: 'superadmin'   │
      │    (Staff & Managers)   │       │   (Owner / Developer)   │
      └───────────┬─────────────┘       └───────────┬─────────────┘
                  │                                 │
      ┌────────────┴───────────┐        ┌────────────┴───────────┐
      │ • Analytics & Traffic  │        │ • Analytics & Traffic  │
      │ • Appointments & Leads │        │ • Appointments & Leads │
      │ • Vault Inventory      │        │ • Vault Inventory      │
      │ • Change My Passcode   │        │ • Supabase & Storage   │
      │ (Technical tab HIDDEN) │        │ • Change Master Key    │
      └────────────────────────┘        └────────────────────────┘
```

### Credentials Reference (Supabase Auth)

| Email | Role | Capabilities |
| :--- | :--- | :--- |
| **`thelehengavault@gmail.com`** | `admin` (Staff) | View traffic metrics, view/manage appointments & client leads, add/edit/delete lehengas, toggle availability, change own password. |
| **`ayush.b302@gmail.com`** | `superadmin` (Owner) | All admin capabilities + Supabase credentials manager, database syncing, latency diagnostics, SQL runner. |

---

## 2. Core Functional Modules

### 📅 A. Styling Session Appointments & Leads CRM
Located in the **"Appointments & Leads"** tab (`AppointmentsManager.tsx`):

- **Real-Time Booking Ingestion**: Automatically captures every styling session request submitted through the storefront `/contact` form into local & cloud persistence (`lehenga_vault_appointments_v1`). Zero customer leads are lost even during network delays.
- **Client Follow-Up Actions (1-Click)**:
  - **WhatsApp Client**: Auto-opens a preformatted WhatsApp greeting addressed directly to the client's phone number.
  - **Call Client**: Direct telephone link (`tel:`) for immediate phone follow-ups.
- **Booking Status Workflow**:
  - `New` (Fresh request)
  - `Contacted` (Stylist reached out)
  - `Confirmed` (Trial slot booked at Thane atelier)
  - `Completed` (Consultation finished)
- **Email Notification Service Configuration**:
  - Connect **Web3Forms** (free 10-second key) to receive booking notifications directly at `thelehengavault@gmail.com` with client `Reply-To`.
  - Connect **EmailJS** (free tier) for dual-dispatch: sends lead notification to `thelehengavault@gmail.com` AND delivers an automated trial confirmation copy to the client's inbox (`ayush.b302@gmail.com`).
  - **Send Test Email**: Live verification button right inside the dashboard to confirm delivery instantly.

---

### 👗 B. Vault Inventory Management
Located in the **"Vault Inventory"** tab (`InventoryManager.tsx`):

- **Search & Filtering**: Search in real-time across piece titles, designers, tags (`Bridal`, `Indo-Western`, `Festive`, `Reception`), and SKU codes.
- **Availability Toggle (1-Click)**: Instantly switch between `Available` and `Currently Rented`. Changes update across the storefront in real time.
- **Dual Pricing & Discount Engine**:
  - Enter **Original Buy Price** (e.g. `₹85,000`) and **Current Selling Price** (e.g. `₹68,000`).
  - Real-time modal preview calculates discount percentage (e.g. `20% OFF`).
  - Storefront automatically renders the scratched buy price, current price, and "Limited Time Discount" badge.
  - WhatsApp enquiry messages automatically populate discount info.
- **Category / Tag Assignment**:
  - Select from centralized categories (`PRODUCT_CATEGORIES`) or input custom tags.
- **Add / Edit Lehenga Modal**:
  - Automatically runs client-side image compression (WebP).
  - Automatically generates an ultra-low-latency 40px blur thumbnail.
  - Uploads directly to the Supabase `lehenga-images` bucket.
  - Supports Purchase Price and Rental Price.
- **Edit & Delete**: Safe editing and confirmation modal for product deletion.
- **Storefront Collections Pagination**:
  - Storefront (`/collections`) displays the top 10 items by default on Page 1.
  - Customers can toggle between 5, 10, or 20 pieces per page with smooth scrolling.
- **Restore Defaults**: Reset to signature seed pieces if required.

---

### 📊 C. Real-Time Visitor Analytics Dashboard
Located in the **"Analytics & Traffic"** tab (`AnalyticsDashboard.tsx`):

- **Zero Dummy Data**: Displays 100% real visitor events captured as users browse.
- **Metrics Tracked**:
  - **Total Views**: Actual route transitions.
  - **Unique Visitors**: Distinct `sessionStorage` IDs.
  - **Active Live Visitors**: Real-time count of visitors with events within the last 15 minutes.
  - **Weekly Velocity Bar Chart**: Real daily view counts over the past 7 days.
  - **Device Breakdown**: Mobile vs. Desktop vs. Tablet percentage.
  - **Acquisition / Referrers**: Instagram, Google Search, WhatsApp, Direct, Pinterest.
  - **Live Activity Feed**: Stream of latest page visits with relative timestamps ("2m ago").
- **Cloud Sync**: Pulls shared global telemetry from Supabase `public.page_views`.
- **Export**: 1-click JSON export for offline reporting.

---

### ☁️ D. Supabase & Storage Settings (SuperAdmin Only)
Located in the **"Supabase & Storage"** tab (`SupabaseSettings.tsx`):

- **Connection Tester**: Pings the Supabase API and calculates exact round-trip latency in milliseconds.
- **Database Catalog Sync**: One-click mirror of local catalog products to the cloud `public.products` table.
- **SQL Schema Generator**: One-click copy for table creation and RLS setup.

---

## 3. Session Security & Persistence

- **Session Expiry**: Admin sessions expire automatically after 24 hours of inactivity.
- **Credential Storage**: Saved securely in `localStorage` under `lehenga_admin_accounts_v2` allowing in-app passcode rotation.
- **Sign Out**: Instant token clearance via the top-bar logout button.
