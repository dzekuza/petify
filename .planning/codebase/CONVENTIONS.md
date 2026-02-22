# Code Conventions Guide

## Overview

This document describes the coding conventions and patterns used throughout the Petify Pet Care Marketplace codebase. The project uses TypeScript with strict mode, Next.js 16, React 19, and TailwindCSS 4 with shadcn/ui components.

---

## TypeScript Configuration

### Strict Mode

The project enforces TypeScript strict mode (`"strict": true` in `tsconfig.json`):
- All variables must have explicit types
- No implicit `any` types
- Null/undefined checks are enforced
- ESLint warns on `@typescript-eslint/no-explicit-any` usage

### Path Aliases

All imports use the `@/` alias for the `src/` directory:
```typescript
// Correct
import { useAuth } from '@/contexts/auth-context'
import { bookingApi } from '@/lib/bookings'

// Incorrect (avoid)
import { useAuth } from '../../../contexts/auth-context'
```

---

## File Naming Conventions

### Components

- **kebab-case** for file names: `booking-wizard.tsx`, `featured-providers.tsx`
- **PascalCase** for exported component names
- One component per file (with rare exceptions for closely related small components)
- Location: `src/components/` with subdirectories for feature grouping

**Examples:**
- `/src/components/booking-modal.tsx` → exports `BookingModal`
- `/src/components/provider-detail/booking-widget.tsx` → exports `BookingWidget`
- `/src/components/ui/button.tsx` → exports `Button`

### Libraries and Utilities

- **kebab-case** for file names: `device-detection.ts`, `email-service.ts`
- Location: `src/lib/` with subdirectories for domain organization
- Example structure: `src/lib/email/` contains email-related utilities

**Examples:**
- `/src/lib/auth.ts` - authentication utilities
- `/src/lib/supabase.ts` - database client configuration
- `/src/lib/bookings.ts` - booking API client

### Contexts

- **kebab-case** for file names: `auth-context.tsx`, `favorites-context.tsx`
- Location: `src/contexts/`
- Always end with `-context.tsx`

### API Routes

- Mirror the URL structure in directory layout
- `/src/app/api/bookings/route.ts` → `/api/bookings`
- `/src/app/api/bookings/[id]/route.ts` → `/api/bookings/:id`
- `/src/app/api/admin/users/[id]/change-password/route.ts` → `/api/admin/users/:id/change-password`

### Types

- Define types in `types.ts` files close to where they're used
- Global types in `/src/types/index.ts`
- Feature-specific types in component directories: `src/components/booking/types.ts`
- Example: `BookingStepProps` interface in `/src/components/booking/types.ts`

---

## Code Style

### Imports Organization

**Order:**
1. React and Next.js imports
2. Third-party library imports
3. Relative imports from project (@/)
4. Type imports

```typescript
// Example: src/components/booking-wizard.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'
import { useDeviceDetection } from '@/lib/device-detection'
import { BookingStep1 } from './booking-step-1'
import { toast } from 'sonner'

import type { BookingWizardProps } from './types'
```

### Use Client Directive

Client components use `'use client'` at the very top:

```typescript
'use client'

import React from 'react'
// ... rest of file
```

Applied to:
- Any component using React hooks (useState, useEffect, useContext)
- Client-side context providers
- Components with event handlers
- See: `src/components/error-boundary.tsx`, `src/contexts/auth-context.tsx`

### Component Function Declarations

Prefer named exports with explicit function declarations:

```typescript
// Preferred
export function BookingWizard({ provider, services }: BookingWizardProps) {
  return <div>...</div>
}

// Also acceptable for simple components
export const FeaturedProviders = () => {
  return <section>...</section>
}

// Avoid unnamed arrow functions without explicit return
const MyComponent = () => <div></div> // Not ideal
```

### Props Interface Naming

Name prop interfaces with the suffix `Props`:
```typescript
interface BookingWizardProps {
  provider: any
  services: any[]
  onStepChange?: (step: number) => void
}
```

### Type Safety

While TypeScript strict mode is enabled, some components use `any` for complex objects that lack strict typing:

```typescript
// Seen in: src/components/booking/booking-wizard.tsx
interface BookingWizardProps {
  provider: any
  services: any[]
}
```

