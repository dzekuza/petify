# Project Research Summary

**Project:** Petify UI Modernization
**Domain:** Pet service marketplace — visual modernization of existing Next.js 15 application
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

Petify is a fully functional pet service marketplace that requires a visual modernization — not a rewrite. The application already runs Next.js 15, TailwindCSS 4, shadcn/ui, and Framer Motion 12, which means the entire technology base required for a premium 2025 marketplace aesthetic is already installed. Research across competitor platforms (Airbnb, AllTrails, Rover, Wag) confirms a clear, well-documented pattern for what a modern service marketplace looks like: image-led provider cards with a strict visual hierarchy, horizontal filter chips replacing modal-only filters, skeleton loading states instead of spinners, a sticky navigation with backdrop blur, and a sticky booking widget on provider detail pages. These are not aspirational features — they are table stakes that users expect.

The recommended approach is a phased, inside-out modernization: begin by auditing and deleting the significant component bloat (13 confirmed dead components, 8 redundant chat variants) and enforcing the design token layer that already exists in `globals.css` but is inconsistently consumed. Doing this before any visual redesign work prevents the most common failure mode of modernizations: divergent styling across pages. The provider card is the single highest-impact component to redesign — it appears in search results, the landing page, and provider detail — and unifying it to a single implementation with the updated aesthetic delivers the majority of the "feels modern" impression.

The key risk is breaking functionality while changing visual structure. In a 142-component codebase where 123 components are client components, layout contracts are implicit — Mapbox map sizing depends on parent `h-full`, booking flows depend on scroll contexts, and multi-role UI (customer, provider, admin) means many components are invisible to static analysis tools. Every phase must include behavior verification across all three user roles, not just visual review. Animation is the secondary risk: Framer Motion must be limited to entrances and micro-interactions only — not applied to repeating grid elements — to avoid performance regression on mid-range devices.

---

## Key Findings

### Recommended Stack

The stack is already correct. No new libraries are needed. TailwindCSS 4's `@theme` directive (not `tailwind.config.js`) is the right way to define design tokens — it generates both CSS variables and utility classes automatically. shadcn/ui should be customized through CSS variables only, never by editing component source files. Framer Motion 12 should be imported from `motion/react` (the canonical v12 path) and limited strictly to opacity and transform animations to stay GPU-accelerated.

**Core technologies:**
- **TailwindCSS 4 with `@theme`:** Define all tokens in CSS-first config — generates utility classes automatically; `@apply` should be avoided except for base HTML element resets
- **shadcn/ui via CSS variables:** Customize `--primary`, `--radius`, `--muted-foreground`, etc. in `globals.css`; new 2025 components (`Spinner`, `Empty`, `Item`, `Field`) are installable via CLI
- **Framer Motion 12 (`motion/react`):** Stagger entrance with `whileInView`, subtle `y: -2` hover lift, `AnimatePresence` for modals and drawers; never animate width/height/margin
- **OKLCH color space:** Required for mixing custom brand colors with TailwindCSS v4's default palette; use the OKLCH picker to convert existing hex values
- **Container queries (`@container`):** Built into TailwindCSS v4 — use for provider card grid responsiveness without JavaScript

### Expected Features

Research against Airbnb, AllTrails, Rover, and Wag identifies a clear two-tier feature set: what users assume is there (and notice when missing), and what separates a functional app from a premium-feeling one.

**Must have (table stakes):**
- Provider cards with a dominant image (3:2 aspect ratio, `object-cover`) — text-first cards read as directory listings
- Star rating + review count visible on every card — social proof required before any click
- Starting price visible on card ("from $X") — hidden pricing creates friction
- Horizontal filter chips below search bar — modal-only filtering feels buried
- Loading skeleton states replacing spinners — spinners are a 2015 pattern
- Sticky navigation with backdrop blur — solid nav that doesn't respond to scroll feels unfinished
- Sticky booking widget on provider detail (sidebar desktop, bottom sheet mobile)
- Empty states with illustration + CTA — blank pages read as broken

**Should have (competitive differentiators):**
- Category pill navigation in hero (Airbnb-style icon + label scroll row)
- Hover image carousel on provider cards (desktop only, preload 2-3 images)
- Response time badge on cards ("Responds within 2 hours")
- Hero section with full-bleed background and centered search bar
- "Verified" badge/pill on provider cards
- Card micro-interactions via Framer Motion (subtle `y: -2` lift, shadow deepening)
- Favorites heart with spring animation (FavoritesProvider already exists)

**Defer to v2+:**
- Availability preview on cards — requires backend query changes, out of scope for visual-only refactor
- Animated page transitions — high complexity, lower user-visible impact
- Personalized recommendations feed — requires ML/preference tracking

### Architecture Approach

