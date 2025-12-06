export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unblockIP } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { ipAddress } = body;
    
    if (!ipAddress) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
    }
    
    await unblockIP(ipAddress, session.user.id);
    
    return NextResponse.json({
      success: true,
      message: `IP ${ipAddress} has been unblocked`
    });
    
  } catch (error) {
    console.error('Unblock IP error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock IP' },
      { status: 500 }
    );
  }
}
