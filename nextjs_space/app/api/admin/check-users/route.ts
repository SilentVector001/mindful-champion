import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Diagnostic endpoint to check users in database
 * Use this to verify if admin user exists
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    
    // Get sample users (without passwords)
    const sampleUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Check specifically for admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'admin@mindfulchampion.com',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      users: {
        total: userCount,
        adminExists: !!adminUser,
        admin: adminUser,
        samples: sampleUsers,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('User check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
