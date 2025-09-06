# PetServices Development Guide

## Project Overview

PetServices is an Airbnb-style marketplace for pet service providers (groomers,
veterinary, boarding, training, care, ads). Built with Next.js 15, TypeScript,
and modern React patterns.

## Architecture & Tech Stack

### Core Technologies

- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui + Radix primitives
- **State Management**: TanStack Query (React Query)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Maps**: Mapbox GL + React Map GL + Leaflet
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library + Playwright
- **Package Manager**: pnpm

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── bookings/      # Booking API endpoints
│   │       ├── [id]/      # Dynamic booking routes
│   │       └── route.ts   # Bookings collection
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign-in page
│   │   └── signup/        # Sign-up page
│   ├── providers/         # Provider-related pages
│   │   └── [id]/          # Dynamic provider pages
│   │       ├── book/      # Booking flow
│   │       └── page.tsx   # Provider profile
│   ├── provider/          # Provider dashboard
│   │   ├── bookings/      # Provider bookings management
│   │   ├── dashboard/     # Main provider dashboard
│   │   └── signup/        # Provider registration
│   ├── search/            # Search functionality
│   ├── profile/           # User profile
│   ├── how-it-works/      # Information page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── visualize-booking.tsx
│   ├── __tests__/         # Component tests
│   ├── layout.tsx         # Main layout wrapper
│   ├── navigation.tsx     # Navigation bar
│   ├── footer.tsx         # Footer component
│   ├── hero-section.tsx   # Homepage hero
│   ├── service-categories.tsx
│   ├── featured-providers.tsx
│   ├── search-filters.tsx
│   ├── search-results.tsx
│   ├── search-layout.tsx
│   ├── provider-card.tsx  # Provider listing card
│   ├── booking-modal.tsx  # Booking flow
│   ├── protected-route.tsx
│   ├── providers.tsx      # Context providers
│   ├── map-view.tsx       # Map integration
│   ├── mapbox-map.tsx     # Mapbox implementation
│   ├── map-controls.tsx   # Map controls
│   └── notifications.tsx  # Notification system
├── contexts/              # React contexts
│   ├── auth-context.tsx   # Authentication context
│   └── notifications-context.tsx # Notifications context
├── lib/                   # Utilities and configurations
│   ├── utils.ts           # Utility functions
│   ├── supabase.ts        # Supabase client
│   ├── query-client.ts    # TanStack Query setup
│   ├── providers.ts       # Provider API functions
│   ├── services.ts        # Service API functions
│   ├── bookings.ts        # Booking API functions
│   ├── mapbox.ts          # Mapbox configuration
│   └── __tests__/         # Utility tests
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core types
└── test/                  # Test utilities
    ├── setup.ts           # Test setup
    └── utils.tsx          # Test utilities
```

## Core Components & Patterns

### 1. Authentication System

#### Auth Context (`src/contexts/auth-context.tsx`)

```typescript
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        fullName: string,
        role: "customer" | "provider",
    ) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}
```

**Key Features:**

- Global authentication state management
- Supabase Auth integration
- Loading states and error handling
- Role-based access (customer/provider)

#### Protected Routes (`src/components/protected-route.tsx`)

```typescript
const ProtectedRoute = ({ children, requiredRole }: {
    children: React.ReactNode;
    requiredRole?: "customer" | "provider";
}) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) redirect("/auth/signin");
    if (requiredRole && user.role !== requiredRole) {
        redirect("/unauthorized");
    }

    return <>{children}</>;
};
```

### 2. Data Types (`src/types/index.ts`)

#### Core Interfaces

```typescript
interface ServiceProvider {
    id: string;
    userId: string;
    businessName: string;
    description: string;
    services: ServiceCategory[];
    location: Location;
    rating: number;
    reviewCount: number;
    priceRange: { min: number; max: number };
    availability: WeeklyAvailability;
    images: string[];
    certifications: string[];
    experience: number;
    status: "active" | "inactive" | "pending";
    createdAt: string;
    updatedAt: string;
}

