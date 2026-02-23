# Requirements: Petify UI Modernization

**Defined:** 2026-02-23
**Core Value:** The app should look and feel like it was built in 2025 — clean, minimal, professional — so users trust it enough to book services and pay through it.

## v1 Requirements

Requirements for the modernization release. Each maps to roadmap phases.

### Component Cleanup

- [x] **CLEAN-01**: Dead components (13+ confirmed unused) are deleted from the codebase
- [x] **CLEAN-02**: Chat components consolidated from 8 down to 2 (ChatButton + ChatDialog)
- [ ] **CLEAN-03**: `listings-grid.tsx` inline card unified with `provider-card.tsx` into one canonical ProviderCard
- [ ] **CLEAN-04**: Raw Tailwind gray classes (`text-gray-*`, `bg-gray-*`, `border-gray-*`) replaced with semantic design tokens (`text-muted-foreground`, `bg-muted`, `border-border`)
- [x] **CLEAN-05**: `booking/types.ts` `any` types replaced with proper TypeScript interfaces from `src/types/index.ts`

### Navigation

- [ ] **NAV-01**: Header is sticky with backdrop blur effect on scroll
- [ ] **NAV-02**: Navigation typography is clean with proper hierarchy
- [ ] **NAV-03**: Category pill navigation row in header (Airbnb-style horizontal scroll with icons)

### Landing Page

- [ ] **LAND-01**: Hero section redesigned with clean minimal aesthetic — strong typography, full-bleed background, centered search bar
- [ ] **LAND-02**: Service category browse section with icons and labels
- [ ] **LAND-03**: Social proof count in hero ("Join X pet owners" or "N providers near you")
- [ ] **LAND-04**: Subtle Framer Motion entrance animations on hero text and CTA
- [ ] **LAND-05**: Featured providers section with modernized horizontal scroll cards

### Provider Cards

- [ ] **CARD-01**: Provider cards lead with dominant image at consistent 3:2 aspect ratio with `object-fit: cover`
- [ ] **CARD-02**: Star rating (5-star with decimal) + review count visible on every card
- [ ] **CARD-03**: Starting price ("from $X") visible on every card
- [ ] **CARD-04**: Service category chips/pills displayed on card
- [ ] **CARD-05**: Skeleton loading states replace all spinner loading for card grids
- [ ] **CARD-06**: Card hover micro-interaction — subtle elevation shadow + slight lift via Framer Motion
- [ ] **CARD-07**: Hover image carousel on provider cards (Airbnb dot-navigation pattern, desktop only)
- [ ] **CARD-08**: Verified badge displayed on eligible provider cards
- [ ] **CARD-09**: Favorites heart with Framer Motion spring animation on toggle

### Search & Browse

- [ ] **SRCH-01**: Horizontal filter chips below search bar for primary filters (service type, rating, price range)
- [ ] **SRCH-02**: Live result count updates as filters change ("Showing X results")
- [ ] **SRCH-03**: Map markers show provider name + price tooltip on hover
- [ ] **SRCH-04**: Responsive map/list toggle works cleanly on mobile and desktop
- [ ] **SRCH-05**: Empty states with illustration + clear CTA for zero-results searches
- [ ] **SRCH-06**: Smooth filter transitions using Framer Motion `layout` prop on cards

### Provider Detail

- [ ] **DETL-01**: Progressive disclosure layout — above fold: image gallery, name, location, rating, price, book CTA; below fold: bio, services, reviews
- [ ] **DETL-02**: Sticky booking widget on desktop (sidebar), mobile (bottom sheet)
- [ ] **DETL-03**: Review highlight card — one standout review displayed prominently near the top
- [ ] **DETL-04**: Clean information hierarchy with proper spacing and typography
- [ ] **DETL-05**: Image gallery with smooth transition animations

### Global Polish

- [x] **GLBL-01**: All heading typography follows clean hierarchy — no all-caps on headings (reserved for badges/labels only)
- [ ] **GLBL-02**: CTA buttons use specific action verbs ("Book [Name]", "Check Availability") not generic ("Submit", "Go")
- [ ] **GLBL-03**: Form validation shows inline field-level errors with red border + helper text
- [x] **GLBL-04**: Consistent spacing system applied across all modernized pages

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Animated page transitions with Framer Motion AnimatePresence on route changes
- **ADV-02**: Provider availability preview on cards ("Available this weekend") — requires backend query changes
- **ADV-03**: Response time badge on cards and provider detail ("Responds within 2 hours")
- **ADV-04**: "Near you" distance indicator on cards when geolocation is available
- **ADV-05**: Personalized recommendations feed

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend/API changes | Visual-only refactor — no database or server logic modifications |
| Dashboard pages (admin, provider) | Focus on customer-facing pages for maximum impact |
| Dark mode redesign | Maintain current theme support as-is |
| Mobile app | Web only |
| New functionality | This is purely visual/component quality improvement |
| Color scheme changes | User explicitly wants to preserve existing brand colors |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEAN-01 | Phase 1 | Complete |
| CLEAN-02 | Phase 1 | Complete |
| CLEAN-03 | Phase 1 | Pending |
| CLEAN-04 | Phase 1 | Pending |
| CLEAN-05 | Phase 1 | Complete |
| GLBL-01 | Phase 1 | Complete |
| GLBL-04 | Phase 1 | Complete |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| LAND-01 | Phase 3 | Pending |
| LAND-02 | Phase 3 | Pending |
| LAND-03 | Phase 3 | Pending |
| LAND-04 | Phase 3 | Pending |
| LAND-05 | Phase 3 | Pending |
| CARD-01 | Phase 4 | Pending |
| CARD-02 | Phase 4 | Pending |
| CARD-03 | Phase 4 | Pending |
| CARD-04 | Phase 4 | Pending |
| CARD-05 | Phase 4 | Pending |
| CARD-06 | Phase 4 | Pending |
| CARD-07 | Phase 4 | Pending |
| CARD-08 | Phase 4 | Pending |
| CARD-09 | Phase 4 | Pending |
| SRCH-01 | Phase 5 | Pending |
| SRCH-02 | Phase 5 | Pending |
| SRCH-03 | Phase 5 | Pending |
| SRCH-04 | Phase 5 | Pending |
| SRCH-05 | Phase 5 | Pending |
| SRCH-06 | Phase 5 | Pending |
| DETL-01 | Phase 6 | Pending |
| DETL-02 | Phase 6 | Pending |
| DETL-03 | Phase 6 | Pending |
| DETL-04 | Phase 6 | Pending |
| DETL-05 | Phase 6 | Pending |
| GLBL-02 | Phase 6 | Pending |
| GLBL-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 — traceability complete, all 37 requirements mapped across 6 phases*
