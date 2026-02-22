# Petify UI Modernization

## What This Is

A comprehensive UI modernization of Petify — a pet service marketplace built with Next.js 15, TailwindCSS 4, and shadcn/ui. The goal is to bring the visual design up to 2025 standards with a clean, minimal aesthetic inspired by Airbnb and AllTrails, while auditing and consolidating the existing 142-component library.

## Core Value

The app should look and feel like it was built in 2025 — clean, minimal, professional — so users trust it enough to book services and pay through it.

## Requirements

### Validated

- ✓ Full-stack pet service marketplace with booking, payments, chat — existing
- ✓ Provider search with map integration — existing
- ✓ Multi-role system (customer, provider, admin) — existing
- ✓ Authentication and authorization — existing
- ✓ Email notifications — existing
- ✓ shadcn/ui + Radix UI component library — existing
- ✓ TailwindCSS 4 styling — existing
- ✓ Framer Motion animation library — existing

### Active

- [ ] Modernize landing page with clean minimal design (Airbnb/AllTrails-inspired)
- [ ] Modernize provider listing cards and grid
- [ ] Modernize provider detail pages
- [ ] Modernize provider search/browse experience
- [ ] Audit component library — remove unused, consolidate duplicates
- [ ] Enforce consistent spacing, typography, and component usage across pages
- [ ] Improve whitespace and visual hierarchy
- [ ] Modernize navigation and header
- [ ] Keep existing brand color scheme, modernize how colors are applied

### Out of Scope

- New features or functionality — this is purely visual/component quality
- Backend/API changes — no database or server logic modifications
- Dashboard pages (admin, provider) — focus is on customer-facing pages
- Mobile app — web only
- Dark mode redesign — maintain current theme support as-is

## Context

- **Existing codebase**: 142 React components, 20+ pages, fully functional marketplace
- **Current stack**: Next.js 16, React 19, TailwindCSS 4, shadcn/ui, Radix UI, Framer Motion
- **Design references**: Airbnb (clean cards, generous whitespace, strong typography), AllTrails (content-focused browse, search UX)
- **Brand colors**: Keep the existing color palette — modernize application, not the colors themselves
- **Component state**: 142 components with potential dead code, duplicates (e.g., multiple card variants, mobile/desktop hero sections), inconsistent styling patterns
- **Known issues from audit**: TypeScript `any` abuse (28+ instances), missing useEffect dependencies, index keys in lists — some of these overlap with component cleanup

## Constraints

- **Color scheme**: Preserve existing brand colors — do not change the palette
- **Tech stack**: Stay within TailwindCSS 4 + shadcn/ui + Framer Motion — no new UI libraries
- **Functionality**: All existing features must continue working — this is a visual-only refactor
- **Scope**: Landing page and provider pages are priority — other pages are secondary

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean minimal aesthetic | User preference + professional trust factor for payments | — Pending |
| Airbnb/AllTrails as reference | Proven patterns for marketplace browse/search UX | — Pending |
| Keep brand colors | User specifically wants to preserve existing palette | — Pending |
| Full component audit | Remove dead code, consolidate duplicates, enforce consistency | — Pending |
| Customer-facing pages only | Highest impact — provider/admin dashboards work fine | — Pending |

---
*Last updated: 2026-02-23 after initialization*
