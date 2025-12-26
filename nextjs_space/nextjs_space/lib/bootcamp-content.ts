// 2-Week Beginner Bootcamp - Complete Day-by-Day Structure

export interface BootcampDay {
  day: number
  title: string
  subtitle: string
  coachMessage: string
  objectives: string[]
  warmup: {
    duration: string
    instructions: string[]
  }
  drills: {
    title: string
    videoId: string // YouTube video ID
    duration: string
    instructions: string[]
    proTip: string
  }[]
  practiceChecklist: {
    task: string
    reps?: number
  }[]
  cooldown: {
    reflection: string[]
    keyTakeaway: string
  }
  tomorrowPreview: string
}

export const beginnerBootcampDays: BootcampDay[] = [
  // WEEK 1
  {
    day: 1,
    title: "Foundation Day",
    subtitle: "Master the Serve",
    coachMessage: "Welcome to Day 1, Champion! 🎉 Today's all about building the foundation of your pickleball game - the SERVE. Every rally starts here, and a confident serve sets the tone for everything that follows. Remember: progress over perfection. Let's make today count!",
    objectives: [
      "Master the proper serving grip and stance",
      "Learn the 3 critical contact points",
      "Serve 50 balls with focus on form over power",
      "Build confidence in your serving motion"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "20 arm circles (10 forward, 10 backward)",
        "10 shoulder rolls",
        "15 practice swings without the ball - focus on smooth motion",
        "Take 5 deep breaths and visualize a perfect serve"
      ]
    },
    drills: [
      {
        title: "Serve Fundamentals",
        videoId: "CJEISQiZF7s", // Real pickleball serve tutorial
        duration: "10 minutes",
        instructions: [
          "Watch the entire video once without picking up your paddle",
          "Focus on the grip - continental grip is key",
          "Notice the stance - feet shoulder-width, front foot pointing to target",
          "Watch the contact point - low to high motion",
          "Now watch again and practice shadow serves along with the video"
        ],
        proTip: "Think 'low to high' on your serve motion - this creates natural topspin and keeps the ball in!"
      },
      {
        title: "Serve Practice Drill",
        videoId: "VPPd-6xIu7k", // Serve drills video
        duration: "15 minutes",
        instructions: [
          "Set up a target (cone, water bottle, or towel) in the diagonal service box",
          "Serve 25 balls to the diagonal court - focus on form, not power",
          "Serve 25 balls to the straight-ahead court",
          "Count how many land in - don't worry about the number, just track it"
        ],
        proTip: "Aim for depth - a deep serve pushes your opponent back and gives you an advantage!"
      }
    ],
    practiceChecklist: [
      { task: "Complete both training videos" },
      { task: "Serve 50 balls total", reps: 50 },
      { task: "Track your success rate (aim for 30+ in the box)" },
      { task: "Record yourself serving (optional but highly recommended!)" }
    ],
    cooldown: {
      reflection: [
        "What felt natural in your serve motion?",
        "What's one thing you want to improve tomorrow?",
        "Did you notice any difference between the first 10 serves and the last 10?"
      ],
      keyTakeaway: "The serve is about consistency and confidence. Master the basics first, speed comes later."
    },
    tomorrowPreview: "Day 2 is all about SERVE PLACEMENT - we'll learn to serve with purpose and strategy. Get ready to turn your serve into a weapon! 🎯"
  },
  {
    day: 2,
    title: "Strategic Serving",
    subtitle: "Serve with Purpose",
    coachMessage: "Welcome back, Champion! Yesterday you built the foundation - today we're adding strategy. A well-placed serve can win you points before the rally even starts. Let's turn your serve into a tactical advantage! 🎯",
    objectives: [
      "Understand the 4 key serving zones",
      "Practice targeting specific areas",
      "Learn when to serve deep vs. wide vs. to the body",
      "Develop serving consistency under pressure"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Review yesterday's grip and stance",
        "10 shadow serves with perfect form",
        "Practice your contact point 10 times with ball on paddle",
        "Visualize hitting each target zone"
      ]
    },
    drills: [
      {
        title: "Target Zone Training",
        videoId: "mCrN2-dHNro", // Serving strategy video
        duration: "12 minutes",
        instructions: [
          "Learn the 4 key zones: deep corners, wide angles, body serves, and short serves",
          "Understand which zones work best against different opponents",
          "Note the strategic thinking behind each placement"
        ],
        proTip: "Deep to the corners is your safest serve - wide to the sidelines creates angles!"
      },
      {
        title: "Placement Drill Practice",
        videoId: "k_RIr8TWKS8", // Target practice drill
        duration: "20 minutes",
        instructions: [
          "Place 4 targets in your service boxes (corners, use cones, towels, or chalk)",
          "Serve 10 balls to each target zone",
          "Track your accuracy - which zone is easiest? Hardest?",
          "Finish with 10 serves alternating targets (this simulates game conditions)"
        ],
        proTip: "In matches, serve 70% to your opponent's backhand - it's usually their weaker side!"
      }
    ],
    practiceChecklist: [
      { task: "Watch both strategy videos", reps: 2 },
      { task: "Serve to all 4 target zones", reps: 40 },
      { task: "Track accuracy by zone" },
      { task: "Practice 10 serves alternating targets" }
    ],
    cooldown: {
      reflection: [
        "Which target zone felt most comfortable?",
        "Which zone needs more work?",
        "Can you visualize using these placements in a real game?"
      ],
      keyTakeaway: "Strategic serving is about controlling the point from the start. Place with purpose!"
    },
    tomorrowPreview: "Day 3: RETURN OF SERVE - Now that you can serve, let's master the return and start the rally strong! ⚡"
  },
  {
    day: 3,
    title: "The Return",
    subtitle: "Start Every Rally Strong",
    coachMessage: "Day 3 - let's talk about one of the most underrated shots in pickleball: the RETURN. A great return neutralizes your opponent's serve and sets you up for success. Today, we're turning you into a returning machine! ⚡",
    objectives: [
      "Master the ready position for returns",
      "Learn deep crosscourt return technique",
      "Practice returning different serve types",
      "Build reflexes and anticipation skills"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Bounce on your toes for 30 seconds - get those reflexes ready",
        "Practice your split step 10 times",
        "Shadow swing 10 forehand and 10 backhand returns",
        "Quick feet drill: lateral shuffle 20 seconds"
      ]
    },
    drills: [
      {
        title: "Return Fundamentals",
        videoId: "s7ZqAOAhOo8", // Return of serve technique
        duration: "10 minutes",
        instructions: [
          "Watch and absorb the ready position - weight on balls of feet",
          "Notice the split step timing - as opponent contacts the ball",
          "Study the contact point - out in front of your body",
          "Observe the follow-through - finish high for depth"
        ],
        proTip: "Return deep and crosscourt 80% of the time - this is the highest percentage shot!"
      },
      {
        title: "Return Drills",
        videoId: "JIwYqRlN27o", // Return drills
        duration: "20 minutes",
        instructions: [
          "Have a partner serve to you (or use a ball machine if available)",
          "Return 20 balls focusing ONLY on depth - aim for the baseline",
          "Return 20 balls focusing on crosscourt angle",
          "Return 10 balls mixing it up - keep your partner guessing!"
        ],
        proTip: "Your return should land deep 90% of the time - this prevents your opponent from attacking!"
      }
    ],
    practiceChecklist: [
      { task: "Complete both return videos" },
      { task: "Practice ready position and split step", reps: 20 },
      { task: "Return 50 balls with focus on depth", reps: 50 },
      { task: "Track how many land past the kitchen line" }
    ],
    cooldown: {
      reflection: [
        "Is your ready position athletic and balanced?",
        "Are you making contact out in front?",
        "How many of your returns landed deep?"
      ],
      keyTakeaway: "A deep return = a successful return. Control the rally from shot #1!"
    },
    tomorrowPreview: "Day 4: THE KITCHEN LINE - Tomorrow we enter the most important area on the court. Get excited! 🔥"
  },
  {
    day: 4,
    title: "Kitchen Line Introduction",
    subtitle: "Own the Most Important Real Estate",
    coachMessage: "Welcome to Day 4, Champion! Today we're stepping into the KITCHEN - the most critical 7 feet of the pickleball court. Mastering this area is what separates beginners from intermediate players. Let's dominate this space! 🔥",
    objectives: [
      "Understand kitchen rules and positioning",
      "Learn proper ready stance at the line",
      "Practice basic volleys at the kitchen",
      "Develop patience and touch near the net"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Walk to the kitchen line and back 5 times - get familiar with the distance",
        "Practice your kitchen line ready position for 1 minute",
        "10 shadow volleys on each side",
        "Bounce ball on paddle 20 times to develop touch"
      ]
    },
    drills: [
      {
        title: "Kitchen Rules & Positioning",
        videoId: "NrG4fZS_CYM", // Kitchen rules and strategy
        duration: "8 minutes",
        instructions: [
          "Learn the kitchen rules - no volleying in the zone!",
          "Understand proper positioning - toes at the line, not behind it",
          "Study defensive vs. offensive kitchen stance",
          "Watch footwork patterns for staying balanced"
        ],
        proTip: "The player who controls the kitchen line controls the game - always work to get there!"
      },
      {
        title: "Basic Kitchen Volleys",
        videoId: "jbM-R3j3-Io", // Kitchen volley drills
        duration: "15 minutes",
        instructions: [
          "Start 2 feet behind the kitchen line",
          "Have partner feed you 10 easy balls to forehand volley",
          "Repeat with 10 backhand volleys",
          "Move up to the line and repeat - focus on SHORT backswing",
          "Practice 20 random volleys - forehand and backhand mixed"
        ],
        proTip: "At the kitchen, think 'block and redirect' not 'swing and hit' - keep it simple!"
      }
    ],
    practiceChecklist: [
      { task: "Watch kitchen fundamentals video" },
      { task: "Practice 40 volleys from the kitchen line", reps: 40 },
      { task: "Work on shortening your backswing" },
      { task: "Stay balanced - check your stance after every shot" }
    ],
    cooldown: {
      reflection: [
        "Did you feel comfortable at the kitchen line?",
        "Which volley felt more natural - forehand or backhand?",
        "Are you keeping your backswing short and compact?"
      ],
      keyTakeaway: "Patience and positioning win at the kitchen. Master this zone, master the game!"
    },
    tomorrowPreview: "Day 5: THE DINK - Tomorrow we learn the most important shot in pickleball. This is where it gets fun! 🎯"
  },
  {
    day: 5,
    title: "The Dink",
    subtitle: "Master the Soft Game",
    coachMessage: "Day 5 - THE DINK! This soft, controlled shot is the heartbeat of pickleball. Today you'll learn why dinking is both an art and a science. Get ready for one of the most satisfying skills you'll ever develop! 🎨",
    objectives: [
      "Understand dink technique and touch",
      "Master the crosscourt dink pattern",
      "Learn when to dink vs. when to attack",
      "Develop consistency and patience in dink rallies"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Paddle taps with a partner - 20 soft taps back and forth",
        "Drop and catch drill - drop ball from paddle height and catch 10 times",
        "Shadow dinking motion - 20 reps with perfect form",
        "Visualization: imagine a 10-dink rally"
      ]
    },
    drills: [
      {
        title: "Dinking Fundamentals",
        videoId: "4TmqUKdHOeo", // Perfect dink technique
        duration: "12 minutes",
        instructions: [
          "Study the dink motion - it's a 'lift' not a 'hit'",
          "Watch the contact point - paddle face slightly open",
          "Notice the follow-through - low to high, compact",
          "Observe weight transfer - step into the shot gently"
        ],
        proTip: "Think 'brush the ball' not 'hit the ball' - less is more with dinking!"
      },
      {
        title: "Crosscourt Dinking Drill",
        videoId: "m0y5WGdKoL0", // Dinking drills
        duration: "20 minutes",
        instructions: [
          "Start with your partner crosscourt from you",
          "Dink 10 balls back and forth - focus on consistency over placement",
          "Aim for the kitchen - ball should bounce IN the kitchen zone",
          "Work up to 20-dink rallies without missing",
          "Add movement - shuffle laterally while dinking"
        ],
        proTip: "Crosscourt is safer than down-the-line - more net clearance and bigger target!"
      }
    ],
    practiceChecklist: [
      { task: "Complete both dinking videos" },
      { task: "Dink 100 balls with a partner", reps: 100 },
      { task: "Achieve at least one 20-dink rally" },
      { task: "Practice soft touch - every dink lands in the kitchen" }
    ],
    cooldown: {
      reflection: [
        "Can you feel the 'lift' motion of the dink?",
        "How many consecutive dinks did you achieve?",
        "Are you being patient and not rushing to attack?"
      ],
      keyTakeaway: "Dinking is about patience and control. The player who dinks better wins more rallies!"
    },
    tomorrowPreview: "Day 6: FOOTWORK FUNDAMENTALS - Great shots start with great feet. Tomorrow we build the foundation! 👟"
  },
  {
    day: 6,
    title: "Footwork Fundamentals",
    subtitle: "Move Like a Champion",
    coachMessage: "Day 6, Champion! Today's all about FOOTWORK - the secret sauce of great pickleball. Good feet = good shots. We're going to make you quick, balanced, and ready for anything that comes your way! 👟⚡",
    objectives: [
      "Master the ready position and split step",
      "Learn lateral movement patterns",
      "Practice forward and backward transitions",
      "Develop court coverage and anticipation"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Jump rope (or imaginary jump rope) - 1 minute",
        "Lateral shuffles side to side - 30 seconds each direction",
        "Forward and backward movement drill - 30 seconds",
        "Split step practice - 20 reps"
      ]
    },
    drills: [
      {
        title: "Footwork Fundamentals",
        videoId: "8kp5BkqvXmY", // Pickleball footwork
        duration: "10 minutes",
        instructions: [
          "Study the ready position - knees bent, weight forward",
          "Watch the split step timing - critical for reaction",
          "Notice the shuffle step - never cross your feet",
          "Observe the recovery step - always return to center"
        ],
        proTip: "Small, quick steps beat big, slow steps every time - stay on your toes!"
      },
      {
        title: "Movement Pattern Drills",
        videoId: "vJyTSBCpCjI", // Agility drills
        duration: "20 minutes",
        instructions: [
          "Set up 4 cones in a square pattern",
          "Drill 1: Lateral shuffles around the square - 2 sets",
          "Drill 2: Forward sprint, backpedal back - 10 reps",
          "Drill 3: X-pattern movement - hit all 4 corners - 5 reps",
          "Drill 4: Random ball feeds - move and hit - 20 balls"
        ],
        proTip: "Never be flat-footed - always be in motion, ready to explode in any direction!"
      }
    ],
    practiceChecklist: [
      { task: "Complete footwork fundamentals video" },
      { task: "Cone drill sets - full agility training", reps: 3 },
      { task: "Split step practice - make it automatic", reps: 50 },
      { task: "Movement + shot combo drill", reps: 20 }
    ],
    cooldown: {
      reflection: [
        "Do you feel lighter and quicker on your feet?",
        "Is your split step becoming automatic?",
        "Are you recovering to center after each shot?"
      ],
      keyTakeaway: "Great footwork is invisible but essential - it makes every shot easier!"
    },
    tomorrowPreview: "Day 7: REST & REVIEW - You've earned it! Tomorrow we consolidate everything you've learned. 💪"
  },
  {
    day: 7,
    title: "Rest & Integration Day",
    subtitle: "Reflect and Recharge",
    coachMessage: "Congratulations on completing Week 1! 🎉 Today is about REST, REVIEW, and REFLECTION. You've absorbed SO much - let's let it sink in. Take it easy today, but stay mentally engaged. Week 2 is going to be amazing!",
    objectives: [
      "Review the fundamentals from Days 1-6",
      "Light practice session (30 mins max)",
      "Mental game preparation for Week 2",
      "Set goals for the next 7 days"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Gentle stretching - full body",
        "5 minutes of light cardio - just to warm up",
        "Mental visualization of your best shots",
        "Deep breathing and mindfulness"
      ]
    },
    drills: [
      {
        title: "Week 1 Highlights & Review",
        videoId: "F5uMI9RJx5w", // Beginner tips compilation
        duration: "10 minutes",
        instructions: [
          "Watch this recap of beginner fundamentals",
          "Mentally review each skill: serve, return, kitchen play, dinking, footwork",
          "Think about what clicked for you and what needs more work",
          "Celebrate your progress - you've come far!"
        ],
        proTip: "Recovery is when your body and brain consolidate new skills - rest is training too!"
      },
      {
        title: "Light Skills Practice (Optional)",
        videoId: "2OGueRbcdlM", // Fun pickleball drills
        duration: "20 minutes",
        instructions: [
          "If you feel like practicing, keep it light and fun",
          "Hit a few serves - just for feel, not for reps",
          "Dink with a partner casually",
          "Play a fun game or try a new drill",
          "OR take the day completely off - that's okay too!"
        ],
        proTip: "Listen to your body - if you're tired, REST. If you're energized, play light!"
      }
    ],
    practiceChecklist: [
      { task: "Review your notes from Days 1-6" },
      { task: "Identify your #1 strength and #1 area to improve" },
      { task: "Watch Week 1 review video" },
      { task: "Set 3 specific goals for Week 2" }
    ],
    cooldown: {
      reflection: [
        "What was your biggest win this week?",
        "What skill surprised you the most?",
        "What are you most excited to learn in Week 2?",
        "How has your confidence grown since Day 1?"
      ],
      keyTakeaway: "Progress isn't always linear - trust the process, embrace the journey, celebrate the small wins!"
    },
    tomorrowPreview: "Day 8: THE THIRD SHOT DROP - Week 2 starts with one of the most important shots in pickleball. Let's level up! 🚀"
  },

  // WEEK 2
  {
    day: 8,
    title: "The Third Shot Drop",
    subtitle: "The Game-Changer Shot",
    coachMessage: "Welcome to Week 2! Today we're learning THE THIRD SHOT DROP - the shot that separates intermediate from beginner players. This is your ticket to winning more rallies and looking like a pro! Let's do this! 🚀",
    objectives: [
      "Understand the purpose of the third shot drop",
      "Master the drop shot technique and touch",
      "Learn when to drop vs. when to drive",
      "Practice transitioning forward after the drop"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Review your serve and return - the foundation of the third shot",
        "Drop and catch drill - 20 reps to develop soft hands",
        "Shadow the drop motion - low to high, brushing action",
        "Visualize the perfect drop shot landing softly in the kitchen"
      ]
    },
    drills: [
      {
        title: "Third Shot Drop Fundamentals",
        videoId: "LXpIuvu5iP4", // Third shot drop technique
        duration: "12 minutes",
        instructions: [
          "Learn WHY the third shot drop is so important - it neutralizes the opponent's advantage",
          "Study the grip and paddle angle - slightly open face",
          "Watch the swing path - low to high, almost like an underhand serve",
          "Notice the follow-through - let the paddle lift naturally"
        ],
        proTip: "The goal is to make the ball bounce in the kitchen - depth comes later, consistency first!"
      },
      {
        title: "Drop Shot Drills",
        videoId: "Hpg3VkLGkqo", // Third shot practice
        duration: "20 minutes",
        instructions: [
          "Start at the baseline with a partner at the kitchen line",
          "Partner feeds you a ball, you hit a drop shot - repeat 20 times",
          "Focus on arc - ball should peak halfway and drop into the kitchen",
          "Practice from both sides - forehand and backhand drops",
          "Add the transition - drop and move forward to the kitchen"
        ],
        proTip: "Think 'arc not pace' - a high, soft arc is better than a fast, flat shot!"
      }
    ],
    practiceChecklist: [
      { task: "Watch both third shot drop videos" },
      { task: "Hit 50 drop shots from the baseline", reps: 50 },
      { task: "Track how many land in the kitchen zone" },
      { task: "Practice drop + transition forward", reps: 20 }
    ],
    cooldown: {
      reflection: [
        "Can you feel the 'lift and drop' motion?",
        "How many of your drops landed in the kitchen?",
        "Are you transitioning forward after each drop?"
      ],
      keyTakeaway: "The third shot drop neutralizes your opponent's advantage - master this, win more rallies!"
    },
    tomorrowPreview: "Day 9: TRANSITION ZONE MASTERY - Tomorrow we conquer the tricky middle area of the court! ⚡"
  },
  {
    day: 9,
    title: "Transition Zone",
    subtitle: "Master the Middle Ground",
    coachMessage: "Day 9! The TRANSITION ZONE (aka 'no man's land') is where many points are won and lost. Today you'll learn how to move through this area safely and effectively. Let's conquer the middle ground! ⚡",
    objectives: [
      "Understand transition zone positioning",
      "Learn defensive shots from mid-court",
      "Master the split-step and reset",
      "Practice moving from baseline to kitchen safely"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Baseline to kitchen sprints - 5 reps",
        "Shadow transition movements - drop, move, reset",
        "Quick reflex drill - bounce ball and react",
        "Mental prep - visualize smooth transitions"
      ]
    },
    drills: [
      {
        title: "Transition Zone Strategy",
        videoId: "xnWkCN9J-ZQ", // Transition game
        duration: "10 minutes",
        instructions: [
          "Learn why the transition zone is vulnerable",
          "Study proper positioning during transition",
          "Watch defensive shot selection - resets and blocks",
          "Understand when to stop moving vs. keep advancing"
        ],
        proTip: "Split-step when your opponent contacts the ball - never move through the zone while they're hitting!"
      },
      {
        title: "Transition Drills",
        videoId: "t3ZCGC8IUCs", // Transition practice
        duration: "20 minutes",
        instructions: [
          "Drill 1: Drop + advance + reset - repeat 15 times",
          "Drill 2: Partner attacks while you're in transition - practice defensive blocks",
          "Drill 3: Live ball - play points starting from baseline, transition to kitchen",
          "Focus on split-stepping and staying balanced"
        ],
        proTip: "When in doubt, RESET the ball - send it high and deep to buy yourself time!"
      }
    ],
    practiceChecklist: [
      { task: "Complete transition zone videos" },
      { task: "Drop and advance drill", reps: 15 },
      { task: "Defensive block practice from mid-court", reps: 20 },
      { task: "Live point practice with focus on transitions" }
    ],
    cooldown: {
      reflection: [
        "Did you split-step during transition?",
        "Were you able to reset balls effectively?",
        "How comfortable did you feel in the mid-court area?"
      ],
      keyTakeaway: "The transition zone is temporary - get through it safely and get to the kitchen!"
    },
    tomorrowPreview: "Day 10: KITCHEN LINE BATTLES - Tomorrow we level up our net game with advanced dinking! 🔥"
  },
  {
    day: 10,
    title: "Advanced Dinking",
    subtitle: "Win the Kitchen Line Battles",
    coachMessage: "Day 10 - Time to elevate your dinking game! Today we're adding VARIETY, SPIN, and STRATEGY to your dinks. This is where the mental game meets technical skill. Let's dominate the kitchen! 🔥",
    objectives: [
      "Learn crosscourt vs. down-the-line dinking",
      "Master changing pace and height on dinks",
      "Develop offensive dinking patterns",
      "Practice patience and point construction"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Paddle taps with spin - 20 with topspin, 20 with slice",
        "Dink left and right - shadow movement while dinking",
        "Quick hands drill - rapid-fire paddle touches",
        "Mental prep - envision a 30-dink rally"
      ]
    },
    drills: [
      {
        title: "Advanced Dinking Strategies",
        videoId: "sYuVvhM3S1M", // Advanced dinking
        duration: "12 minutes",
        instructions: [
          "Learn directional control - crosscourt vs. straight",
          "Study height variation - low dinks vs. higher dinks",
          "Watch offensive dinking - attacking from the kitchen",
          "Understand patterns and setting up the point"
        ],
        proTip: "Crosscourt dinks are safer, down-the-line dinks are aggressive - use both strategically!"
      },
      {
        title: "Dinking Pattern Drills",
        videoId: "BjLVCGMFt1k", // Kitchen battles
        duration: "20 minutes",
        instructions: [
          "Drill 1: Crosscourt dinking rally - 20 dinks minimum",
          "Drill 2: Change direction - crosscourt to straight, repeat 15 times",
          "Drill 3: Height variation - mix low and high dinks for 10 rallies",
          "Drill 4: Live kitchen battle - keep score, first to 11"
        ],
        proTip: "Change direction and height to keep opponents guessing - predictability loses points!"
      }
    ],
    practiceChecklist: [
      { task: "Watch advanced dinking videos" },
      { task: "Crosscourt dinking rally - 50+ dinks", reps: 50 },
      { task: "Direction change drill", reps: 15 },
      { task: "Play competitive dinking games to 11" }
    ],
    cooldown: {
      reflection: [
        "Can you change direction and height effectively?",
        "Are you being patient and waiting for the right ball to attack?",
        "How did your dinking game improve from Day 5?"
      ],
      keyTakeaway: "Advanced dinking is about variety and patience - mix it up, stay patient, strike when ready!"
    },
    tomorrowPreview: "Day 11: VOLLEYS & PUT-AWAYS - Tomorrow we learn to finish points with authority! 💥"
  },
  {
    day: 11,
    title: "Volleys & Put-Aways",
    subtitle: "Finish Points with Authority",
    coachMessage: "Day 11, Champion! Today's about FINISHING - learning when and how to attack and put the ball away. It's time to turn defense into offense and end points on YOUR terms! 💥",
    objectives: [
      "Master aggressive volley technique",
      "Learn to recognize attackable balls",
      "Practice put-away shots from the kitchen",
      "Develop finishing mentality"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Shadow aggressive volleys - 10 forehand, 10 backhand",
        "Quick reaction drill - bounce and volley 20 times",
        "Power practice - swing with intent (no ball yet)",
        "Mental prep - visualize winning the point"
      ]
    },
    drills: [
      {
        title: "Volley Technique & Timing",
        videoId: "GJJTkVR2LvY", // Aggressive volleys
        duration: "10 minutes",
        instructions: [
          "Study the aggressive volley stance - weight forward, ready to pounce",
          "Watch the contact point - out in front, hitting DOWN on the ball",
          "Notice the follow-through - punch through the ball",
          "Learn ball recognition - which balls can you attack?"
        ],
        proTip: "Attack balls that pop up above net height - anything below the net, be patient!"
      },
      {
        title: "Put-Away Practice",
        videoId: "pQVALtwVONo", // Finishing shots
        duration: "20 minutes",
        instructions: [
          "Partner feeds you high balls - practice put-aways",
          "Aim for feet or angled away from opponents",
          "Practice 20 forehand put-aways",
          "Practice 20 backhand put-aways",
          "Live drill - dink rally, first attackable ball finish it!"
        ],
        proTip: "Aim for the opponent's feet or sharp angles - these are hardest to defend!"
      }
    ],
    practiceChecklist: [
      { task: "Complete volley and put-away videos" },
      { task: "Aggressive volley practice", reps: 40 },
      { task: "Put-away shots (forehand & backhand)", reps: 20 },
      { task: "Live drill - dink to attack transition" }
    ],
    cooldown: {
      reflection: [
        "Can you recognize attackable balls?",
        "Are you hitting DOWN on volleys?",
        "Did you feel the difference between patient dinking and aggressive attacking?"
      ],
      keyTakeaway: "Be patient until the right ball comes - then ATTACK with confidence and finish the point!"
    },
    tomorrowPreview: "Day 12: DOUBLES STRATEGY & COMMUNICATION - Tomorrow we learn to play as a team! 🤝"
  },
  {
    day: 12,
    title: "Doubles Strategy",
    subtitle: "Play as a Team",
    coachMessage: "Day 12! Pickleball is predominantly a doubles game, and today you're learning TEAMWORK, POSITIONING, and COMMUNICATION. Great doubles teams aren't just skilled - they're synchronized! 🤝",
    objectives: [
      "Understand doubles positioning and movement",
      "Learn effective communication with your partner",
      "Master side-by-side court coverage",
      "Develop strategic shot selection in doubles"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "With your partner: mirror movement drill - 2 minutes",
        "Communication drill - call out 'mine' and 'yours' 20 times",
        "Side-by-side shuffle - stay connected",
        "Discuss strategy and game plan with partner"
      ]
    },
    drills: [
      {
        title: "Doubles Fundamentals",
        videoId: "YO5KgEzG7UU", // Doubles strategy
        duration: "12 minutes",
        instructions: [
          "Learn the 'move as one unit' principle",
          "Study court positioning - side-by-side formation",
          "Watch communication examples - call the ball early",
          "Understand strategic targeting - hit to the weaker player"
        ],
        proTip: "In doubles, move together - if your partner moves right, you move right. Stay connected!"
      },
      {
        title: "Doubles Drill Practice",
        videoId: "Mq_EfzzfSgQ", // Doubles drills
        duration: "20 minutes",
        instructions: [
          "Drill 1: Movement synchronization - practice moving as a unit",
          "Drill 2: Middle ball communication - who takes it? Practice calling it",
          "Drill 3: Covering the court - one up, one back scenarios",
          "Drill 4: Live doubles points - focus on teamwork over winning"
        ],
        proTip: "The player with the forehand takes middle balls - but ALWAYS communicate first!"
      }
    ],
    practiceChecklist: [
      { task: "Watch doubles strategy videos" },
      { task: "Movement synchronization drill with partner", reps: 10 },
      { task: "Communication drill - call every ball", reps: 50 },
      { task: "Play live doubles points with focus on teamwork" }
    ],
    cooldown: {
      reflection: [
        "Did you and your partner move as one unit?",
        "Was communication clear and early?",
        "How can you improve your partnership?"
      ],
      keyTakeaway: "Great doubles is 50% skill, 50% teamwork - communicate, synchronize, dominate!"
    },
    tomorrowPreview: "Day 13: MENTAL GAME & STRATEGY - Tomorrow we work on the mind - the most powerful tool in your arsenal! 🧠"
  },
  {
    day: 13,
    title: "Mental Game",
    subtitle: "Master Your Mind",
    coachMessage: "Day 13 - Let's talk about the MENTAL GAME. At this level, everyone has decent shots - what separates winners from losers is what happens between the ears. Today we build mental toughness! 🧠💪",
    objectives: [
      "Develop pre-point routines and rituals",
      "Learn to manage emotions and mistakes",
      "Practice strategic thinking and problem-solving",
      "Build confidence and resilience"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Breathing exercise - 5 deep breaths, clear your mind",
        "Positive affirmations - 'I am a champion, I am improving daily'",
        "Visualization - see yourself playing your best pickleball",
        "Set your intention for today's practice"
      ]
    },
    drills: [
      {
        title: "Mental Toughness in Pickleball",
        videoId: "YRWCmKvt4uY", // Mental game
        duration: "10 minutes",
        instructions: [
          "Learn the importance of staying present - one point at a time",
          "Study emotional management - how to recover from mistakes",
          "Watch pre-point routines of pros",
          "Understand the power of positive self-talk"
        ],
        proTip: "After every mistake, take a deep breath and say 'next point' - reset instantly!"
      },
      {
        title: "Strategic Thinking Practice",
        videoId: "t_sMr7vLmDw", // Pickleball strategy
        duration: "20 minutes",
        instructions: [
          "Play practice games with specific strategic focus",
          "Identify opponent weaknesses and target them",
          "Practice patience - wait for the right shot",
          "Implement pre-point routines - bounce ball twice, deep breath, visualize"
        ],
        proTip: "Winners focus on strategy, losers focus on mistakes - be a strategic thinker!"
      }
    ],
    practiceChecklist: [
      { task: "Watch mental game videos" },
      { task: "Create your personal pre-point routine" },
      { task: "Practice positive self-talk after every mistake" },
      { task: "Play with strategic intent - target weaknesses" }
    ],
    cooldown: {
      reflection: [
        "Did you stay present and focused?",
        "How did you handle mistakes today?",
        "What's one mental tool you'll use in your next game?",
        "Rate your mental toughness today - how can you improve?"
      ],
      keyTakeaway: "Your mind is your most powerful weapon - train it like you train your body!"
    },
    tomorrowPreview: "Day 14: GRADUATION DAY - Tomorrow we celebrate your journey and set you up for continued success! 🎓🏆"
  },
  {
    day: 14,
    title: "Graduation Day",
    subtitle: "Celebrate Your Journey",
    coachMessage: "CONGRATULATIONS, Champion! You made it through the 2-Week Beginner Bootcamp! 🎉🏆 Today is about celebration, assessment, and planning your next steps. You've grown so much - let's recognize that and keep the momentum going!",
    objectives: [
      "Review all skills learned over 14 days",
      "Self-assessment and identifying next focus areas",
      "Celebrate your progress and achievements",
      "Create a plan for continued improvement"
    ],
    warmup: {
      duration: "5 minutes",
      instructions: [
        "Light stretching and movement",
        "Reflect on Day 1 vs. Day 14 - how far you've come!",
        "Gratitude practice - appreciate your effort and dedication",
        "Set your intention to continue improving"
      ]
    },
    drills: [
      {
        title: "Bootcamp Review & Highlights",
        videoId: "Yg2c1p6Hm2Y", // Beginner to intermediate tips
        duration: "10 minutes",
        instructions: [
          "Watch this summary of beginner to intermediate transition",
          "Reflect on each skill you learned: serve, return, dink, drop, volleys, strategy",
          "Identify your 3 biggest improvements",
          "Recognize areas that still need work - that's normal and expected!"
        ],
        proTip: "Improvement is a journey, not a destination - keep practicing, keep growing!"
      },
      {
        title: "Skills Assessment & Fun Play",
        videoId: "pFKTdp7hcSc", // Playing better pickleball
        duration: "30 minutes",
        instructions: [
          "Play 3-5 games applying everything you've learned",
          "Focus on ONE skill per game (Game 1: dinking, Game 2: third shot drops, etc.)",
          "Have FUN - enjoy the game you've worked so hard to improve!",
          "Film yourself if possible - compare to Day 1"
        ],
        proTip: "The best players never stop learning - your journey is just beginning!"
      }
    ],
    practiceChecklist: [
      { task: "Complete bootcamp review" },
      { task: "Play 3-5 practice games" },
      { task: "List your top 3 improvements" },
      { task: "Create a practice plan for the next 30 days" }
    ],
    cooldown: {
      reflection: [
        "What was your biggest breakthrough during the bootcamp?",
        "Which day/skill was most challenging?",
        "How has your confidence grown?",
        "What are you most excited to keep working on?",
        "Who can you thank for supporting you through this journey?"
      ],
      keyTakeaway: "You've built a solid foundation in 14 days - now the real fun begins. Keep playing, keep learning, keep improving. You're a pickleball player now! 🏆"
    },
    tomorrowPreview: "Your bootcamp is complete, but your pickleball journey continues! Consider joining an intermediate program, finding regular playing partners, and competing in local tournaments. The court is yours - go dominate! 💪🏓"
  }
]
