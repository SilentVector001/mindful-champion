/**
 * Test Email Delivery Script
 * 
 * This script tests the email delivery system by sending test emails
 * and checking the Resend API key configuration.
 * 
 * Usage: npm run ts-node scripts/test-email-delivery.ts
 */

import { getResendClient } from '../lib/email/resend-client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testEmailDelivery() {
  console.log('🔍 Testing Email Delivery System...\n');
  
  // Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is NOT SET in environment');
    console.log('\n💡 To fix:');
    console.log('   1. Add RESEND_API_KEY to .env.local (local dev)');
    console.log('   2. Add RESEND_API_KEY to Vercel env vars (production)');
    console.log('   3. Get API key from: https://resend.com/api-keys\n');
    return;
  }
  
  if (apiKey === 'your_resend_api_key_here') {
    console.error('❌ RESEND_API_KEY is set to placeholder value');
    console.log('\n💡 To fix:');
    console.log('   1. Get real API key from: https://resend.com/api-keys');
    console.log('   2. Replace placeholder in .env.local\n');
    return;
  }
  
  if (!apiKey.startsWith('re_')) {
    console.error('❌ RESEND_API_KEY appears invalid (should start with "re_")');
    console.log(`   Current value starts with: ${apiKey.substring(0, 5)}...`);
    console.log('\n💡 To fix:');
    console.log('   1. Verify API key in Resend dashboard');
    console.log('   2. Generate new key if needed\n');
    return;
  }
  
  console.log(`✅ RESEND_API_KEY is set (${apiKey.substring(0, 7)}...)`);
  
  // Check domain configuration
  console.log('\n2️⃣ Checking Email Domain Configuration:');
  console.log('⚠️  Current domains in code:');
  console.log('   - Sponsor approval: onboarding@resend.dev (SANDBOX)');
  console.log('   - Admin notification: partnerships@resend.dev (SANDBOX)');
  console.log('\n💡 Sandbox domains only send to verified emails in Resend dashboard');
  console.log('   For production, verify a custom domain at: https://resend.com/domains\n');
  
  // Test Resend client initialization
  console.log('3️⃣ Testing Resend Client Initialization:');
  try {
    const resend = getResendClient();
    console.log('✅ Resend client initialized successfully\n');
    
    // Attempt to send a test email
    console.log('4️⃣ Sending Test Email:');
    const testEmail = process.env.TEST_EMAIL_ADDRESS || 'test@example.com';
    
    console.log(`   Sending to: ${testEmail}`);
    console.log('   From: Mindful Champion <onboarding@resend.dev>');
    
    const result = await resend.emails.send({
      from: 'Mindful Champion <onboarding@resend.dev>',
      to: testEmail,
      subject: '✅ Test Email - Mindful Champion Email System',
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); border-radius: 16px;">
          <div style="background: white; padding: 40px; border-radius: 12px;">
            <h1 style="color: #0d9488; margin: 0 0 20px 0;">✅ Email System Test</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              If you're reading this, your Mindful Champion email system is working correctly!
            </p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Sent at: ${new Date().toISOString()}<br>
              Environment: ${process.env.NODE_ENV || 'development'}<br>
              API Key: ${apiKey.substring(0, 7)}...
            </p>
          </div>
        </div>
      `,
      text: `
        ✅ Email System Test
        
        If you're reading this, your Mindful Champion email system is working correctly!
        
        Sent at: ${new Date().toISOString()}
        Environment: ${process.env.NODE_ENV || 'development'}
      `,
    });
    
    if (result.error) {
      console.error('❌ Email send failed:', result.error);
      console.log('\n💡 Common causes:');
      console.log('   1. Invalid API key');
      console.log('   2. Domain not verified (sandbox limitation)');
      console.log('   3. Recipient email not verified in sandbox mode');
      console.log('   4. Rate limits exceeded');
      console.log('\n📝 Check Resend dashboard: https://resend.com/emails\n');
    } else {
      console.log('✅ Email sent successfully!');
      console.log(`   Email ID: ${result.data?.id}`);
      console.log(`\n📧 Check your inbox: ${testEmail}`);
      console.log('📊 View in Resend dashboard: https://resend.com/emails\n');
    }
  } catch (error: any) {
    console.error('❌ Error during email test:', error.message);
    console.log('\n💡 To troubleshoot:');
    console.log('   1. Verify RESEND_API_KEY is correct');
    console.log('   2. Check Resend dashboard for errors');
    console.log('   3. Ensure domain is verified (if using custom domain)');
    console.log('   4. Check network connectivity\n');
  }
  
  console.log('='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log('\nTo use email system in production:');
  console.log('1. ✅ Set RESEND_API_KEY in Vercel environment variables');
  console.log('2. ⚠️  Verify custom domain in Resend dashboard');
  console.log('3. ⚠️  Update email code to use verified domain');
  console.log('4. ✅ Test email delivery');
  console.log('\nFor sandbox testing:');
  console.log('• Add recipient emails to Resend sandbox approved list');
  console.log('• Or verify a custom domain for unrestricted sending\n');
}

testEmailDelivery().catch(console.error);