interface Service {
    id: string;
    providerId: string;
    category: ServiceCategory;
    name: string;
    description: string;
    price: number;
    duration: number;
    maxPets: number;
    requirements: string[];
    includes: string[];
    images: string[];
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

interface Booking {
    id: string;
    customerId: string;
    providerId: string;
    serviceId: string;
    date: string;
    timeSlot: TimeSlot;
    pets: Pet[];
    totalPrice: number;
    status: BookingStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
```

### 3. API Layer

#### Provider API (`src/lib/providers.ts`)

```typescript
export const providerApi = {
    createProvider: (data: CreateProviderData) => Promise<Provider>,
    getProviderByUserId: (userId: string) => Promise<Provider>,
    updateProvider: (providerId: string, data: UpdateProviderData) =>
        Promise<Provider>,
    getProviders: (filters?: ProviderFilters) => Promise<Provider[]>,
    deleteProvider: (providerId: string) => Promise<boolean>,
    isProvider: (userId: string) => Promise<boolean>,
};
```

#### Service API (`src/lib/services.ts`)

```typescript
export const serviceApi = {
    createService: (data: CreateServiceData) => Promise<Service>,
    getServicesByProvider: (providerId: string) => Promise<Service[]>,
    getServiceById: (serviceId: string) => Promise<Service>,
    updateService: (serviceId: string, data: UpdateServiceData) =>
        Promise<Service>,
    deleteService: (serviceId: string) => Promise<boolean>,
    getServices: (filters?: ServiceFilters) => Promise<Service[]>,
};
```

#### Booking API (`src/lib/bookings.ts`)

```typescript
export const bookingApi = {
    getProviderBookings: (providerId: string) => Promise<Booking[]>,
    getCustomerBookings: (customerId: string) => Promise<Booking[]>,
    getBooking: (bookingId: string) => Promise<Booking>,
    updateBookingStatus: (bookingId: string, data: UpdateBookingRequest) =>
        Promise<Booking>,
    acceptBooking: (bookingId: string) => Promise<Booking>,
    rejectBooking: (bookingId: string, reason?: string) => Promise<Booking>,
    completeBooking: (bookingId: string) => Promise<Booking>,
};
```

### 4. UI Components

#### Provider Card (`src/components/provider-card.tsx`)

**Key Features:**

- Responsive design with hover effects
- Availability status with real-time updates
- Service categories with emoji icons
- Rating and review display
- Price range display
- Action buttons (View Profile, Book Now)
- Certification badges
- Experience information

#### Interactive Calendar (`src/components/ui/visualize-booking.tsx`)

**Features:**

- Framer Motion animations
- Monthly and weekly views
- Booking visualization
- Interactive day selection
- Responsive design
- Real-time availability updates

#### Map Integration (`src/components/mapbox-map.tsx`)

**Features:**

- Mapbox GL integration
- Provider location markers
- Interactive map controls
- Search integration
- Responsive design
- Custom map styles

### 5. State Management

#### TanStack Query Setup (`src/lib/query-client.ts`)

```typescript
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
});
```

#### Notifications Context (`src/contexts/notifications-context.tsx`)

```typescript
interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, "id">) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}
```

### 6. Styling Patterns

#### TailwindCSS + shadcn/ui

- **Utility-first approach** with Tailwind classes
- **Component library** with shadcn/ui for consistency
- **Responsive design** with mobile-first approach
- **Dark mode support** built-in
- **Accessibility** with proper ARIA attributes

#### Class Naming Conventions

```typescript
// Conditional classes with clsx
const buttonClasses = cn(
    "base-classes",
    variant === "primary" && "primary-classes",
    size === "large" && "large-classes",
    className, // Allow custom overrides
);
```

### 7. Testing Strategy

#### Test Setup (`src/test/setup.ts`)

```typescript
import "@testing-library/jest-dom";
```

#### Test Utilities (`src/test/utils.tsx`)

```typescript
const render = (ui: React.ReactElement, options?: RenderOptions) => {
    return testingLibraryRender(ui, {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <NotificationsProvider>
                        {children}
                    </NotificationsProvider>
                </AuthProvider>
            </QueryClientProvider>
        ),
        ...options,
    });
};
```

## Development Patterns

### 1. Component Structure

```typescript
"use client"; // Only when needed for client-side features

