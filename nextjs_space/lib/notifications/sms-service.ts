// @ts-nocheck
/**
 * SMS Service - Twilio Integration
 * Handles all SMS notifications for Mindful Champion
 */

import fs from 'fs';
import path from 'path';

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get Twilio configuration from secrets file
 */
export function getTwilioConfig(): SMSConfig | null {
  try {
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    if (!fs.existsSync(secretsPath)) {
      console.error('Twilio secrets file not found');
      return null;
    }
    
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
    const twilio = secrets.twilio?.secrets;
    
    if (!twilio?.account_sid?.value || !twilio?.auth_token?.value || !twilio?.phone_number?.value) {
      console.error('Twilio credentials incomplete');
      return null;
    }
    
    return {
      accountSid: twilio.account_sid.value,
      authToken: twilio.auth_token.value,
      phoneNumber: twilio.phone_number.value
    };
  } catch (error) {
    console.error('Failed to load Twilio config:', error);
    return null;
  }
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, it's already US format
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If already has + sign, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Otherwise, add + prefix
  return `+${digits}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // E.164 format: + followed by 10-15 digits
  return /^\+[1-9]\d{9,14}$/.test(formatted);
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const config = getTwilioConfig();
  
  if (!config) {
    return { success: false, error: 'Twilio not configured' };
  }
  
  if (!isValidPhoneNumber(to)) {
    return { success: false, error: 'Invalid phone number format' };
  }
  
  const formattedTo = formatPhoneNumber(to);
  
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: config.phoneNumber,
        Body: message
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`SMS sent successfully to ${formattedTo}, SID: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } else {
      console.error('Twilio API error:', data);
      return { success: false, error: data.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send goal reminder SMS
 */
export async function sendGoalReminderSMS(
  to: string,
  goalTitle: string,
  message?: string
): Promise<SMSResult> {
  const smsBody = message || 
    `🏸 Mindful Champion: Time to work on "${goalTitle}"! Stay focused and keep improving. You've got this!`;
  
  return sendSMS(to, smsBody);
}

/**
 * Send practice reminder SMS
 */
export async function sendPracticeReminderSMS(
  to: string,
  drillName?: string
): Promise<SMSResult> {
  const message = drillName
    ? `🏸 Mindful Champion: Ready for your "${drillName}" practice? Let's make progress today!`
    : `🏸 Mindful Champion: Time for your daily pickleball practice! Every rep counts.`;
  
  return sendSMS(to, message);
}

/**
 * Send achievement notification SMS
 */
export async function sendAchievementSMS(
  to: string,
  achievementTitle: string,
  description?: string
): Promise<SMSResult> {
  const message = `🏆 Mindful Champion: You earned "${achievementTitle}"! ${description || 'Keep up the great work!'}`;
  
  return sendSMS(to, message);
}

/**
 * Send daily motivation SMS
 */
export async function sendDailyMotivationSMS(
  to: string,
  motivationalQuote: string
): Promise<SMSResult> {
  const message = `☀️ Mindful Champion Daily Inspiration:\n\n"${motivationalQuote}"\n\nHave a great day on the court!`;
  
  return sendSMS(to, message);
}

/**
 * Send verification code SMS
 */
export async function sendVerificationCodeSMS(
  to: string,
  code: string
): Promise<SMSResult> {
  const message = `Your Mindful Champion verification code is: ${code}\n\nThis code expires in 10 minutes.`;
  
  return sendSMS(to, message);
}
