# Architecture Research

**Domain:** Pet service marketplace UI modernization — React/Next.js 15 with 142 components
**Researched:** 2026-02-23
**Confidence:** HIGH (based on direct codebase audit + verified patterns from official sources)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Pages (App Router)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ /        │  │ /search  │  │/providers│  │/bookings │        │
│  │ Landing  │  │ Browse   │  │  Detail  │  │  Flow    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
├───────┴──────────────┴────────────┴──────────────┴──────────────┤
│                   Feature Components                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Hero +   │  │ Search   │  │ Provider │  │ Booking  │        │
│  │ Filters  │  │ Layout   │  │  Detail  │  │  Wizard  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
├───────┴──────────────┴────────────┴──────────────┴──────────────┤
│                   Shared UI Components                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ProviderCard│  │ Navigation │  │  Primitives│                 │
│  │ ListingGrid│  │  Layout   │  │  (shadcn)  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
├─────────────────────────────────────────────────────────────────┤
│              Design Tokens (globals.css @theme)                  │
│  colors · spacing · typography · radius · shadows               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component Group | Responsibility | Current State |
|-----------------|----------------|---------------|
| Pages (`app/`) | Route entry points, data fetching, page layout | Functional, 20+ pages |
| Feature components | Assembled UI for a specific page section | Mixed — some duplicated |
| Shared components (`components/*.tsx`) | Reusable across pages | Partially consolidated |
| UI primitives (`components/ui/`) | shadcn/ui base components | Good — do not touch |
| Navigation subsystem | Header, mobile menu, search bar | Split across 2 parallel implementations |
| Layout | Shell with nav + footer + mobile bottom nav | Single, clean |

---

## Current State Audit

### Confirmed Dead / Orphaned Components (0 consumers found)

These root-level components in `src/components/` are exported but never imported anywhere:

| File | Status | Reason |
|------|--------|--------|
| `featured-providers.tsx` | Dead code | Not imported in any page or component |
| `mobile-hero-section.tsx` | Dead code | Replaced by responsive `hero-section.tsx` |
| `nav-main.tsx` | Dead code | Sidebar nav variant — not used in any page |
| `nav-projects.tsx` | Dead code | Sidebar nav variant — not used in any page |
| `nav-secondary.tsx` | Dead code | Sidebar nav variant — not used in any page |
| `navigation-search.tsx` (root) | Dead code | Duplicated by `navigation/navigation-search.tsx` |
| `search-results.tsx` | Dead code | Replaced by `search-layout.tsx` + `listings-grid.tsx` |
| `booking-modal.tsx` | Dead code | Not imported — booking done via booking wizard |
| `map-controls.tsx` | Dead code | Not imported into any map usage |
| `map-view.tsx` | Dead code | Not imported — `mapbox-map.tsx` used instead |
| `mobile-filter-drawer.tsx` | Dead code | Not imported — `filter-modal.tsx` used instead |
| `pet-ads-section.tsx` | Dead code | Not imported anywhere |
| `stripe-payment-form.tsx` | Dead code | Payment handled in checkout flow directly |

**Total confirmed dead: ~13 root-level components.** Safe to delete after confirming via `knip` or manual grep.

### Confirmed Duplicates Requiring Consolidation

| Duplicate Set | Files | Resolution |
|---------------|-------|------------|
| Hero sections | `hero-section.tsx` (contains both desktop+mobile markup) + `mobile-hero-section.tsx` (dead) | Delete `mobile-hero-section.tsx`. Keep `hero-section.tsx` — it already handles responsive. |
| Navigation | `navigation.tsx` (shell) + `navigation/navigation-header.tsx` (renders header) + root `navigation-search.tsx` (dead) | Keep the `navigation/` folder structure. Delete root `navigation-search.tsx`. |
| Service categories | `service-categories.tsx` (root) + `navigation/service-categories.tsx` | Verify which is used by hero vs navigation; likely root one can be removed |
| Chat UI | `ui/chat-button.tsx`, `ui/ai-chat-button.tsx`, `ui/floating-chat-button.tsx`, `ui/chat-dialog.tsx`, `ui/chat-page.tsx`, `ui/ai-chat.tsx`, `ui/chat-demo.tsx`, `ui/ruixen-mono-chat.tsx` | 8 chat components — consolidate to 2: `ChatButton` + `ChatDialog` |
| Provider cards | `provider-card.tsx` (full card with actions) + `listings-grid.tsx` (inline card implementation) | Extract a single `ProviderCard` — `listings-grid.tsx` should use it |

