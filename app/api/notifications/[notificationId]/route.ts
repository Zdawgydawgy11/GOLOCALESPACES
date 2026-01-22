import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/notifications/[notificationId] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
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

    const { notificationId } = await params;
    const body = await request.json();
    const { isRead } = body;

    // Update notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user owns this notification
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in PATCH /api/notifications/[notificationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
