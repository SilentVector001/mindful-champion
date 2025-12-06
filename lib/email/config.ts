import { getResendClient } from './resend-client';

// Initialize Resend with API key from environment variable
export const resend = getResendClient();

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Mindful Champion <welcomefrommc@mindfulchampion.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'dean@mindfulchampion.com',
  // Enable/disable email notifications globally
  enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'false',
};

// Email templates
export const EMAIL_SUBJECTS = {
  VIDEO_ANALYSIS_COMPLETE: 'Your Pickleball Video Analysis is Ready! 🏓',
};

/**
 * Simple send email function for notifications
 * This is a wrapper around Resend's send method
 */
export async function sendEmail(params: {
  from: string
  to: string[]
  subject: string
  html: string
  replyTo?: string
}) {
  if (!EMAIL_CONFIG.enabled) {
    console.log('Email notifications disabled, skipping email');
    return { success: true, id: 'disabled' };
  }

  try {
    const result = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo
    });

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