### UI Chat Component Cluster (Critical Bloat)

8 chat-related components in `src/components/ui/` represent the worst duplication. Multiple experiments were preserved in production code:
- `ai-chat-button.tsx`, `ai-chat.tsx` — AI chat variant
- `chat-button.tsx`, `floating-chat-button.tsx` — Two floating button variants
- `chat-dialog.tsx`, `chat-page.tsx`, `chat-demo.tsx` — Three dialog/page variants
- `ruixen-mono-chat.tsx` — Appears to be a named external/third-party component

**Action:** Pick one implementation path. Delete the rest.

---

## Recommended Target Structure

After consolidation, the component directory should resolve to:

```
src/
├── app/                          # Route pages (untouched — working)
├── components/
│   ├── ui/                       # shadcn/ui primitives — never modify
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (38 files, keep all)
│   │
│   ├── layout/                   # Shell components used on every page
│   │   ├── layout.tsx            # Main shell (currently: components/layout.tsx)
│   │   ├── navigation.tsx        # Nav shell (currently: components/navigation.tsx)
│   │   ├── navigation-header.tsx # Header bar (currently: navigation/navigation-header.tsx)
│   │   ├── mobile-menu.tsx       # Mobile nav (currently: navigation/mobile-menu.tsx)
│   │   ├── mobile-bottom-nav.tsx
│   │   ├── footer.tsx
│   │   └── user-menu.tsx
│   │
│   ├── search/                   # Search & browse page components
│   │   ├── search-layout.tsx     # Split map/list layout
│   │   ├── search-filters.tsx    # Filter bar
│   │   ├── filter-modal.tsx      # Mobile filter modal
│   │   ├── hero-filters.tsx      # Landing page search bar
│   │   └── hero-section.tsx      # Landing hero (merged desktop+mobile)
│   │
│   ├── providers/                # Provider listing & detail components
│   │   ├── provider-card.tsx     # Single unified card — used by grid and search
│   │   ├── listings-grid.tsx     # Grid layout using ProviderCard
│   │   ├── provider-slider.tsx   # Horizontal slider
│   │   ├── category-section.tsx  # Category browse section
│   │   └── service-categories.tsx# Category filter pills
│   │
│   ├── provider-detail/          # Provider detail page (keep as-is)
│   │   ├── booking-widget.tsx
│   │   ├── desktop-header.tsx
│   │   ├── image-gallery.tsx
│   │   ├── mobile-layout.tsx
│   │   ├── provider-info.tsx
│   │   └── quick-booking-dialog.tsx
│   │
│   ├── booking/                  # Booking wizard (keep as-is)
│   │   ├── booking-wizard.tsx
│   │   ├── booking-step-1.tsx
│   │   ├── booking-step-2.tsx
│   │   ├── booking-step-3.tsx
│   │   ├── booking-step-4.tsx
│   │   └── types.ts
│   │
│   ├── chat/                     # Consolidated chat (from 8 → 2)
│   │   ├── chat-button.tsx       # Floating trigger button
│   │   └── chat-dialog.tsx       # Chat panel/dialog
│   │
│   ├── pets/                     # Pet management components
│   │   ├── individual-pet-card.tsx
│   │   ├── add-individual-pet-dialog.tsx
│   │   └── edit-individual-pet-dialog.tsx
│   │
│   ├── provider-dashboard/       # Provider tools (out of scope, keep as-is)
│   ├── provider-onboarding/      # Onboarding flow (out of scope, keep as-is)
│   └── admin/                    # Admin tools (out of scope, keep as-is)
```

