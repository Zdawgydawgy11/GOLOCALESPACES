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

// POST /api/stripe/connect - Create or get Stripe Connect account link
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let accountId = user.stripe_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          product_description: 'Space rental marketplace',
        },
      });

      accountId = account.id;

      // Save account ID to user record
      await supabase
        .from('users')
        .update({
          stripe_account_id: accountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?stripe_connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId,
      },
    });
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Connect account' },
      { status: 500 }
    );
  }
}

// GET /api/stripe/connect?user_id=xxx - Get Stripe Connect account status
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.stripe_account_id) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          onboarding_complete: false,
        },
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    const isConnected = account.charges_enabled && account.payouts_enabled;

    // Update local database if status changed
    if (isConnected !== user.stripe_onboarding_complete) {
      await supabase
        .from('users')
        .update({
          stripe_onboarding_complete: isConnected,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        onboarding_complete: isConnected,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      },
    });
  } catch (error: any) {
    console.error('Error getting Stripe Connect status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get Connect status' },
      { status: 500 }
    );
  }
}
