/**
 * Password Reset Email Template
 * Sent when user requests to reset their password
 */

export function generatePasswordResetEmail(userName: string, resetToken: string, resetUrl: string) {
  const subject = '🔐 Reset Your Password - Mindful Champion';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 24px;">Hey ${userName}!</h2>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your Mindful Champion account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);">
                  Reset Password
                </a>
              </div>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Security Information</h4>
                <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                  This link will expire in <strong>1 hour</strong> for your security. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #14b8a6; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Mindful Champion</strong> - Security Team
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Questions? Contact <a href="mailto:support@mindfulchampion.com" style="color: #14b8a6; text-decoration: none;">support@mindfulchampion.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `
Password Reset - Mindful Champion

Hey ${userName}!

We received a request to reset your password for your Mindful Champion account. Click the link below to create a new password:

${resetUrl}

⚠️ Important: This link will expire in 1 hour for your security.

If you didn't request this password reset, please ignore this email or contact support@mindfulchampion.com if you have concerns.

Best regards,
Mindful Champion Security Team
  `;
  
  return { subject, html, text };
}
