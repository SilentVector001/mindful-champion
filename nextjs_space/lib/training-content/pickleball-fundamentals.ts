/**
 * PICKLEBALL FUNDAMENTALS - Complete 14-Day Training Program
 * Real content with warmups, drills, cooldowns, and instructional videos
 */

export const pickleballFundamentalsProgram = {
  programId: 'beginner-fundamentals',
  name: 'Pickleball Fundamentals',
  tagline: 'Master the basics and build a solid foundation',
  description: 'Perfect for complete beginners! This 14-day comprehensive program covers everything you need to start playing pickleball with confidence.',
  durationDays: 14,
  skillLevel: 'BEGINNER',
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
      // DAY 1: Introduction & Grip Fundamentals
      {
        day: 1,
        title: "Welcome & Grip Mastery",
        focus: "Continental grip and paddle control",
        description: "Start your pickleball journey by mastering the fundamental continental grip and basic paddle control. This foundation will set you up for success in all future shots.",
        duration_minutes: 30,
        videoUrl: "https://www.youtube.com/watch?v=LbqPi1y_ooc",
        videoTitle: "Pickleball Basics: The Continental Grip",
        warmup: {
          title: "Dynamic Warm-up",
          exercises: [
            "5 minutes light jogging or jumping jacks",
            "Arm circles (10 forward, 10 backward)",
            "Wrist rotations (20 circles each direction)",
            "Shoulder rolls (10 forward, 10 backward)",
            "Light stretching focusing on shoulders and wrists"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Continental Grip Practice",
            description: "Learn and practice the continental grip - the foundation of all pickleball shots. Hold the paddle like you're shaking hands with it.",
            duration_minutes: 8,
            reps_or_sets: "5 minutes practice, 3 minutes self-check",
            tips: [
              "Your knuckle should be on the edge of the paddle",
              "Grip firmly but not too tight - think 6/10 pressure",
              "The V between thumb and index finger points to 12 o'clock"
            ]
          },
          {
            name: "Wall Rally Practice",
            description: "Stand 5 feet from a wall and practice controlled hits, focusing on paddle control and consistent contact.",
            duration_minutes: 10,
            reps_or_sets: "3 sets of 30 consecutive wall hits",
            tips: [
              "Keep your eye on the ball until contact",
              "Use gentle, controlled swings",
              "Focus on paddle face angle staying perpendicular"
            ]
          },
          {
            name: "Ready Position Drills",
            description: "Practice the athletic ready position: knees bent, weight on balls of feet, paddle up at chest height.",
            duration_minutes: 7,
            reps_or_sets: "10 reps of 30 seconds each",
            tips: [
              "Keep paddle at sternum height",
              "Stay light on your feet",
              "Eyes forward, knees slightly bent"
            ]
          }
        ],
        practice_goals: [
          "Hold the continental grip comfortably for 10+ minutes",
          "Complete 30 consecutive wall rallies",
          "Maintain ready position for 30 seconds without fatigue"
        ],
        success_metrics: [
          "Can demonstrate continental grip without looking",
          "Hit wall 25+ times in a row",
          "Feel comfortable in ready position"
        ],
        cooldown: [
          "Gentle arm swings and stretches",
          "Wrist and forearm stretches",
          "Deep breathing exercises (5 minutes)"
        ],
        coach_notes: "Focus on comfort and muscle memory today. There's no rush - proper grip and position are everything. If your hand feels tired, take breaks and shake it out.",
        estimated_minutes: 35,
        difficulty_level: 1
      },

      // DAY 2: Serve Foundations
      {
        day: 2,
        title: "Serve Fundamentals",
        focus: "Underhand serve technique and consistency",
        description: "Master the basic underhand serve - the shot that starts every rally in pickleball. Focus on technique over power.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=nPx9cXnAg9A",
        videoTitle: "How to Serve in Pickleball - Basic Technique",
        warmup: {
          title: "Serve Prep Warm-up",
          exercises: [
            "5 minutes light cardio (jogging, high knees)",
            "Shoulder rotations and arm swings",
            "Torso twists (15 each side)",
            "Wrist flexibility exercises",
            "Practice swings without ball (20 reps)"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Serving Motion Practice (No Ball)",
            description: "Practice the serve motion without a ball to develop smooth, consistent mechanics.",
            duration_minutes: 5,
            reps_or_sets: "30 shadow serves",
            tips: [
              "Drop hand below waist at contact point",
              "Follow through toward target",
              "Keep motion smooth and controlled"
            ]
          },
          {
            name: "Short Serve Practice",
            description: "Serve from midcourt to baseline, focusing on technique and consistency. Use the shorter distance to build confidence.",
            duration_minutes: 10,
            reps_or_sets: "3 sets of 10 serves",
            tips: [
              "Contact ball below waist level",
              "Aim for deep in the service box",
              "Step forward as you serve for momentum"
            ]
          },
          {
            name: "Full-Court Serve Practice",
            description: "Practice serves from the baseline, aiming for the deep service box on the opposite side.",
            duration_minutes: 15,
            reps_or_sets: "50 total serves, aiming for 40+ successful",
            tips: [
              "Use your legs, not just your arm",
              "Follow through high toward target",
              "Aim 3 feet from the baseline"
            ]
          }
        ],
        practice_goals: [
          "Land 8 out of 10 serves in the service box",
          "Develop a consistent pre-serve routine",
          "Serve with smooth, controlled motion"
        ],
        success_metrics: [
          "80% serve success rate",
          "Consistent contact point below waist",
          "Ball lands deep (within 3 feet of baseline)"
        ],
        cooldown: [
          "Arm stretches focusing on shoulder and elbow",
          "Gentle torso twists",
          "5 minutes of walking"
        ],
        coach_notes: "The serve is all about consistency, not power. A soft, accurate serve beats a hard, inconsistent one every time. Focus on landing it in!",
        estimated_minutes: 40,
        difficulty_level: 2
      },

      // DAY 3: Return of Serve
      {
        day: 3,
        title: "Return of Serve Mastery",
        focus: "Returning serves deep and consistently",
        description: "Learn to return serves with confidence. The return is the second most important shot in pickleball after the serve.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=IxQPFKkKZxg",
        videoTitle: "Pickleball Return of Serve Strategy",
        warmup: {
          title: "Return-Ready Warm-up",
          exercises: [
            "5 minutes dynamic movement (side shuffles, back pedals)",
            "Split-step practice (20 reps)",
            "Reaction drills (quick direction changes)",
            "Shadow swings in ready position",
            "Light stretching"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Stationary Return Practice",
            description: "Partner tosses balls from service line. Focus on returning deep to the baseline with controlled swings.",
            duration_minutes: 10,
            reps_or_sets: "3 sets of 15 returns",
            tips: [
              "Start in ready position",
              "Step forward into the ball",
              "Aim for deep returns (baseline area)"
            ]
          },
          {
            name: "Live Serve Returns",
            description: "Partner serves from baseline, you return. Focus on depth and consistency over power.",
            duration_minutes: 15,
            reps_or_sets: "50 return attempts",
            tips: [
              "Read the serve early",
              "Use the split-step as serve is struck",
              "Return cross-court for safety"
            ]
          },
          {
            name: "Return & Recovery Drill",
            description: "Return the serve, then immediately move to the transition zone. Practice the return plus first movement.",
            duration_minutes: 10,
            reps_or_sets: "25 return & recovery cycles",
            tips: [
              "Return first, then move forward",
              "Don't rush - controlled return is priority",
              "Get to the transition zone (mid-court)"
            ]
          }
        ],
        practice_goals: [
          "Return 7 out of 10 serves into play",
          "Land returns deep (past the service line)",
          "Develop consistent split-step timing"
        ],
        success_metrics: [
          "70% return success rate",
          "Returns land in backcourt area",
          "Smooth transition after return"
        ],
        cooldown: [
          "Leg stretches (hamstrings, quads, calves)",
          "Lower back stretches",
          "Cool-down walk (5 minutes)"
        ],
        coach_notes: "The return of serve is your opportunity to neutralize your opponent's advantage. Deep returns give you time to get to the net!",
        estimated_minutes: 35,
        difficulty_level: 2
      },

      // DAY 4: Dinking Introduction
      {
        day: 4,
        title: "Dinking Fundamentals",
        focus: "Soft touch and kitchen line control",
        description: "Master the dink - the most important shot in pickleball. Develop soft hands and touch at the net.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=eD0gCv5hTVE",
        videoTitle: "How to Dink in Pickleball for Beginners",
        warmup: {
          title: "Touch & Feel Warm-up",
          exercises: [
            "5 minutes light movement",
            "Soft paddle taps (keep ball in air with gentle touches)",
            "Wrist flexibility exercises",
            "Kitchen line footwork drills",
            "Balance exercises (single leg stands)"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Self-Dinking Practice",
            description: "Stand at the kitchen line and dink the ball softly up and down to yourself, developing touch.",
            duration_minutes: 8,
            reps_or_sets: "Try for 50 consecutive gentle taps",
            tips: [
              "Use minimal paddle movement",
              "Keep paddle face slightly open",
              "Focus on soft, controlled contact"
            ]
          },
          {
            name: "Cross-Court Dinking",
            description: "Partner dinking drill. Both players at kitchen line, dink cross-court back and forth.",
            duration_minutes: 15,
            reps_or_sets: "3 sets of 20 dink rallies",
            tips: [
              "Aim for opponent's kitchen (no-volley zone)",
              "Keep the ball low over the net",
              "Stay patient - no need to speed up"
            ]
          },
          {
            name: "Straight-Ahead Dinking",
            description: "Dink straight across the net with partner. Focus on ball placement and consistency.",
            duration_minutes: 12,
            reps_or_sets: "3 sets of 20 dink rallies",
            tips: [
              "Gentle push, not a hit",
              "Contact ball out in front of body",
              "Keep knees bent, stay low"
            ]
          }
        ],
        practice_goals: [
          "Complete 10 consecutive dinks with partner",
          "Land dinks in opponent's kitchen consistently",
          "Develop soft hands and touch"
        ],
        success_metrics: [
          "10+ consecutive dink rally",
          "Ball lands within kitchen zone 80% of the time",
          "No hitting ball into net"
        ],
        cooldown: [
          "Forearm and wrist stretches",
          "Shoulder stretches",
          "Light walking (5 minutes)"
        ],
        coach_notes: "Dinking is about patience and touch, not power. The softer you can hit, the better. This will become your most important skill!",
        estimated_minutes: 40,
        difficulty_level: 3
      },

      // DAY 5: Forehand Groundstrokes
      {
        day: 5,
        title: "Forehand Drive Technique",
        focus: "Consistent forehand groundstrokes from baseline",
        description: "Develop a reliable forehand drive for baseline rallies and approach shots.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=mWJA61LBcPc",
        videoTitle: "Pickleball Forehand Technique",
        warmup: {
          title: "Groundstroke Warm-up",
          exercises: [
            "5 minutes cardio (jogging, dynamic movement)",
            "Torso rotations (20 each direction)",
            "Shadow forehand swings (30 reps)",
            "Shoulder and arm stretches",
            "Footwork ladder drills or quick feet exercises"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Forehand Shadow Swings",
            description: "Practice forehand technique without a ball. Focus on proper form and weight transfer.",
            duration_minutes: 5,
            reps_or_sets: "40 shadow swings with perfect form",
            tips: [
              "Turn shoulders back on preparation",
              "Transfer weight from back to front foot",
              "Follow through high and across body"
            ]
          },
          {
            name: "Fed Ball Forehands",
            description: "Partner feeds balls from net, you hit forehands from baseline. Focus on consistency and form.",
            duration_minutes: 15,
            reps_or_sets: "4 sets of 15 forehands",
            tips: [
              "Prepare paddle early",
              "Contact ball in front of body",
              "Hit with topspin for consistency"
            ]
          },
          {
            name: "Cross-Court Forehand Rally",
            description: "Rally with partner, both hitting cross-court forehands. Focus on keeping rally going.",
            duration_minutes: 15,
            reps_or_sets: "5 rallies of 20+ shots each",
            tips: [
              "Aim for consistency over power",
              "Keep ball deep to baseline",
              "Use proper grip and stance each shot"
            ]
          }
        ],
        practice_goals: [
          "Hit 15 consecutive forehands without error",
          "Maintain proper form throughout practice",
          "Hit with consistent depth to baseline"
        ],
        success_metrics: [
          "80% forehand success rate",
          "Consistent contact point",
          "Smooth, controlled swing path"
        ],
        cooldown: [
          "Arm and shoulder stretches",
          "Light torso twists",
          "5-minute walk"
        ],
        coach_notes: "The forehand is typically your strongest shot. Build confidence here, and you'll have a weapon you can count on in matches!",
        estimated_minutes: 40,
        difficulty_level: 3
      },

      // DAY 6: Backhand Groundstrokes
      {
        day: 6,
        title: "Backhand Drive Development",
        focus: "Building backhand consistency and confidence",
        description: "Develop a solid two-handed or one-handed backhand for baseline play.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=wvP3FsJrGy4",
        videoTitle: "Pickleball Backhand Fundamentals",
        warmup: {
          title: "Backhand Prep Warm-up",
          exercises: [
            "5 minutes light cardio",
            "Backhand shadow swings (30 reps)",
            "Shoulder opener stretches",
            "Core rotation exercises",
            "Quick footwork drills"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Backhand Wall Practice",
            description: "Stand 8 feet from wall, practice backhand strokes. Focus on paddle control and consistent contact.",
            duration_minutes: 8,
            reps_or_sets: "3 sets of 25 wall hits",
            tips: [
              "Use two hands if more comfortable",
              "Keep paddle face square to target",
              "Rotate shoulders, not just arms"
            ]
          },
          {
            name: "Partner-Fed Backhands",
            description: "Partner feeds balls to backhand side from net. Focus on form and consistency.",
            duration_minutes: 15,
            reps_or_sets: "4 sets of 15 backhands",
            tips: [
              "Prepare early, turn sideways",
              "Contact ball slightly in front",
              "Follow through toward target"
            ]
          },
          {
            name: "Backhand Baseline Rally",
            description: "Rally with partner using only backhands. Build consistency and confidence.",
            duration_minutes: 12,
            reps_or_sets: "4 rallies of 15+ shots each",
            tips: [
              "Focus on keeping ball in play",
              "Aim for crosscourt for larger target",
              "Stay balanced, don't overswing"
            ]
          }
        ],
        practice_goals: [
          "Complete 10 consecutive backhands without error",
          "Feel comfortable with backhand grip",
          "Hit backhands to target area consistently"
        ],
        success_metrics: [
          "75% backhand success rate",
          "Consistent form on every swing",
          "Ball lands deep and in court"
        ],
        cooldown: [
          "Shoulder and back stretches",
          "Forearm stretches",
          "Light walking (5 minutes)"
        ],
        coach_notes: "Your backhand doesn't need to be as powerful as your forehand - it just needs to be reliable. Consistency wins matches!",
        estimated_minutes: 40,
        difficulty_level: 4
      },

      // DAY 7: Footwork & Court Movement
      {
        day: 7,
        title: "Footwork Fundamentals",
        focus: "Court positioning and efficient movement",
        description: "Master the footwork patterns that will get you to every ball efficiently.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=ZBqxZHHEqog",
        videoTitle: "Pickleball Footwork Basics",
        warmup: {
          title: "Movement Warm-up",
          exercises: [
            "5 minutes dynamic stretching with movement",
            "Ladder drills or quick feet exercises",
            "Side shuffles (30 seconds x 4)",
            "Back pedaling drills",
            "Split-step practice (25 reps)"
          ],
          duration_minutes: 12
        },
        main_drills: [
          {
            name: "Split-Step Timing Drill",
            description: "Partner feeds random balls. Practice split-step timing as ball is struck, then move to return.",
            duration_minutes: 10,
            reps_or_sets: "4 sets of 10 feeds",
            tips: [
              "Land split-step as partner strikes ball",
              "Stay on balls of feet",
              "Push off explosively to ball"
            ]
          },
          {
            name: "Shadow Court Movement",
            description: "Simulate game situations, moving to all court positions without a ball.",
            duration_minutes: 8,
            reps_or_sets: "5 full court patterns",
            tips: [
              "Stay low and balanced",
              "Use side shuffles, don't cross feet",
              "Return to center after each imaginary shot"
            ]
          },
          {
            name: "Live Ball Movement Drill",
            description: "Partner feeds balls to different court locations. Focus on efficient movement and recovery.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 12 random feeds",
            tips: [
              "Move to ball, don't let it come to you",
              "Recover to ready position after each shot",
              "Use proper footwork patterns"
            ]
          }
        ],
        practice_goals: [
          "Execute split-step with proper timing",
          "Move efficiently to all court areas",
          "Recover to ready position quickly"
        ],
        success_metrics: [
          "Consistent split-step timing",
          "Reach 90% of fed balls",
          "Maintain balance through movements"
        ],
        cooldown: [
          "Leg stretches (quads, hamstrings, calves)",
          "Hip flexor stretches",
          "Light walking (5 minutes)"
        ],
        coach_notes: "Great shots come from great footwork. If you're in position, you'll make better contact and have more control!",
        estimated_minutes: 35,
        difficulty_level: 3
      },

      // DAY 8: Volleys at the Net
      {
        day: 8,
        title: "Volley Technique",
        focus: "Net volleys and quick reflexes",
        description: "Develop quick hands and solid volley technique for net play.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=D_5xDvlxhVo",
        videoTitle: "Pickleball Volley Technique",
        warmup: {
          title: "Volley Prep Warm-up",
          exercises: [
            "5 minutes light cardio",
            "Quick hand drills (paddle taps)",
            "Reaction time exercises",
            "Wrist and forearm stretches",
            "Shadow volley practice (30 reps each side)"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Stationary Volley Practice",
            description: "Stand at kitchen line, partner feeds medium-pace balls. Practice punch volleys with minimal backswing.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 15 volleys (forehand & backhand)",
            tips: [
              "Minimal backswing - punch through ball",
              "Keep paddle up at chest height",
              "Use continental grip"
            ]
          },
          {
            name: "Volley-Volley Exchange",
            description: "Both players at kitchen line, volley back and forth. Focus on control and placement.",
            duration_minutes: 15,
            reps_or_sets: "5 rallies of 20+ volleys each",
            tips: [
              "Keep volleys low and controlled",
              "Stay balanced on balls of feet",
              "Short, compact swings"
            ]
          },
          {
            name: "Reflex Volley Drill",
            description: "Partner feeds balls quickly from close range. Develop quick reflexes and solid contact.",
            duration_minutes: 8,
            reps_or_sets: "3 sets of 20 quick feeds",
            tips: [
              "React quickly, trust your instincts",
              "Keep paddle in front of body",
              "Focus on contact, not swing"
            ]
          }
        ],
        practice_goals: [
          "Execute 15 consecutive volleys",
          "Maintain compact swing throughout",
          "Develop quick reflex responses"
        ],
        success_metrics: [
          "85% volley success rate",
          "Consistent paddle position",
          "Quick reaction time"
        ],
        cooldown: [
          "Forearm and wrist stretches",
          "Shoulder stretches",
          "Light walking (5 minutes)"
        ],
        coach_notes: "Volleys are all about position and timing, not power. Keep your paddle up, stay ready, and let the ball's pace do the work!",
        estimated_minutes: 40,
        difficulty_level: 4
      },

      // DAY 9: Third Shot Drop Introduction
      {
        day: 9,
        title: "Third Shot Drop Basics",
        focus: "Developing the third shot drop technique",
        description: "Learn the game-changing third shot drop - the shot that gets you to the net safely.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=rlfGP-1oPNo",
        videoTitle: "How to Hit the Third Shot Drop",
        warmup: {
          title: "Drop Shot Warm-up",
          exercises: [
            "5 minutes light movement",
            "Soft touch drills (dinking practice)",
            "Shadow third shot drops (25 reps)",
            "Wrist flexibility exercises",
            "Balance and footwork drills"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Drop Shot Without Net",
            description: "From baseline, practice drop shot motion by dropping ball into hula hoop or target 7 feet away.",
            duration_minutes: 10,
            reps_or_sets: "4 sets of 12 drops per side",
            tips: [
              "Use open paddle face",
              "Soft touch, lift the ball",
              "Follow through low to high"
            ]
          },
          {
            name: "Half-Court Third Shot Drops",
            description: "From mid-court, practice drops into opponent's kitchen. Build up to baseline distance.",
            duration_minutes: 15,
            reps_or_sets: "50 drop attempts",
            tips: [
              "Aim for kitchen line",
              "Use legs to lift ball",
              "Contact ball out in front"
            ]
          },
          {
            name: "Live Third Shot Drop Drill",
            description: "Partner serves, you return, partner hits back, you execute third shot drop. Full game scenario.",
            duration_minutes: 10,
            reps_or_sets: "25 full sequences",
            tips: [
              "Take your time, don't rush",
              "Focus on arc and soft landing",
              "Move forward after successful drop"
            ]
          }
        ],
        practice_goals: [
          "Land 5 out of 10 drops in opponent's kitchen",
          "Understand drop shot mechanics",
          "Develop soft touch from baseline"
        ],
        success_metrics: [
          "50% drop success rate (in kitchen)",
          "Ball lands softly (low bounce)",
          "Consistent upward trajectory"
        ],
        cooldown: [
          "Full body stretch routine",
          "Shoulder and wrist stretches",
          "5-minute cool-down walk"
        ],
        coach_notes: "The third shot drop is challenging but game-changing. Don't expect perfection yet - just work on the motion and touch!",
        estimated_minutes: 40,
        difficulty_level: 5
      },

      // DAY 10: Court Positioning & Strategy
      {
        day: 10,
        title: "Court Positioning Basics",
        focus: "Understanding court zones and strategic positioning",
        description: "Learn where to be on the court and why. Good positioning beats speed every time.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=0aXGFEfW9F4",
        videoTitle: "Pickleball Court Positioning Strategy",
        warmup: {
          title: "Strategic Movement Warm-up",
          exercises: [
            "5 minutes dynamic movement",
            "Court zone practice (move to different zones on call)",
            "Partner positioning drills",
            "Communication exercises with partner",
            "Light stretching"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Baseline vs Net Positioning",
            description: "Practice scenarios from both baseline and net positions. Understand when to stay back vs move up.",
            duration_minutes: 12,
            reps_or_sets: "10 scenarios each position",
            tips: [
              "Stay back on deep returns",
              "Move up after successful drops",
              "Get to kitchen line when possible"
            ]
          },
          {
            name: "Partner Positioning Drill",
            description: "Practice moving in sync with partner. When one moves, the other adjusts.",
            duration_minutes: 10,
            reps_or_sets: "15 positioning scenarios",
            tips: [
              "Stay parallel with partner",
              "Cover the middle together",
              "Communicate constantly"
            ]
          },
          {
            name: "Transition Zone Play",
            description: "Practice the transition from baseline to net. Learn to play from the mid-court area safely.",
            duration_minutes: 8,
            reps_or_sets: "20 transition scenarios",
            tips: [
              "Be ready for balls at your feet",
              "Don't rush to the kitchen",
              "Play percentage pickleball"
            ]
          }
        ],
        practice_goals: [
          "Understand the three court zones",
          "Position correctly based on ball location",
          "Move in sync with partner"
        ],
        success_metrics: [
          "Correct positioning 80% of the time",
          "Good partner spacing maintained",
          "Understanding of when to move up/back"
        ],
        cooldown: [
          "Light stretching routine",
          "Mental review of positioning concepts",
          "5-minute walk"
        ],
        coach_notes: "Position beats speed. If you're in the right place at the right time, you don't need to move as much or hit as hard!",
        estimated_minutes: 35,
        difficulty_level: 3
      },

      // DAY 11: Rules & Scoring Mastery
      {
        day: 11,
        title: "Rules and Scoring Deep Dive",
        focus: "Complete understanding of pickleball rules",
        description: "Master all pickleball rules, scoring, faults, and game situations. Knowledge gives confidence!",
        duration_minutes: 30,
        videoUrl: "https://www.youtube.com/watch?v=fXkV2DtGaEw",
        videoTitle: "Official Pickleball Rules Explained",
        warmup: {
          title: "Skills Review Warm-up",
          exercises: [
            "5 minutes light movement",
            "Review all basic shots (serves, returns, dinks)",
            "Shadow practice different scenarios",
            "Mental preparation exercises"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Scoring Practice",
            description: "Play practice games focusing on proper scoring and calling. Practice calling score before every serve.",
            duration_minutes: 15,
            reps_or_sets: "3 games to 11",
            tips: [
              "Server calls score: Server score, Receiver score, Server number",
              "Only serving team can score points",
              "Switch sides when serving from even court (0, 2, 4, etc.)"
            ]
          },
          {
            name: "Fault Identification Drill",
            description: "Partner creates various scenarios. Identify faults and violations correctly.",
            duration_minutes: 10,
            reps_or_sets: "20 scenario reviews",
            tips: [
              "Know the kitchen rules (no volleys in NVZ)",
              "Serve must be underhand and diagonal",
              "Two-bounce rule on serves"
            ]
          }
        ],
        practice_goals: [
          "Call score correctly every time",
          "Identify common faults immediately",
          "Understand all basic rules and violations"
        ],
        success_metrics: [
          "100% correct score calling",
          "Identify 90% of faults correctly",
          "Explain rules confidently"
        ],
        cooldown: [
          "Light stretching",
          "Mental review of rules",
          "Q&A with partner about any unclear rules"
        ],
        coach_notes: "Knowing the rules eliminates uncertainty and gives you confidence. Play practice games today and enforce all rules strictly!",
        estimated_minutes: 30,
        difficulty_level: 2
      },

      // DAY 12: Putting It All Together
      {
        day: 12,
        title: "Integration Day - Full Gameplay",
        focus: "Combining all skills in actual games",
        description: "Put everything together in full game situations. Focus on executing what you've learned.",
        duration_minutes: 45,
        videoUrl: "https://www.youtube.com/watch?v=E-l1xHZRnMo",
        videoTitle: "Beginner Pickleball Strategy Guide",
        warmup: {
          title: "Complete Warm-up Routine",
          exercises: [
            "5 minutes cardio",
            "Dynamic stretching full body",
            "Practice all shot types (5 minutes)",
            "Mental preparation and focus exercises",
            "Partner warm-up rally"
          ],
          duration_minutes: 12
        },
        main_drills: [
          {
            name: "Full Game Play",
            description: "Play full games to 11, focusing on using proper technique and strategy learned over 11 days.",
            duration_minutes: 30,
            reps_or_sets: "3 full games to 11 points",
            tips: [
              "Use your serve and return consistently",
              "Get to the net when opportunity arises",
              "Communicate with partner",
              "Focus on consistency over power"
            ]
          }
        ],
        practice_goals: [
          "Execute all fundamental shots in game",
          "Apply positioning and strategy learned",
          "Maintain composure and focus throughout"
        ],
        success_metrics: [
          "Use proper technique 75% of the time",
          "Make good strategic decisions",
          "Have fun and stay positive"
        ],
        cooldown: [
          "Complete stretching routine",
          "Self-assessment of strengths and areas to improve",
          "Hydration and recovery"
        ],
        coach_notes: "Today is about bringing it all together. Don't worry about winning - focus on executing proper technique and having fun!",
        estimated_minutes: 45,
        difficulty_level: 4
      },

      // DAY 13: Advanced Dinking & Patience
      {
        day: 13,
        title: "Dinking Mastery & Patience",
        focus: "Advanced dinking patterns and developing patience",
        description: "Take your dinking to the next level with advanced patterns and learning to wait for the right opportunity.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=tKKk9p7n_tw",
        videoTitle: "Advanced Dinking Strategy",
        warmup: {
          title: "Dinking Warm-up",
          exercises: [
            "5 minutes light movement",
            "Soft hands drills",
            "Paddle control exercises",
            "Kitchen line positioning practice",
            "Basic dinking to warm up (5 minutes)"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Cross-Court Dink Rally Challenge",
            description: "See how many consecutive cross-court dinks you and partner can complete. Build to 50+.",
            duration_minutes: 12,
            reps_or_sets: "5 attempts, record best streak",
            tips: [
              "Stay patient, don't speed up",
              "Aim for consistency",
              "Keep ball low over net"
            ]
          },
          {
            name: "Dink Direction Changes",
            description: "Practice changing dink direction: cross-court, then straight, then cross-court. Develop control.",
            duration_minutes: 15,
            reps_or_sets: "4 sets of 10 direction changes",
            tips: [
              "Signal direction changes to partner",
              "Maintain soft touch during changes",
              "Stay low and balanced"
            ]
          },
          {
            name: "Attackable Ball Recognition",
            description: "Dink rally, but look for high balls to attack. Learn to recognize opportunities.",
            duration_minutes: 8,
            reps_or_sets: "15 dink rallies with attack opportunities",
            tips: [
              "Wait for ball above net height",
              "Attack decisively when opportunity comes",
              "Return to dinking if attack not available"
            ]
          }
        ],
        practice_goals: [
          "Complete 30+ consecutive dink rally",
          "Change directions smoothly",
          "Recognize attackable balls"
        ],
        success_metrics: [
          "30+ dink rally achieved",
          "Smooth direction changes",
          "Attack only good opportunities"
        ],
        cooldown: [
          "Forearm and wrist stretches",
          "Shoulder stretches",
          "Mental review of patience concepts"
        ],
        coach_notes: "Patience in dinking wins matches. The player who waits for the right opportunity and doesn't force shots will win more rallies!",
        estimated_minutes: 40,
        difficulty_level: 4
      },

      // DAY 14: Final Assessment & Celebration
      {
        day: 14,
        title: "Final Assessment & Mastery Showcase",
        focus: "Demonstrating all learned skills and celebrating progress",
        description: "Final day! Show off everything you've learned and celebrate your amazing progress over 14 days.",
        duration_minutes: 50,
        videoUrl: "https://www.youtube.com/watch?v=gxRFPfQ3K8U",
        videoTitle: "Your Pickleball Journey Continues",
        warmup: {
          title: "Championship Warm-up",
          exercises: [
            "10 minutes complete warm-up",
            "Practice all shot types",
            "Mental preparation and visualization",
            "Partner rally to get loose",
            "Positive affirmations and goal setting"
          ],
          duration_minutes: 12
        },
        main_drills: [
          {
            name: "Skills Assessment Games",
            description: "Play competitive games focusing on executing all fundamentals learned. Track improvement.",
            duration_minutes: 35,
            reps_or_sets: "4 games to 11 points",
            tips: [
              "Use proper serve technique",
              "Execute third shot drops",
              "Maintain good court positioning",
              "Dink with patience",
              "Communicate with partner"
            ]
          }
        ],
        practice_goals: [
          "Demonstrate mastery of all fundamentals",
          "Play confidently and enjoyably",
          "Set goals for continued improvement"
        ],
        success_metrics: [
          "Execute all shots learned",
          "Show strategic understanding",
          "Play with confidence and joy",
          "Recognize your massive improvement"
        ],
        cooldown: [
          "Complete stretching routine",
          "Celebrate your progress!",
          "Set goals for next level training",
          "Self-assessment and reflection"
        ],
        coach_notes: "Congratulations on completing the Fundamentals program! You've built an incredible foundation. You're now ready to play recreational pickleball with confidence. Keep practicing and never stop improving!",
        estimated_minutes: 50,
        difficulty_level: 4
      }
    ]
  }
}
