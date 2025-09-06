# 🚀 Petify Production Supabase Setup

Your Supabase project is ready! Here's how to complete the database setup.

## ✅ What's Already Done

- ✅ Supabase project created: `bjmmipjnmtymaawryaid`
- ✅ Environment variables configured
- ✅ Connection tested and working
- ✅ Migration files ready

## 🔧 Complete Database Setup

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bjmmipjnmtymaawryaid/sql
2. You'll see the SQL Editor where you can run migrations

### Step 2: Run Database Migrations

Run these SQL scripts **in order**:

#### 1. Initial Schema (001_initial_schema.sql)

```sql
-- Copy the entire content from: supabase/migrations/001_initial_schema.sql
-- This creates all tables, indexes, and triggers
```

#### 2. Row Level Security (002_rls_policies.sql)

```sql
-- Copy the entire content from: supabase/migrations/002_rls_policies.sql
-- This sets up security policies
```

#### 3. Storage Setup (003_storage_setup.sql)

```sql
-- Copy the entire content from: supabase/migrations/003_storage_setup.sql
-- This creates storage buckets and policies
```

#### 4. Functions & Views (004_functions_views.sql)

```sql
-- Copy the entire content from: supabase/migrations/004_functions_views.sql
-- This creates database functions for search and booking
```

#### 5. Seed Data (005_seed_data.sql)

```sql
-- Copy the entire content from: supabase/migrations/005_seed_data.sql
-- This adds sample data for testing
```

### Step 3: Verify Setup

Run this command to test your database:

```bash
node setup-database.js
```

You should see:

```
✅ Database connection successful!
✅ Table 'users' is ready
✅ Table 'providers' is ready
✅ Table 'services' is ready
✅ Table 'pets' is ready
✅ Table 'bookings' is ready
✅ Table 'reviews' is ready
```

## 🗄️ Database Schema Overview

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

## 🗂️ Storage Buckets

The following storage buckets will be created:

### Public Buckets

- `avatars` - User profile pictures (5MB limit)
- `provider-images` - Provider business photos (10MB limit)
- `pet-images` - Pet photos (5MB limit)
- `service-images` - Service photos (10MB limit)
- `review-images` - Review photos (5MB limit)

### Private Buckets

- `documents` - Verification documents, licenses (20MB limit)
- `messages` - Message attachments (10MB limit)

## 🔒 Security Features

- **Row Level Security (RLS)** - All tables protected
- **User Authentication** - Supabase Auth integration
- **File Access Controls** - Storage policies based on ownership
- **Data Validation** - Database constraints and triggers

## 🛠️ Database Functions

- `search_providers(lat, lng, radius, service, rating, limit)` - Geographic
  search
- `get_provider_availability(provider_id, date)` - Check availability
- `create_booking(...)` - Create booking with validation
- `get_user_dashboard(user_id)` - Dashboard data

## 🧪 Testing Your Setup

1. **Test Database Connection**:
   ```bash
   node setup-database.js
   ```

2. **Test Your App**:
   ```bash
   pnpm dev
   ```

3. **Check Supabase Dashboard**:
   - Tables: https://supabase.com/dashboard/project/bjmmipjnmtymaawryaid/editor
   - Storage:
     https://supabase.com/dashboard/project/bjmmipjnmtymaawryaid/storage/buckets
   - Auth:
     https://supabase.com/dashboard/project/bjmmipjnmtymaawryaid/auth/users

## 🎯 Next Steps

1. ✅ Run all 5 migration files in Supabase Dashboard
2. ✅ Verify setup with `node setup-database.js`
3. ✅ Start your app with `pnpm dev`
4. ✅ Test user registration and login
5. ✅ Test provider creation and service listing

## 🆘 Troubleshooting

### Common Issues

1. **"Could not find the table"** - Run the migration files in order
2. **Permission errors** - Check RLS policies are applied
3. **Storage errors** - Verify storage buckets are created
4. **Function errors** - Ensure all functions are created

### Reset Database

If you need to start over:

1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset Database"
3. Run all migrations again

## 🎉 You're Ready!

Once you've run all the migrations, your Petify database will be fully set up
with:

- Complete user management system
- Provider and service management
- Booking and review system
- Real-time messaging
- File storage
- Geographic search capabilities

Your app is ready to go! 🚀
