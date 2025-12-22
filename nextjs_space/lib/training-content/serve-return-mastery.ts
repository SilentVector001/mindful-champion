/**
 * SERVE & RETURN MASTERY - Complete 7-Day Training Program
 * Intensive focus on the two most important shots in pickleball
 */

export const serveReturnMasteryProgram = {
  programId: 'beginner-serve-return',
  name: 'Serve & Return Mastery',
  tagline: 'Dominate the most important shots in pickleball',
  description: 'This intensive 7-day program focuses exclusively on mastering serves and returns.',
  durationDays: 7,
  skillLevel: 'BEGINNER',
  estimatedTimePerDay: '25-35 minutes',
  keyOutcomes: [
    'Develop 3 different serve types: deep, short, and spin serves',
    'Place serves strategically to opponent weaknesses',
    'Return serves consistently deep with 75%+ success',
    'Add topspin and backspin to serves and returns',
    'Build mental toughness and pre-serve routines'
  ],
  dailyStructure: {
    days: [
      // DAY 1: Deep Serve Fundamentals
      {
        day: 1,
        title: "Deep Serve Mastery",
        focus: "Developing a consistent deep serve to the baseline",
        description: "Master the deep serve - your primary weapon. Learn to consistently place serves deep in the service box, forcing opponents back.",
        duration_minutes: 30,
        videoUrl: "https://www.youtube.com/watch?v=nPx9cXnAg9A",
        videoTitle: "Deep Serve Technique in Pickleball",
        warmup: {
          title: "Serve Prep Warm-up",
          exercises: [
            "5 minutes light cardio (jogging, jumping jacks)",
            "Shoulder rotations and arm swings (15 each direction)",
            "Wrist flexibility exercises",
            "Practice serve motion without ball (20 shadow serves)",
            "Torso twists (20 each side)"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Target Practice - Deep Zones",
            description: "Place targets (cones, towels) in the deep service box within 3 feet of baseline. Hit 50 serves aiming for targets.",
            duration_minutes: 15,
            reps_or_sets: "5 sets of 10 serves, alternating sides",
            tips: [
              "Use your legs to generate power",
              "Follow through high toward target",
              "Contact ball at lowest legal point",
              "Aim 2-3 feet from baseline for safety margin"
            ]
          },
          {
            name: "Depth Consistency Drill",
            description: "Serve continuously, counting how many consecutive serves land past the service line. Goal: 10+ in a row.",
            duration_minutes: 10,
            reps_or_sets: "Multiple attempts until 10 consecutive achieved",
            tips: [
              "Focus on consistency over power",
              "Develop a pre-serve routine",
              "Breathe and reset between serves"
            ]
          }
        ],
        practice_goals: [
          "Land 40 out of 50 serves in the service box",
          "Get 30+ serves to land deep (within 5 feet of baseline)",
          "Develop a consistent pre-serve routine"
        ],
        success_metrics: [
          "80% serve success rate",
          "60% deep serve placement",
          "Consistent serve motion on all attempts"
        ],
        cooldown: [
          "Shoulder and arm stretches",
          "Wrist stretches",
          "Deep breathing (5 minutes)"
        ],
        coach_notes: "The deep serve is your bread and butter. A deep serve keeps opponents back and gives you control. Don't worry about power yet - focus on depth and consistency!",
        estimated_minutes: 30,
        difficulty_level: 2
      },

      // DAY 2: Return of Serve Deep
      {
        day: 2,
        title: "Deep Return Fundamentals",
        focus: "Returning serves deep to opponent's baseline",
        description: "Learn to neutralize your opponent's serve by consistently returning deep. A deep return keeps you in the point and gives you time to transition forward.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=IxQPFKkKZxg",
        videoTitle: "Deep Return Strategy",
        warmup: {
          title: "Return Prep Warm-up",
          exercises: [
            "5 minutes dynamic movement (shuffles, back pedals)",
            "Split-step practice (25 reps)",
            "Shadow return swings (30 reps each side)",
            "Reaction time drills",
            "Light stretching"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Fed Ball Deep Returns",
            description: "Partner feeds serves from baseline. Return every ball deep, aiming within 5 feet of opponent's baseline.",
            duration_minutes: 15,
            reps_or_sets: "5 sets of 12 returns per side",
            tips: [
              "Start in ready position with split-step",
              "Step forward into the return",
              "Aim cross-court for safety",
              "Follow through high for depth"
            ]
          },
          {
            name: "Live Serve Return Practice",
            description: "Partner serves full speed. Focus on depth and placement over power.",
            duration_minutes: 12,
            reps_or_sets: "60 live return attempts",
            tips: [
              "Read serve early",
              "Use compact swing",
              "Keep returns deep",
              "Recover to ready after each return"
            ]
          }
        ],
        practice_goals: [
          "Return 70% of serves successfully",
          "Land 50% of returns deep (within 5 feet of baseline)",
          "Maintain consistent split-step timing"
        ],
        success_metrics: [
          "70% return success rate",
          "50% deep return placement",
          "Proper split-step on every serve"
        ],
        cooldown: [
          "Leg stretches (quads, hamstrings)",
          "Shoulder stretches",
          "5-minute walk"
        ],
        coach_notes: "Deep returns neutralize the server's advantage. Focus on consistency first, depth second, placement third. Power comes last!",
        estimated_minutes: 35,
        difficulty_level: 2
      },

      // DAY 3: Short Serve Development
      {
        day: 3,
        title: "Short Serve Mastery",
        focus: "Developing the short serve to catch opponents off guard",
        description: "Add the short serve to your arsenal. This serve lands just past the kitchen line, forcing opponents to move forward and creating awkward returns.",
        duration_minutes: 30,
        videoUrl: "https://www.youtube.com/watch?v=kl5r9sJHnU0",
        videoTitle: "Short Serve Technique",
        warmup: {
          title: "Touch & Control Warm-up",
          exercises: [
            "5 minutes light movement",
            "Soft touch drills (dinking practice)",
            "Short serve shadow practice (25 reps)",
            "Wrist flexibility",
            "Balance exercises"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Short Serve Target Practice",
            description: "Place targets just past the kitchen line in the service box. Practice soft, controlled serves that land short.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 12 serves per side",
            tips: [
              "Use less backswing than deep serve",
              "Contact ball with gentle push",
              "Aim for kitchen line (6-8 feet from net)",
              "Follow through short and controlled"
            ]
          },
          {
            name: "Alternating Depth Drill",
            description: "Alternate between deep and short serves. Develop the ability to vary serve depth.",
            duration_minutes: 10,
            reps_or_sets: "5 sets: Deep, Short, Deep, Short (8 serves per set)",
            tips: [
              "Change serve motion for different depths",
              "Keep opponent guessing",
              "Maintain same pre-serve routine for both"
            ]
          }
        ],
        practice_goals: [
          "Land 30 out of 40 short serves in target zone",
          "Develop soft touch control",
          "Smoothly alternate between deep and short serves"
        ],
        success_metrics: [
          "75% short serve success rate",
          "Serves land within 2 feet of kitchen line",
          "Consistent ability to change depths"
        ],
        cooldown: [
          "Shoulder and arm stretches",
          "Wrist stretches",
          "Mental visualization of serve variety"
        ],
        coach_notes: "The short serve is a powerful weapon when mixed with deep serves. It forces opponents to adjust and creates uncomfortable returns!",
        estimated_minutes: 30,
        difficulty_level: 3
      },

      // DAY 4: Return Placement & Direction
      {
        day: 4,
        title: "Return Placement Mastery",
        focus: "Controlling return direction and targeting weaknesses",
        description: "Take your return game to the next level by learning to place returns to specific targets and exploit opponent weaknesses.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=7L1q_qQ9XlI",
        videoTitle: "Return Placement Strategy",
        warmup: {
          title: "Directional Control Warm-up",
          exercises: [
            "5 minutes dynamic movement",
            "Cross-court and down-the-line shadow swings",
            "Target visualization exercises",
            "Split-step and reaction drills",
            "Light stretching"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Target Zone Returns",
            description: "Set up targets in different service box zones. Partner serves, you return to specific targets on command.",
            duration_minutes: 15,
            reps_or_sets: "5 sets of 10 returns to various targets",
            tips: [
              "Adjust paddle angle to control direction",
              "Use body rotation for cross-court returns",
              "Keep returns low and controlled",
              "Target opponent's backhand side"
            ]
          },
          {
            name: "Cross-Court vs Down-the-Line",
            description: "Practice returning to both cross-court and down-the-line positions. Develop versatility.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 12 returns, alternating directions",
            tips: [
              "Cross-court is safer (larger target)",
              "Down-the-line creates pressure",
              "Mix up patterns",
              "Keep opponent guessing"
            ]
          }
        ],
        practice_goals: [
          "Hit 8 out of 10 returns to intended target area",
          "Control return direction consistently",
          "Develop ability to target opponent weaknesses"
        ],
        success_metrics: [
          "80% accuracy to target zones",
          "Consistent direction control",
          "Strategic return placement"
        ],
        cooldown: [
          "Full body stretching",
          "Shoulder and arm focus",
          "5-minute walk"
        ],
        coach_notes: "Return placement is about strategy, not just getting the ball back. Target the backhand, go deep cross-court, and keep opponents off balance!",
        estimated_minutes: 35,
        difficulty_level: 3
      },

      // DAY 5: Spin Serves Introduction
      {
        day: 5,
        title: "Adding Spin to Serves",
        focus: "Developing topspin and sidespin serves",
        description: "Level up your serve game by adding spin. Topspin drops the ball faster, while sidespin creates difficult bounces.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=a5AYb7xQw-o",
        videoTitle: "How to Add Spin to Your Serve",
        warmup: {
          title: "Spin Prep Warm-up",
          exercises: [
            "5 minutes light cardio",
            "Wrist rotation exercises (focus on flexibility)",
            "Spin serve shadow practice (30 reps)",
            "Arm circles and stretches",
            "Light tossing practice with spin"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Topspin Serve Development",
            description: "Practice brushing up on the ball at contact to create topspin. Start slow, focus on spin over power.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 12 topspin serves",
            tips: [
              "Brush up the back of the ball",
              "Follow through high and forward",
              "Ball should drop faster than flat serve",
              "Start with moderate pace"
            ]
          },
          {
            name: "Sidespin Serve Practice",
            description: "Add sidespin by brushing across the ball at contact. Creates tricky bounces that curve.",
            duration_minutes: 12,
            reps_or_sets: "4 sets of 12 sidespin serves",
            tips: [
              "Brush across ball from outside to inside",
              "Paddle angle slightly closed",
              "Ball should curve after bounce",
              "Experiment with different amounts of spin"
            ]
          }
        ],
        practice_goals: [
          "Generate visible spin on 50% of serves",
          "Understand spin mechanics and effects",
          "Land 60% of spin serves in service box"
        ],
        success_metrics: [
          "Visible spin on serves",
          "60% spin serve success rate",
          "Different ball bounce patterns"
        ],
        cooldown: [
          "Wrist and forearm stretches",
          "Shoulder stretches",
          "Light arm swings"
        ],
        coach_notes: "Spin takes time to develop. Don't sacrifice consistency for spin yet. Start with small amounts of spin and gradually increase as you get comfortable!",
        estimated_minutes: 35,
        difficulty_level: 4
      },

      // DAY 6: Return Against Spin
      {
        day: 6,
        title: "Returning Spin Serves",
        focus: "Reading and countering spin serves effectively",
        description: "Learn to read spin, adjust your return, and neutralize opponents' spin serves with confidence.",
        duration_minutes: 35,
        videoUrl: "https://www.youtube.com/watch?v=Q8xPHmJ0_nA",
        videoTitle: "How to Return Spin Serves",
        warmup: {
          title: "Spin Reading Warm-up",
          exercises: [
            "5 minutes dynamic movement",
            "Visual tracking drills",
            "Paddle angle adjustment practice",
            "Split-step and reaction drills",
            "Balance and stability exercises"
          ],
          duration_minutes: 10
        },
        main_drills: [
          {
            name: "Spin Recognition Drill",
            description: "Partner serves with various spins. Identify the spin type (topspin, backspin, sidespin) before hitting return.",
            duration_minutes: 10,
            reps_or_sets: "30 serves with spin identification",
            tips: [
              "Watch paddle contact on serve",
              "Notice ball rotation in flight",
              "Anticipate bounce direction",
              "Call out spin type before returning"
            ]
          },
          {
            name: "Spin Neutralization Returns",
            description: "Return various spin serves focusing on neutralizing spin with proper paddle angle and contact point.",
            duration_minutes: 15,
            reps_or_sets: "5 sets of 10 returns against spin",
            tips: [
              "Against topspin: closed paddle face, firm contact",
              "Against backspin: open paddle face, lift the ball",
              "Against sidespin: adjust aim to compensate",
              "Stay balanced and controlled"
            ]
          }
        ],
        practice_goals: [
          "Identify spin type 80% of the time",
          "Return 70% of spin serves successfully",
          "Use proper paddle adjustments for different spins"
        ],
        success_metrics: [
          "80% spin recognition accuracy",
          "70% return success against spin",
          "Proper paddle angle adjustments"
        ],
        cooldown: [
          "Arm and shoulder stretches",
          "Wrist flexibility work",
          "Mental review of spin patterns"
        ],
        coach_notes: "Reading spin comes with practice. Watch the server's paddle, track the ball rotation, and adjust. You'll get better at this every time you play!",
        estimated_minutes: 35,
        difficulty_level: 4
      },

      // DAY 7: Game Situations & Mental Game
      {
        day: 7,
        title: "Match Play & Mental Mastery",
        focus: "Applying all serve and return skills in game situations",
        description: "Final day! Put everything together in game situations. Develop mental routines and pressure management for serves and returns.",
        duration_minutes: 40,
        videoUrl: "https://www.youtube.com/watch?v=BH2x0v_cVX0",
        videoTitle: "Serve and Return Mental Game",
        warmup: {
          title: "Championship Warm-up",
          exercises: [
            "8 minutes complete warm-up routine",
            "Practice all serve types (deep, short, spin)",
            "Practice various returns",
            "Mental preparation and visualization",
            "Pressure situation simulation"
          ],
          duration_minutes: 12
        },
        main_drills: [
          {
            name: "Serve & Return Games",
            description: "Play games to 11 focusing specifically on executing quality serves and returns. Track success rates.",
            duration_minutes: 25,
            reps_or_sets: "3 full games to 11 points",
            tips: [
              "Use pre-serve routine every time",
              "Mix serve depths and spins",
              "Return with purpose and placement",
              "Stay mentally focused on each point",
              "Track your serve/return success percentages"
            ]
          }
        ],
        practice_goals: [
          "Maintain 75%+ serve success in games",
          "Return 70%+ of serves successfully",
          "Use serve variety strategically",
          "Stay mentally composed under pressure"
        ],
        success_metrics: [
          "75% serve accuracy in competition",
          "70% return success in competition",
          "Strategic use of different serves",
          "Mental toughness and composure"
        ],
        cooldown: [
          "Complete stretching routine",
          "Self-assessment and goal setting",
          "Celebrate your progress!",
          "Plan for continued improvement"
        ],
        coach_notes: "Congratulations on completing Serve & Return Mastery! You've developed two of the most important shots in pickleball. These skills will serve you well in every match you play. Keep practicing and refining!",
        estimated_minutes: 40,
        difficulty_level: 4
      }
    ]
  }
}
