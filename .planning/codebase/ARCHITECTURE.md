# Petify Pet Care Marketplace - Architecture Documentation

## Overview

Petify is a modern Next.js 16 App Router application built as a multi-tenant pet care marketplace. It follows a **layered architecture pattern** with clear separation between presentation, business logic, and data access layers.

**Technology Stack:**
- Framework: Next.js 16 with App Router
- Frontend: React 19.1.0 with TypeScript
- Backend: Node.js 20.x API routes
- Database: Supabase (PostgreSQL) with PostGIS
- State Management: React Query (TanStack Query 5.87.1)
- Authentication: Supabase Auth
- Styling: Tailwind CSS 4 with Radix UI components
- Payment: Stripe for transaction handling
- Email: Resend for transactional emails
- Maps: Mapbox GL and Leaflet

## Architectural Patterns

### 1. Layered Architecture

The application is organized into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer (React Components)             │
│         /src/components - 142 component files               │
├─────────────────────────────────────────────────────────────┤
│              State Management & Context Layer               │
│  /src/contexts - Auth, Favorites, Notifications            │
│  /src/hooks - Custom hooks for reusable logic              │
├─────────────────────────────────────────────────────────────┤
│              API & Business Logic Layer                     │
│         /src/app/api - 28 API route handlers               │
│          /src/lib - Service functions & utilities          │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│    Supabase PostgreSQL with 12+ tables & RLS               │
│        /supabase/migrations - 17 migration files           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Next.js App Router Architecture

The application leverages Next.js 16's App Router with:
- **File-based routing** in `/src/app`
- **Server components by default** with selective client-side rendering (`use client`)
- **API routes** using convention-based routing (`route.ts` files)
- **Middleware and interceptors** for authentication flows

### 3. Multi-Role System Architecture

Three distinct user roles with role-based access control:

```
┌─────────────────────────────────────────────────┐
│             User Roles & Permissions             │
├─────────────────────────────────────────────────┤
│ Customer:  Browse, book services, pay          │
│ Provider:  List services, manage bookings      │
│ Admin:     Manage users, content, analytics    │
└─────────────────────────────────────────────────┘
```

Authentication & authorization are handled through:
- `/src/lib/auth.ts` - Core authentication utilities
- `/src/contexts/auth-context.tsx` - React context for auth state
- Supabase RLS (Row Level Security) policies at database level
- Route-level protection with middleware

### 4. Component Architecture

Components follow a hierarchical organization:

```
/src/components/
├── ui/                          - Reusable UI primitives (Radix)
├── admin/                       - Admin dashboard components
├── booking/                     - Booking workflow components
├── navigation/                  - Navigation & layout components
├── provider-dashboard/          - Provider portal components
├── provider-detail/             - Provider profile components
├── provider-onboarding/         - Provider signup flow
├── [root level]                 - Page-level components
    ├── hero-section.tsx
    ├── listings-grid.tsx
    ├── map-view.tsx
    ├── filter-modal.tsx
    └── ... (38 additional root components)
```

## Request Lifecycle

### Typical User Interaction Flow

```
1. USER ACTION (Frontend)
   └─> React component (e.g., booking-wizard.tsx)

2. CLIENT-SIDE PROCESSING
   └─> React Query mutation / context state update
   └─> Form validation & data transformation
   └─> Optional: TanStack Query cache management

3. API CALL
   └─> HTTP request to /api/* endpoint
   └─> Authorization header with JWT token

4. SERVER-SIDE AUTHENTICATION
   └─> /src/lib/auth.ts::authenticateRequest()
   └─> Verify JWT against Supabase
   └─> Retrieve user role from users table

5. BUSINESS LOGIC PROCESSING
   └─> /src/lib/* service files handle domain logic
   └─> Data validation & transformation
   └─> External service calls (Stripe, Resend, Mapbox)

6. DATA PERSISTENCE
   └─> Supabase client (createSupabaseAdmin) writes to PostgreSQL
   └─> RLS policies enforce row-level security
   └─> Triggers & functions execute server-side logic

7. NOTIFICATION FLOW
   └─> Notifications inserted into notifications table
   └─> Email sent via Resend
   └─> In-app notification via NotificationsProvider

8. RESPONSE TRANSFORMATION
   └─> API returns camelCase JSON (from snake_case DB)
   └─> NextResponse with appropriate status codes

9. CLIENT-SIDE STATE UPDATE
   └─> React Query cache invalidation/update
   └─> Context state updated
   └─> UI re-renders with new data

10. USER FEEDBACK
    └─> Toast notification (Sonner)
    └─> UI state reflects change
    └─> Optional: Navigation/redirect
```

### Booking Creation Flow (Detailed Example)

