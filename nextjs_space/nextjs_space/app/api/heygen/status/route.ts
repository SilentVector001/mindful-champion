import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_k5SScsSroGg_MImIKliTzpJ2ybzwSBu7QyLHcj6563co';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check remaining quota
    const quotaRes = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
      headers: { 'X-Api-Key': HEYGEN_API_KEY }
    });

    if (!quotaRes.ok) {
      return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
    }

    const quotaData = await quotaRes.json();
    
    // List active sessions
    const listRes = await fetch('https://api.heygen.com/v1/streaming.list', {
      headers: { 'x-api-key': HEYGEN_API_KEY }
    });
    
    const listData = listRes.ok ? await listRes.json() : { data: { sessions: [] } };

    return NextResponse.json({
      credits: {
        remaining: quotaData.data?.remaining_quota || 0,
        details: quotaData.data?.details || {}
      },
      activeSessions: listData.data?.sessions?.length || 0,
      sessions: listData.data?.sessions || []
    });
  } catch (error: any) {
    console.error('HeyGen status error:', error);
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    );
  }
}