The codebase has 138 component files in `src/components/`, of which approximately 13 are confirmed dead (zero consumers) and 8 are redundant chat component variants that should consolidate to 2. The provider card exists in two parallel implementations (`provider-card.tsx` and an inline implementation inside `listings-grid.tsx`), which must unify before any visual redesign. The design token layer exists in `globals.css` but is inconsistently consumed — components mix semantic token classes with raw Tailwind gray scale (`text-gray-600`, `bg-gray-50`). The recommended target is a clean 5-folder structure under `components/`: `ui/` (untouched shadcn primitives), `layout/`, `search/`, `providers/`, and `booking/`.

**Major components and responsibilities:**
1. **ProviderCard (unified)** — single component used by ListingsGrid, ProviderSlider, and search results; currently split across two files
2. **SearchLayout** — split map/list view; already functional, needs visual treatment update for filter chips and map markers
3. **NavigationHeader** — sticky header with backdrop blur; currently has hardcoded Lithuanian service category strings baked in — must source from `service-categories.tsx`
4. **HeroSection** — entry point for landing page; has unused animated orbs and undefined `hero-pattern` CSS class; simplify before redesigning
5. **BookingWizard** — keep untouched; booking flow is functional; fix TypeScript `any` types in `booking/types.ts` as a foundation step

### Critical Pitfalls

1. **Breaking functionality while changing visual structure** — Before touching any component, identify load-bearing CSS properties (Mapbox requires explicit parent height, booking widget depends on scroll context). Test interactive behavior across all three user roles (customer, provider, admin) after every component change, not just visual output.

2. **Component audit false positives delete working code** — Automated tools like Knip cannot trace dynamic imports or role-conditional rendering. Never delete a component based solely on tool output. The multi-role nature of Petify means `mobile-*`, `admin-*`, and `provider-*` components need manual verification before removal.

3. **Hydration mismatches from client/server boundary shifts** — 123 of 138 components are already `"use client"`. Adding viewport-conditional or animation logic to components without checking their rendering context will produce silent hydration failures in production. Test with `next build && next start` after every component that gains animation.

4. **Inconsistent design system application across pages** — Modernizing page by page without enforcing tokens first produces an app that looks like three different products stitched together. Define the `@theme` token layer before touching any page.

5. **Animation overuse causing perceived performance regression** — Framer Motion on every card in a 12-provider grid causes frame drops on mid-range hardware. Limit to: stagger entrance on first visible row, hover micro-interaction on individual cards, `AnimatePresence` for modals. Test with Chrome DevTools 6x CPU throttle before shipping any animation.

---

## Implications for Roadmap

Based on combined research, the modernization has a clear and mandatory sequencing. Design token enforcement must precede visual redesign. Component audit must precede component modification. The provider card must unify before it can be redesigned. Navigation must modernize before landing page (it appears on all pages).

### Phase 1: Foundation — Audit, Tokens, and Codebase Cleanup

**Rationale:** The most important phase and the one most often skipped. Every subsequent phase depends on a consistent token layer and a clean component set. Applying visual redesign on top of redundant, token-inconsistent code produces divergent results across pages. This phase has zero visible user-facing changes but prevents the "three different apps" pitfall.

**Delivers:**
- Confirmed list of dead components removed (13 root-level files + 6 redundant chat variants)
- Single `ProviderCard` component (merged from `provider-card.tsx` + `listings-grid.tsx` inline implementation)
- All `text-gray-*`, `bg-gray-*`, `border-gray-*` replaced with semantic token equivalents
- TypeScript `any` in `booking/types.ts` replaced with proper interfaces from `src/types/index.ts`
- TailwindCSS v4 upgrade codemod run to eliminate silent v3/v4 compatibility breaks
- Behavior baseline documented: booking flow, map pan/zoom, filter toggles, payment form verified working

**Addresses:** Pitfall 1 (behavior baseline), Pitfall 2 (audit methodology), Pitfall 4 (token enforcement), Pitfall 7 (Tailwind v4 silent breaks)
**Uses:** TailwindCSS 4 `@theme`, `cn()` utility, Knip for audit (with manual verification)
**Research flag:** Standard patterns — skip phase research

---

### Phase 2: Navigation Modernization

**Rationale:** Navigation appears on every page. It's the frame around everything else. Modernizing it first means every subsequent page phase is viewed through the correct navigation context. It's also low-risk — relatively self-contained with well-understood `position: sticky` and `backdrop-blur` patterns.

**Delivers:**
- Sticky header with `bg-background/80 backdrop-blur-xl border-b border-border`
- Service category pills sourced from `service-categories.tsx` (removes hardcoded Lithuanian strings from nav)
- Navigation consolidated into `navigation/` folder structure
- Mobile menu verified working at 375px with mobile-bottom-nav spacing

