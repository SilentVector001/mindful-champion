import { prisma } from '../lib/db'

// ========================================
// COMPREHENSIVE TRAINING PROGRAM CONTENT
// ========================================

interface DayStructure {
  day: number
  title: string
  focus: string
  description: string
  duration_minutes: number
  warmup: {
    title: string
    exercises: string[]
    duration_minutes: number
  }
  main_drills: {
    name: string
    description: string
    duration_minutes: number
    reps_or_sets?: string
    tips: string[]
  }[]
  practice_goals: string[]
  success_metrics: string[]
  cooldown: string[]
  coach_notes: string
  video_ids?: string[] // YouTube video IDs for this day
  age_adaptations: {
    youth: string
    adult: string
    senior: string
  }
  gender_tips: {
    general: string
    power_focus?: string
    finesse_focus?: string
  }
}

interface TrainingProgramContent {
  programId: string
  name: string
  tagline: string
  description: string
  what_youll_learn: string[]
  who_is_this_for: string[]
  prerequisites: string[]
  equipment_needed: string[]
  dailyStructure: DayStructure[]
}

// ========================================
// BEGINNER: SERVE & RETURN MASTERY (7 Days)
// ========================================
const beginnerServeReturn: TrainingProgramContent = {
  programId: 'beginner-serve-return',
  name: 'Serve & Return Mastery',
  tagline: 'Master the fundamentals that win games',
  description: 'Build a rock-solid foundation with proper serve technique and strategic returns. This 7-day program transforms beginners into confident servers with placement accuracy and return consistency.',
  what_youll_learn: [
    'Proper paddle grip and stance for serves',
    'Underhand serve mechanics with spin options',
    'Consistent deep serve placement',
    'Return positioning and footwork',
    'Split-step timing for returns',
    'Strategic return placement'
  ],
  who_is_this_for: [
    'New players just starting pickleball',
    'Players with inconsistent serves',
    'Anyone wanting to build proper fundamentals'
  ],
  prerequisites: [
    'Basic understanding of pickleball rules',
    'Ability to hold a paddle comfortably'
  ],
  equipment_needed: [
    'Pickleball paddle',
    '6+ pickleballs',
    'Court access or practice wall'
  ],
  dailyStructure: [
    {
      day: 1,
      title: 'Serve Foundation',
      focus: 'Grip, stance, and basic serve motion',
      description: 'Today we establish the fundamental building blocks of a reliable serve. Focus on consistency over power.',
      duration_minutes: 30,
      warmup: {
        title: 'Dynamic Warm-Up',
        exercises: [
          'Arm circles (30 seconds each direction)',
          'Wrist rotations (20 each direction)',
          'Light jogging in place (1 minute)',
          'Paddle swings without ball (20 reps)'
        ],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Continental Grip Practice',
          description: 'Hold paddle like shaking hands. The V between thumb and index finger should align with paddle edge.',
          duration_minutes: 5,
          reps_or_sets: '3 sets of grip checks',
          tips: [
            'Relax your grip - death grip kills control',
            'Wrist should be neutral, not cocked',
            'Practice grip transitions'
          ]
        },
        {
          name: 'Stance & Weight Transfer',
          description: 'Practice the proper athletic stance and weight shift from back foot to front during serve.',
          duration_minutes: 8,
          reps_or_sets: '20 shadow serves',
          tips: [
            'Feet shoulder-width apart',
            'Front foot points toward target',
            'Smooth weight transfer, not a lunge'
          ]
        },
        {
          name: 'Ball Drop Serves',
          description: 'Drop the ball and make contact at waist height. Focus on clean contact, not power.',
          duration_minutes: 10,
          reps_or_sets: '30 serves into open court',
          tips: [
            'Drop ball from same height every time',
            'Watch the ball contact paddle',
            'Follow through toward target'
          ]
        }
      ],
      practice_goals: [
        'Complete 30 serves with proper form',
        'Achieve 70% in-court rate',
        'Feel comfortable with continental grip'
      ],
      success_metrics: [
        '21+ serves landing in court (70%)',
        'Consistent ball drop height',
        'Smooth weight transfer motion'
      ],
      cooldown: [
        'Gentle shoulder stretches (30 sec each)',
        'Wrist flexor stretches (20 sec each)',
        'Deep breathing (5 breaths)'
      ],
      coach_notes: "Don't chase power today. A consistent in-court serve beats a powerful fault every time. Build the habit first.",
      age_adaptations: {
        youth: 'Make it a game! Count consecutive serves and try to beat your record. Use targets.',
        adult: 'Focus on muscle memory. Repetition is key - quality reps build lasting habits.',
        senior: 'Take extra time in warm-up. Prioritize smooth motion over any power concerns.'
      },
      gender_tips: {
        general: 'Serve technique is universal. Focus on clean mechanics regardless of strength level.',
        power_focus: 'Power comes from legs and core rotation, not arm strength.',
        finesse_focus: 'Placement wins points. A well-placed soft serve beats a powerful one to the wrong spot.'
      }
    },
    {
      day: 2,
      title: 'Serve Placement',
      focus: 'Targeting specific zones in the service box',
      description: 'Now that you have the basic motion, let\'s add intention. Learn to place serves to strategic locations.',
      duration_minutes: 35,
      warmup: {
        title: 'Active Warm-Up',
        exercises: [
          'Shadow serves (10 reps)',
          'Side shuffles (30 seconds)',
          'Paddle figure-8s (10 each direction)',
          'Light serves to get loose (10 serves)'
        ],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Deep Corner Serves',
          description: 'Aim for the deep corners of the service box. The back corners are high-percentage targets.',
          duration_minutes: 12,
          reps_or_sets: '20 serves to each corner (40 total)',
          tips: [
            'Aim 2 feet inside the lines for margin',
            'Deep serves push opponents back',
            'Backhand corner is often weaker'
          ]
        },
        {
          name: 'Body Serves',
          description: 'Practice serving directly at where the receiver stands. This jams their swing.',
          duration_minutes: 10,
          reps_or_sets: '25 body-target serves',
          tips: [
            'Hip area is hardest to return',
            'Quick hips required to return',
            'Great for indecisive opponents'
          ]
        },
        {
          name: 'Placement Pressure Drill',
          description: 'Alternate between all three targets: backhand corner, body, forehand corner.',
          duration_minutes: 8,
          reps_or_sets: '3 rounds of 10 (alternating targets)',
          tips: [
            'Announce your target before serving',
            'Track your accuracy percentage',
            'Same motion, different aim point'
          ]
        }
      ],
      practice_goals: [
        'Hit each target zone 10+ times',
        'Develop a go-to serve location',
        'Achieve 60% placement accuracy'
      ],
      success_metrics: [
        '60%+ serves to intended target',
        'Comfortable with all 3 zones',
        'No double faults in drill'
      ],
      cooldown: [
        'Arm across body stretch (30 sec each)',
        'Tricep stretches (20 sec each)',
        'Mental review of best serves'
      ],
      coach_notes: 'Your serve should be a weapon, not just a way to start the point. Placement creates opportunities.',
      age_adaptations: {
        youth: 'Use cones or targets to make aiming visual and fun. Competition with self or partner.',
        adult: 'Think strategically - which opponent weakness can you exploit with placement?',
        senior: 'Placement over power is your advantage. Smart serves beat hard serves.'
      },
      gender_tips: {
        general: 'Accuracy matters more than velocity. A well-placed serve at 70% power beats a wild one at 100%.',
        power_focus: 'Add depth to your serves - deep + fast = very difficult returns.',
        finesse_focus: 'Disguise is powerful. Same motion, different targets keeps opponents guessing.'
      }
    },
    {
      day: 3,
      title: 'Return Fundamentals',
      focus: 'Ready position, split step, and basic returns',
      description: 'Returning serve is arguably more important than serving. Today we build your return foundation.',
      duration_minutes: 35,
      warmup: {
        title: 'Return Ready Warm-Up',
        exercises: [
          'Split step practice (20 reps)',
          'Lateral shuffles (1 minute)',
          'Quick feet ladder drills (imaginary)',
          'Light volleys if partner available'
        ],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Ready Position Holds',
          description: 'Practice the athletic ready position: knees bent, weight on balls of feet, paddle up.',
          duration_minutes: 5,
          reps_or_sets: '5 holds of 30 seconds',
          tips: [
            'Slight forward lean',
            'Paddle at chest height',
            'Eyes locked on server'
          ]
        },
        {
          name: 'Split Step Timing',
          description: 'The split step happens as the server makes contact. This loads your legs for quick reaction.',
          duration_minutes: 10,
          reps_or_sets: 'Partner feeds 30 serves',
          tips: [
            'Small hop, land on both feet',
            'Time it with server contact',
            'Stay balanced, not jumping'
          ]
        },
        {
          name: 'Deep Return Practice',
          description: 'Return serves deep to the baseline. Keep opponents back and give yourself time.',
          duration_minutes: 12,
          reps_or_sets: '40 return attempts',
          tips: [
            'Aim for the back third of court',
            'Higher trajectory = deeper landing',
            'Compact swing, no wind-up'
          ]
        }
      ],
      practice_goals: [
        'Consistent split step on every serve',
        '70% of returns land deep',
        'Stay balanced through contact'
      ],
      success_metrics: [
        'Split step becomes automatic',
        '28+ deep returns (70%)',
        'No lunging or off-balance hits'
      ],
      cooldown: [
        'Quad stretches (30 sec each)',
        'Hip flexor stretches (30 sec each)',
        'Ankle circles (10 each direction)'
      ],
      coach_notes: 'The return sets up everything. A deep return = you can get to the kitchen. A short return = you\'re in trouble.',
      age_adaptations: {
        youth: 'Focus on the fun of quick reactions. Make it a reflex game!',
        adult: 'Deep returns are your ticket to the net. Make this automatic.',
        senior: 'The split step protects your knees. Proper mechanics = injury prevention.'
      },
      gender_tips: {
        general: 'Everyone returns. The technique is identical - quick, compact, deep.',
        power_focus: 'You can drive returns, but depth is still priority #1.',
        finesse_focus: 'Soft, deep returns with backspin are incredibly effective.'
      }
    },
    {
      day: 4,
      title: 'Return Placement',
      focus: 'Strategic return targets and decision-making',
      description: 'Learn where to place returns for maximum advantage. Good returns create offensive opportunities.',
      duration_minutes: 40,
      warmup: {
        title: 'Movement Warm-Up',
        exercises: [
          'Return position to kitchen runs (5 reps)',
          'Split steps with direction change (15 reps)',
          'Shadow returns with footwork (20 reps)',
          'Light return rallies to warm up'
        ],
        duration_minutes: 7
      },
      main_drills: [
        {
          name: 'Cross-Court Returns',
          description: 'Return cross-court to the backhand side. This is the highest percentage return in pickleball.',
          duration_minutes: 12,
          reps_or_sets: '35 cross-court return attempts',
          tips: [
            'Opens up the court angle',
            'More margin over the net center',
            'Backhand is usually weaker'
          ]
        },
        {
          name: 'Down-the-Line Returns',
          description: 'Return down the line to keep opponent honest. Use sparingly as it\'s higher risk.',
          duration_minutes: 10,
          reps_or_sets: '20 down-the-line attempts',
          tips: [
            'Tighter window, more risky',
            'Effective when cross-court expected',
            'Keep it deep!'
          ]
        },
        {
          name: 'Pattern Recognition Game',
          description: 'Partner varies serve location. You respond with appropriate return target.',
          duration_minutes: 12,
          reps_or_sets: '30 serves with varied responses',
          tips: [
            'Wide serve = cross-court return',
            'Middle serve = pick your favorite',
            'React, don\'t overthink'
          ]
        }
      ],
      practice_goals: [
        'Develop cross-court as default return',
        'Know when to go down-the-line',
        '75% returns land in target zone'
      ],
      success_metrics: [
        'Cross-court becomes natural default',
        '26+ returns to intended target',
        'Quick decision-making'
      ],
      cooldown: [
        'Standing hamstring stretch',
        'Shoulder rolls (20 each direction)',
        'Deep breathing visualization'
      ],
      coach_notes: 'Cross-court is your bread and butter. It\'s the safe, smart play. Down-the-line is your changeup.',
      age_adaptations: {
        youth: 'Think of it like choosing plays in a video game. Each serve has a best response!',
        adult: 'Pattern recognition wins matches. Train your brain to see and react.',
        senior: 'Smart placement reduces the need for athletic recovery shots.'
      },
      gender_tips: {
        general: 'Court geometry is the same for everyone. Learn the angles.',
        power_focus: 'You can hit harder AND smart. Deep cross-court with pace is elite.',
        finesse_focus: 'Soft angle returns that die in the kitchen are devastating.'
      }
    },
    {
      day: 5,
      title: 'Serve Spin Introduction',
      focus: 'Adding topspin and slice to your serves',
      description: 'Elevate your serve game with spin. Spin creates unpredictable bounces and harder returns.',
      duration_minutes: 40,
      warmup: {
        title: 'Spin Preparation',
        exercises: [
          'Wrist flexibility exercises (2 minutes)',
          'Ball spin practice in hand',
          'Shadow serves with spin motion',
          'Regular serves to establish baseline'
        ],
        duration_minutes: 7
      },
      main_drills: [
        {
          name: 'Topspin Serve Basics',
          description: 'Brush up on the ball at contact. The paddle travels low-to-high creating forward rotation.',
          duration_minutes: 12,
          reps_or_sets: '30 topspin serve attempts',
          tips: [
            'Low to high paddle path',
            'Brush the back of the ball',
            'Ball will dive after the bounce'
          ]
        },
        {
          name: 'Slice/Side-Spin Serve',
          description: 'Cut across the ball from right to left (for righties). Creates a curving, skidding bounce.',
          duration_minutes: 12,
          reps_or_sets: '30 slice serve attempts',
          tips: [
            'Paddle travels across the ball',
            'Ball curves in the air',
            'Stays low after bounce'
          ]
        },
        {
          name: 'Spin Selection Drill',
          description: 'Alternate between flat, topspin, and slice serves. Develop your full arsenal.',
          duration_minutes: 10,
          reps_or_sets: '30 serves (10 of each type)',
          tips: [
            'Same toss, different contact',
            'Disguise your intention',
            'Track which spin you control best'
          ]
        }
      ],
      practice_goals: [
        'Understand the mechanics of each spin',
        'Land 50% of spin serves in court',
        'Feel the difference in contact'
      ],
      success_metrics: [
        'Can produce visible spin on demand',
        '15+ of each spin type lands',
        'Beginning to feel which spin suits you'
      ],
      cooldown: [
        'Wrist circles and stretches',
        'Forearm stretches',
        'Light shoulder work'
      ],
      coach_notes: 'Spin is the great equalizer. You don\'t need power when you have deception and movement on the ball.',
      age_adaptations: {
        youth: 'Spin is cool! Experiment and have fun seeing how the ball moves.',
        adult: 'Spin serves are tactical weapons. Learn when each is most effective.',
        senior: 'Spin reduces the need for power. Let the ball do the work.'
      },
      gender_tips: {
        general: 'Spin is about technique, not strength. Everyone can learn it.',
        power_focus: 'Topspin + power = heavy balls that are hard to handle.',
        finesse_focus: 'Slice keeps the ball low - perfect for finesse players.'
      }
    },
    {
      day: 6,
      title: 'Pressure Situations',
      focus: 'Serving and returning under game-like pressure',
      description: 'Practice with purpose. Simulate match conditions to build mental toughness.',
      duration_minutes: 45,
      warmup: {
        title: 'Competition Warm-Up',
        exercises: [
          'Full serve routine practice',
          'Return position resets',
          'Mental visualization (1 minute)',
          'Progressive intensity serves'
        ],
        duration_minutes: 8
      },
      main_drills: [
        {
          name: '10-in-a-Row Challenge',
          description: 'Hit 10 consecutive serves in the court. Reset to zero on any fault.',
          duration_minutes: 12,
          reps_or_sets: 'Until you hit 10 in a row',
          tips: [
            'Stay calm, breathe',
            'Trust your technique',
            'Process over outcome'
          ]
        },
        {
          name: 'Game Point Serves',
          description: 'Imagine it\'s 10-10. You need this serve. Execute 10 "game point" serves.',
          duration_minutes: 10,
          reps_or_sets: '10 high-pressure serves',
          tips: [
            'Use your pre-serve routine',
            'Pick your most reliable serve',
            'Deep breath before each'
          ]
        },
        {
          name: 'Return Under Fire',
          description: 'Partner serves with variety and pace. You must return every serve deep.',
          duration_minutes: 12,
          reps_or_sets: '30 varied serves to return',
          tips: [
            'Stay in ready position',
            'Expect anything',
            'Depth over perfection'
          ]
        }
      ],
      practice_goals: [
        'Complete the 10-in-a-row challenge',
        'Execute 8/10 game point serves',
        'Return 80% of varied serves'
      ],
      success_metrics: [
        '10 consecutive serves achieved',
        '8+ game point serves in court',
        '24+ returns deep'
      ],
      cooldown: [
        'Mental debrief (what worked?)',
        'Light stretching',
        'Positive self-talk'
      ],
      coach_notes: 'Pressure is a privilege. The more you practice under pressure, the more comfortable you\'ll be in matches.',
      age_adaptations: {
        youth: 'Make it a game with rewards! Hit your targets, earn points.',
        adult: 'This is where mental game separates good from great.',
        senior: 'Experience is your advantage. Trust your practice.'
      },
      gender_tips: {
        general: 'Pressure is mental, not physical. Everyone feels it.',
        power_focus: 'Under pressure, controlled power beats max power.',
        finesse_focus: 'Your consistency is your weapon when others tighten up.'
      }
    },
    {
      day: 7,
      title: 'Integration & Game Play',
      focus: 'Combining all skills in real point situations',
      description: 'Put it all together! Today is about playing points and seeing how far you\'ve come.',
      duration_minutes: 50,
      warmup: {
        title: 'Full Warm-Up',
        exercises: [
          'All serve types (5 each)',
          'Return practice (15 balls)',
          'Split step drill',
          'Mental preparation'
        ],
        duration_minutes: 10
      },
      main_drills: [
        {
          name: 'Serve & Return Rally',
          description: 'Play out points starting from your serve. Focus on executing your serve and transition.',
          duration_minutes: 15,
          reps_or_sets: '15 points from your serve',
          tips: [
            'Use what you learned this week',
            'Serve with intention',
            'Move forward after a good serve'
          ]
        },
        {
          name: 'Return & Transition',
          description: 'Now you return. Focus on deep returns and getting to the kitchen line.',
          duration_minutes: 15,
          reps_or_sets: '15 points returning serve',
          tips: [
            'Deep return = run forward',
            'Split step at kitchen line',
            'Be patient'
          ]
        },
        {
          name: 'Full Games',
          description: 'Play actual games! Apply everything you\'ve learned this week.',
          duration_minutes: 12,
          reps_or_sets: 'Games to 11',
          tips: [
            'Trust your training',
            'Notice improvements',
            'Have fun!'
          ]
        }
      ],
      practice_goals: [
        'Win majority of service points',
        'Return deep consistently',
        'Feel confident in your serve'
      ],
      success_metrics: [
        '60%+ service points won',
        'Deep returns on 70%+ attempts',
        'Serve feels reliable'
      ],
      cooldown: [
        'Full body stretch (5 minutes)',
        'Reflect on the week',
        'Set goals for continued improvement'
      ],
      coach_notes: 'Congratulations! You\'ve built a foundation. Now maintain it with regular practice. Consistency beats intensity.',
      age_adaptations: {
        youth: 'Play lots of games! The more you play, the better you get.',
        adult: 'Schedule regular play to maintain what you\'ve built.',
        senior: 'Enjoy the game! Your improved technique will serve you well.'
      },
      gender_tips: {
        general: 'Everyone improves with practice. Celebrate your progress!',
        power_focus: 'Now add power gradually to your solid foundation.',
        finesse_focus: 'Your smart play will frustrate power players.'
      }
    }
  ]
}

