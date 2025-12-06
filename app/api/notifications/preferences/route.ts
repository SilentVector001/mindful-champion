import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NotificationCategory, NotificationFrequency } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Default preferences for each category
const DEFAULT_PREFERENCES = {
  emailEnabled: true,
  pushEnabled: false,
  inAppEnabled: true,
  frequency: NotificationFrequency.DAILY,
  customTimes: ['08:00'],
  timezone: 'America/New_York'
};

// GET /api/notifications/preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all preferences for the user
    const preferences = await prisma.notificationPreferences.findMany({
      where: { userId: session.user.id },
      orderBy: { category: 'asc' }
    });

    // If no preferences exist, create defaults for all categories
    if (preferences.length === 0) {
      const categories = Object.values(NotificationCategory);
      const defaultPrefs = await Promise.all(
        categories.map(category =>
          prisma.notificationPreferences.create({
            data: {
              userId: session.user.id,
              category,
              ...DEFAULT_PREFERENCES
            }
          })
        )
      );
      return NextResponse.json({ preferences: defaultPrefs });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Update each preference
    const updates = await Promise.all(
      preferences.map(async (pref: any) => {
        return prisma.notificationPreferences.upsert({
          where: {
            userId_category: {
              userId: session.user.id,
              category: pref.category
            }
          },
          update: {
            emailEnabled: pref.emailEnabled ?? true,
            pushEnabled: pref.pushEnabled ?? false,
            inAppEnabled: pref.inAppEnabled ?? true,
            frequency: pref.frequency ?? NotificationFrequency.DAILY,
            customTimes: pref.customTimes ?? ['08:00'],
            timezone: pref.timezone ?? 'America/New_York'
          },
          create: {
            userId: session.user.id,
            category: pref.category,
            emailEnabled: pref.emailEnabled ?? true,
            pushEnabled: pref.pushEnabled ?? false,
            inAppEnabled: pref.inAppEnabled ?? true,
            frequency: pref.frequency ?? NotificationFrequency.DAILY,
            customTimes: pref.customTimes ?? ['08:00'],
            timezone: pref.timezone ?? 'America/New_York'
          }
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      preferences: updates 
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
