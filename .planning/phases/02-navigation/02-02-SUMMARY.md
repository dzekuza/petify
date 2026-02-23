---
phase: 02-navigation
plan: 02
subsystem: navigation
tags: [category-pills, horizontal-scroll, nav-ux, layout]
requirements: [NAV-03]

dependency_graph:
  requires:
    - "02-01 — scroll-aware header with brand tokens"
  provides:
    - "Horizontal category pill row rendered below main header bar"
    - "All 5 service categories accessible via pill navigation"
    - "Active pill detection using pathname + search params"
  affects:
    - "src/components/layout.tsx — main padding increased to pt-28"
    - "Any page using Layout component — now offset by 112px"

tech_stack:
  added: []
  patterns:
    - "useSearchParams() for query-param aware active state detection"
    - "overflow-x-auto + min-w-max pattern for mobile horizontal scroll without body scroll"
    - "md:min-w-0 md:justify-center for desktop center-alignment of pills"

key_files:
  created: []
  modified:
    - src/components/navigation/constants.ts
    - src/components/navigation/navigation-header.tsx
    - src/components/layout.tsx

decisions:
  - "navigationItems has 5 items (no sitting) — sitting has no icon available per research open question #2"
  - "Active pill detection splits href on '?' to handle pathname vs. search params separately — avoids pitfall of usePathname returning only path"
  - "Fixed pt-28 (112px) for layout offset — simpler than CSS variable approach, sufficient for this phase"
  - "scrollbar-hide class on pill container prevents body-level horizontal scroll (already defined in globals.css)"

metrics:
  duration: "~2 minutes"
  completed_date: "2026-02-23"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 02 Plan 02: Category Pill Row Summary

**One-liner:** Airbnb-style horizontal scrollable category pill row with 5 service categories below the main header bar, using pathname+searchParams active detection and brand color tokens.

## What Was Built

A second row was added inside the fixed header containing 5 category pills (Kirpyklos, Dresūra, Poravimas, Veterinarijos, Veislynai). Each pill links to `/search?category={category}` and highlights with `bg-brand-light text-brand` when the current route matches. The pill row scrolls horizontally on mobile via `overflow-x-auto` on the container and `min-w-max` on the inner row, without causing body-level horizontal scroll. On wider screens, pills are center-aligned via `md:min-w-0 md:justify-center`.

The `serviceTypes` array was also fully uncommented — all 6 service types are now available for use across the codebase.

Layout padding was updated from `pt-16` (64px) to `pt-28` (112px) to prevent page content from being hidden behind the expanded two-row header.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Uncomment categories and add pill row | 12abbea | constants.ts, navigation-header.tsx |
| 2 | Update layout padding for two-row header | 13178f6 | layout.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit`: PASS (no type errors)
- `npm run build`: PASS (production build succeeds)
- `constants.ts`: 5 items in `navigationItems`, 6 items in `serviceTypes`, "training" present
- `navigation-header.tsx`: `overflow-x-auto scrollbar-hide` present, `isActive` function uses `useSearchParams()`, `bg-brand-light text-brand` active state, no `bg-red-50` or `text-red-600`
- `layout.tsx`: `pt-28` on `<main>`, `pt-16` absent

## Self-Check: PASSED