// ========================================
// BEGINNER: FUNDAMENTALS (14 Days)
// ========================================
const beginnerFundamentals: TrainingProgramContent = {
  programId: 'beginner-fundamentals',
  name: 'Pickleball Fundamentals',
  tagline: 'Build your complete pickleball foundation',
  description: 'A comprehensive 14-day program covering all essential skills: serves, returns, volleys, dinks, and basic strategy. Perfect for new players wanting a complete introduction.',
  what_youll_learn: [
    'All basic strokes and techniques',
    'Court positioning and movement',
    'Kitchen rules and strategy',
    'Basic scoring and game flow',
    'Partner communication',
    'Simple but effective strategies'
  ],
  who_is_this_for: [
    'Complete beginners to pickleball',
    'Tennis/racquet sport converts',
    'Anyone wanting a structured introduction'
  ],
  prerequisites: [
    'No prior experience needed',
    'Basic fitness to move around a court'
  ],
  equipment_needed: [
    'Pickleball paddle',
    'Pickleballs',
    'Court access',
    'Comfortable court shoes'
  ],
  dailyStructure: [
    {
      day: 1,
      title: 'Welcome to Pickleball',
      focus: 'Court orientation, rules, and first touches',
      description: 'Get comfortable with your paddle, understand the court, and hit your first balls!',
      duration_minutes: 25,
      warmup: {
        title: 'Gentle Start',
        exercises: ['Light walking', 'Arm swings', 'Paddle handling'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Court Tour',
          description: 'Walk the court and learn all the lines and zones.',
          duration_minutes: 5,
          tips: ['Baseline', 'Kitchen line', 'Centerline', 'Service boxes']
        },
        {
          name: 'Ball Bouncing',
          description: 'Bounce the ball on your paddle to develop feel.',
          duration_minutes: 10,
          reps_or_sets: 'Try for 20 consecutive bounces',
          tips: ['Soft grip', 'Watch the ball', 'Stay relaxed']
        }
      ],
      practice_goals: ['Know the court', 'Control ball bounces', 'Feel comfortable'],
      success_metrics: ['Can name all court areas', '10+ consecutive bounces'],
      cooldown: ['Light stretching', 'Review what you learned'],
      coach_notes: 'Day 1 is about fun and familiarity. No pressure!',
      age_adaptations: {
        youth: 'Make it a treasure hunt around the court!',
        adult: 'Take mental notes - this knowledge helps strategy later.',
        senior: 'Take your time. Familiarity prevents confusion later.'
      },
      gender_tips: {
        general: 'Everyone starts here. Embrace being a beginner!'
      }
    },
    {
      day: 2,
      title: 'Grip & Ready Position',
      focus: 'Proper paddle grip and athletic stance',
      description: 'The foundation of every shot starts with grip and stance.',
      duration_minutes: 30,
      warmup: {
        title: 'Joint Mobility',
        exercises: ['Wrist circles', 'Shoulder rolls', 'Light bouncing'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Continental Grip Mastery',
          description: 'Learn and practice the versatile continental grip.',
          duration_minutes: 10,
          tips: ['Shake hands with paddle', 'Relaxed fingers', 'V-shape alignment']
        },
        {
          name: 'Ready Position Practice',
          description: 'Athletic stance with paddle up, ready to react.',
          duration_minutes: 12,
          tips: ['Knees bent', 'Weight forward', 'Paddle at chest']
        }
      ],
      practice_goals: ['Consistent grip', 'Comfortable ready position'],
      success_metrics: ['Grip feels natural', 'Can hold position 30 seconds'],
      cooldown: ['Wrist stretches', 'Shoulder stretches'],
      coach_notes: 'Grip is the foundation. Get this right!',
      age_adaptations: {
        youth: 'Play "freeze" in ready position!',
        adult: 'Muscle memory starts today.',
        senior: 'Comfortable grip = less strain.'
      },
      gender_tips: {
        general: 'Grip strength matters less than grip correctness.'
      }
    },
    // Days 3-14 continue with volleys, dinks, serve, return, movement, etc.
    // Adding condensed versions for space
    {
      day: 3,
      title: 'Forehand Basics',
      focus: 'Forehand groundstroke fundamentals',
      description: 'Learn the forehand - your primary offensive weapon.',
      duration_minutes: 35,
      warmup: {
        title: 'Arm Prep',
        exercises: ['Shadow swings', 'Footwork'],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Drop Feed Forehands',
          description: 'Self-feed and hit controlled forehands.',
          duration_minutes: 15,
          tips: ['Compact swing', 'Follow through', 'Watch contact']
        }
      ],
      practice_goals: ['25 controlled forehands'],
      success_metrics: ['Consistent contact point'],
      cooldown: ['Arm stretches'],
      coach_notes: 'Keep it simple. Power comes later.',
      age_adaptations: {
        youth: 'Count your hits!',
        adult: 'Focus on repeatable motion.',
        senior: 'Easy does it.'
      },
      gender_tips: { general: 'Technique over power.' }
    },
    {
      day: 4,
      title: 'Backhand Basics',
      focus: 'Backhand groundstroke fundamentals',
      description: 'Develop your backhand to eliminate weaknesses.',
      duration_minutes: 35,
      warmup: {
        title: 'Full Warm-Up',
        exercises: ['Both side swings', 'Light hitting'],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Backhand Development',
          description: 'One-hand and two-hand options explored.',
          duration_minutes: 15,
          tips: ['Find what works', 'Rotate shoulders', 'Compact motion']
        }
      ],
      practice_goals: ['Comfortable backhand'],
      success_metrics: ['20 controlled backhands'],
      cooldown: ['Full stretching'],
      coach_notes: 'Most players are forehand dominant. Work the backhand!',
      age_adaptations: {
        youth: 'Two-hand often works well.',
        adult: 'Experiment with both options.',
        senior: 'Two-hand can provide stability.'
      },
      gender_tips: { general: 'Find YOUR backhand style.' }
    },
    {
      day: 5,
      title: 'Volley Introduction',
      focus: 'Punch volleys at the kitchen line',
      description: 'Volleys are key in pickleball. No big swings - just punch!',
      duration_minutes: 35,
      warmup: {
        title: 'Quick Hands',
        exercises: ['Ball bounces', 'Reflex catches'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Wall Volleys',
          description: 'Practice punch volleys against a wall.',
          duration_minutes: 15,
          tips: ['No backswing', 'Firm wrist', 'Punch through']
        }
      ],
      practice_goals: ['Consistent volley contact'],
      success_metrics: ['10 consecutive wall volleys'],
      cooldown: ['Wrist care'],
      coach_notes: 'Volleys win points. Keep them compact!',
      age_adaptations: {
        youth: 'Quick hands game!',
        adult: 'Reflex training.',
        senior: 'Positioning beats reaching.'
      },
      gender_tips: { general: 'Touch beats power on volleys.' }
    },
    {
      day: 6,
      title: 'The Dink',
      focus: 'Soft kitchen play fundamentals',
      description: 'The dink is what makes pickleball unique. Soft touch, big results.',
      duration_minutes: 35,
      warmup: {
        title: 'Soft Touch Prep',
        exercises: ['Gentle bouncing', 'Slow motion swings'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Target Dinking',
          description: 'Aim dinks at targets in the kitchen.',
          duration_minutes: 15,
          tips: ['Lift, don\'t hit', 'Open paddle face', 'Use your legs']
        }
      ],
      practice_goals: ['Soft, controlled dinks'],
      success_metrics: ['Land 15 in kitchen'],
      cooldown: ['Light movement'],
      coach_notes: 'Patience wins dink rallies.',
      age_adaptations: {
        youth: 'It\'s like a gentle game of catch.',
        adult: 'Master this to beat power players.',
        senior: 'Your secret weapon - no running needed!'
      },
      gender_tips: { general: 'Finesse is king/queen here.' }
    },
    {
      day: 7,
      title: 'Serve Practice',
      focus: 'Reliable, legal serves',
      description: 'You must serve to score. Make it reliable.',
      duration_minutes: 35,
      warmup: {
        title: 'Serve Prep',
        exercises: ['Arm swings', 'Practice tosses'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Consistent Serves',
          description: 'Focus on getting serves in, not on power.',
          duration_minutes: 15,
          tips: ['Underhand motion', 'Contact below waist', 'Smooth motion']
        }
      ],
      practice_goals: ['80% serve rate'],
      success_metrics: ['40/50 serves in'],
      cooldown: ['Shoulder care'],
      coach_notes: 'A serve in is better than a fast fault.',
      age_adaptations: {
        youth: 'Consistency game!',
        adult: 'Build the foundation.',
        senior: 'Easy motion, reliable results.'
      },
      gender_tips: { general: 'Technique beats power.' }
    },
    {
      day: 8,
      title: 'Return of Serve',
      focus: 'Getting returns deep',
      description: 'A deep return gives you time to get to the net.',
      duration_minutes: 35,
      warmup: {
        title: 'Ready Position',
        exercises: ['Split steps', 'Quick movements'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Deep Return Focus',
          description: 'Every return should land deep.',
          duration_minutes: 15,
          tips: ['High trajectory', 'Move forward after', 'Compact swing']
        }
      ],
      practice_goals: ['70% returns deep'],
      success_metrics: ['Consistent depth'],
      cooldown: ['Leg stretches'],
      coach_notes: 'Deep returns = net position.',
      age_adaptations: {
        youth: 'Hit it far back!',
        adult: 'This is your ticket to the kitchen.',
        senior: 'Smart returns beat athletic ones.'
      },
      gender_tips: { general: 'Depth wins.' }
    },
    {
      day: 9,
      title: 'Third Shot Drop',
      focus: 'The most important shot in pickleball',
      description: 'The third shot drop gets you to the net safely.',
      duration_minutes: 40,
      warmup: {
        title: 'Soft Touch Prep',
        exercises: ['Dink warm-up', 'Distance control'],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Third Shot Drop Practice',
          description: 'From baseline, drop the ball into the kitchen.',
          duration_minutes: 18,
          tips: ['Soft hands', 'Arc over net', 'Follow your shot']
        }
      ],
      practice_goals: ['Understand the shot'],
      success_metrics: ['Land 10 drops in kitchen'],
      cooldown: ['Mental review'],
      coach_notes: 'This shot separates levels. Practice it!',
      age_adaptations: {
        youth: 'Like a soft lob to a target.',
        adult: 'The shot that wins games.',
        senior: 'This is how you get to the net safely.'
      },
      gender_tips: { general: 'Touch shot - everyone learns it the same.' }
    },
    {
      day: 10,
      title: 'Court Movement',
      focus: 'Efficient movement patterns',
      description: 'Move smart, not just fast. Positioning wins points.',
      duration_minutes: 35,
      warmup: {
        title: 'Movement Warm-Up',
        exercises: ['Shuffles', 'Forward/back', 'Split steps'],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Shadow Court Movement',
          description: 'Practice moving to positions without a ball.',
          duration_minutes: 15,
          tips: ['Stay low', 'Quick feet', 'Recover to center']
        }
      ],
      practice_goals: ['Efficient movement'],
      success_metrics: ['No wasted steps'],
      cooldown: ['Leg stretches'],
      coach_notes: 'Smart movement = less fatigue, better position.',
      age_adaptations: {
        youth: 'Quick feet competition!',
        adult: 'Efficiency is key.',
        senior: 'Position beats speed.'
      },
      gender_tips: { general: 'Court sense is universal.' }
    },
    {
      day: 11,
      title: 'Partner Communication',
      focus: 'Doubles teamwork basics',
      description: 'Pickleball is a team sport. Learn to communicate.',
      duration_minutes: 35,
      warmup: {
        title: 'Team Warm-Up',
        exercises: ['Partner rallies', 'Call practice'],
        duration_minutes: 5
      },
      main_drills: [
        {
          name: 'Mine/Yours Calls',
          description: 'Practice calling balls early and clearly.',
          duration_minutes: 15,
          tips: ['Call early', 'Call loud', 'Trust partner']
        }
      ],
      practice_goals: ['Clear communication'],
      success_metrics: ['No confusion on balls'],
      cooldown: ['Team debrief'],
      coach_notes: 'Communication prevents collisions and confusion.',
      age_adaptations: {
        youth: 'Team game!',
        adult: 'Clear calls win points.',
        senior: 'Communication is your advantage.'
      },
      gender_tips: { general: 'Partners should complement each other.' }
    },
    {
      day: 12,
      title: 'Basic Strategy',
      focus: 'Simple winning strategies',
      description: 'Learn the basics: get to the net, keep opponents back.',
      duration_minutes: 40,
      warmup: {
        title: 'Full Warm-Up',
        exercises: ['All shots review'],
        duration_minutes: 6
      },
      main_drills: [
        {
          name: 'Strategy Implementation',
          description: 'Practice the serve-return-drop-dink sequence.',
          duration_minutes: 18,
          tips: ['Serve deep', 'Return deep', 'Drop soft', 'Dink patient']
        }
      ],
      practice_goals: ['Understand basic strategy'],
      success_metrics: ['Execute the sequence'],
      cooldown: ['Mental review'],
      coach_notes: 'Simple strategy executed well beats complex plans.',
      age_adaptations: {
        youth: 'Game plan!',
        adult: 'Strategy wins matches.',
        senior: 'Smart play is your edge.'
      },
      gender_tips: { general: 'Strategy is mental, not physical.' }
    },
    {
      day: 13,
      title: 'Game Situations',
      focus: 'Handling common scenarios',
      description: 'Practice what you\'ll actually face in games.',
      duration_minutes: 45,
      warmup: {
        title: 'Full Prep',
        exercises: ['All skills warm-up'],
        duration_minutes: 8
      },
      main_drills: [
        {
          name: 'Situation Drills',
          description: 'Practice specific game situations.',
          duration_minutes: 20,
          tips: ['Lob defense', 'Erne attempts', 'ATP situations']
        }
      ],
      practice_goals: ['Handle situations'],
      success_metrics: ['Respond appropriately'],
      cooldown: ['Reflect on progress'],
      coach_notes: 'The more situations you see, the better you respond.',
      age_adaptations: {
        youth: 'Lots of variety!',
        adult: 'Experience builder.',
        senior: 'Recognition is key.'
      },
      gender_tips: { general: 'Adaptability wins.' }
    },
    {
      day: 14,
      title: 'Graduation Games',
      focus: 'Put it all together',
      description: 'Play full games and celebrate your progress!',
      duration_minutes: 60,
      warmup: {
        title: 'Complete Warm-Up',
        exercises: ['All skills', 'Full prep'],
        duration_minutes: 10
      },
      main_drills: [
        {
          name: 'Full Games',
          description: 'Play games to 11, win by 2.',
          duration_minutes: 40,
          tips: ['Apply everything', 'Have fun', 'Notice your improvement']
        }
      ],
      practice_goals: ['Enjoy the game!'],
      success_metrics: ['Play complete games confidently'],
      cooldown: ['Celebrate!', 'Plan for continued play'],
      coach_notes: 'Congratulations! You are now a pickleball player!',
      age_adaptations: {
        youth: 'Party time!',
        adult: 'You\'ve built a foundation.',
        senior: 'Welcome to pickleball!'
      },
      gender_tips: { general: 'Everyone improves. Keep playing!' }
    }
  ]
}

