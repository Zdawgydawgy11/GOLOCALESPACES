import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews - Get reviews for a space or user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');
    const userId = searchParams.get('userId');

    if (!spaceId && !userId) {
      return NextResponse.json(
        { error: 'Space ID or User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:users!reviewer_id(
          id,
          first_name,
          last_name,
          profile_image_url
        ),
        space:spaces(id, title)
      `)
      .order('created_at', { ascending: false });

    if (spaceId) {
      query = query.eq('space_id', spaceId);
    }

    if (userId) {
      query = query.eq('reviewee_id', userId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Calculate average rating
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews || [],
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: 'Booking ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get booking details to validate and get reviewee info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, space_id, renter_id, host_id, booking_status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this booking
    if (booking.renter_id !== user.id && booking.host_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to review this booking' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.booking_status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Determine reviewee (the other party in the booking)
    const revieweeId = booking.renter_id === user.id ? booking.host_id : booking.renter_id;

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('reviewer_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        space_id: booking.space_id,
        rating,
        comment: comment || null,
      })
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:users!reviewer_id(
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Create a notification for the reviewee
    await supabase.from('notifications').insert({
      user_id: revieweeId,
      notification_type: 'review_received',
      title: 'New Review',
      message: `You received a ${rating}-star review`,
      related_id: review.id,
      is_read: false,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