**Net result:** From 138 component files down to approximately 90-95 — a 30-35% reduction with zero functional loss.

---

## Design Token Architecture

### Current Token State

The codebase already has a well-structured token layer in `src/app/globals.css`. The `@theme inline` block defines:

- **Semantic tokens**: `--color-primary`, `--color-background`, `--color-muted`, etc. (shadcn/ui standard)
- **Primitive scale**: `--color-primary-50` through `--color-primary-900` (red scale)
- **Neutral scale**: `--color-neutral-50` through `--color-neutral-950`
- **Accent palette**: blue, purple, green, yellow, pink variants
- **Typography**: `--font-sans: 'Satoshi'` custom font
- **Radius**: `--radius-sm/md/lg/xl` computed from `--radius`

### What's Missing

The token layer is defined but **inconsistently consumed**. Components mix raw Tailwind literals with token-based classes:

```tsx
// Current — inconsistent (raw Tailwind):
className="bg-gradient-to-br from-red-50 via-white to-blue-50"
className="text-gray-600 max-w-3xl"
className="border-gray-200/50 bg-white/80"

// Target — token-based:
className="bg-muted/50 text-muted-foreground"
className="border-border/50 bg-background/80"
```

### Token Enforcement Strategy

1. **Do not add new tokens** — the existing scale is sufficient
2. **Audit all `text-gray-*`, `bg-gray-*`, `border-gray-*`** usages and replace with semantic tokens
3. **Gradient backgrounds** in hero sections: replace `from-red-50 via-white to-blue-50` with a single reusable CSS class in `globals.css`
4. **Hardcoded colors in inline styles** are the highest risk — flag these first

---

## Architectural Patterns

### Pattern 1: Atomic Composition (Use This)

**What:** Build complex components by composing shadcn/ui primitives. Never re-implement button, input, or card logic.

**When to use:** Always, for any new or refactored component.

**Example:**
```tsx
// CORRECT: Compose from primitives
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* image, badge, info composed from primitives */}
      </CardContent>
    </Card>
  )
}

// WRONG: Duplicate primitive logic
export function ProviderCard({ provider }) {
  return (
    <div className="rounded-lg border bg-white shadow ..."> {/* reinventing Card */}
      <span className="rounded-full bg-red-100 text-red-700 ..."> {/* reinventing Badge */}
```

### Pattern 2: Server Component by Default (Use This)

**What:** In Next.js 15 App Router, components default to Server Components. Only add `'use client'` when the component needs browser APIs, state, or event handlers.

**When to use:** All display/presentational components that receive data as props.

**Trade-offs:** Reduces client bundle. Provider cards, listing grids, and hero static content should be Server Components. Booking wizard, favorite toggles, and chat require `'use client'`.

**Example:**
```tsx
// CORRECT: Server Component — no 'use client' needed
// src/components/providers/provider-card.tsx
import type { ServiceProvider } from '@/types'

export function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (/* static rendering */)
}

// Interactive wrapper stays client-only
'use client'
export function ProviderCardWithFavorite({ provider }: { provider: ServiceProvider }) {
  const { isFavorited, toggleFavorite } = useFavorites()
  return <ProviderCard provider={provider} /* + favorite button */ />
}
```

### Pattern 3: Unified Responsive Component (Use This)

**What:** One component handles all breakpoints with Tailwind responsive prefixes. Do not create separate mobile/desktop component variants.

**When to use:** Any time you see `MobileHeroSection` + `HeroSection` pattern.

**Trade-offs:** Slightly more complex className strings, but eliminates maintenance of two codebases for the same UI.

**Example:**
```tsx
// CORRECT: Single component, responsive classes
export function HeroSection() {
  return (
    <section className="pt-12 pb-8 md:pt-20 md:pb-12">
      <h1 className="text-3xl font-bold md:text-5xl lg:text-7xl">...</h1>
    </section>
  )
}

// WRONG: Separate components per breakpoint
export function MobileHeroSection() { ... }  // delete this
export function DesktopHeroSection() { ... } // rename to HeroSection
```

