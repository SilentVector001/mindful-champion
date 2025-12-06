
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WearableService } from '@/lib/wearables/wearable-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    const success = await WearableService.disconnectDevice(deviceId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to disconnect device' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Device disconnected successfully' 
    });
  } catch (error) {
    console.error('Error disconnecting device:', error);
    return NextResponse.json({ 
      error: 'Failed to disconnect device',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
