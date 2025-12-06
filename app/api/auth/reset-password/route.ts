import { NextResponse } from 'next/server';
import { completePasswordReset, verifyPasswordResetToken, getClientIP } from '@/lib/security';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        {
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        },
        { status: 400 }
      );
    }
    
    // Verify token
    const userId = await verifyPasswordResetToken(token);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Complete the password reset
    const success = await completePasswordReset(token, hashedPassword);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token validity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }
    
    const userId = await verifyPasswordResetToken(token);
    
    return NextResponse.json({
      valid: !!userId
    });
    
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
