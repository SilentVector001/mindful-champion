// @ts-nocheck
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const testEmail = 'deansnow59@gmail.com';
  const testPassword = 'MindfulChampion2025!';
  
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    testEmail,
    testPasswordLength: testPassword.length,
  };

  try {
    // Step 1: Find user
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: testEmail,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      }
    });

    results.userFound = !!user;
    results.userId = user?.id || null;
    results.userEmail = user?.email || null;
    results.hasPassword = !!user?.password;
    results.passwordHashLength = user?.password?.length || 0;
    results.passwordHashPrefix = user?.password?.substring(0, 10) || null;

    if (user?.password) {
      // Step 2: Compare password
      const isValid = await bcrypt.compare(testPassword, user.password);
      results.bcryptCompareResult = isValid;
      
      // Step 3: Hash the test password and compare hashes
      const newHash = await bcrypt.hash(testPassword, 10);
      results.newHashPrefix = newHash.substring(0, 10);
      results.hashesMatch = user.password === newHash;
    }

  } catch (error) {
    results.error = (error as Error).message;
    results.stack = (error as Error).stack;
  }

  return NextResponse.json(results);
}
// Force rebuild 1767652509
