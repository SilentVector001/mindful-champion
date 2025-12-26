/**
 * Gmail Email Service
 * Comprehensive Gmail SMTP integration with multiple sender addresses
 * Uses nodemailer for reliable email delivery
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email sender configurations
export const EMAIL_SENDERS = {
  WELCOME: {
    email: process.env.EMAIL_FROM_WELCOME || 'welcomefrommc@mindfulchampion.com',
    name: 'Coach Kai - Mindful Champion',
    emoji: '🏓',
  },
  COACH_KAI: {
    email: process.env.EMAIL_FROM_COACH_KAI || 'coachkai@mindfulchampion.com',
    name: 'Coach Kai',
    emoji: '🏓',
  },
  SUPPORT: {
    email: process.env.EMAIL_FROM_SUPPORT || 'support@mindfulchampion.com',
    name: 'Mindful Champion Support',
    emoji: '💬',
  },
  PARTNERS: {
    email: process.env.EMAIL_FROM_PARTNERS || 'partners@mindfulchampion.com',
    name: 'Mindful Champion Partnerships',
    emoji: '🤝',
  },
  SPONSORS: {
    email: process.env.EMAIL_FROM_SPONSORS || 'sponsors@mindfulchampion.com',
    name: 'Mindful Champion Sponsors',
    emoji: '🎯',
  },
  ADMIN: {
    email: process.env.EMAIL_FROM_ADMIN || 'admin@mindfulchampion.com',
    name: 'Mindful Champion Admin',
    emoji: '🛡️',
  },
} as const;

// Email types mapped to senders
export type EmailType = 
  | 'WELCOME'                // Welcome emails, general notifications
  | 'COACH_KAI'              // Coach Kai specific emails
  | 'SUPPORT'                // Support inquiries, help
  | 'PARTNERSHIP'            // Partner communications
  | 'SPONSORSHIP'            // Sponsor applications/communications
  | 'ADMIN'                  // Admin/billing emails
  | 'CUSTOM';                // Custom sender

// Get sender configuration based on email type
export function getSenderConfig(type: EmailType = 'WELCOME') {
  switch (type) {
    case 'WELCOME':
      return EMAIL_SENDERS.WELCOME;
    case 'COACH_KAI':
      return EMAIL_SENDERS.COACH_KAI;
    case 'SUPPORT':
      return EMAIL_SENDERS.SUPPORT;
    case 'PARTNERSHIP':
      return EMAIL_SENDERS.PARTNERS;
    case 'SPONSORSHIP':
      return EMAIL_SENDERS.SPONSORS;
    case 'ADMIN':
      return EMAIL_SENDERS.ADMIN;
    default:
      return EMAIL_SENDERS.WELCOME;
  }
}

// Transporter cache
let transporter: Transporter | null = null;

/**
 * Get or create Gmail transporter
 */
export function getGmailTransporter(): Transporter {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.warn('⚠️ Gmail credentials not configured. Using mock transporter.');
      
      // Return mock transporter for development
      return {
        sendMail: async (mailOptions: any) => {
          console.log('📧 [MOCK EMAIL]', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
          });
          return { messageId: `mock_${Date.now()}`, accepted: [mailOptions.to] };
        },
        verify: () => Promise.resolve(true),
      } as any;
    }

    // Create Gmail transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      // Connection pool for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Gmail connection failed:', error.message);
      } else {
        console.log('✅ Gmail SMTP ready to send emails');
      }
    });
  }

  return transporter;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  type?: EmailType;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  accepted?: string[];
  rejected?: string[];
}

/**
 * Send email via Gmail
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const {
      to,
      subject,
      html,
      text,
      type = 'WELCOME',
      replyTo,
      cc,
      bcc,
      attachments,
    } = options;

    // Get sender configuration
    const sender = getSenderConfig(type);
    const fromAddress = `"${sender.name} ${sender.emoji}" <${sender.email}>`;

    console.log(`📧 Sending email via Gmail (${type}):`, {
      from: sender.email,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
    });

    // Get transporter
    const gmailTransporter = getGmailTransporter();

    // Send email
    const info = await gmailTransporter.sendMail({
      from: fromAddress,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      subject,
      text: text || '',
      html,
      replyTo: replyTo || sender.email,
      attachments,
    });

    console.log(`✅ Email sent successfully`);
    console.log(`📬 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted as string[],
      rejected: info.rejected as string[],
    };
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send welcome email (default type)
 */
export async function sendWelcomeEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'WELCOME' });
}

/**
 * Send Coach Kai email
 */
export async function sendCoachKaiEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'COACH_KAI' });
}

/**
 * Send support email
 */
export async function sendSupportEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'SUPPORT' });
}

/**
 * Send partnership email
 */
export async function sendPartnershipEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'PARTNERSHIP' });
}

/**
 * Send sponsorship email
 */
export async function sendSponsorshipEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'SPONSORSHIP' });
}

/**
 * Send admin/billing email
 */
export async function sendAdminEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({ to, subject, html, text, type: 'ADMIN' });
}

/**
 * Verify Gmail connection
 */
export async function verifyGmailConnection(): Promise<boolean> {
  try {
    const gmailTransporter = getGmailTransporter();
    await gmailTransporter.verify();
    console.log('✅ Gmail connection verified');
    return true;
  } catch (error: any) {
    console.error('❌ Gmail connection verification failed:', error.message);
    return false;
  }
}

/**
 * Close Gmail transporter (call when app shuts down)
 */
export function closeGmailTransporter(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log('✅ Gmail transporter closed');
  }
}
