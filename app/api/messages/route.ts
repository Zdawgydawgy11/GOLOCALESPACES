import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/messages - Get all messages for the current user
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const otherUserId = searchParams.get('otherUserId');

    // If otherUserId is provided, get messages with that specific user
    if (otherUserId) {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, first_name, last_name, profile_image_url),
          receiver:users!receiver_id(id, first_name, last_name, profile_image_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        );
      }

      return NextResponse.json({ messages });
    }

    // Otherwise, get all conversations (grouped by other user)
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, first_name, last_name, profile_image_url),
        receiver:users!receiver_id(id, first_name, last_name, profile_image_url),
        booking:bookings(id, space:spaces(id, title))
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Group messages into conversations
    const conversationsMap = new Map();

    messages?.forEach((message: any) => {
      const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
      const otherUserId = otherUser.id;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: `${otherUser.first_name} ${otherUser.last_name}`,
          userImage: otherUser.profile_image_url,
          lastMessage: message.message_text,
          lastMessageTime: message.created_at,
          unreadCount: 0,
          bookingId: message.booking_id,
          spaceTitle: message.booking?.space?.title,
        });
      }

      // Count unread messages
      if (message.receiver_id === user.id && !message.is_read) {
        const conversation = conversationsMap.get(otherUserId);
        conversation.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
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
    const { receiverId, messageText, bookingId } = body;

    if (!receiverId || !messageText) {
      return NextResponse.json(
        { error: 'Receiver ID and message text are required' },
        { status: 400 }
      );
    }

    // Create the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message_text: messageText,
        booking_id: bookingId || null,
        is_read: false,
      })
      .select(`
        *,
        sender:users!sender_id(id, first_name, last_name, profile_image_url),
        receiver:users!receiver_id(id, first_name, last_name, profile_image_url)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Create a notification for the receiver
    await supabase.from('notifications').insert({
      user_id: receiverId,
      notification_type: 'new_message',
      title: 'New Message',
      message: `${user.user_metadata?.first_name || 'Someone'} sent you a message`,
      related_id: message.id,
      is_read: false,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
