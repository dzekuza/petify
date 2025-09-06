# Petify Database Schema

This directory contains the complete database schema and migrations for the
Petify application.

## 📁 File Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      # Core database tables and types
│   ├── 002_rls_policies.sql        # Row Level Security policies
│   ├── 003_storage_setup.sql       # Storage buckets and policies
│   ├── 004_functions_views.sql     # Database functions and views
│   └── 005_seed_data.sql           # Sample data for development
└── README.md                       # This file
```

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication

- **`users`** - Extends Supabase auth.users with additional profile information
- **`user_profiles`** - Extended user profile data (bio, preferences, etc.)

#### Providers & Services

- **`providers`** - Pet service providers (groomers, vets, etc.)
- **`services`** - Individual services offered by providers
- **`service_categories`** - Categorized service types

#### Pets & Bookings

- **`pets`** - Pet profiles with medical and behavioral information
- **`bookings`** - Service appointments and reservations
- **`reviews`** - Customer reviews and ratings

#### Communication

- **`conversations`** - Chat conversations between users and providers
- **`messages`** - Individual messages within conversations
- **`notifications`** - System notifications for users

#### Additional

- **`favorites`** - User's favorite providers
- **`user_profiles`** - Extended user information

### Custom Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');

-- Service categories
CREATE TYPE service_category AS ENUM (
    'grooming', 'veterinary', 'boarding', 'training', 
    'walking', 'sitting', 'adoption'
);

-- Booking statuses
CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
);

-- Provider statuses
CREATE TYPE provider_status AS ENUM (
    'active', 'inactive', 'suspended', 'pending_verification'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'failed', 'refunded'
);
```

## 🗂️ Storage Buckets

### Public Buckets (accessible to all users)

- **`avatars`** - User profile pictures (5MB limit)
- **`provider-images`** - Provider business photos (10MB limit)
- **`pet-images`** - Pet photos (5MB limit)
- **`service-images`** - Service photos (10MB limit)
- **`review-images`** - Review photos (5MB limit)

### Private Buckets (authenticated access only)

- **`documents`** - Verification documents, licenses (20MB limit)
- **`messages`** - Message attachments (10MB limit)

### File Organization

```
avatars/
├── {user_id}/
│   └── avatar.jpg

provider-images/
├── {provider_id}/
│   ├── business-photo-1.jpg
│   └── business-photo-2.jpg

pet-images/
├── {pet_id}/
│   ├── pet-photo-1.jpg
│   └── pet-photo-2.jpg
```

## 🔒 Security (Row Level Security)

### Key Security Features

- **User Isolation**: Users can only access their own data
- **Provider Privacy**: Providers can only manage their own listings
- **Public Read Access**: Active providers are publicly readable
- **Secure Storage**: File access based on ownership and permissions

### Example Policies

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Anyone can view active providers
CREATE POLICY "Anyone can view active providers" ON public.providers
    FOR SELECT USING (status = 'active');
```

## 🔧 Database Functions

### Search Functions

- **`search_providers()`** - Geographic search with filters
- **`get_provider_availability()`** - Check provider availability
- **`get_user_dashboard()`** - Get dashboard data for users/providers

### Booking Functions

- **`create_booking()`** - Create new booking with validation
- **`update_provider_rating()`** - Auto-update ratings from reviews

### Utility Functions

- **`handle_new_user()`** - Auto-create user profile on signup
- **`update_updated_at_column()`** - Auto-update timestamps

## 📊 Views

### Provider Search View

```sql
CREATE VIEW public.provider_search_view AS
SELECT p.*, u.full_name as owner_name, u.avatar_url as owner_avatar
FROM public.providers p
JOIN public.users u ON u.id = p.user_id
WHERE p.status = 'active';
```

### Booking Details View

```sql
CREATE VIEW public.booking_details_view AS
SELECT b.*, c.full_name as customer_name, p.business_name as provider_name
FROM public.bookings b
JOIN public.users c ON c.id = b.customer_id
JOIN public.providers p ON p.id = b.provider_id;
```

## 🚀 Setup Instructions

### 1. Apply Migrations

```bash
# Apply all migrations in order
supabase db reset
# or
supabase migration up
```

### 2. Verify Setup

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Test search function
SELECT * FROM search_providers(37.7749, -122.4194, 25, 'grooming');
```

### 3. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📈 Performance Optimizations

### Indexes

- **Geographic**: GIST index on provider coordinates
- **Search**: GIN indexes on arrays (services, tags)
- **Foreign Keys**: Indexes on all foreign key relationships
- **Timestamps**: Indexes on created_at for sorting

### Query Optimization

- **Views**: Pre-joined data for common queries
- **Functions**: Parameterized queries for security
- **Triggers**: Automatic updates for ratings and timestamps

## 🔄 Data Flow

### User Registration

1. User signs up via Supabase Auth
2. `handle_new_user()` trigger creates user profile
3. User can create provider profile or pet profiles

### Provider Onboarding

1. User creates provider profile
2. Uploads verification documents to `documents` bucket
3. Admin reviews and approves (sets `is_verified = true`)

### Booking Process

1. Customer searches providers using `search_providers()`
2. Checks availability using `get_provider_availability()`
3. Creates booking using `create_booking()`
4. System sends notifications to provider

### Review System

1. Customer leaves review after completed booking
2. `update_provider_rating()` trigger updates provider stats
3. Review appears in provider's profile

## 🛠️ Development

### Adding New Tables

1. Create migration file: `supabase/migrations/XXX_new_table.sql`
2. Include RLS policies
3. Add storage policies if needed
4. Update this README

### Testing

```sql
-- Test RLS policies
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid"}';

-- Test functions
SELECT * FROM search_providers(37.7749, -122.4194, 25);
```

## 📝 Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE`
- UUIDs are used for all primary keys
- JSONB is used for flexible data structures
- PostGIS is enabled for geographic queries
- All tables have `created_at` and `updated_at` timestamps
- Soft deletes are used where appropriate (status fields)

## 🔗 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
