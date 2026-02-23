# Pitfalls Research

**Domain:** UI Modernization — existing Next.js 15 marketplace (142 components, TailwindCSS 4, shadcn/ui)
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (based on multiple web sources + codebase inspection; no direct user testing data)

---

## Critical Pitfalls

### Pitfall 1: Breaking Functionality While Changing Visual Structure

**What goes wrong:**
A component gets visually refactored — padding adjusted, a wrapper div added, class names changed — and it silently breaks a behavior. Mapbox map sizing stops working because a parent container lost `h-full`. A booking widget loses its scroll because `overflow-hidden` was removed alongside a design change. The page looks fine at first glance but fails under real usage.

**Why it happens:**
Developers treat UI modernization as purely cosmetic and don't track which CSS properties carry load-bearing responsibilities. In a 142-component codebase with 123 client components, each refactor touches multiple files with implicit layout contracts.

**How to avoid:**
- Before touching any component, identify its layout dependencies: does it rely on a parent's height, overflow, or flex/grid context?
- Keep a manual integration checklist: for each refactored component, test the interactive behavior (booking flow, map pan/zoom, filter toggles, payment form) not just the visual output
- Refactor one component at a time and verify behavior in context, not in isolation

**Warning signs:**
- Mapbox stops rendering correctly after any layout change to its parent
- Form submits that worked before now fail or produce wrong results
- Scroll areas feel broken or jump unexpectedly

**Phase to address:**
Phase 1 (Foundation/Audit) — establish a behavior baseline before touching any component. Define what "working" means for each critical flow.

---

### Pitfall 2: Component Audit False Positives Delete Working Code

**What goes wrong:**
Automated dead code tools (Knip, depcheck, ESLint) flag components as unused. Developer removes them. The component was actually used via dynamic import, via a string reference, or conditionally based on user role — none of which static analysis can trace. A provider-role-specific panel silently disappears from production.

**Why it happens:**
Petify has multi-role UI (customer, provider, admin). Role-conditional rendering and dynamic routing mean many components only appear under specific conditions. Tools like Knip cannot trace runtime behavior. shadcn/ui's own `src/lib/utils.ts` is routinely flagged as unused — a documented false positive.

**How to avoid:**
- Never delete a component based solely on tool output
- Audit components manually: grep for every import, check dynamic() calls, check role-gated render paths
- Test each role (customer, provider, admin) after any component removal
- Start with consolidating duplicate variants before deleting anything

**Warning signs:**
- A tool flags more than 20% of components as unused — suspect false positives
- Components with names like `mobile-*`, `admin-*`, `provider-*` flagged as unused
- Any chat, booking, or payment component flagged — these are often role-gated

**Phase to address:**
Phase 1 (Component Audit) — establish the audit methodology before touching code. Manual verification required for every deletion.

---

### Pitfall 3: Introducing Hydration Mismatches via "Use Client" Boundary Shifts

**What goes wrong:**
A server component gets refactored to move visual logic around. A conditional render based on animation state, viewport size, or user preferences gets added. The server renders one thing, React hydrates with another — `Hydration failed because the initial UI does not match what was rendered on the server`. The error is silent in production and causes flickering or broken layout.

**Why it happens:**
Petify uses Next.js 15 App Router. 123 out of 138 components already use `"use client"`. When refactoring for visual improvements, developers may add client-side conditions (window width, reduced motion preference, animation state) inside components that are rendered server-side, or incorrectly restructure the server/client boundary.

**How to avoid:**
- Never use `window`, `document`, or `Math.random()` in server component render paths
- Gate all client-only state (animation, viewport) in `useEffect` or behind a `useIsClient()` hook
- When adding animation wrappers (Framer Motion), ensure they're in components already marked `"use client"`
- Test with `next build && next start` — hydration errors only appear in production builds

**Warning signs:**
- Console error: `Hydration failed because the initial UI does not match`
- Layout flash or layout shift on first render after changes
- Framer Motion `motion.*` components used inside server components

