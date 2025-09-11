#!/bin/bash

# Script to import BookitNow.lt grooming providers into PetiFy database
# Run this script to add all the scraped grooming salons to your Supabase database

echo "🚀 Starting BookitNow.lt grooming providers import..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not connected to Supabase. Please run:"
    echo "supabase login"
    echo "supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Run the SQL scripts in order
echo "📝 Step 1: Creating sample customers..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-sample-customers.sql

echo "🏢 Step 2: Inserting grooming providers..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-bookitnow-providers.sql

echo "🛠️ Step 3: Adding services for each provider..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-bookitnow-services.sql

echo "⭐ Step 4: Adding reviews..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-bookitnow-reviews.sql

echo "✅ Import completed successfully!"
echo ""
echo "📊 Summary of imported data:"
echo "   • 7 grooming providers"
echo "   • 20+ services"
echo "   • 14 customer reviews"
echo "   • Real Lithuanian addresses and contact info"
echo ""
echo "🎉 Your PetiFy app now has real grooming providers from BookitNow.lt!"
echo ""
echo "💡 Next steps:"
echo "   1. Check your Supabase dashboard to verify the data"
echo "   2. Test the search functionality in your app"
echo "   3. Consider adding more providers from other categories"
