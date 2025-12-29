import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStreamingToken } from '@/lib/heygen';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getStreamingToken();
    
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('HeyGen token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get token' },
      { status: 500 }
    );
  }
}
