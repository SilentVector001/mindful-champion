
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { User } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Skip tracking in development to avoid connection pool exhaustion
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_TRACKING === 'true') {
      return NextResponse.json({ 
        success: true,
        pageViewId: 'dev-page-view',
        tracking_disabled: true
      });
    }

    const body = await request.json();
    const { sessionId, path, title, referrer, duration, leftAt } = body;

    // Validate required fields
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    try {
      const session = await getServerSession(authOptions);
      
      // Get user if authenticated, but allow tracking for unauthenticated users too
      let user: User | null = null;
      if (session?.user?.email) {
        try {
          user = await prisma.user.findUnique({
            where: { email: session.user.email },
          });
        } catch (err) {
          console.warn('Could not fetch user for page tracking:', err);
        }
      }

      // Verify sessionId exists if provided, but don't fail if it doesn't
      let validSessionId = null;
      if (sessionId) {
        try {
          const sessionExists = await prisma.userSession.findUnique({
            where: { id: sessionId },
          });
          validSessionId = sessionExists ? sessionId : null;
        } catch (err) {
          console.warn('Session lookup failed, continuing without session:', err);
        }
      }

      const pageView = await prisma.pageView.create({
        data: {
          userId: user?.id,
          sessionId: validSessionId,
          path,
          title: title || null,
          referrer: referrer || null,
          duration: duration || null,
          leftAt: leftAt ? new Date(leftAt) : null,
        },
      });

      return NextResponse.json({ 
        success: true,
        pageViewId: pageView.id 
      });
    } catch (dbError: any) {
      // If database is unavailable, return success with mock ID
      // This ensures the app continues to work even if tracking fails
      console.warn('Page view tracking database error (non-critical):', dbError?.message || dbError);
      return NextResponse.json({ 
        success: true,
        pageViewId: 'fallback-page-view',
        tracking_failed: true
      });
    }
  } catch (error: any) {
    // Return success even on error to prevent breaking the app
    console.warn('Page view tracking error (non-critical):', error?.message || error);
    return NextResponse.json({ 
      success: true,
      pageViewId: 'fallback-page-view',
      tracking_failed: true
    });
  }
}

// Update page view when user leaves
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow updates for unauthenticated users too (they can still track page duration)
    const body = await request.json();
    const { pageViewId, duration, leftAt } = body;

    if (!pageViewId) {
      return NextResponse.json({ error: 'Page view ID required' }, { status: 400 });
    }

    await prisma.pageView.update({
      where: { id: pageViewId },
      data: {
        duration,
        leftAt: leftAt ? new Date(leftAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page view update error:', error);
    return NextResponse.json(
      { error: 'Failed to update page view' },
      { status: 500 }
    );
  }
}
