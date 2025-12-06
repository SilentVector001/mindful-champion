/**
 * Test file for the new enhanced video analysis email template
 * 
 * This demonstrates all the new dynamic features:
 * - Hero header with gradient
 * - Performance dashboard with circular progress indicators
 * - Heat map visualization for court coverage
 * - Key moments analysis with quality indicators
 * - Before/After video comparison
 * - Actionable insights and recommendations
 * - Progress tracking with milestones
 * - Mobile-responsive design
 */

import { generateVideoAnalysisCompleteEmail, VideoAnalysisEmailData } from './lib/email/templates/video-analysis-complete'
import fs from 'fs'

// Sample data showcasing all new features
const sampleEmailData: VideoAnalysisEmailData = {
  recipientName: 'Sarah Johnson',
  analysisId: 'test-analysis-123',
  overallScore: 78,
  topStrengths: [
    'Excellent paddle angle control during serves - consistently maintaining 45-60 degree angle for optimal power',
    'Strong court positioning and kitchen line awareness - maintaining proper distance 95% of the time',
    'Very good body rotation during forehand drives - generating 85% of maximum potential power',
  ],
  topImprovements: [
    'Follow-through needs work on backhand shots - currently stopping mid-swing on 60% of attempts',
    'Footwork could be more dynamic - often flat-footed during opponent attacks',
    'Inconsistent ready position between shots - paddle down 40% of the time',
  ],
  totalShots: 147,
  duration: 1860, // 31 minutes
  analyzedDate: 'December 4, 2025',
  baseUrl: 'https://mindful-champion-2hzb4j.abacusai.app',
  videoThumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=450&fit=crop',
  
  // NEW: Technical breakdown scores
  technicalScores: {
    paddleAngle: 85,
    followThrough: 72,
    bodyRotation: 76,
    footwork: 68,
    positioning: 82,
  },
  
  // NEW: Key moments with timestamps and quality indicators
  keyMoments: [
    {
      timestamp: '03:45',
      quality: 'excellent',
      description: 'Perfect third-shot drop with ideal trajectory and placement - exactly what we want to see! This forced your opponent into a defensive position.',
      type: 'Third Shot Drop',
    },
    {
      timestamp: '08:12',
      quality: 'needs-improvement',
      description: 'Backhand return lacked follow-through, resulting in a weak shot that landed mid-court. Remember to extend your arm fully after contact.',
      type: 'Backhand Return',
    },
    {
      timestamp: '15:30',
      quality: 'excellent',
      description: 'Outstanding dink exchange! You maintained soft hands and precise placement for 8 consecutive shots. This is championship-level control.',
      type: 'Dink Rally',
    },
    {
      timestamp: '19:47',
      quality: 'good',
      description: 'Solid overhead smash with good power, though positioning could have been slightly deeper for a more aggressive angle.',
      type: 'Overhead Smash',
    },
    {
      timestamp: '24:15',
      quality: 'needs-improvement',
      description: 'Footwork was slow on this cross-court shot. You were off-balance when hitting, which affected accuracy. Work on split-step timing.',
      type: 'Cross-Court Drive',
    },
    {
      timestamp: '28:33',
      quality: 'excellent',
      description: 'Beautiful erne! Perfect timing and execution. You anticipated the opponent\'s shot perfectly and positioned yourself for an aggressive put-away.',
      type: 'Erne',
    },
  ],
  
  // NEW: Heat map data showing court coverage
  heatMapData: {
    zones: [
      { position: 'Left Front', coverage: 45, quality: 68 },
      { position: 'Center Front', coverage: 82, quality: 85 },
      { position: 'Right Front', coverage: 38, quality: 62 },
      { position: 'Left Mid', coverage: 65, quality: 72 },
      { position: 'Center Mid', coverage: 88, quality: 90 },
      { position: 'Right Mid', coverage: 58, quality: 70 },
      { position: 'Left Back', coverage: 28, quality: 55 },
      { position: 'Center Back', coverage: 42, quality: 65 },
      { position: 'Right Back', coverage: 25, quality: 50 },
    ],
  },
  
  // NEW: Progress comparison with previous analysis
  progressComparison: {
    previousScore: 71,
    improvement: 7,
    milestones: [
      'First time scoring above 75!',
      'Improved paddle angle by 12 points',
      'Reduced unforced errors by 35%',
      'Maintained kitchen line discipline in 95% of rallies',
    ],
  },
  
  // NEW: Personalized recommendations
  recommendations: [
    'Practice backhand follow-through drills for 10 minutes daily. Focus on extending your arm fully after contact point.',
    'Work on lateral movement patterns. Set up cones and practice side-to-side shuffle drills to improve court coverage.',
    'Implement the "split-step" drill before each opponent contact. This will improve your reaction time by 30-40%.',
    'Watch the professional comparison video to see optimal body rotation during serves. Notice how pros engage their core muscles.',
  ],
  
  // NEW: Video clip URLs for before/after comparison
  videoClipUrl: 'https://mindful-champion-2hzb4j.abacusai.app/clips/your-backhand-technique',
  proVideoUrl: 'https://mindful-champion-2hzb4j.abacusai.app/clips/pro-backhand-demo',
}

// Generate the email HTML
console.log('🎨 Generating enhanced video analysis email with all new features...\n')

const emailHTML = generateVideoAnalysisCompleteEmail(sampleEmailData)

// Save to file for preview
const outputPath = './test-email-output.html'
fs.writeFileSync(outputPath, emailHTML)

console.log('✅ Email generated successfully!')
console.log(`📄 Saved to: ${outputPath}`)
console.log('\n📊 New Features Included:')
console.log('  ✓ Eye-catching hero banner with gradient')
console.log('  ✓ Performance dashboard with circular progress indicators')
console.log('  ✓ Technical metrics breakdown (Paddle Angle, Follow Through, Body Rotation, Footwork)')
console.log('  ✓ Court coverage heat map visualization (9 zones)')
console.log('  ✓ Key moments analysis with timestamps (6 moments)')
console.log('  ✓ Quality indicators (Excellent, Good, Needs Improvement)')
console.log('  ✓ Before/After video comparison section')
console.log('  ✓ Actionable insights (4 personalized recommendations)')
console.log('  ✓ Progress tracking with milestone badges')
console.log('  ✓ Multiple CTAs (View Analysis, Ask Coach, Practice Drills, Track Progress)')
console.log('  ✓ Mobile-responsive design')
console.log('  ✓ Enhanced visual styling with gradients and shadows')
console.log('\n🎯 To preview: Open test-email-output.html in a browser')
console.log('\n💡 Integration Instructions:')
console.log('  1. Update your API endpoint to include the new optional fields')
console.log('  2. Pass technicalScores, keyMoments, heatMapData, etc. when available')
console.log('  3. All new fields are optional - template works with or without them')
console.log('  4. Existing functionality is fully preserved for backward compatibility')

// Also create a minimal example (backward compatibility test)
const minimalEmailData: VideoAnalysisEmailData = {
  recipientName: 'John Doe',
  analysisId: 'minimal-123',
  overallScore: 65,
  topStrengths: ['Good serve placement', 'Consistent returns'],
  topImprovements: ['Work on footwork', 'Improve backhand'],
  analyzedDate: 'December 4, 2025',
}

const minimalEmailHTML = generateVideoAnalysisCompleteEmail(minimalEmailData)
fs.writeFileSync('./test-email-output-minimal.html', minimalEmailHTML)

console.log('\n✅ Also generated minimal version (backward compatibility test)')
console.log('📄 Saved to: test-email-output-minimal.html')
console.log('\n✨ The new template gracefully handles both full and minimal data!')