// ========================================
// INTERMEDIATE: THIRD SHOT EXCELLENCE
// ========================================
const intermediateThirdShot: TrainingProgramContent = {
  programId: 'intermediate-third-shot',
  name: 'Third Shot Excellence',
  tagline: 'Master the shot that changes everything',
  description: 'The third shot is the gateway to net play. This 10-day program develops your drop, drive, and decision-making to dominate the transition game.',
  what_youll_learn: [
    'Third shot drop mechanics',
    'When to drop vs. drive',
    'Transition zone movement',
    'Reading opponent position',
    'Disguise and deception',
    'Pressure-proof execution'
  ],
  who_is_this_for: [
    'Players with solid fundamentals',
    'Those struggling to get to the net',
    'Anyone ready to level up'
  ],
  prerequisites: [
    'Consistent serve and return',
    'Basic dink ability',
    '3.0+ skill level'
  ],
  equipment_needed: [
    'Paddle', 'Balls', 'Court', 'Partner recommended'
  ],
  dailyStructure: [
    {
      day: 1,
      title: 'Drop Fundamentals',
      focus: 'Basic third shot drop mechanics',
      description: 'Build the soft touch needed for consistent drops.',
      duration_minutes: 40,
      warmup: {
        title: 'Soft Hands',
        exercises: ['Dink warm-up', 'Touch drills'],
        duration_minutes: 7
      },
      main_drills: [
        {
          name: 'Kitchen Target Drops',
          description: 'From mid-court, drop into the kitchen consistently.',
          duration_minutes: 18,
          tips: ['Open paddle face', 'Lift, don\'t hit', 'Arc over net']
        }
      ],
      practice_goals: ['Feel the drop'],
      success_metrics: ['15+ drops in kitchen'],
      cooldown: ['Reflect on feel'],
      coach_notes: 'Soft is hard. Take your time.',
      age_adaptations: {
        youth: 'Feather touch!',
        adult: 'Feel over force.',
        senior: 'This is your shot!'
      },
      gender_tips: { general: 'Touch equalizes everything.' }
    },
    // Days 2-10 abbreviated for space
    {
      day: 2,
      title: 'Drop Depth Control',
      focus: 'Drops from various depths',
      description: 'Learn to drop from baseline, transition zone, and closer.',
      duration_minutes: 40,
      warmup: { title: 'Touch Prep', exercises: ['Various distance dinks'], duration_minutes: 6 },
      main_drills: [
        {
          name: 'Progressive Distance Drops',
          description: 'Start close, move back, maintaining quality.',
          duration_minutes: 20,
          tips: ['More arc from further back', 'Same soft contact']
        }
      ],
      practice_goals: ['Drops from all distances'],
      success_metrics: ['Consistent from 3 distances'],
      cooldown: ['Distance review'],
      coach_notes: 'Distance changes arc, not force.',
      age_adaptations: { youth: 'Distance challenge!', adult: 'Master all zones.', senior: 'Find your range.' },
      gender_tips: { general: 'Arc is your friend.' }
    },
    {
      day: 3,
      title: 'Third Shot Drive',
      focus: 'When and how to drive',
      description: 'Sometimes the drop isn\'t right. Learn the drive option.',
      duration_minutes: 40,
      warmup: { title: 'Power Prep', exercises: ['Groundstroke warm-up'], duration_minutes: 6 },
      main_drills: [
        {
          name: 'Targeted Drives',
          description: 'Drive at feet, not faces. Low and fast.',
          duration_minutes: 18,
          tips: ['Below net level', 'At their feet', 'Commit fully']
        }
      ],
      practice_goals: ['Controlled drives'],
      success_metrics: ['15+ drives below net'],
      cooldown: ['Shot selection thoughts'],
      coach_notes: 'Drive when they\'re back or not ready.',
      age_adaptations: { youth: 'Power time!', adult: 'Strategic aggression.', senior: 'Pick your spots.' },
      gender_tips: { general: 'Placement over power on drives too.' }
    },
    {
      day: 4,
      title: 'Decision Making',
      focus: 'Drop vs. drive decision tree',
      description: 'Learn when to drop, when to drive, when to lob.',
      duration_minutes: 45,
      warmup: { title: 'Full Warm-Up', exercises: ['All third shot options'], duration_minutes: 7 },
      main_drills: [
        {
          name: 'Read and React',
          description: 'Partner gives signals, you choose the right shot.',
          duration_minutes: 20,
          tips: ['Opponent back = drop', 'Opponent off-balance = drive', 'Opponent leaning = lob']
        }
      ],
      practice_goals: ['Correct shot selection'],
      success_metrics: ['80% right choices'],
      cooldown: ['Decision review'],
      coach_notes: 'The right shot wins, not just a good shot.',
      age_adaptations: { youth: 'Quick thinking!', adult: 'Strategic mind.', senior: 'Experience guides.' },
      gender_tips: { general: 'Smart > strong.' }
    },
    {
      day: 5,
      title: 'Following Your Shot',
      focus: 'Movement after the third shot',
      description: 'The shot doesn\'t end at contact. Move forward!',
      duration_minutes: 40,
      warmup: { title: 'Movement Prep', exercises: ['Split steps', 'Forward runs'], duration_minutes: 6 },
      main_drills: [
        {
          name: 'Drop and Move',
          description: 'Hit the drop, immediately move forward, split step.',
          duration_minutes: 18,
          tips: ['Move on good drops', 'Stop on bad ones', 'Read the return']
        }
      ],
      practice_goals: ['Automatic forward movement'],
      success_metrics: ['Move forward on 80% of drops'],
      cooldown: ['Movement patterns'],
      coach_notes: 'A good drop without movement is wasted.',
      age_adaptations: { youth: 'Run forward!', adult: 'Transition mastery.', senior: 'Smart forward movement.' },
      gender_tips: { general: 'Movement is universal.' }
    },
    {
      day: 6,
      title: 'Cross-Court Drops',
      focus: 'Angled drops for variety',
      description: 'Cross-court drops open up the court and create angles.',
      duration_minutes: 40,
      warmup: { title: 'Angle Prep', exercises: ['Cross-court dinks'], duration_minutes: 6 },
      main_drills: [
        {
          name: 'Cross-Court Targets',
          description: 'Drop cross-court to the opposite kitchen corner.',
          duration_minutes: 18,
          tips: ['More margin over center net', 'Opens court', 'Moves opponent']
        }
      ],
      practice_goals: ['Consistent cross-court drops'],
      success_metrics: ['12+ cross-court drops in kitchen'],
      cooldown: ['Angle thoughts'],
      coach_notes: 'Cross-court is often the smarter choice.',
      age_adaptations: { youth: 'Angles are cool!', adult: 'Strategic angles.', senior: 'Geometry wins.' },
      gender_tips: { general: 'Angles work for everyone.' }
    },
    {
      day: 7,
      title: 'Under Pressure',
      focus: 'Third shots against aggressive opponents',
      description: 'Learn to execute when facing hard returns and aggression.',
      duration_minutes: 45,
      warmup: { title: 'Pressure Prep', exercises: ['Fast-paced warm-up'], duration_minutes: 7 },
      main_drills: [
        {
          name: 'Aggressive Returns Practice',
          description: 'Partner hits hard, you drop soft.',
          duration_minutes: 20,
          tips: ['Absorb pace', 'Soft hands', 'Stay calm']
        }
      ],
      practice_goals: ['Calm under fire'],
      success_metrics: ['50% drops off hard balls'],
      cooldown: ['Mental reset'],
      coach_notes: 'Soft absorbs hard. Don\'t fight fire with fire.',
      age_adaptations: { youth: 'Stay cool!', adult: 'Mental toughness.', senior: 'Experience is calm.' },
      gender_tips: { general: 'Composure is key.' }
    },
    {
      day: 8,
      title: 'Disguise',
      focus: 'Same motion, different shots',
      description: 'Keep opponents guessing with identical preparation.',
      duration_minutes: 40,
      warmup: { title: 'Variety Prep', exercises: ['All third shot types'], duration_minutes: 6 },
      main_drills: [
        {
          name: 'Same Setup Drill',
          description: 'Same backswing for drop, drive, and lob.',
          duration_minutes: 18,
          tips: ['Identical prep', 'Decision at last moment', 'Watch opponent']
        }
      ],
      practice_goals: ['Unreadable third shot'],
      success_metrics: ['Partner can\'t predict'],
      cooldown: ['Disguise review'],
      coach_notes: 'Deception is a skill. Practice it.',
      age_adaptations: { youth: 'Trick shots!', adult: 'Strategic deception.', senior: 'Brain over brawn.' },
      gender_tips: { general: 'Disguise works for everyone.' }
    },
    {
      day: 9,
      title: 'Consistency Challenge',
      focus: '10-in-a-row third shot drops',
      description: 'Build the reliability to trust your shot in matches.',
      duration_minutes: 45,
      warmup: { title: 'Full Warm-Up', exercises: ['Progressive drops'], duration_minutes: 7 },
      main_drills: [
        {
          name: '10-in-a-Row',
          description: 'Hit 10 consecutive quality drops.',
          duration_minutes: 20,
          tips: ['Reset on miss', 'Stay patient', 'Trust the process']
        }
      ],
      practice_goals: ['Complete 10-in-a-row'],
      success_metrics: ['10 consecutive quality drops'],
      cooldown: ['Achievement reflection'],
      coach_notes: 'This is where confidence is built.',
      age_adaptations: { youth: 'Challenge accepted!', adult: 'Prove yourself.', senior: 'Patience pays.' },
      gender_tips: { general: 'Consistency wins.' }
    },
    {
      day: 10,
      title: 'Game Integration',
      focus: 'Third shots in real play',
      description: 'Apply everything in actual games.',
      duration_minutes: 50,
      warmup: { title: 'Complete Prep', exercises: ['Full warm-up'], duration_minutes: 8 },
      main_drills: [
        {
          name: 'Full Games Focus',
          description: 'Play games with third shot focus.',
          duration_minutes: 30,
          tips: ['Track your thirds', 'Notice decisions', 'Celebrate good ones']
        }
      ],
      practice_goals: ['Apply in games'],
      success_metrics: ['60%+ quality third shots'],
      cooldown: ['Program reflection'],
      coach_notes: 'You\'ve transformed your third shot. Keep practicing!',
      age_adaptations: { youth: 'Show off!', adult: 'Prove it in play.', senior: 'Enjoy your new weapon.' },
      gender_tips: { general: 'Your third shot is now a strength!' }
    }
  ]
}

