/**
 * Admin Alert Email Templates
 * For internal notifications to admins
 */

// New User Alert
export function generateNewUserAlertEmail(userName: string, userEmail: string, userId: string, signupDate: string) {
  const subject = '👤 New User Signup - Mindful Champion';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">👤 New User Signup</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px;">New user registered!</h2>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; color: #334155; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Name:</strong></td>
                    <td style="text-align: right;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Email:</strong></td>
                    <td style="text-align: right;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>User ID:</strong></td>
                    <td style="text-align: right; font-family: monospace; font-size: 12px;">${userId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Signup Date:</strong></td>
                    <td style="text-align: right;">${signupDate}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/admin/users" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: bold;">View in Admin Panel →</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `New User Signup\n\nName: ${userName}\nEmail: ${userEmail}\nUser ID: ${userId}\nSignup Date: ${signupDate}\n\nView in Admin: https://mindfulchampion.com/admin/users`;
  
  return { subject, html, text };
}

// Payment Alert
export function generatePaymentAlertEmail(userName: string, userEmail: string, amount: number, planName: string, transactionId: string) {
  const subject = '💳 New Payment Received - Mindful Champion';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💳 Payment Received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px;">New payment processed!</h2>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; color: #334155; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Amount:</strong></td>
                    <td style="text-align: right; color: #10b981; font-size: 18px; font-weight: bold;">$${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Customer:</strong></td>
                    <td style="text-align: right;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Email:</strong></td>
                    <td style="text-align: right;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Plan:</strong></td>
                    <td style="text-align: right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
                    <td style="text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/admin/payments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: bold;">View Payment Details →</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `New Payment Received\n\nAmount: $${amount.toFixed(2)}\nCustomer: ${userName} (${userEmail})\nPlan: ${planName}\nTransaction ID: ${transactionId}\n\nView in Admin: https://mindfulchampion.com/admin/payments`;
  
  return { subject, html, text };
}

// System Error Alert
export function generateSystemErrorAlertEmail(errorType: string, errorMessage: string, errorStack: string, userId?: string, timestamp?: string) {
  const subject = `🚨 System Error Alert - ${errorType}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 System Error Alert</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px;">Critical Error Detected</h2>
              
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #7f1d1d; margin: 0 0 10px 0;"><strong>Error Type:</strong> ${errorType}</p>
                <p style="color: #7f1d1d; margin: 0 0 10px 0;"><strong>Message:</strong> ${errorMessage}</p>
                ${userId ? `<p style="color: #7f1d1d; margin: 0 0 10px 0;"><strong>User ID:</strong> ${userId}</p>` : ''}
                ${timestamp ? `<p style="color: #7f1d1d; margin: 0;"><strong>Timestamp:</strong> ${timestamp}</p>` : ''}
              </div>
              
              ${errorStack ? `
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #334155; overflow-x: auto;">
                <strong>Stack Trace:</strong><br>
                <pre style="margin: 10px 0 0 0; white-space: pre-wrap; word-wrap: break-word;">${errorStack}</pre>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/admin/logs" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: bold;">View Error Logs →</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `System Error Alert - ${errorType}\n\nError: ${errorMessage}\n${userId ? `User ID: ${userId}\n` : ''}${timestamp ? `Timestamp: ${timestamp}\n` : ''}\n\nStack Trace:\n${errorStack || 'N/A'}\n\nView logs: https://mindfulchampion.com/admin/logs`;
  
  return { subject, html, text };
}
