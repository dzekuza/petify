# External Integrations - Petify Pet Care Marketplace

## Overview
This document details all external APIs, services, and integrations that Petify uses to provide pet care marketplace functionality.

---

## 1. Supabase (Database & Authentication)

### Service
PostgreSQL-based Backend-as-a-Service with built-in authentication

### Configuration
- **Location**: `src/lib/supabase.ts`
- **Client library**: `@supabase/supabase-js` ^2.57.2

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (secret, server-only)

### Database Schema
**Tables**:
1. **users** - User profiles and authentication
   - id (UUID, primary key)
   - email, full_name, phone
   - avatar_url, role, created_at, updated_at

2. **providers** - Service provider profiles
   - id, user_id (foreign key to users)
   - business_name, business_type, description
   - location (JSON), availability (JSON)
   - business_hours (JSON), contact_info (JSON)
   - rating, review_count, is_verified
   - services (array), certifications (array)
   - images (array), price_range (JSON)
   - experience_years, verification_documents (JSON)
   - created_at, updated_at, status

3. **bookings** - Service booking records
   - id, customer_id, provider_id, service_id, pet_id
   - booking_date, start_time, end_time, duration_minutes
   - total_price, payment_id, payment_status
   - location (JSON), special_instructions
   - status, cancellation_reason, cancelled_at
   - created_at, updated_at

4. **services** - Service offerings (implied from bookings)
   - id, provider_id, name, description
   - price, duration

5. **pets** - Customer pet information
   - id, user_id, name, species, breed, age
   - profile images and metadata

### Features Used
- **Authentication**:
  - Auto-refresh tokens enabled
  - Session persistence
  - URL-based session detection
  - Server-side admin client for privileged operations

- **Storage**: Multi-bucket file storage
  - `profile-images` - User profile pictures
  - `service-images` - Service listing images
  - `pet-images` - Pet photos and gallery images
  - `provider-images` - Provider avatars and cover photos
  - `assets` - General assets
  - **File operations**: Upload, delete, get public URL
  - **Cache control**: 3600s (1 hour)

- **Authorization**: Row-level security (RLS) via JWT tokens

### Supabase Integration Points
- **Client initialization**: Browser-based client with auth session management
- **Server operations**: Admin client for API routes and webhooks
- **API location**: `src/lib/supabase.ts` (main client)
- **Storage**: `src/lib/storage.ts` (file upload/retrieval)
- **Auth**: `src/lib/auth.ts` (request authentication)

### Related Files
- `src/lib/supabase.ts` - Client initialization and types
- `src/lib/storage.ts` - File upload and retrieval operations
- `src/lib/auth.ts` - JWT authentication for API routes
- `src/lib/image-upload.ts` - Image upload wrapper service
- `src/app/api/auth/welcome-email/route.ts` - Welcome email trigger

---

## 2. Stripe (Payment Processing)

### Service
Cloud-based payment processing and billing platform

### Configuration
- **Location**: `src/lib/stripe.ts`
- **Server SDK**: `stripe` ^18.5.0
- **Client SDK**: `@stripe/stripe-js` ^7.9.0
- **React integration**: `@stripe/react-stripe-js` ^4.0.0
- **API version**: 2025-08-27.basil

### Environment Variables
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side key (public)
- `STRIPE_SECRET_KEY` - Server-side key (secret)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (secret)

### Configuration Details
```typescript
STRIPE_CONFIG = {
  currency: 'eur',           // EUR payments
  paymentMethods: ['card'],  // Card payments only
  mode: 'payment',           // One-time payment mode
}
```

### Payment Flow

#### 1. Payment Intent Creation
- **Location**: `src/app/api/payments/create-intent/route.ts`
- **Endpoint**: `POST /api/payments/create-intent`
- **Request body**:
  ```json
  {
    "amount": number,
    "currency": "eur" | string,
    "bookingId": string,
    "customerEmail": string,
    "serviceFee": number (default: 0.1 = 10%)
  }
  ```
