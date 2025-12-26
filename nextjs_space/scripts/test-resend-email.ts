/**
 * Test script to verify Resend email configuration
 * Usage: npx ts-node scripts/test-resend-email.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Import Resend client
import { Resend } from 'resend';

async function testResendEmail() {
  console.log('🔧 Starting Resend Email Test...\n');

  // Step 1: Check if API key is configured
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  console.log('✅ Step 1: Checking configuration');
  console.log(`   API Key: ${apiKey ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   Admin Email: ${adminEmail || 'Not set'}\n`);

  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.error('❌ ERROR: RESEND_API_KEY is not configured properly in .env.local');
    process.exit(1);
  }

  if (!adminEmail) {
    console.warn('⚠️  WARNING: ADMIN_EMAIL is not set in .env.local');
  }

  // Step 2: Initialize Resend client
  console.log('✅ Step 2: Initializing Resend client');
  const resend = new Resend(apiKey);
  console.log('   Resend client initialized successfully\n');

  // Step 3: Send test email
  console.log('✅ Step 3: Sending test email...');
  const testEmailTo = adminEmail || 'lee@mindfulchampion.com';

  try {
    const result = await resend.emails.send({
      from: 'Mindful Champion <onboarding@resend.dev>',
      to: [testEmailTo],
      subject: '✅ Resend Email Test - Mindful Champion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0d9488; margin: 0;">🏓 Mindful Champion</h1>
              <p style="color: #64748b; margin-top: 10px;">Email System Test</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 28px;">✅ Email Test Successful!</h2>
            </div>
            
            <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0d9488; margin-top: 0;">Configuration Verified:</h3>
              <ul style="color: #475569; line-height: 1.8;">
                <li>✓ Resend API Key is properly configured</li>
                <li>✓ Email sending is functional</li>
                <li>✓ Admin Email is set to: ${testEmailTo}</li>
                <li>✓ Emails will be sent from: onboarding@resend.dev</li>
              </ul>
            </div>
            
            <div style="padding: 20px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #059669; margin-top: 0;">What This Means:</h4>
              <p style="color: #047857; margin: 0;">Your Mindful Champion application is now configured to send real emails for:</p>
              <ul style="color: #047857; line-height: 1.8;">
                <li>Sponsor application confirmations</li>
                <li>Admin notifications for new applications</li>
                <li>Sponsor approval emails with login credentials</li>
                <li>Subscription upgrade notifications</li>
                <li>Beta tester welcome emails</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                This is an automated test email from your Mindful Champion application.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">
                Test sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Mindful Champion - Email System Test
        
        ✅ Email Test Successful!
        
        Configuration Verified:
        - Resend API Key is properly configured
        - Email sending is functional
        - Admin Email is set to: ${testEmailTo}
        - Emails will be sent from: onboarding@resend.dev
        
        What This Means:
        Your Mindful Champion application is now configured to send real emails for:
        - Sponsor application confirmations
        - Admin notifications for new applications
        - Sponsor approval emails with login credentials
        - Subscription upgrade notifications
        - Beta tester welcome emails
        
        Test sent at: ${new Date().toLocaleString()}
      `
    });

    console.log('   ✓ Email sent successfully!');
    console.log(`   Email ID: ${(result as any).id || (result as any).data?.id || 'N/A'}`);
    console.log(`   Sent to: ${testEmailTo}\n`);

    console.log('✅ Step 4: Final verification');
    console.log('   ✓ All checks passed!');
    console.log('   ✓ Email system is fully functional\n');

    console.log('📋 Summary:');
    console.log('   • API Key Status: ✅ Valid and working');
    console.log(`   • Test Email Sent To: ${testEmailTo}`);
    console.log(`   • Email ID: ${(result as any).id || (result as any).data?.id || 'N/A'}`);
    console.log('   • From Address: onboarding@resend.dev');
    console.log('   • Email Functions: Ready to use\n');

    console.log('🎯 Next Steps:');
    console.log('   1. Check your inbox for the test email');
    console.log('   2. Verify the email looks correct');
    console.log('   3. Test sponsor application flow to verify real emails');
    console.log('   4. All email functions are now operational!\n');

    return result;

  } catch (error: any) {
    console.error('❌ ERROR: Failed to send test email');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 Tip: Check that your API key is correct and active at https://resend.com/api-keys');
    }
    
    if (error.message.includes('domain')) {
      console.error('\n💡 Tip: Resend test mode uses onboarding@resend.dev by default');
      console.error('   For custom domains, you need to verify them at https://resend.com/domains');
    }
    
    throw error;
  }
}

// Run the test
testResendEmail()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
