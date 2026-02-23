# Feature Research

**Domain:** Pet service marketplace UI modernization
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (verified across multiple sources; Airbnb/AllTrails observed patterns confirmed via design analysis articles and official Figma kit documentation)

---

## Context

Petify is an existing, fully functional marketplace. This is not a greenfield feature build — it is a **visual modernization** of customer-facing pages. The question is: what UI patterns do users expect in 2025, and what separates a marketplace that looks dated from one that feels premium?

Reference platforms researched: Airbnb (listing browse + booking), AllTrails (content-focused browse + search), Rover.com (pet service provider cards + trust), Wag (service provider listing + booking CTA).

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any 2025 marketplace. Missing them makes the product feel broken or dated.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sticky navigation with search | Users expect to search from anywhere; Airbnb, AllTrails both do this — losing nav on scroll feels like a 2015 site | LOW | Blur/frosted glass treatment on scroll is now the norm; plain solid bg looks dated |
| Provider cards with a dominant image | Every reference marketplace (Airbnb, Rover, AllTrails) leads cards with imagery — text-first cards feel like directory listings | LOW | 4:3 or 3:2 aspect ratio with `object-fit: cover`; consistent height grid |
| Star rating + review count visible on card | Users read trust signals before clicking; Rover shows stars + "(N reviews)" on every card in search | LOW | Must be on the card, not just on the detail page |
| Verified / badge signal on provider card | Rover gold badge (background check), Airbnb Superhost — users expect some verification marker | LOW | Even a simple "Verified" pill on the card builds trust |
| Real count of services or category labels on card | Users need to know at a glance what the provider offers (grooming, boarding, sitting) | LOW | Category chips/pills on card; Rover does this with service tags |
| Price visible on card | Hidden pricing until detail page creates friction and erodes trust; Airbnb's total-price toggle increased bookings 15% | LOW | Show starting price "from $X" on card |
| Split view: map + listing grid | The definitive pattern for geo-based marketplace search (Airbnb, Rover, Zillow) — map-only or list-only feels incomplete | MEDIUM | Already exists in codebase; modernize the visual treatment, not the pattern |
| Horizontal filter chips below search bar | AllTrails, Airbnb both use scrollable horizontal chip rows for quick category + attribute filtering — modal-only filtering feels buried | LOW | Chips for service type (grooming, boarding, sitting, walking) + rating + price range |
| Live filter feedback ("Showing X results") | AllTrails dynamically updates count as filters change — users need confirmation their filters worked | LOW | Small text label that updates; prevents "did my filter apply?" confusion |
| Mobile: bottom navigation bar | Expected on any mobile-first service; currently exists in codebase | LOW | Already present — ensure visual consistency with modernization |
| Empty states with clear CTA | Search with no results, zero bookings, etc. need helpful empty states — blank pages feel broken | LOW | Illustration or icon + message + action button |
| Loading skeletons instead of spinners | Skeleton screens on provider cards/grids reduce perceived wait time; spinners feel 2015 | LOW | Use Tailwind animate-pulse skeleton shapes matching card layout |
| Image gallery on provider detail page | Users expect to swipe/view multiple photos before booking — single image feels like a stub | MEDIUM | Already exists; ensure smooth transition animations |
| Sticky booking CTA on provider detail | Booking widget should follow the user as they scroll through the provider profile (Airbnb sidebar pattern) | LOW | `position: sticky` booking card on desktop; bottom sheet on mobile |
| Social proof count in hero section | "Join X pet owners" or "N providers near you" — quantified social proof in the hero reduces first-visit hesitation | LOW | Static number updated manually or from DB count query |
| Form validation with inline feedback | Booking forms must show errors inline, not after submission — modal-error-only UX is a trust destroyer | LOW | Red border + helper text below field; already partially done |
| Responsive grid that works on mobile | Card grid must reflow cleanly to 1 or 2 columns on mobile | LOW | Already present; ensure modernized card design maintains this |

### Differentiators (Competitive Advantage)

