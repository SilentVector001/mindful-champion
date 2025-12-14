// Send the full welcome email
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🏓 Sending Mindful Champion Welcome Email...\n');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mindful Champion</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header with Gradient Background -->
          <tr>
            <td style="padding: 0; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      🏆 Mindful Champion
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px 30px 20px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                Welcome, Dean! 🏓
              </h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We're absolutely <strong>thrilled</strong> to have you join the Mindful Champion family! You've just taken the first step towards transforming your pickleball game with AI-powered coaching.
              </p>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your <strong>7-day free trial</strong> starts right now, giving you full access to all Pro features. Let's make every practice count! 💪
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px;">
              <a href="https://mindfulchampionpro.abacusai.app/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                🚀 Go to Dashboard
              </a>
            </td>
          </tr>

          <!-- Quick Start Guide -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                🎯 Quick Start Guide
              </h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;">
                      <strong style="color: #10b981;">1.</strong> Complete your profile to personalize your experience
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;">
                      <strong style="color: #10b981;">2.</strong> Chat with your AI Coach to set your goals
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;">
                      <strong style="color: #10b981;">3.</strong> Explore training plans designed for your skill level
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;">
                      <strong style="color: #10b981;">4.</strong> Start tracking your progress and watch yourself improve!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Features Highlight -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                ✨ What You Get With Your Trial
              </h3>
              
              <!-- Feature 1 -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="width: 50px; vertical-align: top; padding-right: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                      🤖
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      AI-Powered Coaching
                    </h4>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Get personalized insights and recommendations based on your unique playing style
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="width: 50px; vertical-align: top; padding-right: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                      📊
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      Training Plans & Analytics
                    </h4>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Track your progress with detailed stats and custom training programs
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="width: 50px; vertical-align: top; padding-right: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                      👤
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      Pro Avatar Feature (Coming Soon!)
                    </h4>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Customize your AI coaching companion with voice and visual preferences
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 4 -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50px; vertical-align: top; padding-right: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                      ⏱️
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      7-Day Free Trial
                    </h4>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Full access to all Pro features - no credit card required!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding: 30px 30px 40px 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                💬 Need Help?
              </h3>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                We're here to help you every step of the way! If you have any questions or need assistance, don't hesitate to reach out.
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 14px;">
                <strong>📧 Support:</strong> 
                <a href="mailto:deansnow59@gmail.com" style="color: #10b981; text-decoration: none; font-weight: 600;">deansnow59@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #ffffff; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                © 2025 Mindful Champion. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Elevate your pickleball game with AI-powered coaching 🏆
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

const textContent = `
Welcome to Mindful Champion, Dean! 🏓

We're absolutely thrilled to have you join the Mindful Champion family! You've just taken the first step towards transforming your pickleball game with AI-powered coaching.

Your 7-day free trial starts right now, giving you full access to all Pro features. Let's make every practice count!

🎯 Quick Start Guide:
1. Complete your profile to personalize your experience
2. Chat with your AI Coach to set your goals
3. Explore training plans designed for your skill level
4. Start tracking your progress and watch yourself improve!

✨ What You Get With Your Trial:
- 🤖 AI-Powered Coaching: Get personalized insights and recommendations
- 📊 Training Plans & Analytics: Track your progress with detailed stats
- 👤 Pro Avatar Feature (Coming Soon!): Customize your AI coaching companion
- ⏱️ 7-Day Free Trial: Full access to all Pro features - no credit card required!

Go to Dashboard: https://mindfulchampionpro.abacusai.app/dashboard

💬 Need Help?
We're here to help you every step of the way! If you have any questions or need assistance, don't hesitate to reach out.

📧 Support: deansnow59@gmail.com

© 2025 Mindful Champion. All rights reserved.
Elevate your pickleball game with AI-powered coaching 🏆
`;

// Send the welcome email
transporter.sendMail({
  from: `"Mindful Champion 🏆" <${process.env.GMAIL_USER}>`,
  to: 'deansnow59@gmail.com',
  subject: '🏓 Welcome to Mindful Champion - Your Journey Begins!',
  text: textContent,
  html: htmlContent,
}, (error, info) => {
  if (error) {
    console.error('❌ Error sending welcome email:', error);
    process.exit(1);
  } else {
    console.log('✅ WELCOME EMAIL SENT SUCCESSFULLY!');
    console.log(`📧 Email sent to: deansnow59@gmail.com`);
    console.log(`📝 Message ID: ${info.messageId}`);
    console.log(`📮 Response: ${info.response}`);
    console.log('\n🎉 SUCCESS! Your email system is now fully operational!\n');
    console.log('👉 Check your inbox at deansnow59@gmail.com');
    console.log('   (Look for the beautiful welcome email with your 7-day trial details)');
    console.log('\n🚀 New users will automatically receive this welcome email when they sign up!');
    process.exit(0);
  }
});
