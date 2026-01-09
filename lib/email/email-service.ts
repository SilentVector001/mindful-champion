/**
 * Email Service - Resend Only
 * Migrated from Gmail SMTP to Resend API for cost optimization
 * All email functionality now exclusively uses Resend API
 */
import { getResendClient } from '@/lib/email/resend-client';
import { prisma } from '@/lib/db';

// Initialize Resend client
const resend = getResendClient();

// Email configuration
const FROM_EMAIL = 'notifications@mindfulchampion.com';
const FROM_NAME = 'Mindful Champion';
const REPLY_TO_EMAIL = 'dean@mindfulchampion.com';

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
          status: 'PENDING',
          metadata: metadata || null,
        },
      });

      // Get reply-to email from settings
      const replyToEmail = emailSettings?.replyToEmail || REPLY_TO_EMAIL;

      // Send email via Resend
      const result = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent || undefined,
        replyTo: replyToEmail,
      });

      // Check if Resend returned an error
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send email via Resend');
      }

      // Resend success - result.data contains the email ID
      const messageId = result.data?.id || null;

      // Update email notification with success status
      await prisma.emailNotification.update({
        where: { id: emailNotification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          resendEmailId: messageId,
        },
      });

      // Update video analysis record if applicable
      if (videoAnalysisId) {
        await prisma.VideoAnalysis.update({
          where: { id: videoAnalysisId },
          data: {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationStatus: 'SENT',
          },
        });
      }

      console.log(`✅ Email sent successfully to ${recipientEmail} (ID: ${messageId})`);
      return { success: true, emailId: messageId || undefined };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);

      // Try to update the email notification record with error
      try {
        const failedNotification = await prisma.emailNotification.findFirst({
          where: {
            userId: params.userId,
            recipientEmail: params.recipientEmail,
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (failedNotification) {
          await prisma.emailNotification.update({
            where: { id: failedNotification.id },
            data: {
              status: 'FAILED',
              failedAt: new Date(),
              error: error.message || 'Unknown error',
            },
          });
        }

        // Update video analysis record if applicable
        if (params.videoAnalysisId) {
          await prisma.VideoAnalysis.update({
            where: { id: params.videoAnalysisId },
            data: {
              emailNotificationStatus: 'FAILED',
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
          status: 'SENDING',
        },
      });

      // Get reply-to email from settings
      const replyToEmail = emailSettings?.replyToEmail || REPLY_TO_EMAIL;

      // Resend email via Resend
      const result = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: notification.recipientEmail,
        subject: notification.subject,
        html: notification.htmlContent,
        text: notification.textContent || undefined,
        replyTo: replyToEmail,
      });

      // Check if Resend returned an error
      if (result.error) {
        throw new Error(result.error.message || 'Failed to retry email via Resend');
      }

      // Resend success - result.data contains the email ID
      const messageId = result.data?.id || null;

      // Update with success
      await prisma.emailNotification.update({
        where: { id: emailNotificationId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          resendEmailId: messageId,
          error: null,
        },
      });

      // Update video analysis if applicable
      if (notification.videoAnalysisId) {
        await prisma.VideoAnalysis.update({
          where: { id: notification.videoAnalysisId },
          data: {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationStatus: 'SENT',
            emailNotificationError: null,
          },
        });
      }

      console.log(`✅ Email retry successful for ${notification.recipientEmail} (ID: ${messageId})`);
      return { success: true, emailId: messageId || undefined };
    } catch (error: any) {
      console.error('❌ Email retry failed:', error);

      // Update with failure
      await prisma.emailNotification.update({
        where: { id: emailNotificationId },
        data: {
          status: 'FAILED',
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
      prisma.emailNotification.count({ where: { status: 'SENT' } }),
      prisma.emailNotification.count({ where: { status: 'FAILED' } }),
      prisma.emailNotification.count({ where: { status: 'PENDING' } }),
      prisma.emailNotification.count({ where: { status: 'OPENED' } }),
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
          fromEmail: FROM_EMAIL,
          fromName: FROM_NAME,
          replyToEmail: REPLY_TO_EMAIL,
        },
      });
      console.log('✅ Email settings initialized with Resend configuration');
    }
  },
};
