
/**
 * Email helper functions for generating email content
 */

/**
 * Generate a view analysis button HTML
 */
export function generateViewAnalysisButton(analysisId: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXTAUTH_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
  const link = `${url}/train/video?analysis=${analysisId}`
  
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
      <tr>
        <td align="center" bgcolor="#10B981" role="presentation" style="border:none;border-radius:8px;cursor:auto;mso-padding-alt:12px 32px;background:#10B981;" valign="middle">
          <a href="${link}" style="display:inline-block;background:#10B981;color:#ffffff;font-family:Arial, sans-serif;font-size:16px;font-weight:600;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:12px 32px;mso-padding-alt:0px;border-radius:8px;" target="_blank">
            View Full Analysis →
          </a>
        </td>
      </tr>
    </table>
  `
}

/**
 * Format a list of items into HTML with enhanced emojis
 */
export function formatList(items: string[], type: 'strengths' | 'improvements'): string {
  const config = type === 'strengths' 
    ? { emoji: '💪', bgColor: '#ffffff', borderColor: '#10B981', textColor: '#065F46' }
    : { emoji: '🎯', bgColor: '#ffffff', borderColor: '#F59E0B', textColor: '#92400E' }
  
  return items.map((item, index) => `
    <tr>
      <td style="padding:10px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${config.bgColor};border-left:3px solid ${config.borderColor};border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td width="50" valign="top" style="padding:12px 0 12px 12px;text-align:center;">
              <div style="font-size:24px;line-height:1;">
                ${config.emoji}
              </div>
            </td>
            <td style="padding:12px 12px 12px 4px;font-size:14px;line-height:1.6;color:${config.textColor};font-weight:500;">
              ${item}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')
}

/**
 * Generate score badge HTML
 */
export function generateScoreBadge(score: number): string {
  let color = '#10B981' // Green
  let label = 'Excellent'
  
  if (score < 50) {
    color = '#EF4444' // Red
    label = 'Needs Work'
  } else if (score < 70) {
    color = '#F59E0B' // Yellow
    label = 'Good'
  } else if (score < 85) {
    color = '#3B82F6' // Blue
    label = 'Very Good'
  }
  
  return `
    <div style="display:inline-block;padding:8px 16px;background:${color};color:white;border-radius:20px;font-weight:600;font-size:18px;">
      ${score}/100 - ${label}
    </div>
  `
}

/**
 * Generate metric card HTML
 */
export function generateMetricCard(title: string, value: string, subtitle?: string): string {
  return `
    <td style="padding:16px;background:#F9FAFB;border-radius:8px;text-align:center;vertical-align:top;width:33.33%;">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
        ${title}
      </div>
      <div style="font-size:24px;font-weight:700;color:#111827;margin-bottom:4px;">
        ${value}
      </div>
      ${subtitle ? `<div style="font-size:11px;color:#9CA3AF;">${subtitle}</div>` : ''}
    </td>
  `
}
