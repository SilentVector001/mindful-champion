/**
 * Redemption & Reward Email Templates
 */

// Redemption Request Submitted
export function generateRedemptionRequestEmail(userName: string, rewardName: string, pointsCost: number, requestId: string) {
  const subject = '🎁 Redemption Request Received - Mindful Champion';
  
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎁 Redemption Request Received!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Thanks, ${userName}! 🎉</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">We've received your redemption request for <strong>${rewardName}</strong>.</p>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0;">Request Details</h3>
                <p style="color: #334155; margin: 5px 0;"><strong>Reward:</strong> ${rewardName}</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Points Redeemed:</strong> ${pointsCost} points</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Request ID:</strong> <span style="font-family: monospace; font-size: 12px;">${requestId}</span></p>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0;">🕒 The sponsor will review your request and approve it shortly. You'll receive an email confirmation once it's approved.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/rewards" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">View My Rewards →</a>
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
  
  const text = `Redemption Request Received\n\nThanks, ${userName}!\n\nWe've received your request for ${rewardName}.\n\nDetails:\n- Reward: ${rewardName}\n- Points: ${pointsCost}\n- Request ID: ${requestId}\n\nThe sponsor will review shortly.\n\nView rewards: https://mindfulchampion.com/rewards`;
  
  return { subject, html, text };
}

// Redemption Approved
export function generateRedemptionApprovedEmail(userName: string, rewardName: string, sponsorName: string, instructions: string) {
  const subject = '✅ Redemption Approved - Mindful Champion';
  
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
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">✅ Redemption Approved!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Great news, ${userName}! 🎉</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your redemption request for <strong>${rewardName}</strong> has been approved by ${sponsorName}!</p>
              
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #065f46; margin: 0 0 15px 0;">🎯 How to Claim Your Reward</h3>
                <p style="color: #064e3b; line-height: 1.8; margin: 0;">${instructions}</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
If you have any questions about claiming your reward, please contact ${sponsorName} directly or reach out to our support team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/rewards" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">View My Rewards →</a>
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
  
  const text = `Redemption Approved!\n\nGreat news, ${userName}!\n\nYour request for ${rewardName} has been approved by ${sponsorName}.\n\nHow to Claim:\n${instructions}\n\nView rewards: https://mindfulchampion.com/rewards`;
  
  return { subject, html, text };
}

// Redemption Shipped
export function generateRedemptionShippedEmail(userName: string, rewardName: string, trackingNumber: string, carrier: string, estimatedDelivery: string) {
  const subject = '🚚 Reward Shipped - Mindful Champion';
  
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
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🚚 Your Reward is On the Way!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Exciting news, ${userName}! 🎁</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your <strong>${rewardName}</strong> has been shipped and is on its way to you!</p>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0;">📦 Shipping Details</h3>
                <p style="color: #334155; margin: 8px 0;"><strong>Carrier:</strong> ${carrier}</p>
                <p style="color: #334155; margin: 8px 0;"><strong>Tracking Number:</strong></p>
                <p style="color: #14b8a6; font-family: monospace; font-size: 18px; font-weight: bold; margin: 5px 0 15px 0;">${trackingNumber}</p>
                <p style="color: #334155; margin: 8px 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Track Package →</a>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0;">📧 Make sure someone is available to receive the package. If you have any delivery issues, please contact the carrier directly using the tracking number above.</p>
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
  
  const text = `Reward Shipped!\n\nExciting news, ${userName}!\n\nYour ${rewardName} has been shipped!\n\nShipping Details:\n- Carrier: ${carrier}\n- Tracking: ${trackingNumber}\n- Estimated Delivery: ${estimatedDelivery}\n\nTrack your package: https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`;
  
  return { subject, html, text };
}
