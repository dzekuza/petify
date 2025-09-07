#!/bin/bash

# Petify Environment Setup Script
# This script helps you set up the required environment variables

echo "🐾 Petify Environment Setup"
echo "=========================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local file
echo "📝 Creating .env.local file..."

cat > .env.local << 'EOF'
# Stripe Configuration
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Webhook Secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
EOF

echo "✅ .env.local file created successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Get your Stripe keys from: https://dashboard.stripe.com/apikeys"
echo "2. Get your Supabase keys from: https://supabase.com/dashboard"
echo "3. Replace the placeholder values in .env.local with your actual keys"
echo "4. Run 'pnpm dev' to start the development server"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   - STRIPE_SETUP.md for Stripe configuration"
echo "   - DEVELOPMENT_GUIDE.md for general setup"
echo ""
echo "⚠️  Remember: Never commit .env.local to version control!"