# Petify Pet Care Marketplace - Directory Structure Documentation

## Full Directory Tree

```
/home/user/repo/
├── .cursor/                          # Cursor IDE configuration
├── .git/                             # Git repository metadata
├── .planning/                        # Project planning & documentation
│   └── codebase/                     # Architecture documentation
│       ├── ARCHITECTURE.md           # System architecture & patterns
│       └── STRUCTURE.md              # This file - directory layout
│
├── public/                           # Static assets (images, icons)
│   ├── favicon.ico
│   └── [other static files]
│
├── scripts/                          # Build & development scripts
│   └── [utility scripts]
│
├── src/                              # Main source code directory
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global styles
│   │   ├── not-found.tsx             # 404 page
│   │   ├── favicon.ico               # Browser tab icon
│   │   │
│   │   ├── api/                      # 28 API route handlers
│   │   │   ├── admin/
│   │   │   │   ├── listings/route.ts
│   │   │   │   ├── promote-to-admin/route.ts
│   │   │   │   ├── providers/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   ├── stats/route.ts
│   │   │   │   ├── update-user-role/route.ts
│   │   │   │   └── users/
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]/
│   │   │   │           ├── route.ts
│   │   │   │           └── change-password/route.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── welcome-email/route.ts
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts           # GET list, POST create
│   │   │   │   └── [id]/route.ts      # GET, PATCH, DELETE
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── conversations/route.ts
│   │   │   │   ├── messages/route.ts
│   │   │   │   └── start-conversation/route.ts
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── create-session/route.ts
│   │   │   │   └── verify-session/route.ts
│   │   │   │
│   │   │   ├── claim-business/route.ts
│   │   │   │
│   │   │   ├── dev/
│   │   │   │   └── clear-rate-limits/route.ts
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── create-intent/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── route.ts           # GET list, POST create
│   │   │   │   └── update-profile/route.ts
│   │   │   │
│   │   │   ├── reviews/route.ts
│   │   │   │
│   │   │   ├── test-email/route.ts
│   │   │   │
│   │   │   └── users/
│   │   │       ├── update-profile/route.ts
│   │   │       └── update-role/route.ts
│   │   │
│   │   ├── admin/                    # Admin dashboard pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── providers/page.tsx
│   │   │   └── users/page.tsx
│   │   │
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── signin/page.tsx       # Login page
│   │   │   ├── signup/page.tsx       # Registration page
│   │   │   ├── confirm/page.tsx      # Email confirmation
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── bookings/                 # Booking management pages
│   │   │   ├── page.tsx              # Booking list
│   │   │   ├── [id]/page.tsx         # Booking detail
│   │   │   ├── cart/page.tsx         # Shopping cart
│   │   │   ├── checkout/page.tsx     # Checkout page
│   │   │   └── success/page.tsx      # Payment success
│   │   │
│   │   ├── chat/page.tsx             # Chat/messaging page
│   │   │
│   │   ├── dashboard/page.tsx        # Customer dashboard
│   │   │
│   │   ├── favorites/page.tsx        # Saved providers
│   │   │
│   │   ├── help/page.tsx             # Help/support page
│   │   │
│   │   ├── how-it-works/page.tsx     # Feature explanation
│   │   │
│   │   ├── pets/page.tsx             # Pet management page
│   │   │
│   │   ├── profile/page.tsx          # User profile page
│   │   │
│   │   ├── provider/                 # Provider portal pages
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   ├── bookings/
│   │   │   │   ├── calendar/
│   │   │   │   ├── chat/
│   │   │   │   ├── pet-ads/
│   │   │   │   ├── profile/
│   │   │   │   ├── services/
│   │   │   │   ├── settings/
│   │   │   │   └── _sections/       # Reusable dashboard sections
│   │   │   ├── availability/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── pet-ads/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── providers/                # Provider search & detail
│   │   │   ├── page.tsx              # Provider search
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Provider detail
│   │   │       └── book/page.tsx     # Quick booking
│   │   │
│   │   ├── search/page.tsx           # Advanced search
│   │   │
│   │   ├── test-ai-chat/page.tsx     # AI chat testing
│   │   │
│   │   └── test-chat-persistence/page.tsx
│   │
│   ├── components/                   # 142 reusable React components
│   │   ├── providers.tsx             # Root provider wrapper
│   │   ├── layout.tsx                # Component layout wrapper
│   │   │
│   │   ├── ui/                       # Radix UI component library
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── checkbox.tsx
│   │   │   └── [other UI primitives]
│   │   │
│   │   ├── admin/                    # Admin dashboard components
│   │   │   ├── admin-stats.tsx
│   │   │   ├── user-management.tsx
│   │   │   └── provider-management.tsx
│   │   │
│   │   ├── booking/                  # Booking workflow
│   │   │   ├── booking-wizard.tsx    # Multi-step form container
│   │   │   ├── booking-step-1.tsx    # Select provider & service
│   │   │   ├── booking-step-2.tsx    # Select pet & date/time
│   │   │   ├── booking-step-3.tsx    # Review details
│   │   │   └── booking-step-4.tsx    # Payment
│   │   │
│   │   ├── navigation/               # Navigation components
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-user.tsx
│   │   │   ├── nav-projects.tsx
│   │   │   ├── nav-secondary.tsx
│   │   │   └── navigation.tsx
│   │   │
│   │   ├── provider-dashboard/       # Provider portal components
│   │   │   ├── [various dashboard sections]
│   │   │
│   │   ├── provider-detail/          # Provider profile display
│   │   │   ├── [provider display components]
│   │   │
│   │   ├── provider-onboarding/      # Provider signup flow
│   │   │   ├── [onboarding step components]
│   │   │
│   │   ├── add-individual-pet-dialog.tsx     # Pet creation modal
│   │   ├── address-autocomplete.tsx          # Google Places autocomplete
│   │   ├── admin-protected-route.tsx         # Admin route guard
│   │   ├── app-sidebar.tsx                   # Main sidebar navigation
│   │   ├── availability-calendar.tsx         # Provider availability
│   │   ├── booking-modal.tsx                 # Quick booking modal
│   │   ├── category-section.tsx              # Service category display
│   │   ├── defence-overlay.tsx               # Security overlay
│   │   ├── edit-individual-pet-dialog.tsx    # Pet editor modal
│   │   ├── error-boundary.tsx                # Error fallback
│   │   ├── featured-providers.tsx            # Homepage featured
│   │   ├── filter-modal.tsx                  # Search filters
│   │   ├── footer.tsx                        # Site footer
│   │   ├── hero-filters.tsx                  # Homepage search bar
│   │   ├── hero-section.tsx                  # Homepage hero
│   │   ├── individual-pet-card.tsx           # Pet card display
│   │   ├── individual-pets-dialog.tsx        # Pet selection modal
│   │   ├── listings-grid.tsx                 # Provider grid display
│   │   ├── location-autocomplete.tsx         # Location search
│   │   ├── map-controls.tsx                  # Map UI controls
│   │   ├── map-view.tsx                      # Map display wrapper
│   │   ├── mapbox-map.tsx                    # Mapbox integration
│   │   ├── mobile-bottom-nav.tsx             # Mobile navigation
│   │   ├── mobile-filter-drawer.tsx          # Mobile filter sidebar
│   │   ├── mobile-hero-section.tsx           # Mobile homepage
│   │   ├── navigation-search.tsx             # Global search component
│   │   ├── not-found-view.tsx                # 404 UI
│   │   ├── notification-toast.tsx            # Toast notifications
│   │   ├── pagination.tsx                    # Pagination controls
│   │   ├── pagination-provider-cards.tsx     # Paginated providers
│   │   ├── pet-form.tsx                      # Pet form template
│   │   ├── provider-card.tsx                 # Provider listing card
│   │   ├── provider-card-detail.tsx          # Detailed provider card
│   │   ├── provider-detail-booking-modal.tsx # Provider booking modal
│   │   ├── responsive-navigation.tsx         # Adaptive navigation
│   │   ├── search-bar.tsx                    # Search input component
│   │   ├── sidebar-navigation.tsx            # Sidebar menu
│   │   ├── star-rating.tsx                   # Review rating display
│   │   ├── stats-card.tsx                    # Stats display card
│   │   ├── status-badge.tsx                  # Status indicator
│   │   ├── theme-provider.tsx                # Dark mode context
│   │   ├── time-slot-picker.tsx              # Time selection UI
│   │   └── [other feature components]
│   │
│   ├── contexts/                    # React Context for global state
│   │   ├── auth-context.tsx         # Authentication context
│   │   │   ├── useAuth() hook
│   │   │   ├── user state
│   │   │   ├── session state
│   │   │   └── Auth methods: signIn, signUp, signOut, resetPassword
│   │   │
│   │   ├── favorites-context.tsx    # Favorites/saved providers
│   │   │   ├── useFavorites() hook
│   │   │   ├── toggleFavorite()
│   │   │   └── isFavorited()
│   │   │
│   │   └── notifications-context.tsx # In-app notifications
│   │       ├── useNotifications() hook
│   │       ├── addNotification()
│   │       ├── dismissNotification()
│   │       └── unreadCount
│   │
│   ├── hooks/                       # Custom React hooks (2 files)
│   │   ├── use-debounce.ts          # Debounce utility
│   │   └── use-mobile.ts            # Mobile detection
│   │
│   ├── lib/                         # Business logic & utilities
│   │   ├── auth.ts                  # Auth helpers
│   │   │   ├── authenticateRequest() - Verify JWT token
│   │   │   ├── requireAdmin()       - Guard admin routes
│   │   │   └── requireProvider()    - Guard provider routes
│   │   │
│   │   ├── bookings.ts              # Booking operations
│   │   │   ├── getBookingsByCustomer()
│   │   │   ├── getBookingsByProvider()
│   │   │   ├── createBooking()
│   │   │   └── updateBookingStatus()
│   │   │
│   │   ├── providers.ts             # Provider queries (1200+ lines)
│   │   │   ├── getProviders()
│   │   │   ├── getProviderDetail()
│   │   │   ├── searchProviders()
│   │   │   ├── getProviderAvailability()
│   │   │   └── updateProviderProfile()
│   │   │
│   │   ├── services.ts              # Service management
│   │   │   ├── getServicesByProvider()
│   │   │   ├── createService()
│   │   │   └── updateService()
│   │   │
│   │   ├── reviews.ts               # Review operations
│   │   ├── chat.ts                  # Messaging logic
│   │   ├── payments.ts              # Stripe integration
│   │   ├── pets.ts                  # Pet management
│   │   ├── favorites.ts             # Favorite operations
│   │   ├── notifications.ts         # Notification logic
│   │   │
│   │   ├── supabase.ts              # Database clients (280+ lines)
│   │   │   ├── supabase client      - Browser-safe (anon key)
│   │   │   ├── createSupabaseAdmin() - Server-only (service role)
│   │   │   └── TypeScript types     - Auto-generated schema
│   │   │
│   │   ├── query-client.ts          # React Query configuration
│   │   │   ├── staleTime: 5 minutes
│   │   │   ├── gcTime: 30 minutes
│   │   │   └── Retry logic
│   │   │
│   │   ├── geocoding.ts             # Address/location services
│   │   ├── image-upload.ts          # Image handling
│   │   ├── sanitization.ts          # Input validation
│   │   ├── email.ts                 # Email service abstraction
│   │   ├── mapbox.ts                # Map configuration
│   │   ├── device-detection.ts      # Mobile detection
│   │   ├── storage.ts               # Browser storage utilities
│   │   ├── utils.ts                 # General utilities
│   │   │
│   │   ├── email/
│   │   │   └── [email service functions]
│   │   │
│   │   ├── email-templates/         # Email HTML templates
│   │   │   ├── booking-confirmation.ts
│   │   │   ├── welcome-email.ts
│   │   │   └── [other email templates]
│   │   │
│   │   ├── mock-providers.ts        # Seed data generator
│   │   ├── pet-adoption-profiles.ts # Adoption listings logic
│   │   ├── pet-ads.ts               # Pet advertising logic
│   │   ├── breeds.ts                # Pet breed data
│   │   └── translations.ts          # i18n strings (Lithuanian)
│   │
│   └── types/                       # TypeScript type definitions
│       ├── index.ts                 # Main domain types
│       │   ├── ServiceCategory enum
│       │   ├── BookingStatus enum
│       │   ├── UserRole enum
│       │   ├── User interface
│       │   ├── ServiceProvider interface
│       │   ├── Service interface
│       │   ├── Booking interface
│       │   ├── Review interface
│       │   ├── Pet interface
│       │   └── [other types]
│       │
│       └── onboarding.ts            # Signup form types
│
├── supabase/                        # Database configuration
│   ├── migrations/                  # 17 SQL migration files
│   │   ├── 001_initial_schema.sql           # Tables & relationships
│   │   ├── 002_rls_policies.sql             # Security policies
│   │   ├── 003_storage_setup.sql            # File buckets
│   │   ├── 004_functions_views.sql          # DB functions
│   │   ├── 005_seed_data.sql                # Demo data
│   │   ├── 006_storage_buckets.sql
│   │   ├── 007_add_provider_avatar.sql
│   │   ├── 008_fix_pet_images_bucket.sql
│   │   ├── 009_fix_provider_images_bucket.sql
│   │   ├── 010_notifications_table.sql
│   │   ├── 011_add_unique_user_id_constraint.sql
│   │   ├── 012_remove_walking_category.sql
│   │   ├── 013_create_pet_ads.sql
│   │   ├── 014_add_service_location.sql
│   │   ├── 015_fix_provider_availability_function.sql
│   │   ├── 017_fix_booking_pet_ids.sql
│   │   └── 20241220_create_pet_adoption_profiles.sql
│   │
│   ├── config.toml                  # Supabase local config
│   ├── README.md                    # Database setup guide
│   └── setup.sh                     # Database initialization script
│
├── .cursor/                         # Cursor IDE config
├── .eslintrc.json                   # ESLint configuration
├── .eslintrc.mjs                    # ESLint module config
├── .gitignore                       # Git ignore rules
│
├── components.json                  # UI component config
│
├── tsconfig.json                    # TypeScript configuration
│   ├── strict: true                 # Full type checking
│   ├── @/* path alias               # Import shortcuts
│   └── ES2017 target
│
├── package.json                     # Node dependencies
│   ├── next 16.0.10
│   ├── react 19.1.0
│   ├── @supabase/supabase-js 2.57.2
│   ├── @tanstack/react-query 5.87.1
│   ├── tailwindcss 4
│   ├── stripe 18.5.0
│   ├── resend 6.0.3
│   └── [22+ more dependencies]
│
├── package-lock.json                # Locked dependency versions
│
├── next.config.ts                   # Next.js configuration
│   ├── Mapbox GL transpilation
│   ├── Remote image patterns
│   └── Security headers
│
├── postcss.config.mjs                # PostCSS with Tailwind
├── eslint.config.mjs                # ESLint module setup
│
├── check-env.sh                     # Environment validation script
├── setup-database.js                # DB setup automation
│
├── README.md                        # Project overview
├── QUICK_SETUP.md                   # Quick start guide
├── DEVELOPMENT_GUIDE.md             # Development reference
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── PRODUCTION_SETUP.md              # Production configuration
├── LANDING_PAGE_STRUCTURE.md        # Homepage layout
├── UI_MODERNIZATION_PLAN.md         # UI improvements roadmap
├── MAPBOX_SETUP.md                  # Map integration guide
├── STRIPE_SETUP.md                  # Payment setup
├── RESEND_SETUP.md                  # Email setup
├── claude.md                        # Security audit report
│
└── email-preview.html               # Email template preview
```

