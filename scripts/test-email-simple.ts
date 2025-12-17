/**
 * Simple Email System Test Script
 * Tests email sending without database dependencies
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { getResendClient } from '../lib/email/resend-client';
import { sendWelcomeEmail, sendEmail } from '../lib/email';

async function testEmailSystem() {
  console.log('\n🔍 Starting Email System Test\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check environment variables
  console.log('\n📋 TEST 1: Environment Variables');
  console.log('-'.repeat(60));
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('GMAIL_USER:', process.env.GMAIL_USER || 'Not set');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  
  const testEmail = process.env.GMAIL_USER || 'Dean@mindfulchampion.com';
  
  // Test 2: Resend Client Initialization
  console.log('\n🔌 TEST 2: Resend Client Initialization');
  console.log('-'.repeat(60));
  try {
    const resendClient = getResendClient();
    console.log('✅ Resend client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Resend client:', error);
  }
  
  // Test 3: Send test email via Nodemailer (Gmail)
  console.log('\n📧 TEST 3: Nodemailer (Gmail) Test');
  console.log('-'.repeat(60));
  
  try {
    console.log(`Sending test email to ${testEmail}...`);
    const result = await sendEmail({
      to: testEmail,
      subject: '🧪 Email System Test - Nodemailer',
      text: 'This is a test email sent via Nodemailer to verify the email system is working.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
          <h2 style="color: #10b981;">✅ Email System Test</h2>
          <p>This is a test email sent via <strong>Nodemailer with Gmail</strong>.</p>
          <p>If you're reading this, the email system is <span style="color: #10b981; font-weight: bold;">working correctly</span>!</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          <p style="color: #666; font-size: 12px;">From: Mindful Champion Email Test System</p>
        </div>
      `
    });
    
    if (result.success) {
      console.log('✅ Nodemailer test email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Failed to send Nodemailer test email:', result.error);
    }
  } catch (error) {
    console.error('❌ Nodemailer test failed:', error);
  }
  
  // Test 4: Send welcome email via Nodemailer
  console.log('\n🏓 TEST 4: Welcome Email (Nodemailer)');
  console.log('-'.repeat(60));
  try {
    console.log(`Sending welcome email to ${testEmail}...`);
    const result = await sendWelcomeEmail({
      to: testEmail,
      name: 'Test User',
      firstName: 'Test'
    });
    
    if (result.success) {
      console.log('✅ Welcome email sent successfully via Nodemailer!');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Failed to send welcome email:', result.error);
    }
  } catch (error) {
    console.error('❌ Welcome email test failed:', error);
  }
  
  // Test 5: Send test email via Resend
  console.log('\n📨 TEST 5: Resend API Test');
  console.log('-'.repeat(60));
  
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
    try {
      const resendClient = getResendClient();
      console.log(`Sending test email via Resend to ${testEmail}...`);
      
      const result = await resendClient.emails.send({
        from: `Mindful Champion <${process.env.EMAIL_FROM || 'Dean@mindfulchampion.com'}>`,
        to: [testEmail],
        subject: '🧪 Email System Test - Resend API',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <h2 style="color: #f59e0b;">✅ Email System Test</h2>
            <p>This is a test email sent via <strong>Resend API</strong>.</p>
            <p>If you're reading this, the Resend integration is <span style="color: #f59e0b; font-weight: bold;">working correctly</span>!</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
            <p style="color: #666; font-size: 12px;">From: Mindful Champion Email Test System (Resend)</p>
          </div>
        `,
        text: 'This is a test email sent via Resend API to verify the email system is working.'
      });
      
      if (result.error) {
        console.error('❌ Resend test email failed:', result.error);
      } else {
        console.log('✅ Resend test email sent successfully!');
        console.log(`   Email ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error('❌ Resend test failed:', error);
    }
  } else {
    console.log('⚠️  Resend API key not configured, skipping Resend test');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('\n✅ Email system testing completed!');
  console.log('\n📬 Check your inbox at:', testEmail);
  console.log('   You should receive 2-3 test emails.');
  console.log('\n💡 If you don\'t receive emails:');
  console.log('   1. Check spam/junk folders');
  console.log('   2. Verify email credentials in .env file');
  console.log('   3. Check console output for errors above');
  console.log('\n');
}

// Run the tests
testEmailSystem()
  .then(() => {
    console.log('✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
