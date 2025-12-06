
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { User } from '@prisma/client';

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
  const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet/i.test(userAgent) ? 'tablet' : 'desktop';
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Create or get existing session
export async function POST(request: Request) {
  try {
    // Skip tracking in development to avoid connection pool exhaustion
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_TRACKING === 'true') {
      return NextResponse.json({ 
        sessionId: 'dev-session',
        created: true,
        tracking_disabled: true
      });
    }

    const body = await request.json();
    const { sessionId, action = 'start', referrer } = body;

    // For non-critical actions, return success immediately
    if (action === 'heartbeat' && sessionId) {
      return NextResponse.json({ 
        sessionId,
        active: true 
      });
    }

    const session = await getServerSession(authOptions);
    
    // Get user if authenticated, but allow tracking for unauthenticated users too
    let user: User | null = null;
    if (session?.user?.email) {
      try {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
      } catch (err) {
        // If we can't get user, continue without it
        console.warn('Could not fetch user for tracking:', err);
      }
    }

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    if (action === 'start') {
      // Create a new session
      const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      try {
        // Use upsert to handle race conditions and existing sessions
        const userSession = await prisma.userSession.upsert({
          where: { sessionId: newSessionId },
          create: {
            userId: user?.id,
            sessionId: newSessionId,
            ipAddress,
            userAgent,
            deviceType,
            browser,
            os,
            referrer,
            isActive: true,
          },
          update: {
            // If session exists, update it to keep it active
            isActive: true,
            userId: user?.id || undefined,
          },
        });

        return NextResponse.json({ 
          sessionId: userSession.sessionId,
          created: true 
        });
      } catch (dbError: any) {
        // If database is unavailable, return a mock session ID
        // This ensures the app continues to work even if tracking fails
        console.warn('Session tracking database error (non-critical):', dbError?.message || dbError);
        return NextResponse.json({ 
          sessionId: newSessionId,
          created: true,
          tracking_failed: true
        });
      }
    } else if (action === 'end') {
      // End the session
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
      }

      try {
        const userSession = await prisma.userSession.findUnique({
          where: { sessionId },
        });

        if (!userSession) {
          return NextResponse.json({ ended: true, session_not_found: true });
        }

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - userSession.startTime.getTime()) / 1000);

        await prisma.userSession.update({
          where: { sessionId },
          data: {
            endTime,
            duration,
            isActive: false,
          },
        });

        return NextResponse.json({ 
          sessionId,
          ended: true,
          duration 
        });
      } catch (dbError: any) {
        console.warn('Session end tracking error (non-critical):', dbError?.message || dbError);
        return NextResponse.json({ 
          sessionId,
          ended: true,
          tracking_failed: true
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    // Return success even on error to prevent breaking the app
    console.warn('Session tracking error (non-critical):', error?.message || error);
    return NextResponse.json({ 
      sessionId: 'fallback-session',
      created: true,
      tracking_failed: true
    });
  }
}
