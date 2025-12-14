/**
 * Unified Email Service
 * Single source for ALL email sending in the application
 * 
 * This service replaces direct email sending and provides:
 * - Centralized email configuration
 * - Template management
 * - Database logging
 * - Error handling
 * - Resend integration
 */

import { getResendClient } from './resend-client';
import { EMAIL_CONFIG, getFromEmail } from './config';
import { prisma } from '@/lib/db';
import { logEmailNotification } from './log-email';

// Import all email templates
import { generateWelcomeEmail } from './templates/welcome-email';
import { generatePasswordResetEmail } from './templates/password-reset-email';
import { 
  generateSubscriptionConfirmationEmail,
  generateSubscriptionExpiringEmail,
  generateSubscriptionCancelledEmail,
  generatePaymentReceiptEmail,
} from './templates/subscription-emails';
import {
  generateTournamentRegistrationEmail,
  generateTournamentReminderEmail,
  generateTournamentResultsEmail,
} from './templates/tournament-emails';
import { generateAnalysisFailedEmail } from './templates/analysis-failed-email';
import {
  generateNewUserAlertEmail,
  generatePaymentAlertEmail,
  generateSystemErrorAlertEmail,
} from './templates/admin-alert-emails';
import {
  generateRedemptionRequestEmail,
  generateRedemptionApprovedEmail,
  generateRedemptionShippedEmail,
} from './templates/redemption-emails';

type EmailNotificationType = 
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'VIDEO_ANALYSIS_COMPLETE'
  | 'VIDEO_ANALYSIS_FAILED'
  | 'SUBSCRIPTION_CONFIRMATION'
  | 'SUBSCRIPTION_RENEWAL'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_RECEIPT'
  | 'TOURNAMENT_REGISTRATION'
  | 'TOURNAMENT_REMINDER'
  | 'TOURNAMENT_RESULTS'
  | 'REDEMPTION_REQUEST'
  | 'REDEMPTION_APPROVED'
  | 'REDEMPTION_SHIPPED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'SPONSOR_APPLICATION'
  | 'SPONSOR_APPROVAL'
  | 'ADMIN_NEW_USER'
  | 'ADMIN_PAYMENT'
  | 'ADMIN_ERROR'
  | 'CUSTOM';

interface BaseEmailParams {
  recipientEmail: string;
  recipientName?: string;
  userId?: string;
}

interface CustomEmailParams extends BaseEmailParams {
  type: 'CUSTOM';
  subject: string;
  html: string;
  text: string;
}

interface WelcomeEmailParams extends BaseEmailParams {
  type: 'WELCOME';
  userName: string;
}

interface PasswordResetEmailParams extends BaseEmailParams {
  type: 'PASSWORD_RESET';
  userName: string;
  resetToken: string;
  resetUrl: string;
}

interface SubscriptionConfirmationEmailParams extends BaseEmailParams {
  type: 'SUBSCRIPTION_CONFIRMATION';
  userName: string;
  planName: string;
  amount: number;
  billingDate: string;
}

interface SubscriptionExpiringEmailParams extends BaseEmailParams {
  type: 'SUBSCRIPTION_EXPIRING';
  userName: string;
  planName: string;
  expiryDate: string;
  daysLeft: number;
}

interface SubscriptionCancelledEmailParams extends BaseEmailParams {
  type: 'SUBSCRIPTION_CANCELLED';
  userName: string;
  planName: string;
  endDate: string;
}

interface PaymentReceiptEmailParams extends BaseEmailParams {
  type: 'PAYMENT_RECEIPT';
  userName: string;
  amount: number;
  planName: string;
  transactionId: string;
  date: string;
}

interface TournamentRegistrationEmailParams extends BaseEmailParams {
  type: 'TOURNAMENT_REGISTRATION';
  userName: string;
  tournamentName: string;
  tournamentDate: string;
  location: string;
}

interface TournamentReminderEmailParams extends BaseEmailParams {
  type: 'TOURNAMENT_REMINDER';
  userName: string;
  tournamentName: string;
  hoursUntil: number;
  location: string;
}

interface TournamentResultsEmailParams extends BaseEmailParams {
  type: 'TOURNAMENT_RESULTS';
  userName: string;
  tournamentName: string;
  placement: string;
  totalParticipants: number;
}

