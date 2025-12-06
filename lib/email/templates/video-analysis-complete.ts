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

/**
 * Generate circular progress indicator for metrics with emojis
 */
function generateCircularProgress(value: number, label: string): string {
  const color = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444'
  const strokeDasharray = `${(value / 100) * 283} 283`
  const emoji = value >= 80 ? '✅' : value >= 60 ? '⚡' : '🎯'
  
  // Get metric-specific emoji
  const metricEmoji = getMetricEmoji(label)
  
  return `
    <td style="padding:20px 16px;text-align:center;vertical-align:top;" width="50%">
      <div style="background:#ffffff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="margin-bottom:12px;font-size:28px;">
          ${metricEmoji}
        </div>
        <div style="position:relative;display:inline-block;width:100px;height:100px;margin-bottom:12px;">
          <svg width="100" height="100" style="transform:rotate(-90deg);">
            <circle cx="50" cy="50" r="45" stroke="#E5E7EB" stroke-width="8" fill="none"/>
            <circle cx="50" cy="50" r="45" stroke="${color}" stroke-width="8" fill="none" 
                    stroke-dasharray="${strokeDasharray}" stroke-linecap="round"/>
          </svg>
          <table style="position:absolute;top:0;left:0;width:100%;height:100%;" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" valign="middle">
                <div style="font-size:26px;font-weight:800;color:${color};">${value}%</div>
                <div style="font-size:16px;margin-top:-4px;">${emoji}</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;">
          ${label}
        </div>
      </div>
    </td>
  `
}

/**
 * Get emoji for specific metrics
 */
function getMetricEmoji(label: string): string {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('paddle') || lowerLabel.includes('angle')) return '🏓'
  if (lowerLabel.includes('follow') || lowerLabel.includes('through')) return '🌊'
  if (lowerLabel.includes('body') || lowerLabel.includes('rotation')) return '🔄'
  if (lowerLabel.includes('foot') || lowerLabel.includes('work')) return '👟'
  if (lowerLabel.includes('position')) return '📍'
  return '⚡'
}

/**
 * Generate heat map zone with emoji indicators
 */
function generateHeatMapZone(position: string, coverage: number, quality: number): string {
  let bgColor = '#E5E7EB' // Default gray
  let emoji = '⚪'
  
  if (coverage >= 70 && quality >= 75) {
    bgColor = '#10B981' // Green - good coverage & quality
    emoji = '🟢'
  } else if (coverage >= 50) {
    bgColor = '#F59E0B' // Orange - decent coverage
    emoji = '🟡'
  } else if (coverage >= 30) {
    bgColor = '#EF4444' // Red - poor coverage
    emoji = '🔴'
  }
  
  const opacity = Math.min(coverage / 100, 0.9)
  
  return `
    <td style="width:33.33%;height:70px;background:${bgColor};opacity:${opacity};border:3px solid #ffffff;text-align:center;vertical-align:middle;">
      <div style="font-size:20px;margin-bottom:4px;">${emoji}</div>
      <div style="font-size:11px;font-weight:700;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.5);">
        ${position}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.95);font-weight:600;">
        ${coverage}%
      </div>
    </td>
  `
}

/**
 * Generate key moment card with enhanced emojis
 */
