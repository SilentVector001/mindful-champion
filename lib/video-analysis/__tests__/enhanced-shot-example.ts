/**
 * Example of Enhanced Shot Analysis Data
 * Demonstrates the new comprehensive intelligence features
 */

import type { DetectedShot } from '../llm-shot-detector';

/**
 * Example 1: Excellent Third Shot Drop (Optimal Choice)
 */
export const optimalThirdShotDrop: DetectedShot = {
  id: 1,
  time: 12.5,
  type: 'Third Shot Drop',
  quality: 'excellent',
  score: 92,
  frameIndex: 5,
  analysis: {
    technique: 'Perfect soft touch with excellent paddle control',
    power: 35,
    accuracy: 95,
    timing: 90,
    positioning: 88,
    notes: [
      'Excellent paddle angle at contact for soft landing',
      'Good weight transfer into the shot',
      'Perfect follow-through arc'
    ],
    improvements: [
      'Could add a bit more topspin for margin'
    ]
  },
  courtPosition: {
    courtZone: 'baseline',
    positionQuality: 88,
    courtCoverage: 85,
    balanceAndStance: 92
  },
  shotSelection: {
    shotPurpose: 'Neutralize opponent advantage and move up to kitchen',
    wasItOptimal: true,
    betterAlternative: null,
    tacticalReasoning: 'After a deep return, the third shot drop is the textbook play. This forces opponents to hit up from the kitchen, giving you time to advance to the net. Perfect choice for this situation.'
  },
  decisionMaking: {
    situationReading: 90,
    anticipation: 88,
    riskAssessment: 'perfect',
    gameAwareness: 92
  },
  tacticalFeedback: {
    strengths: [
      'Perfect use of the third shot drop to reset the point',
      'Great patience not forcing a winner from the baseline',
      'Smart choice that sets up net position'
    ],
    improvements: [
      'Continue working on this shot as it\'s a key weapon',
      'Practice varying the depth occasionally to keep opponents guessing'
    ],
    coachKaiTip: 'The third shot drop is the bridge from defense to offense - master this shot and you control the point.'
  },
  positioningImprovements: {
    currentPositionIssues: null,
    optimalPosition: 'Right at the baseline with good ready stance',
    recoveryPath: 'After this drop, immediately move forward to the kitchen line',
    footworkNotes: 'Great split step after hitting, ready to advance'
  }
};

/**
 * Example 2: Risky Drive (Could Have Been Better)
 */
export const riskyDriveFromTransition: DetectedShot = {
  id: 2,
  time: 18.3,
  type: 'Forehand Drive',
  quality: 'good',
  score: 72,
  frameIndex: 12,
  analysis: {
    technique: 'Good power generation but contact point slightly late',
    power: 88,
    accuracy: 65,
    timing: 70,
    positioning: 60,
    notes: [
      'Strong paddle speed through the ball',
      'Good upper body rotation'
    ],
    improvements: [
      'Contact point could be earlier for better control',
      'Feet were still moving during contact'
    ]
  },
  courtPosition: {
    courtZone: 'transition-zone',
    positionQuality: 55,
    courtCoverage: 65,
    balanceAndStance: 60
  },
  shotSelection: {
    shotPurpose: 'Try to hit through opponents at net',
    wasItOptimal: false,
    betterAlternative: 'A reset shot or soft dink would have been safer from the transition zone',
    tacticalReasoning: 'While the drive has pace, hitting hard from the transition zone against opponents at the kitchen is risky. They have better angles and can counter-attack easily. The error rate is high from this position.'
  },
  decisionMaking: {
    situationReading: 65,
    anticipation: 60,
    riskAssessment: 'too-aggressive',
    gameAwareness: 68
  },
  tacticalFeedback: {
    strengths: [
      'Good aggressive mentality to keep opponents honest',
      'Power generation was solid'
    ],
    improvements: [
      'From the transition zone, prioritize getting to the kitchen over hitting winners',
      'Save the aggressive drives for when you\'re fully set at the baseline',
      'Learn to recognize when opponents have positional advantage'
    ],
    coachKaiTip: 'Position beats power - when they\'re at the net and you\'re in transition, patience wins points.'
  },
  positioningImprovements: {
    currentPositionIssues: 'Caught in transition zone (no-man\'s land) with poor balance',
    optimalPosition: 'Either at kitchen line or back at baseline - avoid lingering in transition',
    recoveryPath: 'After the shot, either commit forward to kitchen or retreat to baseline',
    footworkNotes: 'Need to use split step and get feet set before swinging'
  }
};

/**
 * Example 3: Conservative Dink (Too Safe)
 */
