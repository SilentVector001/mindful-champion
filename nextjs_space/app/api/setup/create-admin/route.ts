// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

// This endpoint creates the admin user if it doesn't exist
// Protected by ADMIN_SECRET environment variable
export async function POST(request: NextRequest) {
  try {
    // Check for admin secret
    const { secret } = await request.json();
    
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      );
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'admin@mindfulchampion.com',
          mode: 'insensitive'
        }
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        email: existingAdmin.email,
        id: existingAdmin.id
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        id: createId(), // Required field
        email: 'admin@mindfulchampion.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'ADMIN',
        subscriptionTier: 'PREMIUM',
        isTrialActive: false,
        onboardingCompleted: true,
        rewardPoints: 0,
        skillLevel: "5.0" as any,
        playerRating: 'ADVANCED',
        emailVerified: new Date(),
        updatedAt: new Date(), // Required field
      }
    });

    console.log('[SETUP] Admin user created successfully:', adminUser.email);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: adminUser.email,
      id: adminUser.id
    });

  } catch (error: any) {
    console.error('[SETUP] Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error.message },
      { status: 500 }
    );
  }
}