```
BookingWizard Component
├─ Step 1: Select Provider & Service
│  └─ useQuery('providers') - /lib/providers.ts
│     └─ API GET /api/providers
│
├─ Step 2: Select Pet & Date/Time
│  └─ useQuery('pets') - /lib/pets.ts
│  └─ useQuery('availability') - /lib/providers.ts
│
├─ Step 3: Review & Confirm
│  └─ Form validation
│  └─ useMutation(createBooking) submits
│
└─ Step 4: Payment
   └─ POST /api/checkout/create-session
   └─ Stripe session created
   └─ POST /api/bookings (creates booking after payment)
      ├─ authenticateRequest() - verify JWT
      ├─ Validate pet ownership
      ├─ Validate service exists
      ├─ Insert into bookings table
      ├─ Send emails to customer & provider
      └─ Create notifications
   └─ Return transformed booking object
```

## Data Flow Architecture

### State Management Hierarchy

```
Global State (React Context)
├── AuthProvider
│   ├── user: User | null
│   ├── session: Session | null
│   ├── loading: boolean
│   └── Methods: signIn, signUp, signOut, resetPassword
│
├── FavoritesProvider
│   ├── favorites: Set<string>
│   └── Methods: toggleFavorite, isFavorited
│
└── NotificationsProvider
    ├── notifications: Notification[]
    ├── unreadCount: number
    └── Methods: addNotification, dismissNotification

Query Cache (React Query)
├── useQuery() hooks for data fetching
├── useMutation() hooks for mutations
├── Automatic caching with 5-min stale time
└── Automatic refetch on window focus
```

### Component Prop Flow

```
App (RootLayout)
└── Providers wrapper
    ├── QueryClientProvider
    ├── AuthProvider
    ├── FavoritesProvider
    └── NotificationsProvider
        └── Page components
            ├── Use hooks (useAuth, useFavorites, etc.)
            └── Pass down as props (minimal prop drilling)
```

## API Layer Architecture

### 28 API Routes Organization

```
/src/app/api/
├── admin/                       - Admin operations
│   ├── listings/               - Content moderation
│   ├── providers/[id]/         - Provider management
│   ├── services/[id]/          - Service management
│   ├── users/[id]/             - User management
│   ├── stats/                  - Analytics dashboard
│   └── promote-to-admin/       - Role management
│
├── auth/                        - Authentication
│   └── welcome-email/          - New user welcome
│
├── bookings/                    - Booking management
│   ├── route.ts               - GET (list), POST (create)
│   └── [id]/                  - GET, PATCH, DELETE
│
├── chat/                        - Messaging system
│   ├── conversations/
│   ├── messages/
│   └── start-conversation/
│
├── checkout/                    - Payment processing
│   ├── create-session/
│   └── verify-session/
│
├── payments/                    - Payment operations
│   ├── create-intent/
│   └── webhook/               - Stripe webhook handler
│
├── providers/                   - Provider operations
│   ├── route.ts               - GET (list), POST (create)
│   └── update-profile/
│
├── reviews/                     - Review management
│
├── users/                       - User operations
│   ├── update-profile/
│   └── update-role/
│
├── claim-business/              - Provider business claiming
│
├── dev/                         - Development utilities
│   └── clear-rate-limits/
│
└── test-email/                  - Email testing
```

### API Route Pattern

```typescript
// Standard API route structure (/src/app/api/bookings/route.ts)
export async function GET(request: NextRequest) {
  // 1. Authenticate
  const authResult = await authenticateRequest(request)
  if (authResult.error) return authResult.error

  // 2. Authorize (check role/ownership)
  if (userRole !== 'admin') { ... }

  // 3. Validate query params
  const { searchParams } = new URL(request.url)

  // 4. Query database
  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin...

  // 5. Transform response
  const transformed = data?.map(item => ({ ... }))

  // 6. Return response
  return NextResponse.json({ bookings: transformed })
}

export async function POST(request: NextRequest) {
  // Similar pattern with validation & persistence
}
```

## Service Layer (/src/lib)

Core business logic extracted into reusable service files:

```
/src/lib/
├── auth.ts                      - Authentication helpers
├── bookings.ts                  - Booking operations
├── providers.ts                 - Provider queries & operations
├── services.ts                  - Service management
├── reviews.ts                   - Review management
├── chat.ts                      - Messaging logic
├── payments.ts                  - Stripe integration
├── pets.ts                      - Pet management
├── favorites.ts                 - Favorite operations
├── notifications.ts             - Notification creation
├── geocoding.ts                 - Address/location services
├── image-upload.ts              - Image handling
├── sanitization.ts              - Input validation
├── email.ts                     - Email service
├── supabase.ts                  - Database clients
├── query-client.ts              - React Query config
├── mapbox.ts                    - Map configuration
├── device-detection.ts          - Mobile/responsive detection
└── email-templates/             - HTML email templates
```

