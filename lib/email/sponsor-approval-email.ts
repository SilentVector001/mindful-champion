import { getResendClient } from './resend-client';

export interface SponsorApprovalEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  approvedTier: string;
  loginEmail: string;
  temporaryPassword: string;
  portalUrl: string;
  isNewUser: boolean;
}

export async function sendSponsorApprovalEmail(data: SponsorApprovalEmailData) {
  try {
    const resendClient = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';
    const portalUrl = `${appUrl}/sponsors/portal`;

    // Tier benefits information
    const tierBenefitsInfo = {
      BRONZE: {
        emoji: '🥉',
        color: '#cd7f32',
        benefits: ['Up to 3 active offers', 'Basic analytics', 'Standard support', 'Monthly performance reports']
      },
      SILVER: {
        emoji: '🥈',
        color: '#c0c0c0',
        benefits: ['Up to 10 active offers', 'Advanced analytics', 'Featured offer placement', 'Priority support', 'Bi-weekly insights']
      },
      GOLD: {
        emoji: '🥇',
        color: '#ffd700',
        benefits: ['Up to 25 active offers', 'Premium analytics dashboard', 'Priority placement', 'Custom branding options', 'Dedicated account manager', 'Weekly strategy calls']
      },
      PLATINUM: {
        emoji: '💎',
        color: '#e5e4e2',
        benefits: ['Unlimited active offers', 'Full analytics suite', 'Top-tier placement', 'Complete custom branding', 'White-glove service', 'Real-time insights', '24/7 priority support']
      }
    };

    const tierInfo = tierBenefitsInfo[data.approvedTier as keyof typeof tierBenefitsInfo] || tierBenefitsInfo.BRONZE;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsor Application Approved!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); min-height: 100vh;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Content Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Celebration Header -->
          <tr>
            <td style="padding: 0; position: relative; height: 220px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%);">
              <table role="presentation" style="width: 100%; height: 220px;">
                <tr>
                  <td align="center" valign="middle">
                    <!-- Large Approval Checkmark -->
                    <div style="background: rgba(255,255,255,0.25); width: 120px; height: 120px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 4px solid rgba(255,255,255,0.4); margin-bottom: 15px;">
                      <span style="font-size: 70px;">✅</span>
                    </div>
                    <div style="text-align: center;">
                      <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                        🎉 Approved!
                      </h1>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #0f172a; text-align: center; line-height: 1.3;">
                Welcome to Mindful Champion, ${data.contactPerson}! 🤝
              </h2>
              
              <p style="margin: 0 0 25px 0; font-size: 17px; color: #334155; text-align: center; line-height: 1.6;">
                We're excited to announce that <strong>${data.companyName}</strong> has been <strong style="color: #10b981;">APPROVED</strong> as a <strong>${tierInfo.emoji} ${data.approvedTier} Partner</strong>!
              </p>

              <!-- Credentials Box - Most Important! -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 0 0 30px 0; border: 3px solid #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold; color: #0f172a; text-align: center;">
                  🔐 Your Portal Login ${data.isNewUser ? 'Credentials' : 'Information'}
                </h3>
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 0 0 15px 0;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 35%;">Portal URL:</td>
                      <td style="padding: 12px 0;">
                        <a href="${portalUrl}" style="color: #2563eb; font-weight: 600; font-size: 14px; text-decoration: underline; word-break: break-all;">${portalUrl}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600; border-top: 1px solid #e2e8f0;">Email:</td>
                      <td style="padding: 12px 0; border-top: 1px solid #e2e8f0;">
                        <code style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-family: monospace; color: #0f172a; font-size: 14px; display: inline-block;">${data.loginEmail}</code>
                      </td>
                    </tr>
                    ${data.isNewUser && data.temporaryPassword ? `
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600; border-top: 1px solid #e2e8f0;">Temporary Password:</td>
                      <td style="padding: 12px 0; border-top: 1px solid #e2e8f0;">
                        <code style="background: #fef2f2; padding: 6px 12px; border-radius: 6px; font-family: monospace; color: #dc2626; font-size: 14px; display: inline-block; font-weight: 600;">${data.temporaryPassword}</code>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
                ${data.isNewUser && data.temporaryPassword ? `
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 13px; color: #7f1d1d; line-height: 1.5;">
                    <strong>⚠️ IMPORTANT:</strong> Please change this temporary password immediately after your first login for security purposes.
                  </p>
                </div>
                ` : `
                <div style="background: #f0f9ff; border-left: 4px solid #0891b2; padding: 15px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 13px; color: #164e63; line-height: 1.5;">
                    <strong>ℹ️ NOTE:</strong> Use your existing account password to log in. If you've forgotten your password, use the "Forgot Password" link on the login page.
                  </p>
                </div>
                `}
              </div>

              <!-- Quick Start Guide -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 25px; margin: 0 0 25px 0; border: 2px solid #14b8a6;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold; color: #0f172a;">
                  🚀 Quick Start Guide
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                  <li style="margin-bottom: 12px;">
                    <strong>Log in to your portal:</strong> Visit <a href="${portalUrl}" style="color: #0891b2; text-decoration: underline;">${portalUrl}</a> and use the credentials above.
                  </li>
                  <li style="margin-bottom: 12px;">
                    <strong>Change your password:</strong> Click your profile icon → Settings → Change Password.
                  </li>
                  <li style="margin-bottom: 12px;">
                    <strong>Complete your profile:</strong> Add your company logo, description, and contact details.
                  </li>
                  <li style="margin-bottom: 12px;">
                    <strong>Create your first offer:</strong> Navigate to "Offers" → "Create New Offer" and start engaging with our community!
                  </li>
                  <li style="margin-bottom: 0;">
                    <strong>Explore analytics:</strong> Track your performance in real-time from the Analytics dashboard.
                  </li>
                </ol>
              </div>

              <!-- Your Tier Benefits -->
              <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 0 0 25px 0; border-left: 4px solid ${tierInfo.color};">
                <h3 style="margin: 0 0 15px 0; font-size: 19px; font-weight: bold; color: #0f172a;">
                  ${tierInfo.emoji} Your ${data.approvedTier} Tier Benefits
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                  ${tierInfo.benefits.map((benefit: string) => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
                </ul>
              </div>

              <!-- Portal Features Overview -->
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin: 0 0 25px 0; border: 2px solid #a855f7;">
                <h3 style="margin: 0 0 15px 0; font-size: 19px; font-weight: bold; color: #0f172a;">
                  🎯 What You Can Do in Your Portal
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top; width: 30px;">
                      <span style="font-size: 24px;">📦</span>
                    </td>
                    <td style="padding: 10px 0 10px 10px; vertical-align: top;">
                      <strong style="color: #0f172a; font-size: 15px;">Create Offers</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Upload products, set discounts, and publish promotional deals.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top;">
                      <span style="font-size: 24px;">📊</span>
                    </td>
                    <td style="padding: 10px 0 10px 10px; vertical-align: top;">
                      <strong style="color: #0f172a; font-size: 15px;">Track Performance</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Monitor views, clicks, redemptions, and engagement metrics.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top;">
                      <span style="font-size: 24px;">💰</span>
                    </td>
                    <td style="padding: 10px 0 10px 10px; vertical-align: top;">
                      <strong style="color: #0f172a; font-size: 15px;">Manage Billing</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">View invoices, update payment methods, and manage subscriptions.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top;">
                      <span style="font-size: 24px;">🎨</span>
                    </td>
                    <td style="padding: 10px 0 10px 10px; vertical-align: top;">
                      <strong style="color: #0f172a; font-size: 15px;">Customize Profile</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Brand your presence with logos, descriptions, and custom styling.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Support & Resources -->
              <div style="text-align: center; padding: 25px 0; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; margin: 0 0 25px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #0f172a;">
                  💬 Need Help Getting Started?
                </h3>
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                  Our partnerships team is here to support you every step of the way.
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  Reply to this email or contact us through your portal's support section.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 0 0 30px 0;">
                <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: all 0.3s;">
                  🚀 Access Your Portal Now
                </a>
              </div>

              <!-- Thank You Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 0 0 10px 0; font-size: 19px; font-weight: bold; color: #0f172a;">
                  Thank you for partnering with us! 🙏
                </p>
                <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                  Together, we'll create amazing experiences for the Mindful Champion community.
                </p>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                  - The Mindful Champion Partnerships Team
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: white;">
                Mindful Champion
              </p>
              <p style="margin: 0 0 15px 0; font-size: 13px; color: #94a3b8;">
                Your Complete Pickleball Coaching Ecosystem
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
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
✅ SPONSOR APPLICATION APPROVED!

Welcome to Mindful Champion, ${data.contactPerson}! 🤝

We're excited to announce that ${data.companyName} has been APPROVED as a ${tierInfo.emoji} ${data.approvedTier} Partner!

🔐 YOUR PORTAL LOGIN ${data.isNewUser ? 'CREDENTIALS' : 'INFORMATION'}:

Portal URL: ${portalUrl}
Email: ${data.loginEmail}
${data.isNewUser && data.temporaryPassword ? `Temporary Password: ${data.temporaryPassword}

⚠️ IMPORTANT: Please change this temporary password immediately after your first login for security purposes.` : `
ℹ️ NOTE: Use your existing account password to log in. If you've forgotten your password, use the "Forgot Password" link on the login page.`}

🚀 QUICK START GUIDE:

1. Log in to your portal: Visit ${portalUrl} and use the credentials above.
2. Change your password: Click your profile icon → Settings → Change Password.
3. Complete your profile: Add your company logo, description, and contact details.
4. Create your first offer: Navigate to "Offers" → "Create New Offer" and start engaging with our community!
5. Explore analytics: Track your performance in real-time from the Analytics dashboard.

${tierInfo.emoji} YOUR ${data.approvedTier} TIER BENEFITS:
${tierInfo.benefits.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}

🎯 WHAT YOU CAN DO IN YOUR PORTAL:

📦 Create Offers - Upload products, set discounts, and publish promotional deals.
📊 Track Performance - Monitor views, clicks, redemptions, and engagement metrics.
💰 Manage Billing - View invoices, update payment methods, and manage subscriptions.
🎨 Customize Profile - Brand your presence with logos, descriptions, and custom styling.

💬 NEED HELP GETTING STARTED?

Our partnerships team is here to support you every step of the way.
Reply to this email or contact us through your portal's support section.

Thank you for partnering with us! 🙏

Together, we'll create amazing experiences for the Mindful Champion community.

- The Mindful Champion Partnerships Team

---
Mindful Champion
Your Complete Pickleball Coaching Ecosystem
© ${new Date().getFullYear()} Mindful Champion. All rights reserved.
    `;

    await resendClient.emails.send({
      from: 'Mindful Champion Partnerships <partnerships@updates.reai.io>',
      to: data.email,
      subject: `✅ Approved! Welcome to Mindful Champion, ${data.companyName} 🎉`,
      html: htmlContent,
      text: plainText,
      replyTo: 'partnerships@mindfulchampion.com',
    });

    console.log(`✅ Sponsor approval email sent successfully to ${data.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending sponsor approval email:', error);
    // Don't throw - email failure shouldn't prevent approval process
    return { success: false, error };
  }
}
