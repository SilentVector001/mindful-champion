/**
 * Subscription Email Templates
 * All subscription-related emails
 */

// Subscription Confirmation
export function generateSubscriptionConfirmationEmail(userName: string, planName: string, amount: number, billingDate: string) {
  const subject = '✅ Subscription Confirmed - Mindful Champion Pro';
  
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">✅ Subscription Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Hey ${userName}! 🎉</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Welcome to <strong>${planName}</strong>! Your subscription is now active and you have full access to all premium features.</p>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0;">📋 Subscription Details</h3>
                <p style="color: #334155; margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}/month</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Next Billing:</strong> ${billingDate}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Go to Dashboard →</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">Questions? <a href="mailto:support@mindfulchampion.com" style="color: #14b8a6;">Contact Support</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `Subscription Confirmed - Mindful Champion\n\nHey ${userName}!\n\nWelcome to ${planName}! Your subscription is now active.\n\nDetails:\n- Plan: ${planName}\n- Amount: $${amount.toFixed(2)}/month\n- Next Billing: ${billingDate}\n\nGo to Dashboard: https://mindfulchampion.com/dashboard`;
  
  return { subject, html, text };
}

// Subscription Expiring
export function generateSubscriptionExpiringEmail(userName: string, planName: string, expiryDate: string, daysLeft: number) {
  const subject = `⏰ Your ${planName} expires in ${daysLeft} days`;
  
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
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Subscription Expiring Soon</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Hey ${userName}!</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your <strong>${planName}</strong> subscription will expire in <strong style="color: #dc2626;">${daysLeft} days</strong> on ${expiryDate}.</p>
              
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #7f1d1d; margin: 0;">⚠️ Don't lose access to premium features! Renew now to keep enjoying AI-powered coaching, unlimited video analysis, and exclusive training programs.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/subscription" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Renew Subscription →</a>
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
  
  const text = `Subscription Expiring - Mindful Champion\n\nHey ${userName}!\n\nYour ${planName} subscription will expire in ${daysLeft} days on ${expiryDate}.\n\nRenew now: https://mindfulchampion.com/subscription`;
  
  return { subject, html, text };
}

// Subscription Cancelled
export function generateSubscriptionCancelledEmail(userName: string, planName: string, endDate: string) {
  const subject = '❌ Subscription Cancelled - Mindful Champion';
  
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
            <td style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Subscription Cancelled</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Hey ${userName},</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">We're sorry to see you go! Your <strong>${planName}</strong> subscription has been cancelled.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #334155; margin: 0;">You'll continue to have access to premium features until <strong>${endDate}</strong>. After that, your account will be downgraded to the free plan.</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">We'd love to have you back! If you change your mind or have feedback on how we can improve, please let us know.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/subscription" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Reactivate Subscription →</a>
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
  
  const text = `Subscription Cancelled - Mindful Champion\n\nHey ${userName},\n\nYour ${planName} subscription has been cancelled. You'll have access until ${endDate}.\n\nReactivate anytime: https://mindfulchampion.com/subscription`;
  
  return { subject, html, text };
}

// Payment Receipt
export function generatePaymentReceiptEmail(userName: string, amount: number, planName: string, transactionId: string, date: string) {
  const subject = '🧾 Payment Receipt - Mindful Champion';
  
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
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🧾 Payment Receipt</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Thank you, ${userName}!</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your payment has been successfully processed.</p>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0;">Payment Details</h3>
                <table width="100%" style="color: #334155; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Amount:</strong></td>
                    <td style="text-align: right;">$${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Plan:</strong></td>
                    <td style="text-align: right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="text-align: right;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
                    <td style="text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">Keep this receipt for your records. If you have any questions about this payment, please contact our support team.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `Payment Receipt - Mindful Champion\n\nThank you, ${userName}!\n\nPayment Details:\n- Amount: $${amount.toFixed(2)}\n- Plan: ${planName}\n- Date: ${date}\n- Transaction ID: ${transactionId}`;
  
  return { subject, html, text };
}
