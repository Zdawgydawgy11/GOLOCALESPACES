import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge, supabase);
        break;

      case 'account.updated':
        // Handle Stripe Connect account updates (for landlord onboarding)
        await handleAccountUpdated(event.data.object as Stripe.Account, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Find booking by payment intent ID
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, spaces(*)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (bookingError || !booking) {
    console.error('Booking not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      booking_status: 'confirmed',
      paid_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({
      transaction_status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('booking_id', booking.id)
    .eq('stripe_charge_id', paymentIntent.id);

  // Send notification to vendor (payment confirmation)
  await supabase.from('notifications').insert({
    user_id: booking.vendor_id,
    notification_type: 'payment_confirmation',
    title: 'Payment Successful',
    message: `Your payment for ${booking.spaces.title} has been confirmed. Booking is now active.`,
    related_id: booking.id,
  });

  // Send notification to landlord (booking confirmation)
  await supabase.from('notifications').insert({
    user_id: booking.landlord_id,
    notification_type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `Payment received for ${booking.spaces.title}. The booking is now confirmed.`,
    related_id: booking.id,
  });

  console.log('Booking and transaction updated successfully');
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Payment failed:', paymentIntent.id);

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, spaces(*)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (bookingError || !booking) {
    console.error('Booking not found for failed payment:', paymentIntent.id);
    return;
  }

  // Update booking status to failed
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      booking_status: 'cancelled',
    })
    .eq('id', booking.id);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({
      transaction_status: 'failed',
    })
    .eq('booking_id', booking.id)
    .eq('stripe_charge_id', paymentIntent.id);

  // Send notification to vendor
  await supabase.from('notifications').insert({
    user_id: booking.vendor_id,
    notification_type: 'payment_failed',
    title: 'Payment Failed',
    message: `Payment for ${booking.spaces.title} failed. Please update your payment method and try again.`,
    related_id: booking.id,
  });

  console.log('Payment failure handled');
}

async function handleRefund(charge: Stripe.Charge, supabase: any) {
  console.log('Refund processed:', charge.id);

  // Find transaction by charge ID
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*, bookings(*)')
    .eq('stripe_charge_id', charge.payment_intent)
    .single();

  if (transactionError || !transaction) {
    console.error('Transaction not found for refund:', charge.id);
    return;
  }

  // Create refund transaction
  await supabase.from('transactions').insert({
    booking_id: transaction.booking_id,
    payer_id: transaction.payee_id, // Reversed - landlord pays back vendor
    payee_id: transaction.payer_id,
    amount: charge.amount_refunded / 100, // Convert from cents
    platform_fee: 0,
    stripe_charge_id: charge.id,
    transaction_type: 'refund',
    transaction_status: 'completed',
    processed_at: new Date().toISOString(),
  });

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'refunded',
      booking_status: 'cancelled',
    })
    .eq('id', transaction.booking_id);

  // Notify both parties
  await supabase.from('notifications').insert([
    {
      user_id: transaction.payer_id,
      notification_type: 'refund_processed',
      title: 'Refund Processed',
      message: `Your refund for booking #${transaction.booking_id} has been processed.`,
      related_id: transaction.booking_id,
    },
    {
      user_id: transaction.payee_id,
      notification_type: 'refund_processed',
      title: 'Refund Issued',
      message: `A refund has been issued for booking #${transaction.booking_id}.`,
      related_id: transaction.booking_id,
    },
  ]);

  console.log('Refund handled successfully');
}

async function handleAccountUpdated(account: Stripe.Account, supabase: any) {
  console.log('Stripe Connect account updated:', account.id);

  // Find user by Stripe account ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_account_id', account.id)
    .single();

  if (userError || !user) {
    console.error('User not found for Stripe account:', account.id);
    return;
  }

  // Update user's payout status based on account capabilities
  const payoutsEnabled = account.charges_enabled && account.payouts_enabled;

  await supabase
    .from('users')
    .update({
      stripe_onboarding_complete: payoutsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // Notify user if onboarding is complete
  if (payoutsEnabled && !user.stripe_onboarding_complete) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      notification_type: 'stripe_connected',
      title: 'Payment Setup Complete',
      message: 'Your Stripe account is now set up and ready to receive payments!',
    });
  }

  console.log('Stripe Connect account status updated');
}
