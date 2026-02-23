# Phase 1: Foundation - Research

**Researched:** 2026-02-23
**Domain:** Codebase cleanup, design tokens, TypeScript type safety
**Confidence:** HIGH — all findings are based on direct codebase inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Color palette direction**: Warm grays throughout — slightly warm/beige undertones (Airbnb-like warmth). Primary accent: teal/green. Minimal color usage — accent only on CTAs, active states, key interactive elements. Token system must support both light and dark mode from day one.
- **ProviderCard unification**: Image-dominant layout (large photo ~60% of card, info below). Full details on every card: name, rating, review count, starting price, location, service tags, verified badge. No-photo fallback: friendly pet-themed placeholder illustration. Two variants: full grid card and compact horizontal — one component with a `variant` prop.

### Claude's Discretion

- Exact warm gray hex values and token naming conventions
- Design token granularity and CSS variable structure
- Which specific dead components to delete (audit determines this)
- Chat component consolidation approach
- TypeScript interface design for booking types
- Dark mode token values (light mode is primary, dark mode should work but doesn't need to be pixel-perfect yet)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLEAN-01 | Dead components (13+ confirmed unused) deleted from codebase | Audit identified 8 confirmed dead components; see Dead Component Inventory below |
| CLEAN-02 | Chat components consolidated from 8 down to 2 (ChatButton + ChatDialog) | 8 chat files identified; ChatButton + ChatDialog are the canonical pair; 6 can be deleted with migration work |
| CLEAN-03 | `listings-grid.tsx` inline card unified with `provider-card.tsx` into one canonical ProviderCard | Both files exist with divergent implementations; listings-grid has its own inline card JSX; unification requires new variant prop on ProviderCard |
| CLEAN-04 | Raw Tailwind gray classes replaced with semantic design tokens | 1,275 occurrences across 130 files (component directory alone: ~850); token mapping documented below |
| CLEAN-05 | `booking/types.ts` `any` types replaced with proper interfaces from `src/types/index.ts` | 9 `any` usages in booking/types.ts; named types already exist in src/types/index.ts |
| GLBL-01 | No all-caps headings — uppercase reserved for badges/labels only | `uppercase` class scan shows 0 heading violations — this is a preventive rule + audit pass |
| GLBL-04 | Consistent spacing system applied across all modernized pages | Container audit shows inconsistent: mix of px-4/px-6/px-8 padding and max-w-4xl/max-w-7xl widths; define canonical container token |

</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure phase with no new UI features. The work falls into five distinct work streams: dead component deletion, chat consolidation, ProviderCard unification, gray token replacement, and TypeScript type cleanup. All five are independent of each other and can be executed in any order, though token replacement is highest volume and benefits from tooling.

The codebase uses **TailwindCSS v4** with CSS-only configuration (`@theme inline` in `globals.css` — no `tailwind.config.ts` exists). The design token system is shadcn/ui-based with stone/warm oklch values already set, which aligns perfectly with the warm gray direction. The current `--neutral-*` scale in `@theme inline` uses pure gray hex values and should be replaced with warm gray equivalents. A teal/green accent token does not yet exist and must be added.

The primary risk is the gray token replacement: 1,275 occurrences across 130 files. This cannot be done manually file-by-file; a systematic token mapping table with regex-based substitution is the right approach. The mapping is deterministic (same gray shade → same semantic token in the same context type), making automation safe.

**Primary recommendation:** Execute in this order: (1) dead component deletion (lowest risk, immediate cleanup), (2) TypeScript types (isolated file, low risk), (3) chat consolidation (contained to ui/ folder), (4) ProviderCard unification (requires updating all call sites), (5) gray token replacement (highest volume, most systematic).

---

## Standard Stack

### Core (already installed — no new packages needed for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TailwindCSS | ^4 | Utility-first CSS, design tokens | Already in project; v4 uses CSS-only config via `@theme inline` |
| shadcn/ui | new-york style | Component library with semantic tokens | Already in project; `components.json` configured with stone base color |
| TypeScript | ^5 | Type safety | Already in project |
| React | 19.1.0 | Component framework | Already in project |
| Next.js | ^16 (listed as `^16.0.10`) | App Router | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.542.0 | Icons (including pet/paw icon for placeholder fallback) | Already installed; use for no-photo placeholder icon |
| framer-motion | ^12.23.12 | Already installed | Phase 1 does NOT use animation — deferred to later phases |

### Alternatives Considered

None applicable — this phase uses existing stack only. No new packages required.

**Installation:** No new packages needed for Phase 1.

---

## Architecture Patterns

### TailwindCSS v4 Token System (Project-Specific)

The project uses TailwindCSS v4's **CSS-only configuration** pattern. There is no `tailwind.config.ts`. All tokens are defined in `src/app/globals.css` using:

```css
/* Source: src/app/globals.css — @theme inline block */
@theme inline {
  --color-background: var(--background);
  --color-muted-foreground: var(--muted-foreground);
  /* ... */
}

:root {
  --muted: oklch(0.97 0.001 106.424);
  --muted-foreground: oklch(0.553 0.013 58.071);
  /* ... */
}
```

**To add new tokens** (e.g., teal accent): add CSS variable to `:root` AND register it in `@theme inline`:

```css
/* In @theme inline */
--color-brand: var(--brand);
--color-brand-foreground: var(--brand-foreground);

/* In :root */
--brand: oklch(0.65 0.15 175);        /* teal — ~#14b8a6 territory */
--brand-foreground: oklch(1 0 0);      /* white text on brand */
```

After this, `bg-brand`, `text-brand`, `border-brand` work as utility classes.

### shadcn/ui Semantic Token Mapping

The project already has the full shadcn/ui semantic token set (stone base, warm oklch values). These are the correct replacements for gray utility classes:

| Raw Gray Class | Context | Semantic Replacement | Reasoning |
|----------------|---------|---------------------|-----------|
| `text-gray-900` | Headings, strong text | `text-foreground` | Primary foreground = darkest text |
| `text-gray-800` | Dark body text | `text-foreground` | Same — foreground covers 800-900 range |
| `text-gray-700` | Semi-dark text | `text-foreground` or `text-secondary-foreground` | Use foreground unless lighter tone needed |
| `text-gray-600` | Subdued/meta text (most common: 408 uses) | `text-muted-foreground` | Canonical muted text |
| `text-gray-500` | Placeholder/helper text | `text-muted-foreground` | Same semantic as 600 |
| `text-gray-400` | Disabled/very faint text | `text-muted-foreground` | Accept slight lightness mismatch |
| `text-gray-300` | Very faint (rare) | `text-muted-foreground/60` | Use opacity modifier |
| `bg-gray-50` | Subtle background highlight | `bg-muted` | Canonical subtle background |
| `bg-gray-100` | Light gray background | `bg-muted` | Same |
| `bg-gray-200` | Medium-light background | `bg-muted` or `bg-secondary` | Check visual context |
| `bg-gray-800` | Dark background | `bg-foreground` | Inverted background |
| `border-gray-100` | Very subtle divider | `border-border/50` | Border with reduced opacity |
| `border-gray-200` | Standard divider | `border-border` | Canonical border |
| `border-gray-300` | Stronger divider | `border-border` | Same token, slightly heavier appearance |
| `border-gray-700` | Dark border | `border-foreground/20` | Dark border via opacity |

**High-frequency replacements (cover 80% of volume):**
1. `text-gray-600` (408) → `text-muted-foreground`
2. `text-gray-900` (233) → `text-foreground`
3. `text-gray-500` (190) → `text-muted-foreground`
4. `bg-gray-50` (107) → `bg-muted`
5. `bg-gray-200` (76) → `bg-muted`
6. `text-gray-400` (71) → `text-muted-foreground`
7. `border-gray-200` (66) → `border-border`
8. `text-gray-700` (64) → `text-foreground`
9. `border-gray-300` (44) → `border-border`
10. `bg-gray-100` (40) → `bg-muted`

**Scope:** 130 files, 1,275 total occurrences. Components directory alone has ~850. App pages have the remainder.

**Approach:** Systematic find-and-replace per token, file by file, verifying visual output does not break. Do not blindly regex-replace — some gray usages are intentional dynamic states (e.g., `text-gray-400` on disabled elements where `text-muted-foreground` is correct, but verify context).

### Warm Gray + Teal Token Additions

The current `--neutral-*` scale in `@theme inline` uses pure cool gray hex values. These should be replaced with warm gray equivalents that match the stone/oklch system already in use:

```css
/* Replace the current neutral scale in @theme inline and :root */
/* Current (cool gray): --color-neutral-500: #6b7280 */
/* Replace with warm stone-based oklch equivalents */

/* In @theme inline, these already exist via --color-muted-foreground etc. */
/* The neutral- scale custom vars can be removed if not referenced directly */
```

First, grep for actual usage of `neutral-` custom properties before removing:

```bash
grep -rn "neutral-" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

For the teal/green accent, recommended oklch values aligned with the existing stone-warm system:

```css
/* Teal accent (nature-inspired, calming) */
--brand: oklch(0.65 0.14 174);          /* ~#0d9488 teal-600 territory */
--brand-light: oklch(0.95 0.04 174);    /* ~#f0fdfa teal-50 */
--brand-foreground: oklch(1 0 0);       /* white on brand */

/* Dark mode equivalents */
.dark {
  --brand: oklch(0.72 0.12 174);        /* slightly lighter in dark */
  --brand-foreground: oklch(0.1 0.02 174);
}
```

This gives utility classes: `bg-brand`, `text-brand`, `border-brand`, `bg-brand-light`.

### ProviderCard Unification Pattern

**Current state:**
- `src/components/provider-card.tsx` — full component with Avatar, star rating, description, price range, footer actions (2 buttons + contact row)
- `src/components/listings-grid.tsx` — contains an inline card implementation (lines 100-199) that is Airbnb-style with dominant image, simpler info layout

**Target state (per user decisions):**
- Single `src/components/provider-card.tsx` with `variant` prop: `'grid'` (default, full image-dominant) and `'horizontal'` (compact list view)
- `listings-grid.tsx` removes inline card JSX, imports and uses `ProviderCard` instead

**Migration approach:**
1. Redesign `provider-card.tsx` to implement the image-dominant (Airbnb-style) layout from `listings-grid.tsx` as the default `'grid'` variant
2. Add `'horizontal'` variant for compact list views (new design)
3. Update `listings-grid.tsx` to use `<ProviderCard variant="grid" />` instead of inline JSX
4. The current `provider-card.tsx` has features the inline version lacks: availability status, avatar, experience, action buttons — decide which carry to unified component

**Key decisions for Claude's discretion (ProviderCard):**
- The grid variant should match the Airbnb image-dominant style from `listings-grid.tsx` (per user decision)
- The current `provider-card.tsx` avatar + action buttons approach should be replaced by the simpler image-card pattern
- No-photo fallback should use a pet-themed icon (Lucide's `PawPrint` or `Heart`) in a warm gradient background — not the current emoji approach

### Dead Component Inventory

**CONFIRMED DEAD — safe to delete:**

| File | Reason |
|------|--------|
| `src/components/navigation-search.tsx` | Superseded by `src/components/navigation/navigation-search.tsx`; zero imports |
| `src/components/nav-main.tsx` | Zero imports anywhere |
| `src/components/nav-projects.tsx` | Zero imports anywhere |
| `src/components/nav-secondary.tsx` | Zero imports anywhere |
| `src/components/booking-modal.tsx` | Zero imports anywhere |
| `src/components/mobile-hero-section.tsx` | Zero imports anywhere |
| `src/components/search-results.tsx` | Zero imports anywhere |
| `src/components/pet-ads-section.tsx` | Zero imports anywhere |

**BORDERLINE — review before deleting:**

| File | Situation |
|------|-----------|
| `src/app/test-ai-chat/page.tsx` | Test page, not linked from app navigation |
| `src/app/test-chat-persistence/page.tsx` | Test page, not linked from app navigation |

**NOT DEAD — confirmed used:**
- `nav-user.tsx` — imported by `app-sidebar.tsx` (which is used by admin and provider dashboard layouts)
- `app-sidebar.tsx` — imported by admin layout, provider dashboard layout, and dashboard page
- `category-section.tsx` — imported by `hero-section.tsx` (which IS used by home page)
- `service-slider.tsx`, `provider-slider.tsx` — imported by `category-section.tsx` (live chain)

### Chat Consolidation Plan

**Current 8 chat files:**

| File | Status | Action |
|------|--------|--------|
| `src/components/ui/chat-button.tsx` | KEEP — canonical | Keep, this is ChatButton |
| `src/components/ui/chat-dialog.tsx` | KEEP — canonical | Keep, this is ChatDialog |
| `src/components/ui/ruixen-mono-chat.tsx` | DEPENDENCY — used by ChatDialog | Keep (ChatDialog renders it); it IS part of ChatDialog's implementation |
| `src/components/ui/chat-page.tsx` | USED by /chat and /dashboard/chat routes | Decision needed: keep OR migrate those routes to use ChatButton/ChatDialog |
| `src/components/ui/floating-chat-button.tsx` | Used by providers/[id]/page.tsx | Migrate to ChatButton with appropriate props, then delete |
| `src/components/ui/ai-chat.tsx` | Used by floating-chat-button and ai-chat-button | Delete after floating-chat-button migration |
| `src/components/ui/ai-chat-button.tsx` | Zero external imports | Delete |
| `src/components/ui/chat-demo.tsx` | Zero external imports | Delete |

**Clarification needed on CLEAN-02 scope:**
The requirement says "2 components: ChatButton + ChatDialog." `ruixen-mono-chat.tsx` is `ChatDialog`'s implementation detail (not a separate public component). `chat-page.tsx` is used by actual routes.

**Recommended interpretation:** The 2 *public* components are ChatButton + ChatDialog. Delete ai-chat-button.tsx, chat-demo.tsx, ai-chat.tsx, and floating-chat-button.tsx. Migrate `providers/[id]/page.tsx` to use ChatButton. Keep ruixen-mono-chat.tsx as ChatDialog's private dependency. Keep chat-page.tsx if /chat routes need a full-page chat layout (or migrate those routes too).

### TypeScript `any` Replacement Map

**Current state in `src/components/booking/types.ts`:**

```typescript
// All of these need replacing:
provider: any         → ServiceProvider  (from src/types/index.ts)
services: any[]       → Service[]        (from src/types/index.ts)
pets: any[]           → Pet[]            (from src/types/index.ts)
selectedService: any  → Service | null   (can be null before selection)
onServiceSelect: (service: any) => void  → (service: Service) => void
```

**Named types available in `src/types/index.ts`:**
- `ServiceProvider` — full provider object
- `Service` — service offering
- `Pet` — pet object
- `Booking`, `BookingStatus`, `TimeSlot`, `User`, `Review` — all available

**Updated interfaces:**

```typescript
// src/components/booking/types.ts — target state
import { ServiceProvider, Service, Pet } from '@/types'

export interface BookingStepProps {
  provider: ServiceProvider
  services: Service[]
  pets: Pet[]
  selectedService: Service | null
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  availabilityData: Record<string, unknown> | null
  onServiceSelect: (service: Service) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
  loading?: boolean
}

export interface BookingContextType {
  provider: ServiceProvider
  services: Service[]
  pets: Pet[]
  selectedService: Service | null
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  currentStep: number
  loading: boolean
  onServiceSelect: (service: Service) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
}
```

**After editing booking/types.ts, check for type errors in consumers:**
- `src/components/booking/booking-step-1.tsx`
- `src/components/booking/booking-step-2.tsx`
- `src/components/booking/booking-step-3.tsx`
- `src/components/booking/booking-step-4.tsx`
- `src/components/booking/booking-wizard.tsx`

### Spacing System (GLBL-04)

**Current inconsistency:** Pages use a mix of `px-4`, `px-6`, `px-8` for horizontal padding and `max-w-4xl`, `max-w-7xl`, `max-w-md` for content width. There is no single canonical page container class.

**Recommended canonical pattern** (aligns with Airbnb-style design):

```css
/* In globals.css — define canonical page container */
.page-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.section-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12;
}
```

**Alternatively** (TW4 `@utility` approach):

```css
@utility page-container {
  max-width: var(--breakpoint-xl, 80rem);  /* 1280px */
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
}
```

**For Phase 1 scope:** Define the tokens/classes in `globals.css`. Application of consistent spacing across modernized pages is progressively applied in each subsequent phase — Phase 1 establishes the system, not full rollout.

### GLBL-01: No All-Caps Headings

**Current state:** Grep of `uppercase` class returned 0 results in heading contexts. The `text-transform: uppercase` pattern is not present in the current codebase.

**Action required:** This is preventive. Add an ESLint comment rule or code review note. Also audit for any `className` values with `uppercase` near heading tags. The audit pass should confirm no violations exist before marking complete.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Systematic token replacement | Manual find-and-replace in each file | Targeted sed/bash scripts per token type, then manual verification | 1,275 occurrences — manual is error-prone |
| Warm gray hex values | Custom color picker | Tailwind stone-600/stone-500 oklch equivalents (already in the theme system) | Stone IS warm gray in Tailwind; the existing oklch values already have warm undertones |
| TypeScript interface for `any` | Build from scratch | Import from `src/types/index.ts` directly | Types already defined; just need to wire in imports |
| New CSS grid/layout system | Build new | Use existing shadcn/ui component patterns + Tailwind responsive grid | Already in use; consistent with rest of codebase |

**Key insight:** This phase does not build new capabilities — it cleans up what exists. The project's token system, type system, and component patterns are already established. This work is plumbing, not architecture.

---

## Common Pitfalls

### Pitfall 1: Breaking Imports After Dead Component Deletion
**What goes wrong:** Deleting a file that has zero *direct* imports but is re-exported from an index file or referenced via dynamic import
**Why it happens:** Dead component analysis only catches static ESM imports
**How to avoid:** After deletion, run `pnpm build` (or at minimum `pnpm lint`) to catch any missed references
**Warning signs:** TypeScript "cannot find module" errors after deletion

### Pitfall 2: Gray Token Replacement Context Errors
**What goes wrong:** `text-gray-600` is replaced with `text-muted-foreground` but in a specific spot it was intentionally different (e.g., an error state using gray to contrast with red, which should stay gray or become a different semantic token)
**Why it happens:** Mechanical replacement ignores semantic context
**How to avoid:** After bulk replacement, do a visual pass of the most-changed files. Spot check: navigation, provider card, booking widget
**Warning signs:** Text that looks washed out or loses contrast in the rendered UI

### Pitfall 3: ProviderCard Variant Props Propagation
**What goes wrong:** Adding a `variant` prop but forgetting to update all call sites that render `<ProviderCard>`, leaving some with wrong layout
**Why it happens:** Call sites are spread across multiple pages and the listings-grid component
**How to avoid:** Use TypeScript to require the variant prop (make it non-optional with no default, or default to `'grid'` and document clearly)
**Warning signs:** ESLint `no-unused-vars` warnings on the variant prop implementation

### Pitfall 4: Booking Type Errors Cascade
**What goes wrong:** After fixing `any` in `booking/types.ts`, the booking wizard steps may have local `any` types that now conflict with the stricter interface
**Why it happens:** Types flow through props; step components may have their own loose type annotations
**How to avoid:** After updating `booking/types.ts`, run `pnpm lint` immediately and fix all cascading TypeScript errors before moving on
**Warning signs:** Multiple new `@typescript-eslint/no-explicit-any` warnings in booking-step-*.tsx files

### Pitfall 5: TailwindCSS v4 Token Registration Oversight
**What goes wrong:** Adding a CSS variable to `:root` but forgetting to register it in `@theme inline`, so `bg-brand` doesn't work as a utility class
**Why it happens:** v4 CSS-only config requires both steps (vs v3 which had a single JS config)
**How to avoid:** Always add to BOTH `@theme inline` and `:root` simultaneously
**Warning signs:** Tailwind utility class appears to do nothing (no styles applied)

### Pitfall 6: `ruixen-mono-chat.tsx` Is Not Dead
**What goes wrong:** Treating `ruixen-mono-chat.tsx` as a dead chat component and deleting it, breaking `ChatDialog`
**Why it happens:** It's not directly imported by pages — only by `chat-dialog.tsx`
**How to avoid:** Keep `ruixen-mono-chat.tsx` — it's ChatDialog's implementation layer, not a standalone component
**Warning signs:** If deleted, `chat-dialog.tsx` throws a module not found error immediately

---

## Code Examples

### Adding New Token in TailwindCSS v4

```css
/* Source: Direct inspection of src/app/globals.css pattern */

