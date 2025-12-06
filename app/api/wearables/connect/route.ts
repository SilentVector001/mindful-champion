
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WearableService } from '@/lib/wearables/wearable-service';
import { buildAuthUrl } from '@/lib/wearables/device-connectors';
import { WearableDeviceType } from '@prisma/client';

/**
 * POST /api/wearables/connect
 * Initiate device connection flow
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceType } = body as { deviceType: WearableDeviceType };

    if (!deviceType) {
      return NextResponse.json(
        { error: 'Device type is required' },
        { status: 400 }
      );
    }

    // Generate state token for OAuth flow
    const state = `${session.user.email}-${deviceType}-${Date.now()}`;

    // Build authorization URL
    const authUrl = buildAuthUrl(deviceType, state);

    return NextResponse.json({
      authUrl,
      state,
      deviceType,
    });
  } catch (error) {
    console.error('Error initiating device connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wearables/connect
 * Get list of connected devices
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await WearableService.getUserDevices(session.user.id);

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}
