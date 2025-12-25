import { getResendClient } from './resend-client';
import { prisma } from '@/lib/db';

export interface SponsorRejectionEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  rejectionReason?: string;
  userId?: string;
}

export async function sendSponsorRejectionEmail(data: SponsorRejectionEmailData) {
  try {
    const resendClient = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsor Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎾 Mindful Champion</h1>
              <p style="margin: 10px 0 0; color: #a0a0a0; font-size: 14px;">Sponsor Application Update</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">Dear ${data.contactPerson},</p>
              
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
                Thank you for your interest in becoming a sponsor partner with Mindful Champion. After careful review of your application for <strong>${data.companyName}</strong>, we regret to inform you that we are unable to approve your sponsorship at this time.
              </p>
              
              ${data.rejectionReason ? `
              <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px 20px; margin: 20px 0;">
                <p style="margin: 0; color: #495057; font-size: 14px;"><strong>Feedback:</strong></p>
                <p style="margin: 10px 0 0; color: #6c757d; font-size: 14px;">${data.rejectionReason}</p>
              </div>
              ` : ''}
              
              <p style="margin: 20px 0; color: #333; font-size: 16px;">
                We encourage you to reapply in the future as your business evolves. If you have any questions or would like to discuss this decision, please don't hesitate to reach out to our team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/sponsors/apply" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Apply Again</a>
              </div>
              
              <p style="margin: 20px 0 0; color: #666; font-size: 14px;">
                Best regards,<br>
                <strong>The Mindful Champion Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Mindful Champion. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const result = await resendClient.emails.send({
      from: 'Mindful Champion <sponsors@mindfulchampion.com>',
      to: data.email,
      subject: `Sponsor Application Update - ${data.companyName}`,
      html: htmlContent,
    });

    // Log the email if userId is provided
    if (data.userId) {
      try {
        await prisma.emailLog.create({
          data: {
            userId: data.userId,
            type: 'SPONSOR_REJECTION',
            subject: `Sponsor Application Update - ${data.companyName}`,
            recipient: data.email,
            status: 'SENT',
            metadata: {
              companyName: data.companyName,
              contactPerson: data.contactPerson,
            },
          },
        });
      } catch (logError) {
        console.error('Failed to log rejection email:', logError);
      }
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send sponsor rejection email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
