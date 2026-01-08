// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('[DB-TEST] Testing database connection...');
    
    // Try to connect and count users
    const userCount = await prisma.user.count();
    console.log('[DB-TEST] User count:', userCount);
    
    // Try to find the test user (without exposing sensitive data)
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'deansnow59@gmail.com',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        onboardingCompleted: true,
        role: true
      }
    });
    
    console.log('[DB-TEST] Test user found:', !!testUser);
    if (testUser) {
      console.log('[DB-TEST] User ID:', testUser.id);
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      database: {
        connected: true,
        userCount,
        testUserFound: !!testUser,
        testUserId: testUser?.id || null,
        testUserEmail: testUser?.email || null,
      }
    });
  } catch (error) {
    console.error('[DB-TEST] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed',
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
