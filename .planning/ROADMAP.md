# Roadmap: Petify UI Modernization

## Overview

Six phases that transform Petify from a functional marketplace into one that looks and feels like it was built in 2025. The sequence is mandatory: clean up the codebase and enforce design tokens first, then modernize the frame (navigation), then the entry point (landing), then the highest-ROI component (provider cards), then the complex interactive browse experience (search), and finally the conversion-critical detail page. Each phase is independently verifiable and leaves the app fully functional throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Delete dead components, enforce design tokens, unify ProviderCard, fix TypeScript types
- [ ] **Phase 2: Navigation** - Sticky header with backdrop blur, clean typography, Airbnb-style category pill row
- [ ] **Phase 3: Landing Page** - Clean minimal hero, service category browse, social proof count, Framer Motion entrances, featured providers
- [ ] **Phase 4: Provider Cards** - Image-led unified ProviderCard with rating, price, skeletons, hover micro-interactions, favorites animation
- [ ] **Phase 5: Search and Browse** - Horizontal filter chips, live result count, map marker tooltips, empty states, layout transitions
- [ ] **Phase 6: Provider Detail** - Progressive disclosure layout, sticky booking widget, review highlight, gallery animations, global CTA and form polish

## Phase Details

### Phase 1: Foundation
**Goal**: The codebase is clean, token-consistent, and type-safe — a stable base so visual work in all subsequent phases produces consistent results
**Depends on**: Nothing (first phase)
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05, GLBL-01, GLBL-04
**Success Criteria** (what must be TRUE):
  1. No unused component files exist in src/components/ — confirmed dead components are deleted with no remaining import errors
  2. Chat UI renders correctly using only two public entry points: ChatButton and ChatDialog — internal implementation files (ruixen-mono-chat.tsx) and distinct page layouts (chat-page.tsx) may remain but no other public chat components exist
  3. A single canonical ProviderCard component exists; listings-grid.tsx no longer contains an inline card implementation
  4. No raw text-gray-*, bg-gray-*, or border-gray-* Tailwind classes appear anywhere in the codebase — semantic design tokens are used throughout
  5. booking/types.ts contains zero TypeScript `any` types — all interfaces reference named types from src/types/index.ts
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Delete dead components, consolidate chat to 2 entry points, fix booking `any` types, audit GLBL-01
- [ ] 01-02-PLAN.md — Add brand accent tokens, validate warm gray neutrals, define canonical spacing utilities
- [ ] 01-03-PLAN.md — Replace all raw gray Tailwind classes with semantic design tokens (~1,275 occurrences)
- [ ] 01-04-PLAN.md — Unify ProviderCard with variant prop; update listings-grid.tsx to use it

### Phase 2: Navigation
**Goal**: The header is modern, sticky, and visually correct on every page — it provides the correct visual frame for all subsequent phase work
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. The header stays visible and shows a backdrop blur effect as the user scrolls down any page with scrollable content
  2. Navigation links use clean, properly weighted typography with clear visual hierarchy and no inconsistencies between items
  3. A horizontally scrollable row of service category pills with icons is visible in the header and navigates to filtered search results when clicked
**Plans**: TBD

Plans:
- [ ] 02-01: Implement sticky header with backdrop-blur, border-b, and bg-background/80 styling
- [ ] 02-02: Source category pills from service-categories.tsx and render as a scrollable pill row in the navigation header

### Phase 3: Landing Page
**Goal**: The landing page makes a strong first impression that builds trust and drives users toward search
**Depends on**: Phase 2
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05
**Success Criteria** (what must be TRUE):
  1. The hero section shows strong typography over a full-bleed background with a centered search bar — no animated orbs or undefined CSS classes are visible
  2. A service category browse section with icons and labels is visible below the hero and links to filtered search results when categories are clicked
  3. A social proof count is visible in the hero without scrolling (e.g., "Join 2,400 pet owners" using real data from the database)
  4. Hero text and CTA animate in on page load via Framer Motion fade-up — animations complete within 600ms and do not block interaction
  5. A featured providers section with horizontally scrollable cards is visible below the category section
**Plans**: TBD

Plans:
- [ ] 03-01: Redesign hero section — full-bleed background, clean typography, centered search bar, social proof count, Framer Motion entrance animations
- [ ] 03-02: Build service category browse section with icons and featured providers horizontal scroll section

