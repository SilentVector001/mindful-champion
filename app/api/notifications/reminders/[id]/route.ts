/**
 * API Route: Single Coach Kai Reminder
 * PUT: Update a reminder
 * DELETE: Delete a reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PUT /api/notifications/reminders/[id]
 * Update a reminder
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify the reminder belongs to the user
    const reminder = await prisma.coachKaiReminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    if (reminder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.coachKaiReminder.update({
      where: { id },
      data: {
        reminderText: body.reminderText ?? undefined,
        parsedData: body.parsedData ?? undefined,
        nextTrigger: body.nextTrigger ? new Date(body.nextTrigger) : undefined,
        isActive: body.isActive ?? undefined,
      },
    });

    return NextResponse.json({ reminder: updated });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/reminders/[id]
 * Delete a reminder
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the reminder belongs to the user
    const reminder = await prisma.coachKaiReminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    if (reminder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.coachKaiReminder.delete({
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
