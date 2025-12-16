#!/usr/bin/env node

const nodemailer = require('nodemailer');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n📧 Testing Gmail SMTP Connection...\n');
console.log('=====================================\n');

// Check if credentials are set
const missingVars = [];
if (!process.env.GMAIL_USER) missingVars.push('GMAIL_USER');
if (!process.env.GMAIL_APP_PASSWORD) missingVars.push('GMAIL_APP_PASSWORD');

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease check your .env file\n');
  process.exit(1);
}

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

console.log('Configuration:');
console.log(`   Gmail User: ${GMAIL_USER}`);
console.log(`   App Password: ${'*'.repeat(GMAIL_APP_PASSWORD.length)}`);
console.log();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

async function testGmailConnection() {
  try {
    // Test 1: Verify connection
    console.log('🔹 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('   ✅ SMTP connection verified\n');

    // Test 2: Send test email (to self)
    console.log('🔹 Step 2: Sending test email...');
    const testEmail = {
      from: `"Mindful Champion" <${GMAIL_USER}>`,
      to: GMAIL_USER, // Send to self for testing
      subject: `Test Email - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #14b8a6;">Gmail Connection Test Successful!</h2>
          <p>This is a test email from your Mindful Champion application.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>From: ${GMAIL_USER}</li>
            <li>Service: Gmail SMTP</li>
            <li>Status: ✅ Working</li>
          </ul>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p><em>If you received this email, your Gmail credentials are configured correctly!</em></p>
        </div>
      `,
      text: `
Gmail Connection Test Successful!

This is a test email from your Mindful Champion application.

Test Details:
- Timestamp: ${new Date().toISOString()}
- From: ${GMAIL_USER}
- Service: Gmail SMTP
- Status: ✅ Working

If you received this email, your Gmail credentials are configured correctly!
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log(`   ✅ Test email sent successfully`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check inbox: ${GMAIL_USER}\n`);

    // Success!
    console.log('=====================================');
    console.log('\n🎉 Gmail SMTP Connection Test: PASSED\n');
    console.log('✅ Your Gmail credentials are working correctly!');
    console.log('✅ Email notifications will work in production');
    console.log(`\n📨 A test email has been sent to: ${GMAIL_USER}`);
    console.log('   Please check your inbox (it may take a few minutes)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Gmail SMTP Connection Test: FAILED\n');
    console.error('Error details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error();
    
    if (error.code === 'EAUTH') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that your Gmail app password is correct');
      console.error('   - Make sure 2-Factor Authentication is enabled');
      console.error('   - Verify the app password has no spaces');
      console.error('   - Try generating a new app password');
      console.error('   - Link: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check your internet connection');
      console.error('   - Verify firewall is not blocking port 465/587');
      console.error('   - Try again in a few minutes');
    }
    
    console.error();
    process.exit(1);
  }
}

testGmailConnection();
