import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/bookings/[id] - Get a single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const bookingId = params.id;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        spaces(*),
        vendor:users!vendor_id(id, first_name, last_name, email, phone),
        landlord:users!landlord_id(id, first_name, last_name, email, phone)
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
