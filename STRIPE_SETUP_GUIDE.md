# Stripe Payment Integration - Setup Complete

This document outlines the Stripe payment integration that has been implemented for GoLocal Spaces.

## What's Been Implemented

### 1. Webhook Endpoint ✓
**File:** `app/api/webhooks/stripe/route.ts`

Handles the following Stripe events:
- `payment_intent.succeeded` - Updates booking and transaction status to confirmed/paid
- `payment_intent.payment_failed` - Marks booking as failed
- `charge.refunded` - Processes refunds and creates refund transactions
- `account.updated` - Updates landlord Stripe Connect onboarding status

### 2. Checkout Flow ✓
**Files:**
- `app/checkout/page.tsx` - Main checkout page with booking summary
- `components/CheckoutForm.tsx` - Stripe Elements payment form component
- `app/booking-confirmation/page.tsx` - Success page after payment

**Features:**
- Date selection on space detail page
- Payment summary calculation
- Secure payment with Stripe Elements
- Test card information displayed for development
- Booking confirmation page

### 3. Stripe Connect Integration ✓
**Files:**
- `app/api/stripe/connect/route.ts` - Create and manage Stripe Connect accounts
- `components/StripeConnectButton.tsx` - UI component for landlords to connect their account

**Features:**
- Automatic Stripe Connect account creation for landlords
- Onboarding flow to collect payment information
- Automatic payment splits (90% to landlord, 10% platform fee)
- Payment status tracking

### 4. API Endpoints ✓
- `GET/POST /api/bookings` - Create and retrieve bookings
- `GET /api/bookings/[id]` - Get single booking details
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/stripe/connect` - Create Stripe Connect onboarding link
- `GET /api/stripe/connect` - Check Stripe Connect status

## Environment Variables Required

Add these to your `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for Stripe Connect redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing the Payment Flow

### Step 1: Set Up Stripe CLI (for webhooks)

```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`.

### Step 2: Test as a Vendor (Making a Booking)

1. Visit the deployed app at https://golocalspaces.vercel.app
2. Browse available spaces at `/spaces`
3. Click on a space to view details
4. Click "Request Booking"
5. Select start and end dates
6. Click "Proceed to Checkout"
7. Fill in payment details using test card:
   - **Card Number:** 4242 4242 4242 4242
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **ZIP:** Any 5 digits
8. Click "Confirm & Pay"
9. You should be redirected to the confirmation page

### Step 3: Test as a Landlord (Receiving Payments)

1. Log in as a landlord (property owner)
2. Go to your dashboard
3. Add the StripeConnectButton component to show connection status
4. Click "Connect with Stripe"
5. Complete the Stripe onboarding process
6. Once connected, any bookings will automatically transfer funds to your account

### Step 4: Verify Webhook Events

When a payment is made, you should see in your Stripe CLI:
```
payment_intent.succeeded
```

Check the following happened:
- Booking status updated to "confirmed"
- Payment status updated to "paid"
- Transaction record created
- Notifications sent to both vendor and landlord

## Integration with Dashboard

To display the Stripe Connect button in the landlord dashboard, add this to `app/dashboard/page.tsx`:

```tsx
import StripeConnectButton from '@/components/StripeConnectButton';

// Inside your dashboard component:
{userType === 'landlord' && (
  <div className="mb-6">
    <StripeConnectButton userId={currentUser.id} />
  </div>
)}
```

## Payment Flow Diagram

```
1. Vendor selects dates on space detail page
   ↓
2. Redirect to /checkout with space_id, start_date, end_date
   ↓
3. Checkout page creates booking via POST /api/bookings
   ↓
4. API creates Stripe PaymentIntent with Connect transfer
   ↓
5. Returns clientSecret to frontend
   ↓
6. Stripe Elements collects payment info
   ↓
7. Payment confirmed → webhook receives event
   ↓
8. Webhook updates booking status to confirmed
   ↓
9. Funds automatically split:
   - 90% to landlord's Stripe Connect account
   - 10% platform fee retained
   ↓
10. Both parties receive notifications
```

## Database Fields Used

### bookings table:
- `stripe_payment_intent_id` - Links to Stripe payment
- `payment_status` - pending, paid, failed, refunded
- `booking_status` - pending, confirmed, cancelled
- `paid_at` - Timestamp when payment succeeded

### users table:
- `stripe_account_id` - Stripe Connect account ID
- `stripe_onboarding_complete` - Whether landlord can receive payments

### transactions table:
- `stripe_charge_id` - Links to Stripe charge/payment intent
- `transaction_status` - pending, completed, failed
- `platform_fee` - 10% fee amount
- `processed_at` - When transaction completed

## Testing Scenarios

### Successful Payment
1. Complete booking flow
2. Use test card 4242 4242 4242 4242
3. Verify booking status = confirmed
4. Verify payment status = paid

### Failed Payment
1. Complete booking flow
2. Use test card 4000 0000 0000 0002 (always fails)
3. Verify booking status = cancelled
4. Verify payment status = failed

### Refund
1. In Stripe Dashboard, refund a payment
2. Verify webhook creates refund transaction
3. Verify booking status = cancelled
4. Verify payment status = refunded

## Production Checklist

Before deploying to production:

- [ ] Switch from test keys to live Stripe keys
- [ ] Update webhook endpoint in Stripe Dashboard
- [ ] Update NEXT_PUBLIC_APP_URL to production domain
- [ ] Test Stripe Connect onboarding flow
- [ ] Verify webhook signature validation
- [ ] Test full payment flow with live keys (in test mode first)
- [ ] Set up proper error monitoring
- [ ] Configure email notifications for payment events

## Stripe Dashboard Configuration

### Webhook Setup (Production)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
   - account.updated
5. Copy webhook signing secret to environment variables

### Connect Settings
1. Go to Connect → Settings
2. Platform name: GoLocal Spaces
3. Business type: Marketplace
4. Configure branding (logo, colors)

## Support & Troubleshooting

### Common Issues

**Issue:** Webhook signature verification fails
- Solution: Ensure STRIPE_WEBHOOK_SECRET matches the one from Stripe CLI or Dashboard

**Issue:** Payment succeeds but booking not confirmed
- Solution: Check webhook endpoint is accessible and processing events correctly

**Issue:** Stripe Connect transfer fails
- Solution: Verify landlord has completed onboarding (`stripe_onboarding_complete = true`)

## Next Steps

1. Add email notifications for payment events
2. Implement payout dashboard for landlords
3. Add payment history/receipts
4. Implement dispute handling
5. Add subscription options for recurring bookings

---

**Payment integration is now ready for testing!** 🎉

Use the test card information and Stripe CLI to verify the complete flow works as expected.
