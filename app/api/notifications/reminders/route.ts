import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NotificationCategory, NotificationFrequency, NotificationDeliveryMethod, NotificationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET - Fetch user's active reminders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // Fetch scheduled notifications (reminders)
    const reminders = await prisma.scheduledNotification.findMany({
      where: {
        userId: session.user.id,
        status: status === 'active' ? 'PENDING' : undefined,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    // Fetch Coach Kai reminders
    const coachKaiReminders = await prisma.coachKaiReminder.findMany({
      where: {
        userId: session.user.id,
        isActive: status === 'active',
      },
      orderBy: {
        nextTrigger: 'asc',
      },
    });

    return NextResponse.json({
      reminders,
      coachKaiReminders,
      total: reminders.length + coachKaiReminders.length,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      title,
      message,
      scheduledFor,
      frequency,
      deliveryMethod,
      customTimes,
    } = body;

    // Create scheduled notification
    const reminder = await prisma.scheduledNotification.create({
      data: {
        userId: session.user.id,
        category: category as NotificationCategory,
        type: 'REMINDER',
        title,
        message,
        scheduledFor: new Date(scheduledFor),
        status: 'PENDING' as NotificationStatus,
        deliveryMethod: deliveryMethod as NotificationDeliveryMethod,
        source: 'USER',
        data: {
          frequency,
          customTimes,
        },
      },
    });

    return NextResponse.json({ reminder, success: true });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

// PUT - Update a reminder
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    // Verify ownership
    const existing = await prisma.scheduledNotification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update the reminder
    const reminder = await prisma.scheduledNotification.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ reminder, success: true });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a reminder
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.scheduledNotification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete the reminder
    await prisma.scheduledNotification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
