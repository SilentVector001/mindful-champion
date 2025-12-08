import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        failedLoginAttempts: true,
        accountLockedUntil: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        step: 'user_lookup',
        message: 'User not found'
      }, { status: 404 });
    }
    
    if (!user.password) {
      return NextResponse.json({ 
        success: false,
        step: 'password_check',
        message: 'User has no password set'
      }, { status: 400 });
    }
    
    // Check if locked
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return NextResponse.json({ 
        success: false,
        step: 'lock_check',
        message: 'Account is locked',
        lockedUntil: user.accountLockedUntil
      }, { status: 403 });
    }
    
    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      success: true,
      steps: {
        user_lookup: '✅ User found',
        password_exists: '✅ Password exists',
        account_locked: '✅ Not locked',
        password_valid: isValid ? '✅ Password correct' : '❌ Password incorrect'
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      passwordTest: {
        isValid,
        hashPrefix: user.password.substring(0, 10),
        hashLength: user.password.length
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        databaseHost: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
