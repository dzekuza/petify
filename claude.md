# Petify - Claude Code Project Guide

## Project Overview

**Petify** is a Next.js 15 full-stack pet service marketplace connecting pet service providers (groomers, veterinarians, trainers, boarders, sitters) with pet owners.

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Maps**: Mapbox GL
- **Email**: Resend
- **Styling**: TailwindCSS 4 + Radix UI + shadcn/ui

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # 29 API route handlers
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── provider/          # Provider routes
│   ├── bookings/          # Booking flow
│   └── ...
├── components/            # React components (70+)
│   ├── ui/               # shadcn/ui components
│   ├── booking/          # Booking wizard
│   ├── provider-dashboard/
│   └── ...
├── lib/                   # Core utilities
├── contexts/              # React contexts (auth, favorites, notifications)
├── hooks/                 # Custom hooks
└── types/                 # TypeScript definitions
```

## Key Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test         # Run Playwright tests
```

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `RESEND_API_KEY`

---

# Security Audit Report

> **Audit Date**: 2025-12-17
> **Last Updated**: 2025-12-17
> **Severity Scale**: CRITICAL > HIGH > MEDIUM > LOW

## Executive Summary

This audit identified **62+ issues** across the codebase. **11 critical/high issues have been fixed**.

### Fixed Issues Summary
- ✅ 7/7 CRITICAL vulnerabilities fixed
- ✅ 4/15 HIGH severity issues fixed
- ⏳ 40+ MEDIUM severity issues pending

---

## CRITICAL VULNERABILITIES

### 1. ✅ FIXED - Unauthenticated Admin Promotion Endpoint
**File**: `src/app/api/admin/promote-to-admin/route.ts`
**Status**: Fixed - Now requires admin authentication via `requireAdmin()` helper

---

### 2. ✅ FIXED - Unauthenticated User Role Manipulation
**File**: `src/app/api/fix-user-role/route.ts`
**Status**: Fixed - Endpoint has been **deleted entirely**

---

### 3. ✅ FIXED - Self-Privilege Escalation
**File**: `src/app/api/users/update-role/route.ts`
**Status**: Fixed - Role whitelist now only allows `['customer', 'provider']`, admin self-assignment blocked

---

### 4. ✅ FIXED - Unauthenticated Booking Access (IDOR)
**File**: `src/app/api/bookings/route.ts`
**Status**: Fixed - Authentication required, authorization checks verify ownership

---

### 5. ✅ FIXED - Unauthenticated Review Submission
**File**: `src/app/api/reviews/route.ts`
**Status**: Fixed - Authentication required, booking ownership verified, only completed bookings can be reviewed

---

### 6. ✅ FIXED - Provider Role Demo Bypass
**File**: `src/components/protected-route.tsx:26-27`
**Status**: Fixed - Demo bypass removed, proper role checking implemented

---

### 7. ✅ FIXED - PCI DSS Violation - Direct Card Data Collection
**File**: `src/app/providers/[id]/payment/page.tsx`
**Status**: Fixed - Page has been **deleted entirely**

---

## HIGH SEVERITY ISSUES

### 8. ✅ FIXED - Client-Side Price Manipulation
**Files**: `src/app/api/checkout/create-session/route.ts`
**Status**: Fixed - Server-side price validation from database, price variance detection

---

### 9. Missing Input Validation
**File**: `src/app/api/providers/route.ts`
**Impact**: XSS, data corruption

```typescript
// All fields inserted without validation or sanitization
.insert({
  business_name: data.business_name,
  description: data.description,  // Could contain scripts
})
```

**Fix**: Add input validation and HTML sanitization.

---

### 10. Missing Rate Limiting
**Files**: Most API routes except chat
**Impact**: DoS, brute force attacks, spam

**Fix**: Implement rate limiting middleware for all endpoints.

---

### 11. Missing CSRF Protection
**Files**: All POST/PATCH/DELETE endpoints
**Impact**: Cross-site request forgery attacks

**Fix**: Implement CSRF tokens for state-changing operations.

---

### 12. Information Leakage in Errors
**File**: `src/app/api/users/update-profile/route.ts` and others
**Impact**: Exposes internal system details

```typescript
return NextResponse.json({ error: `Failed: ${updateError.message}` })
```

**Fix**: Log detailed errors internally, return generic messages to clients.