// ========================================
// SEED FUNCTION
// ========================================
async function seedTrainingContent() {
  console.log('🌱 Starting Training Program Content Seed...')
  
  const programs = [beginnerServeReturn, beginnerFundamentals, intermediateThirdShot]
  
  for (const programData of programs) {
    try {
      console.log(`\n📚 Updating: ${programData.name}`)
      
      // Find existing program
      const existing = await prisma.trainingProgram.findFirst({
        where: { programId: programData.programId }
      })
      
      if (existing) {
        // Update with full content
        await prisma.trainingProgram.update({
          where: { id: existing.id },
          data: {
            name: programData.name,
            tagline: programData.tagline,
            description: programData.description,
            keyOutcomes: {
              what_youll_learn: programData.what_youll_learn,
              who_is_this_for: programData.who_is_this_for,
              prerequisites: programData.prerequisites,
              equipment_needed: programData.equipment_needed
            },
            dailyStructure: programData.dailyStructure,
            durationDays: programData.dailyStructure.length
          }
        })
        console.log(`  ✅ Updated ${programData.name} with ${programData.dailyStructure.length} days`)
      } else {
        console.log(`  ⚠️ Program not found: ${programData.programId}`)
      }
    } catch (error) {
      console.error(`  ❌ Error updating ${programData.name}:`, error)
    }
  }
  
  console.log('\n✅ Training Content Seed Complete!')
}

// Run seed
seedTrainingContent()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
