# Petify Deployment Guide

## Vercel Deployment Setup

### 1. Environment Variables

Set up the following environment variables in your Vercel dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Next.js Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Framework**: Next.js
- **Install Command**: `pnpm install`
- **Runtime**: Node.js 20.x for API routes

### 3. Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add all required environment variables in
   Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on every push to main branch

### 4. Database Setup

Ensure your Supabase database is properly configured:

1. Run all migrations in the `supabase/migrations/` directory
2. Set up Row Level Security (RLS) policies
3. Configure storage buckets for file uploads

### 5. Common Issues & Solutions

#### 404 Errors

- Ensure all environment variables are set correctly
- Check that the build completes successfully
- Verify API routes are properly configured

#### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check RLS policies allow proper access
- Ensure database migrations are applied

#### Mapbox Issues

- Verify Mapbox access token is valid
- Check that the token has proper permissions
- Ensure the token is set as a public environment variable

### 6. Performance Optimization

- Enable Vercel Analytics for performance monitoring
- Use Vercel's Edge Functions for API routes when possible
- Optimize images using Next.js Image component
- Enable caching for static assets

### 7. Security Considerations

- Never commit environment variables to version control
- Use Vercel's environment variable encryption
- Enable HTTPS redirects
- Set up proper CORS policies for API routes

## Local Development

To run the project locally:

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
pnpm dev
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Storage buckets set up
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
