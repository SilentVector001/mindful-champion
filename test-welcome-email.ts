// Test script for welcome email
// Run this with: npx tsx test-welcome-email.ts

import * as dotenv from 'dotenv';
dotenv.config();

import { sendTestWelcomeEmail } from './lib/email';

async function testEmail() {
  console.log('🧪 Testing welcome email system...\n');
  console.log('📋 Environment variables:');
  console.log(`GMAIL_USER: ${process.env.GMAIL_USER}`);
  console.log(`GMAIL_APP_PASSWORD length: ${process.env.GMAIL_APP_PASSWORD?.length || 0}`);
  console.log(`GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '***' + process.env.GMAIL_APP_PASSWORD.slice(-4) : 'NOT SET'}\n`);
  
  try {
    const result = await sendTestWelcomeEmail('deansnow59@gmail.com', 'Dean');
    
    if (result.success) {
      console.log('\n✅ TEST PASSED!');
      console.log(`📧 Welcome email successfully sent to deansnow59@gmail.com`);
      console.log(`📝 Message ID: ${result.messageId}`);
      console.log('\n👉 Please check your inbox at deansnow59@gmail.com');
      console.log('   (Don\'t forget to check spam folder if not in inbox)');
    } else {
      console.log('\n❌ TEST FAILED!');
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error);
  }
}

testEmail();