- **Function**: `createPaymentIntent()` in `src/lib/payments.ts`
- **Features**:
  - Automatic payment method detection
  - Metadata includes bookingId for tracking
  - Receipt email sent to customer
  - Service fee calculation (default 10%)
  - Amount conversion from decimal to cents (EUR)

#### 2. Webhook Processing
- **Location**: `src/app/api/payments/webhook/route.ts`
- **Endpoint**: `POST /api/payments/webhook`
- **Signature verification**: Required via `stripe-signature` header
- **Handled events**:
  - `payment_intent.succeeded` - Payment successful
  - `payment_intent.payment_failed` - Payment failed
  - `payment_intent.canceled` - Payment canceled
  - `payment_intent.requires_action` - 3D Secure or other auth required

#### 3. Payment Completion
- **Function**: `handlePaymentSucceeded()` in `src/lib/payments.ts`
- **Operations**:
  1. Updates booking record with `payment_status: 'paid'`
  2. Retrieves full booking details with related entities
  3. Sends payment confirmation email to customer
  - Email includes: Booking details, service info, pet name, transaction ID
- **Failure handling**: Non-blocking - email failures don't fail webhook

### Refund Processing
- **Function**: `createRefund()` in `src/lib/payments.ts`
- **Features**:
  - Full and partial refunds supported
  - Reason codes: duplicate, fraudulent, requested_by_customer
  - Amount conversion to cents for EUR

### Test Cards (Development)
```typescript
TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119'
}
```

### Amount Formatting
- **Client**: `formatAmountForStripe()` - Convert decimal to cents
- **Server**: `formatAmountFromStripe()` - Convert cents to decimal
- **Calculation**: EUR is decimal currency, so EUR 25.99 = 2599 cents

### Related Files
- `src/lib/stripe.ts` - Client and server initialization
- `src/lib/payments.ts` - Payment intent and webhook handling
- `src/app/api/payments/create-intent/route.ts` - Payment intent creation endpoint
- `src/app/api/payments/webhook/route.ts` - Webhook handler endpoint

---

## 3. Resend (Email Service)

### Service
Transactional email API for developers

### Configuration
- **Location**: `src/lib/email/email-service.ts`
- **Library**: `resend` ^6.0.3

### Environment Variables
- `RESEND_API_KEY` - API authentication key (secret)
- `RESEND_FROM_EMAIL` - Sender email address (optional, default: noreply@petify.lt)

### Email Types

#### 1. Booking Confirmation
- **Function**: `sendBookingConfirmation()`
- **Recipient**: Customer email
- **Template**: `booking-confirmation`
- **Data**:
  - serviceName, providerName, providerId
  - bookingDate, bookingTime
  - totalPrice
  - petName

#### 2. Welcome Email
- **Function**: `sendWelcomeEmail()`
- **Recipient**: New user email
- **Template**: `welcome`
- **Trigger**: User registration (location: `src/app/api/auth/welcome-email/route.ts`)

#### 3. Booking Update
- **Function**: `sendBookingUpdate()`
- **Recipient**: Customer email
- **Template**: `booking-update`
- **Data**:
  - serviceName, status (confirmed/cancelled/completed)
  - bookingDate, bookingTime
  - totalPrice

#### 4. Provider Notification
- **Function**: `sendProviderNotification()`
- **Recipient**: Provider email
- **Template**: `provider-notification`
- **Data**:
  - serviceName, customerName
  - bookingDate, bookingTime
  - totalPrice

#### 5. Payment Confirmation
- **Function**: `sendPaymentConfirmation()`
- **Recipient**: Customer email
- **Template**: `payment-confirmation`
- **Trigger**: After successful Stripe payment webhook
- **Data**:
  - serviceName, providerName
  - bookingDate, bookingTime
  - totalAmount, paymentMethod
  - transactionId, bookingId

### Email Template System
- **Location**: `src/lib/email/template-engine.ts`
- **Features**:
  - Template loading (from files/strings)
  - Variable interpolation
  - Currency formatting
  - Date formatting

### PDF Attachments
- **Location**: `src/lib/email/pdf-generator.ts`
- **Library**: `jsPDF` ^3.0.2
- **Function**: `generateInvoicePDF()`
- **Usage**: Invoice attachments for booking confirmations

