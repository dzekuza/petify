#!/bin/bash

# Petify Supabase Setup Script
# This script helps set up the Supabase database and storage for the Petify application

set -e

echo "🐾 Setting up Petify Supabase Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Supabase CLI found"

# Initialize Supabase (if not already done)
if [ ! -d ".supabase" ]; then
    echo "🔄 Initializing Supabase..."
    supabase init
fi

# Start local Supabase (for development)
echo "🔄 Starting local Supabase instance..."
supabase start

# Apply migrations
echo "🔄 Applying database migrations..."
supabase db reset

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Supabase URL and anon key to .env.local:"
echo "   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here"
echo ""
echo "2. Access Supabase Studio at: http://localhost:54323"
echo "3. Test the API endpoints in your Next.js app"
echo ""
echo "🗄️ Storage buckets created:"
echo "   - avatars (public)"
echo "   - provider-images (public)"
echo "   - pet-images (public)"
echo "   - service-images (public)"
echo "   - review-images (public)"
echo "   - documents (private)"
echo "   - messages (private)"
echo ""
echo "🔒 Security features enabled:"
echo "   - Row Level Security (RLS)"
echo "   - User authentication"
echo "   - File access controls"
echo ""
echo "🎉 Setup complete! Your Petify database is ready to use."