---

### 13. Race Condition in Booking Creation
**File**: `src/app/api/checkout/verify-session/route.ts`
**Impact**: Duplicate bookings possible

```typescript
// Check-then-act pattern without transaction
const { data: existingBooking } = await ...select...
if (!existingBooking) {
  await ...insert...  // Race window here
}
```

**Fix**: Use database unique constraint on `payment_id` or transactions.

---

### 14. Silent Webhook Failures
**File**: `src/lib/payments.ts:179-182`
**Impact**: Payments marked successful when DB update fails

```typescript
if (bookingError) {
  console.error('Error updating booking:', bookingError)
  // Don't fail webhook - WRONG!
}
return { success: true }  // Always returns success
```

**Fix**: Return error status if critical operations fail.

---

### 15. ✅ FIXED - Missing Error Boundaries
**Status**: Fixed - ErrorBoundary component created at `src/components/error-boundary.tsx` and integrated into Providers wrapper

---

## MEDIUM SEVERITY ISSUES

### 16. TypeScript 'any' Abuse (28+ instances)
**Files**: `src/components/booking/types.ts`, multiple components

```typescript
export interface BookingStepProps {
  provider: any
  services: any[]
  pets: any[]
}
```

**Fix**: Create proper TypeScript interfaces.

---

### 17. Missing useEffect Dependencies
**Files**: `src/components/provider-detail/image-gallery.tsx:59-72`

```typescript
useEffect(() => {
  // Uses handlePreviousImage, handleNextImage
}, [validImages, isTransitioning])  // Missing dependencies
```

**Fix**: Add all dependencies or use useCallback.

---

### 18. Memory Leaks from Subscriptions
**File**: `src/contexts/notifications-context.tsx`

```typescript
const channel = supabase.channel('notifications')
  .on('postgres_changes', ...)
// Missing: .subscribe() and cleanup
```

**Fix**: Properly subscribe and unsubscribe in cleanup.

---

### 19. Race Conditions in Async Code
**File**: `src/components/provider-detail/provider-info.tsx:61-81`

```typescript
useEffect(() => {
  const fetchPetData = async () => {
    // No abort controller - state updates on unmounted component
  }
  fetchPetData()
}, [...])
```

**Fix**: Add AbortController and mounted check.

---

### 20. Index Keys in Lists
**Files**: Multiple components

```typescript
{items.map((item, i) => <div key={i}>...  // Bad
```

**Fix**: Use unique identifiers as keys.

---

### 21. Weak Password Requirements
**File**: `src/app/api/admin/users/[id]/change-password/route.ts:38`

```typescript
if (newPassword.length < 6)  // Too weak
```

**Fix**: Require 12+ characters with complexity.

---

### 22. N+1 Query Problem
**File**: `src/app/api/admin/providers/route.ts:32-76`

```typescript
const providersWithUsers = await Promise.all(
  providers.map(async (provider) => {
    const { data: userData } = await supabase
      .from('users').select(...).eq('id', provider.user_id)  // N queries
  })
)
```

**Fix**: Batch fetch all users in single query using `.in()`.

---

### 23. Session Storage of Sensitive Data
**File**: `src/app/provider/profile/page.tsx:125-126`

```typescript
sessionStorage.setItem('editProviderData', JSON.stringify(editData))
```

**Fix**: Use encrypted secure storage or server-side sessions.

---

### 24. Missing Form Validation
**File**: `src/components/provider-detail/booking-widget.tsx:251-290`

```typescript
const petData = {
  name: addPetForm.name,  // No validation - empty allowed
  age: parseInt(addPetForm.age),  // Could be NaN
}
```

**Fix**: Add client and server-side validation.

---

