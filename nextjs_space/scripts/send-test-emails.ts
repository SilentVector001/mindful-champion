import { getResendClient } from '../lib/email/resend-client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function sendTestEmails() {
  console.log('🚀 Starting test email sending process...\n');
  
  const resend = getResendClient();
  const fromEmail = 'Mindful Champion <noreply@mindfulchampion.com>';
  
  const testEmails = [
    {
      to: 'lee@onesoulpickleball.com',
      name: 'Lee'
    },
    {
      to: 'Deansnow59@gmail.com',
      name: 'Dean'
    }
  ];
  
  const results = [];
  
  for (const recipient of testEmails) {
    try {
      console.log(`📧 Sending test email to ${recipient.to}...`);
      
      const result: any = await resend.emails.send({
        from: fromEmail,
        to: recipient.to,
        subject: '🏓 Test Email from Mindful Champion - Email System Working!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🏓 Mindful Champion</h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 16px;">Email System Test</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px;">Hi ${recipient.name}! 👋</h2>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                This is a <strong>test email</strong> to confirm that the Mindful Champion email system is working perfectly!
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%); border-left: 4px solid #0d9488; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.6;">
                  ✅ <strong>Email delivery:</strong> Working<br>
                  ✅ <strong>HTML formatting:</strong> Working<br>
                  ✅ <strong>Resend integration:</strong> Working<br>
                  ✅ <strong>Admin email system:</strong> Ready to use
                </p>
              </div>
              
              <h3 style="margin: 24px 0 12px; color: #0f172a; font-size: 18px;">📋 What's Next?</h3>
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                <li>Admin email management interface is being built</li>
                <li>You'll be able to send custom emails from the admin panel</li>
                <li>Resend emails with one click</li>
                <li>View complete email history and logs</li>
                <li>Use pre-built templates for common emails</li>
              </ul>
              
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>🔔 Note:</strong> This is a test email. No action is required from you. If you received this, the email system is working correctly!
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                If you have any questions or concerns, please contact the Mindful Champion team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                © 2024 Mindful Champion. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Sent via Resend • Test Email System
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
        text: `
Hi ${recipient.name}!

This is a test email to confirm that the Mindful Champion email system is working perfectly!

✓ Email delivery: Working
✓ HTML formatting: Working
✓ Resend integration: Working
✓ Admin email system: Ready to use

What's Next?
- Admin email management interface is being built
- You'll be able to send custom emails from the admin panel
- Resend emails with one click
- View complete email history and logs
- Use pre-built templates for common emails

Note: This is a test email. No action is required from you. If you received this, the email system is working correctly!

© 2024 Mindful Champion. All rights reserved.
Sent via Resend • Test Email System
        `
      });
      
      console.log(`✅ Successfully sent to ${recipient.to}`);
      console.log(`   Email ID: ${result.id}\n`);
      
      results.push({
        email: recipient.to,
        success: true,
        id: result.id
      });
      
    } catch (error: any) {
      console.error(`❌ Failed to send to ${recipient.to}`);
      console.error(`   Error: ${error.message}\n`);
      
      results.push({
        email: recipient.to,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST EMAIL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total emails attempted: ${results.length}`);
  console.log(`Successfully sent: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log('='.repeat(60) + '\n');
  
  // Detailed results
  console.log('📋 DETAILED RESULTS:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.email}`);
    if (result.success) {
      console.log(`   ✅ Status: Sent successfully`);
      console.log(`   📧 Email ID: ${result.id}`);
    } else {
      console.log(`   ❌ Status: Failed`);
      console.log(`   ⚠️  Error: ${result.error}`);
    }
  });
  
  console.log('\n✨ Test email process completed!\n');
}

// Run the script
sendTestEmails()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
