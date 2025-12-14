
import nodemailer from 'nodemailer';

// Lazy transporter creation to ensure env vars are loaded
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword) {
      console.error('❌ Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file.');
      throw new Error('Gmail credentials not configured');
    }
    
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });
    
    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  }
  
  return transporter;
}

interface WelcomeEmailOptions {
  to: string;
  name: string;
  firstName?: string;
}

/**
 * Sends a welcome email to new users
 */
export async function sendWelcomeEmail({ to, name, firstName }: WelcomeEmailOptions) {
  const displayName = firstName || name || 'Champion';
  
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
                Welcome, ${displayName}! 🏓
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
                <a href="mailto:dean@mindfulchampion.com" style="color: #10b981; text-decoration: none; font-weight: 600;">dean@mindfulchampion.com</a>
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
Welcome to Mindful Champion, ${displayName}! 🏓

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

📧 Support: dean@mindfulchampion.com

© 2025 Mindful Champion. All rights reserved.
Elevate your pickleball game with AI-powered coaching 🏆
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"Mindful Champion 🏆" <${process.env.GMAIL_USER}>`,
      to,
      subject: '🏓 Welcome to Mindful Champion - Your Journey Begins!',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Welcome email sent successfully:', info.messageId);
    console.log(`📧 Email sent to: ${to}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface PartnerRequestEmailOptions {
  to: string;
  receiverName: string;
  senderName: string;
  senderSkillLevel?: string;
  senderRating?: number;
  message?: string | null;
}

/**
 * Sends a partner request notification email
 */
export async function sendPartnerRequestEmail({
  to,
  receiverName,
  senderName,
  senderSkillLevel,
  senderRating,
  message
}: PartnerRequestEmailOptions) {
  const displayReceiverName = receiverName || 'Champion';
  const skillInfo = senderSkillLevel ? `${senderSkillLevel} (${senderRating || 'N/A'} rating)` : 'Player';
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Partner Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border-radius: 12px 12px 0 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      🤝 New Partner Request
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                Hi ${displayReceiverName}! 👋
              </h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Great news! <strong>${senderName}</strong> (${skillInfo}) wants to connect with you on Mindful Champion!
              </p>
              
              ${message ? `
              <div style="padding: 20px; background-color: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #0f766e; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${message}"
                </p>
              </div>
              ` : ''}

              <p style="margin: 20px 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                This is a great opportunity to find a practice partner, schedule matches, or just connect with someone in your area! 🏓
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 40px 30px;">
              <a href="https://mindful-champion-t6g8z3.abacusai.app/connect/partners?tab=requests" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
                View Request & Respond
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 2px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; text-align: center;">
                You can also log into Mindful Champion to view and respond to this request.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2025 Mindful Champion. All rights reserved.
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
Hi ${displayReceiverName}! 👋

Great news! ${senderName} (${skillInfo}) wants to connect with you on Mindful Champion!

${message ? `Their message: "${message}"` : ''}

This is a great opportunity to find a practice partner, schedule matches, or just connect with someone in your area! 🏓

View Request & Respond: https://mindful-champion-t6g8z3.abacusai.app/connect/partners?tab=requests

You can also log into Mindful Champion to view and respond to this request.

© 2025 Mindful Champion. All rights reserved.
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"Mindful Champion 🤝" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🤝 ${senderName} wants to connect with you!`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Partner request email sent successfully:', info.messageId);
    console.log(`📧 Email sent to: ${to}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending partner request email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a test welcome email
 */
export async function sendTestWelcomeEmail(email: string, name: string) {
  return sendWelcomeEmail({ to: email, name, firstName: name });
}

interface GenericEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Generic email sending function
 */
export async function sendEmail({ to, subject, text, html }: GenericEmailOptions) {
  try {
    const info = await getTransporter().sendMail({
      from: `"Mindful Champion 🏆" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`📧 Email sent to: ${to}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface WarningEmailOptions {
  to: string;
  userName: string;
  warningType: string;
  severity: string;
  message: string;
  quotedContent?: string;
  reason?: string;
}

/**
 * Sends a polite, friendly warning notification email to users
 */
export async function sendWarningEmail({
  to,
  userName,
  warningType,
  severity,
  message,
  quotedContent,
  reason
}: WarningEmailOptions) {
  const displayName = userName || 'Champion';
  
  // Determine severity color and emoji
  const severityConfig = {
    LOW: { color: '#3b82f6', emoji: '💙', label: 'Advisory Notice' },
    MEDIUM: { color: '#f59e0b', emoji: '⚠️', label: 'Important Notice' },
    HIGH: { color: '#ef4444', emoji: '🚨', label: 'Urgent Notice' },
    FINAL: { color: '#991b1b', emoji: '⛔', label: 'Final Warning' }
  };
  
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.LOW;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.label} - Mindful Champion</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0; background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); border-radius: 12px 12px 0 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">${config.emoji}</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      ${config.label}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                Hi ${displayName}, 👋
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We hope you're enjoying your experience with Mindful Champion. We wanted to reach out regarding a recent matter that requires your attention.
              </p>

              ${reason ? `
              <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  Regarding: ${reason}
                </p>
              </div>
              ` : ''}

              ${quotedContent ? `
              <div style="padding: 20px; background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  Reference from conversation:
                </p>
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${quotedContent}"
                </p>
              </div>
              ` : ''}

              <div style="padding: 24px; background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #075985; font-size: 16px; line-height: 1.7;">
                  ${message}
                </p>
              </div>

              ${severity === 'FINAL' ? `
              <div style="padding: 20px; background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 700;">
                  ⚠️ FINAL WARNING
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  This is your final warning. Continued violations may result in account suspension or termination. We value you as a member of our community and hope to resolve this matter amicably.
                </p>
              </div>
              ` : `
              <p style="margin: 20px 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We understand that mistakes happen, and we're here to support you in maintaining a positive experience for everyone in the Mindful Champion community. 🤝
              </p>
              `}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 40px 30px;">
              <a href="https://mindful-champion-2hzb4j.abacusai.app/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                Return to Dashboard
              </a>
            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding: 30px 30px 40px 30px; background-color: #f9fafb; border-top: 2px solid #e5e7eb;">
              <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                💬 Questions or Concerns?
              </h3>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                If you have any questions about this notice or would like to discuss this matter further, please don't hesitate to reach out to our support team. We're here to help!
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 14px;">
                <strong>📧 Support:</strong> 
                <a href="mailto:dean@mindfulchampion.com" style="color: #10b981; text-decoration: none; font-weight: 600;">dean@mindfulchampion.com</a>
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
                Building a respectful and supportive pickleball community 🏆
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
${config.emoji} ${config.label} - Mindful Champion

Hi ${displayName}, 👋

We hope you're enjoying your experience with Mindful Champion. We wanted to reach out regarding a recent matter that requires your attention.

${reason ? `\nRegarding: ${reason}\n` : ''}

${quotedContent ? `\nReference from conversation:\n"${quotedContent}"\n` : ''}

Message:
${message}

${severity === 'FINAL' ? `
⚠️ FINAL WARNING

This is your final warning. Continued violations may result in account suspension or termination. We value you as a member of our community and hope to resolve this matter amicably.
` : `
We understand that mistakes happen, and we're here to support you in maintaining a positive experience for everyone in the Mindful Champion community. 🤝
`}

Return to Dashboard: https://mindful-champion-2hzb4j.abacusai.app/dashboard

💬 Questions or Concerns?
If you have any questions about this notice or would like to discuss this matter further, please don't hesitate to reach out to our support team. We're here to help!

📧 Support: dean@mindfulchampion.com

© 2025 Mindful Champion. All rights reserved.
Building a respectful and supportive pickleball community 🏆
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"Mindful Champion Security Team 🛡️" <${process.env.GMAIL_USER}>`,
      to,
      subject: `${config.emoji} ${config.label} - Mindful Champion`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Warning email sent successfully:', info.messageId);
    console.log(`📧 Warning email sent to: ${to}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending warning email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
