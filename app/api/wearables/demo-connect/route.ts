
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WearableService } from '@/lib/wearables/wearable-service';
import { syncDeviceData } from '@/lib/wearables/data-sync';
import { WearableDeviceType } from '@prisma/client';

/**
 * POST /api/wearables/demo-connect
 * Demo connection for wearable devices (bypasses OAuth for testing)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceType, deviceName } = body as {
      deviceType: WearableDeviceType;
      deviceName?: string;
    };

    if (!deviceType) {
      return NextResponse.json(
        { error: 'Device type is required' },
        { status: 400 }
      );
    }

    // Create device connection
    const deviceId = `demo-${deviceType.toLowerCase()}-${Date.now()}`;
    const device = await WearableService.connectDevice(session.user.id, {
      deviceType,
      deviceName: deviceName || `My ${deviceType}`,
      manufacturer: deviceType === WearableDeviceType.APPLE_WATCH ? 'Apple' : undefined,
      deviceId,
      accessToken: 'demo-token',
      permissions: { all: true },
    });

    // Sync initial data
    const syncResult = await syncDeviceData(
      session.user.id,
      deviceId,
      deviceType
    );

    return NextResponse.json({
      success: true,
      device,
      syncResult,
      message: 'Device connected successfully with sample data',
    });
  } catch (error) {
    console.error('Error connecting demo device:', error);
    return NextResponse.json(
      { error: 'Failed to connect device' },
      { status: 500 }
    );
  }
}
