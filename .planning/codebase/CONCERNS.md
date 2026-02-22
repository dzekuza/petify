# Codebase Concerns & Technical Debt

## Critical Issues

### 1. Security - Missing Auth Checks in Admin Routes

**Issue**: The `/api/admin/update-user-role/route.ts` manually parses JWT tokens instead of using the standard `requireAdmin` middleware.

**File**: `/home/user/repo/src/app/api/admin/update-user-role/route.ts` (lines 7-30)

**Risk**: Inconsistent authentication patterns create maintenance burden and potential security gaps. This route duplicates auth logic found in `/lib/auth.ts`.

**Recommendation**: Use the centralized `requireAdmin()` helper like other admin routes do (e.g., `/api/admin/promote-to-admin/route.ts`).

---

### 2. Security - Insufficient CSRF Protection

**Issue**: No CSRF tokens are implemented across API routes. All requests rely solely on bearer token authentication.

**Files**: All API routes in `/src/app/api/`

**Risk**: POST, PATCH, and DELETE requests are vulnerable to CSRF attacks from malicious sites if a user has an active session.

**Recommendation**:
- Implement CSRF token validation for state-changing operations
- Add `X-CSRF-Token` header validation to middleware
- Or use SameSite cookie restrictions (requires cookie-based auth)

---

### 3. Authentication - Service Role Key in API Routes

**Issue**: Multiple API routes directly use `SUPABASE_SERVICE_ROLE_KEY` with `createClient()`, which is a server-side secret that should never be passed to client code.

**Files**:
- `/home/user/repo/src/app/api/chat/messages/route.ts` (lines 8-10)
- `/home/user/repo/src/app/api/checkout/verify-session/route.ts` (lines 24-26)

**Risk**: If these routes are ever accidentally exposed or bundled, the service role key is compromised, allowing full database access.

**Recommendation**: Use `createSupabaseAdmin()` from `/lib/supabase.ts` instead, which properly manages the service role key on the server only.

---

### 4. Security - Email Input Not Validated in Claim Business Route

**Issue**: The `/api/claim-business/route.ts` directly interpolates user input into email content without validation.

**File**: `/home/user/repo/src/app/api/claim-business/route.ts` (lines 18-35)

**Risk**: Malicious input in `name`, `email`, `phone`, and `message` fields could contain injection payloads or be used for email header injection.

**Recommendation**:
- Validate email format with proper regex
- Sanitize text fields using `sanitizeText()` from `/lib/sanitization.ts`
- Validate phone number format

---

### 5. Performance - N+1 Query in Admin Providers List

**Issue**: The `/api/admin/providers/route.ts` fetches all providers, then makes a separate database call for each provider's user data.

**File**: `/home/user/repo/src/app/api/admin/providers/route.ts` (lines 63-76)

**Risk**: For 100 providers, this makes 101 queries instead of 1. Severe performance bottleneck as provider list grows.

**Recommendation**: Use a JOIN query to fetch providers with users in a single query:
```sql
SELECT providers.*, users.*
FROM providers
JOIN users ON providers.user_id = users.id
```

---

### 6. Data Integrity - Multiple Pet IDs Stored as String

**Issue**: The booking system stores multiple pet IDs as a comma-separated string in `special_instructions` field rather than using a proper join table.

**Files**:
- `/home/user/repo/src/app/api/bookings/route.ts` (lines 107-116)
- `/home/user/repo/src/app/api/checkout/verify-session/route.ts` (lines 96-116)

**Risk**:
- Cannot efficiently query bookings by pet
- String parsing is fragile and error-prone
- No relational integrity
- Missing migrations show this was incomplete (see `017_fix_booking_pet_ids.sql`)

**Recommendation**: Create a `booking_pets` junction table:
```sql
CREATE TABLE booking_pets (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE(booking_id, pet_id)
)
```

---

## High Priority Issues

### 7. Error Handling - Generic 500 Errors Without Context

