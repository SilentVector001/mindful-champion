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

    const { to } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    const fromEmail = 'Mindful Champion <noreply@mindfulchampion.com>';

    // Send test email
    const result: any = await resend.emails.send({
      from: fromEmail,
      to,
      subject: '🧪 Test Email from Mindful Champion',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🧪 Test Email</h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 14px;">Email System Verification</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                This is a <strong>test email</strong> from the Mindful Champion admin email system.
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%); border-left: 4px solid #0d9488; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #0f172a; font-size: 14px; line-height: 1.6;">
                  ✅ <strong>Email delivery:</strong> Working<br>
                  ✅ <strong>HTML formatting:</strong> Working<br>
                  ✅ <strong>Admin panel:</strong> Connected<br>
                  ✅ <strong>Timestamp:</strong> ${new Date().toLocaleString()}
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you received this email, the email system is working correctly!
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2024 Mindful Champion • Test Email
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
Test Email from Mindful Champion Admin Panel

✓ Email delivery: Working
✓ HTML formatting: Working
✓ Admin panel: Connected
✓ Timestamp: ${new Date().toLocaleString()}

If you received this email, the email system is working correctly!

© 2024 Mindful Champion • Test Email
      `
    });

    // Log email
    const emailLog = await prisma.emailNotification.create({
      data: {
        userId: session.user.id,
        type: 'ADMIN_TEST',
        recipientEmail: to,
        subject: '🧪 Test Email from Mindful Champion',
        htmlContent: 'Test email sent from admin panel',
        textContent: 'Test email sent from admin panel',
        status: 'SENT',
        sentAt: new Date(),
        metadata: {
          resendId: result.id || 'mock',
          sentBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailLog,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}
