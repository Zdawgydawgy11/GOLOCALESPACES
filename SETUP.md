# GoLocal Spaces - Setup Guide

This guide will walk you through setting up the GoLocal Spaces platform from scratch.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier is fine)
- A Stripe account
- A Google Cloud account (for Maps API)
- Git installed

## Step 1: Environment Setup

1. **Copy the environment template:**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

## Step 2: Supabase Setup

### 2.1 Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose an organization or create one
4. Enter project details:
   - Name: golocalspaces
   - Database Password: (save this somewhere secure)
   - Region: Choose closest to your users

### 2.2 Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values to your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service_role key (keep this secret!)

### 2.3 Run Database Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Verify all tables were created (check the Table Editor)

### 2.4 Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider (enabled by default)
3. Optional: Enable Google and Apple Sign-In
   - For Google: Add OAuth credentials from Google Cloud Console
   - For Apple: Add Apple OAuth credentials

4. Go to Authentication > URL Configuration
5. Add your site URL: `http://localhost:3000` (for development)
6. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - For production, add your production URL

### 2.5 Set up Storage (for images)

1. Go to Storage
2. Create a new bucket called `space-images`
3. Make it public (for now - we'll add policies later)
4. Create another bucket called `user-avatars`
5. Make it public

### 2.6 Configure Row Level Security

The migration file already includes RLS policies. Verify they're active:
1. Go to Authentication > Policies
2. You should see policies for each table
3. If not, re-run the migration

## Step 3: Stripe Setup

### 3.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up or sign in
3. Complete account setup

### 3.2 Get API Keys

1. Go to Developers > API Keys
2. Copy to `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key
   - `STRIPE_SECRET_KEY`: Secret key
   - **Important**: Use TEST keys for development!

### 3.3 Set up Stripe Connect

Stripe Connect is needed for marketplace payments:

1. Go to Connect > Get Started
2. Choose "Platform or Marketplace"
3. Complete the onboarding
4. Configure your platform settings:
   - Platform name: GoLocal Spaces
   - Business type: Marketplace
   - Support email: your email

### 3.4 Configure Webhooks

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   - For local dev: Use [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - For production: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated`
5. Copy the webhook signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 3.5 Test Stripe Integration (Local Development)

\`\`\`bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
\`\`\`

## Step 4: Google Maps Setup

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "GoLocal Spaces"
3. Enable billing (required for Maps API)

### 4.2 Enable APIs

1. Go to APIs & Services > Library
2. Search for and enable:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### 4.3 Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the key to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4.4 Restrict API Key (Important!)

1. Click "Edit API key"
2. Under "Application restrictions":
   - For development: Choose "None" (temporarily)
   - For production: Choose "HTTP referrers" and add your domain
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select: Maps JavaScript API, Places API, Geocoding API
4. Save

## Step 5: Run the Application

1. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the application:**
   - Create an account
   - Sign in
   - Browse the interface

## Step 6: Verify Everything Works

### Test Checklist:

- [ ] Home page loads
- [ ] Can create an account
- [ ] Can sign in
- [ ] Can sign out
- [ ] Dashboard loads after login
- [ ] Profile page works
- [ ] Can upload images (once implemented)
- [ ] Maps display correctly (once implemented)
- [ ] Payment flow works (once implemented)

## Common Issues

### Issue: Supabase Connection Error

**Solution:**
- Verify your `.env.local` has correct Supabase URL and keys
- Check Supabase project is active
- Restart dev server after changing env vars

### Issue: Stripe Test Payments Fail

**Solution:**
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Issue: Google Maps Not Showing

**Solution:**
- Verify API key is correct
- Check billing is enabled on Google Cloud
- Ensure APIs are enabled
- Check browser console for errors

### Issue: Image Upload Fails

**Solution:**
- Verify storage buckets are created
- Check bucket permissions (public read access)
- Ensure file size is under 5MB

## Development Tips

1. **Use separate environments:**
   - Create `.env.local` for local development
   - Create `.env.production` for production
   - Never commit these files!

2. **Test with multiple users:**
   - Use incognito windows for different user sessions
   - Test landlord and vendor flows separately

3. **Monitor your quotas:**
   - Supabase: 500MB database (free tier)
   - Stripe: Unlimited test transactions
   - Google Maps: $200/month free credit

4. **Use Supabase Studio:**
   - Browse data directly in the dashboard
   - Test queries in SQL Editor
   - Monitor API usage

## Next Steps

Once your environment is set up:

1. Review the codebase structure
2. Check out the feature roadmap in README.md
3. Start implementing remaining features
4. Test thoroughly before deploying

## Deployment

When you're ready to deploy:

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Update Supabase URL config with production URL
5. Update Stripe webhook with production URL
6. Deploy!

### Update Production URLs

After deployment:
- Update Supabase redirect URLs
- Update Stripe webhook endpoint
- Restrict Google Maps API key to production domain
- Switch to production Stripe keys

## Need Help?

- Check the README.md for feature documentation
- Review database schema in database-schema.md
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Check Stripe docs: [stripe.com/docs](https://stripe.com/docs)
- Open an issue on GitHub

---

You're now ready to build GoLocal Spaces!
