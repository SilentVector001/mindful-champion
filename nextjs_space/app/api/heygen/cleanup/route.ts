import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_k5SScsSroGg_MImIKliTzpJ2ybzwSBu7QyLHcj6563co';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List all active sessions
    const listRes = await fetch('https://api.heygen.com/v1/streaming.list', {
      headers: { 'x-api-key': HEYGEN_API_KEY }
    });

    if (!listRes.ok) {
      return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
    }

    const { data } = await listRes.json();
    const sessions = data?.sessions || [];
    
    // Stop all active sessions
    const stopped: string[] = [];
    for (const s of sessions) {
      try {
        await fetch('https://api.heygen.com/v1/streaming.stop', {
          method: 'POST',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: s.session_id })
        });
        stopped.push(s.session_id);
      } catch (e) {
        console.error('Failed to stop session:', s.session_id);
      }
    }

    return NextResponse.json({ 
      message: `Cleaned ${stopped.length} session(s)`,
      stopped 
    });
  } catch (error: any) {
    console.error('HeyGen cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Cleanup failed' },
      { status: 500 }
    );
  }
}
