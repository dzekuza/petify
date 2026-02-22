# Technology Stack - Petify Pet Care Marketplace

## Runtime & Language

- **Node.js**: 20.x (specified in `package.json`)
- **TypeScript**: ^5 (TypeScript 5.x in strict mode)
  - **Config file**: `tsconfig.json`
  - **Compiler options**: ES2017 target, strict mode enabled, bundler module resolution, JSX as react-jsx
  - **Path aliases**: `@/*` → `./src/*` for cleaner imports

## Framework & Build Tools

### Core Framework
- **Next.js**: ^16.0.10 (App Router with Turbopack)
  - **Config file**: `next.config.ts`
  - **Features**: React Server Components, Turbopack bundler, built-in TypeScript support
  - **Output**: `.next` directory (configured in Vercel deployment)
  - **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection configured

### React
- **React**: 19.1.0
- **React DOM**: 19.1.0

## UI Framework & Styling

### Styling Engine
- **TailwindCSS**: ^4
  - **Config integration**: `@tailwindcss/postcss` plugin via `postcss.config.mjs`
  - **Build tool**: PostCSS for CSS processing

### Component Library
- **shadcn/ui** - UI component collection built on Radix primitives
- **Radix UI** - Primitives for accessible web components
  - `@radix-ui/react-avatar`: ^1.1.10
  - `@radix-ui/react-checkbox`: ^1.3.3
  - `@radix-ui/react-collapsible`: ^1.1.12
  - `@radix-ui/react-dialog`: ^1.1.15
  - `@radix-ui/react-dropdown-menu`: ^2.1.16
  - `@radix-ui/react-label`: ^2.1.7
  - `@radix-ui/react-popover`: ^1.1.15
  - `@radix-ui/react-progress`: ^1.1.7
  - `@radix-ui/react-scroll-area`: ^1.2.10
  - `@radix-ui/react-select`: ^2.2.6
  - `@radix-ui/react-separator`: ^1.1.7
  - `@radix-ui/react-slider`: ^1.3.6
  - `@radix-ui/react-slot`: ^1.2.3
  - `@radix-ui/react-switch`: ^1.2.6
  - `@radix-ui/react-tabs`: ^1.1.13
  - `@radix-ui/react-toast`: ^1.2.15
  - `@radix-ui/react-tooltip`: ^1.2.8

### Utility Libraries
- **class-variance-authority**: ^0.7.1 - CSS-in-JS variant system
- **clsx**: ^2.1.1 - Conditional class name composition
- **tailwind-merge**: ^3.3.1 - Merge Tailwind CSS classes intelligently
- **Lucide React**: ^0.542.0 - Icon library (1600+ icons)

### Animation & Motion
- **Framer Motion**: ^12.23.12 - React animation library
- **sonner**: ^2.0.7 - Toast notification system
- **vaul**: ^1.1.2 - Drawer component library
- **next-themes**: ^0.4.6 - Dark mode support

## Data Management & State

### Server State Management
- **TanStack React Query**: ^5.87.1
  - **Config file**: `src/lib/query-client.ts`
  - **Stale time**: 5 minutes
  - **Cache time**: 30 minutes
  - **Retry strategy**: Max 3 attempts, no retry on 4xx errors
  - **Dev Tools**: `@tanstack/react-query-devtools`: ^5.87.1

### Database
- **Supabase**: PostgreSQL database with Auth
  - **Client library**: `@supabase/supabase-js`: ^2.57.2
  - **Configuration file**: `src/lib/supabase.ts`
  - **Features**: Client-side auth, Server-side admin client with service role, auto-refresh tokens
  - **Storage buckets**:
    - `profile-images` - User avatars
    - `service-images` - Service listings
    - `pet-images` - Pet photos and galleries
    - `provider-images` - Provider profile pictures and covers
    - `assets` - General assets

## Payment Processing

- **Stripe**: ^18.5.0 (Server-side SDK)
  - **Client SDK**: `@stripe/stripe-js`: ^7.9.0
  - **React Integration**: `@stripe/react-stripe-js`: ^4.0.0
  - **Config file**: `src/lib/stripe.ts`
  - **API version**: 2025-08-27.basil
  - **Currency**: EUR (€)
  - **Features**:
    - Payment intent creation
    - Automatic payment methods
    - Webhook handling for payment events
    - Refund support
    - Test card numbers for development

