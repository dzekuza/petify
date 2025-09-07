# Quick Setup Guide

## 🚨 Fix for "Neither apiKey nor config.authenticator provided" Error

If you're getting this error, it means your Stripe environment variables are not
set up.

### Quick Fix

1. **Run the setup script**:
   ```bash
   ./setup-env.sh
   ```

2. **Get your Stripe keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your **Secret key** (starts with `sk_test_`)
   - Copy your **Publishable key** (starts with `pk_test_`)

3. **Update `.env.local`**: Replace the placeholder values with your actual
   Stripe keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_51ABC123...  # Your actual secret key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...  # Your actual publishable key
   ```

4. **Restart your development server**:
   ```bash
   pnpm dev
   ```

### What was fixed?

- ✅ Stripe server initialization now handles missing environment variables
  gracefully
- ✅ Added lazy initialization to prevent runtime errors
- ✅ Created setup script for easy environment configuration
- ✅ Updated documentation with clear setup instructions

### Need Help?

- See [STRIPE_SETUP.md](STRIPE_SETUP.md) for detailed Stripe configuration
- See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for complete setup
  instructions
- Check the [Issues](https://github.com/your-repo/issues) page for common
  problems