### Pattern 4: Design Token Usage (Use This)

**What:** Use semantic token classes (`text-foreground`, `bg-card`, `border-border`) not Tailwind gray scale (`text-gray-600`, `bg-gray-50`).

**When to use:** Every new className you write during modernization.

**Trade-offs:** Slightly less explicit about the exact color, but enables theme consistency.

---

## Modernization Order of Operations

This sequence minimizes risk of breaking functionality:

### Phase 0: Audit and Delete (1-2 days) — No visual change

**Goal:** Reduce noise before redesigning. Confidence: safe to delete all of these.

1. Run `npx knip` to confirm dead exports and files
2. Delete the 13 confirmed dead components (listed above)
3. Consolidate 8 chat components → 2 (`ChatButton`, `ChatDialog`)
4. Delete `mobile-hero-section.tsx` (confirmed dead)
5. Delete root `navigation-search.tsx` (shadowed by `navigation/navigation-search.tsx`)

**Risk:** LOW. None of these are imported anywhere.

### Phase 1: Design Token Enforcement (2-3 days) — Subtle visual change

**Goal:** Make color usage consistent before making it look different.

1. Global replace `text-gray-600` → `text-muted-foreground`, `text-gray-900` → `text-foreground`
2. Global replace `bg-gray-50/100` → `bg-muted`, `bg-white` → `bg-background`
3. Global replace `border-gray-200` → `border-border`
4. Create reusable CSS utility classes in `globals.css` for gradient backgrounds
5. Fix TypeScript `any` in `booking/types.ts` — replace with proper `ServiceProvider`, `Service`, `Pet` types from `src/types/index.ts`

**Risk:** LOW-MEDIUM. Color changes are subtle. Test on each page after each global replace.

### Phase 2: Navigation Modernization (1-2 days) — Visible change

**Goal:** Sticky, clean header is the first thing users see on every page.

