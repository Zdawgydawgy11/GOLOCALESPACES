import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ApiResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/spaces/[id] - Get space details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = params;

    const { data, error } = await supabase
      .from('spaces')
      .select(`
        *,
        space_amenities(*),
        space_images(*),
        users!owner_id(id, first_name, last_name, email, phone, profile_image_url, verified)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Space not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching space:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch space' },
      { status: 500 }
    );
  }
}

// PUT /api/spaces/[id] - Update space
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = params;
    const body = await request.json();

    // Get authenticated user from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingSpace } = await supabase
      .from('spaces')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existingSpace) {
      return NextResponse.json(
        { success: false, error: 'Space not found' },
        { status: 404 }
      );
    }

    // Update space
    const { data, error } = await supabase
      .from('spaces')
      .update({
        title: body.title,
        description: body.description,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        latitude: body.latitude,
        longitude: body.longitude,
        space_type: body.space_type,
        size_sqft: body.size_sqft,
        price_per_day: body.price_per_day,
        price_per_week: body.price_per_week,
        price_per_month: body.price_per_month,
        instant_book: body.instant_book,
        allowed_usage_types: body.allowed_usage_types,
        allowed_business_types: body.allowed_business_types,
        operating_hours: body.operating_hours,
        insurance_requirements: body.insurance_requirements,
        rental_period_length: body.rental_period_length,
        rental_period_unit: body.rental_period_unit,
        payment_collection_day: body.payment_collection_day,
        vendor_experience_required: body.vendor_experience_required,
        additional_terms: body.additional_terms,
        status: body.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const response: ApiResponse<any> = {
      success: true,
      data,
      message: 'Space updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating space:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update space' },
      { status: 500 }
    );
  }
}

// DELETE /api/spaces/[id] - Delete space
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = params;

    // Get authenticated user from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const response: ApiResponse<null> = {
      success: true,
      message: 'Space deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting space:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete space' },
      { status: 500 }
    );
  }
}
