/**
 * Email Configuration for Mindful Champion
 * 
 * All email accounts and templates configuration for the application.
 * Uses Resend with mindfulchampion.com domain.
 */

export const EMAIL_CONFIG = {
  // Domain
  DOMAIN: 'mindfulchampion.com',
  
  // Email Accounts
  ACCOUNTS: {
    // System emails (sign ups, payments, rewards, notifications)
    NOREPLY: {
      email: 'noreply@mindfulchampion.com',
      name: 'Mindful Champion',
      formatted: 'Mindful Champion <noreply@mindfulchampion.com>',
      purpose: 'System emails: sign ups, payments, rewards, notifications',
    },
    
    // Partner and sponsor communications
    PARTNERS: {
      email: 'partners@mindfulchampion.com',
      name: 'Mindful Champion Partners',
      formatted: 'Mindful Champion Partners <partners@mindfulchampion.com>',
      purpose: 'Sponsor applications, partner requests, business inquiries',
    },
    
    // Administrative communications
    ADMIN: {
      email: 'dean@mindfulchampion.com',
      name: 'Dean - Mindful Champion',
      formatted: 'Dean - Mindful Champion <dean@mindfulchampion.com>',
      purpose: 'Administrative emails, support, personal communications',
    },
  },
  
  // Email Types mapped to accounts
  TYPE_TO_ACCOUNT: {
    // System emails use NOREPLY
    'SIGNUP': 'NOREPLY',
    'WELCOME': 'NOREPLY',
    'PAYMENT': 'NOREPLY',
    'PAYMENT_SUCCESS': 'NOREPLY',
    'REWARD': 'NOREPLY',
    'ACHIEVEMENT': 'NOREPLY',
    'NOTIFICATION': 'NOREPLY',
    'VIDEO_ANALYSIS_COMPLETE': 'NOREPLY',
    
    // Partner/sponsor emails use PARTNERS
    'SPONSOR_APPLICATION': 'PARTNERS',
    'SPONSOR_APPROVAL': 'PARTNERS',
    'SPONSOR_REJECTION': 'PARTNERS',
    'PARTNER_REQUEST': 'PARTNERS',
    'PARTNER_INVITATION': 'PARTNERS',
    
    // Admin emails use ADMIN
    'ADMIN_CUSTOM': 'ADMIN',
    'ADMIN_TEST': 'ADMIN',
    'ADMIN_NOTIFICATION': 'ADMIN',
    'SUPPORT': 'ADMIN',
    'WARNING': 'ADMIN',
  } as const,
};

/**
 * Get the from email address for a specific email type
 */
export function getFromEmail(emailType: string): string {
  const accountKey = EMAIL_CONFIG.TYPE_TO_ACCOUNT[emailType as keyof typeof EMAIL_CONFIG.TYPE_TO_ACCOUNT] || 'NOREPLY';
  const account = EMAIL_CONFIG.ACCOUNTS[accountKey as keyof typeof EMAIL_CONFIG.ACCOUNTS];
  return account.formatted;
}

/**
 * Get email account details
 */
export function getEmailAccount(accountKey: 'NOREPLY' | 'PARTNERS' | 'ADMIN') {
  return EMAIL_CONFIG.ACCOUNTS[accountKey];
}

/**
 * Email Templates
 */
export const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: '🏓 Welcome to Mindful Champion - Your Journey Begins!',
    account: 'NOREPLY',
  },
  PAYMENT_SUCCESS: {
    subject: '✅ Payment Confirmed - Mindful Champion Pro',
    account: 'NOREPLY',
  },
  REWARD_EARNED: {
    subject: '🎉 You Earned Rewards - Mindful Champion',
    account: 'NOREPLY',
  },
  SPONSOR_APPLICATION_RECEIVED: {
    subject: '🎉 Sponsor Application Received - Mindful Champion',
    account: 'PARTNERS',
  },
  SPONSOR_APPROVED: {
    subject: '✅ Sponsor Application Approved - Mindful Champion',
    account: 'PARTNERS',
  },
  PARTNER_REQUEST: {
    subject: '🤝 New Partner Request - Mindful Champion',
    account: 'PARTNERS',
  },
  ADMIN_TEST: {
    subject: '🧪 Test Email - Mindful Champion',
    account: 'ADMIN',
  },
};

/**
 * Domain setup status check
 * In production, you would check this via Resend API
 */
export async function checkDomainStatus() {
  // This is a placeholder - in production you would call Resend API
  return {
    domain: EMAIL_CONFIG.DOMAIN,
    verified: true, // Set to true once domain is verified in Resend
    dnsRecords: {
      spf: { configured: true },
      dkim: { configured: true },
      dmarc: { configured: true },
    },
    accounts: Object.entries(EMAIL_CONFIG.ACCOUNTS).map(([key, account]) => ({
      key,
      email: account.email,
      purpose: account.purpose,
      status: 'active',
    })),
  };
}
