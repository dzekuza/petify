# Petify - Pet Care Marketplace

An Airbnb-style marketplace for pet service providers including groomers,
veterinarians, pet sitters, trainers, and care providers.

## 🚀 Features

- **Service Discovery**: Search and filter pet services by location, type, and
  availability
- **Provider Profiles**: Detailed profiles with ratings, reviews, and service
  offerings
- **Booking System**: Calendar-based booking with real-time availability
- **Map Integration**: Interactive map showing service locations
- **User Authentication**: Provider and customer accounts
- **Reviews & Ratings**: Customer feedback system
- **Provider Dashboard**: Management interface for service providers

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: TailwindCSS + shadcn/ui + Radix primitives
- **Maps**: react-leaflet for location-based services
- **State Management**: React Query (TanStack Query)
- **Database**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest + React Testing Library + Playwright

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd petify
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
./setup-env.sh
```

This will create a `.env.local` file with all required environment variables.
You'll need to replace the placeholder values with your actual keys.

4. Verify your environment setup:

```bash
./check-env.sh
```

This will check that all required environment variables are properly configured.

5. Configure your environment variables in `.env.local`:

```env
# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: You need to set up Stripe keys to use the payment functionality.
See [STRIPE_SETUP.md](STRIPE_SETUP.md) for detailed instructions.

## 🔒 Security & Environment Variables

This project uses a comprehensive `.gitignore` file to ensure sensitive
information is never committed to version control:

- **Environment files**: All `.env*` files are ignored
- **API keys**: Stripe, Supabase, and other service keys are protected
- **Database files**: Local database files are excluded
- **Logs**: All log files are ignored
- **Cache**: Build and dependency cache files are excluded

### Environment Variable Security

- ✅ `.env.local` is automatically ignored by git
- ✅ All environment files (`.env*`) are excluded from version control
- ✅ API keys and secrets are never committed
- ✅ Use `./check-env.sh` to verify your environment setup

6. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

## 🗄 Database Setup

### Local Development with Supabase

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Set up environment variables**:
   ```bash
   ./setup-env.sh
   ```

3. **Start Docker Desktop** (required for local Supabase)

4. **Start Supabase**:
   ```bash
   supabase start
   ```

5. **Apply database migrations**:
   ```bash
   supabase db reset
   ```

6. **Access Supabase Studio**: http://localhost:54323

### Production Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update your `.env.local` with production credentials
4. Push migrations to production:
   ```bash
   supabase db push
   ```

### Database Schema

The database includes comprehensive tables for:

#### Core Tables

- **users** - User accounts and profiles
- **providers** - Service providers (groomers, vets, etc.)
- **services** - Individual services offered by providers
- **pets** - Pet profiles
- **bookings** - Appointment bookings
- **reviews** - Customer reviews and ratings

#### Communication

- **conversations** - Chat conversations
- **messages** - Individual messages
- **notifications** - User notifications

#### Additional

- **favorites** - User's favorite providers
- **service_categories** - Service type categories

#### Storage Buckets

- **Public**: avatars, provider-images, pet-images, service-images,
  review-images
- **Private**: documents, messages

#### Security Features

- Row Level Security (RLS) on all tables
- User authentication with Supabase Auth
- File access controls based on ownership
- Data validation with constraints and triggers

#### Database Functions

- `search_providers()` - Geographic search with filters
- `get_provider_availability()` - Check availability slots
- `create_booking()` - Booking creation with validation
- `get_user_dashboard()` - Dashboard data for users/providers

For the complete schema, see the migration files in `supabase/migrations/`.

## 🧪 Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm e2e
```

### Test UI

```bash
pnpm test:ui
pnpm e2e:ui
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout.tsx        # Main layout wrapper
│   ├── navigation.tsx    # Navigation component
│   ├── footer.tsx        # Footer component
│   ├── hero-section.tsx  # Homepage hero
│   ├── service-categories.tsx # Service categories
│   ├── featured-providers.tsx # Featured providers
│   └── providers.tsx     # React Query provider
├── lib/                  # Utility functions
│   ├── supabase.ts      # Supabase client
│   ├── query-client.ts  # React Query client
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
    └── index.ts         # Main types
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact us at info@petify.lt

## 🎯 Roadmap

- [ ] Advanced search filters
- [ ] Real-time chat between customers and providers
- [ ] Mobile app (React Native)
- [x] Payment integration (Stripe)
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
