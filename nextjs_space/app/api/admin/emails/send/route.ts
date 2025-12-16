import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getResendClient } from '@/lib/email/resend-client';
import { EMAIL_CONFIG, getFromEmail } from '@/lib/email/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body, template, isHtml = true, fromAccount = 'ADMIN' } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    
    // Get the appropriate from email based on account type
    const account = EMAIL_CONFIG.ACCOUNTS[fromAccount as keyof typeof EMAIL_CONFIG.ACCOUNTS] || EMAIL_CONFIG.ACCOUNTS.ADMIN;
    const fromEmail = account.formatted;

    // Send email
    const result: any = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: isHtml ? body : undefined,
      text: !isHtml ? body : undefined,
    });

    // Log email to database
    const emailLog = await prisma.emailNotification.create({
      data: {
        userId: session.user.id,
        type: 'ADMIN_CUSTOM',
        recipientEmail: to,
        subject,
        htmlContent: isHtml ? body : '',
        textContent: !isHtml ? body : '',
        status: 'SENT',
        sentAt: new Date(),
        metadata: {
          template,
          isHtml,
          sentBy: session.user.email,
          resendId: result.id || 'mock',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailLog,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
