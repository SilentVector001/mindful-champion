
import { getResendClient } from '@/lib/email/resend-client';
import { sendWelcomeEmail as sendWelcomeEmailViaNodemailer } from '@/lib/email';
import { prisma } from '@/lib/db';
import { EmailNotificationType } from '@prisma/client';

// Initialize Resend client
const resend = getResendClient();

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class MediaCenterEmailService {
  private static readonly FROM_EMAIL = process.env.EMAIL_FROM || 'welcomefrommc@mindfulchampion.com';
  private static readonly FROM_NAME = 'Mindful Champion';

  static async sendTrialExpirationEmail(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true, 
          name: true, 
          firstName: true,
          trialEndDate: true,
          subscriptionTier: true
        }
      });

      if (!user?.email) {
        console.error('User email not found for trial expiration notification');
        return false;
      }

      const userName = user.firstName || user.name || 'there';
      const template = this.getTrialExpirationTemplate(userName);

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: [user.email],
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      if (error) {
        console.error('Error sending trial expiration email:', error);
        return false;
      }

      // Log the email notification
      await this.logEmailNotification({
        userId,
        type: 'TRIAL_EXPIRATION',
        recipientEmail: user.email,
        subject: template.subject,
        status: 'SENT',
        externalId: data?.id
      });

      return true;
    } catch (error) {
      console.error('Error sending trial expiration email:', error);
      return false;
    }
  }

  private static getTrialExpirationTemplate(userName: string): EmailTemplate {
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?upgrade=true`;
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;

    return {
      subject: 'Thank you for exploring Mindful Champion!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for your trial</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #4F46E5; font-size: 24px; font-weight: bold; }
            .content { line-height: 1.6; color: #374151; }
            .cta-button { 
              display: inline-block; 
              background: #4F46E5; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .features { background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin-bottom: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏓 Mindful Champion</div>
            </div>
            
            <div class="content">
              <h2>Thank you ${userName} for visiting our site!</h2>
              
              <p>We hope you got out of the experience what we intended it to present and provide. Your 7-day trial has ended, but your pickleball journey with us is just beginning.</p>
              
              <p><strong>Your account remains active with free access</strong> to:</p>
              
              <div class="features">
                <div class="feature-item">✅ Basic training videos and tutorials</div>
                <div class="feature-item">✅ Event calendar (view-only)</div>
                <div class="feature-item">✅ Latest 3 episodes from each podcast</div>
                <div class="feature-item">✅ Community access</div>
                <div class="feature-item">✅ Coach Kai basic conversations</div>
              </div>
              
              <p>Ready to unlock the full Mindful Champion experience? Upgrade to access:</p>
              
              <div class="features">
                <div class="feature-item">🚀 <strong>Live tournament streams</strong> and professional matches</div>
                <div class="feature-item">🎧 <strong>Complete podcast library</strong> with all episodes</div>
                <div class="feature-item">📊 <strong>Advanced video analysis</strong> with AI insights</div>
                <div class="feature-item">⌚ <strong>Wearable device integration</strong> for personalized coaching</div>
                <div class="feature-item">📱 <strong>Download content</strong> for offline viewing</div>
                <div class="feature-item">🎯 <strong>Advanced Coach Kai</strong> with health-aware recommendations</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${upgradeUrl}" class="cta-button">Upgrade to Premium</a>
              </div>
              
              <p>Or continue with your <a href="${loginUrl}">free account</a> - no pressure!</p>
              
              <p>Thank you for being part of the Mindful Champion community. Whether free or premium, we're here to support your pickleball journey.</p>
              
              <p>Keep playing and stay mindful!</p>
              
              <p>Best regards,<br>
              The Mindful Champion Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to you because your Mindful Champion trial has ended. If you have any questions, please contact us at <a href="mailto:support@mindfulchampion.com">support@mindfulchampion.com</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank you ${userName} for visiting our site!

        We hope you got out of the experience what we intended it to present and provide. Your 7-day trial has ended, but your pickleball journey with us is just beginning.

        Your account remains active with free access to:
        • Basic training videos and tutorials
        • Event calendar (view-only)
        • Latest 3 episodes from each podcast
        • Community access
        • Coach Kai basic conversations

        Ready to unlock the full experience? Upgrade to access:
        • Live tournament streams and professional matches
        • Complete podcast library with all episodes
        • Advanced video analysis with AI insights
        • Wearable device integration for personalized coaching
        • Download content for offline viewing
        • Advanced Coach Kai with health-aware recommendations

        Upgrade now: ${upgradeUrl}
        Or continue with your free account: ${loginUrl}

        Thank you for being part of the Mindful Champion community!

        Best regards,
        The Mindful Champion Team
      `
    };
  }

  private static async logEmailNotification(data: {
    userId: string;
    type: EmailNotificationType;
    recipientEmail: string;
    subject: string;
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
    externalId?: string;
  }): Promise<void> {
    try {
      await prisma.emailNotification.create({
        data: {
          userId: data.userId,
          type: data.type,
          recipientEmail: data.recipientEmail,
          subject: data.subject,
          htmlContent: '', // Empty for now
          textContent: null,
          status: data.status,
          sentAt: data.status === 'SENT' ? new Date() : undefined,
          resendEmailId: data.externalId,
          metadata: {
            service: 'resend',
            fromEmail: this.FROM_EMAIL
          }
        }
      });
    } catch (error) {
      console.error('Error logging email notification:', error);
    }
  }

  static async sendWelcomeEmail(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true, 
          name: true, 
          firstName: true,
          trialEndDate: true
        }
      });

      if (!user?.email || !user.trialEndDate) {
        return false;
      }

      const userName = user.firstName || user.name || 'there';
      const trialEndDate = new Date(user.trialEndDate).toLocaleDateString();
      
      const template = this.getWelcomeTemplate(userName, trialEndDate);

      // Try Resend first
      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: [user.email],
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      if (error) {
        console.error('⚠️ Resend failed, falling back to Nodemailer:', error);
        
        // Fallback to Nodemailer (Gmail)
        try {
          const nodemailerResult = await sendWelcomeEmailViaNodemailer({
            to: user.email,
            name: userName,
            firstName: user.firstName || undefined
          });
          
          if (nodemailerResult.success) {
            console.log('✅ Welcome email sent via Nodemailer fallback');
            
            await this.logEmailNotification({
              userId,
              type: 'WELCOME',
              recipientEmail: user.email,
              subject: template.subject,
              status: 'SENT',
              externalId: nodemailerResult.messageId
            });
            
            return true;
          } else {
            console.error('❌ Nodemailer fallback also failed:', nodemailerResult.error);
            return false;
          }
        } catch (fallbackError) {
          console.error('❌ Nodemailer fallback exception:', fallbackError);
          return false;
        }
      }

      // Resend succeeded
      await this.logEmailNotification({
        userId,
        type: 'WELCOME',
        recipientEmail: user.email,
        subject: template.subject,
        status: 'SENT',
        externalId: data?.id
      });

      console.log('✅ Welcome email sent via Resend');
      return true;
    } catch (error) {
      console.error('❌ Error in sendWelcomeEmail:', error);
      return false;
    }
  }

  private static getWelcomeTemplate(userName: string, trialEndDate: string): EmailTemplate {
    const mediaCenterUrl = `${process.env.NEXT_PUBLIC_APP_URL}/media-center`;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    return {
      subject: 'Welcome to Mindful Champion - Your 7-Day Trial Starts Now!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Mindful Champion</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #4F46E5; font-size: 24px; font-weight: bold; }
            .content { line-height: 1.6; color: #374151; }
            .cta-button { 
              display: inline-block; 
              background: #4F46E5; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 10px 5px; 
            }
            .features { background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin-bottom: 10px; }
            .trial-info { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏓 Mindful Champion</div>
            </div>
            
            <div class="content">
              <h2>Welcome to Mindful Champion, ${userName}! 🎉</h2>
              
              <div class="trial-info">
                <strong>🎁 Your 7-day premium trial is now active!</strong><br>
                Trial ends on: <strong>${trialEndDate}</strong>
              </div>
              
              <p>Get ready to transform your pickleball game with AI-powered coaching, live tournament coverage, and the most comprehensive training library in pickleball.</p>
              
              <h3>🚀 Start exploring these premium features:</h3>
              
              <div class="features">
                <div class="feature-item">🎥 <strong>Live Streams:</strong> Watch PPA Tour and MLP matches live</div>
                <div class="feature-item">🎧 <strong>Complete Podcast Library:</strong> All episodes from top pickleball podcasts</div>
                <div class="feature-item">📊 <strong>AI Video Analysis:</strong> Upload your gameplay for instant feedback</div>
                <div class="feature-item">⌚ <strong>Wearable Integration:</strong> Connect Apple Watch, Fitbit & more</div>
                <div class="feature-item">🤖 <strong>Advanced Coach Kai:</strong> Health-aware personalized coaching</div>
                <div class="feature-item">📅 <strong>Tournament Calendar:</strong> Never miss a major event</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${mediaCenterUrl}" class="cta-button">Explore Media Center</a>
                <a href="${dashboardUrl}" class="cta-button">Visit Dashboard</a>
              </div>
              
              <p>💡 <strong>Pro Tip:</strong> Connect your wearable device in Settings > Devices to get personalized recovery recommendations from Coach Kai!</p>
              
              <p>Questions? We're here to help at <a href="mailto:support@mindfulchampion.com">support@mindfulchampion.com</a></p>
              
              <p>Welcome to the future of pickleball training!</p>
              
              <p>Best regards,<br>
              The Mindful Champion Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Mindful Champion, ${userName}!

        Your 7-day premium trial is now active!
        Trial ends on: ${trialEndDate}

        Start exploring these premium features:
        • Live Streams: Watch PPA Tour and MLP matches live
        • Complete Podcast Library: All episodes from top pickleball podcasts
        • AI Video Analysis: Upload your gameplay for instant feedback
        • Wearable Integration: Connect Apple Watch, Fitbit & more
        • Advanced Coach Kai: Health-aware personalized coaching
        • Tournament Calendar: Never miss a major event

        Explore Media Center: ${mediaCenterUrl}
        Visit Dashboard: ${dashboardUrl}

        Questions? Contact us at support@mindfulchampion.com

        Welcome to the future of pickleball training!

        Best regards,
        The Mindful Champion Team
      `
    };
  }
}
