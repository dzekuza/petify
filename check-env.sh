#!/bin/bash

# Environment Variables Check Script
# This script helps verify that all required environment variables are set

echo "🔍 Checking Environment Variables..."
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name is not set${NC}"
        return 1
    elif [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"placeholder"* ]]; then
        echo -e "${YELLOW}⚠️  $var_name is set but contains placeholder value${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name is set${NC}"
        return 0
    fi
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "Run './setup-env.sh' to create it"
    exit 1
fi

echo -e "${GREEN}✅ .env.local file exists${NC}"
echo ""

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

echo "Checking required environment variables:"
echo ""

# Required variables
required_vars=(
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

# Optional but recommended variables
optional_vars=(
    "STRIPE_WEBHOOK_SECRET"
    "SUPABASE_SERVICE_ROLE_KEY"
)

all_good=true

echo "Required Variables:"
for var in "${required_vars[@]}"; do
    if ! check_var "$var"; then
        all_good=false
    fi
done

echo ""
echo "Optional Variables:"
for var in "${optional_vars[@]}"; do
    check_var "$var"
done

echo ""
echo "=================================="

if [ "$all_good" = true ]; then
    echo -e "${GREEN}🎉 All required environment variables are properly set!${NC}"
    echo "You can now run 'pnpm dev' to start the development server."
else
    echo -e "${RED}❌ Some required environment variables are missing or contain placeholder values.${NC}"
    echo ""
    echo "To fix this:"
    echo "1. Update your .env.local file with actual values"
    echo "2. Get Stripe keys from: https://dashboard.stripe.com/apikeys"
    echo "3. Get Supabase keys from: https://supabase.com/dashboard"
    echo "4. Run this script again to verify"
    exit 1
fi