### Service Function Pattern

```typescript
// /src/lib/bookings.ts
export async function getBookingsByCustomer(
  customerId: string,
  supabaseClient: SupabaseClient
): Promise<Booking[]> {
  const { data, error } = await supabaseClient
    .from('bookings')
    .select('*')
    .eq('customer_id', customerId)

  if (error) throw error
  return data || []
}

export async function createBooking(
  bookingData: BookingInput,
  supabaseClient: SupabaseClient
): Promise<Booking> {
  const { data, error } = await supabaseClient
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) throw error
  return data
}
```

## Data Layer Architecture

### Database Schema (PostgreSQL via Supabase)

```
Core Tables (17 migrations):
├── users                - Auth.users extension
├── user_profiles        - Additional user data
├── providers            - Service provider profiles
├── services             - Service offerings
├── bookings             - Service bookings/orders
├── reviews              - Service reviews & ratings
├── pets                 - Customer pet profiles
├── conversations        - Chat conversations
├── messages             - Chat messages
├── favorites            - Saved providers
├── notifications        - In-app notifications
├── service_categories   - Service type definitions
├── pet_ads              - Pet breeding advertisements
├── pet_adoption_profiles - Pet adoption listings

Extensions:
├── uuid-ossp           - UUID generation
└── postgis             - Geographic queries
```

### Key Database Relationships

```
users (1) ──┬──> (M) providers
            ├──> (M) bookings (as customer)
            ├──> (M) pets
            ├──> (M) reviews
            ├──> (M) conversations
            ├──> (M) messages
            └──> (M) favorites

providers (1) ──┬──> (M) services
                ├──> (M) bookings
                └──> (M) reviews

services (1) ──> (M) bookings

bookings (1) ──┬──> (1) reviews
               ├──> (M) conversations
               └──> (1) payments
```

### Authentication & Security

```
Supabase Auth (JWT-based)
├── Session Management
│   ├── JWT tokens in localStorage
│   ├── Auto-refresh on token expiry
│   └── Logout clears session
│
├── Row-Level Security (RLS)
│   ├── Policies enforce ownership
│   ├── Customers see only their bookings
│   ├── Providers see only their listings
│   └── Admins see all data
│
└── Server-Side Validation
    ├── JWT verification in authenticateRequest()
    ├── Role checking with requireAdmin/requireProvider
    └── Resource ownership verification
```

## Abstraction Layers

### 1. Database Access Abstraction

All database queries go through:
1. `supabase` client (browser-safe, anon key) for client-side code
2. `createSupabaseAdmin()` factory for server-side code (service role key)

This prevents accidentally using admin privileges in browser code.

### 2. Authentication Abstraction

```
useAuth() hook ──> AuthContext ──> Supabase.auth
(React)          (State)         (Backend)
```

Components never directly call Supabase auth; they use the `useAuth()` hook.

### 3. API Client Abstraction

Fetch calls are typically wrapped in:
- React Query mutations/queries for caching
- Service layer functions in `/src/lib`
- Custom hooks where appropriate

### 4. Component Abstraction

UI components use Radix UI primitives to decouple from specific styling solutions.

## Entry Points

### Application Entry Points

```
1. Browser Entry Point
   └─ /src/app/layout.tsx
      └─ Root layout with Providers wrapper
      └─ Applies global CSS & analytics

2. Page Entry Points (App Router)
   ├─ /src/app/page.tsx               - Landing/home
   ├─ /src/app/search/page.tsx        - Provider search
   ├─ /src/app/providers/[id]/page.tsx - Provider detail
   ├─ /src/app/bookings/page.tsx      - Booking list
   ├─ /src/app/provider/dashboard/page.tsx - Provider portal
   └─ /src/app/admin/                 - Admin panel

3. API Entry Points
   └─ /src/app/api/**/route.ts        - 28 API endpoints

4. Development Entry Points
   ├─ next dev                        - Development server
   ├─ npm run build                   - Production build
   └─ next start                      - Production server
```

### Authentication Flow Entry Points

```
1. Sign Up
   /auth/signup/page.tsx
   └─ AuthProvider.signUp()
   └─ POST /api/auth/welcome-email

2. Sign In
   /auth/signin/page.tsx
   └─ AuthProvider.signIn()
   └─ Supabase session created

3. Password Reset
   /auth/reset-password/page.tsx
   └─ AuthProvider.resetPassword()

4. Email Confirmation
   /auth/confirm/page.tsx
   └─ Handles callback from email link
```

## Caching Strategy

### React Query Configuration

