# Testing Guide

## Overview

This document describes the testing infrastructure and patterns for the Petify Pet Care Marketplace application. The project uses **Playwright** for end-to-end testing. Unit and integration tests have not been extensively implemented but the infrastructure is in place.

---

## Testing Framework Setup

### Playwright Configuration

**Installed Version:** `@playwright/test@^1.55.0`

**npm Scripts:**
```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

### Running Tests

**Execute all E2E tests:**
```bash
npm run e2e
```

**Run tests with interactive UI mode:**
```bash
npm run e2e:ui
```

The UI mode provides:
- Real-time test execution visualization
- Step-by-step debugging
- Browser interaction inspection
- Test filtering and re-running

### Configuration File

While a `playwright.config.ts` file was not found in the current codebase, Playwright expects it at the project root. To initialize it:

```bash
npx playwright install
npx playwright init
```

---

## Current Test Coverage

### Test File Status

Currently, **no E2E test files are present** in the repository. The infrastructure is installed but tests need to be written.

### Areas for Testing

Based on the application architecture, these areas should have E2E tests:

1. **Authentication Flow**
   - Sign up with role selection (customer, provider)
   - Sign in with valid/invalid credentials
   - Password reset flow
   - Session persistence

2. **Booking Workflow**
   - Multi-step booking wizard (4 steps)
   - Service selection
   - Pet selection
   - Date/time selection
   - Payment integration (Stripe)

3. **Provider Onboarding**
   - Multi-step provider registration
   - Business info entry
   - Service creation
   - Availability setup
   - Image/document uploads

4. **Search and Filtering**
   - Provider search
   - Filter by service category
   - Filter by location
   - Filter by price range
   - Map view interaction

5. **Admin Dashboard**
   - User management
   - Provider management
   - Statistics/analytics
   - Role-based access

6. **User Management**
   - Profile updates
   - Pet management
   - Favorites management
   - Booking history

---

## Recommended Test Structure

### File Organization

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── sign-up.spec.ts
│   │   ├── sign-in.spec.ts
│   │   └── password-reset.spec.ts
│   ├── booking/
│   │   ├── booking-wizard.spec.ts
│   │   ├── payment.spec.ts
│   │   └── booking-management.spec.ts
│   ├── search/
│   │   ├── provider-search.spec.ts
│   │   ├── filters.spec.ts
│   │   └── map-view.spec.ts
│   ├── admin/
│   │   ├── user-management.spec.ts
│   │   ├── provider-management.spec.ts
│   │   └── analytics.spec.ts
│   └── provider/
│       ├── onboarding.spec.ts
│       └── dashboard.spec.ts
├── fixtures/
│   ├── auth.ts
│   ├── test-data.ts
│   └── api-mocks.ts
└── utils/
    ├── test-helpers.ts
    └── selectors.ts
```

---

## Playwright Test Pattern

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should sign up with customer role', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="fullName"]', 'John Doe')

    // Select customer role
    await page.click('label:has-text("Customer")')

    // Submit
    await page.click('button:has-text("Sign Up")')

    // Verify redirect
    await expect(page).toHaveURL('/dashboard')
  })

  test('should sign in with valid credentials', async ({ page }) => {
    // Setup: Create a test user via API
    const response = await page.request.post('/api/test/create-user', {
      data: {
        email: 'existing@example.com',
        password: 'Password123!'
      }
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'existing@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button:has-text("Sign In")')

    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'WrongPassword')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

### Key Playwright Patterns

**Wait for navigation:**
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('button:has-text("Submit")')
])
```

**Wait for specific conditions:**
```typescript
await page.waitForSelector('text=Booking confirmed')
await expect(page.locator('[role="dialog"]')).toBeHidden()
```

**API interception:**
```typescript
await page.route('**/api/bookings', route => {
  route.continue({
    response: mockResponse
  })
})
```

**Network-off mode (offline testing):**
```typescript
await context.setOffline(true)
// test offline behavior
await context.setOffline(false)
```

---

## Fixtures for Reusable Setup

### Authentication Fixture

Create `tests/fixtures/auth.ts`:

```typescript
import { test as base, expect } from '@playwright/test'

interface AuthFixture {
  authenticatedPage: Page
  adminPage: Page
  providerPage: Page
}

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Set auth token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-token-customer')
    })

    await use(page)
    await context.close()
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-token-admin')
    })

    await use(page)
    await context.close()
  },

  providerPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-token-provider')
    })

    await use(page)
    await context.close()
  }
})

export { expect }
```

**Usage:**
```typescript
import { test, expect } from './fixtures/auth'

test('provider should manage bookings', async ({ providerPage }) => {
  await providerPage.goto('/provider/bookings')
  // Test provider-specific functionality
})
```

### Test Data Fixture

Create `tests/fixtures/test-data.ts`:

```typescript
import { test as base } from '@playwright/test'

