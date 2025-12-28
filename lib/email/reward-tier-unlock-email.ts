import { getResendClient } from './resend-client';

export interface RewardTierUnlockEmailData {
  email: string;
  firstName: string;
  tierName: string;
  tierDisplayName: string;
  tierIcon: string;
  tierColor: string;
  pointsAtUnlock: number;
  benefits: string[];
  nextTierName?: string;
  nextTierPoints?: number;
}

export async function sendRewardTierUnlockEmail(data: RewardTierUnlockEmailData) {
  const resend = getResendClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations! You've Unlocked ${data.tierDisplayName}!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); overflow: hidden;">
          
          <!-- Animated Header with Tier Color -->
          <tr>
            <td style="background: linear-gradient(135deg, ${data.tierColor} 0%, ${data.tierColor}dd 100%); padding: 50px 30px; text-align: center; position: relative;">
              <div style="font-size: 80px; margin: 0 0 20px 0; animation: bounce 1s ease-in-out;">${data.tierIcon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); letter-spacing: -0.5px;">
                🎉 Congratulations!
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600; opacity: 0.95;">
                You've unlocked <strong>${data.tierDisplayName}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Sparkle Divider -->
          <tr>
            <td style="background: linear-gradient(to right, ${data.tierColor}33, ${data.tierColor}66, ${data.tierColor}33); height: 4px;"></td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 25px 0; color: #1f2937; font-size: 18px; line-height: 1.7;">
                Hi <strong>${data.firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.8;">
                Amazing work! You've reached <strong style="color: ${data.tierColor};">${data.pointsAtUnlock} points</strong> and unlocked <strong>${data.tierDisplayName}</strong> status! 🏆
              </p>
              
              <!-- Achievement Box -->
              <div style="background: linear-gradient(135deg, ${data.tierColor}15 0%, ${data.tierColor}25 100%); border: 3px solid ${data.tierColor}; border-radius: 12px; padding: 30px; margin: 0 0 35px 0; text-align: center;">
                <div style="font-size: 64px; margin: 0 0 15px 0;">${data.tierIcon}</div>
                <h2 style="margin: 0 0 10px 0; color: ${data.tierColor}; font-size: 28px; font-weight: bold;">
                  ${data.tierDisplayName}
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                  ${data.pointsAtUnlock} Points Earned
                </p>
              </div>
              
              <!-- Benefits Section -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; margin: 0 0 35px 0;">
                <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: bold; display: flex; align-items: center;">
                  ✨ Your Exclusive Benefits
                </h3>
                <div style="margin: 0;">
                  ${data.benefits.map((benefit, index) => `
                    <div style="display: flex; align-items: start; margin-bottom: ${index === data.benefits.length - 1 ? '0' : '15px'};">
                      <span style="color: ${data.tierColor}; font-size: 20px; margin-right: 12px; flex-shrink: 0;">✓</span>
                      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">${benefit}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              ${data.nextTierName && data.nextTierPoints ? `
                <!-- Next Tier Teaser -->
                <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-left: 4px solid #6366f1; padding: 20px 25px; margin: 0 0 35px 0; border-radius: 8px;">
                  <p style="margin: 0 0 8px 0; color: #4338ca; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    🎯 Next Challenge
                  </p>
                  <p style="margin: 0; color: #4338ca; font-size: 15px; line-height: 1.6;">
                    <strong>${data.nextTierPoints - data.pointsAtUnlock} more points</strong> until <strong>${data.nextTierName}</strong> tier!
                  </p>
                </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 0 0 35px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${appUrl}/rewards" style="display: inline-block; background: linear-gradient(135deg, ${data.tierColor} 0%, ${data.tierColor}dd 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px ${data.tierColor}50; transition: transform 0.2s;">
                      🎁 Explore Your Rewards →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Actions -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
                <h4 style="margin: 0 0 18px 0; color: #374151; font-size: 17px; font-weight: bold;">
                  🚀 Quick Actions
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2.2;">
                  <li><a href="${appUrl}/marketplace" style="color: ${data.tierColor}; text-decoration: none; font-weight: 500;">Browse ${data.tierDisplayName} Offers</a></li>
                  <li><a href="${appUrl}/progress/achievements" style="color: ${data.tierColor}; text-decoration: none; font-weight: 500;">View Your Achievements</a></li>
                  <li><a href="${appUrl}/dashboard" style="color: ${data.tierColor}; text-decoration: none; font-weight: 500;">Track Your Progress</a></li>
                </ul>
              </div>
              
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.7;">
                Keep up the amazing work! Every practice session, every achievement brings you closer to even greater rewards.
              </p>
              
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
                See you on the court! 🏓<br>
                <strong>The Mindful Champion Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 35px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 15px; font-weight: 600;">
                <strong>Mindful Champion</strong> - Your AI-Powered Pickleball Coaching Platform
              </p>
              <p style="margin: 0 0 18px 0; color: #9ca3af; font-size: 13px;">
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
  
  <style>
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
  </style>
</body>
</html>
  `;

  const textContent = `
Congratulations ${data.firstName}!

You've unlocked ${data.tierDisplayName}! ${data.tierIcon}

You've reached ${data.pointsAtUnlock} points and unlocked exclusive rewards and benefits.

Your ${data.tierDisplayName} Benefits:
${data.benefits.map(b => `✓ ${b}`).join('\n')}

${data.nextTierName && data.nextTierPoints ? `Next Challenge: ${data.nextTierPoints - data.pointsAtUnlock} more points until ${data.nextTierName} tier!` : ''}

Explore your rewards: ${appUrl}/rewards
Browse offers: ${appUrl}/marketplace
View achievements: ${appUrl}/progress/achievements

Keep up the amazing work!

The Mindful Champion Team
  `;

  try {
    const result = await resend.emails.send({
      from: 'Mindful Champion <rewards@mindfulchampion.com>',
      to: data.email,
      subject: `🎉 Congratulations! You've Unlocked ${data.tierDisplayName}!`,
      html: htmlContent,
      text: textContent,
    });

    console.log('✅ Reward tier unlock email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send reward tier unlock email:', error);
    throw error;
  }
}
