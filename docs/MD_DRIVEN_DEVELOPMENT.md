# Markdown-Driven Development (MDD) Guide

> **The Lehenga Vault Engineering Standard**  
> How humans and AI agents collaborate using Markdown as the single source of truth.

---

## 1. What is Markdown-Driven Development (MDD)?

**Markdown-Driven Development (MDD)** is an engineering methodology where human product owners, developers, and autonomous AI agents collaborate through **living markdown specifications**. 

In MDD:
* **Specs are first-class citizens**: Features, schemas, and UX rules are designed in Markdown before being implemented in code.
* **Documentation never goes stale**: Every code refactor, database migration, or business rule update is committed alongside an update to its corresponding markdown document.
* **Context density for AI Agents**: AI assistants (such as Antigravity, Claude, or Cursor) achieve significantly higher accuracy, zero hallucination, and flawless architectural continuity when grounded in unambiguous markdown documentation.

```
       ┌────────────────────────────────────────────────────────┐
       │             Markdown Specification (MDD)               │
       │   docs/plan.md · docs/SUPABASE_SETUP.md · AGENTS.md    │
       └───────────────────────────┬────────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
       ┌───────────────────────┐       ┌───────────────────────┐
       │   AI Coding Agent     │       │    Human Developer    │
       │  (Reads Specs First)  │       │ (Sets Product Intent) │
       └───────────┬───────────┘       └───────────▲───────────┘
                   │                               │
                   ▼                               │
       ┌───────────────────────────────────────────┴───────────┐
       │                   Clean Codebase                      │
       │     React 19 + TypeScript + Vite 8 + Tailwind CSS     │
       └───────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                Automated Verification                 │
       │        pnpm format (oxfmt) + pnpm build (vite)         │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                Changelog & Decision Log                │
       │   docs/SESSION_CHANGELOG.md · docs/plan.md Decision   │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Documentation Architecture & Hierarchy

The project organizes its documentation into a strict hierarchical taxonomy:

```
the-lehenga-vault/
├── AGENTS.md                   # Tier 0: Ground rules for AI coding assistants
├── CLAUDE.md                   # Tier 0: Direct pointer to AGENTS.md
├── README.md                   # Tier 1: Project overview, setup, and technology stack
│
└── docs/
    ├── MD_DRIVEN_DEVELOPMENT.md# (This file) The MDD standard and execution rules
    ├── ADMIN_GUIDE.md          # Tier 2: Product owner & staff operations manual
    ├── SUPABASE_SETUP.md       # Tier 2: Cloud database schema, storage & RLS policies
    ├── plan.md                 # Tier 2: Roadmap, phased checklists, and decision logs
    └── SESSION_CHANGELOG.md    # Tier 2: Chronological engineering record of releases
```

### Document Roles & Responsibilities

| Document | Primary Audience | When to Read | When to Update |
| :--- | :--- | :--- | :--- |
| **`AGENTS.md`** | AI Agents & Developers | Before writing any code in the repository. | When changing build tools, linters, or core coding conventions. |
| **`README.md`** | Everyone | Onboarding to understand high-level functionality. | When adding new user-facing features or changing project dependencies. |
| **`docs/plan.md`** | Project Owner & Leads | Before starting any milestone or new phase. | Check off items as completed; add architectural decisions to the Decision Log. |
| **`docs/SUPABASE_SETUP.md`** | Backend & Full-Stack | When setting up Supabase, modifying tables, or adjusting RLS. | Whenever columns, tables, storage buckets, or RLS policies change. |
| **`docs/ADMIN_GUIDE.md`** | Staff & Store Managers | When onboarding staff or troubleshooting the `/admin` portal. | Whenever the Admin UI, inventory features, or role capabilities evolve. |
| **`docs/SESSION_CHANGELOG.md`** | All Engineers | Reviewing previous work and debugging regressions. | At the end of every programming session or feature pull request. |

---

## 3. The 4-Stage MDD Lifecycle

Every feature, refactor, or bugfix must follow the **4-Stage MDD Lifecycle**:

```
[ Stage 1: Specify ] ──> [ Stage 2: Implement ] ──> [ Stage 3: Verify ] ──> [ Stage 4: Document ]
```

### Stage 1: Specify (Intent First)
1. **Identify the document**: Determine if the task modifies an existing spec (e.g. `docs/plan.md`, `docs/SUPABASE_SETUP.md`) or requires a new specification.
2. **Define constraints**:
   - What is the data structure? (Update `src/types/index.ts`).
   - Is it mobile-responsive?
   - How does this impact WhatsApp conversion?
   - Are there security/RLS implications?
3. **Write the checklist**: Outline step-by-step checkboxes in `docs/plan.md` before coding.

### Stage 2: Implement (Clean Execution)
1. Write concise, strongly-typed TypeScript code.
2. Obey rules in `AGENTS.md`:
   - Use double quotes for strings containing apostrophes (`"We're here to help"`).
   - Ensure JSX tags and braces are balanced.
   - Export components as default exports.
   - Maintain single source of truth for categories (`PRODUCT_CATEGORIES` in `src/types/index.ts`).
3. Maintain zero runtime console errors.

### Stage 3: Verify (Automated Checks)
Always run automated formatting and production builds before committing:
```bash
# 1. Run ultra-fast oxfmt linter/formatter
pnpm format

# 2. Run TypeScript check & Vite production bundle
pnpm build
```
A task is **not done** until `pnpm format && pnpm build` exits with code 0.

### Stage 4: Document (Close the Loop)
1. **Tick completed items** in `docs/plan.md`.
2. **Record non-obvious trade-offs** in the Decision Log of `docs/plan.md`.
3. **Append a summary entry** in `docs/SESSION_CHANGELOG.md` with:
   - Date & title
   - Files changed
   - Architectural decisions & rationale
   - Test results & verification status

---

## 4. Patterns & Guidelines for Future Development

### A. Centralized Constants (Never Hardcode Lists)
* **Categories / Tags**: Always use `PRODUCT_CATEGORIES` exported from `src/types/index.ts`. Never hardcode `["Bridal", "Festive", ...]` across individual pages or modals.
* **Colors & Sizing**: Add shared constants in `src/types/index.ts` or a dedicated `src/constants/` directory.

### B. Pricing Calculations
* Always route pricing logic through `src/lib/pricing.ts` (`getPricingDetails`, `formatCurrency`, `parsePriceNumber`).
* Never calculate discount percentages inline in JSX components.

### C. Supabase RLS & Security
* Never use permissive `FOR ALL USING (true)` policies on writable tables.
* Always enforce the RBAC standard:
  - Public `anon` users: Read-only `FOR SELECT USING (true)`
  - Authenticated staff: `FOR INSERT / UPDATE / DELETE TO authenticated USING (true)`

### D. Zero Layout Shift (CLS = 0)
* All remote images must use `<OptimizedImage />` (`src/components/OptimizedImage.tsx`) with 40px micro-thumbnails.
* Never render bare `<img>` tags for catalog imagery without aspect ratios and blur placeholders.

---

## 5. Checklist for PR / Commit Readiness

Before opening a pull request or pushing a branch:

- [ ] Does `pnpm format` format all files without errors?
- [ ] Does `pnpm build` compile with 0 TypeScript/bundling errors?
- [ ] Have all newly created or modified database columns been documented in `docs/SUPABASE_SETUP.md`?
- [ ] If user-facing admin features were added, is `docs/ADMIN_GUIDE.md` updated?
- [ ] Is an entry added to `docs/SESSION_CHANGELOG.md`?
- [ ] Is the commit message structured with clear bullet points explaining *why* changes were made?