### Phase 4: Provider Cards
**Goal**: A single canonical ProviderCard delivers the image-led, information-complete design with skeleton loading, hover micro-interactions, and favorites animation everywhere cards appear
**Depends on**: Phase 1
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, CARD-06, CARD-07, CARD-08, CARD-09
**Success Criteria** (what must be TRUE):
  1. Every provider card leads with a dominant image at consistent 3:2 aspect ratio with object-cover — no text-first or broken-image layouts
  2. Star rating with decimal precision and review count are visible on every card in every context cards appear
  3. A starting price ("from $X") is visible on every provider card
  4. Service category tags are displayed on each card
  5. When a card grid is loading, skeleton placeholders matching the card shape appear — no spinners visible in grid contexts
  6. Hovering a card on desktop produces a subtle elevation shadow and upward lift, and image carousel dot navigation appears for providers with multiple photos
  7. Clicking the favorites heart triggers a spring animation via Framer Motion, and eligible providers display a Verified badge
**Plans**: TBD

Plans:
- [ ] 04-01: Finalize ProviderCard — image layout, star rating, starting price, category tags, verified badge, favorites heart
- [ ] 04-02: Add skeleton loading states — replace all spinners in card grid contexts with card-shaped skeletons
- [ ] 04-03: Implement Framer Motion hover lift, desktop image carousel with dot navigation, and favorites spring animation

### Phase 5: Search and Browse
**Goal**: The search and browse experience surfaces results clearly with filterable chips, live counts, informative map markers, and graceful empty states on both mobile and desktop
**Depends on**: Phase 4
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06
**Success Criteria** (what must be TRUE):
  1. Horizontal filter chips for service type, rating, and price range are visible below the search bar and can be toggled without opening a modal
  2. A result count ("Showing X providers") updates immediately when any filter is toggled — no stale count is ever visible
  3. Hovering a map marker on desktop shows a tooltip with the provider name and starting price
  4. The map/list toggle works correctly on mobile and desktop — mobile shows list by default with a map toggle, desktop shows both side by side with Mapbox correctly filling its container
  5. Searching with zero results shows an illustrated empty state with a clear CTA to broaden the search — no blank page appears
**Plans**: TBD

Plans:
- [ ] 05-01: Implement horizontal filter chip row below search bar; wire live result count to filter state
- [ ] 05-02: Update Mapbox map markers to show name and price tooltip on hover; validate SearchLayout h-full parent height contract after any layout changes
- [ ] 05-03: Add Framer Motion layout transitions on card grid for filter changes; build empty state component with illustration and CTA

### Phase 6: Provider Detail
**Goal**: The provider detail page guides users from first impression to booking with clear progressive disclosure, a persistent booking CTA, and system-wide consistency in button copy and form validation
**Depends on**: Phase 5
**Requirements**: DETL-01, DETL-02, DETL-03, DETL-04, DETL-05, GLBL-02, GLBL-03
**Success Criteria** (what must be TRUE):
  1. Above the fold on a 1280px desktop viewport, a user can see: image gallery, provider name, location, star rating, starting price, and a booking CTA — without scrolling
  2. The booking widget is sticky in a sidebar on desktop and appears as a bottom sheet on mobile — usable and visible at all scroll positions
  3. One standout review is displayed prominently near the top of the detail page in a styled highlight card — not buried in the review list
  4. The image gallery transitions between photos with smooth AnimatePresence animations and no layout shift
  5. All primary CTA buttons on the detail page use specific action verbs ("Book [Name]", "Check Availability") — no generic labels like "Submit" or "Go" appear
  6. Forms on the detail page show inline field-level validation errors with red border and helper text beneath the failing field
**Plans**: TBD

Plans:
- [ ] 06-01: Implement progressive disclosure layout — gallery, name/rating/price/CTA above fold; bio, services, and reviews below fold
- [ ] 06-02: Build sticky booking widget — sidebar on desktop, bottom sheet using vaul on mobile
- [ ] 06-03: Add review highlight card near top; implement image gallery AnimatePresence transitions; audit and update all CTA button copy and form validation across the detail page

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

Note: Phase 4 depends on Phase 1 (not Phase 3). Phases 3 and 4 could run in parallel but are sequenced here for single-developer focus.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Planned | - |
| 2. Navigation | 0/2 | Not started | - |
| 3. Landing Page | 0/2 | Not started | - |
| 4. Provider Cards | 0/3 | Not started | - |
| 5. Search and Browse | 0/3 | Not started | - |
| 6. Provider Detail | 0/3 | Not started | - |
