---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/dashboard/page.tsx
  - src/app/bookings/success/page.tsx
  - src/app/bookings/[id]/page.tsx
  - src/app/chat/page.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "All customer account pages use the same Layout wrapper with consistent nav"
    - "All customer account pages use bg-muted background, not bg-white or gradients"
    - "All customer account pages use max-w-4xl container width"
    - "Dashboard page shows useful customer hub content, not placeholder sidebar template"
  artifacts:
    - path: "src/app/dashboard/page.tsx"
      provides: "Customer dashboard hub page"
      contains: "Layout"
    - path: "src/app/bookings/success/page.tsx"
      provides: "Booking success with consistent width"
      contains: "max-w-4xl"
    - path: "src/app/bookings/[id]/page.tsx"
      provides: "Booking detail with consistent background"
      contains: "bg-muted"
    - path: "src/app/chat/page.tsx"
      provides: "Chat page wrapped in Layout"
      contains: "Layout"
  key_links: []
---

<objective>
Standardize all customer-facing account pages to use a consistent layout pattern: Layout wrapper, bg-muted background, max-w-4xl container, and standard padding.

Purpose: Eliminate visual inconsistencies across customer pages — different backgrounds, widths, and missing nav/footer make the app feel unfinished.
Output: All 4 inconsistent pages fixed to match the established pattern.
</objective>

<execution_context>
@/Users/gvozdovic/.claude/get-shit-done/workflows/execute-plan.md
@/Users/gvozdovic/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/dashboard/page.tsx
@src/app/bookings/success/page.tsx
@src/app/bookings/[id]/page.tsx
@src/app/chat/page.tsx
@src/app/bookings/page.tsx (reference — this is the standard pattern to match)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace dashboard sidebar with standard customer hub page</name>
  <files>src/app/dashboard/page.tsx</files>
  <action>
    Completely replace the current sidebar-based dashboard (AppSidebar + SidebarProvider + SidebarInset + placeholder "Building Your Application" content) with a proper customer dashboard hub page.

    Use the standard layout pattern:
    ```
    Layout (hideFooter={true}) > ProtectedRoute > div.min-h-[calc(100vh-4rem)] md:min-h-screen bg-muted pt-8 > div.mx-auto max-w-4xl px-4 sm:px-6 lg:px-8
    ```

    Dashboard content should be a simple hub with navigation cards linking to:
    - Mano rezervacijos (/bookings) — Calendar icon
    - Mano augintiniai (/pets) — PawPrint icon (from lucide-react)
    - Pranesimai (/chat) — MessageCircle icon
    - Mėgstami (/favorites) — Heart icon

    Each card: a Link wrapping a Card component with icon + title + short description. Use a 2-column grid on md+, single column on mobile. Keep it simple — no data fetching, no stats, just navigation links.

    Add 'use client' directive. Import Layout from '@/components/layout', ProtectedRoute from '@/components/protected-route', Card/CardContent from '@/components/ui/card', Link from 'next/link', and icons from 'lucide-react'.

    Page title: h1 "Mano paskyra" (text-2xl font-bold text-foreground mb-6).

    Remove ALL sidebar imports (AppSidebar, SidebarProvider, SidebarInset, SidebarTrigger, Breadcrumb*).
  </action>
  <verify>Run `npm run build 2>&1 | tail -20` — page compiles without errors. Visually: no sidebar, standard nav header visible, card grid layout.</verify>
  <done>Dashboard page uses Layout + ProtectedRoute + bg-muted + max-w-4xl with navigation card grid. No sidebar components remain.</done>
</task>

<task type="auto">
  <name>Task 2: Fix booking success width, booking detail background, and chat Layout wrapper</name>
  <files>src/app/bookings/success/page.tsx, src/app/bookings/[id]/page.tsx, src/app/chat/page.tsx</files>
  <action>
    Three targeted fixes:

    1. **src/app/bookings/success/page.tsx** — Change `max-w-2xl` to `max-w-4xl` on line 86 (the inner container div). Keep everything else identical.

    2. **src/app/bookings/[id]/page.tsx** — Change all three instances of `bg-white` in the outer wrapper divs (lines ~206, ~238, ~258) to `bg-muted`. These are the min-h-screen wrapper divs for loading, error, and main content states. Do NOT change any inner card/component bg-white classes — only the page-level wrapper backgrounds.

    3. **src/app/chat/page.tsx** — Wrap the existing content in Layout with hideFooter. The chat page currently renders `div.h-screen.w-full > ChatPage`. Change to:
    ```tsx
    import { Layout } from '@/components/layout'

    export default function CustomerChatPage() {
      return (
        <Layout hideFooter={true}>
          <div className="h-[calc(100vh-7rem)] w-full">
            <ChatPage ... />
          </div>
        </Layout>
      )
    }
    ```
    Use `h-[calc(100vh-7rem)]` (subtracting nav height of ~112px / 7rem based on pt-28 established in Phase 02) instead of h-screen so chat fits below the navigation without overflow. Keep existing ChatPage props unchanged.
  </action>
  <verify>Run `npm run build 2>&1 | tail -20` — all three pages compile. Grep confirms: no `max-w-2xl` in success page, no page-level `bg-white` in booking detail wrapper divs, chat page imports Layout.</verify>
  <done>Booking success uses max-w-4xl, booking detail uses bg-muted backgrounds, chat page is wrapped in Layout with proper height calculation.</done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors
- All 4 modified pages use Layout component wrapper
- All 4 pages use bg-muted as page background
- Dashboard has no sidebar imports or placeholder content
- Booking success container is max-w-4xl
- Chat page shows navigation header
</verification>

<success_criteria>
All customer-facing account pages follow the same visual pattern: Layout wrapper providing nav, bg-muted page background, max-w-4xl centered content container with standard horizontal padding.
</success_criteria>

<output>
After completion, create `.planning/quick/1-check-dashboard-pages-update-ui-for-cons/1-SUMMARY.md`
</output>
