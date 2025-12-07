import { sendEmail as sendGmailEmail, EmailType } from './gmail-service';
import { prisma } from '@/lib/db';

// Define types locally to avoid Prisma client generation issues
type EmailStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' | 'UNSUBSCRIBED';
type EmailNotificationType = 'VIDEO_ANALYSIS_COMPLETE' | 'WELCOME' | 'SUBSCRIPTION_RENEWAL' | 'ACHIEVEMENT_UNLOCKED' | 'MATCH_REMINDER' | 'TRAINING_REMINDER' | 'SYSTEM_UPDATE' | 'CUSTOM' | 'TRIAL_EXPIRATION' | 'TRIAL_WARNING_7_DAYS' | 'TRIAL_WARNING_3_DAYS' | 'TRIAL_WARNING_1_DAY';

interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

interface SendEmailParams {
  userId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: string;
  videoAnalysisId?: string;
  metadata?: any;
}

// Map email notification types to Gmail email types
function mapEmailType(type: string): EmailType {
  switch (type) {
    case 'VIDEO_ANALYSIS_COMPLETE':
    case 'GOAL_REMINDER':
    case 'TRAINING_UPDATE':
      return 'COACH_KAI';
    case 'SUPPORT':
    case 'HELP':
      return 'SUPPORT';
    case 'PARTNER_APPLICATION':
    case 'PARTNER_UPDATE':
      return 'PARTNERSHIP';
    case 'SPONSOR_APPLICATION':
    case 'SPONSOR_UPDATE':
      return 'SPONSORSHIP';
    default:
      return 'WELCOME';
  }
}

/**
 * Main email service for sending emails
 */
