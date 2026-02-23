# Stack Research

**Domain:** UI Modernization — Pet Service Marketplace (TailwindCSS 4 + shadcn/ui + Framer Motion)
**Researched:** 2026-02-23
**Confidence:** HIGH (primary sources: official TailwindCSS v4 docs, shadcn/ui changelog, motion.dev docs)

---

## Context

This is a **subsequent milestone** — modernizing the UI of an existing Next.js 16 + TailwindCSS 4 + shadcn/ui + Framer Motion 12 application. The stack is already installed. This research focuses on the right patterns to use within the existing stack, not on adding new dependencies.

The target aesthetic is clean and minimal, Airbnb/AllTrails-inspired: generous whitespace, strong typography hierarchy, image-led cards, clear visual rhythm, and subtle motion that reinforces interaction without distracting.

---

## Recommended Stack

### Core Technologies (Already Installed)

| Technology | Version in Use | Purpose | Status |
|------------|----------------|---------|--------|
| TailwindCSS | ^4 | Utility-first styling with CSS-first config | Use `@theme` directive — not `tailwind.config.js` |
| shadcn/ui | Latest (Dec 2025) | Accessible, unstyled-at-core components with CVA variants | Customize via CSS variables, not component source edits |
| Framer Motion | ^12.23.12 | Declarative animation with layout, gesture, and scroll support | Use `motion/react` import (v12 package rename) |
| class-variance-authority | ^0.7.1 | Type-safe component variant system | Keep using for all shadcn/ui customizations |
| tailwind-merge | ^3.3.1 | Merge conflicting Tailwind classes safely | Always use via `cn()` utility |

### No New Libraries Needed

The existing stack covers everything required for the modernization goal. Adding libraries would increase bundle size without benefit. The patterns below are the answer — not new dependencies.

---

## TailwindCSS 4 Patterns

### 1. Use `@theme` for All Design Tokens — Not `tailwind.config.js`

**Why:** TailwindCSS v4 is CSS-first. The `tailwind.config.js` file is deprecated for most use cases. The `@theme` directive defines tokens that become both CSS variables AND generate utility classes automatically.

**Pattern:**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Typography scale */
  --font-display: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

  /* Custom spacing beyond defaults */
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;

  /* Brand radius tokens */
  --radius-card: 1rem;
  --radius-pill: 999px;

  /* Custom easing */
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Generated automatically: `rounded-card`, `rounded-pill`, `font-display`, `font-body`.

**Confidence:** HIGH — official TailwindCSS v4 documentation

---

### 2. Use `@theme inline` for CSS Variable References

**Why:** Without `inline`, the utility class resolves to the raw variable name rather than the value. This breaks fonts loaded via `next/font` and any runtime CSS variables.

**Pattern:**
```css
/* Connects next/font CSS variables to Tailwind utilities */
@theme inline {
  --font-sans: var(--font-inter);
  --font-display: var(--font-inter);
}
```

This means `font-sans` and `font-display` will use the Inter variable injected by `next/font/google` at runtime.

**Confidence:** HIGH — verified in official TailwindCSS v4 docs

---

### 3. OKLCH Color Space for All Custom Colors

**Why:** TailwindCSS v4 ships its entire default palette in OKLCH, which is perceptually uniform (equal perceived brightness across hues) and supports the P3 wide-gamut display that most modern screens use. Mixing OKLCH custom colors with v4 defaults avoids the visual discontinuity that happened when you mixed HSL/RGB custom colors with the old v3 palette.

**Pattern:**
```css
@theme {
  /* Preserve brand hue, express in OKLCH */
  --color-brand-50:  oklch(0.97 0.02 240);
  --color-brand-500: oklch(0.55 0.18 240);
  --color-brand-900: oklch(0.25 0.10 240);
}
```