**Phase to address:**
Phase 2 (Component Modernization) — every component that gains animation or viewport-conditional logic needs a boundary review.

---

### Pitfall 4: Inconsistent Application of the Design System Across Pages

**What goes wrong:**
Landing page gets modernized beautifully. Provider listing page gets modernized. But the search page keeps its old spacing, the navigation has different padding than the cards, and the provider detail page uses different border-radius values. The result looks like three different apps stitched together — worse than the original consistent but outdated design.

**Why it happens:**
Modernization happens page by page. Developers apply updated spacing values and color usage locally without updating shared tokens. Petify has a mix of hardcoded Tailwind values across 142 components with no centralized token enforcement. Each engineer makes local decisions that diverge over time.

**How to avoid:**
- Before touching any page, define the design token layer in `globals.css` using TailwindCSS 4's `@theme` directive: spacing scale, border-radius scale, shadow scale
- Enforce tokens via custom Tailwind utilities — not raw arbitrary values like `p-[18px]`
- Modernize pages in strict order: landing → navigation → provider cards → search → provider detail
- Do a cross-page visual pass after each phase, not just at the end

**Warning signs:**
- Different pages use different `rounded-*` values for cards
- Navigation padding doesn't match hero section alignment
- Spacing that looks correct on one page creates jarring jumps on another

**Phase to address:**
Phase 1 (Foundation) — define the token layer first. All subsequent phases consume it.

---

### Pitfall 5: Animation Overuse Making the App Feel Slower

**What goes wrong:**
Framer Motion is added to cards, page transitions, filter dropdowns, skeleton loaders, and hover states. The animations make a local dev machine feel smooth. On a mid-range phone on 4G, the UI feels sluggish and unresponsive. Interactions that used to be instant now have a perceptible delay before any feedback.

**Why it happens:**
Animation feels like a free upgrade. Framer Motion is already in the stack. Developers add it liberally as part of "modernization" without measuring the performance cost. Layout animations (the `layout` prop) are particularly expensive — they cause the browser to recalculate element positions on every frame.

**How to avoid:**
- Limit Framer Motion to three use cases: entrance animations (fade/slide in), micro-interactions on CTAs (button press scale), and page transitions
- Avoid `layout` prop on list items — it causes expensive reflows on every render
- All animations must respect `prefers-reduced-motion`: wrap with `AnimatePresence` and check `useReducedMotion()`
- Test on simulated mid-range hardware using Chrome DevTools CPU throttling (6x slowdown)
- Default animation duration: 150-200ms. Over 300ms feels sluggish for interactive elements.

**Warning signs:**
- Provider card grid takes more than 100ms to respond to hover
- Filter panel open/close animation runs at less than 60fps on throttled CPU
- Lighthouse Performance score drops more than 10 points after adding animations

**Phase to address:**
Phase 2-3 (Component Modernization and Page Redesign) — animation budget defined in Phase 1, enforced during implementation.

---

## Moderate Pitfalls

### Pitfall 6: Excessive Whitespace Destroying Information Density

**What goes wrong:**
Inspired by Airbnb's generous spacing, the redesign adds padding and margin liberally. Cards feel airy and modern. But the provider listing grid now shows 2 cards where 4 fit before. Users have to scroll more to see the same content. On mobile, a single card takes up 80% of the viewport. The "modern" look reads as half-empty.

**Why it happens:**
Airbnb's whitespace works because Airbnb has full-bleed photography, large high-quality images, and a specific content density appropriate to leisure browsing. Petify is a functional service marketplace where users want to compare options quickly. Direct aesthetic copying ignores context.

**How to avoid:**
- Use Airbnb as a reference for card structure and typography hierarchy, not for raw spacing values
- Maintain a minimum of 3 provider cards visible above the fold on desktop, 2 on mobile
- Test content density with realistic data: 8-12 providers visible, various business name lengths, rating distributions
- Whitespace should guide eye movement, not pad out empty space