/* Step 1: Register in @theme inline */
@theme inline {
  --color-brand: var(--brand);
  --color-brand-light: var(--brand-light);
  --color-brand-foreground: var(--brand-foreground);
}

/* Step 2: Define in :root */
:root {
  --brand: oklch(0.65 0.14 174);       /* teal-600 equivalent */
  --brand-light: oklch(0.95 0.04 174); /* teal-50 equivalent */
  --brand-foreground: oklch(1 0 0);    /* white */
}

/* Step 3: Dark mode */
.dark {
  --brand: oklch(0.72 0.12 174);
  --brand-foreground: oklch(0.1 0.02 174);
}
```

### Booking Types Fix

```typescript
// Source: Direct inspection of src/components/booking/types.ts + src/types/index.ts

import { ServiceProvider, Service, Pet } from '@/types'

// BEFORE:
export interface BookingStepProps {
  provider: any
  services: any[]
  pets: any[]
  selectedService: any
  onServiceSelect: (service: any) => void
}

// AFTER:
export interface BookingStepProps {
  provider: ServiceProvider
  services: Service[]
  pets: Pet[]
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
}
```

### ProviderCard Variant Pattern

```typescript
// Target pattern for unified ProviderCard
interface ProviderCardProps {
  provider: ServiceProvider
  variant?: 'grid' | 'horizontal'  // 'grid' is default
  distance?: number
  className?: string
  services?: Service[]
}

