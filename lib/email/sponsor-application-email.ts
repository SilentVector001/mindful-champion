import { getResendClient } from './resend-client';

export interface SponsorApplicationEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  interestedTier: string;
  applicationId: string;
}

export async function sendSponsorApplicationEmail(data: SponsorApplicationEmailData) {
  try {
    const resendClient = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsor Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); min-height: 100vh;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Content Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Celebration Header -->
          <tr>
            <td style="padding: 0; position: relative; height: 200px; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #8b5cf6 100%);">
              <table role="presentation" style="width: 100%; height: 200px;">
                <tr>
                  <td align="center" valign="middle">
                    <!-- Large Celebration Icon -->
                    <div style="background: rgba(255,255,255,0.2); width: 100px; height: 100px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 3px solid rgba(255,255,255,0.3);">
                      <span style="font-size: 60px;">🎉</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px 0; font-size: 32px; font-weight: bold; color: #0f172a; text-align: center; line-height: 1.2;">
                🎊 Application Received!
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #334155; text-align: center; line-height: 1.6;">
                Hi <strong>${data.contactPerson}</strong>,
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; color: #475569; text-align: center; line-height: 1.6;">
                We're <strong>thrilled</strong> that <strong>${data.companyName}</strong> wants to join the Mindful Champion family! 🏆
              </p>

              <!-- What Happens Next Section -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #faf5ff 100%); border-radius: 12px; padding: 25px; margin: 0 0 25px 0; border: 2px solid #14b8a6;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold; color: #0f172a;">
                  ⏰ What Happens Next?
                </h2>
                <ol style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                  <li style="margin-bottom: 10px;"><strong>Review Process:</strong> Our partnerships team will carefully review your application within <strong>3-5 business days</strong>.</li>
                  <li style="margin-bottom: 10px;"><strong>Personal Contact:</strong> We'll reach out to you directly at <strong>${data.email}</strong> with our decision and next steps.</li>
                  <li style="margin-bottom: 10px;"><strong>If Approved:</strong> You'll receive login credentials and a personalized onboarding guide to access your Sponsor Portal.</li>
                </ol>
              </div>

              <!-- Your Application Details -->
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 25px 0; border-left: 4px solid #8b5cf6;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #0f172a;">
                  📋 Your Application Details
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Company:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${data.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Interested Tier:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${data.interestedTier}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Contact Email:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${data.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Application ID:</td>
                    <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-family: monospace;">${data.applicationId}</td>
                  </tr>
                </table>
              </div>

              <!-- What You'll Get When Approved -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%); border-radius: 12px; padding: 25px; margin: 0 0 25px 0; border: 2px solid #f59e0b;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #0f172a;">
                  🚀 Once Approved, You'll Get:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                  <li style="margin-bottom: 8px;"><strong>🎯 Sponsor Portal Access:</strong> Your own dashboard to create and manage offers</li>
                  <li style="margin-bottom: 8px;"><strong>📊 Real-Time Analytics:</strong> Track views, clicks, and redemptions</li>
                  <li style="margin-bottom: 8px;"><strong>🎨 Offer Creation Tools:</strong> Upload products, set prices, and design promotions</li>
                  <li style="margin-bottom: 8px;"><strong>💬 Direct Communication:</strong> Coordinate with our partnerships team</li>
                  <li style="margin-bottom: 8px;"><strong>📈 Performance Insights:</strong> Understand what resonates with our community</li>
                </ul>
              </div>

              <!-- Portal Preview (Without Spoiling Credentials) -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 0 0 25px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #475569;">
                  🔐 Your Portal Will Be At:
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b;">
                  <code style="background: white; padding: 8px 16px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; font-family: monospace; color: #0f172a;">
                    ${appUrl}/sponsors/portal
                  </code>
                </p>
                <p style="margin: 0; font-size: 13px; color: #64748b; font-style: italic;">
                  (Login credentials will be provided upon approval)
                </p>
              </div>

              <!-- Questions? Section -->
              <div style="text-align: center; padding: 20px 0; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #475569;">
                  <strong>Questions in the meantime?</strong>
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  Reply to this email or reach out to our partnerships team directly.
                </p>
              </div>

              <!-- Excitement Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #0f172a;">
                  We can't wait to partner with you! 🤝
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
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
🎉 Sponsor Application Received!

Hi ${data.contactPerson},

We're thrilled that ${data.companyName} wants to join the Mindful Champion family! 🏆

⏰ WHAT HAPPENS NEXT?

1. Review Process: Our partnerships team will carefully review your application within 3-5 business days.
2. Personal Contact: We'll reach out to you directly at ${data.email} with our decision and next steps.
3. If Approved: You'll receive login credentials and a personalized onboarding guide to access your Sponsor Portal.

📋 YOUR APPLICATION DETAILS:
Company: ${data.companyName}
Interested Tier: ${data.interestedTier}
Contact Email: ${data.email}
Application ID: ${data.applicationId}

🚀 ONCE APPROVED, YOU'LL GET:
• Sponsor Portal Access - Your own dashboard to create and manage offers
• Real-Time Analytics - Track views, clicks, and redemptions
• Offer Creation Tools - Upload products, set prices, and design promotions
• Direct Communication - Coordinate with our partnerships team
• Performance Insights - Understand what resonates with our community

🔐 YOUR PORTAL WILL BE AT:
${appUrl}/sponsors/portal
(Login credentials will be provided upon approval)

Questions in the meantime?
Reply to this email or reach out to our partnerships team directly.

We can't wait to partner with you! 🤝

- The Mindful Champion Partnerships Team

---
Mindful Champion
Your Complete Pickleball Coaching Ecosystem
© ${new Date().getFullYear()} Mindful Champion. All rights reserved.
    `;

    const result = await resendClient.emails.send({
      from: 'Mindful Champion <noreply@resend.dev>',
      to: data.email,
      subject: `🎉 Application Received - ${data.companyName} | Mindful Champion`,
      html: htmlContent,
      text: plainText,
      replyTo: 'noreply@mindfulchampion.com',
    });

    if (result.error) {
      throw result.error;
    }

    console.log(`✅ Sponsor application email sent successfully to ${data.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending sponsor application email:', error);
    // Don't throw - email failure shouldn't prevent application submission
    return { success: false, error };
  }
}
