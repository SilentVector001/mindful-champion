import twilio from 'twilio';
import crypto from 'crypto';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Rate limiting maps
const smsRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_SMS_PER_HOUR = 5;
const SMS_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Verification code cache (in-memory for demo, use Redis in production)
const verificationCodeCache = new Map<string, { code: string; expiresAt: number; attempts: number }>();

let twilioClient: twilio.Twilio | null = null;

function getTwilioClient() {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.warn('Twilio credentials not configured. SMS functionality will be disabled.');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 1 (US/Canada), keep it
  // Otherwise, add +1 prefix for US numbers
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // For international numbers, ensure + prefix
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Check if SMS rate limit is exceeded for a phone number
 */
function checkSMSRateLimit(phoneNumber: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = smsRateLimitMap.get(phoneNumber);
  
  if (!record || now > record.resetTime) {
    smsRateLimitMap.set(phoneNumber, { count: 1, resetTime: now + SMS_RATE_LIMIT_WINDOW });
    return { allowed: true, remainingAttempts: MAX_SMS_PER_HOUR - 1 };
  }
  
  if (record.count >= MAX_SMS_PER_HOUR) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  record.count++;
  return { allowed: true, remainingAttempts: MAX_SMS_PER_HOUR - record.count };
}

/**
 * Send SMS message
 */
export async function sendSMS(
  to: string, 
  message: string,
  options?: { skipRateLimit?: boolean }
): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      return { success: false, error: 'Twilio client not initialized' };
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(to);

    // Check rate limit
    if (!options?.skipRateLimit) {
      const rateLimit = checkSMSRateLimit(normalizedPhone);
      if (!rateLimit.allowed) {
        return { 
          success: false, 
          error: `Rate limit exceeded. Try again in 1 hour. (${rateLimit.remainingAttempts} remaining)` 
        };
      }
    }

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: normalizedPhone,
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    
    // Parse Twilio error codes
    if (error.code === 21211) {
      return { success: false, error: 'Invalid phone number format' };
    } else if (error.code === 21614) {
      return { success: false, error: 'Phone number is not verified. In trial mode, only verified numbers can receive SMS.' };
    } else if (error.code === 21408) {
      return { success: false, error: 'Permission denied. Cannot send SMS to this number.' };
    }
    
    return { success: false, error: error.message || 'Failed to send SMS' };
  }
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure random code using crypto
 */
export function generateSecureCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    code += digits[bytes[i] % digits.length];
  }
  
  return code;
}

/**
 * Store verification code in cache
 */
export function storeVerificationCode(
  phoneNumber: string, 
  code: string, 
  expiryMinutes: number = 10
): void {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);
  
  verificationCodeCache.set(normalizedPhone, {
    code,
    expiresAt,
    attempts: 0
  });
}

/**
 * Verify a code against stored verification code
 */
export function verifyCode(
  phoneNumber: string, 
  code: string
): { valid: boolean; error?: string } {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const cached = verificationCodeCache.get(normalizedPhone);
  
  if (!cached) {
    return { valid: false, error: 'No verification code found. Please request a new code.' };
  }
  
  if (Date.now() > cached.expiresAt) {
    verificationCodeCache.delete(normalizedPhone);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }
  
  if (cached.attempts >= 3) {
    verificationCodeCache.delete(normalizedPhone);
    return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
  }
  
  cached.attempts++;
  
  if (cached.code !== code) {
    return { valid: false, error: 'Invalid verification code.' };
  }
  
  // Code is valid, remove from cache
  verificationCodeCache.delete(normalizedPhone);
  return { valid: true };
}

/**
 * Send generic verification code
 */
export async function sendVerificationCode(
  phoneNumber: string, 
  code: string, 
  purpose: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Your Mindful Champion verification code for ${purpose} is: ${code}. This code expires in 10 minutes. Never share this code with anyone.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send password reset SMS
 */
export async function sendPasswordResetSMS(
  phoneNumber: string, 
  code: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Your Mindful Champion password reset code is: ${code}. This code expires in 10 minutes. If you didn't request this, please ignore this message.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send 2FA code
 */
export async function send2FACode(
  phoneNumber: string, 
  code: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Your Mindful Champion 2FA code is: ${code}. This code expires in 10 minutes. Never share this code with anyone.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send phone verification code
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string, 
  code: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Welcome to Mindful Champion! Your phone verification code is: ${code}. This code expires in 10 minutes.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send admin notification SMS (for admin-initiated actions)
 */
export async function sendAdminNotificationSMS(
  phoneNumber: string, 
  message: string
): Promise<{ success: boolean; error?: string }> {
  return sendSMS(phoneNumber, message, { skipRateLimit: true });
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}

/**
 * Get Twilio configuration status
 */
export function getTwilioStatus(): {
  configured: boolean;
  accountSid?: string;
  phoneNumber?: string;
} {
  return {
    configured: isTwilioConfigured(),
    accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : undefined,
    phoneNumber: twilioPhoneNumber,
  };
}

/**
 * Format phone number for display (e.g., +1 (954) 234-8040)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phoneNumber;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US/Canada number (10 or 11 digits with optional +1)
  if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
    return true;
  }
  
  // For international numbers, require at least 10 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Clear expired verification codes (call periodically)
 */
export function clearExpiredCodes(): void {
  const now = Date.now();
  for (const [phone, data] of verificationCodeCache.entries()) {
    if (now > data.expiresAt) {
      verificationCodeCache.delete(phone);
    }
  }
}

// Clear expired codes every 5 minutes
if (typeof window === 'undefined') {
  setInterval(clearExpiredCodes, 5 * 60 * 1000);
}