This pattern exists in components dealing with dynamic data structures. When refactoring, replace `any` with proper interfaces.

---

## Component Patterns

### React Context Components

**Structure:**
1. Define context type interface
2. Create context with `createContext<ContextType | undefined>()`
3. Create provider component
4. Create custom hook to use the context

**Example:** `src/contexts/auth-context.tsx`

```typescript
'use client'

import { createContext, useContext } from 'react'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  // ... other methods
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Implementation...
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Pattern Details:**
- Guard against missing context with error throwing in custom hook
- Provide fallback values in state (null, empty arrays, false)
- Use `useCallback` for stable function references
- Example: `src/contexts/favorites-context.tsx` shows useCallback usage

### Error Boundary Pattern

Located in `src/components/error-boundary.tsx`:

- Uses class component (React.Component)
- Implements `getDerivedStateFromError` static method
- Implements `componentDidCatch` lifecycle method
- Provides higher-order component wrapper: `withErrorBoundary<P extends object>()`
- Shows detailed error info only in development

### Protected Route Pattern

Located in `src/components/protected-route.tsx`:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'customer' | 'provider' | 'admin'
  fallback?: React.ReactNode
}
```

- Use `useMemo` for expensive checks
- Check loading state before redirects
- Return null during redirects to prevent UI flicker
- Support role-based access control

### Step Components Pattern

For multi-step workflows (booking wizard):
- Create separate components for each step (`BookingStep1`, `BookingStep2`, etc.)
- Define shared props interface: `BookingStepProps`
- Keep state management in parent component
- Pass handlers and state down as props

**Example:** `src/components/booking/`

---

## State Management Patterns

### Local Component State

Use `useState` for component-level state:

```typescript
const [currentStep, setCurrentStep] = useState(1)
const [selectedService, setSelectedService] = useState<any>(null)
const [loading, setLoading] = useState(true)
```

### Context State

Use React Context for global application state:
- `AuthProvider` - authentication state
- `FavoritesProvider` - user favorites
- `NotificationsProvider` - notifications

See `src/contexts/` directory.

### API Client State

Create API client objects/modules in `src/lib/`:

```typescript
export const bookingApi = {
  async getProviderBookings(providerId: string): Promise<Booking[]> {
    const headers = await getHeaders()
    const response = await fetch(`${API_BASE_URL}/api/bookings?provider_id=${providerId}`, {
      headers
    })
    if (!response.ok) throw new Error('Failed to fetch provider bookings')
    const data: BookingsResponse = await response.json()
    return data.bookings
  }
  // ... other methods
}
```

**Patterns:**
- Methods are async and return typed responses
- Error handling with `!response.ok` check
- Include authentication headers via `getHeaders()` helper
- Return typed data (not raw responses)

See: `src/lib/bookings.ts`

### TanStack Query

The project has `@tanstack/react-query` installed but not heavily utilized in current code. Future patterns should leverage it for server state management.

---

## API Route Patterns

### Authentication

All API routes that require authentication use the `authenticateRequest` utility:

```typescript
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request)
  if (authResult.error) {
    return authResult.error
  }
  const user = authResult.user!
  // ... rest of handler
}
```

**Authorization Helpers:**
- `authenticateRequest(request)` - check if authenticated
- `requireAdmin(request)` - check admin role
- `requireProvider(request)` - check provider role

See: `src/lib/auth.ts`

### Request/Response Handling

```typescript
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) return authResult.error

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')

    // Database operations
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error('Error in bookings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Patterns:**
- Always wrap in try/catch
- Check auth early
- Use `searchParams` for query parameters
- Use `request.json()` for POST body
- Return consistent response format: `{ bookings: [], error?: string }`
- Include status codes (401, 403, 404, 500)

See: `src/app/api/bookings/route.ts`

### Data Transformation

API responses often transform database format to API format:

```typescript
const transformedBookings = bookings?.map(booking => ({
  id: booking.id,
  customerId: booking.customer_id,  // snake_case → camelCase
  providerId: booking.provider_id,
  date: booking.booking_date,        // rename field
  timeSlot: {
    start: booking.start_time,
    end: booking.end_time,
    available: true
  },
  status: booking.status,
  totalPrice: parseFloat(booking.total_price),  // type conversion
  // ... structured response
})) || []

