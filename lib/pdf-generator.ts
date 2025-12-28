
// PDF Generation for Video Analysis Reports

export interface PDFReportData {
  playerName: string
  videoTitle: string
  analysisDate: string
  overallScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  shotAnalysis?: any[]
  movementMetrics?: any
  technicalScores?: any
  keyMoments?: any[]
}

export function generateAnalysisPDF(data: PDFReportData): string {
  // Generate HTML for PDF conversion
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Mindful Champion - Video Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #06b6d4;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #06b6d4;
      margin-bottom: 10px;
    }
    .report-title {
      font-size: 24px;
      font-weight: 600;
      margin-top: 10px;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 8px;
    }
    .score-banner {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      color: white;
      border-radius: 12px;
      margin: 30px 0;
    }
    .score-number {
      font-size: 64px;
      font-weight: bold;
      margin: 10px 0;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #0891b2;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .subsection-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 20px 0 10px 0;
    }
    .strength-item, .improvement-item, .recommendation-item {
      padding: 12px 15px;
      margin: 8px 0;
      border-radius: 8px;
      background: #f9fafb;
      border-left: 4px solid #10b981;
    }
    .improvement-item {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .recommendation-item {
      border-left-color: #06b6d4;
      background: #f0f9ff;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .metric-card {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #0891b2;
      margin-top: 5px;
    }
    .shot-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .shot-table th, .shot-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .shot-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .key-moment {
      padding: 15px;
      margin: 10px 0;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
    }
    .moment-time {
      font-weight: 600;
      color: #8b5cf6;
      font-size: 14px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 10mm; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏆 Mindful Champion</div>
    <div class="report-title">AI-Powered Video Analysis Report</div>
  </div>

  <div class="meta-info">
    <div>
      <strong>Player:</strong> ${data.playerName}<br>
      <strong>Video:</strong> ${data.videoTitle}
    </div>
    <div>
      <strong>Analysis Date:</strong> ${data.analysisDate}<br>
      <strong>Report Generated:</strong> ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="score-banner">
    <div>Overall Performance Score</div>
    <div class="score-number">${data.overallScore}/100</div>
    <div>Professional-Grade AI Analysis</div>
  </div>

  ${data.strengths && data.strengths.length > 0 ? `
  <div class="section">
    <div class="section-title">💪 Key Strengths</div>
    ${data.strengths.map(s => `
      <div class="strength-item">${s}</div>
    `).join('')}
  </div>
  ` : ''}

  ${data.improvements && data.improvements.length > 0 ? `
  <div class="section">
    <div class="section-title">🎯 Areas for Improvement</div>
    ${data.improvements.map(i => `
      <div class="improvement-item">${i}</div>
    `).join('')}
  </div>
  ` : ''}

  ${data.recommendations && data.recommendations.length > 0 ? `
  <div class="section">
    <div class="section-title">💡 AI Recommendations</div>
    ${data.recommendations.map(r => `
      <div class="recommendation-item">${r}</div>
    `).join('')}
  </div>
  ` : ''}

  ${data.shotAnalysis && data.shotAnalysis.length > 0 ? `
  <div class="section">
    <div class="section-title">🏓 Shot Analysis Breakdown</div>
    <table class="shot-table">
      <thead>
        <tr>
          <th>Shot Type</th>
          <th>Count</th>
          <th>Accuracy</th>
          <th>Success Rate</th>
        </tr>
      </thead>
      <tbody>
        ${data.shotAnalysis.map(shot => `
          <tr>
            <td style="text-transform: capitalize;">${shot.type}</td>
            <td>${shot.count}</td>
            <td>${shot.accuracy}%</td>
            <td>${shot.successRate}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${data.movementMetrics ? `
  <div class="section">
    <div class="section-title">🏃 Movement & Positioning Metrics</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Court Coverage</div>
        <div class="metric-value">${data.movementMetrics.courtCoverage}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Movement Efficiency</div>
        <div class="metric-value">${data.movementMetrics.efficiency}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Positioning Score</div>
        <div class="metric-value">${data.movementMetrics.positioning}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Footwork Rating</div>
        <div class="metric-value">${data.movementMetrics.footwork}%</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${data.technicalScores ? `
  <div class="section">
    <div class="section-title">⚙️ Technical Analysis</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Paddle Angle</div>
        <div class="metric-value">${data.technicalScores.paddleAngle}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Follow Through</div>
        <div class="metric-value">${data.technicalScores.followThrough}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Body Rotation</div>
        <div class="metric-value">${data.technicalScores.bodyRotation}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Overall Technique</div>
        <div class="metric-value">${data.technicalScores.overall}%</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${data.keyMoments && data.keyMoments.length > 0 ? `
  <div class="section">
    <div class="section-title">⚡ Key Moments Analysis</div>
    ${data.keyMoments.map(moment => `
      <div class="key-moment">
        <div class="moment-time">${moment.timestampFormatted}</div>
        <strong>${moment.title}</strong>
        <div>${moment.description}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Mindful Champion</strong> - AI-Powered Pickleball Coaching</p>
    <p>This report was generated using advanced computer vision and machine learning algorithms.</p>
    <p>For questions or support, visit mindful-champion-z4u9ws.abacusai.app</p>
  </div>
</body>
</html>
  `

  return html
}