**Warning signs:**
- Provider grid shows fewer than 3 cards in the above-the-fold viewport at 1280px width
- Users need to scroll to see any search results without interacting with filters
- Single card takes more than 60% of mobile viewport height

**Phase to address:**
Phase 3 (Provider Cards and Grid) — set card density constraints before implementation.

---

### Pitfall 7: Tailwind v4 Breaking Existing Component Styles

**What goes wrong:**
The project already runs TailwindCSS 4. Existing components were written with Tailwind v3 conventions. The `space-y-*` utilities now use `:not(:last-child)` instead of `:not([hidden]) ~ :not([hidden])`. The `!important` prefix syntax reversed from `!flex` to `flex!`. Transition utilities changed to affect 4 properties instead of 1. Components that appeared correct in v3 behave unexpectedly in v4 without any error.

**Why it happens:**
Petify migrated to TailwindCSS 4 (per CLAUDE.md and PROJECT.md). But 142 components may still use v3 conventions in their class names. These are silent failures — no TypeScript error, no console warning, just incorrect visual behavior.

**How to avoid:**
- Run the official Tailwind v4 upgrade codemod on all component files before starting visual work: `npx @tailwindcss/upgrade`
- Specifically audit all usage of `space-*`, `divide-*`, `transition-*`, and `!important` prefixes
- Check any custom plugins or `tailwind.config.js` patterns that won't auto-migrate
- After codemod, do a full visual pass of all 20+ pages in development before any new changes

**Warning signs:**
- Stack spacing looks inconsistent within a single component despite identical `space-y-*` class
- Hover state transitions behave differently than expected
- Custom theme values not applying after moving to v4's `@theme` CSS syntax

**Phase to address:**
Phase 1 (Foundation) — validate Tailwind v4 compatibility before any new styles are added.

---

### Pitfall 8: Losing Mobile Layout During Desktop-First Redesign

**What goes wrong:**
The landing page and provider cards are redesigned on a wide viewport. Everything looks perfect at 1280px. On mobile (375px), the hero section overflows horizontally, the filter chips wrap into 4 lines, and the provider card images are either too large or too small. The mobile-bottom-nav overlaps content.

**Why it happens:**
Petify already has `mobile-hero-section.tsx` and `mobile-bottom-nav.tsx` — separate mobile components. When the desktop versions are updated, the mobile versions are not updated in parallel. The two diverge. Additionally, new whitespace and typography changes that work at large breakpoints break at small ones.

**How to avoid:**
- For every component updated, immediately check the mobile breakpoint — never defer mobile to a "pass at the end"
- Maintain the mobile/desktop component pairing: if `hero-section.tsx` changes, `mobile-hero-section.tsx` changes in the same commit
- Test on 375px (iPhone SE) and 390px (iPhone 14) at minimum
- Verify that mobile-bottom-nav (60px) is accounted for in page bottom padding

**Warning signs:**
- Any page redesign that doesn't touch the `mobile-*` sibling component
- Horizontal scroll on any mobile viewport
- CTA buttons or filter elements clipped or overflowing on 375px

**Phase to address:**
Phase 2-3 (all page redesign phases) — mobile check is not optional, part of definition of done.

---

### Pitfall 9: Design Reference Copying Without Adapting to Domain

**What goes wrong:**
Petify adopts Airbnb's full-bleed hero photography approach. But Petify doesn't have curated photography assets — providers upload their own photos of varying quality, aspect ratios, and content. The hero looks beautiful with placeholder stock photos in development. In production with real provider images, the hero breaks — portrait photos in landscape slots, low-quality images stretched, dark and light images in unpredictable sequence.

**Why it happens:**
Design references are copied for their aesthetic output, not for the underlying content assumptions that make them work. Airbnb's card design assumes controlled photography. AllTrails' browse grid assumes consistent trail photography. Petify's content is user-generated and uncontrolled.

