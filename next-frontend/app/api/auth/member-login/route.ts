import { NextRequest, NextResponse } from 'next/server';
import { findMemberByEmail } from '@/lib/member-migration';
import { verifyPassword, generateToken, memberToUserContext } from '@/lib/auth-utils';
import { updateLastLogin } from '@/lib/member-migration';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find member by email
    const member = findMemberByEmail(email);
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!member.password_hash) {
      return NextResponse.json(
        { success: false, message: 'Account not properly configured' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, member.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    updateLastLogin(member.id);

    // Generate token and user context
    const userContext = memberToUserContext(member);
    const token = generateToken(userContext);

    return NextResponse.json({
      success: true,
      user: userContext,
      token,
      message: member.must_change_password 
        ? 'Please change your password' 
        : 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
