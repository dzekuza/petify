---
phase: quick
plan: 1
subsystem: customer-pages
tags: [layout, consistency, dashboard, ui]
dependency_graph:
  requires: []
  provides: [consistent-customer-layout]
  affects: [dashboard, bookings, chat]
tech_stack:
  added: []
  patterns: [Layout-wrapper, ProtectedRoute, bg-muted, max-w-4xl]
key_files:
  created: []
  modified:
    - src/app/dashboard/page.tsx
    - src/app/bookings/success/page.tsx
    - src/app/bookings/[id]/page.tsx
    - src/app/chat/page.tsx
decisions:
  - Dashboard hub uses static navigation cards only — no data fetching needed for a simple account landing page
  - Chat height set to calc(100vh-7rem) to account for ~112px nav established in Phase 02
  - Only page-level bg-white instances in booking detail were changed; inner card backgrounds left untouched
metrics:
  duration: ~5 minutes
  completed: 2026-02-23
  tasks_completed: 2
  files_modified: 4
---

# Quick Task 1: Customer Page Layout Consistency Summary

**One-liner:** Replaced Next.js default sidebar scaffold on dashboard with a navigation card hub, and applied Layout wrapper + bg-muted + max-w-4xl to booking success, booking detail, and chat pages.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Replace dashboard sidebar with customer hub page | c3614b8 |
| 2 | Fix booking success width, booking detail background, chat Layout | e729c03 |

## Changes Made

### Task 1 — Dashboard (src/app/dashboard/page.tsx)

Completely replaced the shadcn/ui sidebar scaffold (AppSidebar, SidebarProvider, SidebarInset, Breadcrumb with placeholder "Building Your Application" content) with a proper customer account hub.

New structure:
- `Layout hideFooter={true}` > `ProtectedRoute` > `div.bg-muted.pt-8` > `div.max-w-4xl`
- H1: "Mano paskyra"
- 2-column grid on md+, single column on mobile
- Four navigation cards: Mano rezervacijos (/bookings), Mano augintiniai (/pets), Pranešimai (/chat), Megstami (/favorites)
- Each card: Link > Card > CardContent with icon + title + description

### Task 2 — Three targeted fixes

**Booking success** (`src/app/bookings/success/page.tsx`):
- Changed `max-w-2xl` to `max-w-4xl` on inner container div

**Booking detail** (`src/app/bookings/[id]/page.tsx`):
- Changed all three page-level wrapper `bg-white` to `bg-muted` (loading, error, and main content states)
- Inner card/component backgrounds left unchanged

**Chat page** (`src/app/chat/page.tsx`):
- Wrapped existing `ChatPage` component in `Layout hideFooter={true}`
- Changed `h-screen` to `h-[calc(100vh-7rem)]` so chat fits below navigation bar without overflow

## Verification

- Build: `npm run build` passed with no errors
- No `max-w-2xl` in booking success page
- No `bg-white` in booking detail page wrappers
- Chat page imports Layout
- Dashboard has no sidebar imports

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/app/dashboard/page.tsx — contains Layout, ProtectedRoute, bg-muted, max-w-4xl
- src/app/bookings/success/page.tsx — contains max-w-4xl
- src/app/bookings/[id]/page.tsx — contains bg-muted, no page-level bg-white
- src/app/chat/page.tsx — contains Layout
- Commits c3614b8 and e729c03 verified in git log