**How to avoid:**
- Design for worst-case content: assume provider images are portrait orientation, low resolution, or missing entirely
- All image slots must have: `object-cover` with defined aspect ratio, fallback state for missing images, graceful handling of blurry/low-res uploads
- Test every redesigned card and page with realistic (imperfect) provider photos, not placeholder images
- Provider avatars and business photos should have defined minimum dimensions enforced at upload, not at render

**Warning signs:**
- Any card design tested only with perfect square images
- Hero section that depends on image content for text readability (no overlay strategy)
- Provider gallery that doesn't handle zero-image state

**Phase to address:**
Phase 3 (Provider Cards and Detail Pages) — content resilience is part of the design spec.

---

### Pitfall 10: Opacity Opacity Opacity — Glassmorphism Looks Amateur in Production

**What goes wrong:**
The UI_MODERNIZATION_PLAN.md (referenced in CLAUDE.md) mentions glassmorphism. Cards get `backdrop-blur` and `bg-white/80` applied. In development on a fast machine with a clean background, it looks elegant. In production, on lower-end hardware, `backdrop-filter: blur()` is GPU-intensive. On Android Chrome, it causes frame drops. On complex page backgrounds (map view, image galleries), the blur reveals underlying UI elements in distracting ways.

**Why it happens:**
Glassmorphism is visually appealing in screenshots and design mockups. Implementation cost is invisible until tested on real hardware. The effect requires a meaningful background to look good — flat white pages make it invisible.

**How to avoid:**
- Limit `backdrop-blur` usage to maximum 2 elements per viewport: navigation and modal overlays
- Never use glassmorphism on repeating elements (cards in a grid) — the performance cost multiplies
- If glassmorphism is used: test on Chrome with 6x CPU throttle and ensure 60fps is maintained
- Consider using solid `bg-white/95` with a subtle shadow instead — same visual lightness, no GPU cost

**Warning signs:**
- More than 2 elements with `backdrop-filter` visible simultaneously
- Glassmorphism cards on the provider listing grid (12+ blur calculations per render)
- Lighthouse Performance score drops after adding backdrop-blur classes

**Phase to address:**
Phase 2-3 (Component Modernization) — make the call on glassmorphism in Phase 1 foundation decisions.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems specific to this modernization.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded arbitrary values (`p-[18px]`) instead of tokens | Pixel-perfect match to design reference quickly | Each page requires individual updates when spacing scale changes | Never during a design system migration |
| Copying Tailwind class strings between components without abstraction | Fast reuse | Drift — 10 components use 10 slightly different card styles | Never — abstract into shared `cn()` utility patterns |
| Adding `"use client"` to fix a hydration error without understanding why | Error disappears | Entire component tree loses server rendering, increases bundle size | Only if the component is inherently interactive and already at the leaf |
| Leaving dead component files "for reference" | Feels safe | Developers import the old version by mistake, silent regressions | Never — use git history for reference |
| Testing modernized UI only with the logged-in admin account | Sees full UI in one role | Provider-role and customer-role layouts look broken in production | Never — test all three roles for every page change |

---

## Integration Gotchas

Specific to Petify's stack integrations during UI modernization.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Mapbox GL | Changing the parent container's height or removing `h-full` during layout changes | Map container must always have an explicit height — verify map renders after any parent CSS change |
| Framer Motion | Using `layout` prop on list items that re-render on data change | Only use `layout` on single featured elements; for lists, use `AnimatePresence` with `initial={false}` |
| shadcn/ui | Customizing component internals directly inside `src/components/ui/` | Extend via wrapper components; do not modify shadcn primitives — they get overwritten by `npx shadcn add` |
| Radix UI | Adding visual styling that conflicts with Radix's keyboard navigation or focus management | Always test Tab, Space, Enter, Escape on all Radix-based components (Dialog, Dropdown, Select) after styling changes |
| TailwindCSS 4 | Using `tailwind.config.js` patterns when the project has migrated to CSS `@theme` | Validate that custom theme values are in `globals.css` `@theme` block, not in a JS config file |

---

## Performance Traps

