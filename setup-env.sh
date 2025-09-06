#!/bin/bash

# Petify Environment Setup Script
echo "🐾 Setting up Petify environment variables..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://bjmmipjnmtymaawryaid.supabase.co

EOF
    echo "✅ .env.local created successfully!"
else
    echo "⚠️  .env.local already exists. Skipping creation."
fi

echo ""
echo "📋 Next steps:"
echo "1. Start Docker Desktop"
echo "2. Run: supabase start"
echo "3. Run: supabase db reset"
echo "4. Access Supabase Studio at: http://localhost:54323"
echo ""
echo "🎉 Environment setup complete!"
