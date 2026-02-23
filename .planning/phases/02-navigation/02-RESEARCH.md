# Phase 2: Navigation - Research

**Researched:** 2026-02-23
**Domain:** Next.js sticky header, scroll-aware styling, horizontal pill navigation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Header is sticky with backdrop blur effect on scroll | Header already uses `position: fixed` + `backdrop-blur-xl`. Research reveals the current implementation is always-blurred; plan must make blur conditional on scroll (transparent at top, blurred on scroll). Scroll detection pattern confirmed via `useEffect` + `window.addEventListener('scroll')`. |
| NAV-02 | Navigation typography is clean with proper hierarchy | Current header inline nav links are hardcoded grooming sub-services, not the correct category set. They use the correct token classes (`text-foreground`, `text-sm font-medium`) but the link set and active state use raw `bg-red-50 text-red-600` instead of semantic brand tokens. Typography itself is fine but needs active state alignment with brand tokens. |
| NAV-03 | Category pill navigation row in header (Airbnb-style horizontal scroll with icons) | `service-categories.tsx` + `constants.ts` already define `navigationItems` with `name`, `href`, `icon`, `shortName`. All 6 categories are commented out except grooming. Phase must uncomment all, then render them as a scrollable pill row INSIDE the header (not just in mobile drawer). This is a new row below the main header bar. |
</phase_requirements>

---

## Summary

Phase 2 work is primarily a reorganization and enhancement of the existing navigation layer, not a greenfield build. The codebase already has a well-structured navigation folder (`src/components/navigation/`) with separated concerns: `navigation-header.tsx`, `service-categories.tsx`, `constants.ts`, `user-menu.tsx`, `mobile-menu.tsx`. The orchestrating component is `src/components/navigation.tsx`, which is consumed by `src/components/layout.tsx`.

The current header (`navigation-header.tsx`) already uses `position: fixed` and `backdrop-blur-xl`, but the blur is unconditional — it is always active regardless of scroll position. NAV-01 requires the blur to appear only when the user has scrolled past the top, matching the Airbnb/modern SaaS pattern (transparent at top, frosted glass on scroll). This requires adding a `useScrolled` boolean driven by a `scroll` event listener in the `Navigation` parent or a dedicated hook.

The category pills (NAV-03) already exist as `navigationItems` in `constants.ts` but five of the six categories are commented out. The `ServiceCategories` component renders them in two layouts (mobile grid, desktop grid) but NOT as an inline horizontal pill row within the header. A new scrollable pill row must be built inside the header — a third row below the main bar — using icon images from the `public/` directory and `shortName` labels. The header height will expand from `h-16` to accommodate the new row, and the `pt-16` offset in `layout.tsx` must be updated accordingly.

**Primary recommendation:** Add a `useScrolled` hook, pass the `scrolled` boolean to `NavigationHeader` to conditionally apply `bg-background/80 border-b backdrop-blur-xl`, and add a new `CategoryPillRow` sub-component inside the header that reads from the existing `navigationItems` constant after uncommenting all items.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TailwindCSS v4 | 4.x | Utility classes for sticky, backdrop-blur, overflow-x-auto, scrollbar-hide | Already in project, v4 @utility pattern confirmed used in globals.css |
| React | 19.1.0 | `useState`, `useEffect`, `useRef` for scroll detection | Already in project |
| Next.js Link | 16.x | `<Link href>` for pill navigation | Already in use across navigation files |
| Lucide-react | current | Icon fallback if SVG images unavailable | Already imported in navigation files |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | built-in | Rendering pill icons from `/public/` | Use for the icon images in category pills (already used in service-categories.tsx) |
| cn (clsx+twmerge) | via @/lib/utils | Conditional class merging for scrolled state | Already used in navigation-header.tsx |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native scroll event listener | IntersectionObserver on a sentinel element | Observer is slightly more performant but overkill for a single boolean; scroll listener with passive flag is standard for this case |
| Inline `overflow-x: scroll` | CSS `overflow-x: auto` | Auto hides scrollbar when not needed; pair with `scrollbar-hide` already defined in globals.css |

**Installation:** No new packages required. All dependencies are present.

---

## Architecture Patterns

### Current File Structure