### 25. Missing Stripe Idempotency Keys
**File**: `src/app/api/payments/create-intent/route.ts:34-45`

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  // No idempotency_key - duplicate payments possible
})
```

**Fix**: Add `idempotency_key` based on booking ID.

---

### 26. Incomplete Payment Failure Handling
**File**: `src/lib/payments.ts:227-245`

```typescript
// Comment says "Here you would typically update..." but doesn't
console.log(`Payment failed for booking ${bookingId}`)
return { success: true }  // Just logs, doesn't update DB
```

**Fix**: Actually update booking status and notify customer.

---

### 27. Sensitive Data in Logs
**File**: `src/app/api/payments/create-intent/route.ts:26-32`

```typescript
console.log('Creating payment intent:', {
  customerEmail: data.customerEmail  // PII in logs
})
```

**Fix**: Redact sensitive data from logs.

---

### 28. Unsafe Null Access
**File**: `src/components/provider-detail/provider-info.tsx:247`

```typescript
{result.provider.services[0]}  // Could be undefined
```

**Fix**: Add optional chaining and fallbacks.

---

## Summary by Severity

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | 7 | Immediate fix required |
| HIGH | 15 | Fix within 1 week |
| MEDIUM | 40+ | Fix within 1 month |

## Priority Fix Order

1. ✅ **Remove** `fix-user-role` endpoint - DONE
2. ✅ **Add authentication** to promote-to-admin, bookings, reviews endpoints - DONE
3. ✅ **Remove** demo bypass in protected-route.tsx - DONE
4. ✅ **Delete** direct card collection payment page - DONE
5. ✅ **Add server-side price validation** in checkout - DONE
6. ⏳ **Implement** rate limiting middleware - PENDING
7. ⏳ **Add** CSRF protection - PENDING
8. ⏳ **Fix** error message information leakage - PENDING
9. ✅ **Add** Error Boundaries to layouts - DONE
10. ⏳ **Replace** 'any' types with proper interfaces - PENDING

## New Security Utilities Added

### Authentication Helper (`src/lib/auth.ts`)
Centralized authentication utilities for API routes:
- `authenticateRequest(request)` - Validates Bearer token and returns user
- `requireAdmin(request)` - Requires admin role
- `requireProvider(request)` - Requires provider or admin role
- `isValidSelfAssignableRole(role)` - Validates self-assignable roles (excludes admin)

### Error Boundary (`src/components/error-boundary.tsx`)
React error boundary for graceful error handling:
- Catches component errors and displays user-friendly UI
- Shows detailed errors in development mode
- Provides retry and refresh functionality
- HOC wrapper available via `withErrorBoundary()`

---

---

# UI Modernization Plan

> **Plan Created**: 2025-12-17
> **Status**: Ready for Implementation
> **Documentation**: See [UI_MODERNIZATION_PLAN.md](UI_MODERNIZATION_PLAN.md)

A comprehensive UI modernization plan has been created to enhance the visual design and user experience across Petify. The plan covers:

## Scope
- **Landing Page**: Hero section, filters, category sections
- **Provider Cards**: Modern card design with glassmorphism effects
- **Bookings Page**: Timeline-style booking cards with enhanced status indicators
- **Navigation**: Sticky header with blur effects
- **Search Page**: Improved filters and map integration
- **Component Library**: Enhanced buttons, inputs, and cards

## Key Improvements
- Modern glassmorphism and gradient effects
- Smooth animations using Framer Motion
- Enhanced color system with depth
- Improved typography hierarchy
- Better mobile responsiveness
- Accessibility improvements (WCAG 2.1 AA)
- Performance optimizations

## Implementation Phases
1. **Phase 1**: Foundation (design system updates)
2. **Phase 2**: Landing page modernization
3. **Phase 3**: Core pages (bookings, search)
4. **Phase 4**: Polish and testing

For detailed specifications, component-by-component changes, and implementation guidelines, see the full plan in `UI_MODERNIZATION_PLAN.md`.

---

## Development Guidelines

### API Route Security Checklist
- [ ] Authentication check at start of handler
- [ ] Authorization check (user owns resource)
- [ ] Input validation and sanitization
- [ ] Rate limiting
- [ ] Generic error messages (log details internally)
- [ ] CSRF token validation for mutations

### React Component Checklist
- [ ] All useEffect dependencies listed
- [ ] Cleanup function for subscriptions/listeners
- [ ] AbortController for async operations
- [ ] Proper TypeScript types (no 'any')
- [ ] Unique keys for list items
- [ ] Error boundary wrapper for critical sections
- [ ] Form validation before submission

### Payment Security Checklist
- [ ] Never trust client-provided prices
- [ ] Use Stripe Elements, never collect card data
- [ ] Verify webhook signatures
- [ ] Use idempotency keys
- [ ] Handle all payment states (success, failure, pending)
- [ ] Log minimal data, never PII