## File Organization Patterns

### 1. React Components (`/src/components/`)

**Naming Convention:** `PascalCase.tsx` (one component per file)

**File Structure:**
```typescript
// Header of component file
'use client'  // Client-side directive if needed

// Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Props interface
interface ComponentProps {
  title: string
  onClose?: () => void
}

// Component definition
export function ComponentName({ title, onClose }: ComponentProps) {
  return (
    <div>
      {title}
      {onClose && <Button onClick={onClose}>Close</Button>}
    </div>
  )
}
```

**Component Categories:**

1. **UI Primitives** (`/components/ui/`)
   - Radix UI-based components
   - Generic, reusable elements (Button, Card, Dialog, etc.)
   - No business logic
   - Composed into larger components

2. **Feature Components** (`/components/`)
   - Combine multiple UI primitives
   - Business logic included
   - Used across multiple pages
   - Examples: `BookingWizard`, `ProviderCard`, `FilterModal`

3. **Page Sections** (`/components/[feature]/`)
   - Specific to feature areas
   - Examples: `/components/booking/`, `/components/admin/`

4. **Layout Components**
   - `providers.tsx` - Root provider wrapper
   - `layout.tsx` - Component layout scaffold
   - `app-sidebar.tsx` - Main navigation
   - `footer.tsx` - Site footer

