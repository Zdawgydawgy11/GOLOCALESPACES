import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Space, SpaceSearchFilters, ApiResponse, PaginatedResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/spaces - List all spaces with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    // Parse query parameters for filtering
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const spaceType = searchParams.get('space_type');
    const usageType = searchParams.get('usage_type');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minSize = searchParams.get('min_size');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query = supabase
      .from('spaces')
      .select(`
        *,
        space_amenities(*),
        space_images(*),
        users!owner_id(id, first_name, last_name, profile_image_url, verified)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply filters
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.eq('state', state);
    if (spaceType) query = query.eq('space_type', spaceType);
    if (minPrice) query = query.gte('price_per_month', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price_per_month', parseFloat(maxPrice));
    if (minSize) query = query.gte('size_sqft', parseInt(minSize));

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const response: PaginatedResponse<any> = {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}

// POST /api/spaces - Create a new space
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    // Get authenticated user from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    const {
      title,
      address,
      city,
      state,
      zip_code,
      space_type,
      price_per_month,
      owner_id,
      amenities,
      images,
    } = body;

    if (!title || !address || !city || !state || !zip_code || !space_type || !price_per_month || !owner_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create space
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .insert({
        owner_id,
        title,
        description: body.description,
        address,
        city,
        state,
        zip_code,
        latitude: body.latitude,
        longitude: body.longitude,
        space_type,
        size_sqft: body.size_sqft,
        price_per_day: body.price_per_day || 0,
        price_per_week: body.price_per_week,
        price_per_month,
        instant_book: body.instant_book || false,
        allowed_usage_types: body.allowed_usage_types,
        allowed_business_types: body.allowed_business_types,
        operating_hours: body.operating_hours,
        insurance_requirements: body.insurance_requirements,
        rental_period_length: body.rental_period_length,
        rental_period_unit: body.rental_period_unit,
        payment_collection_day: body.payment_collection_day,
        vendor_experience_required: body.vendor_experience_required,
        additional_terms: body.additional_terms,
        status: 'active',
      })
      .select()
      .single();

    if (spaceError) throw spaceError;

    // Create amenities if provided
    if (amenities && space) {
      const { error: amenitiesError } = await supabase
        .from('space_amenities')
        .insert({
          space_id: space.id,
          ...amenities,
        });

      if (amenitiesError) console.error('Error creating amenities:', amenitiesError);
    }

    // Create images if provided
    if (images && images.length > 0 && space) {
      const imageRecords = images.map((img: any, index: number) => ({
        space_id: space.id,
        image_url: img.url,
        is_primary: index === 0,
        display_order: index,
      }));

      const { error: imagesError } = await supabase
        .from('space_images')
        .insert(imageRecords);

      if (imagesError) console.error('Error creating images:', imagesError);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: space,
      message: 'Space created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating space:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create space' },
      { status: 500 }
    );
  }
}
