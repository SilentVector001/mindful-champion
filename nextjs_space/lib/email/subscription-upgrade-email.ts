import { getResendClient } from './resend-client'

export interface SubscriptionUpgradeEmailData {
  email: string
  firstName: string
  oldTier: string
  newTier: string
  upgradeDate: Date
  features: string[]
  expirationDate?: Date
  billingCycle?: string
}

export async function sendSubscriptionUpgradeEmail(data: SubscriptionUpgradeEmailData) {
  const resend = getResendClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
  
  // Define features by tier
  const tierFeatures: Record<string, string[]> = {
    PRO: [
      '✅ Unlimited AI Video Analysis',
      '✅ Advanced Training Programs',
      '✅ Unlimited Coach Kai Conversations',
      '✅ Tournament Hub Access',
      '✅ Partner Matching',
      '✅ Full Media Center Access',
      '✅ Priority Support'
    ],
    PREMIUM: [
      '✅ Everything in PRO',
      '✅ Advanced Analytics & Insights',
      '✅ Personalized Training Plans',
      '✅ Live Tournament Streams',
      '✅ Premium Content Library',
      '✅ VIP Support',
      '✅ Early Access to New Features'
    ]
  }

  const features = tierFeatures[data.newTier] || tierFeatures['PRO']
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${data.newTier} Access!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                🎉 Congratulations!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                You've been upgraded to <strong>${data.newTier}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${data.firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your Mindful Champion account has been upgraded from <strong>${data.oldTier}</strong> to <strong>${data.newTier}</strong> access. 🚀
              </p>
              
              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You now have access to all premium features to take your pickleball game to the next level!
              </p>
              
              <!-- Features Box -->
              <div style="background-color: #f9fafb; border: 2px solid #14b8a6; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                <h2 style="margin: 0 0 20px 0; color: #14b8a6; font-size: 20px; font-weight: bold;">
                  🌟 Your ${data.newTier} Features
                </h2>
                ${features.map(feature => `
                  <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px; line-height: 1.8;">
                    ${feature}
                  </p>
                `).join('')}
              </div>
              
              ${data.expirationDate ? `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                    <strong>⏰ Access Period:</strong> Your ${data.newTier} access ${data.billingCycle === 'LIFETIME' ? 'is lifetime and never expires' : `is valid until ${new Date(data.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                  </p>
                </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 0 0 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      Explore Your Premium Features →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Links -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-weight: bold;">
                  🔗 Quick Links to Get Started:
                </h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2;">
                  <li><a href="${appUrl}/train/video" style="color: #14b8a6; text-decoration: none;">Upload Your First Video for AI Analysis</a></li>
                  <li><a href="${appUrl}/train" style="color: #14b8a6; text-decoration: none;">Browse Premium Training Programs</a></li>
                  <li><a href="${appUrl}/train/coach" style="color: #14b8a6; text-decoration: none;">Chat with Coach Kai AI</a></li>
                  <li><a href="${appUrl}/media" style="color: #14b8a6; text-decoration: none;">Explore Tournament Hub</a></li>
                  <li><a href="${appUrl}/connect" style="color: #14b8a6; text-decoration: none;">Find Practice Partners</a></li>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                If you have any questions or need help getting started, our support team is here to assist you. Just reply to this email!
              </p>
              
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Welcome to the premium experience! 🏆<br>
                <strong>The Mindful Champion Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Mindful Champion</strong> - Your AI-Powered Pickleball Coaching Platform
              </p>
              <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 12px;">
                This email was sent to ${data.email}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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
  `

  const textContent = `
Congratulations ${data.firstName}!

You've been upgraded to ${data.newTier} access!

Your ${data.newTier} Features:
${features.join('\n')}

${data.expirationDate ? `Access Period: Your ${data.newTier} access ${data.billingCycle === 'LIFETIME' ? 'is lifetime and never expires' : `is valid until ${new Date(data.expirationDate).toLocaleDateString()}`}` : ''}

Get started now: ${appUrl}/dashboard

Quick Links:
- Upload Your First Video: ${appUrl}/train/video
- Browse Training Programs: ${appUrl}/train
- Chat with Coach Kai: ${appUrl}/train/coach
- Explore Tournaments: ${appUrl}/media
- Find Partners: ${appUrl}/connect

If you have any questions, just reply to this email!

Welcome to the premium experience!
The Mindful Champion Team
  `

  try {
    const result = await resend.emails.send({
      from: 'Mindful Champion <noreply@mindfulchampion.com>',
      to: data.email,
      subject: `🎉 Welcome to ${data.newTier} Access - Your Account Has Been Upgraded!`,
      html: htmlContent,
      text: textContent,
    })

    console.log('✅ Subscription upgrade email sent successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to send subscription upgrade email:', error)
    throw error
  }
}