interface TestDataFixture {
  testData: {
    customer: { email: string; password: string }
    provider: { email: string; password: string }
    booking: { serviceId: string; date: string }
  }
}

export const test = base.extend<TestDataFixture>({
  testData: async ({}, use) => {
    const data = {
      customer: {
        email: `customer-${Date.now()}@example.com`,
        password: 'TestPassword123!'
      },
      provider: {
        email: `provider-${Date.now()}@example.com`,
        password: 'TestPassword123!'
      },
      booking: {
        serviceId: 'service-123',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
      }
    }

    await use(data)

    // Cleanup: Remove test data
    // await cleanupTestData(data)
  }
})

export { expect }
```

---

## Testing Different User Flows

### Customer Booking Flow

```typescript
test('customer should complete booking flow', async ({ page }) => {
  // Setup: Login as customer
  await loginAsCustomer(page, 'customer@example.com')

  // 1. Search for providers
  await page.goto('/search')
  await page.fill('input[placeholder="Search services"]', 'grooming')
  await page.waitForSelector('[data-testid="provider-card"]')

  // 2. View provider details
  await page.click('[data-testid="provider-card"]:first-child')
  await expect(page).toHaveURL(/\/providers\//)

  // 3. Open booking wizard
  await page.click('button:has-text("Book Now")')

  // Step 1: Select service
  await page.click('[data-testid="service-card"]:first-child')
  await page.click('button:has-text("Next")')

  // Step 2: Select pet
  const petOption = page.locator('[data-testid="pet-option"]:first-child')
  await petOption.check()
  await page.click('button:has-text("Next")')

  // Step 3: Select date and time
  await page.click('[data-testid="date-picker"]')
  await page.click('button:has-text("15")') // Select 15th
  await page.selectOption('[data-testid="time-slot"]', '10:00')
  await page.click('button:has-text("Next")')

  // Step 4: Review and checkout
  await expect(page.locator('text=Review your booking')).toBeVisible()
  await page.click('button:has-text("Proceed to Payment")')

  // Handle Stripe payment
  await page.frameLocator('[title*="Stripe"]').locator('#cardNumber').fill('4242424242424242')
  // ... complete Stripe form
  await page.click('button:has-text("Complete Payment")')

  // Verify booking confirmation
  await expect(page.locator('text=Booking confirmed')).toBeVisible()
})
```

### Provider Onboarding Flow

```typescript
test('provider should complete onboarding', async ({ page }) => {
  // Signup as provider
  await page.goto('/auth/signup')
  await page.selectOption('[data-testid="role-select"]', 'provider')
  await page.fill('input[name="email"]', `provider-${Date.now()}@example.com`)
  await page.fill('input[name="password"]', 'Password123!')
  await page.fill('input[name="fullName"]', 'Pet Care Provider')
  await page.click('button:has-text("Create Account")')

  // Onboarding flow
  await expect(page).toHaveURL('/provider/onboarding')

  // Step 1: Welcome
  await page.click('button:has-text("Get Started")')

  // Step 2: Provider type
  await page.click('label:has-text("Grooming")')
  await page.click('button:has-text("Continue")')

  // Step 3: Business info
  await page.fill('input[name="businessName"]', 'Happy Paws Grooming')
  await page.fill('textarea[name="description"]', 'Professional pet grooming services')
  await page.click('button:has-text("Continue")')

  // ... continue through remaining steps

  // Verify dashboard access
  await expect(page).toHaveURL('/provider/dashboard')
})
```

---

## Test Execution Strategies

### Pre-Test Setup/Teardown

```typescript
test.beforeAll(async () => {
  // Global setup: Start test server if needed
  // Create test database
})

test.afterAll(async () => {
  // Global cleanup
  // Clear test database
})

test.beforeEach(async ({ page }) => {
  // Per-test setup
  // Navigate to base URL
  await page.goto('/')
})

test.afterEach(async ({ page }) => {
  // Per-test cleanup
  // Clear localStorage
  await page.context().clearCookies()
})
```

### Parallel Execution

Playwright runs tests in parallel by default. Control with:

```bash
# Run serially
npx playwright test --workers=1

# Run with specific worker count
npx playwright test --workers=4
```

In `playwright.config.ts`:
```typescript
export default defineConfig({
  workers: process.env.CI ? 1 : undefined,
})
```

### CI/CD Integration

**Example GitHub Actions workflow:**

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Accessibility Testing

### Automated Accessibility Checks

Use `@axe-core/playwright` for accessibility testing:

```bash
npm install --save-dev @axe-core/playwright
```

**Usage:**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('page should have no accessibility violations', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  })
})
```

### Manual Accessibility Testing

Test these patterns:
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (ARIA labels)
- Color contrast ratios
- Focus indicators
- Form label associations

---

## Performance Testing

### Lighthouse Integration

Run Lighthouse audits with Playwright:

```bash
npm install --save-dev @playwright/test lighthouse
```

**Usage:**
```typescript
import { playAudit } from 'pa11y-playwright'

test('should meet performance standards', async ({ page }) => {
  await page.goto('/')

  const audit = await playAudit(page)

  expect(audit.score).toBeGreaterThan(90)
})
```

### Load Time Testing

```typescript
test('should load booking page quickly', async ({ page }) => {
  const startTime = Date.now()

  await page.goto('/provider/123/book')
  await page.waitForLoadState('networkidle')

  const loadTime = Date.now() - startTime

  expect(loadTime).toBeLessThan(3000) // 3 seconds max
})
```

---

## Visual Regression Testing

### Screenshot Comparisons

```typescript
test('booking modal should match snapshot', async ({ page }) => {
  await page.goto('/provider/123')
  await page.click('button:has-text("Book Now")')

  await expect(page.locator('[role="dialog"]')).toHaveScreenshot('booking-modal.png')
})
```

**Update snapshots:**
```bash
npx playwright test --update-snapshots
```

---

## Mock Data and Stubs

### Mock API Responses

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Intercept and mock failed API response
  await page.route('**/api/providers/**', route => {
    route.abort('failed')
  })

  await page.goto('/search')

  // Should show error message
  await expect(page.locator('text=Failed to load providers')).toBeVisible()
})
```

### Mock Authentication

```typescript
async function mockAuth(page, token, user) {
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('auth-user', JSON.stringify(user))
  }, { token, user })
}
```

---

## Debugging Tests

### Debug Mode

```bash
npx playwright test --debug
```

Opens Playwright Inspector with step-by-step execution.

### Verbose Logging

```bash
npx playwright test --trace on
```

Generates detailed trace files in `trace.zip` that can be inspected with:

```bash
npx playwright show-trace trace.zip
```

### Screenshots on Failure

```typescript
test('should create booking', async ({ page }) => {
  try {
    await page.click('button:has-text("Book Now")')
    await expect(page).toHaveURL('/checkout')
  } catch (error) {
    await page.screenshot({ path: 'failure.png' })
    throw error
  }
})
```

Or configure automatically:

```typescript
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
})
```

---

## Testing Best Practices

### 1. Use Test-Friendly Selectors

**Preferred:**
```typescript
// Use data-testid attributes
await page.click('[data-testid="book-button"]')