### Related Files
- `src/lib/email/email-service.ts` - Main service
- `src/lib/email/template-engine.ts` - Template rendering
- `src/lib/email/pdf-generator.ts` - PDF generation
- `src/lib/email/types.ts` - Email type definitions
- `src/lib/email.ts` - Public API wrapper

---

## 4. Mapbox (Maps & Geolocation)

### Service
Vector map platform and geocoding API

### Configuration
- **Location**: `src/lib/mapbox.ts`
- **Map library**: `mapbox-gl` ^3.14.0
- **React wrapper**: `react-map-gl` ^8.0.4
- **Alternative**: `leaflet` ^1.9.4 with `react-leaflet` ^5.0.0

### Environment Variables
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - API authentication (public)

### Map Configuration
```typescript
MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',  // Default style
  defaultCenter: [23.8813, 54.6872],             // Vilnius, Lithuania
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 10,
  defaultCountry: 'LT'                           // Lithuania
}
```

### Map Styles Available
1. **Custom**: `mapbox://styles/dzekuza/cm4ujxdlt000301safql0df3b` - Custom branded style
2. **Streets**: `mapbox://styles/mapbox/streets-v12` - Default
3. **Satellite**: `mapbox://styles/mapbox/satellite-v9` - Aerial view
4. **Light**: `mapbox://styles/mapbox/light-v11` - Light theme
5. **Dark**: `mapbox://styles/mapbox/dark-v11` - Dark theme

### Marker Styling
```typescript
MAP_MARKERS = {
  provider: { size: 40, color: '#00A699', borderColor: '#FFFFFF', borderWidth: 2 },
  selected: { size: 50, color: '#FF5A5F', borderColor: '#FFFFFF', borderWidth: 3 },
  hover: { size: 45, color: '#00A699', borderColor: '#FFFFFF', borderWidth: 2 }
}
```

### Features
- **Geocoding API**: Address → Coordinates conversion
  - **Endpoint**: `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}`
  - **Parameters**: access_token, country=LT, limit=1
  - **Usage**: Provider address autocomplete (location: `src/components/provider-onboarding/address-input-step.tsx`)

- **Display**: Show provider locations on interactive map
  - **Components**:
    - `src/components/providers-map.tsx` - Map showing provider markers
    - `src/components/address-autocomplete.tsx` - Address input with Mapbox geocoding

### Transpilation
- **Next.js config**: mapbox-gl requires transpilation
  - Configured in `next.config.ts` as: `transpilePackages: ['mapbox-gl']`

### Related Files
- `src/lib/mapbox.ts` - Configuration and constants
- `src/lib/geocoding.ts` - Geocoding helper functions
- `src/components/address-autocomplete.tsx` - Address input with Mapbox integration

---

## 5. Vercel (Deployment)

### Service
Serverless platform for Next.js applications

### Configuration
- **Location**: `vercel.json`
- **Framework**: Next.js
- **Build command**: `npm build`
- **Dev command**: `npm dev`
- **Install command**: `npm install`
- **Output directory**: `.next`
- **Region**: iad1 (US East Virginia)

### Deployment Features
- **Serverless functions**: API routes run as functions
- **Edge middleware**: Security headers via Vercel config
- **Analytics**: Integrated via `@vercel/analytics` ^1.5.0
- **Analytics import**: `src/app/layout.tsx` - Web Vitals tracking

### Security Headers (Vercel Config)
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

### SVG Handling
- Static SVG serving with:
  - Content-Type: image/svg+xml
  - Cache-Control: public, max-age=31536000, immutable (1 year)

### Related Files
- `vercel.json` - Deployment configuration

---

## 6. Analytics & Monitoring

### Vercel Analytics
- **Library**: `@vercel/analytics` ^1.5.0
- **Purpose**: Web Vitals and performance tracking
- **Integration**: Automatically collected by Vercel
- **Import**: Used in application layout

---

## 7. Secondary & Utility Services

### Device Detection
- **Location**: `src/lib/device-detection.ts`
- **Purpose**: Client-side device type detection (mobile, tablet, desktop)