export const conservativeDink: DetectedShot = {
  id: 3,
  time: 25.7,
  type: 'Dink',
  quality: 'good',
  score: 75,
  frameIndex: 18,
  analysis: {
    technique: 'Clean contact with good paddle control',
    power: 25,
    accuracy: 82,
    timing: 80,
    positioning: 85,
    notes: [
      'Soft hands with good touch',
      'Excellent ready position at kitchen line',
      'Good paddle angle'
    ],
    improvements: [
      'Could be more aggressive with placement',
      'Try moving the ball around more'
    ]
  },
  courtPosition: {
    courtZone: 'kitchen-line',
    positionQuality: 90,
    courtCoverage: 88,
    balanceAndStance: 92
  },
  shotSelection: {
    shotPurpose: 'Keep the ball in play safely',
    wasItOptimal: false,
    betterAlternative: 'Crosscourt dink to opponent\'s backhand would create a better attacking opportunity',
    tacticalReasoning: 'While the dink was well-executed, it went straight back to your opponent\'s strength. With both players at the kitchen and good balance, this was a perfect opportunity to move the ball and create an opening.'
  },
  decisionMaking: {
    situationReading: 70,
    anticipation: 75,
    riskAssessment: 'too-conservative',
    gameAwareness: 72
  },
  tacticalFeedback: {
    strengths: [
      'Excellent position and balance at kitchen line',
      'Good technique on the dink execution',
      'Patient approach to the point'
    ],
    improvements: [
      'Look to attack the middle or opponent\'s weaker side more often',
      'Use dinks to set up attacks, not just keep ball in play',
      'When you have good position, be more aggressive with placement'
    ],
    coachKaiTip: 'At the kitchen line with good balance, it\'s your court to control - make your opponents uncomfortable with varied placement.'
  },
  positioningImprovements: {
    currentPositionIssues: null,
    optimalPosition: 'Perfect position at kitchen line with balanced stance',
    recoveryPath: 'Maintain kitchen line position, ready to counter',
    footworkNotes: 'Excellent ready position - now add lateral movement to dictate angles'
  }
};

/**
 * Example 4: Perfect Overhead Smash
 */
export const perfectOverheadSmash: DetectedShot = {
  id: 4,
  time: 31.2,
  type: 'Overhead Smash',
  quality: 'excellent',
  score: 95,
  frameIndex: 23,
  analysis: {
    technique: 'Powerful overhead with excellent form',
    power: 95,
    accuracy: 92,
    timing: 93,
    positioning: 90,
    notes: [
      'Perfect contact point high and in front',
      'Explosive hip and shoulder rotation',
      'Great follow-through down the line',
      'Excellent positioning under the ball'
    ],
    improvements: []
  },
  courtPosition: {
    courtZone: 'mid-court',
    positionQuality: 95,
    courtCoverage: 85,
    balanceAndStance: 93
  },
  shotSelection: {
    shotPurpose: 'Finish the point with winner',
    wasItOptimal: true,
    betterAlternative: null,
    tacticalReasoning: 'When given a high, attackable ball with good court position and opponents out of position, the overhead is the right call. Perfect execution of an offensive opportunity.'
  },
  decisionMaking: {
    situationReading: 95,
    anticipation: 92,
    riskAssessment: 'perfect',
    gameAwareness: 94
  },
  tacticalFeedback: {
    strengths: [
      'Recognized the attackable ball immediately',
      'Positioned perfectly under the ball for maximum power',
      'Aimed at the open court away from opponents',
      'Confident, aggressive shot selection when opportunity presented'
    ],
    improvements: [],
    coachKaiTip: 'When the ball goes up, you go for it - hesitation is the enemy of the overhead smash. You executed this perfectly.'
  },
  positioningImprovements: {
    currentPositionIssues: null,
    optimalPosition: 'Perfect positioning in mid-court, directly under the ball',
    recoveryPath: 'After this winner, reset to center ready position',
    footworkNotes: 'Excellent footwork getting into position quickly - textbook overhead setup'
  }
};

/**
 * Collection of all examples for testing
 */
export const exampleShots: DetectedShot[] = [
  optimalThirdShotDrop,
  riskyDriveFromTransition,
  conservativeDink,
  perfectOverheadSmash
];

/**
 * Example analysis result with multiple shots
 */
export const exampleAnalysisResult = {
  detectedShots: exampleShots,
  totalFramesAnalyzed: 25,
  detectionConfidence: 88,
  summary: {
    totalShots: 4,
    excellentShots: 2,
    goodShots: 2,
    needsWorkShots: 0,
    optimalDecisions: 2,
    suboptimalDecisions: 2
  }
};