import { useState } from "react";
import { ComponentProps } from "@/types";
import { cn } from "@/lib/utils";

interface ComponentProps {
    // Props definition
}

export const Component = ({ prop1, prop2, className }: ComponentProps) => {
    // State and hooks
    const [state, setState] = useState();

    // Event handlers (prefixed with 'handle')
    const handleClick = () => {
        // Handler logic
    };

    // Early returns for loading/error states
    if (loading) return <LoadingSpinner />;

    return (
        <div className={cn("base-classes", className)}>
            {/* Component JSX */}
        </div>
    );
};
```

### 2. Event Handler Naming

- **Always prefix** with `handle`: `handleClick`, `handleSubmit`,
  `handleKeyDown`
- **Use arrow functions**: `const handleClick = () => {}`
- **Avoid function declarations** except for types/interfaces

### 3. TypeScript Patterns

```typescript
// Prefer type over interface for simple shapes
type UserRole = "customer" | "provider";

// Use interface for complex objects
interface ServiceProvider {
    // Complex object definition
}

// Generic types for reusable patterns
type ApiResponse<T> = {
    data: T;
    error?: string;
};
```

### 4. Error Handling

```typescript
// Async operations with proper error handling
const handleSubmit = async (data: FormData) => {
    try {
        setLoading(true);
        await submitData(data);
        addNotification({
            type: "success",
            title: "Success!",
            message: "Data submitted successfully",
        });
    } catch (error) {
        addNotification({
            type: "error",
            title: "Error",
            message: "Something went wrong",
        });
    } finally {
        setLoading(false);
    }
};
```

### 5. Accessibility Patterns

```typescript
// Interactive elements with proper accessibility
<button
    onClick={handleClick}
    onKeyDown={handleKeyDown}
    aria-label="Close modal"
    tabIndex={0}
    className="focus:ring-2 focus:ring-blue-500"
>
    Close