export const ProviderCard = ({
  provider,
  variant = 'grid',
  distance,
  className,
  services
}: ProviderCardProps) => {
  if (variant === 'horizontal') {
    return <HorizontalCardLayout ... />
  }
  return <GridCardLayout ... />  // Airbnb image-dominant design
}
```

### Dead Component Deletion Checklist

```bash
# Run after each deletion to verify clean state
cd /Users/gvozdovic/Desktop/WEB\ Projects/pets/petify
pnpm lint 2>&1 | grep "Cannot find module\|Module not found"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `theme.extend` | `@theme inline` in CSS | TailwindCSS v4 | No JS config file; all tokens in globals.css |
| Hardcoded gray utility classes | Semantic design tokens (muted, foreground, border) | shadcn/ui convention | Theme-switchable, consistent |
| Scattered `any` types | Explicit named interfaces | TypeScript best practice | Type safety, IDE support |

**Key project-specific detail:** The project is on `next: ^16.0.10` (listed in package.json), which is effectively Next.js App Router with Server Components. React 19.1.0 is used. This means all components that use hooks must have `'use client'` — this is already consistent in the codebase.

---

## Open Questions

1. **Chat: What to do with `/chat` and `/dashboard/chat` route pages that use `chat-page.tsx`?**
   - What we know: These routes use `ChatPage` component which wraps `RuixenCard04`. ChatButton+ChatDialog are the declared canonical components.
   - What's unclear: Should these routes be migrated to use ChatButton/ChatDialog layout, or are they a different UI pattern (full-page chat vs. dialog chat)?
   - Recommendation: Keep `chat-page.tsx` and `ruixen-mono-chat.tsx` as they serve a distinct use case (full-page chat layout vs. floating dialog). The CLEAN-02 goal of "2 components" likely means 2 *public entry-point components* — ChatButton and ChatDialog — not eliminating all internal implementation files. Confirm this interpretation with user if needed.

