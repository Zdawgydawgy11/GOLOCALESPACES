import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/auth/signup - Create a new user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { email, password, firstName, lastName, userType, phone } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile (bypasses RLS with service role)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        phone: phone || null,
      })
      .select()
      .single();

    if (userError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
      },
      message: 'Account created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
