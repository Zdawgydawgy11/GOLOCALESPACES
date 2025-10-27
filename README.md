# GoLocal Spaces

A marketplace platform connecting property owners with vendors, food trucks, and small businesses looking for short-term commercial space.

## Overview

GoLocal Spaces simplifies the process of finding and booking temporary business locations. Property owners can monetize underutilized real estate while vendors get access to prime locations for their mobile businesses.

## Features

### For Property Owners (Landlords)
- Create and manage space listings
- Set pricing and availability
- Accept or decline booking requests
- Secure payment processing
- View earnings dashboard
- Rate and review vendors

### For Vendors
- Browse available spaces by location
- Filter by amenities, price, and space type
- Book spaces instantly or request approval
- Integrated map search
- Secure payments via Stripe
- Rate and review spaces

### Platform Features
- User authentication (email, Google, Apple)
- Real-time messaging between parties
- Ratings and reviews system
- Notifications for bookings and messages
- Admin dashboard for moderation
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Payments**: Stripe Connect
- **Maps**: Google Maps API
- **Storage**: Supabase Storage (for images)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Google Maps API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/golocalspaces.git
cd golocalspaces
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit \`.env.local\` with your credentials:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file located in \`supabase/migrations/001_initial_schema.sql\`
   - Enable authentication providers in Supabase dashboard

5. Set up Stripe:
   - Create a Stripe Connect account
   - Configure webhook endpoints
   - Add your keys to \`.env.local\`

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
golocalspaces/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── spaces/            # Space listing pages
│   ├── bookings/          # Booking management
│   ├── messages/          # Messaging interface
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── spaces/           # Space-related components
│   ├── bookings/         # Booking components
│   └── common/           # Shared components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── stripe/           # Stripe integration
│   └── utils/            # Helper functions
├── types/                 # TypeScript type definitions
├── supabase/             # Database migrations
└── public/               # Static assets
\`\`\`

## Database Schema

The database consists of 12 main tables:

1. **users** - User accounts and profiles
2. **spaces** - Property listings
3. **space_amenities** - Available amenities per space
4. **space_images** - Property photos
5. **space_availability** - Calendar and blocking
6. **bookings** - Reservation records
7. **reviews** - Ratings and feedback
8. **messages** - In-app communication
9. **notifications** - User alerts
10. **favorites** - Saved spaces
11. **transactions** - Payment history
12. **user_verification** - Identity verification

See \`database-schema.md\` for full details.

## API Routes

### Spaces
- \`GET /api/spaces\` - List all active spaces
- \`GET /api/spaces/[id]\` - Get space details
- \`POST /api/spaces\` - Create new space
- \`PUT /api/spaces/[id]\` - Update space
- \`DELETE /api/spaces/[id]\` - Delete space

### Bookings
- \`GET /api/bookings\` - List user bookings
- \`POST /api/bookings\` - Create booking
- \`PUT /api/bookings/[id]\` - Update booking status
- \`DELETE /api/bookings/[id]\` - Cancel booking

### Payments
- \`POST /api/payments/create-intent\` - Create Stripe payment intent
- \`POST /api/payments/webhook\` - Handle Stripe webhooks

### Messages
- \`GET /api/messages\` - Get conversations
- \`POST /api/messages\` - Send message

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Checklist

- [ ] Set up Supabase production database
- [ ] Configure Stripe webhooks
- [ ] Add custom domain
- [ ] Enable SSL
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure email templates
- [ ] Test payment flow end-to-end
- [ ] Set up backup strategy

## Monetization

- **Transaction Fee**: 10% per successful booking
- **Premium Listings**: Featured placement for landlords
- **Promoted Profiles**: Vendor profile highlighting
- **Future**: Insurance add-ons, analytics subscriptions

## Roadmap

### Phase 1 (MVP) - Current
- [x] Database schema design
- [x] Project setup
- [ ] Authentication system
- [ ] Space listing management
- [ ] Booking system
- [ ] Payment integration
- [ ] Messaging system
- [ ] Reviews and ratings

### Phase 2
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Calendar integration
- [ ] SMS notifications
- [ ] Insurance integration

### Phase 3
- [ ] Multi-language support
- [ ] Dynamic pricing tools
- [ ] Analytics dashboard
- [ ] Referral program

### Phase 4 - GoLocal Ecosystem
- [ ] GoLocal Food
- [ ] GoLocal Services
- [ ] GoLocal Storage
- [ ] Unified search across verticals

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@golocalspaces.com or join our Discord community.

## Acknowledgments

- Built with Next.js and Supabase
- Inspired by the need to support local businesses
- Powered by Stripe for secure payments

---

**Made with ❤️ for local communities**
# GOLOCALESPACES
