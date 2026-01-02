// @ts-nocheck
import { prisma } from '@/lib/db';
import { EmailNotificationType, EmailStatus } from '@prisma/client';

export interface LogEmailParams {
  type: EmailNotificationType;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  userId?: string;
  sponsorApplicationId?: string;
  videoAnalysisId?: string;
  metadata?: any;
  resendEmailId?: string;
}

/**
 * Log an email to the database for tracking and admin viewing
 * This should be called AFTER the email is sent
 */
export async function logEmail(
  params: LogEmailParams,
  sendResult: { success: boolean; error?: any }
) {
  try {
    const {
      type,
      recipientEmail,
      recipientName,
      subject,
      htmlContent,
      textContent,
      userId,
      sponsorApplicationId,
      videoAnalysisId,
      metadata,
      resendEmailId,
    } = params;

    const status: EmailStatus = sendResult.success ? 'SENT' : 'FAILED';
    const error = sendResult.error
      ? typeof sendResult.error === 'string'
        ? sendResult.error
        : sendResult.error.message || JSON.stringify(sendResult.error)
      : null;

    const emailLog = await prisma.emailNotification.create({
      data: {
        type,
        recipientEmail,
        recipientName: recipientName || null,
        subject,
        htmlContent,
        textContent: textContent || null,
        status,
        sentAt: sendResult.success ? new Date() : null,
        failedAt: sendResult.success ? null : new Date(),
        error,
        metadata: metadata || {},
        resendEmailId: resendEmailId || null,
        userId: userId || null,
        sponsorApplicationId: sponsorApplicationId || null,
        videoAnalysisId: videoAnalysisId || null,
        retryCount: 0,
      },
    });

    console.log(`📧 Email logged to database: ${emailLog.id} (${status})`);
    return emailLog;
  } catch (error: any) {
    console.error('❌ Failed to log email to database:', error);
    // Don't throw - logging failure shouldn't break the email send
    return null;
  }
}

/**
 * Update email status (for webhooks from email provider)
 */
export async function updateEmailStatus(
  emailId: string,
  status: EmailStatus,
  metadata?: any
) {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (status === 'OPENED') {
      updateData.openedAt = new Date();
    } else if (status === 'CLICKED') {
      updateData.clickedAt = new Date();
    } else if (status === 'FAILED' || status === 'BOUNCED') {
      updateData.failedAt = new Date();
      if (metadata?.error) {
        updateData.error = metadata.error;
      }
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const emailLog = await prisma.emailNotification.update({
      where: { id: emailId },
      data: updateData,
    });

    console.log(`📧 Email status updated: ${emailId} -> ${status}`);
    return emailLog;
  } catch (error: any) {
    console.error('❌ Failed to update email status:', error);
    return null;
  }
}

/**
 * Get email logs by sponsor application ID
 */
export async function getEmailsByApplication(sponsorApplicationId: string) {
  try {
    const emails = await prisma.emailNotification.findMany({
      where: { sponsorApplicationId },
      orderBy: { createdAt: 'desc' },
    });
    return emails;
  } catch (error: any) {
    console.error('❌ Failed to fetch emails by application:', error);
    return [];
  }
}

/**
 * Get email logs by recipient email
 */
export async function getEmailsByRecipient(recipientEmail: string) {
  try {
    const emails = await prisma.emailNotification.findMany({
      where: { recipientEmail },
      orderBy: { createdAt: 'desc' },
    });
    return emails;
  } catch (error: any) {
    console.error('❌ Failed to fetch emails by recipient:', error);
    return [];
  }
}

/**
 * Log an email notification to the database
 * Simplified version for use by unified-email-service
 */
export async function logEmailNotification(params: {
  userId?: string;
  type: EmailNotificationType;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: EmailStatus;
  resendEmailId?: string;
  sponsorApplicationId?: string;
  videoAnalysisId?: string;
  error?: string;
  metadata?: any;
}) {
  try {
    const emailLog = await prisma.emailNotification.create({
      data: {
        type: params.type,
        recipientEmail: params.recipientEmail,
        recipientName: params.recipientName || null,
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent || null,
        status: params.status,
        sentAt: params.status === 'SENT' ? new Date() : null,
        failedAt: params.status === 'FAILED' ? new Date() : null,
        error: params.error || null,
        metadata: params.metadata || {},
        resendEmailId: params.resendEmailId || null,
        userId: params.userId || null,
        sponsorApplicationId: params.sponsorApplicationId || null,
        videoAnalysisId: params.videoAnalysisId || null,
        retryCount: 0,
      },
    });

    console.log(`📧 Email notification logged to database: ${emailLog.id} (${params.status})`);
    return emailLog;
  } catch (error: any) {
    console.error('❌ Failed to log email notification to database:', error);
    // Don't throw - logging failure shouldn't break the email send
    return null;
  }
}
