# PetServices Development Guide

## Project Overview

PetServices is an Airbnb-style marketplace for pet service providers (groomers,
veterinary, boarding, training, care, ads). Built with Next.js 14, TypeScript,
and modern React patterns.

## Architecture & Tech Stack

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui + Radix primitives
- **State Management**: TanStack Query (React Query)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest + React Testing Library + Playwright
- **Package Manager**: pnpm

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign-in page
│   │   └── signup/        # Sign-up page
│   ├── providers/         # Provider-related pages
│   │   └── [id]/          # Dynamic provider pages
│   ├── provider/          # Provider dashboard
│   ├── search/            # Search functionality
│   ├── profile/           # User profile
│   ├── how-it-works/      # Information page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── __tests__/         # Component tests
│   ├── layout.tsx         # Main layout wrapper
│   ├── navigation.tsx     # Navigation bar
│   ├── footer.tsx         # Footer component
│   ├── hero-section.tsx   # Homepage hero
│   ├── service-categories.tsx
│   ├── featured-providers.tsx
│   ├── search-filters.tsx
│   ├── search-results.tsx
│   ├── provider-card.tsx  # Provider listing card
│   ├── booking-modal.tsx  # Booking flow
│   ├── protected-route.tsx
│   └── providers.tsx      # Context providers
├── contexts/              # React contexts
│   └── auth-context.tsx   # Authentication context
├── lib/                   # Utilities and configurations
│   ├── utils.ts           # Utility functions
│   ├── supabase.ts        # Supabase client
│   ├── query-client.ts    # TanStack Query setup
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
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) redirect("/auth/signin");

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
    status: "active" | "inactive";
}

interface Booking {
    id: string;
    customerId: string;
    providerId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    status: BookingStatus;
    totalPrice: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
```

### 3. UI Components

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

**Props Interface:**

```typescript
interface ProviderCardProps {
    provider: ServiceProvider;
    services: Service[];
    distance?: number;
    showActions?: boolean;
    className?: string;
}
```

#### Navigation (`src/components/navigation.tsx`)

**Features:**

- Responsive mobile menu
- Authentication-aware links
- User dropdown menu
- Logo and branding
- Search integration

### 4. State Management

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

#### Providers Wrapper (`src/components/providers.tsx`)

```typescript
export const Providers = ({ children }: ProvidersProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};
```

### 5. Styling Patterns

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

### 6. Testing Strategy

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
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        ),
        ...options,
    });
};
```

#### Component Tests

- **Unit tests** for individual components
- **Mock data** for consistent testing
- **Accessibility testing** with jest-dom matchers
- **User interaction testing** with user-event

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
        toast.success("Success!");
    } catch (error) {
        toast.error("Something went wrong");
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Package Scripts

```json
{
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest --run",
    "test:watch": "vitest",
    "e2e": "playwright test"
}
```

## Current Features Implemented

### ✅ Completed Features

1. **Authentication System**
   - Sign-in/Sign-up pages
   - Protected routes
   - User context management
   - Role-based access

2. **Core Pages**
   - Homepage with hero section
   - Search functionality
   - Provider profiles
   - User profile management

3. **UI Components**
   - Provider cards with ratings
   - Navigation with mobile menu
   - Search filters and results
   - Responsive layout

4. **Testing Infrastructure**
   - Unit tests for components
   - Test utilities and setup
   - Mock data for testing

### 🔄 In Progress / Next Steps

1. **Database Integration**
   - Supabase schema setup
   - Data fetching with React Query
   - Real-time updates

2. **Advanced Features**
   - Booking flow implementation
   - Payment integration
   - Review and rating system
   - Provider dashboard

3. **Performance Optimization**
   - Image optimization
   - Caching strategies
   - Bundle optimization

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

# Build for production
pnpm build

# Start production server
pnpm start
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

This guide provides the foundation for continuing development in the same style
and patterns. Follow these conventions for consistency and maintainability.
