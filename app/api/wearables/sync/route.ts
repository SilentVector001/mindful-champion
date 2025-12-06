
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncDeviceData } from '@/lib/wearables/data-sync';
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

    // Get device details
    const device = await WearableService.getDevice(deviceId);
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const result = await syncDeviceData(session.user.id, deviceId, device.deviceType);

    return NextResponse.json({ 
      success: true,
      syncedRecords: result.dataPoints,
      message: `Successfully synced ${result.dataPoints} health records` 
    });
  } catch (error) {
    console.error('Error syncing device data:', error);
    return NextResponse.json({ 
      error: 'Failed to sync device data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
