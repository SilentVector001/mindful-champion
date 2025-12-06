export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { lockUserAccount, unlockUserAccount } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, action, reason } = body;
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }
    
    if (action === 'lock') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Reason is required for locking an account' },
          { status: 400 }
        );
      }
      
      await lockUserAccount(userId, reason, session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Account has been locked'
      });
    }
    
    if (action === 'unlock') {
      await unlockUserAccount(userId, session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Account has been unlocked'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Must be "lock" or "unlock"' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Account management error:', error);
    return NextResponse.json(
      { error: 'Failed to perform account action' },
      { status: 500 }
    );
  }
}