interface AnalysisFailedEmailParams extends BaseEmailParams {
  type: 'VIDEO_ANALYSIS_FAILED';
  userName: string;
  videoTitle: string;
  errorReason: string;
}

interface RedemptionRequestEmailParams extends BaseEmailParams {
  type: 'REDEMPTION_REQUEST';
  userName: string;
  rewardName: string;
  pointsCost: number;
  requestId: string;
}

interface RedemptionApprovedEmailParams extends BaseEmailParams {
  type: 'REDEMPTION_APPROVED';
  userName: string;
  rewardName: string;
  sponsorName: string;
  instructions: string;
}

interface RedemptionShippedEmailParams extends BaseEmailParams {
  type: 'REDEMPTION_SHIPPED';
  userName: string;
  rewardName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

interface AdminNewUserEmailParams extends BaseEmailParams {
  type: 'ADMIN_NEW_USER';
  userName: string;
  userEmail: string;
  userId: string;
  signupDate: string;
}

interface AdminPaymentEmailParams extends BaseEmailParams {
  type: 'ADMIN_PAYMENT';
  userName: string;
  userEmail: string;
  amount: number;
  planName: string;
  transactionId: string;
}

interface AdminErrorEmailParams extends BaseEmailParams {
  type: 'ADMIN_ERROR';
  errorType: string;
  errorMessage: string;
  errorStack: string;
  userId?: string;
  timestamp?: string;
}

type EmailParams = 
  | CustomEmailParams
  | WelcomeEmailParams
  | PasswordResetEmailParams
  | SubscriptionConfirmationEmailParams
  | SubscriptionExpiringEmailParams
  | SubscriptionCancelledEmailParams
  | PaymentReceiptEmailParams
  | TournamentRegistrationEmailParams
  | TournamentReminderEmailParams
  | TournamentResultsEmailParams
  | AnalysisFailedEmailParams
  | RedemptionRequestEmailParams
  | RedemptionApprovedEmailParams
  | RedemptionShippedEmailParams
  | AdminNewUserEmailParams
  | AdminPaymentEmailParams
  | AdminErrorEmailParams;

export class UnifiedEmailService {
  /**
   * Send an email based on type
   */
  static async sendEmail(params: EmailParams): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      // Get email content based on type
      let emailContent: { subject: string; html: string; text: string };
      
      switch (params.type) {
        case 'CUSTOM':
          emailContent = {
            subject: params.subject,
            html: params.html,
            text: params.text,
          };
          break;
          
        case 'WELCOME':
          emailContent = generateWelcomeEmail(params.userName, params.recipientEmail);
          break;
          
        case 'PASSWORD_RESET':
          emailContent = generatePasswordResetEmail(params.userName, params.resetToken, params.resetUrl);
          break;
          
        case 'SUBSCRIPTION_CONFIRMATION':
          emailContent = generateSubscriptionConfirmationEmail(
            params.userName,
            params.planName,
            params.amount,
            params.billingDate
          );
          break;
          
        case 'SUBSCRIPTION_EXPIRING':
          emailContent = generateSubscriptionExpiringEmail(
            params.userName,
            params.planName,
            params.expiryDate,
            params.daysLeft
          );
          break;
          
        case 'SUBSCRIPTION_CANCELLED':
          emailContent = generateSubscriptionCancelledEmail(
            params.userName,
            params.planName,
            params.endDate
          );
          break;
          
        case 'PAYMENT_RECEIPT':
          emailContent = generatePaymentReceiptEmail(
            params.userName,
            params.amount,
            params.planName,
            params.transactionId,
            params.date
          );
          break;
          
        case 'TOURNAMENT_REGISTRATION':
          emailContent = generateTournamentRegistrationEmail(
            params.userName,
            params.tournamentName,
            params.tournamentDate,
            params.location
          );
          break;
          
        case 'TOURNAMENT_REMINDER':
          emailContent = generateTournamentReminderEmail(
            params.userName,
            params.tournamentName,
            params.hoursUntil,
            params.location
          );
          break;
          
        case 'TOURNAMENT_RESULTS':
          emailContent = generateTournamentResultsEmail(
            params.userName,
            params.tournamentName,
            params.placement,
            params.totalParticipants
          );
          break;
          
        case 'VIDEO_ANALYSIS_FAILED':
          emailContent = generateAnalysisFailedEmail(
            params.userName,
            params.videoTitle,
            params.errorReason
          );
          break;
          
        case 'REDEMPTION_REQUEST':
          emailContent = generateRedemptionRequestEmail(
            params.userName,
            params.rewardName,
            params.pointsCost,
            params.requestId
          );
          break;
          
        case 'REDEMPTION_APPROVED':
          emailContent = generateRedemptionApprovedEmail(
            params.userName,
            params.rewardName,
            params.sponsorName,
            params.instructions
          );
          break;
          
        case 'REDEMPTION_SHIPPED':
          emailContent = generateRedemptionShippedEmail(
            params.userName,
            params.rewardName,
            params.trackingNumber,
            params.carrier,
            params.estimatedDelivery
          );
          break;
          
        case 'ADMIN_NEW_USER':
          emailContent = generateNewUserAlertEmail(
            params.userName,
            params.userEmail,
            params.userId,
            params.signupDate
          );
          break;
          
        case 'ADMIN_PAYMENT':
          emailContent = generatePaymentAlertEmail(
            params.userName,
            params.userEmail,
            params.amount,
            params.planName,
            params.transactionId
          );
          break;
          
        case 'ADMIN_ERROR':
          emailContent = generateSystemErrorAlertEmail(
            params.errorType,
            params.errorMessage,
            params.errorStack,
            params.userId,
            params.timestamp
          );
          break;
          
        default:
          throw new Error(`Unsupported email type: ${(params as any).type}`);
      }
      
