
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { User } from '@prisma/client';

// Batch endpoint for recording multiple events efficiently
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
    const { events = [] } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    // Process events in batch
    const results = await Promise.allSettled(
      events.map(async (event) => {
        const { type, data } = event;
        
        switch (type) {
          case 'page_view':
            return await prisma.pageView.create({
              data: {
                userId: user?.id,
                ...data,
              },
            });
          
          case 'video_interaction':
            return await prisma.videoInteraction.create({
              data: {
                userId: user?.id,
                ...data,
              },
            });
          
          case 'activity_event':
            return await prisma.activityEvent.create({
              data: {
                userId: user?.id,
                ...data,
              },
            });
          
          default:
            throw new Error(`Unknown event type: ${type}`);
        }
      })
    );

    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ 
      success: true,
      processed: events.length,
      succeeded: successes,
      failed: failures
    });
  } catch (error) {
    console.error('Batch tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch events' },
      { status: 500 }
    );
  }
}