return NextResponse.json({ bookings: transformedBookings })
```

---

## Error Handling

### Development vs Production

Error boundaries show full stack traces in development only:

```typescript
{process.env.NODE_ENV === 'development' && this.state.error && (
  <details className="mt-6 text-left w-full max-w-2xl">
    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
      Error Details (Development Only)
    </summary>
    <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
      {this.state.error.message}
      {'\n\n'}
      {this.state.error.stack}
    </pre>
  </details>
)}
```

### API Error Responses

Consistent HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found
- `500` - Server Error

### Error Logging

Use `console.error()` for server-side errors:

```typescript
console.error('Error creating booking:', error)
console.error('Error fetching bookings:', error)
console.log('Supabase query result:', { bookings, error, customerId })
```

**Comment:** In production, consider integrating with error tracking services (Sentry, LogRocket, etc.)

---

## Import Assertions and Comments

### Lithuanian Language Comments

Comments in types may include Lithuanian translations:

```typescript
// File: src/types/index.ts
export interface User {
  id: string
  email: string
  fullName: string // pilnas vardas
  role: UserRole // rolė
  phone?: string // telefonas
  // ...
}
```

These are intentional for a Lithuanian market application.

### Type Comments

Self-documenting code with inline type comments:

```typescript
export type UserRole = 'customer' | 'provider' | 'admin' // klientas | paslaugų teikėjas | administratorius
```

---

## shadcn/ui Component Usage

Components from shadcn/ui use consistent patterns:

### CVA (Class Variance Authority) Pattern

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "base classes here",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border-2 bg-background"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-11 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
```

See: `src/components/ui/button.tsx`

### Utility Function

Use `cn()` from `@/lib/utils` to merge class names:

```typescript
import { cn } from "@/lib/utils"

className={cn(buttonVariants({ variant, size, className }))}
className={cn("base-class", isMobile ? "mobile-class" : "desktop-class")}
```

---

## Hooks and Side Effects

### useEffect Dependencies

Always include proper dependency arrays:

```typescript
useEffect(() => {
  fetchPets()
}, [fetchPets]) // fetchPets is the dependency

useEffect(() => {
  if (onStepChange) {
    onStepChange(currentStep)
  }
}, [currentStep, onStepChange]) // both dependencies
```

### useCallback for Stable References

Use `useCallback` for functions passed as dependencies:

```typescript
const fetchFavorites = useCallback(async () => {
  // Implementation
}, [user?.id]) // depends on user.id

useEffect(() => {
  fetchFavorites()
}, [fetchFavorites]) // safe dependency
```

See: `src/contexts/favorites-context.tsx`

### Device Detection Custom Hook

Project includes custom hook for responsive logic:

```typescript
import { useDeviceDetection } from '@/lib/device-detection'

export function BookingStep1({ /* props */ }) {
  const { isMobile } = useDeviceDetection()

  return (
    <div className={isMobile ? 'pb-24' : ''}>
      {/* content */}
    </div>
  )
}
```

---

## Data Fetching

### Client-Side Fetching

Use async/await with try/catch:

```typescript
const fetchPets = useCallback(async () => {
  if (!user) return

  try {
    setPetsLoading(true)
    const userPets = await petsApi.getUserPets(user.id)
    setPets(userPets)
  } catch (error) {
    console.error('Error fetching pets:', error)
  } finally {
    setPetsLoading(false)
  }
}, [user])
```

### API Client Methods

Create typed API client methods:

```typescript
export const bookingApi = {
  async getProviderBookings(providerId: string): Promise<Booking[]> {
    const headers = await getHeaders()
    const response = await fetch(`${API_BASE_URL}/api/bookings?provider_id=${providerId}`, {
      headers
    })
    if (!response.ok) {
      throw new Error('Failed to fetch provider bookings')
    }
    const data: BookingsResponse = await response.json()
    return data.bookings
  }
}
```

**Pattern:**
- Methods are async
- Return typed data
- Get auth headers dynamically
- Throw on non-OK responses

See: `src/lib/bookings.ts`

---

## Database Interactions

### Supabase Client Setup