### Notifications
- **Location**: `src/lib/notifications.ts`
- **Library**: `sonner` ^2.0.7 - Toast notifications
- **Features**: Success, error, info, warning toasts

### Chat System (Implied)
- **API routes**:
  - `src/app/api/chat/conversations/route.ts`
  - `src/app/api/chat/messages/route.ts`
  - `src/app/api/chat/start-conversation/route.ts`
- **Database**: Uses Supabase for chat data persistence

---

## Authentication Flow

### User Registration
1. User signs up via Supabase Auth
2. User record created in `users` table
3. Welcome email sent via Resend
4. User selects role: customer or provider

### Provider Onboarding
1. Provider completes profile with:
   - Business name, type, description
   - Location via Mapbox geocoding
   - Business hours, services, certifications
   - Images uploaded to Supabase Storage
2. Provider profile created in `providers` table
3. Verification documents stored (JSON)

### Booking Flow
1. Customer searches services (via map and filters)
2. Customer selects provider and service
3. Customer creates booking with:
   - Selected pet (from `pets` table)
   - Booking date/time
   - Special instructions
4. Booking created in `bookings` table
5. Payment intent created via Stripe
6. Booking confirmation email sent to customer
7. Provider notification email sent to provider
8. On payment success: Payment confirmation email sent

---

## Webhook Integrations

### Stripe Webhooks
- **Endpoint**: `POST /api/payments/webhook`
- **Signature validation**: Required
- **Handled events**:
  1. `payment_intent.succeeded` → Update booking, send confirmation email
  2. `payment_intent.payment_failed` → Log failure
  3. `payment_intent.canceled` → Log cancellation
  4. `payment_intent.requires_action` → Log action required

### Webhook Security
- Signature verification via Stripe SDK
- Environment variable required: `STRIPE_WEBHOOK_SECRET`
- Non-blocking email failures (webhook succeeds regardless)

---

## Data Flow Summary

```
User Registration
  ↓
Supabase Auth → users table
  ↓
Resend (Welcome Email)

Provider Setup
  ↓
Mapbox Geocoding (Address lookup)
  ↓
Supabase Storage (Image uploads)
  ↓
Supabase Database (providers table)

Booking Creation
  ↓
Supabase Database (bookings table)
  ↓
Stripe (Payment Intent Creation)
  ↓
Resend (Confirmation & Notification Emails)

Payment Processing
  ↓
Stripe Webhook
  ↓
Supabase (Update payment_status)
  ↓
Resend (Payment Confirmation Email)

Location Services
  ↓
Mapbox GL + React Map GL/Leaflet (Display)
  ↓
Mapbox Geocoding (Search)
```

---

## Error Handling

### Supabase
- Session errors handled gracefully
- Auth failures return 401
- Admin client creation validates service role key
- Admin operations include error logging

### Stripe
- Placeholder key validation in development
- API version mismatch errors
- Webhook signature verification failures
- Specific error messages for auth, request, and unknown errors

### Resend
- Email service errors logged
- Email failures don't break booking flow
- Error messages included in response

### Mapbox
- Token validation on initialization
- Geocoding query errors handled
- Map initialization failures caught

---

## Rate Limiting & Quotas

### Stripe
- Payment intents: Limited by Stripe account tier
- Webhooks: Retry logic (exponential backoff)

### Resend
- Email sending: Limited by plan
- Daily quotas enforced by service

### Mapbox
- Geocoding queries: Limited by access token tier
- Map loads: Limited by usage tier

### Supabase
- Database queries: Limited by plan
- Storage: Limited by plan
- Auth: Built-in rate limiting

---

## Development & Testing

### Environment Setup
- All integrations require environment variables
- Public keys stored in `NEXT_PUBLIC_*` variables
- Secret keys stored in `.env.local` (never committed)
- Setup script: `./setup-env.sh` (mentioned in README)

### Testing APIs
- Stripe provides test card numbers
- Supabase provides local development mode
- Email can be tested with Resend sandbox mode
- Mapbox provides test tokens for development