2. **Warm gray neutral scale: remove or update?**
   - What we know: `@theme inline` has `--color-neutral-*` (lines 194-205) using pure cool gray hex values. The user wants warm grays throughout.
   - What's unclear: Are the `neutral-*` tokens actually used anywhere in the codebase? If yes, they need updating. If not, they can be removed.
   - Recommendation: Grep for `neutral-` class usage before touching. If unused, delete the whole block. If used, replace with warm stone-toned oklch equivalents.

3. **`app-sidebar.tsx` and `nav-user.tsx`: currently used only in dashboard/admin — out of scope?**
   - What we know: These serve admin and provider dashboard layouts which are explicitly OUT OF SCOPE per REQUIREMENTS.md ("Dashboard pages (admin, provider) — Focus on customer-facing pages")
   - What's unclear: CLEAN-01 says delete dead components. These are NOT dead — they're used.
   - Recommendation: Do NOT delete these. They're active. The 13+ dead components referenced in CLEAN-01 are the ones with zero imports.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `src/components/booking/types.ts` — all `any` types identified by reading file directly
- `src/types/index.ts` — all named types available for replacement confirmed by reading file
- `src/app/globals.css` — complete token system, @theme inline block, :root values
- `src/components/listings-grid.tsx` — full inline card implementation read directly
- `src/components/provider-card.tsx` — existing ProviderCard implementation read directly
- `components.json` — shadcn/ui config: new-york style, stone base, CSS variables enabled
- `package.json` — all dependency versions confirmed