```
src/components/
├── navigation.tsx               # Orchestrator — passes props to sub-components
├── layout.tsx                   # Wraps Navigation + main content + Footer
└── navigation/
    ├── navigation-header.tsx    # The fixed <header> element — primary change target
    ├── service-categories.tsx   # Grid-based category renderer (NOT pill row)
    ├── constants.ts             # navigationItems array — must uncomment all 6 items
    ├── types.ts                 # NavigationItem, NavigationProps interfaces
    ├── user-menu.tsx            # Avatar dropdown
    └── mobile-menu.tsx          # Drawer with ServiceCategories inside
```

### Pattern 1: Scroll-Aware Header (NAV-01)

**What:** Track `window.scrollY > 0` in a boolean state; pass it as a prop to `NavigationHeader`; apply conditional classes.

**When to use:** Any time the header needs to transition between transparent-at-top and frosted-glass-on-scroll.

**Where to put the logic:** In `navigation.tsx` (the orchestrator), not inside `NavigationHeader`. This keeps `NavigationHeader` a pure presentation component.

**Example:**

```typescript
// In src/components/navigation.tsx
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10)
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

```typescript
// In NavigationHeader: apply classes conditionally
<header
  className={cn(
    "fixed top-0 z-50 w-full transition-all duration-300",
    scrolled
      ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
      : "bg-transparent"
  )}
>
```

**Key detail:** The `transition-all duration-300` ensures the blur/border fade in smoothly. Without it, the header pops abruptly.

### Pattern 2: Horizontal Scrollable Pill Row (NAV-03)

**What:** A `<div>` with `overflow-x-auto scrollbar-hide flex gap-2 px-4` containing pill `<Link>` elements with an icon image and short label.

**Where:** A NEW row within `NavigationHeader`, rendered below the main logo/nav/user-actions row. It should be visible on all breakpoints (mobile shows pills instead of the desktop link nav). On desktop, the inline service sub-type links in the current `<nav>` can be removed in favor of this pill row.

**Active state:** Use brand tokens. Current code uses raw `bg-red-50 text-red-600`; replace with `bg-brand-light text-brand` using the existing `--brand` and `--brand-light` CSS variables established in Phase 1.

**Example structure:**

```tsx
{/* Category Pill Row — new second row in header */}
<div className="w-full overflow-x-auto scrollbar-hide border-t border-border/30">
  <div className="flex items-center gap-2 px-4 py-2 min-w-max md:min-w-0 md:justify-center">
    {navigationItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
          pathname === item.href || pathname.includes(item.href.split('?')[0] + '?')
            ? "bg-brand-light text-brand"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Image src={item.icon} alt={item.shortName} width={18} height={18} />
        {item.shortName}
      </Link>
    ))}
  </div>
