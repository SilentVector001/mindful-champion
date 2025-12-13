/**
 * Tournament Email Templates
 */

// Tournament Registration Confirmation
export function generateTournamentRegistrationEmail(userName: string, tournamentName: string, tournamentDate: string, location: string) {
  const subject = `🏆 Registered for ${tournamentName}!`;
  
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
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🏆 You're Registered!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">See you there, ${userName}! 🎉</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">You're officially registered for <strong>${tournamentName}</strong>. Get ready to compete and show off your skills!</p>
              
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0;">📍 Tournament Details</h3>
                <p style="color: #334155; margin: 5px 0;"><strong>Event:</strong> ${tournamentName}</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Date:</strong> ${tournamentDate}</p>
                <p style="color: #334155; margin: 5px 0;"><strong>Location:</strong> ${location}</p>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Pre-Tournament Tips</h4>
                <ul style="color: #78350f; margin: 10px 0; padding-left: 20px;">
                  <li>Review Coach Kai's analysis of your recent matches</li>
                  <li>Practice your serves and returns</li>
                  <li>Stay hydrated and get plenty of rest</li>
                  <li>Arrive 30 minutes early for warm-up</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/tournaments" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">View Tournament Details →</a>
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
  
  const text = `Tournament Registration - ${tournamentName}\n\nYou're registered, ${userName}!\n\nDetails:\n- Event: ${tournamentName}\n- Date: ${tournamentDate}\n- Location: ${location}\n\nView details: https://mindfulchampion.com/tournaments`;
  
  return { subject, html, text };
}

// Tournament Reminder
export function generateTournamentReminderEmail(userName: string, tournamentName: string, hoursUntil: number, location: string) {
  const subject = `⏰ ${tournamentName} starts in ${hoursUntil} hours!`;
  
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
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #14b8a6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Tournament Starts Soon!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Game time, ${userName}! 🌟</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;"><strong>${tournamentName}</strong> starts in just <strong style="color: #f59e0b;">${hoursUntil} hours</strong>!</p>
              
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #7f1d1d; margin: 0; font-weight: bold;">📍 Location: ${location}</p>
                <p style="color: #7f1d1d; margin: 10px 0 0 0;">Make sure you arrive 30 minutes early for check-in and warm-up!</p>
              </div>
              
              <h3 style="color: #0f172a; margin: 30px 0 15px 0;">Last-Minute Checklist ✅</h3>
              <ul style="color: #334155; line-height: 2;">
                <li>Paddle, balls, and proper shoes</li>
                <li>Water bottle and snacks</li>
                <li>Tournament confirmation email</li>
                <li>Positive attitude and good sportsmanship</li>
              </ul>
              
              <p style="color: #14b8a6; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0;">Good luck, Champion! 💪</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  const text = `Tournament Reminder - ${tournamentName}\n\nGame time, ${userName}!\n\n${tournamentName} starts in ${hoursUntil} hours at ${location}.\n\nArrive 30 minutes early. Good luck! 💪`;
  
  return { subject, html, text };
}

// Tournament Results
export function generateTournamentResultsEmail(userName: string, tournamentName: string, placement: string, totalParticipants: number) {
  const subject = `🏆 ${tournamentName} Results`;
  
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
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🏆 Tournament Results</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 20px 0;">Great job, ${userName}! 🎉</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">The results for <strong>${tournamentName}</strong> are in!</p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <p style="color: #92400e; font-size: 18px; margin: 0 0 10px 0;">Your Placement</p>
                <p style="color: #78350f; font-size: 48px; font-weight: bold; margin: 0;">${placement}</p>
                <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0;">out of ${totalParticipants} participants</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Every match is an opportunity to learn and improve. Check out your performance analysis and Coach Kai's insights to take your game to the next level!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mindfulchampion.com/tournaments/results" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">View Full Results →</a>
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
  
  const text = `Tournament Results - ${tournamentName}\n\nGreat job, ${userName}!\n\nYour Placement: ${placement} out of ${totalParticipants} participants\n\nView full results: https://mindfulchampion.com/tournaments/results`;
  
  return { subject, html, text };
}