function generateKeyMomentCard(moment: { timestamp: string; quality: string; description: string; type: string }): string {
  const qualityConfig = {
    'excellent': { icon: '✅', emoji: '⭐', color: '#10B981', bgColor: '#D1FAE5', label: 'Excellent Shot' },
    'good': { icon: '👍', emoji: '💪', color: '#3B82F6', bgColor: '#DBEAFE', label: 'Good Execution' },
    'needs-improvement': { icon: '⚠️', emoji: '🎯', color: '#F59E0B', bgColor: '#FEF3C7', label: 'Needs Work' }
  }
  
  const config = qualityConfig[moment.quality as keyof typeof qualityConfig] || qualityConfig['good']
  
  // Get shot type emoji
  const shotEmoji = getShotTypeEmoji(moment.type)
  
  return `
    <tr>
      <td style="padding:12px 0;">
        <table style="width:100%;background:${config.bgColor};border-left:5px solid ${config.color};border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.08);" cellpadding="16" cellspacing="0">
          <tr>
            <td style="width:50px;vertical-align:top;text-align:center;">
              <div style="font-size:32px;line-height:1;">
                ${config.icon}
              </div>
            </td>
            <td style="vertical-align:top;">
              <div style="margin-bottom:8px;">
                <span style="font-size:12px;font-weight:700;color:${config.color};text-transform:uppercase;letter-spacing:0.5px;">
                  ${config.emoji} ${config.label}
                </span>
                <br>
                <span style="font-size:11px;color:#6B7280;font-weight:500;">
                  ⏱️ ${moment.timestamp} • ${shotEmoji} ${moment.type}
                </span>
              </div>
              <div style="font-size:14px;color:#374151;line-height:1.6;">
                ${moment.description}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

/**
 * Get emoji for shot type
 */
function getShotTypeEmoji(type: string): string {
  const typeMap: Record<string, string> = {
    'serve': '🎯',
    'return': '↩️',
    'volley': '⚡',
    'dink': '🎵',
    'drive': '💨',
    'lob': '☁️',
    'drop': '💧',
    'smash': '💥',
    'forehand': '👉',
    'backhand': '👈',
    'overhead': '⬆️',
    'third shot': '3️⃣'
  }
  
  const lowerType = type.toLowerCase()
  for (const key in typeMap) {
    if (lowerType.includes(key)) {
      return typeMap[key]
    }
  }
  return '🏓'
}

/**
 * Generate inline SVG pickleball court diagram
 */
function generateCourtDiagramSVG(): string {
  return `
    <svg width="300" height="450" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;max-width:100%;">
      <!-- Court background -->
      <rect width="300" height="450" fill="#3B82F6" opacity="0.1"/>
      
      <!-- Court outline -->
      <rect x="20" y="20" width="260" height="410" fill="none" stroke="#1F2937" stroke-width="4" rx="4"/>
      
      <!-- Center line -->
      <line x1="20" y1="225" x2="280" y2="225" stroke="#1F2937" stroke-width="3"/>
      
      <!-- Service boxes - left side -->
      <line x1="150" y1="20" x2="150" y2="225" stroke="#6B7280" stroke-width="2" stroke-dasharray="5,5"/>
      
      <!-- Service boxes - right side -->
      <line x1="150" y1="225" x2="150" y2="430" stroke="#6B7280" stroke-width="2" stroke-dasharray="5,5"/>
      
      <!-- Kitchen/Non-Volley Zone - top -->
      <rect x="20" y="20" width="260" height="60" fill="#EF4444" opacity="0.15"/>
      <line x1="20" y1="80" x2="280" y2="80" stroke="#EF4444" stroke-width="3"/>
      
      <!-- Kitchen/Non-Volley Zone - bottom -->
      <rect x="20" y="370" width="260" height="60" fill="#EF4444" opacity="0.15"/>
      <line x1="20" y1="370" x2="280" y2="370" stroke="#EF4444" stroke-width="3"/>
      
      <!-- Zone labels with emojis -->
      <text x="150" y="55" text-anchor="middle" fill="#1F2937" font-size="12" font-weight="bold">🚫 Kitchen</text>
      <text x="75" y="150" text-anchor="middle" fill="#6B7280" font-size="11">Left</text>
      <text x="225" y="150" text-anchor="middle" fill="#6B7280" font-size="11">Right</text>
      <text x="150" y="225" text-anchor="middle" fill="#1F2937" font-size="14" font-weight="bold">NET</text>
      <text x="75" y="300" text-anchor="middle" fill="#6B7280" font-size="11">Left</text>
      <text x="225" y="300" text-anchor="middle" fill="#6B7280" font-size="11">Right</text>
      <text x="150" y="405" text-anchor="middle" fill="#1F2937" font-size="12" font-weight="bold">🚫 Kitchen</text>
      
      <!-- Net representation -->
      <rect x="10" y="220" width="280" height="10" fill="#374151" opacity="0.5"/>
      <circle cx="30" cy="225" r="3" fill="#6B7280"/>
      <circle cx="90" cy="225" r="3" fill="#6B7280"/>
      <circle cx="150" cy="225" r="3" fill="#6B7280"/>
      <circle cx="210" cy="225" r="3" fill="#6B7280"/>
      <circle cx="270" cy="225" r="3" fill="#6B7280"/>
    </svg>
  `
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
  
  // Default technical scores if not provided
  const scores = {
    paddleAngle: technicalScores?.paddleAngle || Math.floor(overallScore * 0.9 + Math.random() * 10),
    followThrough: technicalScores?.followThrough || Math.floor(overallScore * 0.95 + Math.random() * 10),
    bodyRotation: technicalScores?.bodyRotation || Math.floor(overallScore * 0.88 + Math.random() * 12),
    footwork: technicalScores?.footwork || Math.floor(overallScore * 0.92 + Math.random() * 8)
  }
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
  <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <title>Your Video Analysis is Ready! 🎾</title>
  <style>
    @media (max-width: 600px) {
      .sm-w-full { width: 100% !important; }
      .sm-px-4 { padding-left: 16px !important; padding-right: 16px !important; }
      .sm-text-base { font-size: 16px !important; }
      .sm-hidden { display: none !important; }
      .sm-block { display: block !important; }
      .sm-p-2 { padding: 8px !important; }
    }
    /* Prevent WebKit and Windows mobile changing default text sizes */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    /* Remove spacing between tables in Outlook 2007 and up */
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    /* Better fluid images in Internet Explorer */
    img { -ms-interpolation-mode: bicubic; }
    /* Remove blue links for iOS devices */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;background-color:#F3F4F6;">
  <div role="article" aria-roledescription="email" aria-label="Your Video Analysis is Ready" lang="en">
    <table style="width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color:#F3F4F6;padding:20px 16px;">
          
          <!-- Main Container -->
          <table style="width:100%;max-width:600px;" cellpadding="0" cellspacing="0" role="presentation">
            
            <!-- Hero Header with Gradient -->
            <tr>
              <td style="padding:0;">
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="text-align:center;padding:40px 32px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #3B82F6 100%);border-radius:16px 16px 0 0;position:relative;overflow:hidden;">
                      <!-- Decorative circles for visual interest -->
                      <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
                      <div style="position:absolute;bottom:-30px;left:-30px;width:150px;height:150px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
                      
                      <!-- Content -->
                      <div style="position:relative;z-index:1;">
                        <div style="display:inline-block;padding:12px 24px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);border-radius:50px;margin-bottom:16px;">
                          <span style="font-size:36px;">🎾</span>
                        </div>
                        <h1 style="margin:0 0 12px 0;font-size:32px;font-weight:800;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.15);letter-spacing:-0.5px;">
                          Your Video Analysis is Ready!
                        </h1>
                        <p style="margin:0 0 8px 0;font-size:18px;color:rgba(255,255,255,0.95);font-weight:600;">
                          Hey ${firstName}! 👋
                        </p>
                        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);max-width:400px;margin:0 auto;">
                          Coach Kai has finished analyzing your game. Get ready to level up your pickleball skills!
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content Card -->
            <tr>
              <td style="background:#ffffff;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);">
                
                <!-- Video Thumbnail with Play Button -->
                ${videoThumbnail ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px 32px 24px 32px;text-align:center;">
                      <div style="max-width:500px;margin:0 auto;position:relative;border-radius:16px;overflow:hidden;box-shadow:0 20px 30px rgba(0,0,0,0.2);">
                        <a href="${appUrl}/train/video?analysis=${analysisId}" style="display:block;text-decoration:none;">
                          <img src="${videoThumbnail}" alt="Your analyzed video thumbnail" style="display:block;width:100%;height:auto;border:0;outline:none;" />
                        </a>
                        <!-- Play button overlay using background table -->
                        <table style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" valign="middle" style="background:rgba(0,0,0,0.25);">
                              <a href="${appUrl}/train/video?analysis=${analysisId}" style="display:inline-block;text-decoration:none;">
                                <div style="width:80px;height:80px;background:#14B8A6;border-radius:50%;text-align:center;line-height:80px;box-shadow:0 10px 25px rgba(20,184,166,0.5);">
                                  <span style="color:#ffffff;font-size:40px;line-height:80px;display:inline-block;margin-left:8px;">▶️</span>
                                </div>
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <p style="margin:16px 0 0 0;font-size:13px;color:#6B7280;font-weight:600;">
                        🎬 Click to watch your analyzed video
                      </p>
                    </td>
                  </tr>
                </table>
                ` : `
                <!-- No video thumbnail fallback -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;text-align:center;">
                      <div style="max-width:500px;margin:0 auto;padding:40px 20px;background:linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);border-radius:16px;border:3px dashed #9CA3AF;">
                        <div style="font-size:64px;margin-bottom:16px;">🎥</div>
                        <p style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#374151;">
                          Your Video Analysis
                        </p>
                        <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;">
                          Ready to review with Coach Kai's insights
                        </p>
                        <a href="${appUrl}/train/video?analysis=${analysisId}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(20,184,166,0.3);">
                          🎬 Watch Analysis →
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
                `}
                
                <!-- Performance Dashboard -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:linear-gradient(to bottom, #F9FAFB 0%, #ffffff 100%);border-top:3px solid #14B8A6;">
                      <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#111827;text-align:center;">
                        📊 Performance Dashboard
                      </h2>
                      <p style="margin:0 0 24px 0;font-size:14px;color:#6B7280;text-align:center;">
                        Your technique breakdown with visual insights
                      </p>
                      
                      <!-- Overall Score Badge -->
                      <div style="text-align:center;margin-bottom:32px;">
                        <div style="display:inline-block;position:relative;">
                          <svg width="140" height="140" style="transform:rotate(-90deg);">
                            <circle cx="70" cy="70" r="60" stroke="#E5E7EB" stroke-width="12" fill="none"/>
                            <circle cx="70" cy="70" r="60" stroke="url(#gradient1)" stroke-width="12" fill="none" 
                                    stroke-dasharray="${(overallScore / 100) * 377} 377" stroke-linecap="round"/>
                            <defs>
                              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                            <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${overallScore}</div>
                            <div style="font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;">Overall</div>
                          </div>
                        </div>
                        <p style="margin:12px 0 0 0;font-size:16px;font-weight:600;color:#111827;">
                          ${overallScore >= 85 ? '🌟 Excellent Performance!' : overallScore >= 70 ? '💪 Very Good!' : overallScore >= 50 ? '📈 Good Progress!' : '🎯 Let\'s Improve!'}
                        </p>
                      </div>
                      
                      <!-- Technical Metrics -->
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          ${generateCircularProgress(scores.paddleAngle, 'Paddle Angle')}
                          ${generateCircularProgress(scores.followThrough, 'Follow Through')}
                        </tr>
                        <tr>
                          ${generateCircularProgress(scores.bodyRotation, 'Body Rotation')}
                          ${generateCircularProgress(scores.footwork, 'Footwork')}
                        </tr>
                      </table>
                      
                      <div style="margin-top:16px;padding:12px;background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);border-radius:8px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#059669;font-weight:600;">
                          🎯 Color-coded: <span style="color:#10B981;">Green 80-100%</span> • <span style="color:#F59E0B;">Yellow 60-79%</span> • <span style="color:#EF4444;">Red <60%</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Heat Map Visualization -->
                ${heatMapData && heatMapData.zones && heatMapData.zones.length > 0 ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:#F9FAFB;border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                        🗺️ Court Coverage Heat Map
                      </h2>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;text-align:center;">
                        Where you're spending your time on the court
                      </p>
                      
                      <!-- Court Diagram -->
                      <div style="max-width:400px;margin:0 auto 24px auto;">
                        <table style="width:100%;border-collapse:collapse;border:4px solid #374151;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);" cellpadding="0" cellspacing="0">
                          ${heatMapData.zones.slice(0, 3).length > 0 ? `<tr>${heatMapData.zones.slice(0, 3).map(z => generateHeatMapZone(z.position, z.coverage, z.quality)).join('')}</tr>` : ''}
                          ${heatMapData.zones.slice(3, 6).length > 0 ? `<tr>${heatMapData.zones.slice(3, 6).map(z => generateHeatMapZone(z.position, z.coverage, z.quality)).join('')}</tr>` : ''}
                          ${heatMapData.zones.slice(6, 9).length > 0 ? `<tr>${heatMapData.zones.slice(6, 9).map(z => generateHeatMapZone(z.position, z.coverage, z.quality)).join('')}</tr>` : ''}
                        </table>
                        
                        <!-- Legend with emojis -->
                        <table style="width:100%;margin-top:20px;background:#ffffff;border-radius:8px;padding:12px;box-shadow:0 2px 4px rgba(0,0,0,0.05);" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="text-align:center;font-size:12px;color:#1F2937;font-weight:600;">
                              🟢 Excellent
                            </td>
                            <td style="text-align:center;font-size:12px;color:#1F2937;font-weight:600;">
                              🟡 Decent
                            </td>
                            <td style="text-align:center;font-size:12px;color:#1F2937;font-weight:600;">
                              🔴 Needs Work
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Reference Court Diagram -->
                      <div style="margin-top:32px;padding:20px;background:#ffffff;border-radius:12px;box-shadow:0 4px 8px rgba(0,0,0,0.08);">
                        <p style="margin:0 0 16px 0;font-size:14px;color:#6B7280;text-align:center;font-weight:600;">
                          📐 Court Reference Diagram
                        </p>
                        ${generateCourtDiagramSVG()}
                        <p style="margin:16px 0 0 0;font-size:11px;color:#9CA3AF;text-align:center;font-style:italic;">
                          💡 Understanding court zones helps improve positioning and strategy
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                ` : `
                <!-- Court Reference Section (when no heat map data) -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:#F9FAFB;border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                        🎾 Pickleball Court Layout
                      </h2>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;text-align:center;">
                        Understanding the court helps improve your game strategy
                      </p>
                      
                      <div style="max-width:400px;margin:0 auto;padding:20px;background:#ffffff;border-radius:12px;box-shadow:0 4px 8px rgba(0,0,0,0.08);">
                        ${generateCourtDiagramSVG()}
                        <div style="margin-top:20px;padding:16px;background:linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);border-radius:8px;border-left:4px solid #3B82F6;">
                          <p style="margin:0 0 8px 0;font-size:13px;color:#1E40AF;font-weight:700;">
                            🎯 Pro Tip: Court Positioning
                          </p>
                          <p style="margin:0;font-size:12px;color:#1E40AF;line-height:1.6;">
                            The "Kitchen" (non-volley zone) is key! Stay back 7 feet from the net to avoid faults, but get to the line for dinking exchanges.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
                `}
                
                <!-- Key Moments Section -->
                ${keyMoments && keyMoments.length > 0 ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">
                        ⭐ Key Moments Analysis
                      </h2>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;">
                        Highlights from your game with Coach Kai's insights
                      </p>
                      
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        ${keyMoments.slice(0, 5).map(moment => generateKeyMomentCard(moment)).join('')}
                      </table>
                      
                      ${keyMoments.length > 5 ? `
                      <div style="margin-top:16px;padding:12px;background:#F9FAFB;border-radius:8px;text-align:center;">
                        <p style="margin:0;font-size:13px;color:#6B7280;">
                          📌 <strong>${keyMoments.length - 5} more moments</strong> analyzed in your full report
                        </p>
                      </div>
                      ` : ''}
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Before/After Comparison -->
                ${videoClipUrl || proVideoUrl ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:#F9FAFB;border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                        🎬 Before/After Comparison
                      </h2>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;text-align:center;">
                        See what you did vs. what to try next
                      </p>
                      
                      <table style="width:100%;" cellpadding="12" cellspacing="0" role="presentation">
                        <tr>
                          <!-- Your Technique -->
                          ${videoClipUrl ? `
                          <td style="width:50%;vertical-align:top;">
                            <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:2px solid #E5E7EB;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                              <div style="padding:12px;background:linear-gradient(135deg, #EF4444 0%, #DC2626 100%);">
                                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;text-align:center;">
                                  📹 What You Did
                                </p>
                              </div>
                              <div style="padding:16px;text-align:center;">
                                <a href="${videoClipUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                                  ▶ Watch Your Shot
                                </a>
                                <p style="margin:12px 0 0 0;font-size:11px;color:#9CA3AF;">
                                  Review your technique
                                </p>
                              </div>
                            </div>
                          </td>
                          ` : ''}
                          
                          <!-- Pro Technique -->
                          ${proVideoUrl ? `
                          <td style="width:50%;vertical-align:top;">
                            <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:2px solid #10B981;box-shadow:0 4px 6px rgba(16,185,129,0.1);">
                              <div style="padding:12px;background:linear-gradient(135deg, #10B981 0%, #059669 100%);">
                                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;text-align:center;">
                                  ⭐ What to Try Next
                                </p>
                              </div>
                              <div style="padding:16px;text-align:center;">
                                <a href="${proVideoUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #10B981 0%, #059669 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                                  ▶ Watch Pro Demo
                                </a>
                                <p style="margin:12px 0 0 0;font-size:11px;color:#9CA3AF;">
                                  Learn the optimal form
                                </p>
                              </div>
                            </div>
                          </td>
                          ` : ''}
                        </tr>
                      </table>
                      
                      <div style="margin-top:20px;padding:16px;background:linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);border-radius:8px;border-left:4px solid #3B82F6;">
                        <p style="margin:0;font-size:13px;color:#1E40AF;line-height:1.6;">
                          💡 <strong>Pro Tip:</strong> Watch both videos side-by-side in the app to see exactly what adjustments to make for better results!
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Top Strengths -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;border-top:1px solid #E5E7EB;">
                      <div style="background:linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);border-radius:12px;padding:20px;border-left:4px solid #10B981;">
                        <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#065F46;">
                          💪 Your Top Strengths
                        </h3>
                        <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                          ${formatList(topStrengths.slice(0, 3), 'strengths')}
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Areas for Improvement -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:0 32px 32px 32px;">
                      <div style="background:linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);border-radius:12px;padding:20px;border-left:4px solid #F59E0B;">
                        <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#92400E;">
                          🎯 Priority Focus Areas
                        </h3>
                        <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                          ${formatList(topImprovements.slice(0, 3), 'improvements')}
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Actionable Insights -->
                ${recommendations && recommendations.length > 0 ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:linear-gradient(to bottom, #F9FAFB 0%, #ffffff 100%);border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">
                        💡 Coach Kai's Recommendations
                      </h2>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;">
                        Personalized action items to improve your game
                      </p>
                      
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        ${recommendations.slice(0, 4).map((rec, idx) => `
                          <tr>
                            <td style="padding:12px 0;">
                              <div style="background:#ffffff;border:2px solid #E5E7EB;border-radius:10px;padding:16px;position:relative;padding-left:56px;">
                                <div style="position:absolute;left:16px;top:16px;width:32px;height:32px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:700;font-size:16px;">
                                  ${idx + 1}
                                </div>
                                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
                                  ${rec}
                                </p>
                              </div>
                            </td>
                          </tr>
                        `).join('')}
                      </table>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Progress Tracking -->
                ${progressComparison && progressComparison.previousScore !== undefined ? `
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:#F9FAFB;border-top:1px solid #E5E7EB;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                        📈 Your Progress
                      </h2>
                      <p style="margin:0 0 24px 0;font-size:14px;color:#6B7280;text-align:center;">
                        Tracking your improvement over time
                      </p>
                      
                      <div style="max-width:400px;margin:0 auto;">
                        <table style="width:100%;" cellpadding="12" cellspacing="0" role="presentation">
                          <tr>
                            <td style="width:50%;text-align:center;vertical-align:top;">
                              <div style="background:#ffffff;border-radius:12px;padding:20px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
                                  Previous Score
                                </p>
                                <p style="margin:0;font-size:36px;font-weight:800;color:#6B7280;">
                                  ${progressComparison.previousScore}
                                </p>
                              </div>
                            </td>
                            <td style="width:50%;text-align:center;vertical-align:top;">
                              <div style="background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);border:2px solid #10B981;border-radius:12px;padding:20px;box-shadow:0 4px 6px rgba(16,185,129,0.1);">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#059669;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
                                  Current Score
                                </p>
                                <p style="margin:0;font-size:36px;font-weight:800;color:#10B981;">
                                  ${overallScore}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        ${progressComparison.improvement && progressComparison.improvement > 0 ? `
                        <div style="margin-top:20px;padding:16px;background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);border-radius:10px;text-align:center;border:2px solid #10B981;">
                          <p style="margin:0 0 4px 0;font-size:14px;color:#059669;font-weight:600;">
                            🎉 You've Improved by
                          </p>
                          <p style="margin:0;font-size:28px;font-weight:800;color:#10B981;">
                            +${progressComparison.improvement} Points!
                          </p>
                        </div>
                        ` : ''}
                        
                        ${progressComparison.milestones && progressComparison.milestones.length > 0 ? `
                        <div style="margin-top:20px;">
                          <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#6B7280;text-align:center;">
                            🏆 Milestones Achieved
                          </p>
                          ${progressComparison.milestones.map(milestone => `
                            <div style="padding:10px;background:#ffffff;border-radius:8px;margin-bottom:8px;border-left:3px solid #14B8A6;">
                              <p style="margin:0;font-size:13px;color:#374151;">
                                ✓ ${milestone}
                              </p>
                            </div>
                          `).join('')}
                        </div>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Coach Kai's Personalized Message -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%);border-top:2px solid #10B981;border-bottom:2px solid #10B981;">
                      <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="width:70px;vertical-align:top;padding-right:16px;">
                            <div style="width:60px;height:60px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 10px 20px rgba(20,184,166,0.3);">
                              🏆
                            </div>
                          </td>
                          <td style="vertical-align:top;">
                            <div style="background:#ffffff;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);position:relative;">
                              <div style="position:absolute;left:-10px;top:28px;width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-right:10px solid #ffffff;"></div>
                              <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#14B8A6;text-transform:uppercase;letter-spacing:1px;">
                                Message from Coach Kai ${scoreEmoji}
                              </p>
                              <p style="margin:0;font-size:16px;color:#1F2937;line-height:1.7;font-style:italic;">
                                "${coachKaiMessage}"
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Call-to-Action Buttons -->
                <table style="width:100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:40px 32px;text-align:center;background:#F9FAFB;">
                      <!-- Primary CTA -->
                      <a href="${appUrl}/train/video?analysis=${analysisId}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:18px;box-shadow:0 10px 25px rgba(20,184,166,0.3);margin-bottom:16px;">
                        🎯 View Full Analysis →
                      </a>
                      
                      <!-- Secondary CTAs -->
                      <table style="margin:24px auto 0 auto;max-width:500px;" cellpadding="8" cellspacing="0" role="presentation">
                        <tr>
                          <td style="text-align:center;">
                            <a href="${appUrl}/train/coach" style="display:inline-block;padding:12px 24px;background:#ffffff;color:#14B8A6;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #14B8A6;">
                              💬 Ask Coach Kai
                            </a>
                          </td>
                          <td style="text-align:center;">
                            <a href="${appUrl}/train/drills" style="display:inline-block;padding:12px 24px;background:#ffffff;color:#14B8A6;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #14B8A6;">
                              🏋️ Practice Drills
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align:center;">
                            <a href="${appUrl}/progress" style="display:inline-block;padding:12px 24px;background:#ffffff;color:#14B8A6;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #14B8A6;">
                              📊 Track Progress
                            </a>
                          </td>
                          <td style="text-align:center;">
                            <a href="${appUrl}/train/video" style="display:inline-block;padding:12px 24px;background:#ffffff;color:#14B8A6;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #14B8A6;">
                              🎥 Upload Another
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin:24px 0 0 0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                        Or copy this link:<br>
                        <span style="color:#6B7280;word-break:break-all;">${appUrl}/train/video?analysis=${analysisId}</span>
                      </p>
                    </td>
                  </tr>
                </table>
                
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding:32px;text-align:center;background:#ffffff;border-radius:0 0 16px 16px;">
                <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#374151;">
                  Keep crushing it with Coach Kai! 🏓
                </p>
                <p style="margin:0 0 20px 0;font-size:14px;color:#6B7280;line-height:1.6;">
                  Your journey to pickleball mastery continues.
                </p>
                
                <table style="margin:0 auto 20px auto;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:0 12px;">
                      <a href="${appUrl}/train/video" style="color:#14B8A6;text-decoration:none;font-size:13px;font-weight:500;">Video Library</a>
                    </td>
                    <td style="padding:0 4px;color:#D1D5DB;">•</td>
                    <td style="padding:0 12px;">
                      <a href="${appUrl}/train/programs" style="color:#14B8A6;text-decoration:none;font-size:13px;font-weight:500;">Training Programs</a>
                    </td>
                    <td style="padding:0 4px;color:#D1D5DB;">•</td>
                    <td style="padding:0 12px;">
                      <a href="${appUrl}/settings" style="color:#14B8A6;text-decoration:none;font-size:13px;font-weight:500;">Settings</a>
                    </td>
                  </tr>
                </table>
                
                <div style="padding-top:16px;border-top:1px solid #E5E7EB;">
                  <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
                    © ${new Date().getFullYear()} Mindful Champion • AI-Powered Pickleball Coaching
                  </p>
                  <p style="margin:0;font-size:11px;color:#9CA3AF;">
                    You received this email because your video analysis was completed.
                  </p>
                </div>
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
