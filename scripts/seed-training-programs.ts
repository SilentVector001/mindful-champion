import { PrismaClient, SkillLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seeding comprehensive training programs...')

  // Delete existing programs to avoid duplicates
  await prisma.trainingProgram.deleteMany({})
  console.log('✅ Cleared existing programs')

  const programs = [
    // ====================================================================
    // BEGINNER PROGRAM 1: Comprehensive Fundamentals
    // ====================================================================
    {
      programId: 'beginner-fundamentals',
      name: 'Pickleball Fundamentals',
      tagline: 'Master the basics and build a solid foundation',
      description: 'Perfect for complete beginners! This 14-day comprehensive program covers everything you need to start playing pickleball with confidence. Learn proper grip, stance, footwork, basic shots (serve, return, dink, volley), court positioning, and the rules of the game. Each day builds on the previous with clear objectives and measurable outcomes.',
      skillLevel: SkillLevel.BEGINNER,
      durationDays: 14,
      estimatedTimePerDay: '30-40 minutes',
      keyOutcomes: [
        'Master proper continental grip and ready position',
        'Execute consistent serves with 80%+ success rate',
        'Return serves deep into the court consistently',
        'Develop foundational dinking skills at the kitchen line',
        'Understand basic court positioning and strategy',
        'Learn complete rules and scoring system',
        'Build confidence for recreational play'
      ],
      dailyStructure: {
        days: [
          {
            day: 1,
            title: 'Welcome to Pickleball: Grip & Ready Position',
            focus: 'Grip and Stance Fundamentals',
            estimated_minutes: 30,
            difficulty_level: 1,
            videos: ['pickleball-grip-basics', 'ready-position-tutorial'],
            practice_goals: [
              'Learn and practice the continental grip (handshake grip) for 10 minutes',
              'Practice ready position: knees bent, paddle up, weight on balls of feet',
              'Shadow swing 50 forehand and 50 backhand strokes focusing on grip',
              'Practice grip transitions between forehand and backhand 20 times',
              'Film yourself and compare to instructional video'
            ],
            success_metric: 'Can hold continental grip comfortably and demonstrate ready position with proper form',
            exercises: [
              '5min warm-up: Light stretching and wrist rotations',
              '10min: Continental grip practice and grip pressure exercises',
              '10min: Ready position drills - quick feet movement while maintaining position',
              '5min: Shadow swings - slow, controlled movements',
              '5min: Cool down and grip check'
            ]
          },
          {
            day: 2,
            title: 'The Serve: Your First Shot',
            focus: 'Basic Serve Mechanics',
            estimated_minutes: 35,
            difficulty_level: 1,
            videos: ['basic-serve-tutorial', 'serve-stance-positioning'],
            practice_goals: [
              'Learn proper serving stance (feet position, body alignment)',
              'Practice underhand serving motion 30 times without ball',
              'Serve 50 balls focusing on contact point below waist',
              'Aim for consistency rather than power - target 60% in play',
              'Practice serving from both right and left sides of court'
            ],
            success_metric: 'Successfully land 30 out of 50 serves in the correct service box',
            exercises: [
              '5min warm-up: Arm circles and shoulder stretches',
              '5min: Serving stance and weight transfer practice',
              '10min: Shadow serving motion - focus on smooth, controlled swing',
              '12min: Live serving practice - 50 serves with feedback',
              '3min: Cool down stretching'
            ]
          },
          {
            day: 3,
            title: 'Return of Serve Fundamentals',
            focus: 'Return Positioning and Technique',
            estimated_minutes: 35,
            difficulty_level: 2,
            videos: ['return-of-serve-basics', 'deep-return-strategy'],
            practice_goals: [
              'Learn optimal return position (behind baseline, centered)',
              'Practice split-step timing as opponent contacts serve',
              'Hit 40 return practice shots aiming for deep returns',
              'Work on both forehand and backhand returns (20 each)',
              'Focus on consistent contact - depth over power'
            ],
            success_metric: 'Return 25 out of 40 serves past the kitchen line with controlled pace',
            exercises: [
              '5min warm-up: Dynamic stretching and footwork drills',
              '8min: Split-step and reaction time practice',
              '15min: Return practice with partner or ball machine',
              '5min: Target practice - aim for depth zones',
              '2min: Cool down'
            ]
          },
          {
            day: 4,
            title: 'Introduction to Dinking',
            focus: 'Soft Game Development',
            estimated_minutes: 35,
            difficulty_level: 2,
            videos: ['dinking-basics', 'kitchen-line-positioning'],
            practice_goals: [
              'Learn proper dinking grip and paddle angle (face slightly open)',
              'Practice dinking motion - short backswing, push through ball',
              'Complete 50 consecutive dinks with partner or wall',
              'Focus on arc and soft landing just over net into kitchen',
              'Practice moving side-to-side while maintaining dink quality'
            ],
            success_metric: 'Maintain a 20-shot dink rally with consistent height and placement',
            exercises: [
              '5min warm-up: Wrist flexibility and paddle control exercises',
              '10min: Static dinking practice - focus on feel and touch',
              '12min: Moving dink drills - side-to-side coverage',
              '6min: Dink rally challenge with partner',
              '2min: Forearm stretch and cool down'
            ]
          },
          {
            day: 5,
            title: 'Forehand Drive Technique',
            focus: 'Power Groundstrokes',
            estimated_minutes: 40,
            difficulty_level: 2,
            videos: ['forehand-drive-mechanics', 'topspin-basics'],
            practice_goals: [
              'Learn forehand drive stance and preparation',
              'Practice weight transfer from back foot to front foot',
              'Hit 60 forehand drives focusing on low-to-high swing path',
              'Develop consistent contact point in front of body',
              'Introduction to topspin concept (brush up on ball)'
            ],
            success_metric: 'Hit 40 out of 60 forehand drives in play with consistent trajectory',
            exercises: [
              '5min warm-up: Rotation exercises and core activation',
              '10min: Shadow swings and footwork patterns',
              '18min: Live forehand drive practice - baseline rallies',
              '5min: Target accuracy drill - hit designated zones',
              '2min: Cool down and reflection'
            ]
          },
          {
            day: 6,
            title: 'Backhand Drive Development',
            focus: 'Two-Handed Backhand Technique',
            estimated_minutes: 40,
            difficulty_level: 2,
            videos: ['backhand-drive-tutorial', 'two-handed-technique'],
            practice_goals: [
              'Learn two-handed backhand grip and stance',
              'Practice shoulder turn and hip rotation for power',
              'Hit 60 backhand drives with focus on follow-through',
              'Work on consistency and depth rather than power',
              'Practice transitioning from forehand to backhand'
            ],
            success_metric: 'Successfully execute 35 out of 60 backhand drives with good form and depth',
            exercises: [
              '5min warm-up: Thoracic spine rotation and arm swings',
              '8min: Backhand shadow drills with mirror feedback',
              '20min: Live backhand practice - cross-court and down-the-line',
              '5min: Alternating forehand-backhand drill',
              '2min: Cool down stretching'
            ]
          },
          {
            day: 7,
            title: 'Volley Fundamentals',
            focus: 'Net Play Basics',
            estimated_minutes: 38,
            difficulty_level: 3,
            videos: ['volley-technique', 'net-positioning'],
            practice_goals: [
              'Learn proper volley ready position (paddle high, compressed stance)',
              'Practice short punch volley motion - no backswing',
              'Hit 40 forehand volleys and 40 backhand volleys',
              'Focus on firm wrist and directing ball with paddle face',
              'Practice quick reaction volleys at closer range'
            ],
            success_metric: 'Execute 30 out of 40 volleys on both forehand and backhand with control',
            exercises: [
              '5min warm-up: Quick feet drills and paddle work',
              '8min: Volley technique practice with slow feeds',
              '15min: Progressive volley drill - increasing speed',
              '8min: Rapid-fire volley challenge',
              '2min: Cool down'
            ]
          },
          {
            day: 8,
            title: 'Rules, Scoring & Court Positioning',
            focus: 'Game Knowledge',
            estimated_minutes: 30,
            difficulty_level: 1,
            videos: ['pickleball-rules-complete', 'scoring-system'],
            practice_goals: [
              'Learn complete pickleball rules and two-bounce rule',
              'Understand scoring system and serving rotation',
              'Study court dimensions and kitchen/NVZ rules',
              'Learn basic singles and doubles positioning',
              'Practice calling the score correctly 20 times'
            ],
            success_metric: 'Correctly explain all basic rules and demonstrate proper score calling',
            exercises: [
              '15min: Watch rules videos and take notes',
              '10min: Quiz yourself on rules scenarios',
              '5min: Practice score calling in different game situations'
            ]
          },
          {
            day: 9,
            title: 'Court Movement & Footwork',
            focus: 'Athletic Development',
            estimated_minutes: 38,
            difficulty_level: 3,
            videos: ['pickleball-footwork', 'court-coverage'],
            practice_goals: [
              'Learn split-step technique and timing',
              'Practice lateral movement patterns (shuffle steps)',
              'Work on forward and backward movement efficiency',
              'Practice quick direction changes and recovery',
              'Complete footwork ladder drills for agility'
            ],
            success_metric: 'Demonstrate proper split-step and efficient court coverage in mini-games',
            exercises: [
              '5min warm-up: Dynamic stretching and movement prep',
              '10min: Footwork ladder drills (if available) or cone drills',
              '15min: Court movement patterns with shot integration',
              '6min: Reaction and recovery drills',
              '2min: Cool down and leg stretches'
            ]
          },
          {
            day: 10,
            title: 'Third Shot Introduction',
            focus: 'Drop Shot Basics',
            estimated_minutes: 40,
            difficulty_level: 3,
            videos: ['third-shot-drop-intro', 'transition-strategy'],
            practice_goals: [
              'Understand the purpose of the third shot drop',
              'Learn soft touch technique - open paddle face, smooth motion',
              'Practice 50 third shot drops from baseline',
              'Focus on arc trajectory landing in opponents kitchen',
              'Learn when to use drop vs. drive'
            ],
            success_metric: 'Land 20 out of 50 third shot drops in the kitchen area',
            exercises: [
              '5min warm-up: Wrist and touch control exercises',
              '10min: Third shot drop technique without opposition',
              '18min: Live third shot practice with partner',
              '5min: Decision-making drill - drop or drive',
              '2min: Cool down'
            ]
          },
          {
            day: 11,
            title: 'Putting It Together: Mini Games',
            focus: 'Game Simulation',
            estimated_minutes: 40,
            difficulty_level: 3,
            videos: ['beginner-strategy', 'point-construction'],
            practice_goals: [
              'Play modified mini-games emphasizing learned skills',
              'Practice proper serving and returning in game context',
              'Work on transitioning from baseline to kitchen line',
              'Focus on consistency and shot selection over power',
              'Keep mental notes of areas needing improvement'
            ],
            success_metric: 'Complete 3 mini-games to 7 points demonstrating fundamental skills',
            exercises: [
              '5min warm-up: Light hitting and movement',
              '30min: Structured mini-games with specific focus areas',
              '5min: Cool down and self-assessment'
            ]
          },
          {
            day: 12,
            title: 'Doubles Strategy Basics',
            focus: 'Teamwork and Communication',
            estimated_minutes: 38,
            difficulty_level: 2,
            videos: ['doubles-strategy-101', 'partner-communication'],
            practice_goals: [
              'Learn proper doubles positioning (up-and-back vs. side-by-side)',
              'Practice communicating "mine," "yours," and "switch"',
              'Understand middle ball responsibilities',
              'Learn basic stacking concepts',
              'Practice covering the court as a team'
            ],
            success_metric: 'Demonstrate coordinated doubles positioning and clear communication',
            exercises: [
              '5min warm-up: Partner warm-up and communication practice',
              '15min: Positional drills with partner',
              '15min: Doubles mini-games focusing on teamwork',
              '3min: Team debrief and cool down'
            ]
          },
          {
            day: 13,
            title: 'Advanced Dinking & Kitchen Strategy',
            focus: 'Patience and Placement',
            estimated_minutes: 40,
            difficulty_level: 3,
            videos: ['advanced-dinking', 'kitchen-strategy'],
            practice_goals: [
              'Practice cross-court and straight-ahead dinks',
              'Learn to recognize attackable balls vs. patient play',
              'Work on dink placement - low and away from opponent',
              'Practice speedup opportunities from the kitchen',
              'Develop dink rally endurance (50+ shot rallies)'
            ],
            success_metric: 'Maintain 30+ shot dink rallies with strategic placement',
            exercises: [
              '5min warm-up: Soft touch practice',
              '12min: Targeted dinking drills - specific zones',
              '15min: Competitive dink rallies with point play',
              '6min: Speedup recognition and execution drill',
              '2min: Cool down'
            ]
          },
          {
            day: 14,
            title: 'Final Assessment & Game Play',
            focus: 'Comprehensive Evaluation',
            estimated_minutes: 45,
            difficulty_level: 3,
            videos: ['match-strategy-basics', 'recreational-play-tips'],
            practice_goals: [
              'Play full games demonstrating all learned skills',
              'Self-assess performance in serve, return, dink, and volleys',
              'Practice good sportsmanship and court etiquette',
              'Identify top 3 strengths and 3 areas for continued growth',
              'Celebrate your progress and plan next steps'
            ],
            success_metric: 'Complete 3 full games to 11 showcasing fundamental competency',
            exercises: [
              '5min warm-up: General hitting warm-up',
              '35min: Structured game play with self-evaluation',
              '5min: Cool down, reflection, and goal setting for future'
            ]
          }
        ]
      },
      isActive: true
    },
    
    // ====================================================================
    // BEGINNER PROGRAM 2: Serve & Return Mastery
    // ====================================================================
    {
      programId: 'beginner-serve-return',
      name: 'Serve & Return Mastery',
      tagline: 'Dominate the most important shots in pickleball',
      description: 'This intensive 7-day program focuses exclusively on mastering serves and returns - the foundation of every point in pickleball. Learn multiple serve variations, strategic placement, spin techniques, and how to consistently return serves deep. Perfect for players who want to build a strong advantage from the start of every point.',
      skillLevel: SkillLevel.BEGINNER,
      durationDays: 7,
      estimatedTimePerDay: '25-35 minutes',
      keyOutcomes: [
        'Develop 3 different serve types: deep, short, and spin serves',
        'Place serves strategically to opponent weaknesses',
        'Return serves consistently deep with 75%+ success',
        'Add topspin and backspin to serves and returns',
        'Build mental toughness and pre-serve routines',
        'Understand serve-return strategic patterns'
      ],
      dailyStructure: {
        days: [
          {
            day: 1,
            title: 'Perfect Your Basic Serve',
            focus: 'Consistent Deep Serve',
            estimated_minutes: 30,
            difficulty_level: 2,
            videos: ['serve-fundamentals', 'deep-serve-technique'],
            practice_goals: [
              'Review and refine serving stance and grip',
              'Practice smooth pendulum motion 50 times',
              'Serve 100 balls aiming for deep (baseline) targets',
              'Track serve success rate - target 70% in play',
              'Develop consistent ball toss and contact point'
            ],
            success_metric: 'Land 70 out of 100 serves deep in the service box',
            exercises: [
              '5min warm-up: Shoulder and wrist preparation',
              '8min: Shadow serving with form focus',
              '15min: Live serving practice with targets',
              '2min: Cool down and serve analysis'
            ]
          },
          {
            day: 2,
            title: 'Short Serve Technique',
            focus: 'Kitchen Line Serve Variation',
            estimated_minutes: 28,
            difficulty_level: 2,
            videos: ['short-serve-strategy', 'placement-serves'],
            practice_goals: [
              'Learn short serve technique - less power, more touch',
              'Aim for kitchen line landing (7 feet from net)',
              'Practice 75 short serves to both service boxes',
              'Work on disguising short serve to look like deep serve',
              'Develop ability to alternate deep and short serves'
            ],
            success_metric: 'Land 45 out of 75 serves within 2 feet of kitchen line',
            exercises: [
              '4min warm-up: Touch and feel exercises',
              '8min: Short serve technique practice',
              '14min: Alternating deep and short serve drills',
              '2min: Cool down'
            ]
          },
          {
            day: 3,
            title: 'Adding Spin to Your Serve',
            focus: 'Spin Serve Mechanics',
            estimated_minutes: 32,
            difficulty_level: 3,
            videos: ['spin-serve-tutorial', 'topspin-serving'],
            practice_goals: [
              'Learn wrist snap and paddle angle for topspin serve',
              'Practice sidespin serve by brushing side of ball',
              'Serve 60 balls experimenting with different spins',
              'Observe how spin affects ball bounce and trajectory',
              'Develop comfort with at least one spin variation'
            ],
            success_metric: 'Execute 25 spin serves with visible spin and different bounce patterns',
            exercises: [
              '5min warm-up: Wrist flexibility exercises',
              '10min: Spin technique practice without opposition',
              '15min: Live spin serve practice',
              '2min: Cool down and wrist care'
            ]
          },
          {
            day: 4,
            title: 'Strategic Serve Placement',
            focus: 'Targeting Weaknesses',
            estimated_minutes: 30,
            difficulty_level: 3,
            videos: ['serve-placement-strategy', 'exploiting-weaknesses'],
            practice_goals: [
              'Practice serving to specific zones: wide, body, backhand',
              'Learn to identify and target opponent weaknesses',
              'Serve 30 balls to each target zone (90 total)',
              'Develop serve sequencing patterns',
              'Practice changing serve pace and location'
            ],
            success_metric: 'Hit designated target zones with 60% accuracy (54/90 serves)',
            exercises: [
              '5min warm-up: General serving warm-up',
              '20min: Targeted serving drill with zone markers',
              '5min: Serve sequencing practice'
            ]
          },
          {
            day: 5,
            title: 'Return of Serve Excellence',
            focus: 'Deep, Consistent Returns',
            estimated_minutes: 32,
            difficulty_level: 2,
            videos: ['return-fundamentals', 'deep-return-technique'],
            practice_goals: [
              'Perfect ready position and split-step timing',
              'Return 80 serves focusing on depth (past kitchen)',
              'Practice both forehand and backhand returns equally',
              'Work on controlled pace - not too hard, not too soft',
              'Develop mental preparation routine between returns'
            ],
            success_metric: 'Return 60 out of 80 serves past the kitchen line',
            exercises: [
              '5min warm-up: Split-step and reaction drills',
              '22min: Live return practice with variety of serves',
              '5min: Cool down and return assessment'
            ]
          },
          {
            day: 6,
            title: 'Advanced Return Strategies',
            focus: 'Return Placement & Spin',
            estimated_minutes: 35,
            difficulty_level: 3,
            videos: ['return-placement', 'attacking-returns'],
            practice_goals: [
              'Practice returning cross-court and down-the-line',
              'Learn to add topspin to returns for consistency',
              'Work on attacking short serves aggressively',
              'Return 70 balls with specific placement intentions',
              'Develop ability to read serve spin and adjust'
            ],
            success_metric: 'Execute 50 out of 70 returns to intended targets with good depth',
            exercises: [
              '5min warm-up: Movement and reaction prep',
              '12min: Cross-court return practice',
              '12min: Down-the-line and attacking return drills',
              '6min: Variable serve return challenge'
            ]
          },
          {
            day: 7,
            title: 'Serve-Return Battle: Full Integration',
            focus: 'Match Simulation',
            estimated_minutes: 35,
            difficulty_level: 3,
            videos: ['serve-return-patterns', 'mental-game-serving'],
            practice_goals: [
              'Play serve-return focused mini-games',
              'Implement pre-serve and pre-return routines',
              'Practice all serve types in competitive situations',
              'Focus on consistency under pressure',
              'Self-evaluate serve and return performance'
            ],
            success_metric: 'Maintain 70%+ serve success and 65%+ return success in game play',
            exercises: [
              '5min warm-up: Complete warm-up routine',
              '25min: Serve-return mini-games with score tracking',
              '5min: Cool down and comprehensive self-assessment'
            ]
          }
        ]
      },
      isActive: true
    },

    // ====================================================================
    // INTERMEDIATE PROGRAM: Third Shot Excellence
    // ====================================================================
    {
      programId: 'intermediate-third-shot',
      name: 'Third Shot Excellence',
      tagline: 'Master the game-changing third shot drop',
      description: 'The third shot is what separates intermediate from advanced players. This comprehensive 10-day program teaches you to consistently execute third shot drops and drives, develop strategic shot selection, perfect your transition to the net, and understand when to use each shot type. Includes extensive footwork and positioning training.',
      skillLevel: SkillLevel.INTERMEDIATE,
      durationDays: 10,
      estimatedTimePerDay: '40-50 minutes',
      keyOutcomes: [
        'Execute consistent third shot drops landing in opponent kitchen',
        'Master third shot drives with controlled power',
        'Develop strategic shot selection based on court position',
        'Perfect transition footwork from baseline to kitchen line',
        'Improve soft touch and feel for touch shots',
        'Understand and implement advanced positioning strategies',
        'Build confidence in competitive third shot situations'
      ],
      dailyStructure: {
        days: [
          {
            day: 1,
            title: 'Third Shot Foundation & Strategy',
            focus: 'Understanding the Third Shot',
            estimated_minutes: 40,
            difficulty_level: 2,
            videos: ['third-shot-strategy', 'drop-vs-drive-decision'],
            practice_goals: [
              'Understand why the third shot is critical in pickleball',
              'Learn the difference between drop and drive third shots',
              'Study proper court positioning after serving',
              'Practice 50 basic third shot drops without pressure',
              'Develop visual recognition of drop vs drive situations'
            ],
            success_metric: 'Articulate third shot strategy and execute 25 basic drops into kitchen',
            exercises: [
              '5min warm-up: Touch and control exercises',
              '10min: Video analysis and strategy discussion',
              '20min: Basic third shot drop practice',
              '5min: Cool down and mental review'
            ]
          },
          {
            day: 2,
            title: 'Drop Shot Mechanics Deep Dive',
            focus: 'Technical Mastery of the Drop',
            estimated_minutes: 45,
            difficulty_level: 3,
            videos: ['drop-shot-technique', 'paddle-angle-control'],
            practice_goals: [
              'Perfect drop shot grip and paddle angle (slightly open face)',
              'Practice smooth, pendulum-like swing with minimal wrist',
              'Hit 100 third shot drops focusing on arc trajectory',
              'Work on consistent contact point and follow-through',
              'Develop muscle memory for the drop motion'
            ],
            success_metric: 'Land 60 out of 100 third shot drops in the kitchen with proper arc',
            exercises: [
              '5min warm-up: Wrist and forearm preparation',
              '10min: Shadow swing practice with feedback',
              '25min: Live drop shot practice with targets',
              '5min: Cool down stretching'
            ]
          },
          {
            day: 3,
            title: 'Drop from Different Court Positions',
            focus: 'Positional Drops',
            estimated_minutes: 48,
            difficulty_level: 3,
            videos: ['positional-drops', 'baseline-drop-technique'],
            practice_goals: [
              'Practice drops from deep baseline position (hardest)',
              'Work on drops from mid-court transition zone',
              'Execute drops from behind kitchen line (easier)',
              'Hit 40 drops from each position (120 total)',
              'Recognize how court position affects drop difficulty'
            ],
            success_metric: 'Achieve 50% success from baseline, 70% from mid-court, 85% from kitchen',
            exercises: [
              '5min warm-up: Court movement and positioning',
              '12min: Deep baseline drop practice',
              '12min: Mid-court drop practice',
              '12min: Short court drop practice',
              '7min: Random position drop drill',
              '3min: Cool down'
            ]
          },
          {
            day: 4,
            title: 'Third Shot Drive Mastery',
            focus: 'Aggressive Third Shot Option',
            estimated_minutes: 45,
            difficulty_level: 3,
            videos: ['third-shot-drive', 'attacking-third-shots'],
            practice_goals: [
              'Learn when to use drive over drop (short return, opponent back)',
              'Practice third shot drives with topspin for control',
              'Hit 80 drives aiming for opponent feet or backhand',
              'Work on driving with purpose, not just power',
              'Develop quick decision: drop or drive?'
            ],
            success_metric: 'Execute 55 out of 80 controlled drives to target areas',
            exercises: [
              '5min warm-up: Power shot preparation',
              '10min: Drive technique and topspin practice',
              '25min: Live third shot drive with strategic focus',
              '5min: Cool down and shot selection review'
            ]
          },
          {
            day: 5,
            title: 'Decision Making: Drop vs Drive',
            focus: 'Shot Selection Intelligence',
            estimated_minutes: 42,
            difficulty_level: 4,
            videos: ['shot-selection-strategy', 'reading-opponents'],
            practice_goals: [
              'Practice rapid decision-making based on return quality',
              'Execute drop-drive pattern recognition drills',
              'Hit 100 third shots deciding drop or drive each time',
              'Learn to read opponent positioning and vulnerability',
              'Develop instinctive shot selection'
            ],
            success_metric: 'Make appropriate shot selection 75% of the time with good execution',
            exercises: [
              '5min warm-up: Decision drills without ball',
              '30min: Variable third shot practice - coach calls or player decides',
              '7min: Competitive decision-making games'
            ]
          },
          {
            day: 6,
            title: 'Transition Footwork After Third Shot',
            focus: 'Moving to the Kitchen Line',
            estimated_minutes: 48,
            difficulty_level: 4,
            videos: ['transition-footwork', 'approach-to-net'],
            practice_goals: [
              'Learn proper split-step after hitting third shot',
              'Practice efficient forward movement toward kitchen',
              'Work on maintaining balance while moving forward',
              'Execute 60 third shots followed by forward transition',
              'Develop ability to hit quality shot while moving'
            ],
            success_metric: 'Complete fluid third shot → transition → ready position 50 times',
            exercises: [
              '5min warm-up: Agility and footwork drills',
              '15min: Third shot + transition pattern work',
              '20min: Live third shot with full court movement',
              '8min: Competitive transition drill with pressure'
            ]
          },
          {
            day: 7,
            title: 'Handling the Opponent Attack',
            focus: 'Defensive Third Shot Skills',
            estimated_minutes: 45,
            difficulty_level: 4,
            videos: ['defensive-third-shots', 'handling-pressure'],
            practice_goals: [
              'Practice third shots when under pressure from aggressive returns',
              'Learn to handle low, fast returns',
              'Work on third shot drops when stretched wide',
              'Execute 70 third shots from difficult positions',
              'Develop composure and shot quality under duress'
            ],
            success_metric: 'Maintain 50% success rate on third shots from pressure situations',
            exercises: [
              '5min warm-up: Reaction and defensive prep',
              '35min: Pressure third shot drills - aggressive feeds',
              '5min: Cool down and mental resilience review'
            ]
          },
          {
            day: 8,
            title: 'Advanced Drop Variations',
            focus: 'Spin and Placement Drops',
            estimated_minutes: 50,
            difficulty_level: 4,
            videos: ['spin-drops', 'placement-strategy'],
            practice_goals: [
              'Learn to add backspin to third shot drops for softer landing',
              'Practice cross-court vs straight-ahead drop selection',
              'Work on disguising drop to look like drive',
              'Hit 80 drops with intentional spin and placement',
              'Develop drop shot creativity and variety'
            ],
            success_metric: 'Execute 50 advanced drops with spin and strategic placement',
            exercises: [
              '5min warm-up: Spin and touch exercises',
              '15min: Backspin drop technique',
              '20min: Placement and disguise practice',
              '10min: Creative drop shot scenarios'
            ]
          },
          {
            day: 9,
            title: 'Third Shot in Doubles Context',
            focus: 'Partner Coordination',
            estimated_minutes: 48,
            difficulty_level: 4,
            videos: ['doubles-third-shot', 'partner-movement'],
            practice_goals: [
              'Practice third shot coordination with partner',
              'Learn who hits third shot in different scenarios',
              'Work on partner covering while hitter transitions',
              'Execute 60 third shots in doubles formation',
              'Develop communication for third shot situations'
            ],
            success_metric: 'Demonstrate coordinated doubles third shot patterns with partner',
            exercises: [
              '5min warm-up: Partner coordination exercises',
              '35min: Doubles-specific third shot drills',
              '8min: Competitive doubles mini-games focused on third shot'
            ]
          },
          {
            day: 10,
            title: 'Third Shot Excellence: Match Play',
            focus: 'Competition Integration',
            estimated_minutes: 50,
            difficulty_level: 4,
            videos: ['match-strategy-third-shot', 'competitive-mindset'],
            practice_goals: [
              'Play competitive games emphasizing third shot quality',
              'Track third shot success rate during game play',
              'Practice all learned variations in match context',
              'Maintain composure and shot selection under pressure',
              'Evaluate overall third shot improvement'
            ],
            success_metric: 'Achieve 60%+ third shot success in competitive match play',
            exercises: [
              '5min warm-up: Complete preparation routine',
              '40min: Structured match play with third shot focus',
              '5min: Cool down and comprehensive self-assessment'
            ]
          }
        ]
      },
      isActive: true
    },

    // ====================================================================
    // INTERMEDIATE PROGRAM: Advanced Dinking & Kitchen Play
    // ====================================================================
    {
      programId: 'intermediate-dinking-strategy',
      name: 'Advanced Dinking & Kitchen Play',
      tagline: 'Control the kitchen and win more rallies',
      description: 'Elevate your dinking game to an advanced level with sophisticated techniques, patience strategies, and the ability to create and recognize attackable balls. This 12-day program covers cross-court dinking, straight-ahead dinks, erne shots, kitchen line positioning, and the mental game of patience. Perfect your touch, placement, and strategic thinking at the net.',
      skillLevel: SkillLevel.INTERMEDIATE,
      durationDays: 12,
      estimatedTimePerDay: '35-45 minutes',
      keyOutcomes: [
        'Master cross-court and straight dinks with precision',
        'Develop patience in long dink rallies (50+ shots)',
        'Create and recognize attackable balls consistently',
        'Improve kitchen line positioning and footwork',
        'Execute the erne shot in match situations',
        'Add spin variations to dinks for advanced play',
        'Build mental fortitude for extended soft game rallies'
      ],
      dailyStructure: {
        days: [
          {
            day: 1,
            title: 'Dinking Fundamentals Review & Enhancement',
            focus: 'Perfecting Basic Dinking',
            estimated_minutes: 38,
            difficulty_level: 2,
            videos: ['advanced-dinking-basics', 'dink-mechanics'],
            practice_goals: [
              'Review and refine dinking grip and paddle angle',
              'Practice compact backswing and smooth follow-through',
              'Complete 100 consecutive dinks with partner or wall',
              'Focus on consistent arc and soft kitchen landing',
              'Develop rhythm and timing in dink exchanges'
            ],
            success_metric: 'Maintain 30-shot dink rally with consistent height and placement',
            exercises: [
              '5min warm-up: Wrist and touch exercises',
              '10min: Solo dinking technique refinement',
              '20min: Partner dinking drills - endurance rallies',
              '3min: Cool down stretching'
            ]
          },
          {
            day: 2,
            title: 'Cross-Court Dinking Mastery',
            focus: 'Diagonal Kitchen Control',
            estimated_minutes: 40,
            difficulty_level: 3,
            videos: ['cross-court-dinking', 'angles-and-geometry'],
            practice_goals: [
              'Learn why cross-court dinks are safer (longer distance, higher net)',
              'Practice 80 cross-court dinks focusing on diagonal angles',
              'Work on pulling opponent wide with angled dinks',
              'Develop consistent cross-court dink depth and placement',
              'Practice moving side-to-side while dinking'
            ],
            success_metric: 'Hit 60 out of 80 cross-court dinks with good angle and depth',
            exercises: [
              '5min warm-up: Lateral movement drills',
              '12min: Static cross-court dinking',
              '18min: Moving cross-court dink patterns',
              '5min: Cool down'
            ]
          },
          {
            day: 3,
            title: 'Straight-Ahead Dinking & Middle Ball Strategy',
            focus: 'Direct Dinking Tactics',
            estimated_minutes: 42,
            difficulty_level: 3,
            videos: ['straight-dinking', 'middle-ball-strategy'],
            practice_goals: [
              'Practice straight-ahead dinks directly at opponent',
              'Learn middle ball responsibilities in doubles',
              'Work on dinking to opponent\'s body to jam them',
              'Execute 70 straight dinks with strategic intent',
              'Develop quick reactions for middle ball situations'
            ],
            success_metric: 'Execute 50 well-placed straight dinks and handle middle balls effectively',
            exercises: [
              '5min warm-up: Reaction drills',
              '15min: Straight dinking practice',
              '17min: Middle ball scenarios in doubles',
              '5min: Cool down and strategy review'
            ]
          },
          {
            day: 4,
            title: 'Creating Attackable Balls',
            focus: 'Offensive Dinking',
            estimated_minutes: 40,
            difficulty_level: 4,
            videos: ['creating-opportunities', 'offensive-dinking'],
            practice_goals: [
              'Learn to raise ball height slightly to invite opponent error',
              'Practice pulling opponent forward with short dinks',
              'Work on pushing opponent back with deeper dinks',
              'Execute 60 dinks with intention to create attackable ball',
              'Develop patience to wait for right opportunity'
            ],
            success_metric: 'Create 25 attackable opportunities in 60-ball dink drill',
            exercises: [
              '5min warm-up: Strategic dinking exercises',
              '30min: Offensive dinking patterns with partner',
              '5min: Cool down and opportunity recognition review'
            ]
          },
          {
            day: 5,
            title: 'Recognizing & Attacking Opportunities',
            focus: 'Speedup Technique',
            estimated_minutes: 43,
            difficulty_level: 4,
            videos: ['speedup-technique', 'attacking-dinks'],
            practice_goals: [
              'Learn to recognize high or wide dinks as attackable',
              'Practice speedup technique - quick hands, firm wrist',
              'Execute 50 speedup attacks from dink rallies',
              'Work on attacking to opponent feet or away from paddle',
              'Develop trigger recognition for attack timing'
            ],
            success_metric: 'Successfully attack 35 out of 50 attackable dinks with controlled power',
            exercises: [
              '5min warm-up: Quick hands drills',
              '12min: Speedup technique practice',
              '20min: Dink-attack pattern drills',
              '6min: Competitive attack scenarios'
            ]
          },
          {
            day: 6,
            title: 'Defensive Dinking Under Pressure',
            focus: 'Resetting and Absorbing Pace',
            estimated_minutes: 40,
            difficulty_level: 4,
            videos: ['defensive-dinking', 'reset-technique'],
            practice_goals: [
              'Learn to absorb pace and reset hard shots to soft dinks',
              'Practice low, defensive dinks when under attack',
              'Work on soft hands and paddle give technique',
              'Execute 60 resets from aggressive feeds',
              'Develop composure when defending'
            ],
            success_metric: 'Successfully reset 40 out of 60 attacks back to dinking',
            exercises: [
              '5min warm-up: Soft hands exercises',
              '30min: Reset drills with increasing difficulty',
              '5min: Cool down and mental resilience review'
            ]
          },
          {
            day: 7,
            title: 'Adding Spin to Your Dinks',
            focus: 'Spin Variations',
            estimated_minutes: 42,
            difficulty_level: 4,
            videos: ['spin-dinking', 'advanced-touch'],
            practice_goals: [
              'Learn backspin dink technique for deader bounce',
              'Practice topspin dinks for dipping trajectory',
              'Work on sidespin dinks for lateral movement after bounce',
              'Execute 70 dinks with various spin techniques',
              'Develop ability to read and counter opponent spin'
            ],
            success_metric: 'Execute 45 dinks with visible spin and controlled placement',
            exercises: [
              '5min warm-up: Spin touch exercises',
              '32min: Spin dinking practice - all variations',
              '5min: Cool down'
            ]
          },
          {
            day: 8,
            title: 'Kitchen Line Positioning & Footwork',
            focus: 'Optimal Positioning',
            estimated_minutes: 38,
            difficulty_level: 3,
            videos: ['kitchen-positioning', 'footwork-at-net'],
            practice_goals: [
              'Learn optimal distance from kitchen line (6-12 inches)',
              'Practice quick shuffle steps to cover width',
              'Work on forward and backward adjustment steps',
              'Execute 50 dinks while maintaining position discipline',
              'Develop awareness of kitchen line without looking down'
            ],
            success_metric: 'Demonstrate proper positioning and coverage in dink exchanges',
            exercises: [
              '5min warm-up: Footwork drills',
              '10min: Positioning awareness exercises',
              '20min: Live dinking with footwork emphasis',
              '3min: Cool down'
            ]
          },
          {
            day: 9,
            title: 'The Erne Shot',
            focus: 'Advanced Around-the-Post Shot',
            estimated_minutes: 45,
            difficulty_level: 5,
            videos: ['erne-shot-tutorial', 'erne-timing'],
            practice_goals: [
              'Learn erne shot technique and legal execution',
              'Practice erne timing - anticipating cross-court dinks',
              'Work on lateral leap and mid-air paddle control',
              'Attempt 30 erne shots in practice scenarios',
              'Develop courage and timing for erne opportunities'
            ],
            success_metric: 'Successfully execute 10 erne shots with proper technique',
            exercises: [
              '5min warm-up: Lateral movement and jumping prep',
              '10min: Erne technique practice without ball',
              '25min: Live erne practice with fed balls',
              '5min: Cool down and injury prevention stretching'
            ]
          },
          {
            day: 10,
            title: 'Dinking Patterns & Strategy',
            focus: 'Strategic Dink Construction',
            estimated_minutes: 40,
            difficulty_level: 4,
            videos: ['dinking-patterns', 'strategic-sequences'],
            practice_goals: [
              'Learn effective dinking patterns: 2 cross-court, 1 straight',
              'Practice changing dink direction strategically',
              'Work on varying dink depth and pace',
              'Execute 80 dinks following strategic patterns',
              'Develop ability to disguise dink direction'
            ],
            success_metric: 'Implement strategic dinking patterns successfully in 70% of exchanges',
            exercises: [
              '5min warm-up: Pattern visualization',
              '30min: Strategic dinking drills with patterns',
              '5min: Cool down and pattern review'
            ]
          },
          {
            day: 11,
            title: 'Mental Game of Dinking',
            focus: 'Patience and Focus',
            estimated_minutes: 35,
            difficulty_level: 3,
            videos: ['dinking-mindset', 'patience-in-pickleball'],
            practice_goals: [
              'Practice extended dink rallies building mental endurance',
              'Learn to stay patient and not over-attack',
              'Work on focus and concentration in long exchanges',
              'Complete three 50+ shot dink rallies',
              'Develop calm, patient mindset at the kitchen line'
            ],
            success_metric: 'Complete 3 dink rallies of 50+ shots with maintained focus',
            exercises: [
              '5min warm-up: Breathing and focus exercises',
              '25min: Extended dink rally challenges',
              '5min: Cool down and mental game reflection'
            ]
          },
          {
            day: 12,
            title: 'Kitchen Mastery: Competitive Play',
            focus: 'Comprehensive Application',
            estimated_minutes: 45,
            difficulty_level: 4,
            videos: ['kitchen-game-strategy', 'competitive-dinking'],
            practice_goals: [
              'Play competitive games focused on kitchen play excellence',
              'Implement all learned dinking techniques and strategies',
              'Track dinking rally success and attack conversion rate',
              'Demonstrate patience, spin, positioning, and tactical awareness',
              'Evaluate comprehensive dinking improvement'
            ],
            success_metric: 'Win 60% of kitchen exchanges in competitive match play',
            exercises: [
              '5min warm-up: Complete preparation',
              '35min: Competitive match play with kitchen focus',
              '5min: Cool down and comprehensive self-assessment'
            ]
          }
        ]
      },
      isActive: true
    },

    // ====================================================================
    // ADVANCED PROGRAM: Spin & Power Mechanics
    // ====================================================================
    {
      programId: 'advanced-spin-control',
      name: 'Spin & Power Mechanics',
      tagline: 'Add professional-level spin to every shot',
      description: 'Master the art of spin and power like professional players. This advanced 14-day program teaches you to generate topspin on drives and speedups, execute backspin drops and dinks, add sidespin for deception, counter opponent spin effectively, and combine spin with controlled power. Includes advanced paddle mechanics, wrist technique, and physics of spin.',
      skillLevel: SkillLevel.ADVANCED,
      durationDays: 14,
      estimatedTimePerDay: '50-60 minutes',
      keyOutcomes: [
        'Generate heavy topspin on drives and speedups',
        'Execute backspin drops and dinks with control',
        'Add sidespin for deception and difficult bounces',
        'Counter opponent spin effectively with adjustments',
        'Combine spin with power for elite-level shots',
        'Understand spin physics and paddle angle relationships',
        'Develop wrist and forearm strength for spin generation'
      ],
      dailyStructure: {
        days: [
          {
            day: 1,
            title: 'Physics of Spin & Paddle Mechanics',
            focus: 'Understanding Spin Fundamentals',
            estimated_minutes: 50,
            difficulty_level: 3,
            videos: ['spin-physics', 'paddle-mechanics'],
            practice_goals: [
              'Learn physics of topspin, backspin, and sidespin',
              'Understand paddle angle and swing path relationships',
              'Study brush vs. strike contact on the ball',
              'Practice 100 swings focusing on different spin types',
              'Develop awareness of wrist and forearm roles in spin'
            ],
            success_metric: 'Articulate spin principles and demonstrate varied paddle angles',
            exercises: [
              '8min warm-up: Wrist and forearm strengthening',
              '15min: Video study and theoretical learning',
              '22min: Practical spin experimentation',
              '5min: Cool down and knowledge review'
            ]
          },
          {
            day: 2,
            title: 'Topspin Groundstroke Technique',
            focus: 'Heavy Topspin Drives',
            estimated_minutes: 55,
            difficulty_level: 4,
            videos: ['topspin-drives', 'low-to-high-swing'],
            practice_goals: [
              'Perfect low-to-high swing path for topspin generation',
              'Practice brushing up the back of the ball',
              'Hit 120 topspin drives focusing on heavy spin',
              'Work on consistency while maintaining spin',
              'Develop both forehand and backhand topspin drives'
            ],
            success_metric: 'Execute 85 out of 120 topspin drives with visible spin and depth',
            exercises: [
              '8min warm-up: Rotation and swing prep',
              '15min: Shadow swings with topspin focus',
              '27min: Live topspin drive practice',
              '5min: Cool down stretching'
            ]
          },
          // Continue with days 3-14 following similar detailed structure...
          {
            day: 3,
            title: 'Topspin Speedup Attacks',
            focus: 'Offensive Spin Attacks',
            estimated_minutes: 52,
            difficulty_level: 4,
            videos: ['speedup-with-spin', 'attacking-spin'],
            practice_goals: [
              'Learn to add topspin to speedup attacks from kitchen line',
              'Practice quick, compact topspin flicks',
              'Execute 90 speedup attacks with topspin',
              'Work on attacking feet and creating downward trajectory',
              'Develop quick hands and wrist snap for speed + spin'
            ],
            success_metric: 'Successfully attack with topspin 65 out of 90 times',
            exercises: [
              '7min warm-up: Quick hands drills',
              '15min: Speedup spin technique',
              '25min: Live speedup practice',
              '5min: Cool down'
            ]
          },
          {
            day: 4,
            title: 'Backspin Drop Shots',
            focus: 'Soft Backspin Technique',
            estimated_minutes: 54,
            difficulty_level: 4,
            videos: ['backspin-drops', 'slice-technique'],
            practice_goals: [
              'Learn high-to-low paddle path for backspin',
              'Practice slicing under the ball with open paddle face',
              'Hit 100 backspin drops landing softly in kitchen',
              'Observe how backspin creates dead bounce',
              'Develop touch and feel for backspin drops'
            ],
            success_metric: 'Execute 70 backspin drops with visible spin and soft landing',
            exercises: [
              '7min warm-up: Touch and feel exercises',
              '12min: Backspin technique development',
              '30min: Live backspin drop practice',
              '5min: Cool down'
            ]
          },
          {
            day: 5,
            title: 'Backspin Dinking & Defensive Shots',
            focus: 'Defensive Backspin',
            estimated_minutes: 50,
            difficulty_level: 4,
            videos: ['backspin-dinking', 'defensive-slice'],
            practice_goals: [
              'Add backspin to dinks for unpredictable bounce',
              'Practice slice resets from attacked balls',
              'Execute 80 backspin dinks and defensive slices',
              'Learn to control depth with backspin',
              'Develop confidence in backspin defensive shots'
            ],
            success_metric: 'Execute 60 controlled backspin shots in various situations',
            exercises: [
              '7min warm-up: Defensive positioning drills',
              '38min: Backspin dinking and reset practice',
              '5min: Cool down'
            ]
          },
          {
            day: 6,
            title: 'Sidespin Fundamentals',
            focus: 'Lateral Spin Mechanics',
            estimated_minutes: 52,
            difficulty_level: 5,
            videos: ['sidespin-technique', 'spin-combinations'],
            practice_goals: [
              'Learn to brush side of ball for sidespin',
              'Practice left-to-right and right-to-left sidespin',
              'Hit 80 shots with deliberate sidespin',
              'Observe how sidespin affects ball flight and bounce',
              'Begin combining sidespin with topspin or backspin'
            ],
            success_metric: 'Generate visible sidespin on 50 out of 80 practice shots',
            exercises: [
              '7min warm-up: Lateral movement and wrist prep',
              '40min: Sidespin practice and experimentation',
              '5min: Cool down'
            ]
          },
          {
            day: 7,
            title: 'Deceptive Spin Serves',
            focus: 'Advanced Spin Serving',
            estimated_minutes: 48,
            difficulty_level: 4,
            videos: ['spin-serves-advanced', 'serve-deception'],
            practice_goals: [
              'Master multiple spin serve variations',
              'Practice disguising spin serves',
              'Serve 100 balls with intentional spin variations',
              'Learn to read your own serve spin and predict bounce',
              'Develop strategic spin serving based on opponent'
            ],
            success_metric: 'Execute 70 spin serves with clear spin and strategic placement',
            exercises: [
              '7min warm-up: Serving preparation',
              '36min: Spin serve practice - all variations',
              '5min: Cool down'
            ]
          },
          {
            day: 8,
            title: 'Reading & Countering Opponent Spin',
            focus: 'Spin Recognition',
            estimated_minutes: 55,
            difficulty_level: 5,
            videos: ['reading-spin', 'countering-spin'],
            practice_goals: [
              'Learn to read spin from opponent paddle angle and motion',
              'Practice adjusting paddle angle to counter spin',
              'Return 90 spin shots with appropriate adjustments',
              'Work on both absorbing and reversing spin',
              'Develop quick spin recognition instincts'
            ],
            success_metric: 'Successfully counter 65 out of 90 spin shots with control',
            exercises: [
              '8min warm-up: Reaction and adjustment drills',
              '42min: Spin return and counter practice',
              '5min: Cool down'
            ]
          },
          {
            day: 9,
            title: 'Power with Control: Heavy Topspin',
            focus: 'Combining Power and Spin',
            estimated_minutes: 58,
            difficulty_level: 5,
            videos: ['power-topspin', 'controlled-aggression'],
            practice_goals: [
              'Generate maximum topspin while maintaining power',
              'Practice accelerating through contact for spin + speed',
              'Hit 100 power topspin drives with 80% consistency',
              'Learn to use topspin for controlled aggression',
              'Develop confidence in powerful, spinning shots'
            ],
            success_metric: 'Execute 75 power topspin shots maintaining control',
            exercises: [
              '8min warm-up: Power generation exercises',
              '45min: Heavy topspin power drills',
              '5min: Cool down'
            ]
          },
          {
            day: 10,
            title: 'Touch Spin: Finesse & Placement',
            focus: 'Soft Spin Shots',
            estimated_minutes: 50,
            difficulty_level: 4,
            videos: ['finesse-spin', 'touch-shots'],
            practice_goals: [
              'Practice soft spin shots requiring touch and feel',
              'Execute drop shots, dinks, and lobs with spin',
              'Hit 90 touch spin shots focusing on placement',
              'Learn to vary spin intensity for different situations',
              'Develop full spectrum from power spin to touch spin'
            ],
            success_metric: 'Execute 70 soft spin shots with precision placement',
            exercises: [
              '7min warm-up: Touch and feel development',
              '38min: Finesse spin shot practice',
              '5min: Cool down'
            ]
          },
          {
            day: 11,
            title: 'Spin in Transition: Third Shot & Approaches',
            focus: 'Transitional Spin Shots',
            estimated_minutes: 52,
            difficulty_level: 5,
            videos: ['transition-spin', 'approach-with-spin'],
            practice_goals: [
              'Add spin to third shot drops and drives',
              'Practice approach shots with topspin',
              'Execute 80 transitional spin shots',
              'Learn to maintain spin while moving forward',
              'Develop spin consistency during court transition'
            ],
            success_metric: 'Execute 60 quality spin shots during transition movements',
            exercises: [
              '7min warm-up: Movement and spin combination',
              '40min: Transition spin shot practice',
              '5min: Cool down'
            ]
          },
          {
            day: 12,
            title: 'Doubles Spin Strategy',
            focus: 'Team Spin Tactics',
            estimated_minutes: 55,
            difficulty_level: 4,
            videos: ['doubles-spin-strategy', 'team-tactics'],
            practice_goals: [
              'Coordinate spin strategies with doubles partner',
              'Practice spin combinations to create opportunities',
              'Execute 100 spin shots in doubles context',
              'Learn when each partner should use which spin',
              'Develop team spin patterns and communication'
            ],
            success_metric: 'Demonstrate coordinated spin strategy in doubles play',
            exercises: [
              '8min warm-up: Partner coordination',
              '42min: Doubles spin practice and patterns',
              '5min: Cool down and team debrief'
            ]
          },
          {
            day: 13,
            title: 'Spin Under Pressure',
            focus: 'Competitive Spin Execution',
            estimated_minutes: 58,
            difficulty_level: 5,
            videos: ['pressure-situations', 'competitive-spin'],
            practice_goals: [
              'Practice spin shots in high-pressure scenarios',
              'Execute spin while fatigued and under stress',
              'Maintain spin quality in competitive situations',
              'Hit 90 spin shots in pressure drills',
              'Build confidence in competitive spin execution'
            ],
            success_metric: 'Maintain 70% spin shot quality under pressure',
            exercises: [
              '8min warm-up: Mental preparation and focus',
              '45min: Pressure spin drills and competitions',
              '5min: Cool down and mental review'
            ]
          },
          {
            day: 14,
            title: 'Spin Mastery: Championship Play',
            focus: 'Complete Spin Integration',
            estimated_minutes: 60,
            difficulty_level: 5,
            videos: ['spin-mastery', 'professional-spin-game'],
            practice_goals: [
              'Play competitive matches using full spin arsenal',
              'Demonstrate all spin types in appropriate situations',
              'Track spin shot success rate and effectiveness',
              'Showcase spin variety, power, and control',
              'Evaluate comprehensive spin skill development'
            ],
            success_metric: 'Execute varied spin shots at 75%+ success in match play',
            exercises: [
              '10min warm-up: Complete spin preparation',
              '45min: Championship-level match play',
              '5min: Cool down and comprehensive self-assessment'
            ]
          }
        ]
      },
      isActive: true
    }
  ]

  for (const program of programs) {
    await prisma.trainingProgram.create({
      data: program
    })
    console.log(`✅ Created program: ${program.name}`)
  }

  console.log(`\n🎉 Successfully seeded ${programs.length} comprehensive training programs!`)
  console.log('\n📊 Program Summary:')
  console.log(`   - ${programs.filter(p => p.skillLevel === SkillLevel.BEGINNER).length} Beginner programs`)
  console.log(`   - ${programs.filter(p => p.skillLevel === SkillLevel.INTERMEDIATE).length} Intermediate programs`)
  console.log(`   - ${programs.filter(p => p.skillLevel === SkillLevel.ADVANCED).length} Advanced programs`)
}

main()
  .catch((error) => {
    console.error('❌ Error seeding programs:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
