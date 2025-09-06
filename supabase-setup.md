# 🐾 Petify Supabase Setup Guide

This guide will help you set up Supabase for your Petify application.

## Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Verify installation**:
   ```bash
   supabase --version
   ```

## Quick Setup

### 1. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Mapbox Configuration (replace with your actual token)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
```

### 2. Start Supabase

Run the setup script:

```bash
chmod +x supabase/setup.sh
./supabase/setup.sh
```

Or manually:

```bash
# Start local Supabase instance
supabase start

# Apply all migrations
supabase db reset
```

### 3. Access Supabase Studio

Open your browser and go to: http://localhost:54323

## Database Schema

Your database includes:

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

## Storage Buckets

The following storage buckets are configured:

### Public Buckets

- `avatars` - User profile pictures (5MB limit)
- `provider-images` - Provider business photos (10MB limit)
- `pet-images` - Pet photos (5MB limit)
- `service-images` - Service photos (10MB limit)
- `review-images` - Review photos (5MB limit)

### Private Buckets

- `documents` - Verification documents, licenses (20MB limit)
- `messages` - Message attachments (10MB limit)

## Security Features

- **Row Level Security (RLS)** - All tables protected
- **User Authentication** - Supabase Auth integration
- **File Access Controls** - Storage policies based on ownership
- **Data Validation** - Database constraints and triggers

## Database Functions

- `search_providers(lat, lng, radius, service, rating, limit)` - Geographic
  search
- `get_provider_availability(provider_id, date)` - Check availability
- `create_booking(...)` - Create booking with validation
- `get_user_dashboard(user_id)` - Dashboard data

## Testing the Setup

1. **Check Supabase Status**:
   ```bash
   supabase status
   ```

2. **View Logs**:
   ```bash
   supabase logs
   ```

3. **Test Database Connection**:
   ```bash
   supabase db shell
   ```

## Production Deployment

When ready for production:

1. Create a Supabase project at https://supabase.com
2. Update your `.env.local` with production URLs and keys
3. Push migrations to production:
   ```bash
   supabase db push
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 54321-54324 are available
2. **Docker issues**: Ensure Docker is running
3. **Migration errors**: Check the migration files for syntax errors

### Reset Everything

```bash
supabase stop
supabase start
supabase db reset
```

## Next Steps

1. ✅ Environment variables configured
2. ✅ Supabase instance running
3. ✅ Database schema applied
4. ✅ Storage buckets created
5. ✅ Security policies enabled

Your Petify database is now ready to use! 🎉