**Issue**: Almost all API routes catch errors and return generic "Internal server error" without logging specifics.

**Example Files**:
- `/home/user/repo/src/app/api/bookings/route.ts` (line 462)
- `/home/user/repo/src/app/api/providers/route.ts` (line 81)
- `/home/user/repo/src/app/api/reviews/route.ts` (line 146)

**Risk**: Difficult to debug production issues. No error tracking or monitoring.

**Recommendation**:
- Implement structured logging (Winston, Pino, or Sentry)
- Include error IDs in responses: `{ error: 'Internal server error', errorId: 'ERR_123' }`
- Log full error context: stack trace, request data, user ID

---

### 8. Input Validation - Missing Type Validation for Rates/Prices

**Issue**: Price and rating values are parsed from user input with minimal validation.

**Files**:
- `/home/user/repo/src/app/api/reviews/route.ts` (line 156, only checks 1-5)
- `/home/user/repo/src/app/api/bookings/route.ts` (line 164, `parseFloat` with no range check)

**Risk**:
- Negative prices in bookings
- Floating point precision issues
- No validation for reasonable price ranges (0 EUR to 100,000 EUR?)

**Recommendation**: Create validation helpers:
```typescript
function validatePrice(price: any): number {
  const parsed = parseFloat(price)
  if (isNaN(parsed) || parsed < 0 || parsed > 100000) {
    throw new Error('Invalid price')
  }
  return parsed
}
```

---

### 9. Rate Limiting - In-Memory Store Not Persistent

**Issue**: Rate limiting uses in-memory `Map` that resets on server restart.

**File**: `/home/user/repo/src/lib/sanitization.ts` (line 104)

**Risk**:
- Rate limits ineffective in production with multiple instances
- On server restart, all limits are cleared
- Can be bypassed by restarting application

**Recommendation**: Move to Redis or persistent store (Upstash, etc.) for distributed rate limiting.

---

### 10. Data Validation - Unsafe parseInt Without Radix

**Issue**: `parseInt()` used without explicit radix parameter.

**File**: `/home/user/repo/src/app/api/reviews/route.ts` (line 156)

```typescript
let limit = parseInt(searchParams.get('limit') || '10')
```

**Risk**: Edge cases like `"010"` parsed as octal (8) instead of decimal (10).

**Recommendation**: Always specify radix:
```typescript
let limit = parseInt(searchParams.get('limit') || '10', 10)
```

---

### 11. Authorization - Missing Ownership Checks in Provider Routes

**Issue**: Some provider profile endpoints don't verify user owns the provider profile.

**File**: `/home/user/repo/src/app/api/providers/update-profile/route.ts`

**Risk**: A provider could theoretically modify another provider's profile if they know the endpoint and have a valid token (though RLS should prevent this).