```typescript
// /src/lib/query-client.ts
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 30 * 60 * 1000,        // 30 minutes cache retention
    retry: (failureCount, error) => {
      if (4xx error) return false   // Don't retry client errors
      return failureCount < 3       // Retry up to 3 times
    }
  },
  mutations: {
    retry: false                    // Don't retry mutations
  }
}
```

### Cache Invalidation Pattern

```typescript
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: createBooking,
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['providers'] })
  }
})
```

## Error Handling Architecture

### Client-Side Error Handling

```
Try-Catch in Components
└─ Error Boundary (ErrorBoundary.tsx)
   └─ Fallback UI + error logging
   └─ Prevents entire app crash

React Query Errors
└─ useQuery/useMutation error states
└─ Display in UI or toast notifications

Async Validation
└─ Form validation in components
└─ Field-level error messages
```

### Server-Side Error Handling

```
API Route Error Handling
├─ Input validation → 400 Bad Request
├─ Authentication failure → 401 Unauthorized
├─ Authorization failure → 403 Forbidden
├─ Resource not found → 404 Not Found
├─ Database errors → 500 Internal Server Error
└─ All errors logged to console

Email Errors
└─ Non-critical (don't fail booking if email fails)
└─ Logged but booking proceeds
```

## Performance Optimization

### 1. Code Splitting

- Next.js automatic code splitting per route
- Dynamic imports for heavy components

### 2. Image Optimization

- `next/image` for responsive image serving
- Remote image patterns configured in `next.config.ts`

### 3. Lazy Loading

- React.lazy() for route-based splitting
- `useMemo` and `useCallback` to prevent unnecessary re-renders

### 4. Database Query Optimization

- Supabase query batching
- Select only needed columns
- Pagination for large result sets
- Indexes on frequently queried columns

### 5. Client-Side Optimization

- React 19 with automatic batching
- Suspense boundaries for async UI
- Virtual scrolling for large lists (potential)

## Security Architecture

### Authentication

- JWT tokens via Supabase Auth
- Secure token storage in browser
- Auto-refresh before expiry
- Server-side token validation on every API call

### Authorization

- Role-based access control (RBAC)
- Row-level security (RLS) at database level
- Resource ownership verification

### Data Validation

- Input sanitization in `/src/lib/sanitization.ts`
- Schema validation in mutations
- SQL injection prevention (Supabase parameterized queries)

### Security Headers

```typescript
// next.config.ts
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### External Services

- Stripe for secure payment processing
- Resend for email delivery
- Mapbox for geolocation (public key only exposed)

## Testing Architecture

```
Test Framework: Playwright (e2e)
├─ npm run e2e              - Run tests
└─ npm run e2e:ui           - Interactive mode

Linting:
├─ npm run lint             - ESLint checks
└─ .eslintrc.json           - Config

Environment:
├─ .env.local               - Development secrets
└─ .env.production          - Production secrets
```

## Type Safety

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,                    // Full type safety
    "noEmit": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]              // Import alias
    }
  }
}
```

### Type Definitions

```
/src/types/
├── index.ts                - Domain types
│   ├── User
│   ├── ServiceProvider
│   ├── Service
│   ├── Booking
│   ├── Review
│   └── Pet
│
└── onboarding.ts           - Onboarding form types

/src/lib/supabase.ts
└── Database type definitions (auto-generated)
```

## Development Workflow

### Local Development

```bash
npm install                  # Install dependencies
npm run dev                  # Start dev server (port 3000)
npm run lint                # Check code quality
npm run e2e                 # Run tests
```

### Build & Deployment

```bash
npm run build               # Production build
next start                  # Start production server
```

## Environment Configuration

```
Required Environment Variables:
├── NEXT_PUBLIC_SUPABASE_URL           - Supabase project URL
├── NEXT_PUBLIC_SUPABASE_ANON_KEY      - Public anon key
├── SUPABASE_SERVICE_ROLE_KEY          - Server-side admin key
├── NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN    - Mapbox public token
├── STRIPE_SECRET_KEY                  - Stripe secret
├── STRIPE_WEBHOOK_SECRET              - Stripe webhook signing
├── RESEND_API_KEY                     - Email service API key
└── DATABASE_URL                       - PostgreSQL connection
```

## Summary

Petify follows a **modern, layered full-stack architecture** with:
- **Clear separation of concerns** (UI, API, Database)
- **Type-safe development** throughout (TypeScript strict mode)
- **Scalable component structure** with Radix UI
- **Robust authentication** via Supabase Auth + JWT
- **Efficient data fetching** via React Query with caching
- **Multiple user roles** with proper authorization
- **Comprehensive API layer** with 28 specialized routes
- **PostgreSQL backend** with RLS for security
- **Modern tooling** (Next.js 16, React 19, Tailwind 4)

The architecture prioritizes **maintainability**, **security**, and **performance** while enabling rapid feature development.