Features that elevate Petify beyond functional and into premium territory. Not required to launch, but these are where the "2025 feel" comes from.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Category pill navigation in hero | Airbnb's iconic category scroll row (icons + labels: Grooming, Boarding, Sitting, Walking, Vet) — visual entry point that replaces dropdown menus | LOW | SVG or emoji icons in a horizontal scroll row; each category pre-filters the grid |
| Hover image carousel on provider card | Airbnb's card dots on hover that reveal additional photos without opening the detail page — increases engagement before click | MEDIUM | Only needed on desktop; requires preloading 2-3 images; significant conversion lift |
| Card micro-interactions | Subtle elevation shadow + slight scale on hover communicates clickability; Framer Motion is already installed | LOW | `whileHover={{ scale: 1.01, boxShadow }}` on cards; avoid over-engineering |
| Glassmorphism on floating elements | Frosted glass for filter overlays, map tooltips, sticky nav on scroll — adds perceived depth and premium polish without heavy redesign | LOW | `backdrop-blur-md bg-white/80` in Tailwind; supported in all modern browsers |
| "Near you" / distance indicator on card | Showing "1.2 km away" on cards gives instant location relevance without opening the map — Rover does this | LOW | Requires geolocation permission; show distance badge only when location is available |
| Provider availability preview on card | "Available this weekend" chip or "Next available: Tue" on the card itself reduces unnecessary detail page visits | MEDIUM | Requires joining availability data into the provider list query; adds backend query complexity |
| Response time badge | "Responds within 2 hours" — Airbnb and Rover both surface this; dramatically increases booking conversion | LOW | Compute on provider record; display as subtle badge on card and detail page |
| Animated hero with parallax or subtle motion | Framer Motion entrance animations on hero text/CTA + subtle image parallax — signals premium, modern product | LOW | Use `initial`/`animate`/`transition` sparingly; hero headline fade-up + staggered subtext |
| Smooth page transitions | Framer Motion `AnimatePresence` on route changes — the "native app feel" that generic Next.js sites lack | MEDIUM | Requires wrapping layout in AnimatePresence; opt-in per page |
| Favorites heart with animation | Heart fill animation on save — Airbnb uses this; it confirms the action and feels satisfying | LOW | Already exists (FavoritesProvider); add Framer Motion spring animation to the fill |
| Review highlight card on provider detail | Pull one standout review into a stylized quote block near the top of the provider detail — Rover features "Top review" prominently | LOW | Select highest-rated review with most votes; display in a styled blockquote card |
| Photo-first hero with local search prominent | Hero section where a full-bleed image or gradient background sits behind a search bar — not a text-only hero | LOW | Search bar centered in hero, location + service type + date; Airbnb pattern |
| Progressive disclosure on provider detail | Above the fold: image, name, location, rating, price, book CTA. Below fold: full bio, services, reviews — respects attention hierarchy | LOW | Ordering + spacing change only; no new components needed |
| Category section with featured providers | "Top Groomers near you" horizontal scroll section on landing page — adds editorial curation feel | MEDIUM | Already partially exists (featured-providers.tsx); modernize card design + section header |

### Anti-Features (Things That Make UI Look Dated — Avoid These)

| Anti-Feature | Why It Looks Dated | What to Do Instead |
|-------------|-------------------|-------------------|
| Modal-only or sidebar-only search filters | Hides filtering behind a click; AllTrails, Airbnb both expose key filters as horizontal chips inline | Scrollable chip row for primary filters; modal/drawer only for advanced filters |
| Pure spinner loading states | Full-page or card spinners feel 2015; every major marketplace uses skeletons | Tailwind animate-pulse skeleton matching card shape |
| Text-first provider cards | Cards where copy appears before or without a dominant image feel like a directory listing, not a marketplace | Lead with image (at minimum 40% of card height); put text below |
| Flat navigation bar without blur | A solid-color nav that doesn't respond to scroll feels static and unfinished | `backdrop-blur` on scroll; transition from transparent to blurred background |
| Generic CTA buttons ("Submit", "Go", "Click here") | Weak verbs erode trust at booking moments | Specific verbs: "Book [Provider Name]", "Check Availability", "View Prices" |
| Gradient abuse (rainbow, multi-stop, neon) | Loud gradients scream 2019 template; they compete with imagery and reduce professionalism | Subtle single-direction gradients as accent only (hero image overlay, CTA button) |
| Dense info-heavy cards with small text | Cramming reviews, prices, categories, badges all at the same visual weight creates scan paralysis | Clear hierarchy: image → name → rating → price → one secondary tag |
| Index-based keys in lists (key={i}) | Not a visible UI anti-pattern but causes jank during filter/sort operations which users notice | Use provider.id or booking.id as key — already flagged in security audit |
| Form errors displayed as toast-only | Toast notifications for form validation errors disappear before users read them | Inline field-level error messages with red border + helper text |
| Hover states that only change cursor | Cursor: pointer alone is not enough affordance for clickable cards — no visual feedback | Shadow elevation + subtle scale or background change on hover |
| All-caps headings used broadly | Screams "web designer in 2014"; heavy-handed typographic emphasis that reduces readability | Reserve all-caps for labels/badges only (e.g., "VERIFIED", "AVAILABLE"); never for headings |
| Excessive animation (every element animates) | When everything moves, nothing stands out; creates perceived performance issues | Animate entrance of hero section and key CTAs; cards animate on hover only |
| Rating out of 10 or percentage | Users calibrate to 5-star systems (Rover, Airbnb, Google Maps); alternative scales cause confusion | 5-star system with decimal (4.8 ★) + review count |
| Unlabeled map pins | Map pins without provider name/price on hover feel like a broken prototype | Map pin tooltip with name + price + avatar on hover |

