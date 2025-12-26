import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listAvatars, listVoices } from '@/lib/heygen';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [avatars, voices] = await Promise.all([
      listAvatars(),
      listVoices()
    ]);
    
    return NextResponse.json({ avatars, voices });
  } catch (error: any) {
    console.error('HeyGen avatars error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list avatars' },
      { status: 500 }
    );
  }
}
