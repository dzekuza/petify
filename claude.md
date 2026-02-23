# CLAUDE.md - Petify Pet Care Marketplace

## Project Overview

Petify is a full-stack pet services marketplace connecting pet owners with service providers (groomers, vets, trainers, sitters, breeders). Built as a Next.js App Router application with Supabase backend, Stripe payments, and multi-role authentication.

**Primary language:** Lithuanian (UI strings and code comments), English (code and API)

## Tech Stack

- **Framework:** Next.js 16.0.10 (App Router, Turbopack dev server)
- **Language:** TypeScript 5 (strict mode)
- **React:** 19.1.0
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Auth:** Supabase Auth (JWT-based, 3 roles: customer, provider, admin)
- **Payments:** Stripe 18.5.0
- **Email:** Resend 6.0.3
- **Maps:** Mapbox GL 3.14 + Leaflet 1.9.4
- **UI:** TailwindCSS 4 + shadcn/ui (Radix primitives) + Framer Motion
- **State:** TanStack React Query 5.87 (server state) + React Context (client state)
- **Testing:** Playwright 1.55 (E2E)
- **Deployment:** Vercel (region: iad1)
- **Node:** 20.x

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/                  # 28 API route handlers
      admin/              # Admin management (stats, users, providers)
      auth/               # Authentication endpoints
      bookings/           # Booking CRUD
      chat/               # Messaging (conversations, messages)
      checkout/           # Stripe checkout sessions
      payments/           # Payment intents, webhooks
      providers/          # Provider search, profile management
      reviews/            # Review submission/retrieval
      users/              # Profile updates, role management
    admin/                # Admin dashboard pages
    auth/                 # Sign in/up, confirm, reset password
    provider/             # Provider dashboard, services, bookings
    bookings/             # Customer booking flow (cart, checkout, success)
    chat/                 # Messaging UI
    dashboard/            # Customer dashboard
    providers/            # Provider search and detail pages
  components/             # 138+ React components
    ui/                   # shadcn/ui Radix-based primitives
    admin/                # Admin-specific components
    booking/              # 4-step booking wizard
    provider-dashboard/   # Provider dashboard sections
    provider-detail/      # Provider profile display
    provider-onboarding/  # Provider signup flow
    navigation/           # Header, nav components
  contexts/               # React Context providers
    auth-context.tsx      # useAuth() hook - session, sign in/up/out
    favorites-context.tsx # Saved providers
    notifications-context.tsx # In-app notifications
  hooks/                  # Custom React hooks
  lib/                    # Core business logic
    auth.ts               # JWT validation, requireAdmin(), requireProvider()
    supabase.ts           # Client + admin Supabase instances
    payments.ts           # Stripe payment intents
    stripe.ts             # Stripe config
    bookings.ts           # Booking API client
    providers.ts          # Provider API client
    services.ts           # Service management
    pets.ts               # Pet profiles
    chat.ts               # Chat service
    email/                # Resend email integration + PDF generation
    sanitization.ts       # XSS prevention
    translations.ts       # Lithuanian/English strings
    geocoding.ts          # Location utilities
    mapbox.ts             # Mapbox config
    image-upload.ts       # Supabase Storage uploads
  types/
    index.ts              # All TypeScript interfaces and types
supabase/
  migrations/             # 17 SQL migration files
  config.toml             # Supabase local dev config
```

## Key Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run e2e          # Playwright E2E tests
npm run e2e:ui       # Playwright with UI
```

## Architecture Patterns

### Authentication Flow
1. Supabase Auth handles sign-up/in with JWT tokens
2. API routes validate via `authenticateRequest()` in `src/lib/auth.ts`
3. Role-based access: `requireAdmin()`, `requireProvider()` guards
4. Client-side: `useAuth()` context hook from `src/contexts/auth-context.tsx`
5. Three roles: `customer`, `provider`, `admin`

### Data Flow
```
User Action -> React Component -> API Route (src/app/api/) -> Supabase -> Response
                                                                  |
                                                            TanStack Query Cache
```

### API Route Pattern
All API routes follow this pattern:
```typescript
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateRequest(request)
  if (error) return error

  const supabaseAdmin = createSupabaseAdmin()
  // ... query logic
  return NextResponse.json({ data })
}
```

### Component Pattern
- shadcn/ui primitives in `src/components/ui/`
- Business components use Radix + TailwindCSS
- Forms use controlled components with local state
- Server state via TanStack Query hooks

### State Management
- **Server state:** TanStack React Query (bookings, providers, reviews, etc.)
- **Auth state:** React Context (`AuthContext`)
- **UI state:** React Context (`FavoritesContext`, `NotificationsContext`)
- **Local state:** `useState` / `useReducer` in components

## Database

### Core Tables
- `users` - User accounts (extends Supabase auth.users)
- `providers` - Business profiles (location JSONB with coordinates)
- `services` - Services offered by providers
- `bookings` - Customer bookings with payment tracking
- `pets` - Pet profiles
- `reviews` - Ratings and reviews
- `conversations` / `messages` - Chat system
- `favorites` - Saved providers
- `notifications` - In-app notifications
- `pet_ads` / `pet_adoption_profiles` - Pet sales/adoption

### Security
- Row-Level Security (RLS) enabled on all tables
- Service role key for admin operations only
- Anon key for public/authenticated client operations

## Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
RESEND_API_KEY
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
NEXT_PUBLIC_MAPBOX_STYLE_URL
```

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Coding Conventions

- TypeScript strict mode - no `any` without justification
- ESLint: `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any` as warnings
- Components: PascalCase filenames and exports
- API routes: `route.ts` in App Router convention
- Utilities: camelCase exports in `src/lib/`
- Types: centralized in `src/types/index.ts`
- Styling: TailwindCSS utility classes, shadcn/ui for complex UI
- Code comments: Lithuanian translations alongside English type names
- Input sanitization: use `src/lib/sanitization.ts` for user inputs
- Supabase queries: always use `createSupabaseAdmin()` in API routes, never the client-side `supabase` instance
