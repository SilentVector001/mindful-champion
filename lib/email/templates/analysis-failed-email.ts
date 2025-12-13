/**
 * Video Analysis Failed Email Template
 * Sent when video analysis encounters an error
 */

export function generateAnalysisFailedEmail(userName: string, videoTitle: string, errorReason: string) {
  const subject = '⚠️ Video Analysis Error - Mindful Champion';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Analysis Error</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⚠️ Video Analysis Error</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 24px;">Hey ${userName},</h2>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We encountered an issue while analyzing your video: <strong>${videoTitle}</strong>
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">🔍 Error Details</h4>
                <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${errorReason || 'Unknown error occurred during video processing'}
                </p>
              </div>
              
              <h3 style="color: #0f172a; margin: 30px 0 15px 0; font-size: 18px;">🛠️ Possible Solutions:</h3>
              <ul style="color: #334155; font-size: 14px; line-height: 2; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Ensure your video is in MP4, MOV, or AVI format</li>
                <li>Check that file size is under 500MB</li>
                <li>Verify the video is clear and shows the full court</li>
                <li>Make sure the video isn't corrupted or password-protected</li>
                <li>Try uploading the video again</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/train/video" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);">
                  Try Again →
                </a>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 16px;">👫 Need Help?</h4>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                  If you continue experiencing issues, our support team is here to help! Reply to this email or contact us at <a href="mailto:support@mindfulchampion.com" style="color: #14b8a6; text-decoration: none;">support@mindfulchampion.com</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Mindful Champion</strong> - Support Team
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Questions? <a href="mailto:support@mindfulchampion.com" style="color: #14b8a6; text-decoration: none;">Contact Support</a>
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
Video Analysis Error - Mindful Champion

Hey ${userName},

We encountered an issue while analyzing your video: ${videoTitle}

Error Details:
${errorReason || 'Unknown error occurred during video processing'}

Possible Solutions:
- Ensure your video is in MP4, MOV, or AVI format
- Check that file size is under 500MB
- Verify the video is clear and shows the full court
- Make sure the video isn't corrupted or password-protected
- Try uploading the video again

Try Again: https://mindfulchampion.com/train/video

Need Help? Contact us at support@mindfulchampion.com

Best regards,
Mindful Champion Support Team
  `;
  
  return { subject, html, text };
}
