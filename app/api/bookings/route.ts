import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { ApiResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

// POST /api/bookings - Create a new booking with payment
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      space_id,
      vendor_id,
      start_date,
      end_date,
      special_requests,
    } = body;

    // Validate required fields
    if (!space_id || !vendor_id || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get space details
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*, users!owner_id(id, first_name, last_name, email)')
      .eq('id', space_id)
      .single();

    if (spaceError || !space) {
      return NextResponse.json(
        { success: false, error: 'Space not found' },
        { status: 404 }
      );
    }

    // Calculate rental duration and total price
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsCount = daysCount / 30;

    // Calculate total price (use monthly rate if available, otherwise daily)
    let totalPrice = 0;
    if (space.price_per_month && monthsCount >= 1) {
      totalPrice = space.price_per_month * Math.ceil(monthsCount);
    } else if (space.price_per_day) {
      totalPrice = space.price_per_day * daysCount;
    } else {
      // Fallback to monthly rate divided by 30
      totalPrice = (space.price_per_month / 30) * daysCount;
    }

    // Calculate platform fee (10%)
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;
    const landlordAmount = totalPrice - platformFee;

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        space_id,
        vendor_id,
        landlord_id: space.owner_id,
        start_date,
        end_date,
        platform_fee: platformFee.toFixed(2),
        landlord_amount: landlordAmount.toFixed(2),
      },
      description: `Booking for ${space.title}`,
    });

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        space_id,
        vendor_id,
        landlord_id: space.owner_id,
        start_date,
        end_date,
        total_price: totalPrice,
        booking_status: 'pending',
        payment_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        special_requests,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create transaction record
    await supabase.from('transactions').insert({
      booking_id: booking.id,
      payer_id: vendor_id,
      payee_id: space.owner_id,
      amount: totalPrice,
      platform_fee: platformFee,
      stripe_charge_id: paymentIntent.id,
      transaction_type: 'payment',
      transaction_status: 'pending',
    });

    // Create notification for landlord
    await supabase.from('notifications').insert({
      user_id: space.owner_id,
      notification_type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${space.title}`,
      related_id: booking.id,
    });

    const response: ApiResponse<any> = {
      success: true,
      data: {
        booking,
        clientSecret: paymentIntent.client_secret,
        totalPrice,
        platformFee,
      },
      message: 'Booking created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('user_id');
    const userType = searchParams.get('user_type'); // 'vendor' or 'landlord'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        spaces(*),
        vendor:users!vendor_id(id, first_name, last_name, email, phone),
        landlord:users!landlord_id(id, first_name, last_name, email, phone)
      `);

    // Filter based on user type
    if (userType === 'vendor') {
      query = query.eq('vendor_id', userId);
    } else if (userType === 'landlord') {
      query = query.eq('landlord_id', userId);
    } else {
      // Get all bookings where user is either vendor or landlord
      query = query.or(`vendor_id.eq.${userId},landlord_id.eq.${userId}`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const response: ApiResponse<any> = {
      success: true,
      data: data || [],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
