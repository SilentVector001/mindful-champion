/**
 * Welcome Email Template
 * Sent when a new user signs up
 */

export function generateWelcomeEmail(userName: string, userEmail: string) {
  const subject = '🏓 Welcome to Mindful Champion - Your Journey Begins!';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mindful Champion</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🏓 Mindful Champion</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Welcome to Your Pickleball Journey!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 24px;">Hey ${userName || 'Champion'}! 👋</h2>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We're absolutely thrilled to have you join the Mindful Champion community! You're about to embark on an incredible journey to elevate your pickleball game with AI-powered coaching.
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%); border-left: 4px solid #14b8a6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 20px;">🚀 Here's what you can do:</h3>
                <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 2;">
                  <li><strong>Upload Videos</strong> for instant AI analysis from Coach Kai</li>
                  <li><strong>Follow Training Programs</strong> designed by pickleball pros</li>
                  <li><strong>Track Your Progress</strong> with detailed analytics</li>
                  <li><strong>Earn Rewards</strong> and unlock achievements</li>
                  <li><strong>Join Tournaments</strong> and compete with others</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);">
                  Get Started Now →
                </a>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 18px;">💡 Pro Tip</h4>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                  Start by uploading your first video for analysis. Coach Kai will provide personalized feedback on your technique, positioning, and strategy!
                </p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Need help getting started? Check out our <a href="https://mindfulchampion.com/help" style="color: #14b8a6; text-decoration: none;">Help Center</a> or reply to this email - we're here to help!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Mindful Champion</strong><br>
                Elevate Your Game with AI-Powered Coaching
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Questions? Contact us at <a href="mailto:support@mindfulchampion.com" style="color: #14b8a6; text-decoration: none;">support@mindfulchampion.com</a>
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
  
  const text = `
Welcome to Mindful Champion!

Hey ${userName || 'Champion'}!

We're thrilled to have you join the Mindful Champion community! You're about to embark on an incredible journey to elevate your pickleball game with AI-powered coaching.

Here's what you can do:
- Upload Videos for instant AI analysis from Coach Kai
- Follow Training Programs designed by pickleball pros
- Track Your Progress with detailed analytics
- Earn Rewards and unlock achievements
- Join Tournaments and compete with others

Get Started: https://mindfulchampion.com/dashboard

Pro Tip: Start by uploading your first video for analysis. Coach Kai will provide personalized feedback on your technique, positioning, and strategy!

Need help? Visit https://mindfulchampion.com/help or reply to this email.

Best regards,
The Mindful Champion Team
  `;
  
  return { subject, html, text };
}
