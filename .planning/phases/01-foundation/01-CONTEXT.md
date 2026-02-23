# Phase 1: Foundation - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Clean up the codebase and establish a consistent design foundation. Delete dead components, enforce semantic design tokens (replacing raw Tailwind gray classes), unify ProviderCard into one canonical component, and fix TypeScript `any` types in booking/types.ts. No new features — this is infrastructure that all subsequent visual phases build on.

</domain>

<decisions>
## Implementation Decisions

### Color palette direction
- Warm grays throughout — slightly warm/beige undertones for a cozy, friendly feel (Airbnb-like warmth)
- Primary accent color: teal/green — nature-inspired, calming, fits the pet/wellness space
- Minimal color usage — accent only on CTAs, active states, and key interactive elements; mostly neutral elsewhere
- Token system must support both light and dark mode from day one — no rework later

### ProviderCard unification
- Image-dominant layout — large photo takes ~60% of card, info below (Airbnb-style)
- Full details on every card: name, rating, review count, starting price, location, service tags, verified badge
- No-photo fallback: friendly pet-themed placeholder illustration to keep visual consistency
- Two card variants: full grid card and compact horizontal card for list views — one component with a variant prop

### Claude's Discretion
- Exact warm gray hex values and token naming conventions
- Design token granularity and CSS variable structure
- Which specific dead components to delete (audit determines this)
- Chat component consolidation approach
- TypeScript interface design for booking types
- Dark mode token values (light mode is primary, dark mode should work but doesn't need to be pixel-perfect yet)

</decisions>

<specifics>
## Specific Ideas

- Warm grays like Airbnb's palette — cozy without being yellow
- Teal/green accent should feel natural and calming, not clinical
- Cards should feel modern and image-forward — the provider photo is the hero
- Placeholder illustrations should be pet-themed (not generic gray boxes)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-23*