Patterns specific to this codebase's modernization scope.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Framer Motion on every card in the provider grid | Frame drops when scrolling through 12+ providers, high Lighthouse CLS score | Limit entrance animations to the first visible row; skip animation for offscreen items | On mid-range Android devices at any scale |
| backdrop-filter blur on multiple grid cards | Page rendering becomes GPU-bound, scrolling stutters | Use solid backgrounds with shadows instead of blur on repeating elements | When 4+ blurred elements are visible simultaneously |
| Image `layout="fill"` without explicit aspect-ratio containers | CLS (Cumulative Layout Shift) score tanks as images load | Always set aspect-ratio in the container CSS before the image component mounts | Immediately in production with real provider images |
| Large component files that mix visual variants | Slow hot-reload during development, confusing state between variants | Split variants into separate components during audit | During active development — wastes iteration time |
| Importing all of a shadcn component when only a primitive is needed | Larger JS bundle per page | Import primitives directly; use tree-shaking-compatible imports | At page load when bundle size exceeds 200KB per route |

---

## UX Pitfalls

Common UX mistakes specific to a service marketplace modernization.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Moving "Book Now" CTA from its established position during card redesign | Existing users can't find the primary action — drop in bookings | Keep CTA in the same relative position (top-right or bottom of card); only change visual treatment |
| Minimalist navigation hiding key role-switching or account access | Providers and customers can't find their dashboards | Navigation links to dashboard must always be visible — never behind a hover state or buried in dropdowns |
| Hiding review count or rating score for "cleaner" design | Users lose social proof signals they use for trust decisions on payment flows | Ratings and review count are required visible on every provider card — not just the detail page |
| Using subtle color differences for interactive vs. non-interactive elements | Color-blind users can't distinguish what's clickable — accessibility failure | Interactive elements need shape, not just color differentiation (border, underline, or icon for links) |
| Applying skeleton loading to the entire page during modernization | Page feels broken while data loads — worse than the original flash | Apply skeletons only at the component level for known data-fetching boundaries |

---

## "Looks Done But Isn't" Checklist

Things that appear complete in development but fail in production or real-use conditions.

- [ ] **Provider cards:** Tested with real provider data (long business names, missing images, single-word names) — verify truncation and fallbacks work
- [ ] **Hero section:** Tested with zero-results state, loading state, and error state — not just the success path with data
- [ ] **Navigation:** Tested as customer, provider, and admin — each role sees different nav items; verify all three after any nav change
- [ ] **Map view:** Tested after any parent container style change — Mapbox requires explicit height or it renders as 0px
- [ ] **Mobile:** Tested at 375px on a real device or Chrome DevTools mobile emulation — not just desktop with a narrow window
- [ ] **Animations:** Tested with `prefers-reduced-motion: reduce` in system settings — all motion must stop or reduce to instant transitions
- [ ] **Color contrast:** All text on new background colors passes WCAG AA (4.5:1 for normal text) — use browser contrast checker, not eyeballing
- [ ] **Component removal:** Any deleted component verified against all three user roles in a full test run, not just grep for imports
- [ ] **Dark mode:** If the app supports dark mode, any new color utility must be validated in dark mode — new background tokens may not have dark-mode variants

---

## Recovery Strategies