</div>
```

### Pattern 3: Header Height Accounting

**What:** The `layout.tsx` uses `pt-16` to offset the fixed header. Once a second row is added, `pt-16` must increase.

**Measurement:**
- Row 1: `h-16` (64px) — logo + nav + user actions
- Row 2: ~`h-10` or `h-11` (40–44px) — pill row with py-2 padding

**Updated offset:** `pt-[108px]` or simply use a CSS variable approach. The simplest reliable approach for this project: change `pt-16` to `pt-28` (112px) or use a specific value. A CSS custom property `--header-height` set in the header element is the cleanest approach but adds complexity. For this phase, use a fixed value.

**Alternative:** Define `--nav-height` in globals.css as a CSS variable, set it on `<html>`, and use `mt-[var(--nav-height)]` in layout. This avoids magic numbers. Medium complexity, good for maintainability.

### Anti-Patterns to Avoid

- **Always-on blur:** The current `backdrop-blur-xl` with no condition is visually cluttered on pages with light/white backgrounds at the top. Always apply blur conditionally on scroll.
- **Hardcoded service sub-type links:** The current nav has 5 grooming sub-types hardcoded inline in `navigation-header.tsx`. This should be removed in favor of the generic category pill row. The pill row navigates to `/search?category=X`, not sub-types.
- **Raw red color tokens in active state:** `bg-red-50 text-red-600` bypass the semantic token system established in Phase 1. Use `bg-brand-light text-brand` consistently.
- **Uncommenting constants without enabling translations:** The `navigationItems` in `constants.ts` uses `t('landing.hero.categories.X')` for names. All 6 translation keys are confirmed present in `src/lib/translations.ts` (lines 682-687). Simply uncommenting the items is safe.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll detection | Custom scroll throttle/debounce | Native `passive: true` scroll event with simple boolean flip | Passive listeners are non-blocking; debounce adds latency to the blur transition |
| Horizontal scroll container | Custom JS drag-to-scroll | CSS `overflow-x-auto` + `scrollbar-hide` | Already defined in globals.css; works on mobile touch natively |
| Active link detection | Custom route matching | `usePathname()` already imported in navigation-header.tsx | Just use `pathname.includes(item.href)` or `pathname.startsWith()` |

**Key insight:** The heavy lifting (scroll listener, overflow scroll, pathname matching) is already available via platform primitives. The entire phase is CSS class changes + uncommenting existing data.

---

## Common Pitfalls

### Pitfall 1: Header Height Mismatch After Adding Pill Row

**What goes wrong:** Adding a second row to the header without updating `pt-16` in `layout.tsx` causes page content to slide under the header.

**Why it happens:** `layout.tsx` hardcodes `pt-16` (64px = h-16) which exactly matches the current single-row header height.

**How to avoid:** After measuring the final rendered pill row height, update the `pt-*` value in `layout.tsx`. Also check if any pages have their own top padding that might double-stack.

**Warning signs:** Content starts behind the header on scroll. Check on the landing page, search page, and provider detail page.

### Pitfall 2: Pill Row Breaks Two-Row Layout on Mobile

**What goes wrong:** On narrow viewports, a `min-w-max` pill row that's wider than the viewport causes horizontal page scroll (not just the pill container scroll).

**Why it happens:** If the pill row `<div>` doesn't properly constrain its width, overflow leaks to the `<body>`.

**How to avoid:** The outer `<div>` must have `w-full overflow-x-auto` and the inner container should use `min-w-max` only on the flex row child, not the outer wrapper. Add `overflow-x: hidden` on the outer div if needed.

**Warning signs:** Horizontal scroll bar appears on the entire page, not just the pill area.

### Pitfall 3: SSR Hydration Mismatch on `scrolled` State

**What goes wrong:** `scrolled` is initialized as `false` on both server and client, but if the page is already scrolled when JS hydrates (e.g., browser restores scroll position), the header flashes from transparent to blurred.

**Why it happens:** Initial render is always `scrolled = false`. After hydration, the scroll listener fires only on next scroll.

**How to avoid:** In `useEffect`, check `window.scrollY` immediately on mount: `setScrolled(window.scrollY > 10)`. This initializes from actual scroll position.

```typescript
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10)
  handleScroll() // Initialize from current scroll position
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

**Warning signs:** Header briefly shows transparent then snaps to blurred on page reload when scrolled down.

### Pitfall 4: `isMounted` Guard Causes Flash

**What goes wrong:** The current `navigation.tsx` returns `null` until `isMounted === true`. This means the entire header is absent during SSR and initial paint, causing a layout shift when it appears.

**Why it happens:** The `isMounted` guard was added to prevent hydration mismatches from `useDeviceDetection`. Adding scroll-based state compounds this.