      // Get from email based on type
      const fromEmail = getFromEmail(params.type);
      
      // Send email via Resend
      const resend = getResendClient();
      const result = await resend.emails.send({
        from: fromEmail,
        to: params.recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      
      // Check for errors
      if (result.error) {
        throw new Error(result.error.message || 'Unknown Resend error');
      }
      
      // Log to database
      try {
        await logEmailNotification({
          userId: params.userId,
          type: params.type as any,
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          subject: emailContent.subject,
          htmlContent: emailContent.html,
          textContent: emailContent.text,
          status: 'SENT',
          resendEmailId: result.data?.id,
        });
      } catch (logError) {
        console.error('Failed to log email notification:', logError);
        // Don't fail the email send if logging fails
      }
      
      console.log(`✅ Email sent successfully: ${params.type} to ${params.recipientEmail}`);
      return { success: true, emailId: result.data?.id };
      
    } catch (error: any) {
      console.error(`❌ Failed to send ${params.type} email:`, error);
      
      // Log failed email
      try {
        await logEmailNotification({
          userId: params.userId,
          type: params.type as any,
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          subject: 'subject' in params ? params.subject : 'Email',
          htmlContent: 'html' in params ? params.html : '',
          textContent: 'text' in params ? params.text : '',
          status: 'FAILED',
          error: error.message || 'Unknown error',
        });
      } catch (logError) {
        console.error('Failed to log failed email:', logError);
      }
      
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }
  
  /**
   * Send email to admin (uses dean@mindfulchampion.com)
   */
  static async sendAdminEmail(params: Omit<AdminNewUserEmailParams | AdminPaymentEmailParams | AdminErrorEmailParams, 'recipientEmail'>) {
    const adminEmail = EMAIL_CONFIG.ACCOUNTS.ADMIN.email;
    return this.sendEmail({
      ...params,
      recipientEmail: adminEmail,
    } as any);
  }
  
  /**
   * Test email sending
   */
  static async sendTestEmail(recipientEmail: string) {
    return this.sendEmail({
      type: 'CUSTOM',
      recipientEmail,
      recipientName: 'Test User',
      subject: '🧪 Test Email - Mindful Champion',
      html: '<h1>Test Email</h1><p>This is a test email from Mindful Champion email system.</p>',
      text: 'Test Email\n\nThis is a test email from Mindful Champion email system.',
    });
  }
}

// Export convenience functions for common email types
export const EmailSender = {
  // User emails
  welcome: (userId: string, email: string, name: string) => 
    UnifiedEmailService.sendEmail({ type: 'WELCOME', userId, recipientEmail: email, recipientName: name, userName: name }),
    
  passwordReset: (userId: string, email: string, name: string, resetToken: string, resetUrl: string) =>
    UnifiedEmailService.sendEmail({ type: 'PASSWORD_RESET', userId, recipientEmail: email, recipientName: name, userName: name, resetToken, resetUrl }),
  
  // Subscription emails
  subscriptionConfirmed: (userId: string, email: string, name: string, planName: string, amount: number, billingDate: string) =>
    UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_CONFIRMATION', userId, recipientEmail: email, recipientName: name, userName: name, planName, amount, billingDate }),
    
  subscriptionExpiring: (userId: string, email: string, name: string, planName: string, expiryDate: string, daysLeft: number) =>
    UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_EXPIRING', userId, recipientEmail: email, recipientName: name, userName: name, planName, expiryDate, daysLeft }),
    
  subscriptionCancelled: (userId: string, email: string, name: string, planName: string, endDate: string) =>
    UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_CANCELLED', userId, recipientEmail: email, recipientName: name, userName: name, planName, endDate }),
    
  paymentReceipt: (userId: string, email: string, name: string, amount: number, planName: string, transactionId: string, date: string) =>
    UnifiedEmailService.sendEmail({ type: 'PAYMENT_RECEIPT', userId, recipientEmail: email, recipientName: name, userName: name, amount, planName, transactionId, date }),
  
  // Tournament emails
  tournamentRegistration: (userId: string, email: string, name: string, tournamentName: string, tournamentDate: string, location: string) =>
    UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_REGISTRATION', userId, recipientEmail: email, recipientName: name, userName: name, tournamentName, tournamentDate, location }),
    
  tournamentReminder: (userId: string, email: string, name: string, tournamentName: string, hoursUntil: number, location: string) =>
    UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_REMINDER', userId, recipientEmail: email, recipientName: name, userName: name, tournamentName, hoursUntil, location }),
    
  tournamentResults: (userId: string, email: string, name: string, tournamentName: string, placement: string, totalParticipants: number) =>
    UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_RESULTS', userId, recipientEmail: email, recipientName: name, userName: name, tournamentName, placement, totalParticipants }),
  
  // Video analysis
  analysisFailed: (userId: string, email: string, name: string, videoTitle: string, errorReason: string) =>
    UnifiedEmailService.sendEmail({ type: 'VIDEO_ANALYSIS_FAILED', userId, recipientEmail: email, recipientName: name, userName: name, videoTitle, errorReason }),
  
  // Redemptions
  redemptionRequest: (userId: string, email: string, name: string, rewardName: string, pointsCost: number, requestId: string) =>
    UnifiedEmailService.sendEmail({ type: 'REDEMPTION_REQUEST', userId, recipientEmail: email, recipientName: name, userName: name, rewardName, pointsCost, requestId }),
    
  redemptionApproved: (userId: string, email: string, name: string, rewardName: string, sponsorName: string, instructions: string) =>
    UnifiedEmailService.sendEmail({ type: 'REDEMPTION_APPROVED', userId, recipientEmail: email, recipientName: name, userName: name, rewardName, sponsorName, instructions }),
    
  redemptionShipped: (userId: string, email: string, name: string, rewardName: string, trackingNumber: string, carrier: string, estimatedDelivery: string) =>
    UnifiedEmailService.sendEmail({ type: 'REDEMPTION_SHIPPED', userId, recipientEmail: email, recipientName: name, userName: name, rewardName, trackingNumber, carrier, estimatedDelivery }),
  
  // Admin alerts
  adminNewUser: (userName: string, userEmail: string, userId: string, signupDate: string) =>
    UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_NEW_USER', userName, userEmail, userId, signupDate }),
    
  adminPayment: (userName: string, userEmail: string, amount: number, planName: string, transactionId: string) =>
    UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_PAYMENT', userName, userEmail, amount, planName, transactionId }),
    
  adminError: (errorType: string, errorMessage: string, errorStack: string, userId?: string, timestamp?: string) =>
    UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_ERROR', errorType, errorMessage, errorStack, userId, timestamp }),
};
