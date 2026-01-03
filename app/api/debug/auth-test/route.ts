import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'deansnow59@gmail.com';
    const testPassword = searchParams.get('password') || 'MindfulChampion2025!';

    console.log('[AUTH-TEST] Testing authentication for:', email);

    // Test 1: Database connection
    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      console.log('[AUTH-TEST] ✅ Database connected');
    } catch (error: any) {
      console.log('[AUTH-TEST] ❌ Database connection failed:', error.message);
    }

    // Test 2: Find user
    let user = null;
    let userFound = false;
    try {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          subscriptionTier: true,
          firstName: true,
          lastName: true
        }
      });
      userFound = !!user;
      console.log('[AUTH-TEST] User found:', userFound);
    } catch (error: any) {
      console.log('[AUTH-TEST] ❌ User lookup failed:', error.message);
    }

    // Test 3: Password comparison
    let passwordValid = false;
    let passwordHash = null;
    if (user && user.password) {
      passwordHash = user.password.substring(0, 20) + '...';
      try {
        passwordValid = await bcrypt.compare(testPassword, user.password);
        console.log('[AUTH-TEST] Password valid:', passwordValid);
      } catch (error: any) {
        console.log('[AUTH-TEST] ❌ Password comparison failed:', error.message);
      }
    }

    // Test 4: Prisma client version
    const prismaVersion = require('@prisma/client/package.json').version;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        databaseConnection: dbConnected,
        userFound: userFound,
        passwordValid: passwordValid
      },
      userInfo: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        hasPassword: !!user.password,
        passwordHashPreview: passwordHash
      } : null,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        prismaVersion: prismaVersion
      }
    });
  } catch (error: any) {
    console.error('[AUTH-TEST] ❌ Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
