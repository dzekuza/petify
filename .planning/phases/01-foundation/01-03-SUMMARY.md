---
phase: 01-foundation
plan: 03
subsystem: ui
tags: [tailwindcss, design-tokens, semantic-tokens, shadcn-ui, theming]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: Semantic design token definitions (text-foreground, text-muted-foreground, bg-muted, bg-secondary, border-border) in globals.css

provides:
  - Zero raw gray Tailwind classes in src/ — all 83 files now use semantic tokens
  - bg-muted, bg-secondary, bg-foreground replacing bg-gray-*
  - border-border, border-border/50, border-foreground/20 replacing border-gray-*
  - text-foreground, text-muted-foreground replacing text-gray-* (Task 1 complete)
  - Codebase is now theme-switchable (dark mode and future themes work correctly)

affects:
  - All future UI phases (Phase 2 landing page, Phase 3 bookings, Phase 4 provider cards, Phase 5 search)
  - Any component added to src/ must use semantic tokens, not raw gray-* classes

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Semantic token usage: text-foreground for primary text, text-muted-foreground for subdued/meta text"
    - "Semantic token usage: bg-muted for subtle backgrounds, bg-secondary for hover/selected states"
    - "Semantic token usage: border-border for standard dividers, border-border/50 for very subtle dividers"
    - "Semantic token usage: border-foreground/20 and /30 for dark borders"
    - "Opacity modifier pattern: token/opacity (e.g. border-border/50) instead of lighter raw shades"

key-files:
  created: []
  modified:
    - src/app/api/bookings/[id]/route.ts
    - src/app/bookings/**/*.tsx (5 files)
    - src/app/providers/**/*.tsx (2 files)
    - src/app/provider/**/*.tsx (14 files)
    - src/app/**/*.tsx (additional pages)
    - src/components/provider-detail/**/*.tsx (7 files)
    - src/components/provider-onboarding/**/*.tsx (9 files)
    - src/components/provider-dashboard/**/*.tsx (4 files)
    - src/components/booking/**/*.tsx (4 files)
    - src/components/ui/ruixen-mono-chat.tsx
    - src/components/**/*.tsx (remaining components)

key-decisions:
  - "bg-gray-200 → bg-muted (not bg-secondary) — bg-muted is lighter and more neutral, matching the subtle container intent"
  - "hover:bg-gray-200 → hover:bg-secondary — hover states warrant the slightly stronger secondary token"
  - "border-gray-100 → border-border/50 (opacity modifier) — preserves the very-subtle divider intent"
  - "dark: prefixed gray variants in ruixen-mono-chat.tsx replaced with equivalent semantic tokens"
  - "Pre-existing Supabase type cast bug fixed with unknown as double cast in bookings API route"

patterns-established:
  - "Text hierarchy: text-foreground (headings/primary) | text-muted-foreground (subdued/meta/helper)"
  - "Background hierarchy: bg-background (page) | bg-muted (subtle container) | bg-secondary (hover/selected)"
  - "Border hierarchy: border-border (standard) | border-border/50 (subtle) | border-foreground/20 (dark)"
  - "Opacity modifiers preferred over lighter token variants for fine-grained control"

requirements-completed: [CLEAN-04]

# Metrics
duration: 7min
completed: 2026-02-23
---

# Phase 1 Plan 3: Gray Class Elimination Summary

**Eliminated all 1,275+ raw Tailwind gray utility classes across 83 src/ files, replacing them with semantic design tokens (bg-muted, border-border, text-foreground, text-muted-foreground) that enable theming and dark mode.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-02-23T14:33:44Z
- **Completed:** 2026-02-23T14:40:38Z
- **Tasks:** 3 (Task 1 and 2 from prior session, Task 3 this session)
- **Files modified:** 87 (83 component/page files + API route + chat component)

## Accomplishments

- Replaced all `text-gray-*` classes with `text-foreground` and `text-muted-foreground` across ~130 files (Task 1)
- User verified text hierarchy renders correctly — warm-toned, readable, no invisible text (Task 2)
- Replaced all `bg-gray-*`, `border-gray-*`, `divide-gray-*`, `ring-gray-*`, and gradient/placeholder gray variants across 83 files — zero raw gray classes remaining (Task 3)
- Build passes successfully after all replacements

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace high-frequency gray text classes across all files** - `6273bd5` (feat)
2. **Task 2: Spot-check text-gray replacements** - User approved (checkpoint — no commit)
3. **Task 3: Replace gray background and border classes across all files** - `8b53eeb` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/components/ui/ruixen-mono-chat.tsx` - Dark mode gray variants replaced manually (dark:border-gray-*, dark:bg-gray-*, etc.)
- `src/app/api/bookings/[id]/route.ts` - Fixed pre-existing Supabase type cast bug blocking build
- `src/components/**/*.tsx` (75+ files) - bg-gray-*/border-gray-* replaced with semantic tokens
- `src/app/**/*.tsx` (30+ files) - Same replacements across page files

## Decisions Made

- `bg-gray-200` → `bg-muted` as default (not `bg-secondary`) — bg-muted is lighter and matches the subtle background intent in most uses; only hover states specifically use `bg-secondary`
- `border-gray-100` → `border-border/50` using Tailwind opacity modifier — preserves the very-subtle divider intent rather than collapsing to full border-border weight
- Dark-mode-prefixed gray classes in `ruixen-mono-chat.tsx` replaced with equivalent semantic counterparts to maintain dark mode visual fidelity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing Supabase type cast error in bookings API route**
- **Found during:** Task 3 verification (pnpm build)
- **Issue:** `existingBooking.provider as { user_id: string }` failed TypeScript because Supabase infers the joined relation type as an array, not a scalar object
- **Fix:** Changed cast to `as unknown as { user_id: string } | null` (double cast through unknown) in two places in the GET and PATCH handlers
- **Files modified:** `src/app/api/bookings/[id]/route.ts`
- **Verification:** `pnpm build` passes successfully after fix
- **Committed in:** `8b53eeb` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Build-blocking TypeScript error was pre-existing, not introduced by gray class replacements. Fix was necessary to validate that build passes — the success criterion required `pnpm build` to succeed.

## Issues Encountered

- First `find ... | xargs sed` pass with `-o` flag didn't work as expected (macOS `find` requires parentheses around OR expressions: `\( -name "*.tsx" -o -name "*.ts" \)`). Used proper syntax on second pass — all replacements completed successfully.

## Next Phase Readiness

- Zero raw gray Tailwind classes remain in `src/` — design token foundation is complete
- The semantic token system (from 01-02) is now fully applied across the entire codebase
- Phase 2 (landing page modernization) can proceed with confidence that any new gray-like styling uses the token layer, not raw gray values
- Dark mode tokens will propagate correctly since all gray classes are now semantic

---
*Phase: 01-foundation*
*Completed: 2026-02-23*