// Use accessibility selectors
await page.click('button:has-text("Book Now")')

// Use role selectors
await page.click('[role="button"]:has-text("Submit")')
```

**Avoid:**
```typescript
// Brittle CSS selectors
await page.click('.col-md-4 > div > button')

// Index-based selectors
await page.click('button:nth-of-type(3)')
```

### 2. Wait Appropriately

```typescript
// Good: Wait for condition
await page.waitForSelector('text=Booking confirmed')
await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()

// Bad: Fixed wait
await page.waitForTimeout(2000)
```

### 3. Isolate Tests

Each test should be independent:

```typescript
test.beforeEach(async ({ page }) => {
  // Fresh start for each test
  await page.context().clearCookies()
  await page.goto('/') // Navigate to base
})
```

### 4. Test User Workflows, Not Implementation

```typescript
// Good: Test user actions
test('user should be able to book a service', async ({ page }) => {
  // User searches, selects, books
})

// Bad: Test internal state
test('booking state should update', async ({ page }) => {
  // Testing React state directly
})
```

### 5. Use Descriptive Test Names

```typescript
// Good
test('customer should see error when booking with past date', () => {})
test('provider should receive notification for new booking', () => {})

// Bad
test('booking date validation', () => {})
test('notifications', () => {})
```

---

## Unit Testing (Future)

While E2E tests are primary, consider adding unit tests for:

### Utility Functions

```typescript
// src/lib/utils.test.ts
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('px-2', undefined, 'py-1')).toBe('px-2 py-1')
  })
})
```

### Custom Hooks

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/contexts/auth-context'

describe('useAuth hook', () => {
  it('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    expect(result.current.user).toBeDefined()
  })
})
```

**Recommended testing library:** `@testing-library/react` with `vitest`

---

## Test Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Authentication flows | 100% | Not started |
| Booking workflow | 100% | Not started |
| Provider onboarding | 80% | Not started |
| Search and filters | 80% | Not started |
| Admin operations | 90% | Not started |
| Error handling | 85% | Not started |
| Accessibility | 95% | Not started |

---

## Resources and Documentation

- **Playwright Docs:** https://playwright.dev
- **Best Practices:** https://playwright.dev/docs/best-practices
- **API Reference:** https://playwright.dev/docs/api/class-page
- **Debugging:** https://playwright.dev/docs/debug

---

**Last Updated:** February 22, 2026
**Playwright Version:** 1.55.0
**Node Version:** 20.x
**Status:** Testing infrastructure installed, tests not yet implemented