**Addresses:** Pitfall 8 (mobile layout), Anti-pattern: hardcoded strings in navigation
**Implements:** NavigationHeader component with proper token usage
**Research flag:** Well-documented sticky nav pattern — skip phase research

---

### Phase 3: Hero Section and Landing Page

**Rationale:** The landing page is the first impression. After navigation is correct, this is the highest-visibility page to modernize. It's also relatively isolated — server-rendered, limited interactivity — making it lower risk than the search page.

**Delivers:**
- Simplified hero gradient (remove `from-red-50 via-white to-blue-50`, replace with single token-based gradient)
- Removed `animate-pulse` orbs and undefined `hero-pattern` class
- Category pill navigation row (Airbnb-style icon + label horizontal scroll)
- Hero search bar with centered layout and clear service type + location fields
- Framer Motion entrance: `initial={{ opacity: 0, y: 16 }}` fade-up on hero heading, staggered subtext

**Addresses:** Anti-feature: gradient abuse, Pitfall 9 (design reference adaptation — hero must degrade gracefully without curated photography), Feature: social proof count in hero
**Implements:** HeroSection + HeroFilters + CategorySection components
**Research flag:** Skip — landing page modernization patterns are well-established

---

### Phase 4: Provider Card Unification and Grid

**Rationale:** The provider card is the single highest-ROI component in the codebase. It appears in search results, the landing page featured section, and horizontal sliders. Unifying it first (Phase 1) enables this phase to redesign once and ship everywhere. This is the core of the "feels like a 2025 marketplace" transformation.

**Delivers:**
- Single `ProviderCard` component: image 3:2 aspect ratio, name, rating + review count, starting price, category tag, "Verified" pill
- Framer Motion stagger with `whileInView` on listing grids (entrance once, not on scroll-back)
- Hover: `whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}`
- Loading skeleton states matching card shape (remove all spinners in grid contexts)
- Empty state with illustration + "Broaden your search" CTA
- `next/image` with explicit `sizes` and `aspect-ratio` containers to prevent CLS
- Content resilience: fallback for missing images, truncation for long business names

**Addresses:** Pitfall 6 (maintain minimum 3 cards visible above fold at 1280px), Pitfall 9 (design for worst-case provider images), Pitfall 5 (animation budget enforcement)
**Implements:** Providers folder with unified ProviderCard, ListingsGrid, ProviderSlider
**Research flag:** Skip — card design patterns well-documented from competitor analysis

---

### Phase 5: Search and Browse Experience

**Rationale:** The search/browse flow is the most complex interactive component tree — it combines the filter system, provider card grid, and Mapbox map in a coordinated layout. It should come after the provider card is finalized (since it renders cards) and after navigation is stable.

**Delivers:**
- Horizontal filter chip row below search bar (service type, rating, price range) — replaces modal-only filter as primary UI
- Filter modal retained for advanced/secondary filters (mobile-friendly)
- Live result count ("Showing 14 providers") updating as filters change
- Mapbox map markers updated to match card aesthetic (name + price tooltip on hover)
- Responsive: list-only on mobile with map toggle, side-by-side on desktop (map on right)
- `SearchLayout` parent container validated to maintain Mapbox `h-full` requirement after any layout change

**Addresses:** Pitfall 1 (Mapbox height contract), Feature: split view map + listing, Feature: horizontal filter chips, Anti-feature: modal-only filtering
**Implements:** Search folder with SearchLayout, SearchFilters, FilterModal
**Research flag:** Needs phase research — Mapbox GL integration with dynamic filter updates has known gotchas; custom map marker styling with provider card popovers needs implementation research

---

### Phase 6: Provider Detail Page

**Rationale:** The provider detail page handles the most critical user moment — the decision to book. It comes after the card design is finalized (same visual language) and after the search flow is working (users navigate from search to detail).

**Delivers:**
- Progressive disclosure layout: image gallery first, then name/rating/price/CTA, then bio, then services, then reviews
- Sticky booking widget: sidebar on desktop (`position: sticky top-24`), bottom sheet on mobile
- Review highlight card near top (highest-rated review pulled into styled blockquote)
- Image gallery with smooth `AnimatePresence` transitions between photos
- All interactive elements (Radix Dialog, Select, Dropdown) tested for keyboard navigation after styling changes

**Addresses:** Feature: sticky booking CTA (direct conversion path), Feature: progressive disclosure, Pitfall: losing review count/rating for "cleaner" design
**Implements:** Provider-detail folder (keep structure, update visual treatment)
**Research flag:** Skip — sticky sidebar pattern is standard; bottom sheet uses `vaul` (already installed)

---

### Phase Ordering Rationale