### Secondary (HIGH confidence — grep/bash codebase analysis)
- Gray class frequency count: `grep -rh "text-gray-|bg-gray-|border-gray-" src/` — 1,275 occurrences, 130 files
- Dead component verification: import trace for all 8 identified dead components — confirmed zero external imports
- Chat component dependency map: traced all 8 chat files and their import relationships

### Tertiary (MEDIUM confidence — pattern inference)
- TailwindCSS v4 `@theme inline` dual-registration requirement: inferred from project's existing pattern in globals.css; should be verified against TailwindCSS v4 official docs before implementing
- oklch warm gray vs. cool gray distinction: the existing stone-based oklch values (e.g., `oklch(0.97 0.001 106.424)` for muted) have a hue angle of ~106 (yellow-adjacent = warm); confirmed warm by hue angle analysis

---

## Metadata

**Confidence breakdown:**
- Dead component inventory: HIGH — verified by tracing all import chains directly in codebase
- Token mapping table: HIGH — based on shadcn/ui semantic token conventions and direct CSS inspection
- TypeScript fix: HIGH — types exist in index.ts, mapping is straightforward
- Chat consolidation: MEDIUM — one open question about chat-page.tsx scope
- Spacing system: MEDIUM — canonical pattern proposed but not yet validated against all page layouts

**Research date:** 2026-02-23
**Valid until:** 2026-05-23 (stable domain — CSS tokens, TypeScript types, component cleanup)