export const emailService = {
  /**
   * Send an email
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const {
        userId,
        recipientEmail,
        recipientName,
        subject,
        htmlContent,
        textContent,
        type,
        videoAnalysisId,
        metadata,
      } = params;

      // Check if email settings allow this type of email
      const emailSettings = await prisma.emailSettings.findFirst();
      
      if (emailSettings) {
        if (!emailSettings.emailNotificationsEnabled) {
          console.log('Email notifications are disabled globally');
          return { success: false, error: 'Email notifications disabled' };
        }
        
        if (type === 'VIDEO_ANALYSIS_COMPLETE' && !emailSettings.videoAnalysisEmailsEnabled) {
          console.log('Video analysis emails are disabled');
          return { success: false, error: 'Video analysis emails disabled' };
        }
      }

      // Create email notification record
      const emailNotification = await prisma.emailNotification.create({
        data: {
          userId,
          videoAnalysisId,
          type: type as EmailNotificationType,
          recipientEmail,
          recipientName: recipientName || null,
          subject,
          htmlContent,
          textContent: textContent || null,
          status: EmailStatus.PENDING,
          metadata: metadata || null,
        },
      });

      // Get reply-to email from settings
      const replyToEmail = emailSettings?.replyToEmail || 'support@mindfulchampion.ai';

      // Determine email type for Gmail sender
      const gmailType = mapEmailType(type);

      // Send email via Gmail
      const result = await sendGmailEmail({
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
        type: gmailType,
        replyTo: replyToEmail,
      });

      // Check if result has an error
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Update email notification with success status
      await prisma.emailNotification.update({
        where: { id: emailNotification.id },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          resendEmailId: result.messageId || null,
        },
      });

      // Update video analysis record if applicable
      if (videoAnalysisId) {
        await prisma.videoAnalysis.update({
          where: { id: videoAnalysisId },
          data: {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationStatus: EmailStatus.SENT,
          },
        });
      }

      console.log(`✅ Email sent successfully to ${recipientEmail}`);
      return { success: true, emailId: result.messageId || undefined };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);

      // Try to update the email notification record with error
      try {
        const failedNotification = await prisma.emailNotification.findFirst({
          where: {
            userId: params.userId,
            recipientEmail: params.recipientEmail,
            status: EmailStatus.PENDING,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (failedNotification) {
          await prisma.emailNotification.update({
            where: { id: failedNotification.id },
            data: {
              status: EmailStatus.FAILED,
              failedAt: new Date(),
              error: error.message || 'Unknown error',
            },
          });
        }

        // Update video analysis record if applicable
        if (params.videoAnalysisId) {
          await prisma.videoAnalysis.update({
            where: { id: params.videoAnalysisId },
            data: {
              emailNotificationStatus: EmailStatus.FAILED,
              emailNotificationError: error.message || 'Unknown error',
            },
          });
        }
      } catch (updateError) {
        console.error('Failed to update email notification error:', updateError);
      }

      return { success: false, error: error.message || 'Failed to send email' };
    }
  },

  /**
   * Retry sending a failed email
   */
  async retryEmail(emailNotificationId: string): Promise<SendEmailResult> {
    try {
      const notification = await prisma.emailNotification.findUnique({
        where: { id: emailNotificationId },
        include: {
          user: true,
          videoAnalysis: true,
        },
      });

      if (!notification) {
        return { success: false, error: 'Email notification not found' };
      }

      // Check retry limit
      const emailSettings = await prisma.emailSettings.findFirst();
      const maxRetries = emailSettings?.maxRetryAttempts || 3;

      if (notification.retryCount >= maxRetries) {
        return { success: false, error: 'Maximum retry attempts reached' };
      }

      // Update retry count
      await prisma.emailNotification.update({
        where: { id: emailNotificationId },
        data: {
          retryCount: notification.retryCount + 1,
          lastRetryAt: new Date(),
          status: EmailStatus.SENDING,
        },
      });

      // Get reply-to email from settings
      const replyToEmail = emailSettings?.replyToEmail || 'support@mindfulchampion.ai';

      // Determine email type for Gmail sender
      const gmailType = mapEmailType(notification.type);

      // Resend email via Gmail
      const result = await sendGmailEmail({
        to: notification.recipientEmail,
        subject: notification.subject,
        html: notification.htmlContent,
        text: notification.textContent || undefined,
        type: gmailType,
        replyTo: replyToEmail,
      });

      // Check if result has an error
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Update with success
      await prisma.emailNotification.update({
        where: { id: emailNotificationId },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          resendEmailId: result.messageId || null,
          error: null,
        },
      });

      // Update video analysis if applicable
      if (notification.videoAnalysisId) {
        await prisma.videoAnalysis.update({
          where: { id: notification.videoAnalysisId },
          data: {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationStatus: EmailStatus.SENT,
            emailNotificationError: null,
          },
        });
      }

      console.log(`✅ Email retry successful for ${notification.recipientEmail}`);
      return { success: true, emailId: result.messageId || undefined };
    } catch (error: any) {
      console.error('❌ Email retry failed:', error);

      // Update with failure
      await prisma.emailNotification.update({
        where: { id: emailNotificationId },
        data: {
          status: EmailStatus.FAILED,
          failedAt: new Date(),
          error: error.message || 'Retry failed',
        },
      });

      return { success: false, error: error.message || 'Retry failed' };
    }
  },

  /**
   * Get email notification statistics
   */
  async getEmailStats() {
    const [total, sent, failed, pending, opened] = await Promise.all([
      prisma.emailNotification.count(),
      prisma.emailNotification.count({ where: { status: EmailStatus.SENT } }),
      prisma.emailNotification.count({ where: { status: EmailStatus.FAILED } }),
      prisma.emailNotification.count({ where: { status: EmailStatus.PENDING } }),
      prisma.emailNotification.count({ where: { status: EmailStatus.OPENED } }),
    ]);

    const successRate = total > 0 ? ((sent / total) * 100).toFixed(2) : '0';

    return {
      total,
      sent,
      failed,
      pending,
      opened,
      successRate: parseFloat(successRate),
    };
  },

  /**
   * Initialize email settings if not exists
   */
  async initializeEmailSettings() {
    const existing = await prisma.emailSettings.findFirst();
    if (!existing) {
      await prisma.emailSettings.create({
        data: {
          emailNotificationsEnabled: true,
          videoAnalysisEmailsEnabled: true,
          welcomeEmailsEnabled: true,
          marketingEmailsEnabled: false,
          maxRetryAttempts: 3,
          retryDelayMinutes: 30,
          fromEmail: 'notifications@mindfulchampion.ai',
          fromName: 'Mindful Champion',
          replyToEmail: 'support@mindfulchampion.ai',
        },
      });
      console.log('✅ Email settings initialized');
    }
  },
};