</button>;
```

## Environment Setup

### Required Environment Variables (`.env.local`)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Package Scripts

```json
{
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
}
```

## Current Features Implemented

### ✅ Completed Features

1. **Authentication System**
   - Sign-in/Sign-up pages with role selection
   - Protected routes with role-based access
   - User context management
   - Password reset functionality

2. **Provider Management**
   - Provider registration and onboarding
   - Provider dashboard with analytics
   - Service management (CRUD operations)
   - Profile editing and management
   - Availability management

3. **Service Management**
   - Create, read, update, delete services
   - Service categories based on provider type
   - Service requirements and includes
   - Pricing and duration management
   - Service status management

4. **Booking System**
   - Booking creation and management
   - Booking status updates (pending, confirmed, completed, cancelled)
   - Provider booking dashboard
   - Interactive calendar visualization
   - Booking notifications

5. **Search & Discovery**
   - Advanced search with filters
   - Map-based provider discovery
   - Service category filtering
   - Location-based search
   - Provider rating and review display

6. **UI Components**
   - Provider cards with ratings
   - Navigation with mobile menu
   - Search filters and results
   - Interactive maps with Mapbox
   - Responsive layout
   - Notification system
   - Modal dialogs and forms

7. **Database Integration**
   - Complete Supabase schema
   - Row Level Security (RLS) policies
   - Real-time subscriptions
   - File storage for images
   - Database functions and triggers

8. **API Layer**
   - RESTful API endpoints
   - Booking management API
   - Provider and service APIs
   - Error handling and validation
   - Type-safe API responses

9. **Testing Infrastructure**
   - Unit tests for components
   - Test utilities and setup
   - Mock data for testing
   - E2E test framework setup

### 🔄 In Progress / Next Steps

1. **Advanced Features**
   - Payment integration (Stripe)
   - Real-time chat between customers and providers
   - Review and rating system
   - Advanced analytics dashboard
   - Email notifications

2. **Performance Optimization**
   - Image optimization with Next.js Image
   - Caching strategies with React Query
   - Bundle optimization
   - Lazy loading for components

3. **Mobile Experience**
   - Progressive Web App (PWA) features
   - Mobile-specific optimizations
   - Touch-friendly interactions

## Database Schema

### Core Tables

- **users** - User accounts and profiles
- **providers** - Service providers (groomers, vets, etc.)
- **services** - Individual services offered by providers
- **pets** - Pet profiles
- **bookings** - Appointment bookings
- **reviews** - Customer reviews and ratings

### Communication

- **conversations** - Chat conversations
- **messages** - Individual messages
- **notifications** - User notifications

### Additional

- **favorites** - User's favorite providers
- **service_categories** - Service type categories

### Storage Buckets

- **Public**: avatars, provider-images, pet-images, service-images,
  review-images
- **Private**: documents, messages

### Security Features

- Row Level Security (RLS) on all tables
- User authentication with Supabase Auth
- File access controls based on ownership
- Data validation with constraints and triggers

### Database Functions

- `search_providers()` - Geographic search with filters
- `get_provider_availability()` - Check availability slots
- `create_booking()` - Booking creation with validation
- `get_user_dashboard()` - Dashboard data for users/providers

## Code Quality Standards

### 1. TypeScript

- **No `any` types** - use proper typing
- **Strict mode enabled** for better type safety
- **Interface over type** for complex objects
- **Generic types** for reusable patterns

### 2. React Patterns

- **Functional components** with hooks
- **Early returns** for better readability
- **Custom hooks** for reusable logic
- **Proper dependency arrays** in useEffect

### 3. Styling

- **Tailwind classes** for all styling
- **No separate CSS files** unless absolutely necessary
- **Responsive design** with mobile-first approach
- **Consistent spacing** using Tailwind scale

### 4. Testing

- **Unit tests** for all components
- **Mock data** for consistent testing
- **Accessibility testing** with jest-dom
- **User interaction testing** with user-event

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Build for production
pnpm build

# Start production server
pnpm start

# Run E2E tests
pnpm e2e

# Run E2E tests with UI
pnpm e2e:ui
```

### Adding New Components

```bash
# Add shadcn/ui component
npx shadcn@latest add button

# Add new component
mkdir src/components/new-component
touch src/components/new-component/index.tsx
```

### Database Operations

```bash
# Supabase CLI commands
supabase start
supabase db reset
supabase gen types typescript --local > src/types/supabase.ts
```

## Best Practices

### 1. Component Design

- **Single responsibility** - one component, one purpose
- **Composition over inheritance** - build complex UIs from simple components
- **Props interface** - always define clear prop types
- **Default props** - provide sensible defaults

### 2. State Management

- **Local state** for component-specific data
- **Context** for global app state
- **React Query** for server state
- **Avoid prop drilling** - use context when needed

### 3. Performance

- **React.memo** for expensive components
- **useMemo/useCallback** for expensive calculations
- **Lazy loading** for route-based code splitting
- **Image optimization** with next/image

### 4. Accessibility

- **Semantic HTML** - use proper elements
- **ARIA attributes** - for complex interactions
- **Keyboard navigation** - ensure all features are keyboard accessible
- **Focus management** - proper focus handling in modals/dropdowns

### 5. Error Handling

- **Try-catch blocks** for async operations
- **User-friendly error messages** via notifications
- **Graceful degradation** for failed operations
- **Loading states** for better UX

### 6. Security

- **Input validation** on both client and server
- **SQL injection prevention** with parameterized queries
- **XSS prevention** with proper sanitization
- **Authentication checks** on protected routes

This guide provides the foundation for continuing development in the same style
and patterns. Follow these conventions for consistency and maintainability.
