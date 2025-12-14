import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getResendClient } from '@/lib/email/resend-client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailLogId } = await req.json();

    if (!emailLogId) {
      return NextResponse.json(
        { error: 'Missing required field: emailLogId' },
        { status: 400 }
      );
    }

    // Get original email
    const originalEmail = await prisma.emailNotification.findUnique({
      where: { id: emailLogId },
    });

    if (!originalEmail) {
      return NextResponse.json({ error: 'Email log not found' }, { status: 404 });
    }

    const resend = getResendClient();
    const fromEmail = 'Mindful Champion <noreply@mindfulchampion.com>';

    // Resend email
    const result: any = await resend.emails.send({
      from: fromEmail,
      to: originalEmail.recipientEmail,
      subject: `[RESEND] ${originalEmail.subject}`,
      html: originalEmail.htmlContent,
    });

    // Create new log entry for resent email
    const emailLog = await prisma.emailNotification.create({
      data: {
        userId: originalEmail.userId,
        type: originalEmail.type,
        recipientEmail: originalEmail.recipientEmail,
        subject: `[RESEND] ${originalEmail.subject}`,
        htmlContent: originalEmail.htmlContent,
        textContent: originalEmail.textContent,
        status: 'SENT',
        sentAt: new Date(),
        metadata: {
          ...(originalEmail.metadata as object),
          resendId: result.id || 'mock',
          originalEmailId: emailLogId,
          resentBy: session.user.email,
          resentAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email resent successfully',
      emailLog,
    });
  } catch (error: any) {
    console.error('Error resending email:', error);
    return NextResponse.json(
      { error: 'Failed to resend email', details: error.message },
      { status: 500 }
    );
  }
}
