import { getResendClient } from './resend-client';
import { logEmail } from './log-email';

export interface SponsorAdminNotificationEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  industry: string;
  interestedTier: string;
  applicationId: string;
  description?: string;
  yearsInBusiness?: number | null;
  proposedProducts?: string[];
  marketingGoals?: string | null;
  targetAudience?: string | null;
}

export async function sendSponsorAdminNotificationEmail(data: SponsorAdminNotificationEmailData) {
  const resend = getResendClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';
  const adminUrl = `${appUrl}/admin/sponsors`;
  const applicationUrl = `${adminUrl}?applicationId=${data.applicationId}`;
  
  // Admin email - should be configurable
  const adminEmail = process.env.ADMIN_EMAIL || 'lee@mindfulchampion.com';
  
  let htmlContent = '';
  let textContent = '';
  let sendResult = { success: false, error: null as any };

  const tierColors: { [key: string]: { bg: string; text: string; badge: string } } = {
    BRONZE: { bg: '#cd7f32', text: '#FFF', badge: '🥉 Bronze' },
    SILVER: { bg: '#c0c0c0', text: '#000', badge: '🥈 Silver' },
    GOLD: { bg: '#ffd700', text: '#000', badge: '🥇 Gold' },
    PLATINUM: { bg: '#e5e4e2', text: '#000', badge: '💎 Platinum' }
  };

  const tierColor = tierColors[data.interestedTier] || tierColors.BRONZE;

  htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Sponsor Application</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header with Alert Icon -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="background: #fff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <span style="font-size: 48px;">🔔</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                New Sponsor Application
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                Action Required
              </p>
            </td>
          </tr>

          <!-- Application Details -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #334155; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                A new sponsor application has been submitted and requires your review:
              </p>

              <!-- Company Info Card -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%); border: 2px solid #0d9488; border-radius: 12px; padding: 24px; margin-bottom: 25px;">
                <h2 style="color: #0d9488; margin: 0 0 16px; font-size: 20px; font-weight: 700;">
                  ${data.companyName}
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Tier Requested:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background: ${tierColor.bg}; color: ${tierColor.text}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block;">
                        ${tierColor.badge}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Contact Person:</td>
                    <td style="padding: 8px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      ${data.contactPerson}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <a href="mailto:${data.email}" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 500;">
                        ${data.email}
                      </a>
                    </td>
                  </tr>
                  ${data.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      ${data.phone}
                    </td>
                  </tr>
                  ` : ''}
                  ${data.website ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Website:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <a href="${data.website}" target="_blank" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 500;">
                        ${data.website}
                      </a>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Industry:</td>
                    <td style="padding: 8px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      ${data.industry}
                    </td>
                  </tr>
                  ${data.yearsInBusiness ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Years in Business:</td>
                    <td style="padding: 8px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      ${data.yearsInBusiness} years
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${data.description ? `
              <!-- Description -->
              <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #0d9488; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Company Description</h3>
                <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${data.description}
                </p>
              </div>
              ` : ''}

              ${data.proposedProducts && data.proposedProducts.length > 0 ? `
              <!-- Proposed Products -->
              <div style="background: #f8fafc; border-left: 4px solid #0891b2; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #0891b2; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Proposed Products/Services</h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  ${data.proposedProducts.map(product => `<li>${product}</li>`).join('')}
                </ul>
              </div>
              ` : ''}

              ${data.marketingGoals ? `
              <!-- Marketing Goals -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #b45309; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Marketing Goals</h3>
                <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${data.marketingGoals}
                </p>
              </div>
              ` : ''}

              ${data.targetAudience ? `
              <!-- Target Audience -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #b45309; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Target Audience</h3>
                <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${data.targetAudience}
                </p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0 25px;">
                <a href="${applicationUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s;">
                  Review Application →
                </a>
              </div>

              <!-- Application ID -->
              <p style="color: #94a3b8; margin: 25px 0 0; font-size: 13px; text-align: center;">
                Application ID: <strong>${data.applicationId}</strong>
              </p>

              <!-- Quick Actions -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <h3 style="color: #475569; margin: 0 0 16px; font-size: 15px; font-weight: 700;">
                  Quick Actions
                </h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <a href="${adminUrl}" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 600;">
                        📊 View All Applications
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <a href="${applicationUrl}" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 600;">
                        ✅ Approve/Reject Application
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${data.email}" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 600;">
                        📧 Contact Applicant
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 10px; font-size: 14px;">
                <strong>Mindful Champion</strong> • Sponsor Management System
              </p>
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                This notification was sent to the admin team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  textContent = `
NEW SPONSOR APPLICATION SUBMITTED

Company: ${data.companyName}
Tier Requested: ${data.interestedTier}
Contact Person: ${data.contactPerson}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.website ? `Website: ${data.website}` : ''}
Industry: ${data.industry}
${data.yearsInBusiness ? `Years in Business: ${data.yearsInBusiness}` : ''}

${data.description ? `\nDescription:\n${data.description}\n` : ''}

${data.proposedProducts && data.proposedProducts.length > 0 ? `\nProposed Products/Services:\n${data.proposedProducts.map(p => `- ${p}`).join('\n')}\n` : ''}

${data.marketingGoals ? `\nMarketing Goals:\n${data.marketingGoals}\n` : ''}

${data.targetAudience ? `\nTarget Audience:\n${data.targetAudience}\n` : ''}

Application ID: ${data.applicationId}

Review this application:
${applicationUrl}

View all applications:
${adminUrl}

Contact applicant:
${data.email}

---
Mindful Champion - Sponsor Management System
  `.trim();

  try {
    console.log(`📧 Sending admin notification email to ${adminEmail}...`);
    
    const result = await resend.emails.send({
      from: 'Mindful Champion Partners <partners@mindfulchampion.com>',
      to: [adminEmail],
      subject: `🔔 New ${data.interestedTier} Sponsor Application - ${data.companyName}`,
      html: htmlContent,
      text: textContent,
      replyTo: data.email, // Reply to the sponsor directly
    });

    if (result.error) {
      sendResult = { success: false, error: result.error };
      throw result.error;
    }

    sendResult = { success: true, error: null };
    console.log('✅ Admin notification email sent successfully:', result);
    
    // Log email to database
    const emailLog = await logEmail(
      {
        type: 'SPONSOR_ADMIN_NOTIFICATION',
        recipientEmail: adminEmail,
        recipientName: 'Admin Team',
        subject: `🔔 New ${data.interestedTier} Sponsor Application - ${data.companyName}`,
        htmlContent,
        textContent,
        sponsorApplicationId: data.applicationId,
        metadata: {
          companyName: data.companyName,
          interestedTier: data.interestedTier,
          applicantEmail: data.email,
        },
        resendEmailId: result.data?.id,
      },
      sendResult
    );
    
    return { ...result, emailLogId: emailLog?.id };
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
    
    // Log failed email to database
    await logEmail(
      {
        type: 'SPONSOR_ADMIN_NOTIFICATION',
        recipientEmail: adminEmail,
        recipientName: 'Admin Team',
        subject: `🔔 New ${data.interestedTier} Sponsor Application - ${data.companyName}`,
        htmlContent,
        textContent,
        sponsorApplicationId: data.applicationId,
        metadata: {
          companyName: data.companyName,
          interestedTier: data.interestedTier,
          applicantEmail: data.email,
        },
      },
      { success: false, error }
    );
    
    throw error;
  }
}
