/**
 * Comprehensive Email System Test Script
 * Tests all email sending configurations
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { getResendClient } from '../lib/email/resend-client';
import { sendWelcomeEmail, sendEmail } from '../lib/email';
import { MediaCenterEmailService } from '../lib/media-center/email-service';
import { prisma } from '../lib/db';

async function testEmailSystem() {
  console.log('\n🔍 Starting Comprehensive Email System Test\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check environment variables
  console.log('\n📋 TEST 1: Environment Variables');
  console.log('-'.repeat(60));
  const envVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
    GMAIL_USER: process.env.GMAIL_USER ? '✅ Set' : '❌ Missing',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing',
    EMAIL_FROM: process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing',
  };
  
  console.table(envVars);
  
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
  const testEmail = process.env.GMAIL_USER || 'Dean@mindfulchampion.com';
  
  try {
    console.log(`Sending test email to ${testEmail}...`);
    const result = await sendEmail({
      to: testEmail,
      subject: '🧪 Email System Test - Nodemailer',
      text: 'This is a test email sent via Nodemailer to verify the email system is working.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">✅ Email System Test</h2>
          <p>This is a test email sent via <strong>Nodemailer with Gmail</strong>.</p>
          <p>If you're reading this, the email system is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
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
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #10b981;">✅ Email System Test</h2>
            <p>This is a test email sent via <strong>Resend API</strong>.</p>
            <p>If you're reading this, the Resend integration is working correctly!</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
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
  
  // Test 6: MediaCenterEmailService (if user exists)
  console.log('\n🎯 TEST 6: MediaCenterEmailService Test');
  console.log('-'.repeat(60));
  try {
    // Find a test user
    const testUser = await prisma.user.findFirst({
      where: {
        email: testEmail
      }
    });
    
    if (testUser) {
      console.log(`Found test user: ${testUser.email}`);
      console.log('Sending welcome email via MediaCenterEmailService...');
      
      const result = await MediaCenterEmailService.sendWelcomeEmail(testUser.id);
      
      if (result) {
        console.log('✅ MediaCenterEmailService welcome email sent successfully!');
      } else {
        console.error('❌ Failed to send email via MediaCenterEmailService');
      }
    } else {
      console.log(`⚠️  No test user found with email ${testEmail}`);
      console.log('   Skipping MediaCenterEmailService test');
    }
  } catch (error) {
    console.error('❌ MediaCenterEmailService test failed:', error);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('\n✅ Email system testing completed!');
  console.log('\n📬 Check your inbox at:', testEmail);
  console.log('   You should receive 2-4 test emails depending on configuration.');
  console.log('\n💡 If you don\'t receive emails:');
  console.log('   1. Check spam/junk folders');
  console.log('   2. Verify email credentials in .env file');
  console.log('   3. Check console output for errors');
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