Use the [OKLCH picker](https://oklch.com/) to convert existing hex values. Keep the hue (H) constant across shades; vary lightness (L) and chroma (C).

**Confidence:** HIGH — verified in TailwindCSS v4 blog and theme docs

---

### 4. Avoid `@apply` — Use Explicit CSS or Component Abstractions

**Why:** The TailwindCSS team now explicitly recommends against `@apply` for component styles in v4. It breaks IDE autocomplete, adds build complexity, and fights the CSS cascade. Component-based frameworks like React make `@apply` unnecessary — extract a component instead.

**What to do instead:**

- **For repeated visual patterns** → Extract a React component with the classes inline
- **For global base styles** → Use `@layer base` with standard CSS properties and CSS variables
- **For one-off overrides** → Use arbitrary values: `w-[342px]`, `bg-[oklch(0.97_0.02_240)]`

**Confidence:** MEDIUM — from TailwindCSS team discussions and multiple 2025 best practice sources; the official docs still document `@apply` but community consensus is moving away from it

---

### 5. Container Queries for Component-Level Responsiveness

**Why:** Built into TailwindCSS v4 (no plugin needed). Provider cards need to adapt to their container width — a card in a 2-column grid needs different typography sizing than the same card in a 4-column grid. Container queries solve this without JavaScript.

**Pattern:**
```tsx
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-6">
    {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
  </div>
</div>

// Inside ProviderCard:
<div className="@container">
  <h3 className="text-base @sm:text-lg font-semibold">{name}</h3>
</div>
```

**Confidence:** HIGH — container queries are first-party in TailwindCSS v4

---

### 6. Spacing System: 4px Base Unit, Deliberate Scale

**Why:** Airbnb's visual success is largely about spacing. Their system uses a 4px base unit with a limited set of values (`4, 8, 12, 16, 24, 32, 48, 64`) — not arbitrary `p-3`, `p-7`, `p-11`. Limiting the palette reduces cognitive load during development and creates consistent visual rhythm.

**Recommended spacing vocabulary for this project:**

| Token | Value | Use |
|-------|-------|-----|
| `p-3` / `gap-3` | 12px | Tight internal spacing (icon + label, badge padding) |
| `p-4` / `gap-4` | 16px | Standard internal component padding |
| `p-6` / `gap-6` | 24px | Card padding, section internal spacing |
| `p-8` / `gap-8` | 32px | Between major sections within a page block |
| `p-12` / `gap-12` | 48px | Section separators |
| `p-16` / `gap-16` | 64px | Hero / top-level page sections |

**Avoid:** `p-5`, `p-7`, `p-9`, `p-11` — these break visual rhythm.

**Confidence:** MEDIUM — derived from Airbnb spacing analysis and marketplace UI best practices

---

### 7. Typography: Two Weights, Clear Size Jumps

**Why:** Airbnb uses Inter (or similar geometric sans-serif) with primarily two weights — regular (400) and semibold (600) — plus size jumps that are large enough to signal hierarchy. Subtle size differences (e.g., 14px vs 15px) read as visual noise, not hierarchy.

**Recommended typography scale:**

```css
/* Text hierarchy for provider cards and pages */
/* Hero/Page title */  text-4xl font-bold tracking-tight leading-tight
/* Section heading */ text-2xl font-semibold
/* Card title */      text-lg font-semibold
/* Body primary */    text-base font-normal text-foreground
/* Body secondary */  text-sm font-normal text-muted-foreground
/* Labels/Tags */     text-xs font-medium tracking-wide uppercase
```

**Confidence:** MEDIUM — from Airbnb design system analysis and UX typography best practices

---

### 8. Avoid Dynamic Class Name Construction

**Why:** TailwindCSS v4 (like v3) requires that full class names appear as literal strings in source files for the JIT scanner to include them. Dynamic construction causes classes to vanish in production.

**Wrong:**
```tsx
// NEVER do this
const size = 'lg'
<div className={`text-${size}`}>  // text-lg will NOT be in production CSS
```

**Right:**
```tsx
const sizeMap = { sm: 'text-sm', lg: 'text-lg' }
<div className={sizeMap[size]}>  // Full string literals, always included
```

**Confidence:** HIGH — documented TailwindCSS v4 behavior

---

## shadcn/ui Customization Patterns

### 1. Customize via CSS Variables, Not Component Source Files

**Why:** shadcn/ui components are copied into your repo on install — they're yours to modify. But editing component source directly makes future updates painful. The right approach is to customize through the CSS variable layer that components already consume. This way, all components update visually from one place.

**Pattern:**
```css
/* globals.css */
@layer base {
  :root {
    /* Override shadcn defaults for this project's brand */
    --radius: 0.75rem;              /* Slightly more rounded than default */
    --background: oklch(1 0 0);     /* Pure white */
    --foreground: oklch(0.13 0.02 264);  /* Near-black with slight blue */
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.13 0.02 264);
    --primary: oklch(0.55 0.18 240);      /* Brand blue */
    --primary-foreground: oklch(1 0 0);
    --muted: oklch(0.96 0.005 264);       /* Off-white backgrounds */
    --muted-foreground: oklch(0.50 0.02 264);  /* Secondary text */
    --border: oklch(0.92 0.005 264);      /* Light borders */
  }
}
```

All `Button`, `Card`, `Badge`, `Input`, etc. automatically inherit these. No component edits needed.

**Confidence:** HIGH — shadcn/ui official theming documentation

---

### 2. CVA for Variant Extension

**Why:** When the default shadcn/ui component variants don't match your design, add new variants via CVA rather than creating parallel components. This keeps the variant system composable.

**Pattern — adding a `soft` button variant:**
```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground ...",
        outline: "border border-input bg-background ...",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // ADD: soft variant — colored background, no border
        soft: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        // ADD: xl size for hero CTAs
        xl: "h-14 px-8 text-lg font-semibold rounded-xl",
      }
    }
  }
)
```

**Confidence:** HIGH — shadcn/ui uses CVA as its documented customization primitive

---

### 3. Semantic Token Layer Over shadcn Defaults

**Why:** shadcn/ui's variable names (`--primary`, `--card`, etc.) are semantic but limited. For a marketplace with distinct visual regions (hero, search area, cards, footer), you need a second semantic layer that maps to shadcn variables.

**Pattern:**
```css
@layer base {
  :root {
    /* shadcn base variables above */

    /* Project-specific semantic tokens */
    --surface-raised: oklch(1 0 0);           /* Card backgrounds */
    --surface-sunken: oklch(0.97 0.005 264);  /* Input bg, code blocks */
    --surface-overlay: oklch(1 0 0 / 0.85);   /* Modals, drawers */

    --text-primary: var(--foreground);
    --text-secondary: var(--muted-foreground);
    --text-disabled: oklch(0.65 0.01 264);

    --interactive-hover: oklch(0.97 0.01 240);  /* Subtle card hover */
    --interactive-active: oklch(0.93 0.02 240); /* Pressed state */
  }
}
```

Then use these in custom components: `bg-[var(--surface-raised)]` or expose via `@theme inline`.

**Confidence:** MEDIUM — pattern derived from Airbnb DLS documentation and shadcn/ui design token discussions

---

### 4. New shadcn/ui Components to Use in 2025

The following were added in 2025 and are directly relevant to the modernization:

| Component | Added | Use Case |
|-----------|-------|----------|
| `Spinner` | Oct 2025 | Loading states in cards during fetch |
| `Item` | Oct 2025 | Provider feature lists, amenity lists |
| `Empty` | Oct 2025 | Empty search results state |
| `Field` | Oct 2025 | Complex form fields in booking flow |
| Sidebar blocks (Radix variant) | Feb 2026 | Provider dashboard sidebar if needed |

**Confidence:** HIGH — shadcn/ui official changelog

---

### 5. Do Not Edit Radix Primitives Directly

**Why:** shadcn/ui is built on Radix UI primitives. The primitives handle all accessibility (keyboard nav, ARIA, focus management). Editing them directly risks breaking WCAG compliance without obvious symptoms. Style through CSS variables or shadcn's own variant system only.

**Confidence:** HIGH — shadcn/ui documentation and architecture

---

## Framer Motion 12 Patterns

### 1. Import from `motion/react` (v12 Package Rename)

**Why:** In Framer Motion v11+, the package was renamed from `framer-motion` to `motion`. The `framer-motion` package still works as an alias but `motion/react` is the canonical import.

```tsx
// Preferred in Motion v12
import { motion, AnimatePresence } from 'motion/react'

// Still works (alias)
import { motion, AnimatePresence } from 'framer-motion'
```

**Confidence:** MEDIUM — from motion.dev package docs; verify against installed version `^12.23.12`

---

### 2. Card Entrance: Stagger with `whileInView`

**Why:** Staggered card entrances communicate a list loading progressively, reducing perceived wait time. `whileInView` means the animation triggers when the card enters the viewport — not on page load — so users see it even when they scroll to a section.

**Pattern — provider card grid:**
```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,  // 80ms between cards — subtle, not theatrical
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
  }
}

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
>
  {providers.map(p => (
    <motion.div key={p.id} variants={cardVariants}>
      <ProviderCard provider={p} />
    </motion.div>
  ))}
</motion.div>
```

**Why `once: true`:** Repeating entrance animations on scroll-back feel buggy and cheap. Once is the Airbnb/AllTrails pattern.
**Why `y: 16` not `y: 40`:** Large Y offsets look like loading spinners, not polish. 16px is noticeable but not theatrical.

**Confidence:** HIGH — from official motion.dev stagger and whileInView documentation

---

### 3. Card Hover: `whileHover` with Subtle Lift

**Why:** Cards in marketplace UIs need hover feedback to signal interactivity. The Airbnb pattern is a very subtle shadow increase + scale — not a dramatic transform. Exaggerated hover effects look like early 2010s web design.

**Pattern:**
```tsx
<motion.div
  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  className="rounded-card bg-card cursor-pointer"
>
  {/* card content */}
</motion.div>
```

Keep `y` at `-2` to `-4` max. Avoid `scale` on cards — it causes layout shift.

**Confidence:** MEDIUM — from marketplace UI analysis and motion.dev docs

---

### 4. Layout Animations for Filtering and Sorting

**Why:** When the user filters providers (by service type, location, rating), cards need to reposition smoothly. Without layout animations, the grid snaps — which feels broken. With `layout` prop, Framer Motion uses FLIP under the hood to animate position changes using `transform` (GPU-accelerated, no reflow).

**Pattern:**
```tsx
<motion.div
  layout
  layoutId={`provider-card-${provider.id}`}
  key={provider.id}
  variants={cardVariants}
  className="..."
>
  <ProviderCard provider={provider} />
</motion.div>
```

**`layout="position"` optimization:** If cards don't change size when filtered, use `layout="position"` to skip size recalculation.

**Confidence:** HIGH — official motion.dev layout animation documentation

---

### 5. Page Transitions: Minimal Opacity Fade Only

**Why:** In Next.js App Router, full-page layout animations are complex and can conflict with RSC streaming. The pragmatic 2025 approach for App Router is a simple opacity fade on the `<main>` content wrapper — not slide transitions or complex shared element transitions. The goal is "feels smooth" not "feels cinematic."

**Pattern — in the root layout:**
```tsx
// app/layout.tsx
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
>
  {children}
</motion.main>
```

**Do not use** `AnimatePresence` with App Router pages for now — it requires careful coordination with Next.js navigation that adds complexity without proportionate benefit.

**Confidence:** MEDIUM — from multiple Next.js + Framer Motion 2025 integration guides; App Router transitions are genuinely complex

---

### 6. Performance: Animate Only `opacity` and `transform`

**Why:** Animating `width`, `height`, `top`, `left`, or `padding` triggers browser layout recalculation on every frame — this causes jank even on powerful hardware. The GPU can animate `opacity` and `transform` (translate, scale, rotate) without CPU involvement.

**Rules:**
- Entrances: `opacity` + `translateY`
- Hovers: `translateY` + `boxShadow` (boxShadow is not GPU-accelerated but is fast enough for hover)
- Layout shifts: use `layout` prop (Framer handles FLIP internally with transform)
- Never animate: `width`, `height`, `margin`, `padding`, `left`, `top`

**Confidence:** HIGH — web performance fundamentals, documented in motion.dev performance guide

---

### 7. `AnimatePresence` for Conditional UI: Modals, Drawers, Empty States

**Why:** React unmounts components instantly. `AnimatePresence` keeps a component in the DOM until its exit animation completes, enabling smooth fade/slide-out for modals, mobile drawers, and empty state transitions.

**Pattern:**
```tsx
<AnimatePresence mode="wait">
  {isModalOpen && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

`mode="wait"` ensures the exiting component completes before the entering component starts — prevents overlap flash.

**Confidence:** HIGH — official AnimatePresence documentation

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `tailwind.config.js` for new tokens | Deprecated in TailwindCSS v4; creates dual config burden | `@theme` directive in CSS |
| `@apply` for component styles | Fights the cascade, breaks IDE autocomplete, not recommended by Tailwind team in v4 | Inline utilities in JSX or standard CSS with variables |
| Glassmorphism (`backdrop-blur` + heavy transparency) | Trendy in 2022, now signals outdated design; performs poorly on non-GPU paths | Subtle drop shadows, clean opaque backgrounds |
| Dramatic scale hover on cards (`scale: 1.05+`) | Causes layout shift, feels dated; not the Airbnb aesthetic | Subtle `y: -2` lift with shadow |
| Slide-in page transitions in App Router | Complex, conflicts with RSC streaming, feels heavy | Simple opacity fade |
| `framer-motion` import (old name) | `motion/react` is canonical in v12 | `import { motion } from 'motion/react'` |
| Index keys (`key={i}`) in lists | Breaks React reconciliation, known issue in codebase (28+ instances) | Unique entity IDs |
| `any` types for component props | Known audit issue; breaks TypeScript value; 28+ instances in current code | Typed interfaces |
| `GSAP` or additional animation libraries | Bundle cost with no benefit — Framer Motion covers all patterns needed | Keep using Framer Motion |

---

## Design Patterns by Feature Area

### Provider Cards (Priority 1)
- Image-led: photo at top, 16:9 or 3:2 ratio, `object-cover`
- One primary CTA visible without scroll (`rounded-pill` shape, brand color)
- Three data points max below fold: rating, price, distance/location
- Hover: `y: -2` lift + shadow deepening
- Entrance: stagger via `whileInView` variants

### Search/Browse Page (Priority 1)
- Sticky filter bar below nav — `sticky top-16 z-10 bg-background/95 backdrop-blur-sm`
- Results grid: 1 col mobile → 2 col tablet → 3 col desktop (container queries for card-level adaptation)
- Map panel: side-by-side on desktop, toggleable overlay on mobile
- No glassmorphism on map controls — use clean opaque cards with shadows

### Landing Page (Priority 1)
- Hero: full-viewport-height, single headline, single CTA, background image or subtle gradient
- Category strip: horizontal scroll on mobile, grid on desktop
- Featured providers: 3-4 cards with entrance stagger
- Trust signals: simple icon + text rows, not heavy card layouts

### Navigation
- Sticky with `bg-background/95 backdrop-blur-sm border-b border-border`
- The blur is acceptable here (small area, never directly over scrolling content)
- Mobile: full-width drawer via `vaul` (already installed)

---

## Typography Implementation

```css
/* globals.css — with next/font integration */
@theme inline {
  --font-sans: var(--font-inter);    /* Injected by next/font */
}

@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 { @apply text-4xl font-bold tracking-tight leading-tight; }
  h2 { @apply text-2xl font-semibold tracking-tight; }
  h3 { @apply text-lg font-semibold; }
}
```

Note: This is one of the few valid `@apply` uses — base HTML element reset styles that don't correspond to a React component.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `tailwindcss` | ^4 | `@tailwindcss/postcss` | PostCSS config required; no `vite` plugin (uses Next.js PostCSS) |
| `framer-motion` / `motion` | ^12.23.12 | React 19, Next.js 16 | Both import paths work; `motion/react` is canonical |
| `shadcn/ui` components | Dec 2025 | Radix UI primitives (existing) | New components (Spinner, Item, Empty) installable via CLI |
| `class-variance-authority` | ^0.7.1 | shadcn/ui, custom variants | No changes needed |
| `next-themes` | ^0.4.6 | React 19 | Dark mode support already wired |

---

## Installation

No new packages are required. If new shadcn components are needed:

```bash
# Add new shadcn/ui components as needed
npx shadcn@latest add spinner
npx shadcn@latest add empty
npx shadcn@latest add item
```

---

## Sources

- [TailwindCSS v4.0 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH confidence, official release notes
- [TailwindCSS v4 Theme Variables Docs](https://tailwindcss.com/docs/theme) — HIGH confidence, official docs
- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming) — HIGH confidence, official docs
- [shadcn/ui Changelog — Oct/Dec 2025, Feb 2026](https://ui.shadcn.com/docs/changelog) — HIGH confidence, official changelog
- [motion.dev React Animation](https://motion.dev/docs/react-animation) — HIGH confidence, official Motion v12 docs
- [motion.dev Stagger](https://motion.dev/docs/stagger) — HIGH confidence, official docs
- [Frontendtools.tech — Tailwind v4 Best Practices 2025](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) — MEDIUM confidence, verified against official docs
- [Airbnb Spacing Analysis — Medium](https://medium.com/@kvividsnaps/airbnbs-use-of-spacing-creates-a-calm-ui-d04be85dc3e4) — MEDIUM confidence, design analysis
- [TailwindCSS v4 Best Practices — bootstrapdash](https://www.bootstrapdash.com/blog/tailwind-css-best-practices) — MEDIUM confidence, community source

---

*Stack research for: Petify UI Modernization (TailwindCSS 4 + shadcn/ui + Framer Motion)*
*Researched: 2026-02-23*
