Retail Website — MD-Driven Development Plan
Goal

Build a premium, earthy-neutral retail catalogue website in small, verifiable phases.

Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel + WhatsApp

Principle: Do not build everything at once. Each phase should leave the project runnable and reviewable.

Context: Store is "The Lehenga Vault". It is a bridal, indo-western, etc retail store that does rentals as welll as a sales. keep the tone luxurious.

Phase 0 — Foundation

Goal: Get a clean project running.

Initialize Next.js App Router + TypeScript

Configure Tailwind

Add fonts

Create global color/theme tokens

Set up basic folder structure

Add Git repository

Verify npm run dev and production build

Done when: Empty site runs cleanly and the design system is established.

Phase 1 — Visual Shell

Goal: Establish the brand before building pages.

Navbar

Footer

Typography system

Buttons

Links

Section headings

Container/layout utilities

Product card component

Mobile navigation

Responsive spacing

Design: off-white, beige, light brown, muted gold, deep brown. Editorial serif + clean sans-serif. Minimal shadows and restrained borders.

Done when: A simple style/demo page looks like the intended brand on mobile and desktop.

Phase 2 — Homepage

Goal: Build the first complete public-facing page.

Hero

Featured products

Category/collection section

Brand statement

Editorial image/text section

WhatsApp CTA

Responsive behavior

Use mock product data and placeholder images.

Done when: Homepage feels launch-ready without requiring a backend.

Phase 3 — Catalogue

Goal: Make products browsable.

Shop page

Product grid

Category filtering

Search

Sorting

Product detail page

Related products

Product availability state

SEO metadata

Keep products in a local typed data source for now.

Done when: A user can browse from homepage → catalogue → product page.

Phase 4 — WhatsApp Enquiries

Goal: Enable the actual business workflow without payments.

Product-level WhatsApp CTA

Dynamic WhatsApp message

Basic enquiry form

Mobile-friendly CTAs

Example message:

Hi, I'd like to enquire about [Product Name] (SKU: [SKU]). Is it currently available?

Done when: A customer can enquire about any product in one tap.

Phase 5 — Supabase

Goal: Replace mock data with persistent data.

Create Supabase project

Create products table

Create categories table

Create product_images table if required

Create enquiries table

Add Supabase client

Move product queries behind a data-access layer

Configure RLS

Seed initial catalogue

Do not couple UI components directly to Supabase queries.

Done when: Public catalogue works entirely from Supabase.

Phase 6 — Admin

Goal: Let the shop maintain its catalogue without developer involvement.

Admin login

Protected /admin routes

Dashboard

Product list

Add product

Edit product

Delete product

Toggle availability

Manage categories

View/manage enquiries

Use Supabase Auth + RLS for authorization.

Done when: Shop owner can maintain the catalogue independently.

Phase 7 — Images

Goal: Move the shop's Google Drive images into website-ready storage.

Decide whether Supabase Storage is sufficient

Resize/compress existing images

Upload product images

Connect images to products

Use next/image

Verify mobile performance

Do not build Google Drive synchronization unless the business actually needs ongoing automatic sync.

Done when: Real product imagery is live and loads quickly.

Phase 8 — Secondary Pages

Goal: Complete the brand website.

About

Collections

Contact

FAQ

Store information

Google Maps/location CTA

Done when: All public navigation paths are complete.

Phase 9 — Production

Goal: Deploy with minimal recurring infrastructure cost.

Connect GitHub → Vercel

Configure environment variables

Connect custom domain

Configure production Supabase

Add metadata/Open Graph

Add sitemap

Add robots.txt

Test forms and WhatsApp links

Test admin permissions

Test mobile layouts

Run production build

Basic analytics/Search Console

Target infrastructure cost: ₹0/month initially, excluding domain and any usage that exceeds free tiers.

Development Rules
One phase at a time.
Before starting a phase, read this file and any relevant *.md spec.
Do not implement future phases prematurely.
Keep mock data until the Supabase phase.
Prefer simple solutions over abstractions that are not currently needed.
Every phase must leave the app runnable.
After each phase, update the checklist and document important decisions.
Do not add dependencies unless there is a clear reason.
Mobile-first is mandatory.
No payment system unless explicitly added as a future phase.
Future / Optional

Online payments

Cart

Order tracking

Inventory management

Google Drive automatic sync

Cloudinary if image volume makes Supabase Storage unsuitable

These are deliberately out of scope for the initial launch.