**Recommendation**: Add explicit check:
```typescript
const { data: provider } = await supabaseAdmin
  .from('providers')
  .select('user_id')
  .eq('id', providerId)
  .single()

if (provider.user_id !== user.id && userRole !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

### 12. Email Security - Hardcoded Admin Email

**Issue**: Admin email hardcoded in claim business route.

**File**: `/home/user/repo/src/app/api/claim-business/route.ts` (line 38)

```typescript
providerEmail: 'info@petify.lt',
```

**Risk**:
- Cannot be changed without code redeploy
- If email is compromised, notifications go to wrong place
- No fallback or error handling if email bounces

**Recommendation**: Move to environment variable `ADMIN_NOTIFICATION_EMAIL`.

---

## Medium Priority Issues

### 13. Type Safety - Using `any` Type

**Issue**: `Record<string, any>` used in multiple places where type should be specific.

**Files**:
- `/home/user/repo/src/app/api/bookings/route.ts` (line 119)
- `/home/user/repo/src/lib/email/email-service.ts` (line 40)

**Risk**: Loses type safety, harder to catch bugs at compile time.

**Recommendation**: Replace with specific types:
```typescript
type PetData = { id: string; name: string; species: string }
const petsData: Record<string, PetData> = {}
```

---

### 14. Data Consistency - Payment Session Metadata Parsing

**Issue**: Stripe session metadata parsed with unsafe string operations.

**File**: `/home/user/repo/src/app/api/checkout/verify-session/route.ts` (lines 81-94)

**Risk**: If time format changes, parsing fails silently. No validation of format.

**Recommendation**: Add parsing helper with validation:
```typescript
function parseTimeSlot(timeStr: string): { start: string; end: string } {
  if (timeStr.includes('-')) {
    const [start, end] = timeStr.split('-').map(s => s.trim())
    if (!isValidTime(start) || !isValidTime(end)) {
      throw new Error('Invalid time format')
    }
    return { start, end }
  }
  // ... handle single time
}
```

---

### 15. Logging - Excessive console.log in Production Code

**Issue**: Multiple `console.log` and `console.error` statements throughout API routes.

**Files**:
- `/home/user/repo/src/app/api/bookings/route.ts` (lines 93, 197, etc.)
- `/home/user/repo/src/app/api/providers/update-profile/route.ts` (lines 6, 10, 18, etc.)

**Count**: 80+ logging statements in API routes

**Risk**:
- Clutters logs with non-critical info
- Sensitive data might be logged (user IDs, emails, etc.)
- Performance impact in high-traffic scenarios

**Recommendation**:
- Use structured logging at ERROR level only
- Use DEBUG level for development only
- Avoid logging in tight loops

---

### 16. Incomplete Features - TODO Comments in Code

**Issue**: Multiple unimplemented features marked with TODO.

**Files**:
- `/home/user/repo/src/components/ui/ruixen-mono-chat.tsx` (line 93): Real-time presence not implemented
- `/home/user/repo/src/components/individual-pets-dialog.tsx` (lines 127, 192): Pet type selection dialog logic missing
- `/home/user/repo/src/app/provider/dashboard/settings/page.tsx` (lines 69, 75, 83): File uploads to storage not implemented
- `/home/user/repo/src/app/provider/dashboard/services/page.tsx` (lines 297, 319): Pet and service type creation incomplete

**Risk**: Features appear to work but may have fallback behavior or incomplete functionality.

**Recommendation**: Track all TODOs in issue tracker, not in code comments.

---

### 17. Session Management - sessionStorage Use for Form State

**Issue**: Provider edit form data stored in sessionStorage across navigation.

**Files**:
- `/home/user/repo/src/app/provider/onboarding/page.tsx`
- `/home/user/repo/src/app/provider/profile/page.tsx`

**Risk**:
- Data persists until cleared
- XSS vulnerabilities could access data
- Large form data in sessionStorage causes memory issues
- No validation that stored data is still valid

**Recommendation**: Use form state management library (React Hook Form, Formik) or server sessions.

---

### 18. API Response Inconsistency - Different Error Response Formats

**Issue**: Different API routes return errors in different formats.

**Examples**:
```typescript
// Format 1
{ error: 'Message' }

// Format 2
{ success: false, error: 'Message' }

// Format 3 (some routes)
{ error: 'Message', errorId: 'X' }
```

**Risk**: Client must handle multiple error formats, increasing complexity.

**Recommendation**: Standardize all responses:
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}
```

---

### 19. Query Limit - No Pagination Defaults

**Issue**: Reviews endpoint defaults to 10 but no pagination tokens.

**File**: `/home/user/repo/src/app/api/reviews/route.ts` (line 156)

**Risk**:
- Cannot efficiently retrieve all reviews
- No cursor-based pagination for large datasets
- Offset-based pagination becomes slow with large limits

**Recommendation**: Implement cursor-based pagination:
```typescript
const { data: reviews } = await supabaseAdmin
  .from('reviews')
  .select('*')
  .eq('provider_id', providerId)
  .lt('created_at', cursor)
  .limit(limit)
```

