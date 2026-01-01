import { getResendClient } from './resend-client';
import { prisma } from '@/lib/db';

export interface SponsorRejectionEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  rejectionReason?: string;
  applicationId: string;
  userId?: string; // Optional userId to log the email
}

export async function sendSponsorRejectionEmail(data: SponsorRejectionEmailData) {
  try {
    const resendClient = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';
    const applyUrl = `${appUrl}/sponsors/apply`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsor Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Content Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #475569 0%, #64748b 100%); padding: 40px 30px; text-align: center;">
              <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <span style="font-size: 48px;">📋</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Application Update
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 17px; color: #334155; line-height: 1.6;">
                Dear ${data.contactPerson},
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                Thank you for your interest in partnering with <strong>Mindful Champion</strong> and for taking the time to submit a sponsorship application for <strong>${data.companyName}</strong>.
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                After careful consideration of your application, we regret to inform you that we are <strong>unable to approve your sponsorship at this time</strong>. This decision is based on our current partnership strategy and the specific needs of our platform and community.
              </p>

              ${data.rejectionReason ? `
              <!-- Reason Section -->
              <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; border-radius: 8px; margin: 0 0 25px 0;">
                <h3 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">Additional Context</h3>
                <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${data.rejectionReason}
                </p>
              </div>
              ` : ''}

              <!-- Encouragement Section -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0891b2; border-radius: 12px; padding: 25px; margin: 0 0 25px 0;">
                <h3 style="color: #0891b2; margin: 0 0 15px 0; font-size: 19px; font-weight: 700; text-align: center;">
                  🌟 This Isn't Goodbye!
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 15px; color: #164e63; line-height: 1.7; text-align: center;">
                  We encourage you to <strong>reapply in the future</strong> as our partnership needs evolve. We're constantly growing and expanding our sponsorship opportunities.
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #164e63; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">Our sponsorship criteria and capacity may change as we grow</li>
                  <li style="margin-bottom: 10px;">Different tiers or partnership models may become available</li>
                  <li style="margin-bottom: 10px;">Your company's offerings may align better with future platform features</li>
                  <li style="margin-bottom: 0;">We value your interest and would welcome hearing from you again</li>
                </ul>
              </div>

              <!-- Alternative Options -->
              <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 20px; border-radius: 8px; margin: 0 0 25px 0;">
                <h3 style="color: #854d0e; margin: 0 0 15px 0; font-size: 17px; font-weight: 700;">
                  💡 Other Ways to Connect
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #713f12; line-height: 1.6;">
                  While a formal sponsorship isn't possible right now, there may be other opportunities to engage with the Mindful Champion community:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #713f12; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Community partnerships or collaborations</li>
                  <li style="margin-bottom: 8px;">Event sponsorships or tournament support</li>
                  <li style="margin-bottom: 8px;">Product reviews or feature spotlights</li>
                  <li style="margin-bottom: 0;">Content partnerships or educational resources</li>
                </ul>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #713f12; line-height: 1.6;">
                  Feel free to reach out to discuss alternative options that might work for both parties.
                </p>
              </div>

              <!-- Contact Section -->
              <div style="text-align: center; padding: 25px 0; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #0f172a;">
                  Questions or Feedback?
                </h3>
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                  We're always happy to provide more context or discuss future opportunities.
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  Reply to this email or contact us at <a href="mailto:partners@mindfulchampion.com" style="color: #0891b2; text-decoration: none; font-weight: 600;">partners@mindfulchampion.com</a>
                </p>
              </div>

              <!-- Reapply CTA (Soft) -->
              <div style="text-align: center; margin: 30px 0 0 0;">
                <p style="margin: 0 0 20px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                  If your company's situation changes or you'd like to explore partnership opportunities in the future:
                </p>
                <a href="${applyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);">
                  Reapply in the Future
                </a>
              </div>

              <!-- Thank You Footer -->
              <div style="text-align: center; margin-top: 35px;">
                <p style="margin: 0 0 5px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                  Thank you again for your interest in Mindful Champion.
                </p>
                <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                  We wish <strong>${data.companyName}</strong> continued success!
                </p>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #94a3b8; font-style: italic;">
                  - The Mindful Champion Partnerships Team
                </p>
              </div>

              <!-- Application Reference -->
              <p style="color: #94a3b8; margin: 30px 0 0 0; font-size: 12px; text-align: center;">
                Application ID: ${data.applicationId}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Mindful Champion</strong> • Partnerships Team
              </p>
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">
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

    const plainText = `
APPLICATION UPDATE

Dear ${data.contactPerson},

Thank you for your interest in partnering with Mindful Champion and for taking the time to submit a sponsorship application for ${data.companyName}.

After careful consideration of your application, we regret to inform you that we are unable to approve your sponsorship at this time. This decision is based on our current partnership strategy and the specific needs of our platform and community.

${data.rejectionReason ? `\nADDITIONAL CONTEXT:\n${data.rejectionReason}\n` : ''}

🌟 THIS ISN'T GOODBYE!

We encourage you to reapply in the future as our partnership needs evolve. We're constantly growing and expanding our sponsorship opportunities.

• Our sponsorship criteria and capacity may change as we grow
• Different tiers or partnership models may become available
• Your company's offerings may align better with future platform features
• We value your interest and would welcome hearing from you again

💡 OTHER WAYS TO CONNECT

While a formal sponsorship isn't possible right now, there may be other opportunities to engage with the Mindful Champion community:

• Community partnerships or collaborations
• Event sponsorships or tournament support
• Product reviews or feature spotlights
• Content partnerships or educational resources

Feel free to reach out to discuss alternative options that might work for both parties.

QUESTIONS OR FEEDBACK?

We're always happy to provide more context or discuss future opportunities.
Reply to this email or contact us at partners@mindfulchampion.com

If your company's situation changes or you'd like to explore partnership opportunities in the future, you can reapply at:
${applyUrl}

Thank you again for your interest in Mindful Champion.
We wish ${data.companyName} continued success!

- The Mindful Champion Partnerships Team

Application ID: ${data.applicationId}

---
Mindful Champion • Partnerships Team
© ${new Date().getFullYear()} Mindful Champion. All rights reserved.
    `;

    const result = await resendClient.emails.send({
      from: 'Mindful Champion Partners <partners@mindfulchampion.com>',
      to: data.email,
      subject: `Application Update - ${data.companyName} | Mindful Champion`,
      html: htmlContent,
      text: plainText,
      replyTo: 'partners@mindfulchampion.com',
    });

    if (result.error) {
      throw result.error;
    }

    console.log(`✅ Sponsor rejection email sent successfully to ${data.email}`);

    // Log to database if userId is provided
    if (data.userId) {
      try {
        await prisma.emailNotification.create({
          data: {
            userId: data.userId,
            type: 'CUSTOM',
            recipientEmail: data.email,
            recipientName: data.contactPerson,
            subject: `Application Update - ${data.companyName} | Mindful Champion`,
            htmlContent: htmlContent,
            textContent: plainText,
            status: 'SENT',
            sentAt: new Date(),
            resendEmailId: result.data?.id,
            metadata: {
              emailType: 'SPONSOR_REJECTION',
              companyName: data.companyName,
              applicationId: data.applicationId,
              rejectionReason: data.rejectionReason || 'Not specified',
              service: 'resend',
            },
          },
        });
        console.log(`✅ Email notification logged to database for ${data.email}`);
      } catch (dbError) {
        console.error('❌ Error logging email to database:', dbError);
        // Don't fail the email send if logging fails
      }
    }

    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error('❌ Error sending sponsor rejection email:', error);

    // Log failure to database if userId is provided
    if (data.userId) {
      try {
        await prisma.emailNotification.create({
          data: {
            userId: data.userId,
            type: 'CUSTOM',
            recipientEmail: data.email,
            recipientName: data.contactPerson,
            subject: `Application Update - ${data.companyName} | Mindful Champion`,
            htmlContent: '',
            textContent: '',
            status: 'FAILED',
            failedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              emailType: 'SPONSOR_REJECTION',
              companyName: data.companyName,
              applicationId: data.applicationId,
              service: 'resend',
            },
          },
        });
      } catch (dbError) {
        console.error('❌ Error logging failed email to database:', dbError);
      }
    }

    // Don't throw - email failure shouldn't prevent rejection process
    return { success: false, error };
  }
}
