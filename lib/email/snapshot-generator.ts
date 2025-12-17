/**
 * Snapshot Generator for Email Before/After Comparisons
 * 
 * This utility generates visual comparison data for email templates.
 * In a production environment, this could generate actual images using
 * libraries like node-canvas or puppeteer.
 */

export interface VideoAnalysisSnapshot {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  shotStats?: {
    total: number
    byType: Record<string, number>
  }
  movementMetrics?: {
    courtCoverage: number
    positioningScore: number
  }
  technicalScores?: Record<string, number>
}

export interface ComparisonSnapshot {
  before?: VideoAnalysisSnapshot
  current: VideoAnalysisSnapshot
  improvements: string[]
  percentageIncrease?: number
}

/**
 * Generate comparison data for email template
 */
export function generateComparisonSnapshot(
  currentAnalysis: VideoAnalysisSnapshot,
  previousAnalysis?: VideoAnalysisSnapshot
): ComparisonSnapshot {
  const improvements: string[] = []
  let percentageIncrease = 0
  
  if (previousAnalysis) {
    // Calculate overall score improvement
    const scoreDiff = currentAnalysis.overallScore - previousAnalysis.overallScore
    if (scoreDiff > 0) {
      percentageIncrease = (scoreDiff / previousAnalysis.overallScore) * 100
      improvements.push(`Overall score improved by ${Math.round(percentageIncrease)}%`)
    }
    
    // Compare technical scores
    if (currentAnalysis.technicalScores && previousAnalysis.technicalScores) {
      Object.keys(currentAnalysis.technicalScores).forEach(key => {
        const currentScore = currentAnalysis.technicalScores![key]
        const previousScore = previousAnalysis.technicalScores![key]
        
        if (currentScore && previousScore && currentScore > previousScore) {
          const diff = ((currentScore - previousScore) / previousScore * 100).toFixed(1)
          improvements.push(`${formatMetricName(key)} improved by ${diff}%`)
        }
      })
    }
    
    // Compare shot statistics
    if (currentAnalysis.shotStats && previousAnalysis.shotStats) {
      const currentTotal = currentAnalysis.shotStats.total
      const previousTotal = previousAnalysis.shotStats.total
      
      if (currentTotal > previousTotal) {
        improvements.push(`${currentTotal - previousTotal} more shots analyzed`)
      }
    }
  }
  
  return {
    before: previousAnalysis,
    current: currentAnalysis,
    improvements,
    percentageIncrease: percentageIncrease > 0 ? Math.round(percentageIncrease) : undefined,
  }
}

/**
 * Generate HTML for snapshot comparison (used in email templates)
 */
export function generateSnapshotHTML(snapshot: ComparisonSnapshot): string {
  if (!snapshot.before) {
    return `
      <table style="width:100%;background:#F9FAFB;border-radius:8px;padding:16px;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;padding:16px;">
            <p style="margin:0;font-size:14px;color:#6B7280;">
              This is your first analysis. Keep uploading videos to track your progress!
            </p>
          </td>
        </tr>
      </table>
    `
  }
  
  const improvementsHTML = snapshot.improvements.length > 0
    ? snapshot.improvements.map(imp => `
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#374151;">
            <span style="color:#10B981;font-weight:600;margin-right:6px;">✓</span>
            ${imp}
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Continue practicing to see improvements!</td></tr>'
  
  return `
    <table style="width:100%;background:#F9FAFB;border-radius:8px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <h4 style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#111827;">
            📊 Progress Comparison
          </h4>
          
          <!-- Score Comparison -->
          <table style="width:100%;margin-bottom:16px;" cellpadding="8" cellspacing="0">
            <tr>
              <td style="width:50%;text-align:center;background:#ffffff;border-radius:6px;padding:12px;">
                <div style="font-size:11px;color:#6B7280;text-transform:uppercase;margin-bottom:4px;">Previous</div>
                <div style="font-size:20px;font-weight:700;color:#9CA3AF;">${snapshot.before.overallScore}</div>
              </td>
              <td style="width:50%;text-align:center;background:#ECFDF5;border-radius:6px;padding:12px;">
                <div style="font-size:11px;color:#10B981;text-transform:uppercase;margin-bottom:4px;">Current</div>
                <div style="font-size:20px;font-weight:700;color:#10B981;">${snapshot.current.overallScore}</div>
              </td>
            </tr>
          </table>
          
          <!-- Improvements List -->
          ${snapshot.improvements.length > 0 ? `
            <table style="width:100%;" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#374151;">Key Improvements:</p>
                </td>
              </tr>
              ${improvementsHTML}
            </table>
          ` : ''}
        </td>
      </tr>
    </table>
  `
}

/**
 * Format metric names for display
 */
function formatMetricName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

/**
 * Extract snapshot data from video analysis result
 */
export function extractSnapshotFromAnalysis(analysis: any): VideoAnalysisSnapshot {
  return {
    overallScore: analysis.overallScore || 0,
    strengths: Array.isArray(analysis.strengths) 
      ? analysis.strengths 
      : (typeof analysis.strengths === 'object' ? Object.values(analysis.strengths) : []),
    weaknesses: Array.isArray(analysis.areasForImprovement)
      ? analysis.areasForImprovement
      : (typeof analysis.areasForImprovement === 'object' ? Object.values(analysis.areasForImprovement) : []),
    shotStats: analysis.shotTypes ? {
      total: analysis.totalShots || 0,
      byType: analysis.shotTypes,
    } : undefined,
    movementMetrics: analysis.movementMetrics || undefined,
    technicalScores: analysis.technicalScores || undefined,
  }
}
