export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch SMS settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneNumber: true, notificationPreferences: true }
    });

    // Check if SMS is enabled in notificationPreferences JSON
    const prefs = user?.notificationPreferences as any || {};
    const smsEnabled = prefs?.smsReminders === true;

    return NextResponse.json({
      phoneNumber: user?.phoneNumber || '',
      smsEnabled
    });
  } catch (error) {
    console.error('[SMS Settings] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Update SMS settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, smsEnabled } = await req.json();

    // Validate phone number if enabling
    if (smsEnabled && phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
      }
    }

    // Get existing notification preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true }
    });

    const existingPrefs = (user?.notificationPreferences as any) || {};

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: phoneNumber || null,
        notificationPreferences: {
          ...existingPrefs,
          smsReminders: smsEnabled || false
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SMS Settings] POST error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
