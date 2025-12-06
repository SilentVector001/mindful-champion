/**
 * Gmail Email Sender
 * Uses nodemailer with Gmail SMTP for reliable email delivery
 */

import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';
import { EmailStatus, EmailNotificationType } from '@prisma/client';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Gmail transporter verification failed:', error);
      } else {
        console.log('✅ Gmail transporter is ready to send emails');
      }
    });
  }

  return transporter;
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

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Gmail
 */
export async function sendEmailViaGmail(params: SendEmailParams): Promise<SendEmailResult> {
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

    console.log(`📧 Preparing to send email to: ${recipientEmail}`);

    // Check if email settings allow this type of email (optional)
    let emailSettings;
    try {
      emailSettings = await prisma.emailSettings.findFirst();
      
      if (emailSettings) {
        if (!emailSettings.emailNotificationsEnabled) {
          console.log('⚠️ Email notifications are disabled globally');
          return { success: false, error: 'Email notifications disabled' };
        }
        
        if (type === 'VIDEO_ANALYSIS_COMPLETE' && !emailSettings.videoAnalysisEmailsEnabled) {
          console.log('⚠️ Video analysis emails are disabled');
          return { success: false, error: 'Video analysis emails disabled' };
        }
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not check email settings, proceeding anyway:', settingsError);
    }

    // Create email notification record
    let emailNotification;
    try {
      emailNotification = await prisma.emailNotification.create({
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
    } catch (dbError) {
      console.warn('⚠️ Could not create email notification record, continuing anyway:', dbError);
    }

    // Get Gmail transporter
    const gmailTransporter = getTransporter();
    
    // Get from email from settings or use default
    const fromEmail = emailSettings?.fromEmail || process.env.GMAIL_USER || 'noreply@mindfulchampion.ai';
    const fromName = emailSettings?.fromName || 'Coach Kai - Mindful Champion';

    // Send email via Gmail
    const info = await gmailTransporter.sendMail({
      from: `"${fromName} 🏆" <${fromEmail}>`,
      to: recipientEmail,
      subject,
      text: textContent || '',
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${recipientEmail}`);
    console.log(`📬 Message ID: ${info.messageId}`);

    // Update email notification with success status
    if (emailNotification) {
      try {
        await prisma.emailNotification.update({
          where: { id: emailNotification.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
            resendEmailId: info.messageId,
          },
        });
      } catch (updateError) {
        console.warn('⚠️ Could not update email notification status:', updateError);
      }
    }

    // Update video analysis record if applicable
    if (videoAnalysisId) {
      try {
        await prisma.videoAnalysis.update({
          where: { id: videoAnalysisId },
          data: {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationStatus: EmailStatus.SENT,
          },
        });
      } catch (updateError) {
        console.warn('⚠️ Could not update video analysis email status:', updateError);
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send email via Gmail:', error);

    // Try to update the email notification record with error
    try {
      if (params.userId) {
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
      console.error('❌ Failed to update email notification error:', updateError);
    }

    return { success: false, error: error.message || 'Failed to send email' };
  }
}
