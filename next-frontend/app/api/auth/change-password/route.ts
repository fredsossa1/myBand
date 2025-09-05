import { NextRequest, NextResponse } from 'next/server';
import { updateMemberPassword, findMemberByEmail } from '@/lib/member-migration';
import { hashPassword, validatePassword, verifyPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = await request.json();

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Find member
    const member = findMemberByEmail(email);
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // If not first-time password change, verify current password
    if (!member.must_change_password && currentPassword) {
      if (!member.password_hash) {
        return NextResponse.json(
          { success: false, message: 'Account not properly configured' },
          { status: 401 }
        );
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, member.password_hash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 401 }
        );
      }
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    const updateSuccess = await updateMemberPassword(member.id, newPasswordHash);

    if (!updateSuccess) {
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