---

## Feature Dependencies

```
Hero search bar
    └──requires──> Location autocomplete (existing)
    └──requires──> Service category data (existing)

Category pill navigation
    └──requires──> Service categories table (existing)
    └──enhances──> Hero search bar (pre-fills filter)

Horizontal filter chips
    └──requires──> Provider list API supporting filter params (existing)
    └──enhances──> Split map+list view (map pins update with filters)

Hover image carousel on card
    └──requires──> Provider card with dominant image (table stakes)
    └──requires──> Multiple provider photos in DB (existing via image gallery)
    └──conflicts──> Mobile layout (hover is desktop-only; mobile uses tap-to-detail)

Provider availability preview on card
    └──requires──> Availability data joined into provider list query (backend change)
    └──OUT OF SCOPE for visual-only refactor

Sticky booking widget on provider detail
    └──requires──> Provider detail page layout restructure
    └──enhances──> Booking conversion (direct path to booking from detail page)

Glassmorphism on nav/floating elements
    └──requires──> Sticky navigation (table stakes)
    └──conflicts──> Accessibility on low-contrast backgrounds (test with WCAG checker)

Framer Motion micro-interactions
    └──requires──> Framer Motion installed (already in codebase)
    └──enhances──> Card hover, favorites heart, page transitions
```

### Dependency Notes

- **Hover image carousel requires multiple provider photos**: Most providers likely have gallery images already (image-gallery.tsx exists); this is a card-level presentation change, not a data change.
- **Provider availability preview on card is OUT OF SCOPE**: Would require backend query changes, which violates the "visual-only refactor" constraint in PROJECT.md.
- **Glassmorphism conflicts with accessibility on some backgrounds**: Test `bg-white/80 backdrop-blur-md` against brand color backgrounds; may need `bg-white/90` for sufficient contrast on colored heroes.

---

## MVP Definition

This is a modernization sprint on an existing app, so "MVP" means: what minimum changes produce maximum visual impact?

### Launch With (Phase 1 — Maximum Impact, Minimum Risk)

- [ ] Sticky navigation with backdrop blur on scroll — immediately signals modern
- [ ] Provider cards with dominant image, consistent aspect ratio, clean hierarchy (image → name → rating → price → category tag) — the single highest-impact component
- [ ] Horizontal filter chips below search bar — replaces or supplements modal filter for primary filters
- [ ] Loading skeleton states for provider card grid — eliminate spinners
- [ ] Progressive disclosure ordering on provider detail (image gallery → name/rating/price/CTA → bio → services → reviews)
- [ ] Sticky booking widget on provider detail (desktop sidebar, mobile bottom bar)
- [ ] Card hover elevation micro-interaction (Framer Motion already installed)
- [ ] Empty states with illustration + CTA for zero-results and zero-bookings

### Add After Validation (v1.x)

- [ ] Category pill navigation in hero section — adds browsing entry point; requires some layout changes to hero
- [ ] Hover image carousel on cards — higher complexity; validate core card design first
- [ ] Response time badge on cards and provider detail
- [ ] Hero section with full-bleed background + centered search
- [ ] Glassmorphism nav treatment

### Future Consideration (v2+)

