---
phase: 01-foundation
plan: 04
subsystem: ui
tags: [react, next, typescript, tailwindcss, lucide-react, provider-card, listings-grid]

requires:
  - phase: 01-02
    provides: semantic design tokens (text-foreground, text-muted-foreground, bg-card, border-border, bg-secondary)

provides:
  - Canonical ProviderCard component with grid and horizontal variants
  - No-photo fallback with PawPrint icon in warm gradient
  - listings-grid.tsx delegating all card rendering to ProviderCard
  - Verified badge using BadgeCheck icon
  - Favorites toggle in top-right corner of image
  - Starting price derived from Service[] or priceRange fallback

affects:
  - Phase 4 (Provider Cards) — single component to enhance with carousel/skeleton/hover animations
  - Phase 5 (Search/Browse) — HorizontalCard variant available for list view

tech-stack:
  added: []
  patterns:
    - "Variant prop pattern: single component accepts variant='grid'|'horizontal' for different layouts"
    - "Sub-component decomposition: GridCard, HorizontalCard, FavoriteButton, ImagePlaceholder as private functions"
    - "Cover image resolution order: services[0].images[0] -> provider.images[0] -> null (PawPrint placeholder)"
    - "Starting price resolution: services min price -> priceRange.min -> null (hidden)"

key-files:
  created: []
  modified:
    - src/components/provider-card.tsx
    - src/components/listings-grid.tsx
    - .planning/phases/01-foundation/deferred-items.md

key-decisions:
  - "ProviderCard sub-components (GridCard, HorizontalCard) are private functions not exported — Phase 4 extends via variant prop, not separate exports"
  - "distance prop accepted in interface for call-site compatibility but not rendered — Phase 4 will wire it to HorizontalCard"
  - "listings-grid.tsx drops its own useAuth/useFavorites/toggleFavorites state — favorites handling moved entirely into ProviderCard"
  - "Pre-existing TypeScript error in src/app/api/bookings/[id]/route.ts logged to deferred-items.md — not caused by this plan"

patterns-established:
  - "Card variants: grid (3:2 aspect image-dominant) vs horizontal (120px fixed-width image on left)"
  - "No-photo fallback: PawPrint icon in bg-gradient-to-br from-brand-light to-muted"
  - "Service labels: centralized SERVICE_LABELS map, getServiceLabel() helper"

requirements-completed:
  - CLEAN-03

duration: 12min
completed: 2026-02-23
---

# Phase 01 Plan 04: ProviderCard Unification Summary

**Eliminated duplicate card implementations by rewriting provider-card.tsx as a single canonical component with grid (3:2 Airbnb-style) and horizontal (120px compact) variants, and updating listings-grid.tsx to import and render ProviderCard instead of inline JSX**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-23T00:46:35Z
- **Completed:** 2026-02-23T00:58:56Z
- **Tasks:** 2
- **Files modified:** 2 (provider-card.tsx, listings-grid.tsx)

## Accomplishments
- Single ProviderCard component with variant prop eliminating dual implementations
- Grid variant: 3:2 aspect ratio image-dominant layout with semantic design tokens
- Horizontal variant: 120px fixed-width image on left, compact info panel on right
- No-photo fallback: PawPrint icon in warm brand gradient (not emoji, not gray box)
- Verified badge using BadgeCheck lucide icon with emerald styling
- Favorites heart button positioned in image top-right with toggle animation support
- Service tags as rounded pill chips using secondary semantic tokens
- listings-grid.tsx reduced from 202 lines to 47 lines — all card logic in one place

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign provider-card.tsx as unified ProviderCard with variant prop** - `741ce36` (feat)
2. **Task 2: Update listings-grid.tsx to use ProviderCard and fix all call sites** - `65a3cce` (feat)

## Files Created/Modified
- `src/components/provider-card.tsx` - Complete rewrite: unified ProviderCard with grid/horizontal variants, PawPrint fallback, semantic tokens, Service[] type instead of any[]
- `src/components/listings-grid.tsx` - Remove 157 lines of inline card JSX, delegate to ProviderCard

## Decisions Made
- Sub-components (GridCard, HorizontalCard) are private functions — not exported. Phase 4 adds features via variant prop, not via replacing sub-components.
- distance prop accepted for interface compatibility but not rendered yet — Phase 4 wires it to HorizontalCard display.
- listings-grid.tsx drops its own auth/favorites state entirely — ProviderCard manages its own favorites toggle.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

**Pre-existing TypeScript build error** in `src/app/api/bookings/[id]/route.ts:46` — confirmed present before this plan via `git stash` + build check. Not caused by ProviderCard changes. Logged to `.planning/phases/01-foundation/deferred-items.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Provider Cards) has exactly one component to enhance: `src/components/provider-card.tsx`
- HorizontalCard variant is ready for Phase 5 search list view integration
- featured-providers.tsx still uses its own inline card with mock data — that component is used on landing page and may be consolidated or replaced during Phase 4

---
*Phase: 01-foundation*
*Completed: 2026-02-23*
