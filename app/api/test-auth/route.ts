import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
        password: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Test password
    const testPassword = 'MindfulChampion2025!';
    const isValid = await bcrypt.compare(testPassword, user.password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        failedLoginAttempts: user.failedLoginAttempts,
        accountLockedUntil: user.accountLockedUntil,
        passwordHashLength: user.password.length,
        passwordHashPrefix: user.password.substring(0, 10),
      },
      passwordTest: {
        password: testPassword,
        isValid: isValid
      },
      database: {
        host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