- [ ] Personalized recommendations feed — requires ML/preference tracking
- [ ] Availability preview on cards — requires backend API change (out of scope)
- [ ] Animated page transitions with AnimatePresence — high complexity, lower user-visible impact relative to card/layout work
- [ ] AI-assisted pet matching — beyond UI modernization scope

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Provider card redesign (image-led, clean hierarchy) | HIGH | LOW | P1 |
| Sticky navbar with blur | HIGH | LOW | P1 |
| Loading skeletons | HIGH | LOW | P1 |
| Horizontal filter chips | HIGH | LOW | P1 |
| Sticky booking CTA on detail page | HIGH | LOW | P1 |
| Empty states | MEDIUM | LOW | P1 |
| Card hover micro-interaction | MEDIUM | LOW | P1 |
| Category pill navigation in hero | HIGH | MEDIUM | P2 |
| Hover image carousel on card | HIGH | MEDIUM | P2 |
| Response time / repeat client badge | MEDIUM | LOW | P2 |
| Hero section redesign (full-bleed + search) | HIGH | MEDIUM | P2 |
| Glassmorphism nav | MEDIUM | LOW | P2 |
| Review highlight on detail page | MEDIUM | LOW | P2 |
| Animated page transitions | LOW | MEDIUM | P3 |
| Availability preview on card | HIGH | HIGH (backend) | P3 |
| Personalized feed | HIGH | HIGH | P3 |

**Priority key:**
- P1: Must have for the modernized launch — what makes it look 2025
- P2: Should have — what makes it feel premium
- P3: Nice to have — future consideration

---

## Competitor Feature Analysis

| Feature | Airbnb | AllTrails | Rover | Petify Current | Our Approach |
|---------|--------|-----------|-------|----------------|--------------|
| Card image dominance | Full-bleed top, 3:2 ratio, hover carousel | Full-bleed top, 2:3 portrait | Square image top, badge overlay | Variable, not enforced | Enforce 3:2 image top with object-cover |
| Horizontal filter chips | Yes — category scroll row + date/guest chips | Yes — difficulty, length, elevation chips | Yes — service type + date chips | Filter modal only | Add inline chip row for service type + rating |
| Map + list split view | Yes — list left, map right; interactive pin highlight | Yes — toggleable map view | Yes — list with map toggle | Yes (exists) | Keep pattern; modernize map pin design |
| Rating on card | Stars + count | Stars + review count | Stars + "(N reviews)" + badge | Stars (varies) | Standardize: "4.8 ★ (42)" on all cards |
| Price on card | Yes — "from $X/night" | N/A (free trails) | Yes — "from $X/night" | Not always visible | Always show "from $X" on card |
| Verified badge | Superhost badge | N/A | Background check gold badge | None visible | Add "Verified" pill to cards |
| Loading states | Skeleton screens | Skeleton screens | Skeleton screens | Spinners | Replace all spinners with skeletons |
| Sticky booking CTA | Yes — sticky sidebar + mobile sheet | N/A | Yes — sticky book button | Not sticky | Make booking widget sticky on provider detail |
| Empty states | Illustrated, with suggestions | Illustrated, with filter reset | Helpful message + suggestions | Varies | Consistent illustrated empty states |

---

## Sources

- Airbnb Summer 2025 Design System: https://www.figma.com/community/file/1508075888287458165/airbnb-design-ui-kit-summer-release-2025
- Airbnb UI Design as Business Strategy (Overmatter): https://www.overmatter.design/blog/the-airbnb-update-when-ui-design-doubles-as-brand-and-business-strategy
- AllTrails iOS Design Critique (IXD@Pratt): https://ixd.prattsi.org/2025/02/design-critique-alltrails-ios-app-2/
- Marketplace UX Design Best Practices (Qubstudio): https://qubstudio.com/blog/marketplace-ui-ux-design-best-practices-and-features/
- Marketplace UX Design (Aspirity): https://aspirity.com/blog/marketplace-ux-design
- Marketplace UX Design: 9 Best Practices (Excited Agency): https://excited.agency/blog/marketplace-ux-design
- Split View Layout for Accommodations (Baymard): https://baymard.com/blog/accommodations-split-view
- Rover Badge System: https://support.rover.com/hc/en-us/articles/202838404-How-do-I-earn-profile-badges-and-what-do-they-mean
- 2025 UI Design Trends (Lummi): https://www.lummi.ai/blog/ui-design-trends-2025
- Top 10 Minimalist Web Design Trends 2026 (Digital Silk): https://www.digitalsilk.com/digital-trends/minimalist-web-design-trends/
- Glassmorphism in UX (Clay): https://clay.global/blog/glassmorphism-ui
- Booking UX Best Practices 2025 (Ralabs): https://ralabs.org/blog/booking-ux-best-practices/
- Airbnb Total Price Toggle Conversion Data: Referenced in dark patterns research — FTC and Airbnb announcements (2024-2025)
- Typography in Design Systems 2025 (Shakuro): https://shakuro.com/blog/best-fonts-for-web-design

---

*Feature research for: Pet service marketplace UI modernization*
*Researched: 2026-02-23*
