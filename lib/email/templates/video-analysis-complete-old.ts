import { generateViewAnalysisButton, formatList, generateScoreBadge, generateMetricCard } from '../email-helpers'

export interface VideoAnalysisEmailData {
  recipientName: string
  analysisId: string
  overallScore: number
  topStrengths: string[]
  topImprovements: string[]
  totalShots?: number
  duration?: number
  analyzedDate: string
  baseUrl?: string
  videoThumbnail?: string
  
  // Enhanced data for new dynamic template
  technicalScores?: {
    paddleAngle?: number
    followThrough?: number
    bodyRotation?: number
    footwork?: number
    positioning?: number
  }
  keyMoments?: Array<{
    timestamp: string
    quality: 'excellent' | 'good' | 'needs-improvement'
    description: string
    type: string
  }>
  heatMapData?: {
    zones: Array<{
      position: string
      coverage: number
      quality: number
    }>
  }
  progressComparison?: {
    previousScore?: number
    improvement?: number
    milestones?: string[]
  }
  recommendations?: string[]
  videoClipUrl?: string
  proVideoUrl?: string
}

export function generateVideoAnalysisCompleteEmail(data: VideoAnalysisEmailData): string {
  const {
    recipientName,
    analysisId,
    overallScore,
    topStrengths,
    topImprovements,
    totalShots,
    duration,
    analyzedDate,
    baseUrl,
    videoThumbnail,
    technicalScores,
    keyMoments,
    heatMapData,
    progressComparison,
    recommendations,
    videoClipUrl,
    proVideoUrl
  } = data
  
  const firstName = recipientName.split(' ')[0] || recipientName
  const appUrl = baseUrl || 'https://mindful-champion-2hzb4j.abacusai.app'
  
  // Generate Coach Kai's personalized message based on score
  const coachKaiMessage = generateCoachKaiMessage(firstName, overallScore)
  const scoreEmoji = overallScore >= 85 ? '🌟' : overallScore >= 70 ? '💪' : overallScore >= 50 ? '📈' : '🎯'
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Your Video Analysis is Ready! 🏓</title>
  <style>
    @media (max-width: 600px) {
      .sm-w-full { width: 100% !important; }
      .sm-px-4 { padding-left: 16px !important; padding-right: 16px !important; }
      .sm-text-base { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;background-color:#F3F4F6;">
  <div role="article" aria-roledescription="email" aria-label="Your Video Analysis is Ready" lang="en">
    <table style="width:100%;font-family:Arial, sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color:#F3F4F6;padding:32px 16px;">
          
          <!-- Main Container -->
          <table style="width:100%;max-width:600px;" cellpadding="0" cellspacing="0" role="presentation">
            
            <!-- Header -->
            <tr>
              <td style="padding:0 0 24px 0;">
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="text-align:center;padding:24px;background:linear-gradient(135deg, #10B981 0%, #059669 100%);border-radius:12px 12px 0 0;">
                      <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        🏓 Mindful Champion
                      </h1>
                      <p style="margin:8px 0 0 0;font-size:14px;color:rgba(255,255,255,0.9);font-weight:500;">
                        AI-Powered Pickleball Coaching
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content Card -->
            <tr>
              <td style="background:#ffffff;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
                
                <!-- Hero Section -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px 32px 24px 32px;text-align:center;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
                      <div style="display:inline-block;padding:12px 24px;background:#ECFDF5;border-radius:8px;margin-bottom:16px;">
                        <span style="font-size:32px;">🎉</span>
                      </div>
                      <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#111827;">
                        Your Video Analysis is Ready!
                      </h2>
                      <p style="margin:0;font-size:16px;color:#6B7280;line-height:1.6;">
                        Hi ${firstName}, Coach Kai has finished analyzing your pickleball game. Here's what we discovered!
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Video Thumbnail Section -->
                ${videoThumbnail ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #E5E7EB;">
                      <div style="position:relative;display:inline-block;max-width:100%;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.15);">
                        <img src="${videoThumbnail}" alt="Video Thumbnail" style="display:block;width:100%;max-width:500px;height:auto;border-radius:12px;" />
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;background:rgba(16,185,129,0.95);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                          <span style="color:#ffffff;font-size:24px;margin-left:4px;">▶</span>
                        </div>
                      </div>
                      <p style="margin:12px 0 0 0;font-size:13px;color:#9CA3AF;">
                        Your analyzed video
                      </p>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Overall Score -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;text-align:center;border-bottom:1px solid #E5E7EB;">
                      <p style="margin:0 0 16px 0;font-size:14px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                        Overall Performance Score
                      </p>
                      ${generateScoreBadge(overallScore)}
                      <p style="margin:16px 0 0 0;font-size:14px;color:#9CA3AF;">
                        Analyzed on ${analyzedDate}
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Key Metrics -->
                ${totalShots || duration ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:24px 32px;border-bottom:1px solid #E5E7EB;">
                      <table style="width:100%;" cellpadding="8" cellspacing="0" role="presentation">
                        <tr>
                          ${totalShots ? generateMetricCard('Total Shots', totalShots.toString(), 'Detected') : ''}
                          ${duration ? generateMetricCard('Duration', `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`, 'Minutes') : ''}
                          ${generateMetricCard('Analysis Type', 'Full', 'AI-Powered')}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Top Strengths -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #E5E7EB;">
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td>
                            <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#111827;">
                              💪 Top Strengths
                            </h3>
                          </td>
                        </tr>
                        ${formatList(topStrengths.slice(0, 3), 'strengths')}
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Areas for Improvement -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #E5E7EB;">
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td>
                            <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#111827;">
                              🎯 Priority Focus Areas
                            </h3>
                          </td>
                        </tr>
                        ${formatList(topImprovements.slice(0, 3), 'improvements')}
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Teaser Section -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="text-align:center;">
                            <p style="margin:0 0 20px 0;font-size:16px;color:#374151;line-height:1.6;">
                              This is just a preview! Your full analysis includes:
                            </p>
                            <table style="width:100%;max-width:400px;margin:0 auto;" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="padding:8px 0;text-align:left;">
                                  <span style="color:#10B981;font-weight:600;margin-right:8px;">✓</span>
                                  <span style="color:#374151;font-size:14px;">Detailed shot-by-shot breakdown</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;text-align:left;">
                                  <span style="color:#10B981;font-weight:600;margin-right:8px;">✓</span>
                                  <span style="color:#374151;font-size:14px;">Movement and positioning analysis</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;text-align:left;">
                                  <span style="color:#10B981;font-weight:600;margin-right:8px;">✓</span>
                                  <span style="color:#374151;font-size:14px;">Personalized training recommendations</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;text-align:left;">
                                  <span style="color:#10B981;font-weight:600;margin-right:8px;">✓</span>
                                  <span style="color:#374151;font-size:14px;">Key moments and highlights</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;text-align:left;">
                                  <span style="color:#10B981;font-weight:600;margin-right:8px;">✓</span>
                                  <span style="color:#374151;font-size:14px;">Progress comparison charts</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Coach Kai's Message -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);border-top:2px solid #10B981;border-bottom:2px solid #10B981;">
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="width:60px;vertical-align:top;padding-right:16px;">
                            <div style="width:50px;height:50px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 8px rgba(16,185,129,0.3);">
                              🏆
                            </div>
                          </td>
                          <td style="vertical-align:top;">
                            <div style="background:#ffffff;padding:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);position:relative;">
                              <div style="position:absolute;left:-8px;top:20px;width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-right:8px solid #ffffff;"></div>
                              <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">
                                Message from Coach Kai ${scoreEmoji}
                              </p>
                              <p style="margin:0;font-size:15px;color:#1F2937;line-height:1.7;font-style:italic;">
                                "${coachKaiMessage}"
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:40px 32px;text-align:center;">
                      ${generateViewAnalysisButton(analysisId, baseUrl)}
                      <p style="margin:20px 0 0 0;font-size:12px;color:#9CA3AF;">
                        Or copy this link: ${baseUrl || 'https://mindful-champion-2hzb4j.abacusai.app'}/train/video?analysis=${analysisId}
                      </p>
                    </td>
                  </tr>
                </table>
                
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px;text-align:center;">
                <p style="margin:0 0 12px 0;font-size:14px;color:#6B7280;line-height:1.6;">
                  Keep improving your game with Coach Kai!
                </p>
                <p style="margin:0 0 16px 0;font-size:12px;color:#9CA3AF;">
                  © ${new Date().getFullYear()} Mindful Champion. All rights reserved.
                </p>
                <table style="margin:0 auto;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:0 8px;">
                      <a href="${baseUrl || 'https://mindful-champion-2hzb4j.abacusai.app'}/train/video" style="color:#10B981;text-decoration:none;font-size:12px;">Video Library</a>
                    </td>
                    <td style="padding:0 8px;color:#D1D5DB;">|</td>
                    <td style="padding:0 8px;">
                      <a href="${baseUrl || 'https://mindful-champion-2hzb4j.abacusai.app'}/settings" style="color:#10B981;text-decoration:none;font-size:12px;">Settings</a>
                    </td>
                    <td style="padding:0 8px;color:#D1D5DB;">|</td>
                    <td style="padding:0 8px;">
                      <a href="${baseUrl || 'https://mindful-champion-2hzb4j.abacusai.app'}/support" style="color:#10B981;text-decoration:none;font-size:12px;">Support</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0 0;font-size:11px;color:#9CA3AF;">
                  You received this email because your video analysis was completed.
                </p>
              </td>
            </tr>
            
          </table>
          
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate personalized Coach Kai message based on performance score
 */
function generateCoachKaiMessage(firstName: string, score: number): string {
  const messages = {
    excellent: [
      `Wow, ${firstName}! This is exceptional performance! Your technique and court awareness are truly impressive. Keep this momentum going and you'll be unstoppable! 🌟`,
      `Outstanding work, ${firstName}! You're playing at a really high level. Your consistency and shot selection are on point. This is what championship-level pickleball looks like! 🏆`,
      `${firstName}, I'm genuinely impressed! Your game is firing on all cylinders. The way you're controlling the court and executing shots is elite-level stuff. Keep pushing! 💎`,
      `Incredible performance, ${firstName}! You're demonstrating mastery in multiple areas. This is the kind of play that wins tournaments. Stay focused and keep dominating! ⭐`,
    ],
    veryGood: [
      `Great job, ${firstName}! You're playing some solid pickleball here. Your fundamentals are strong, and I can see the hard work paying off. Let's build on this! 💪`,
      `${firstName}, this is really good stuff! Your game is coming together nicely. Focus on those improvement areas and you'll be at the next level soon! 🚀`,
      `Nice work, ${firstName}! I'm seeing a lot of positives in your game. You're making smart decisions and executing well. Keep this trajectory going! 📈`,
      `Solid performance, ${firstName}! Your technique is developing beautifully. Stay committed to those practice drills and you'll see even more improvement! 🎯`,
    ],
    good: [
      `Good effort, ${firstName}! You're on the right track. I can see areas where you're improving, and that's what matters. Let's work on refining those key skills! 📊`,
      `${firstName}, you're making progress! Your game has some strong foundations. Focus on the areas for improvement and you'll see significant gains soon! 🌱`,
      `Nice job, ${firstName}! You're showing potential in several areas. Remember, every great player started exactly where you are. Keep practicing! 💚`,
      `${firstName}, this is a solid baseline to work from. I can see what you're doing well and where we need to focus. Let's turn those weaknesses into strengths! 🔨`,
    ],
    needsWork: [
      `Hey ${firstName}, don't get discouraged! Everyone starts somewhere, and the fact that you're analyzing your game shows you're serious about improving. Let's focus on the fundamentals and build from there! 🌟`,
      `${firstName}, I appreciate your commitment to getting better! The areas for improvement we've identified are totally fixable. Let's create a focused practice plan and watch your game transform! 💪`,
      `${firstName}, here's the truth: Every champion was once a beginner. You're taking the right steps by analyzing your game. Stay patient, work on the basics, and trust the process! 🚀`,
      `Good on you for putting yourself out there, ${firstName}! The video analysis shows us exactly what to work on. With consistent practice on these fundamentals, you're going to see major improvements! 🎯`,
    ]
  }
  
  let category: keyof typeof messages
  if (score >= 85) {
    category = 'excellent'
  } else if (score >= 70) {
    category = 'veryGood'
  } else if (score >= 50) {
    category = 'good'
  } else {
    category = 'needsWork'
  }
  
  const messageArray = messages[category]
  return messageArray[Math.floor(Math.random() * messageArray.length)]
}