### 2. API Routes (`/src/app/api/`)

**Naming Convention:** `route.ts` in feature directories

**File Structure:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    // Business logic
    const data = await fetchData()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Similar structure
}
```

**Route Patterns:**

| Pattern | Purpose |
|---------|---------|
| `/api/[resource]/route.ts` | List (GET) & Create (POST) |
| `/api/[resource]/[id]/route.ts` | Detail (GET), Update (PATCH), Delete (DELETE) |
| `/api/[action]/route.ts` | Action-based endpoints |
| `/api/[feature]/[action]/route.ts` | Nested feature operations |

### 3. Page Components (`/src/app/[feature]/`)

**Naming Convention:** `page.tsx` as entry point

**File Structure:**
```typescript
// Server component by default
import { HeroSection } from '@/components/hero-section'
import { Listings } from '@/components/listings-grid'

export const metadata: Metadata = {
  title: 'Browse Pet Services',
  description: 'Find trusted pet service providers'
}

export default function ProvidersPage() {
  return (
    <main>
      <HeroSection />
      <Listings />
    </main>
  )
}
```

**Page Organization:**

- Layout files (`layout.tsx`) define region structure
- Page files (`page.tsx`) define content
- Dynamic routes use brackets: `[id]`, `[slug]`
- Groups use parentheses: `(auth)`, `(provider)`

### 4. Type Definitions (`/src/types/`)

**Naming Convention:** `lowerCase.ts`

**File Structure:**
```typescript
export type UserRole = 'customer' | 'provider' | 'admin'

