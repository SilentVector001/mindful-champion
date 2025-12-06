#!/usr/bin/env node

/**
 * Test Email Sending - Mindful Champion
 * 
 * This script tests if your Resend API key is configured correctly
 * and sends a test email to verify delivery.
 */

require('dotenv').config();
const { Resend } = require('resend');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEmail() {
  log(colors.blue + colors.bold, '\n╔════════════════════════════════════════════════════╗');
  log(colors.blue + colors.bold, '║     Mindful Champion - Email Test Tool            ║');
  log(colors.blue + colors.bold, '╚════════════════════════════════════════════════════╝\n');

  // Check API key
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    log(colors.red, '❌ ERROR: RESEND_API_KEY not found in .env file!');
    log(colors.yellow, '\n📝 To fix this:');
    console.log('   1. Get your API key from https://resend.com/api-keys');
    console.log('   2. Add it to your .env file:');
    console.log('      RESEND_API_KEY=re_your_actual_key_here');
    console.log('   3. Run this script again\n');
    process.exit(1);
  }

  if (apiKey === 'your_resend_api_key_here') {
    log(colors.red, '❌ ERROR: Using placeholder API key!');
    log(colors.yellow, '\n📝 To fix this:');
    console.log('   1. Sign up at https://resend.com (FREE)');
    console.log('   2. Get your API key');
    console.log('   3. Update .env file with real API key');
    console.log('   4. Run: ./setup-email.sh YOUR_API_KEY\n');
    process.exit(1);
  }

  log(colors.blue, '🔑 API Key found: ' + apiKey.substring(0, 10) + '...');

  // Initialize Resend
  const resend = new Resend(apiKey);

  // Get recipient email from command line or use default
  const recipientEmail = process.argv[2] || 'test@example.com';
  
  if (recipientEmail === 'test@example.com') {
    log(colors.yellow, '\n⚠️  Using test@example.com - this will fail!');
    log(colors.blue, '💡 Usage: node test-email-send.js your-email@example.com\n');
  }

  log(colors.blue, `📧 Recipient: ${recipientEmail}`);
  log(colors.blue, '📤 Sending test email...\n');

  try {
    const result = await resend.emails.send({
      from: 'Mindful Champion Test <onboarding@resend.dev>',
      to: recipientEmail,
      subject: '✅ Mindful Champion - Email Test Successful!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 30px;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .success {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-box {
              background: #fff;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
            }
            .emoji {
              font-size: 24px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Email Configuration Successful!</h1>
            <p>Mindful Champion</p>
          </div>
          
          <div class="content">
            <div class="success">
              <strong class="emoji">✅</strong> <strong>SUCCESS!</strong><br>
              Your Resend email service is configured correctly and working!
            </div>
            
            <h2>What This Means:</h2>
            <div class="info-box">
              <p><strong>✉️ Email notifications are now active</strong></p>
              <p>Your users will receive:</p>
              <ul>
                <li>Welcome emails when they sign up</li>
                <li>Video analysis completion notifications</li>
                <li>Training program updates</li>
                <li>Important account notifications</li>
              </ul>
            </div>
            
            <h2>Next Steps:</h2>
            <div class="info-box">
              <p><strong>1. Verify Your Domain (Recommended)</strong></p>
              <p>Add your custom domain in Resend to send from @mindfulchampion.com instead of @resend.dev</p>
              
              <p><strong>2. Monitor Email Delivery</strong></p>
              <p>Check your admin dashboard at /admin/email-notifications</p>
              
              <p><strong>3. Test User Flows</strong></p>
              <p>Upload a video and verify you receive the analysis email</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated test email from Mindful Champion</p>
            <p>Sent via Resend • ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `,
      text: `
✅ EMAIL CONFIGURATION SUCCESSFUL!

Your Resend email service is configured correctly and working!

What This Means:
- Email notifications are now active
- Users will receive welcome emails, video analysis notifications, and more

Next Steps:
1. Verify your domain in Resend (optional but recommended)
2. Monitor email delivery at /admin/email-notifications
3. Test user flows by uploading a video

---
This is an automated test email from Mindful Champion
Sent via Resend • ${new Date().toLocaleString()}
      `,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    log(colors.green + colors.bold, '\n✅ SUCCESS! Email sent successfully!\n');
    log(colors.blue, '📬 Email Details:');
    console.log(`   Message ID: ${result.data.id}`);
    console.log(`   Recipient: ${recipientEmail}`);
    console.log(`   Status: Sent\n`);
    
    log(colors.yellow, '📝 Next Steps:');
    console.log('   1. Check your inbox for the test email');
    console.log('   2. If not in inbox, check spam/junk folder');
    console.log('   3. Add your domain in Resend for better deliverability');
    console.log('   4. Monitor emails at /admin/email-notifications\n');
    
    log(colors.green, '🎉 Your email service is fully operational!\n');

  } catch (error) {
    log(colors.red + colors.bold, '\n❌ ERROR: Failed to send email!\n');
    log(colors.red, 'Error details: ' + error.message);
    
    log(colors.yellow, '\n🔧 Troubleshooting:');
    console.log('   1. Verify your API key is correct');
    console.log('   2. Check if you have API key permissions in Resend');
    console.log('   3. Ensure you have email credits remaining (free tier: 100/day)');
    console.log('   4. Try generating a new API key at https://resend.com/api-keys');
    console.log('   5. Check Resend status: https://resend.com/status\n');
    
    process.exit(1);
  }
}

// Run the test
testEmail().catch((error) => {
  log(colors.red, '\n❌ Unexpected error: ' + error.message);
  process.exit(1);
});