**How to avoid:** Keep the `isMounted` guard as-is (it's a pre-existing pattern). The `scrolled` state defaults to `false` (transparent header), which is visually safe before hydration. Do NOT try to remove the `isMounted` guard in this phase.

### Pitfall 5: Active State Detection on Category Pills

**What goes wrong:** `pathname.includes(item.href)` where `item.href = '/search?category=grooming'` will not match because `usePathname()` in Next.js App Router returns only the path segment, NOT the query string.

**Why it happens:** Next.js `usePathname()` returns `/search`, not `/search?category=grooming`.

**How to avoid:** Use `useSearchParams()` to read the `category` param separately, or use `usePathname()` + check the URL with `new URLSearchParams(window.location.search)`. For simplicity: extract the path from `item.href` and compare that; then also check query params.

```typescript
// Correct active state check
const searchParams = useSearchParams()
const isActive = (item: NavigationItem) => {
  const [path, query] = item.href.split('?')
  if (pathname !== path) return false
  if (!query) return true
  const params = new URLSearchParams(query)
  return [...params.entries()].every(([k, v]) => searchParams.get(k) === v)
}
```

**Warning signs:** No pill ever shows active even when on the correct search page.

---

## Code Examples

### Scroll-Aware Header Complete Pattern

```typescript
// In src/components/navigation.tsx
// Source: React docs + Next.js App Router patterns

'use client'
import { useState, useEffect } from 'react'
// ...existing imports...

export default function Navigation({ hideServiceCategories = false, onFiltersClick }: NavigationProps) {
  // ...existing state...
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll() // Initialize from current scroll position on mount
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ...rest of component...

  return (
    <>
      <NavigationHeader
        scrolled={scrolled}
        // ...existing props...
      />
      {/* ... */}
    </>
  )
}
```

### NavigationHeader Conditional Classes

```typescript
// In src/components/navigation/navigation-header.tsx
// Source: TailwindCSS v4 docs + project globals.css patterns

<header
  className={cn(
    "fixed top-0 z-50 w-full transition-all duration-300",
    scrolled
      ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
      : "bg-transparent"
  )}
>
```

### Category Pill with Correct Active Detection

```typescript
// Source: Next.js App Router useSearchParams hook
'use client'
import { usePathname, useSearchParams } from 'next/navigation'

// Inside component:
const pathname = usePathname()
const searchParams = useSearchParams()

const isActive = (item: NavigationItem) => {
  const [itemPath, itemQuery] = item.href.split('?')
  if (pathname !== itemPath) return false
  if (!itemQuery) return true
  const params = new URLSearchParams(itemQuery)
  return [...params.entries()].every(([k, v]) => searchParams.get(k) === v)
}
```

### Uncommenting All Category Items in constants.ts

```typescript
// All 6 items, all translation keys verified present in src/lib/translations.ts
export const navigationItems: NavigationItem[] = [
  {
    name: t('landing.hero.categories.grooming'),
    href: '/search?category=grooming',
    icon: '/Animal_Care_Icon Background Removed.png',
    shortName: 'Kirpyklos'
  },
  {
    name: t('landing.hero.categories.training'),
    href: '/search?category=training',
    icon: '/Pet_Training_Icon Background Removed.png',
    shortName: 'Dresūra'
  },
  {
    name: t('landing.hero.categories.boarding'),
    href: '/search?category=boarding',
    icon: '/Pets_Pairing_Icon Background Removed.png',
    shortName: 'Poravimas'
  },
  {
    name: t('landing.hero.categories.veterinary'),
    href: '/search?category=veterinary',
    icon: '/Pet_Veterinary_Icon Background Removed.png',
    shortName: 'Veterinarijos'
  },
  {
    name: t('landing.hero.categories.adoption'),
    href: '/search?category=adoption',
    icon: '/Pet_Ads_Icon Background Removed.png',
    shortName: 'Veislynai'
  },
]
// NOTE: 'sitting' category exists in translations.ts but has no icon or shortName in constants.ts
// and no entry in the commented-out block — omit for now or add with a fallback icon
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Always-on frosted glass header | Scroll-conditional: transparent at top, blur on scroll | Modern SaaS pattern (2022+) | Less visual noise at top of page, header "appears" as user scrolls |
| Page-level scroll detection with debounce | Passive scroll event listener (`{ passive: true }`) | 2016+ browser standard | Zero frame blocking; browser handles scroll on compositor thread |
| Custom scrollbar CSS | `scrollbar-hide` utility | Already in this project's globals.css | Clean: hides scrollbar visually but keeps scroll functionality |

**Deprecated/outdated:**
- `overflow-x: scroll` (always shows scrollbar): use `overflow-x-auto` + `scrollbar-hide` instead.
- `transform: translate3d(0,0,0)` GPU hacks for sticky: not needed with modern `position: fixed`.

---

## Existing Code: Key Facts for Planner

These facts directly constrain plan design:

1. **Header currently has `backdrop-blur-xl` unconditionally** — it must be made conditional. The class `backdrop-blur-xl` stays but moves inside the `scrolled` branch.

2. **`navigation.tsx` already has `isMounted` guard returning `null`** — scroll listener setup must be inside `useEffect` alongside the existing mount effect, or combined with it.

3. **`NavigationHeader` receives props from `navigation.tsx`** — adding `scrolled: boolean` to `NavigationHeaderProps` is the correct place.

4. **`constants.ts` has all 6 category items commented out except grooming** — uncomment is low-risk since all translation keys (`landing.hero.categories.*`) are verified present in `src/lib/translations.ts`.

5. **`layout.tsx` hardcodes `pt-16`** — must be updated when the pill row is added. Only one location to update.

6. **`ServiceCategories` component exists but renders as grid, not pill row** — it is NOT the right component to reuse for the header pill row. Build a new `CategoryPillRow` sub-component inside `navigation-header.tsx` or as a separate `category-pill-row.tsx` in the navigation folder.

7. **Active state currently uses `bg-red-50 text-red-600`** — replace with `bg-brand-light text-brand` to use the Phase 1 brand tokens.

8. **Desktop nav currently shows hardcoded grooming sub-service links** — these are NOT the category pills. They should be removed when the category pill row is added.

9. **`useSearchParams()` is needed for accurate active detection on category pills** — Next.js `usePathname()` alone does not include query params.

10. **The `scrollbar-hide` CSS class is already defined in `globals.css`** — use it directly on the pill row container.

---

## Open Questions

1. **Header height after pill row addition**
   - What we know: Current header is exactly `h-16` (64px). `layout.tsx` uses `pt-16`.
   - What's unclear: The exact rendered height of the pill row depends on final padding/icon sizing choices.
   - Recommendation: Plan should specify the planner measures and sets the exact value, then updates `pt-*` in `layout.tsx`. A safe estimate is `pt-28` (112px = 64 + 48) but this must be verified after implementation.

2. **Sitting category in pills**
   - What we know: `sitting` has translation in `translations.ts` but no icon file or entry in the commented-out `navigationItems` block in `constants.ts`.
   - What's unclear: Whether a sitting/pet-sitting icon file exists in `/public/`.
   - Recommendation: Planner should check `/public/` for a sitting icon. If none exists, omit `sitting` from the pill row for now. The 5 available categories are sufficient for NAV-03.

3. **Mobile: pill row vs. bottom navigation**
   - What we know: `MobileBottomNav` exists and provides bottom navigation for mobile. The pill row is needed per NAV-03 in the header.
   - What's unclear: Whether showing category pills in the header on mobile creates redundancy with `MobileBottomNav`.
   - Recommendation: Show the pill row on all breakpoints as required by NAV-03 ("visible in the header"). The mobile menu drawer already has `ServiceCategories` as a grid — the pill row in the header is separate and additive.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `src/components/navigation/navigation-header.tsx` (confirmed current classes, props interface)
- Direct codebase inspection — `src/components/navigation/constants.ts` (confirmed 6 items, 5 commented out)
- Direct codebase inspection — `src/components/navigation/service-categories.tsx` (confirmed grid layout, not pill layout)
- Direct codebase inspection — `src/components/navigation.tsx` (confirmed `isMounted` guard, prop flow)
- Direct codebase inspection — `src/components/layout.tsx` (confirmed `pt-16` offset)
- Direct codebase inspection — `src/app/globals.css` (confirmed `scrollbar-hide`, `--brand`, `--brand-light` tokens)
- Direct codebase inspection — `src/lib/translations.ts` (confirmed all 6 `landing.hero.categories.*` keys present)

### Secondary (MEDIUM confidence)

- Next.js App Router docs pattern: `usePathname()` returns path only, not query string — standard behavior documented at nextjs.org/docs
- Native scroll event with `{ passive: true }` — standard browser API, widely documented

### Tertiary (LOW confidence)

- Header height offset estimate of `pt-28` — derived from known `h-16` + estimated `h-10-h-12` pill row; exact value requires measurement after render.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools confirmed present in project; no new dependencies
- Architecture: HIGH — all components directly inspected; patterns verified in existing code
- Pitfalls: HIGH — most derived from direct code inspection; SSR/hydration pitfalls from known Next.js App Router behavior
- Open questions: LOW — genuinely unknown without rendering; manageable during implementation

**Research date:** 2026-02-23
**Valid until:** 2026-04-23 (stable domain — Next.js App Router scroll patterns, TailwindCSS v4 utilities)
