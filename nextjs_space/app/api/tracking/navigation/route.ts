
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { User } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get user if authenticated, but allow tracking for unauthenticated users too
    let user: User | null = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const body = await request.json();
    const { sessionId, sequence, fromPath, toPath } = body;

    if (!sessionId || !fromPath || !toPath) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const navigation = await prisma.navigationPath.create({
      data: {
        userId: user?.id,
        sessionId,
        sequence,
        fromPath,
        toPath,
      },
    });

    return NextResponse.json({ 
      success: true,
      navigationId: navigation.id 
    });
  } catch (error) {
    console.error('Navigation tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track navigation' },
      { status: 500 }
    );
  }
}