- **Token enforcement must precede visual work** — styling inconsistency across 142 components cannot be fixed retroactively; it compounds with each phase if not addressed first
- **Navigation before pages** — navigation appears on every page; getting it right first means each subsequent page can be reviewed in final context
- **Provider card before search** — search page renders provider cards; the card must be finalized before the search layout is considered complete
- **Search before provider detail** — the primary user journey is search → detail → book; modernizing in journey order means each phase can be verified end-to-end
- **Booking flow is out of scope** — the BookingWizard is functional and well-structured; TypeScript `any` types are fixed in Phase 1 as infrastructure, but the booking flow visual treatment is not modernized in this project

### Research Flags

Phases needing deeper research during planning:
- **Phase 5 (Search/Browse):** Mapbox GL dynamic marker updates with React state, custom popup/tooltip with provider card preview on map pin hover — implementation-specific, sparse documentation

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Dead code audit and token enforcement are mechanical operations
- **Phase 2 (Navigation):** Sticky header with backdrop blur is a documented, universal pattern
- **Phase 3 (Hero/Landing):** Hero modernization patterns are well-covered by reference sites
- **Phase 4 (Provider Cards):** Card design patterns thoroughly documented in competitor analysis
- **Phase 6 (Provider Detail):** Sticky sidebar and bottom sheet patterns use existing installed libraries

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies are already installed; patterns verified against official TailwindCSS v4, shadcn/ui, and motion.dev docs |
| Features | MEDIUM-HIGH | Competitor analysis covers Airbnb, AllTrails, Rover, Wag; feature priorities validated across multiple marketplace UX sources |
| Architecture | HIGH | Direct codebase audit of 138 component files provides ground truth; dead component list verified manually |
| Pitfalls | MEDIUM-HIGH | Based on codebase inspection + multiple implementation sources; no user testing data to confirm UX pitfalls |

**Overall confidence:** HIGH

### Gaps to Address

- **Provider image quality baseline:** No data on actual provider photo quality or aspect ratio distribution in the current database. Design for worst-case (portrait, low-res, missing) — but validate during Phase 4 with real data before finalizing card image treatment.
- **Mobile usage split:** No analytics data on actual customer vs. mobile traffic ratio. Assumption is mobile-primary for customers, desktop for providers. Validate before Phase 5 to confirm map/list toggle priority.
- **Mapbox marker interaction specifics:** Phase 5 marker-to-card popover implementation needs a spike before committing to the design — Mapbox GL React integration has version-specific quirks. Flag for phase research.
- **Dark mode scope:** CLAUDE.md references `next-themes` as installed. Research did not determine whether dark mode is in scope for this modernization. Clarify before Phase 1 to know if new token additions need dark-mode variants.

---

## Sources

### Primary (HIGH confidence)
- [TailwindCSS v4.0 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4) — design token architecture, `@theme` directive
- [TailwindCSS v4 Theme Variables Docs](https://tailwindcss.com/docs/theme) — `@theme inline`, OKLCH colors, container queries
- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming) — CSS variable customization, CVA variant extension
- [shadcn/ui Changelog — Oct/Dec 2025, Feb 2026](https://ui.shadcn.com/docs/changelog) — new components (Spinner, Empty, Item, Field)
- [motion.dev React Animation](https://motion.dev/docs/react-animation) — Motion v12 stagger, whileInView, AnimatePresence
- [Next.js App Router Architecture Docs](https://nextjs.org/docs/architecture) — server/client boundary, hydration
- [Next.js Hydration Error Documentation](https://nextjs.org/docs/messages/react-hydration-error) — hydration mismatch prevention
- Direct codebase audit of `src/components/` (138 files) — dead components, duplicates, token inconsistencies

### Secondary (MEDIUM confidence)
- [Airbnb Summer 2025 Design System (Figma)](https://www.figma.com/community/file/1508075888287458165/airbnb-design-ui-kit-summer-release-2025) — card structure, spacing, typography
- [Baymard — Split View Layout for Accommodations](https://baymard.com/blog/accommodations-split-view) — map + list pattern validation
- [Marketplace UX Design Best Practices (Qubstudio)](https://qubstudio.com/blog/marketplace-ui-ux-design-best-practices-and-features/) — filter patterns, card hierarchy
- [Tailwind CSS v4 Migration Guide: Breaking Changes](https://medium.com/@mernstackdevbykevin/tailwind-css-v4-0-complete-migration-guide-breaking-changes-you-need-to-know-7f99944a9f95) — v3/v4 pitfalls
- [How to Fix Hydration Mismatch Errors in Next.js](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view) — client boundary patterns

### Tertiary (LOW confidence)
- [Airbnb Total Price Toggle Conversion Data](https://www.ftc.gov) — referenced 15% booking increase from price visibility; needs validation against Petify's specific context
- [Airbnb Spacing Analysis](https://medium.com/@kvividsnaps/airbnbs-use-of-spacing-creates-a-calm-ui-d04be85dc3e4) — spacing pattern analysis; community, not official Airbnb documentation

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