1. Consolidate navigation into the `navigation/` folder (it's already mostly there)
2. Harden the sticky header: ensure `backdrop-blur-xl` and `bg-background/80` are consistent
3. Remove hardcoded service category nav items from `navigation-header.tsx` — they're Lithuanian grooming strings baked into the nav
4. Replace with `service-categories.tsx` dynamic component

**Risk:** MEDIUM. Navigation touches every page. Test all routes after changes.

### Phase 3: Hero Section Modernization (2-3 days) — High visibility

**Goal:** Landing page is the entry point — first impression.

1. Clean up `hero-section.tsx`: remove `animate-pulse` orbs, remove `hero-pattern` class (likely undefined CSS)
2. Simplify the gradient: use a single subtle gradient token instead of `from-red-50 via-white to-blue-50`
3. Fix typography hierarchy: hero heading should use consistent `font-sans` with proper weight scale
4. `HeroFilters` component: align pill/filter design to match Airbnb-style minimal search bar
5. `CategorySection`: modernize category pills — remove emoji, use proper icons from Lucide

**Risk:** LOW. Landing page content is server-rendered. Changes are isolated.

### Phase 4: Provider Card Unification (2-3 days) — Core browse experience

**Goal:** One `ProviderCard` component that works in grids, sliders, and search results.

1. Audit `provider-card.tsx` vs `listings-grid.tsx` — `listings-grid.tsx` has its own inline card implementation
2. Move `listings-grid.tsx` card rendering into `provider-card.tsx`
3. `listings-grid.tsx` becomes a pure grid layout that accepts `ProviderCard` children
4. Update card design: clean image aspect ratio (4:3), rating display, service badges, price
5. Apply to `search-layout.tsx` results and `provider-slider.tsx`

**Risk:** MEDIUM. Provider cards appear in 4+ locations. Snapshot test before/after.

### Phase 5: Search and Browse Experience (3-4 days) — Most complex

**Goal:** The search/browse flow is the core marketplace UX.

1. `search-layout.tsx`: Clean up map/list split layout
2. `search-filters.tsx`: Modernize filter chips to match the `HeroFilters` bar style
3. `mapbox-map.tsx`: Map markers should match the card aesthetic
4. Responsive: list-only on mobile, map+list toggle on desktop (AllTrails pattern)

**Risk:** HIGH. This touches the most complex interactive component tree. Build incrementally, test each sub-component.

---

## Component Hierarchy for Marketplace UI

```
LandingPage
├── Layout (shell)
│   ├── Navigation
│   │   ├── NavigationHeader
│   │   │   ├── Logo
│   │   │   ├── ServiceCategoryPills
│   │   │   └── UserMenu
│   │   └── MobileMenu
│   └── MobileBottomNav
├── HeroSection
│   ├── HeroHeading
│   ├── HeroFilters (search bar)
│   └── CategorySection[]
│       └── ProviderCard[]
└── Footer

SearchPage
├── Layout
├── HeroFilters (compact mode)
├── SearchLayout
│   ├── SearchFilters (sidebar/bar)
│   ├── ListingsGrid
│   │   └── ProviderCard[] (N items)
│   └── MapboxMap
│       └── MapMarker[] (click → ProviderCard popover)

ProviderDetailPage
├── Navigation (no categories)
├── ImageGallery
├── ProviderInfo
│   ├── ServiceCard[]
│   └── ReviewList
└── BookingWidget (sticky sidebar)
    └── QuickBookingDialog

BookingFlow
└── BookingWizard
    ├── BookingStep1 (service select)
    ├── BookingStep2 (pet select)
    ├── BookingStep3 (date/time)
    └── BookingStep4 (confirm)
```

---

## Data Flow

### Request Flow (Search Page)

```
User types in HeroFilters
    ↓
URL query params updated (useRouter.push)
    ↓
SearchPage (Server Component) re-renders
    ↓
Supabase query with filters
    ↓
SearchLayout receives results as props
    ↓
ListingsGrid renders ProviderCard[]
    ↓ (client-side)
ProviderCardWithFavorite reads useFavorites() context
```

### State Management Pattern

The codebase uses React Context for cross-component state — no Redux or Zustand needed at this scale:

```
AuthContext          → user identity, role
FavoritesContext     → favorited provider IDs
NotificationsContext → real-time Supabase subscription
```

Booking state is local to `BookingWizard` — correct, no need for global state.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (existing users) | Monolith is correct. No architectural changes needed — only visual refactor. |
| 10k+ daily active users | Add `next/image` optimization for all provider images, implement ISR for provider detail pages |
| 100k+ users | Consider splitting booking flow to separate route segments with Suspense boundaries; add Redis for favorites caching |

### Scaling Priorities

1. **First bottleneck:** Image loading — provider cards have unconstrained images. `next/image` with explicit `width`/`height` and `sizes` is the fix.
2. **Second bottleneck:** Search page data fetching — currently client-side via hooks. Move to Server Component with `searchParams` for better caching.

---

## Anti-Patterns

### Anti-Pattern 1: Mobile/Desktop Component Twins

**What people do:** Create `MobileHeroSection` and `HeroSection` as separate components.
**Why it's wrong:** Two codebases to maintain. Design changes must be applied twice. React renders both and one gets `hidden` via CSS — wastes bundle.
**Do this instead:** One component with responsive Tailwind classes (`md:text-5xl`, `hidden md:block`).

### Anti-Pattern 2: Rebuilding Primitives

**What people do:** Implement a `div` with card-like styling instead of `<Card>` from shadcn/ui. See `listings-grid.tsx` for current example.
**Why it's wrong:** Diverges from the design system. Hover/focus states, dark mode, and border tokens are missing.
**Do this instead:** Always start with `<Card>`, `<Button>`, `<Badge>` from `ui/`. Customize with `className` + `cn()`.

### Anti-Pattern 3: Hardcoded Strings in Navigation

**What people do:** Hardcode Lithuanian service names as an array literal inside `NavigationHeader`.
**Why it's wrong:** Navigation becomes untranslatable, unmaintainable. Adding a service category requires a code deploy.
**Do this instead:** Source categories from the `service-categories` shared component or a constants file. Use `t()` translation helper consistently.

### Anti-Pattern 4: Proliferating Chat Components

**What people do:** Create `chat-button.tsx`, `ai-chat-button.tsx`, `floating-chat-button.tsx` as variations.
**Why it's wrong:** 8 components for one feature means no canonical implementation. The "real" one is unclear to any developer.
**Do this instead:** One `ChatButton` with a `variant` prop (`'floating' | 'inline' | 'ai'`). Use class-variance-authority (already in the stack).

### Anti-Pattern 5: TypeScript `any` as an Escape Hatch

**What people do:** `provider: any`, `services: any[]`, `selectedService: any` in `booking/types.ts`.
**Why it's wrong:** Eliminates type safety in exactly the component tree that handles money. Errors surface at runtime not build time.
**Do this instead:** Import `ServiceProvider`, `Service`, `Pet` from `src/types/index.ts` — they're already defined. Replace all `any` in `booking/types.ts` immediately.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes for Modernization |
|---------|---------------------|-------------------------|
| Supabase | Client via `@supabase/ssr`, Server Component queries | No changes needed — data fetching is separate from UI |
| Mapbox GL | `mapbox-map.tsx` wraps GL instance | Keep intact — map is functional |
| Stripe | `stripe-payment-form.tsx` (currently dead code) | Payment handled in checkout page — delete this component |
| Framer Motion | Available but underused | Use for card hover transitions and hero entrance animations only — avoid per-frame animations |

### Internal Boundaries

| Boundary | Communication | Modernization Notes |
|----------|---------------|---------------------|
| Layout ↔ Pages | `children` prop pattern | Clean — keep as-is |
| Navigation ↔ Auth | `useAuth()` context | Clean — keep as-is |
| SearchLayout ↔ Map | `onMarkerClick` prop callback | Keep — well-defined interface |
| BookingWizard ↔ Provider detail | Props passed from parent page | `any` types here — fix during Phase 1 |
| ProviderCard ↔ Favorites | `useFavorites()` context | Extract to client wrapper to allow server rendering of card base |

---

## Tools for Component Audit

Use these before starting Phase 0:

```bash
# Install Knip — finds unused exports, files, and dependencies
npm install -D knip

# Run audit
npx knip

# Find all components with zero imports (manual verification)
grep -rn "export const\|export function\|export default" src/components/ \
  | awk -F: '{print $1}' | sort -u > all-exports.txt

# Bundle analysis — see which components add to JS bundle
npm install @next/bundle-analyzer
```

---

## Sources

- [Next.js App Router Architecture Docs](https://nextjs.org/docs/architecture) — HIGH confidence (official)
- [Building a Scalable Design System with shadcn/ui, Tailwind CSS, and Design Tokens](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690) — MEDIUM confidence (community, verified against shadcn/ui docs)
- [Knip: Detect Unused Code and Dependencies](https://fireup.pro/news/knip-the-ultimate-tool-to-detect-unused-code-and-dependencies-in-javascript-typescript) — HIGH confidence (tool is well-established)
- [Techniques for Removing React Unused Components](https://www.dhiwise.com/post/techniques-for-identifying-and-eliminating-react-unused-components) — MEDIUM confidence (community)
- [Next.js Battle-Tested Project Structure 2025](https://medium.com/@burpdeepak96/the-battle-tested-nextjs-project-structure-i-use-in-2025-f84c4eb5f426) — MEDIUM confidence (community)
- Direct codebase audit of `src/components/` (138 files) — HIGH confidence

---
*Architecture research for: Petify UI modernization — 142-component Next.js marketplace*
*Researched: 2026-02-23*