---

### 20. Email Validation - Weak Email Validation

**Issue**: Email validation only checks header presence, not format.

**File**: `/home/user/repo/src/app/api/claim-business/route.ts` (lines 9-14)

**Risk**: Invalid email addresses accepted, causing failed email sends.

**Recommendation**: Use email validation helper:
```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length < 254
}
```

---

## Low Priority Issues

### 21. Code Organization - Duplicate Auth Logic

**Issue**: Authentication logic repeated across multiple files instead of centralized.

**Files**:
- `/home/user/repo/src/lib/auth.ts` (centralized helpers)
- `/home/user/repo/src/app/api/admin/update-user-role/route.ts` (duplicated)
- `/home/user/repo/src/app/api/admin/users/[id]/change-password/route.ts` (duplicated)
- `/home/user/repo/src/app/api/admin/providers/route.ts` (duplicated)

**Risk**: Inconsistent behavior if auth logic is updated in one place but not others.

**Recommendation**: Use `requireAdmin()` helper everywhere instead of inline auth checks.

---

### 22. Magic Numbers - Hardcoded Service Fee

**Issue**: Service fee hardcoded as 0.1 (10%) in payment calculation.

**File**: `/home/user/repo/src/lib/payments.ts` (line 124)

**Risk**: Cannot adjust fees without code change and redeploy.

**Recommendation**: Move to environment variable `SERVICE_FEE_PERCENTAGE`.

---

### 23. Stripe Version Lock - Outdated API Version

**Issue**: Stripe API version hardcoded as `'2025-08-27.basil'`.

**File**: `/home/user/repo/src/lib/stripe.ts` (line 31)

**Risk**:
- If using an older version, missing newer features/improvements
- Eventual deprecation of API version
- Manually updating version string is error-prone

**Recommendation**: Check Stripe SDK for latest stable version; consider using SDK defaults.

---

### 24. Missing Null Checks - Pet Data in Bookings

**Issue**: Some code assumes pet data exists without null checks.

**File**: `/home/user/repo/src/app/api/bookings/route.ts` (line 310-327)

**Risk**: If pet is deleted but booking still exists, email sends will fail.

**Recommendation**: Add null coalescing:
```typescript
if (booking.customer?.email && booking.provider && booking.service) {
  // Only send if all required data exists
}
```

---

### 25. Missing Validation - Datetime Range Validation

**Issue**: No validation that start_time < end_time in bookings.

**File**: `/home/user/repo/src/app/api/bookings/route.ts` (lines 223-229)

**Risk**: Invalid time ranges accepted, causing issues downstream.

**Recommendation**: Add validation:
```typescript
if (start_time >= end_time) {
  return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
}
```

---

## Database & Schema Issues

### 26. Missing Migration - Pet Images Storage Incomplete

**Issue**: Multiple migrations attempt to fix pet image bucket setup.

**Files**:
- `/home/user/repo/supabase/migrations/008_fix_pet_images_bucket.sql`
- `/home/user/repo/supabase/migrations/009_fix_provider_images_bucket.sql`

**Risk**: Indicates schema migration issues or incomplete setup. Unclear what the final correct state should be.

**Recommendation**: Consolidate migrations and document final bucket structure.

---

### 27. RLS Policies - Potential Loophole in Conversations

**Issue**: RLS policies for conversations table may not be restrictive enough for multi-user scenarios.

**Files**: `/home/user/repo/supabase/migrations/002_rls_policies.sql`

**Risk**: Complex RLS rules can have unintended loopholes allowing users to see conversations they shouldn't.

**Recommendation**: Add comprehensive integration tests for RLS edge cases:
- User cannot see other users' conversations
- Provider cannot see customer conversations with other providers
- Messages only visible to conversation participants

---

### 28. Unique Constraint - Migration 011

