import { generateVideoAnalysisCompleteEmail, VideoAnalysisEmailData } from '../lib/email/templates/video-analysis-complete'
import { sendEmail } from '../lib/email/gmail-service'

/**
 * Test script for video analysis email with all visual elements
 * Run with: npx tsx scripts/test-video-analysis-email.ts YOUR_EMAIL@gmail.com
 */

async function testVideoAnalysisEmail() {
  const recipientEmail = process.argv[2]
  
  if (!recipientEmail) {
    console.error('❌ Error: Please provide recipient email address')
    console.log('Usage: npx tsx scripts/test-video-analysis-email.ts YOUR_EMAIL@gmail.com')
    process.exit(1)
  }
  
  console.log('🎾 Generating test video analysis email...')
  console.log(`📧 Recipient: ${recipientEmail}`)
  
  // Comprehensive test data with all visual elements
  const testData: VideoAnalysisEmailData = {
    recipientName: 'Sarah Johnson',
    analysisId: 'test-analysis-123',
    overallScore: 78,
    topStrengths: [
      'Excellent dink shot control at the kitchen line - your soft touch and placement are really strong',
      'Consistent paddle angle on forehand drives - you maintain great form throughout the stroke',
      'Strong court positioning - you anticipate well and move efficiently to the right spots'
    ],
    topImprovements: [
      'Work on backhand follow-through - extend your arm more completely after contact',
      'Improve footwork transitions - take smaller steps when moving to the net',
      'Enhance serve variety - mix in more spin and placement variations to keep opponents guessing'
    ],
    totalShots: 142,
    duration: 1820, // 30 minutes 20 seconds
    analyzedDate: new Date().toISOString(),
    baseUrl: 'https://mindful-champion-2hzb4j.abacusai.app',
    
    // Technical scores
    technicalScores: {
      paddleAngle: 82,
      followThrough: 75,
      bodyRotation: 68,
      footwork: 73,
      positioning: 80
    },
    
    // Key moments with different quality levels
    keyMoments: [
      {
        timestamp: '2:15',
        quality: 'excellent',
        description: 'Perfect cross-court dink with great angle and soft touch. This is exactly the kind of shot that wins points at the net.',
        type: 'Dink Shot'
      },
      {
        timestamp: '5:42',
        quality: 'good',
        description: 'Solid third shot drop with good height over the net. Nice control, could be a bit deeper to push opponents back.',
        type: 'Third Shot Drop'
      },
      {
        timestamp: '8:30',
        quality: 'needs-improvement',
        description: 'Backhand volley at the net lacked follow-through. Extend your arm more and rotate your body for better power.',
        type: 'Backhand Volley'
      },
      {
        timestamp: '12:18',
        quality: 'excellent',
        description: 'Beautiful overhead smash! Great positioning, timing, and power. You really crushed this one.',
        type: 'Overhead Smash'
      },
      {
        timestamp: '15:55',
        quality: 'good',
        description: 'Effective drive serve to the backhand side. Good pace and placement, just watch that toss height.',
        type: 'Serve'
      }
    ],
    
    // Heat map data - 3x3 grid
    heatMapData: {
      zones: [
        { position: 'Back Left', coverage: 45, quality: 62 },
        { position: 'Back Center', coverage: 52, quality: 68 },
        { position: 'Back Right', coverage: 38, quality: 55 },
        { position: 'Mid Left', coverage: 68, quality: 75 },
        { position: 'Mid Center', coverage: 72, quality: 80 },
        { position: 'Mid Right', coverage: 65, quality: 72 },
        { position: 'Kitchen Left', coverage: 85, quality: 88 },
        { position: 'Kitchen Center', coverage: 90, quality: 92 },
        { position: 'Kitchen Right', coverage: 82, quality: 85 }
      ]
    },
    
    // Progress comparison
    progressComparison: {
      previousScore: 65,
      improvement: 13,
      milestones: [
        'Reached 75+ score for the first time! 🎉',
        'Improved dink consistency by 25%',
        'Reduced unforced errors from 18 to 12 per game'
      ]
    },
    
    // Coach recommendations
    recommendations: [
      'Focus on backhand drills this week - spend 15 minutes daily on shadow swings with proper follow-through',
      'Practice quick split-step footwork at the net - this will help you react faster to opponent shots',
      'Watch pro player Ben Johns\' dinking technique videos - his soft game is world-class and great to learn from',
      'Try adding topspin to your serves for more consistency and to keep the ball low after the bounce'
    ],
    
    // Video URLs (optional - comment out if not available)
    // videoThumbnail: 'https://static.vecteezy.com/system/resources/thumbnails/069/036/786/small_2x/fluid-teal-waves-with-glowing-bokeh-lights-in-abstract-motion-video.jpg',
    // videoClipUrl: 'https://example.com/your-shot-clip',
    // proVideoUrl: 'https://example.com/pro-technique'
  }
  
  console.log('📝 Generating email HTML...')
  const emailHtml = generateVideoAnalysisCompleteEmail(testData)
  
  console.log(`✉️  Email HTML generated (${emailHtml.length} characters)`)
  
  // Send the email
  console.log('📮 Sending test email...')
  try {
    await sendEmail({
      to: recipientEmail,
      subject: '🎾 Your Video Analysis is Ready! (TEST)',
      html: emailHtml,
      type: 'COACH_KAI' as const
    })
    
    console.log('✅ Test email sent successfully!')
    console.log('')
    console.log('📋 Visual elements included:')
    console.log('   ✓ Hero header with gradient background')
    console.log('   ✓ Video thumbnail placeholder with play button')
    console.log('   ✓ Performance dashboard with circular progress indicators')
    console.log('   ✓ Technical metrics with emojis (Paddle Angle, Follow Through, etc.)')
    console.log('   ✓ Court coverage heat map with emoji indicators (🟢🟡🔴)')
    console.log('   ✓ Inline SVG pickleball court diagram')
    console.log('   ✓ Key moments analysis with quality badges')
    console.log('   ✓ Strengths and improvements with enhanced formatting')
    console.log('   ✓ Progress tracking with before/after comparison')
    console.log('   ✓ Coach Kai\'s personalized message')
    console.log('   ✓ Multiple CTA buttons')
    console.log('')
    console.log('🔍 Please check your Gmail inbox and verify:')
    console.log('   1. All emojis are displaying correctly')
    console.log('   2. SVG graphics (circles, court diagram) are rendering')
    console.log('   3. Colors and gradients are visible')
    console.log('   4. Layout is responsive and not broken')
    console.log('   5. All sections are properly spaced')
    console.log('')
    console.log('💡 Note: Gmail may take a few seconds to deliver the email')
    
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    process.exit(1)
  }
}

// Run the test
testVideoAnalysisEmail()
