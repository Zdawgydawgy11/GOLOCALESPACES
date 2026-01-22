import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ApiResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/spaces/owner/[ownerId] - Get all spaces for a specific owner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('spaces')
      .select(`
        *,
        space_amenities(*),
        space_images(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const response: ApiResponse<any[]> = {
      success: true,
      data: data || [],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching owner spaces:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
