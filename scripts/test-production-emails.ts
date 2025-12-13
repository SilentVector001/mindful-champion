#!/usr/bin/env ts-node

/**
 * Production Email System Testing Script
 * 
 * Tests all email types with production domain (@mindfulchampion.com)
 * 
 * Usage:
 *   npx ts-node scripts/test-production-emails.ts YOUR_TEST_EMAIL@example.com
 * 
 * This will send test emails to your specified email address to verify:
 * - Email delivery works
 * - Domain verification is complete
 * - All email templates render correctly
 * - No spam/deliverability issues
 */

import { getResendClient } from '../lib/email/resend-client';
import { EMAIL_CONFIG } from '../lib/email/config';

const TEST_EMAIL = process.argv[2] || 'test@example.com';

async function testProductionEmails() {
  console.log('🧪 Testing Production Email System');
  console.log('===================================\n');
  
  console.log('📧 Configuration:');
  console.log(`   Domain: ${EMAIL_CONFIG.DOMAIN}`);
  console.log(`   Test Email: ${TEST_EMAIL}\n`);
  
  console.log('📨 Email Accounts:');
  Object.entries(EMAIL_CONFIG.ACCOUNTS).forEach(([key, account]) => {
    console.log(`   ${key}: ${account.email}`);
  });
  console.log('\n');

  const resend = getResendClient();
  const results: { name: string; success: boolean; emailId?: string; error?: any }[] = [];

  // Test 1: Welcome Email (NOREPLY)
  console.log('1️⃣  Testing Welcome Email...');
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.ACCOUNTS.NOREPLY.formatted,
      to: TEST_EMAIL,
      subject: '🏓 Welcome to Mindful Champion - TEST EMAIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #0d9488; margin-bottom: 20px;">Welcome to Mindful Champion! 🎉</h1>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            This is a TEST email to verify that our welcome emails are working correctly with our production domain.
          </p>
          <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #0f172a; margin: 0 0 10px 0;">✅ Email System Status</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              <li>From: ${EMAIL_CONFIG.ACCOUNTS.NOREPLY.email}</li>
              <li>Domain: ${EMAIL_CONFIG.DOMAIN}</li>
              <li>Type: System/Notification Email</li>
              <li>Status: PRODUCTION</li>
            </ul>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If you received this email, congratulations! The email system is working perfectly. 🎊
          </p>
        </div>
      `,
      replyTo: EMAIL_CONFIG.ACCOUNTS.NOREPLY.email,
    });

    if (result.error) {
      throw result.error;
    }

    console.log('   ✅ Success! Email ID:', result.data?.id);
    results.push({ name: 'Welcome Email (NOREPLY)', success: true, emailId: result.data?.id });
  } catch (error) {
    console.log('   ❌ Failed:', error);
    results.push({ name: 'Welcome Email (NOREPLY)', success: false, error });
  }
  console.log('');

  // Test 2: Sponsor Application (PARTNERS)
  console.log('2️⃣  Testing Sponsor Application Email...');
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.ACCOUNTS.PARTNERS.formatted,
      to: TEST_EMAIL,
      subject: '🎉 Sponsor Application Received - TEST EMAIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #0891b2; margin-bottom: 20px;">Sponsor Application Received! 🤝</h1>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            This is a TEST email to verify that our sponsor/partner emails are working correctly with our production domain.
          </p>
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #0f172a; margin: 0 0 10px 0;">✅ Email System Status</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              <li>From: ${EMAIL_CONFIG.ACCOUNTS.PARTNERS.email}</li>
              <li>Domain: ${EMAIL_CONFIG.DOMAIN}</li>
              <li>Type: Partner/Sponsor Email</li>
              <li>Status: PRODUCTION</li>
            </ul>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Partner emails are configured and working! 🎯
          </p>
        </div>
      `,
      replyTo: EMAIL_CONFIG.ACCOUNTS.PARTNERS.email,
    });

    if (result.error) {
      throw result.error;
    }

    console.log('   ✅ Success! Email ID:', result.data?.id);
    results.push({ name: 'Sponsor Email (PARTNERS)', success: true, emailId: result.data?.id });
  } catch (error) {
    console.log('   ❌ Failed:', error);
    results.push({ name: 'Sponsor Email (PARTNERS)', success: false, error });
  }
  console.log('');

  // Test 3: Admin Email (ADMIN)
  console.log('3️⃣  Testing Admin Email...');
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.ACCOUNTS.ADMIN.formatted,
      to: TEST_EMAIL,
      subject: '🔔 Admin Notification - TEST EMAIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #7c3aed; margin-bottom: 20px;">Admin Notification 📊</h1>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            This is a TEST email to verify that our admin emails are working correctly with our production domain.
          </p>
          <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #0f172a; margin: 0 0 10px 0;">✅ Email System Status</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              <li>From: ${EMAIL_CONFIG.ACCOUNTS.ADMIN.email}</li>
              <li>Domain: ${EMAIL_CONFIG.DOMAIN}</li>
              <li>Type: Administrative Email</li>
              <li>Status: PRODUCTION</li>
            </ul>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Admin email system is operational! 🚀
          </p>
        </div>
      `,
      replyTo: EMAIL_CONFIG.ACCOUNTS.ADMIN.email,
    });

    if (result.error) {
      throw result.error;
    }

    console.log('   ✅ Success! Email ID:', result.data?.id);
    results.push({ name: 'Admin Email (ADMIN)', success: true, emailId: result.data?.id });
  } catch (error) {
    console.log('   ❌ Failed:', error);
    results.push({ name: 'Admin Email (ADMIN)', success: false, error });
  }
  console.log('');

  // Summary
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('========================\n');

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.emailId) {
      console.log(`   Email ID: ${result.emailId}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error.message || result.error}`);
    }
  });

  console.log('');
  console.log(`Total: ${successCount}/${totalCount} tests passed`);
  console.log('');

  if (successCount === totalCount) {
    console.log('🎉 All email tests passed!');
    console.log('');
    console.log('✅ Production email system is fully operational!');
    console.log('📧 Check your inbox:', TEST_EMAIL);
    console.log('📊 Monitor deliverability at: https://resend.com/emails');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('');
    console.log('Common issues:');
    console.log('  1. Domain not verified in Resend');
    console.log('  2. DNS records not fully propagated');
    console.log('  3. API key not configured');
    console.log('');
    console.log('💡 Run ./scripts/check-dns-status.sh to verify DNS');
  }
  
  console.log('');
  console.log('📝 Next Steps:');
  console.log('  1. Check your email inbox');
  console.log('  2. Verify emails are not in spam');
  console.log('  3. Check Resend dashboard for delivery status');
  console.log('  4. Monitor email logs for any issues');
  console.log('');
}

// Run the tests
testProductionEmails().catch(error => {
  console.error('❌ Fatal error running email tests:', error);
  process.exit(1);
});