```typescript
// Client-side (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side (API routes)
export const createSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(supabaseUrl, supabaseServiceKey)
}
```

### Query Patterns

```typescript
const supabaseAdmin = createSupabaseAdmin()

// Simple select
const { data, error } = await supabaseAdmin
  .from('bookings')
  .select('*')
  .eq('provider_id', providerId)

// With relationships
const { data: bookings } = await supabaseAdmin
  .from('bookings')
  .select(`
    *,
    customer:users!customer_id(id, full_name, email, phone),
    provider:providers(id, business_name, user_id),
    service:services(id, name, price, description),
    pet:pets(id, name, species, breed, age, profile_picture)
  `)

// Insert
const { data: booking } = await supabaseAdmin
  .from('bookings')
  .insert({ /* data */ })
  .select()
  .single()
```

---

## Naming Patterns

### Variable Naming

- Use descriptive, camelCase names
- Boolean variables prefix with `is`, `has`, `can`, `should`
- Array/collection variables use plural: `bookings`, `pets`, `services`

```typescript
const [isLoading, setIsLoading] = useState(false)
const [canProceed, setCanProceed] = useState(false)
const [selectedDate, setSelectedDate] = useState<Date | undefined>()
const [pets, setPets] = useState<Pet[]>([])
const [isFavorited, setIsFavorited] = useState(false)
```

### Function Naming

- Use verb-based names: `fetchPets`, `handleServiceSelect`, `toggleFavorite`
- Event handlers prefix with `handle`: `handleNext`, `handleComplete`
- Async functions explicitly named as such

```typescript
const handleServiceSelect = (service: any) => { }
const handleNext = () => { }
const handleComplete = async () => { }
const fetchProviderData = async () => { }
const toggleFavorite = async (providerId: string) => { }
```

---

## Localization

### Translation Function

The project uses a `t()` function for translations:

```typescript
import { t } from '@/lib/translations'

export const FeaturedProviders = () => {
  return (
    <h2>{t('landing.featuredProviders.title')}</h2>
    <p>{t('landing.featuredProviders.subtitle')}</p>
  )
}
```

This enables easy internationalization. Translation keys use dot notation for nested namespaces.

---

## Form Handling

### Form Data Interfaces

Define interfaces for form data:

```typescript
export interface BookingFormData {
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string
  age: string
  // ...
}
```

### Form Submission

Multi-step forms handle submission with state management:

```typescript
const handleComplete = async () => {
  if (!selectedDate) return

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Please sign in to continue')
      return
    }

    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(/* form data */)
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error:', error)
    toast.error('Failed to complete action')
  }
}
```

---

## CSS and Styling

### Tailwind CSS Classes

- Use Tailwind utility classes directly on elements
- Group responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Use consistent spacing scale: `p-4`, `mb-6`, `gap-2`

```typescript
<div className="space-y-6">
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* items */}
  </div>
</div>
```

### Dark Mode Support

Some components include dark mode classes:

```typescript
className="dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
```

### Responsive Patterns

Common responsive patterns:

```typescript
// Mobile-first (base = mobile, add for larger)
className="flex flex-col md:flex-row"

// Desktop features (conditionally applied)
className={isMobile ? 'fixed bottom-0 left-0 right-0' : ''}

// Combined
className={`max-w-4xl mx-auto ${isMobile ? 'pb-24' : ''}`}
```

---

## Summary of Key Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| React Context | `src/contexts/*.tsx` | Global state (auth, favorites, notifications) |
| Error Boundary | `src/components/error-boundary.tsx` | Error handling wrapper |
| Protected Routes | `src/components/protected-route.tsx` | Role-based access |
| API Clients | `src/lib/*.ts` | Typed API methods |
| Supabase Setup | `src/lib/supabase.ts` | Database client config |
| Auth Middleware | `src/lib/auth.ts` | Request authentication |
| Component Props | `src/components/*/types.ts` | TypeScript interfaces |
| Multi-Step Forms | `src/components/*/booking-*` | Wizard pattern |
| shadcn/ui | `src/components/ui/*.tsx` | Styled components with CVA |

---

**Last Updated:** February 22, 2026
**Next.js Version:** 16.0.10
**TypeScript Version:** 5.x
**React Version:** 19.1.0
