// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('[AUTH-TEST] ====== START ======');
    console.log('[AUTH-TEST] Timestamp:', new Date().toISOString());
    console.log('[AUTH-TEST] Email:', email);
    console.log('[AUTH-TEST] Password length:', password?.length || 0);
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing email or password'
      }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[AUTH-TEST] Normalized email:', normalizedEmail);
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        onboardingCompleted: true
      }
    });
    
    console.log('[AUTH-TEST] User found:', !!user);
    console.log('[AUTH-TEST] User ID:', user?.id || 'N/A');
    console.log('[AUTH-TEST] Has password:', !!user?.password);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: {
          searchedEmail: normalizedEmail,
          userExists: false
        }
      });
    }
    
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password (OAuth only?)',
        details: {
          userId: user.id,
          email: user.email,
          hasPassword: false
        }
      });
    }
    
    // Test password
    console.log('[AUTH-TEST] Testing password...');
    const isValid = await bcrypt.compare(password, user.password);
    console.log('[AUTH-TEST] Password valid:', isValid);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password',
        details: {
          userId: user.id,
          email: user.email,
          passwordMatches: false,
          passwordHashPrefix: user.password.substring(0, 10) + '...'
        }
      });
    }
    
    console.log('[AUTH-TEST] ====== SUCCESS ======');
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted
      }
    });
    
  } catch (error) {
    console.error('[AUTH-TEST] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      message: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