When a pitfall occurs despite prevention.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Deleted component that was role-gated and in use | HIGH | Restore from git, audit all role-gated components before further deletions |
| Hydration mismatch introduced in production | MEDIUM | Add `"use client"` to affected component as emergency fix; then refactor properly with `useEffect` guard |
| Inconsistent design tokens across pages | HIGH | Define `@theme` tokens retroactively; use search-and-replace to standardize all components at once |
| Performance regression from animation overuse | MEDIUM | Disable animations globally via `AnimatePresence` feature flag; re-enable selectively after audit |
| Mobile layout broken after desktop redesign | MEDIUM | Roll back the mobile-specific components to last working state; update them in parallel with desktop counterpart |
| Glassmorphism GPU performance on production | LOW | Replace `backdrop-blur-*` with `bg-white/95 shadow-md` — visually nearly identical, no GPU cost |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Breaking functionality while changing visual structure | Phase 1: Establish behavior baseline | Smoke test all booking flows, map, and payment form after each component change |
| Component audit false positives | Phase 1: Audit methodology | Manual verification by role before any deletion is committed |
| Hydration mismatches from boundary shifts | Phase 2: Component modernization | Run `next build` after each component change; check for hydration warnings |
| Inconsistent design system application | Phase 1: Token layer definition | Cross-page visual pass after each phase completes |
| Animation overuse | Phase 2-3: Implementation | Lighthouse Performance score baseline set in Phase 1; verified after each phase |
| Excessive whitespace destroying density | Phase 3: Provider cards/grid | Card density count at 1280px viewport before and after |
| Tailwind v4 silent breaking changes | Phase 1: Foundation | Full visual regression pass after running v4 upgrade codemod |
| Mobile layout abandonment | Phase 2-3: All page phases | Mobile check in definition of done for every component |
| Design reference without content adaptation | Phase 3: Provider pages | Test all components with worst-case content (missing images, long text) |
| Glassmorphism performance | Phase 2: Component decisions | Lighthouse + CPU throttle test before glassmorphism is adopted |

---

## Sources

- [How to Redesign a Legacy UI Without Losing Users — XB Software](https://xbsoftware.com/blog/legacy-app-ui-redesign-mistakes/)
- [Tailwind CSS v4 Migration Guide: Breaking Changes — Medium](https://medium.com/@mernstackdevbykevin/tailwind-css-v4-0-complete-migration-guide-breaking-changes-you-need-to-know-7f99944a9f95)
- [Upgrading to Tailwind CSS v4 — Tailwind Official Docs](https://tailwindcss.com/docs/upgrade-guide)
- [Upgrading to Tailwind v4: Missing Defaults, Broken Dark Mode — GitHub Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16517)
- [It's whitespace. There's wayyyy too much whitespace in modern UIs — Hacker News](https://news.ycombinator.com/item?id=36683253)
- [Five Application Modernization Pitfalls — vFunction](https://vfunction.com/blog/app-modernization-pitfalls/)
- [Scaling Visual Regression Testing — Argos/MUI](https://argos-ci.com/customers/mui)
- [How to Fix Hydration Mismatch Errors in Next.js — OneUptime](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view)
- [Next.js Hydration Error Documentation — Vercel](https://nextjs.org/docs/messages/react-hydration-error)
- [CLI Tool to Clean Shadcn UI Components (shadcn-remover)](https://next.jqueryscript.net/shadcn-ui/cli-clean-components/)
- [Techniques for Removing React Unused Components — DhiWise](https://www.dhiwise.com/post/techniques-for-identifying-and-eliminating-react-unused-components)
- [8 Common UI Color Mistakes — Supercharge Design](https://supercharge.design/blog/8-common-ui-color-mistakes)
- [How to Build a Design Token System for Tailwind That Scales Forever — Hex Shift](https://hexshift.medium.com/how-to-build-a-design-token-system-for-tailwind-that-scales-forever-84c4c0873e6d)
- [Framer Motion is Not Just Animation — Medium](https://medium.com/@chandansingh73718/framer-motion-is-not-just-animation-its-how-modern-react-ui-moves-9e637f320864)
- [Animating React UIs in 2025: Framer Motion 12 vs React Spring — Hooked On UI](https://hookedonui.com/animating-react-uis-in-2025-framer-motion-12-vs-react-spring-10/)
- [10 App Modernization Mistakes to Avoid — Synchrony Systems](https://sync-sys.com/10-app-modernization-mistakes-to-avoid/)
- [Dynamic Import of Client Component from Server Component — Next.js GitHub Issue](https://github.com/vercel/next.js/issues/61066)

---
*Pitfalls research for: UI modernization of existing Next.js marketplace (Petify)*
*Researched: 2026-02-23*
