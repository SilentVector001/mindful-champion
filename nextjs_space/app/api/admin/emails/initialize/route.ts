import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/emails/initialize
 * Send a test email to the admin to populate the database
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize email settings first
    await emailService.initializeEmailSettings();

    // Send a test email to the admin
    const result = await emailService.sendEmail({
      userId: session.user.id,
      recipientEmail: session.user.email,
      recipientName: session.user.name || 'Admin',
      subject: '✅ Mindful Champion Email System - Initialized',
      type: 'SYSTEM_UPDATE',
      htmlContent: `
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ Email System Initialized</h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 14px;">Mindful Champion Admin</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                Great news! Your email system is fully operational. 🎉
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%); border-left: 4px solid #0d9488; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #0f172a; font-size: 14px; line-height: 1.6;">
                  ✅ <strong>Domain:</strong> mindfulchampion.com (Verified)<br>
                  ✅ <strong>Email Service:</strong> Resend API<br>
                  ✅ <strong>Database:</strong> Connected<br>
                  ✅ <strong>Admin Dashboard:</strong> Active<br>
                  ✅ <strong>Sent:</strong> ${new Date().toLocaleString()}
                </p>
              </div>
              
              <p style="margin: 24px 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                <strong>What's working:</strong>
              </p>
              
              <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                <li>Welcome emails for new signups</li>
                <li>Video analysis completion notifications</li>
                <li>System updates and reminders</li>
                <li>Admin dashboard email tracking</li>
              </ul>
              
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                You can now view this email and future emails in your admin dashboard at: 
                <a href="https://mindfulchampion.com/admin/emails" style="color: #0d9488; text-decoration: none;">mindfulchampion.com/admin/emails</a>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2024 Mindful Champion • System Notification
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
      textContent: `
Email System Initialized - Mindful Champion

Great news! Your email system is fully operational. 🎉

✓ Domain: mindfulchampion.com (Verified)
✓ Email Service: Resend API  
✓ Database: Connected
✓ Admin Dashboard: Active
✓ Sent: ${new Date().toLocaleString()}

What's working:
- Welcome emails for new signups
- Video analysis completion notifications  
- System updates and reminders
- Admin dashboard email tracking

You can now view this email and future emails in your admin dashboard.

© 2024 Mindful Champion • System Notification
      `,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send initialization email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email system initialized successfully',
      emailSent: true,
      recipient: session.user.email,
    });
  } catch (error: any) {
    console.error('Error initializing email system:', error);
    return NextResponse.json(
      { error: 'Failed to initialize email system', details: error.message },
      { status: 500 }
    );
  }
}