## Email & Communication

- **Resend**: ^6.0.3 - Email delivery service
  - **Configuration files**:
    - `src/lib/email/email-service.ts` - Main email service
    - `src/lib/email/template-engine.ts` - Email template rendering
    - `src/lib/email/pdf-generator.ts` - Invoice PDF generation
  - **Features**:
    - Booking confirmation emails
    - Welcome emails
    - Booking update notifications
    - Payment confirmation emails
    - Provider notification emails
    - Invoice generation (via jsPDF)

## Maps & Geolocation

### Map Libraries
- **Mapbox GL**: ^3.14.0 - Vector map rendering
  - **React wrapper**: `react-map-gl`: ^8.0.4
  - **Config file**: `src/lib/mapbox.ts`
  - **Features**: Custom styles, provider markers, zoom controls
  - **Default location**: Vilnius, Lithuania (23.8813, 54.6872)
  - **Style options**: Streets, Satellite, Light, Dark, Custom

- **Leaflet**: ^1.9.4 - Alternative map library
  - **React wrapper**: `react-leaflet`: ^5.0.0

### Geocoding & Address Services
- **Mapbox Geocoding API** - Address lookup and conversion
  - **Config file**: `src/lib/geocoding.ts`
  - **Used for**: Provider address autocomplete, location-based search

## Document Generation

- **jsPDF**: ^3.0.2 - PDF generation
  - **Use case**: Invoice and booking confirmation PDFs
  - **Integration**: `src/lib/email/pdf-generator.ts`

## Date & Time

- **date-fns**: ^4.1.0 - Date manipulation and formatting
  - Used for booking dates, time calculations
- **react-day-picker**: ^9.9.0 - Date picker component

## Development Tools

### Linting & Code Quality
- **ESLint**: ^9
  - **Config file**: `.eslintrc.json`
  - **Base config**: `eslint-config-next`: ^16.0.10
  - **Rules**: Warnings for unused vars, explicit any, img elements, html links for pages

### Testing
- **Playwright**: ^1.55.0 - E2E testing framework
  - **Config file**: Implied in test setup
  - **Scripts**: `npm run e2e` and `npm run e2e:ui`

### Build & Development
- **npm**: Package manager (migrated from pnpm per recent commit)
- **Turbopack**: Next.js 16 bundler (with mapbox-gl transpiling configured)

## Environment Variables

### Public (Client-side)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox API token
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_SITE_PASSWORD` - Site protection password (optional, default: '123')

### Secret (Server-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin/service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `RESEND_API_KEY` - Resend email API key
- `RESEND_FROM_EMAIL` - Default sender email (default: noreply@petify.lt)

## Deployment

- **Platform**: Vercel
  - **Config file**: `vercel.json`
  - **Build command**: npm build
  - **Dev command**: npm dev
  - **Install command**: npm install
  - **Output directory**: `.next`
  - **Framework**: Next.js
  - **Regions**: IAD1 (US East, Virginia)
  - **Security headers**: Enforced via Vercel config

## Scripts

```json
{
  "dev": "next dev",           // Development server with Turbopack
  "build": "next build",       // Production build
  "start": "next start",       // Start production server
  "lint": "eslint",            // Run ESLint
  "e2e": "playwright test",    // Run E2E tests
  "e2e:ui": "playwright test --ui"  // Run tests with UI
}
```

## Type Definitions

- `@types/node`: ^20 - Node.js types
- `@types/react`: ^19 - React types
- `@types/react-dom`: ^19 - React DOM types
- `@types/leaflet`: ^1.9.20 - Leaflet map types
- `@types/mapbox-gl`: ^3.4.1 - Mapbox types
- **TypeScript strict mode**: Enforced throughout codebase

## Package Manager

- **Migration**: Recently migrated from pnpm to npm (per commit 23265e0)
- **Current**: npm (v20.x compatible)

## PostCSS Configuration

- **Config file**: `postcss.config.mjs`
- **Plugins**: `@tailwindcss/postcss` for TailwindCSS v4 integration