export type ServiceCategory =
  | 'grooming'
  | 'veterinary'
  | 'boarding'
  | 'training'
  | 'sitting'
  | 'adoption'
  | 'pets'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  customerId: string
  providerId: string
  serviceId: string
  date: string
  timeSlot: TimeSlot
  status: BookingStatus
  totalPrice: number
  createdAt: string
  updatedAt: string
}
```

### 5. Service/Library Files (`/src/lib/`)

**Naming Convention:** `camelCase.ts` (kebab-case if multi-word)

**File Structure:**
```typescript
import { SupabaseClient } from '@supabase/supabase-js'

// Type definitions
export interface QueryOptions {
  limit?: number
  offset?: number
}

// Main export functions
export async function getBookings(
  customerId: string,
  options?: QueryOptions,
  supabase?: SupabaseClient
) {
  // Implementation
}

export async function createBooking(
  data: BookingInput,
  supabase: SupabaseClient
) {
  // Implementation
}

// Helper functions
function formatBookingResponse(raw: any) {
  // Transform snake_case to camelCase
}
```

### 6. Context Providers (`/src/contexts/`)

**Naming Convention:** `[feature]-context.tsx`

**File Structure:**
```typescript
'use client'

import { createContext, useContext } from 'react'

interface ContextType {
  state: any
  method: () => void
}

