/**
 * Gmail Integration Test Script
 * Tests all email sender configurations and delivery
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import {
  sendEmail,
  sendNotificationEmail,
  sendSupportEmail,
  sendPartnershipEmail,
  sendSponsorshipEmail,
  verifyGmailConnection,
  getSenderConfig,
  EMAIL_SENDERS,
} from '../lib/email/gmail-service';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

async function testGmailConfiguration() {
  section('📧 Gmail Configuration Test');

  // Check environment variables
  log('Checking environment variables...', colors.yellow);
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const supportEmail = process.env.SUPPORT_EMAIL;
  const partnersEmail = process.env.PARTNERS_EMAIL;
  const sponsorsEmail = process.env.SPONSORS_EMAIL;

  if (!gmailUser || !gmailPassword) {
    log('❌ Gmail credentials not configured!', colors.red);
    log('Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env', colors.red);
    return false;
  }

  log(`✅ GMAIL_USER: ${gmailUser}`, colors.green);
  log(`✅ GMAIL_APP_PASSWORD: ${'*'.repeat(16)}`, colors.green);
  log(`✅ NOTIFICATION_EMAIL: ${notificationEmail || 'Using default'}`, colors.green);
  log(`✅ SUPPORT_EMAIL: ${supportEmail || 'Using default'}`, colors.green);
  log(`✅ PARTNERS_EMAIL: ${partnersEmail || 'Using default'}`, colors.green);
  log(`✅ SPONSORS_EMAIL: ${sponsorsEmail || 'Using default'}`, colors.green);

  return true;
}

async function testGmailConnection() {
  section('🔌 Gmail Connection Test');

  log('Verifying Gmail SMTP connection...', colors.yellow);
  
  const isConnected = await verifyGmailConnection();
  
  if (isConnected) {
    log('✅ Gmail connection successful!', colors.green);
    return true;
  } else {
    log('❌ Gmail connection failed!', colors.red);
    return false;
  }
}

async function testSenderConfigurations() {
  section('👤 Sender Configuration Test');

  const senderTypes = ['NOTIFICATION', 'SUPPORT', 'PARTNERSHIP', 'SPONSORSHIP'] as const;

  for (const type of senderTypes) {
    const config = getSenderConfig(type);
    log(`\n${type}:`, colors.bright);
    log(`  Email: ${config.email}`, colors.cyan);
    log(`  Name: ${config.name}`, colors.cyan);
    log(`  Emoji: ${config.emoji}`, colors.cyan);
  }

  return true;
}

async function sendTestEmails(testEmail: string) {
  section('📤 Sending Test Emails');

  log(`Test recipient: ${testEmail}\n`, colors.yellow);

  // Test 1: Notification Email
  log('1️⃣ Testing NOTIFICATION email...', colors.bright);
  const notificationResult = await sendNotificationEmail(
    testEmail,
    '🏆 Test Notification Email',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14b8a6;">🏆 Test Notification Email</h2>
      <p>This is a test notification email from Coach Kai - Mindful Champion.</p>
      <p>If you received this, your notification email configuration is working correctly!</p>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sender:</strong> ${EMAIL_SENDERS.NOTIFICATION.name}</p>
        <p><strong>Email:</strong> ${EMAIL_SENDERS.NOTIFICATION.email}</p>
      </div>
    </div>
    `
  );

  if (notificationResult.success) {
    log(`✅ Notification email sent! Message ID: ${notificationResult.messageId}`, colors.green);
  } else {
    log(`❌ Notification email failed: ${notificationResult.error}`, colors.red);
  }

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

  // Test 2: Support Email
  log('\n2️⃣ Testing SUPPORT email...', colors.bright);
  const supportResult = await sendSupportEmail(
    testEmail,
    '💬 Test Support Email',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">💬 Test Support Email</h2>
      <p>This is a test support email from Mindful Champion Support.</p>
      <p>If you received this, your support email configuration is working correctly!</p>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sender:</strong> ${EMAIL_SENDERS.SUPPORT.name}</p>
        <p><strong>Email:</strong> ${EMAIL_SENDERS.SUPPORT.email}</p>
      </div>
    </div>
    `
  );

  if (supportResult.success) {
    log(`✅ Support email sent! Message ID: ${supportResult.messageId}`, colors.green);
  } else {
    log(`❌ Support email failed: ${supportResult.error}`, colors.red);
  }

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

  // Test 3: Partnership Email
  log('\n3️⃣ Testing PARTNERSHIP email...', colors.bright);
  const partnershipResult = await sendPartnershipEmail(
    testEmail,
    '🤝 Test Partnership Email',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">🤝 Test Partnership Email</h2>
      <p>This is a test partnership email from Mindful Champion Partnerships.</p>
      <p>If you received this, your partnership email configuration is working correctly!</p>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sender:</strong> ${EMAIL_SENDERS.PARTNERS.name}</p>
        <p><strong>Email:</strong> ${EMAIL_SENDERS.PARTNERS.email}</p>
      </div>
    </div>
    `
  );

  if (partnershipResult.success) {
    log(`✅ Partnership email sent! Message ID: ${partnershipResult.messageId}`, colors.green);
  } else {
    log(`❌ Partnership email failed: ${partnershipResult.error}`, colors.red);
  }

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

  // Test 4: Sponsorship Email
  log('\n4️⃣ Testing SPONSORSHIP email...', colors.bright);
  const sponsorshipResult = await sendSponsorshipEmail(
    testEmail,
    '🎯 Test Sponsorship Email',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">🎯 Test Sponsorship Email</h2>
      <p>This is a test sponsorship email from Mindful Champion Sponsors.</p>
      <p>If you received this, your sponsorship email configuration is working correctly!</p>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sender:</strong> ${EMAIL_SENDERS.SPONSORS.name}</p>
        <p><strong>Email:</strong> ${EMAIL_SENDERS.SPONSORS.email}</p>
      </div>
    </div>
    `
  );

  if (sponsorshipResult.success) {
    log(`✅ Sponsorship email sent! Message ID: ${sponsorshipResult.messageId}`, colors.green);
  } else {
    log(`❌ Sponsorship email failed: ${sponsorshipResult.error}`, colors.red);
  }

  return {
    notification: notificationResult.success,
    support: supportResult.success,
    partnership: partnershipResult.success,
    sponsorship: sponsorshipResult.success,
  };
}

async function main() {
  console.clear();
  
  log('╔════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
  log('║        Gmail Integration Test - Mindful Champion         ║', colors.bright + colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);

  // Get test email from command line argument or use default
  const testEmail = process.argv[2] || process.env.GMAIL_USER || 'test@example.com';

  // Test 1: Configuration
  const configOk = await testGmailConfiguration();
  if (!configOk) {
    log('\n❌ Configuration test failed. Please check your .env file.', colors.red);
    process.exit(1);
  }

  // Test 2: Connection
  const connectionOk = await testGmailConnection();
  if (!connectionOk) {
    log('\n❌ Connection test failed. Please check your Gmail credentials.', colors.red);
    process.exit(1);
  }

  // Test 3: Sender Configurations
  await testSenderConfigurations();

  // Test 4: Send Test Emails
  const emailResults = await sendTestEmails(testEmail);

  // Summary
  section('📊 Test Summary');

  const allPassed = Object.values(emailResults).every(result => result);

  if (allPassed) {
    log('✅ All tests passed! Gmail integration is working correctly.', colors.green);
    log(`\n📬 Check your inbox at: ${testEmail}`, colors.cyan);
    log('   (Don\'t forget to check spam folder!)', colors.yellow);
  } else {
    log('❌ Some tests failed. Please review the errors above.', colors.red);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

// Run the test
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