**Issue**: `add_unique_user_id_constraint` migration suggests a data integrity issue was fixed.

**File**: `/home/user/repo/supabase/migrations/011_add_unique_user_id_constraint.sql`

**Risk**: Indicates there was previously a constraint violation. Risk of regression if constraint enforcement is ever disabled.

**Recommendation**:
- Document why this constraint was needed
- Add data validation tests
- Monitor for constraint violations in production

---

## Testing & Coverage Gaps

### 29. No Test Files Found

**Risk**: Zero automated test coverage visible in codebase. No unit tests, integration tests, or e2e tests.

**Critical areas without tests**:
- Payment processing (high financial risk)
- Authorization/RLS policies (security risk)
- Email notifications (feature completeness)
- Complex booking logic (reliability risk)

**Recommendation**: Implement testing strategy:
```
/src/__tests__/
  /api/
    /payments/
      webhook.test.ts
  /lib/
    auth.test.ts
    sanitization.test.ts
    payments.test.ts
```

---

### 30. Edge Cases - Decimal Precision in Payments

**Issue**: Floating point arithmetic used throughout payment system without decimal precision handling.

**Files**:
- `/home/user/repo/src/lib/payments.ts` (line 125)
- `/home/user/repo/src/app/api/bookings/route.ts` (line 164)

**Risk**: Rounding errors accumulate with multiple transactions. EUR currency requires exactly 2 decimal places.

**Recommendation**: Use `decimal.js` or `big.js` library:
```typescript
import Decimal from 'decimal.js'
const fee = new Decimal(baseAmount).times(0.1)
const total = new Decimal(baseAmount).plus(fee)
return parseFloat(total.toString())
```

---

## Environment & Configuration Issues

### 31. Missing Environment Variables Validation

**Issue**: No centralized validation of required environment variables on startup.

**Risk**: Application starts successfully but fails at runtime when features are used.

**Recommendation**: Add validation at app startup:
```typescript
// lib/validate-env.ts
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY'
  ]

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env: ${key}`)
    }
  }
}
```

---

### 32. Development-Only Endpoint in Production

**Issue**: `/api/dev/clear-rate-limits` checks `NODE_ENV !== 'development'` but endpoint should be entirely removed or require additional auth.

**File**: `/home/user/repo/src/app/api/dev/clear-rate-limits/route.ts`

**Risk**: If `NODE_ENV` not set correctly in production, endpoint could be accessible.

**Recommendation**: Remove entirely or require API key authentication.

---

## Summary of Risk Levels

| Risk Level | Count | Category |
|-----------|-------|----------|
| **Critical** | 6 | Security, Data Integrity, Authorization |
| **High** | 8 | Error Handling, Validation, Input Safety |
| **Medium** | 10 | Type Safety, Logging, Features, Data Consistency |
| **Low** | 8 | Code Organization, Magic Numbers, Edge Cases |

---

## Quick Wins (Easy Fixes)

1. Fix `parseInt` radix in reviews API (30 seconds)
2. Use `requireAdmin()` helper in admin routes instead of duplicating auth (5 minutes)
3. Add decimal precision library for payments (15 minutes)
4. Remove/secure development endpoints (5 minutes)
5. Add environment variable validation at startup (10 minutes)

---

## High-Value Improvements (Medium Effort)

1. Implement structured logging (1-2 hours)
2. Fix N+1 query in admin providers list (1 hour)
3. Create booking_pets junction table and migrate data (2-3 hours)
4. Add centralized input validation helpers (2 hours)
5. Standardize API response format (2-3 hours)
6. Move rate limiting to Redis (2-3 hours)

---

## Strategic Improvements (High Effort)

1. Implement comprehensive test suite (20+ hours)
2. Add CSRF protection framework-wide (4-5 hours)
3. Email validation and sanitization across all routes (3-4 hours)
4. Centralize error handling and logging (4-5 hours)
5. Implement proper pagination with cursors (3-4 hours)