const Context = createContext<ContextType | undefined>(undefined)

export const useFeature = () => {
  const context = useContext(Context)
  if (!context) throw new Error('useFeature must be inside provider')
  return context
}

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const value = { /* state and methods */ }
  return <Context.Provider value={value}>{children}</Context.Provider>
}
```

## Key Directories Deep Dive

### `/src/app/` - Routing & Pages

**Purpose:** Define all user-facing routes and API endpoints

**Structure:**
```
app/
├── page.tsx              # /
├── layout.tsx            # Root layout
├── [feature]/
│   ├── page.tsx         # /feature
│   ├── layout.tsx       # Feature layout
│   ├── [id]/
│   │   └── page.tsx     # /feature/[id]
│   └── [action]/
│       └── page.tsx     # /feature/[action]
├── api/
│   ├── [resource]/
│   │   ├── route.ts     # /api/[resource] (GET, POST)
│   │   └── [id]/
│   │       └── route.ts # /api/[resource]/[id]
│   └── [feature]/
│       └── [action]/
│           └── route.ts # /api/[feature]/[action]
└── [group]/             # Route groups (optional organization)
    ├── layout.tsx
    └── page.tsx
```

**Key Routes:**

| Route | Purpose |
|-------|---------|
| `/` | Home/landing page |
| `/providers` | Provider search & listing |
| `/providers/[id]` | Provider detail page |
| `/bookings` | Customer booking list |
| `/bookings/[id]` | Booking detail |
| `/bookings/checkout` | Payment page |
| `/profile` | User profile |
| `/provider/*` | Provider dashboard & tools |
| `/admin/*` | Admin panel |
| `/auth/*` | Authentication flows |

### `/src/components/` - Reusable UI

**Purpose:** All reusable React components (142 files)

**Categories:**

1. **UI Library** (`/components/ui/`) - 20+ base components
   - Button, Card, Dialog, Input, Select, Tabs, Avatar, etc.
   - Wrapped Radix UI primitives
   - Pure presentation, no logic

2. **Feature Components** (root level) - 40+ components
   - `BookingWizard` - Multi-step booking form
   - `ProviderCard` - Provider listing card
   - `FilterModal` - Search filters
   - `MapboxMap` - Map integration
   - `HeroSection` - Homepage hero

3. **Feature Sections** (subdirectories)
   - `/components/admin/` - Admin dashboard components
   - `/components/booking/` - Booking workflow steps
   - `/components/navigation/` - Nav components
   - `/components/provider-dashboard/` - Provider portal
   - `/components/provider-onboarding/` - Provider signup

### `/src/lib/` - Business Logic

**Purpose:** Reusable service functions and utilities

**File Breakdown:**

| File | Purpose | Size |
|------|---------|------|
| `supabase.ts` | DB clients & types | 280 lines |
| `providers.ts` | Provider queries | 900 lines |
| `bookings.ts` | Booking operations | 100 lines |
| `services.ts` | Service management | 250 lines |
| `auth.ts` | Auth helpers | 140 lines |
| `payments.ts` | Stripe integration | 200 lines |
| `email.ts` | Email abstraction | 50 lines |
| `notifications.ts` | Notification logic | 100 lines |
| `sanitization.ts` | Input validation | 150 lines |
| `query-client.ts` | React Query setup | 25 lines |
| `geocoding.ts` | Address services | 160 lines |
| `translations.ts` | i18n strings | 1000+ lines |
| **Total** | | **4000+ lines** |

### `/src/contexts/` - Global State

**Purpose:** React Context for app-wide state (3 files)

| File | State Managed |
|------|---------------|
| `auth-context.tsx` | Current user, session, auth methods |
| `favorites-context.tsx` | Saved providers |
| `notifications-context.tsx` | In-app notifications |

### `/src/types/` - TypeScript Definitions

**Purpose:** Shared type definitions (2 files)

| File | Types |
|------|-------|
| `index.ts` | User, ServiceProvider, Service, Booking, Review, Pet, etc. |
| `onboarding.ts` | Provider signup form types |

### `/supabase/migrations/` - Database

**Purpose:** Database schema and setup (17 files)

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Create all tables & relationships |
| `002_rls_policies.sql` | Security policies |
| `003_storage_setup.sql` | File storage configuration |
| `004_functions_views.sql` | DB functions & views |
| `005_seed_data.sql` | Demo/test data |
| `006-009_*` | Storage fixes |
| `010_notifications_table.sql` | Add notifications |
| `011-015_*` | Schema improvements |
| `20241220_*.sql` | Pet adoption profiles |

## Import Path Conventions

**Alias Configuration** (`tsconfig.json`):
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**Usage Examples:**
```typescript
// ✓ Use alias (recommended)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getProviders } from '@/lib/providers'
import type { User } from '@/types'

// ✗ Avoid relative imports
// import { Button } from '../../../components/ui/button'
```

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BookingWizard.tsx` |
| Pages | kebab-case | `provider-detail.tsx` |
| Types | PascalCase | `User.ts`, `Booking.ts` |
| Utilities | camelCase | `getProviders.ts` |
| Hooks | camelCase, start with `use` | `useAuth.ts`, `useDebounce.ts` |
| Context | kebab-case | `auth-context.tsx` |

### Code Identifiers

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `function BookingCard()` |
| Functions | camelCase | `function getProviders()` |
| Variables | camelCase | `const isLoading = true` |
| Constants | UPPER_SNAKE_CASE | `const MAX_PETS = 5` |
| Types/Interfaces | PascalCase | `interface User {}` |
| Enums | PascalCase | `type UserRole = 'customer'` |
| CSS classes | kebab-case | `className="hero-section"` |

### Database

| Type | Convention | Example |
|------|-----------|---------|
| Tables | snake_case, plural | `users`, `bookings`, `providers` |
| Columns | snake_case | `user_id`, `created_at`, `full_name` |
| Foreign Keys | `{table}_{column}` | `user_id`, `provider_id`, `booking_id` |
| Constraints | descriptive | `fk_bookings_users` |

## Summary Statistics

```
Total Files:          262+ TypeScript/JavaScript files
Total Components:     142 React component files
API Routes:          28 route.ts endpoints
Page Routes:         20+ user-facing pages
Service Functions:   25+ utility files in /src/lib
Type Definitions:    2 files with 50+ interfaces
Database Tables:     12+ PostgreSQL tables
Migrations:          17 SQL migration files
```

## Critical File Locations

```
Root Layout:         /src/app/layout.tsx
Root Provider:       /src/components/providers.tsx
Auth Context:        /src/contexts/auth-context.tsx
API Auth Guard:      /src/lib/auth.ts
DB Client:          /src/lib/supabase.ts
React Query Config: /src/lib/query-client.ts
Types:              /src/types/index.ts
Database Setup:     /supabase/migrations/001_initial_schema.sql
```

This structure enables:
- **Easy navigation** with clear organization
- **Rapid feature development** with reusable components
- **Consistent patterns** across the codebase
- **Type safety** throughout the application
- **Maintainability** with single-responsibility files
- **Scalability** with modular architecture
