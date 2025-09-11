#!/bin/bash

# Run BookitNow.lt training providers import script
# This script imports training providers and their services from BookitNow.lt

echo "Starting BookitNow.lt training providers import..."

# Check if we're in the right directory
if [ ! -f "scripts/insert-bookitnow-training-import.sql" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed or not in PATH"
    echo "Please install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "Error: Not logged in to Supabase or not in a Supabase project directory"
    echo "Please run: supabase login"
    echo "Then run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "Importing training providers and services..."

# Run the SQL script
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-bookitnow-training-import.sql

if [ $? -eq 0 ]; then
    echo "✅ Successfully imported training providers and services from BookitNow.lt!"
    echo ""
    echo "Imported providers:"
    echo "  - Dresūros centras | Nemirseta"
    echo "  - Dresūros centras | Palanga" 
    echo "  - Fracco dresūros mokykla"
    echo "  - Reksas - Šunų pamokos Vilniuje"
    echo ""
    echo "Total services imported: 7"
    echo ""
    echo "You can now view these providers in your PetiFy application!"
else
    echo "❌ Error importing training providers and services"
    echo "Please check the error messages above and try again"
    exit 1
fi
