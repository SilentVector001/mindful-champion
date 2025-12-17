
// Comprehensive Drill Library Database

export type DrillDifficulty = "beginner" | "intermediate" | "advanced" | "pro"
export type DrillCategory = "serving" | "dinking" | "third-shot" | "volley" | "overhead" | "footwork" | "strategy" | "mental" | "warmup"
export type DrillContext = "solo" | "with-partner" | "pre-match" | "tournament-prep" | "skill-specific" | "conditioning" | "mental" | "strategy"
export type EquipmentNeeded = "full-court" | "half-court" | "wall" | "no-net" | "ball-machine" | "targets" | "cones" | "minimal"

export interface Drill {
  id: string
  name: string
  tagline: string
  description: string
  
  // Classification
  category: DrillCategory
  difficulty: DrillDifficulty
  skillLevel: string // "Beginner", "Intermediate", "Advanced", "All Levels"
  
  // Practical Details
  duration: number // minutes
  playerCount: string // "1", "2", "2-4", "4+"
  equipment: EquipmentNeeded[]
  context: DrillContext[]
  
  // Targets
  focusAreas: string[] // Specific skills improved
  benefits: string[]
  
  // Instructions
  setup: string[]
  steps: string[]
  tips: string[]
  commonMistakes?: string[]
  
  // Progression
  easierVersion?: string // Drill ID
  harderVersion?: string // Drill ID
  relatedDrills?: string[] // Drill IDs
  
  // Tracking
  successMetric: string
  videoDemo?: string // URL to short demo video (deprecated - use videoDemos)
  videoDemos?: {
    title: string
    url: string
    duration: string
    description: string
    skillLevel: string
    channel?: string
  }[]
  
  // Meta
  popularityScore: number // 1-10
  effectivenessRating: number // 1-5
}

export const drillsDatabase: Drill[] = [
  // ===== SERVING DRILLS =====
  {
    id: "serve-001",
    name: "Target Serve Mastery",
    tagline: "Hit your spots consistently",
    description: "Develop pinpoint serving accuracy by targeting specific court zones with progressive difficulty.",
    category: "serving",
    difficulty: "beginner",
    skillLevel: "All Levels",
    duration: 15,
    playerCount: "1",
    equipment: ["full-court", "targets"],
    context: ["solo", "skill-specific"],
    focusAreas: ["Serve placement", "Consistency", "Depth control"],
    benefits: [
      "Improved serve accuracy",
      "Better court awareness",
      "Confidence in serve placement",
      "Ability to exploit opponent weaknesses"
    ],
    setup: [
      "Place targets in all 4 service boxes (deep corners)",
      "Have a bucket of 20 balls at the baseline",
      "Mark your serving positions for deuce and ad courts"
    ],
    steps: [
      "Start with 5 serves to the deep forehand corner (deuce court)",
      "Move to the ad court, serve 5 to the deep backhand corner",
      "Continue rotating through all 4 corners",
      "Track your success rate for each target zone",
      "Repeat until you hit 15 out of 20 serves inside target zones"
    ],
    tips: [
      "Focus on consistency before adding power",
      "Use the same toss and motion for all serves",
      "Aim 6-12 inches inside the baseline for maximum depth",
      "Breathe before each serve to maintain rhythm"
    ],
    commonMistakes: [
      "Rushing between serves without resetting",
      "Trying to hit targets with maximum power",
      "Not adjusting aim based on previous results"
    ],
    harderVersion: "serve-002",
    relatedDrills: ["serve-002", "serve-003"],
    successMetric: "15+ successful target hits out of 20 serves",
    videoDemos: [
      {
        title: "Increase Your Serve Accuracy with This Proven Drill",
        url: "https://primetimepickleball.com/increase-your-serve-accuracy-with-this-proven-drill/",
        duration: "5-8 min",
        description: "Proven drill using cones and targets to develop pinpoint serving accuracy. Focuses on simple ball release technique and mixing serve types (topspin, sidespin, lobs) to keep opponents guessing.",
        skillLevel: "All Levels",
        channel: "Prime Time Pickleball"
      },
      {
        title: "Pickleball Serve Tutorial with Federico Staksrud",
        url: "https://www.youtube.com/watch?v=_ew47Dqi-3w",
        duration: "10-15 min",
        description: "Professional player Federico Staksrud demonstrates serve motion, grip techniques (covered at 4:27), and practice drills (at 8:09) showing how to develop a consistent, high-speed serve with proper spin and placement.",
        skillLevel: "Intermediate-Advanced"
      }
    ],
    popularityScore: 9,
    effectivenessRating: 5
  },
  {
    id: "serve-002",
    name: "Advanced Serve Variations",
    tagline: "Keep opponents guessing",
    description: "Master 5 different serve types to create strategic advantages and disrupt opponent rhythm.",
    category: "serving",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 20,
    playerCount: "1",
    equipment: ["full-court", "targets"],
    context: ["solo", "skill-specific", "tournament-prep"],
    focusAreas: ["Serve variety", "Spin control", "Strategic serving"],
    benefits: [
      "Unpredictable serving",
      "Ability to exploit different opponent weaknesses",
      "Better serve break opportunities",
      "Mental edge through variety"
    ],
    setup: [
      "Place targets for deep, short, and wide zones",
      "Have 25 balls ready",
      "Practice area should include both service boxes"
    ],
    steps: [
      "Deep Power Serve: 5 serves aimed at baseline corners with pace",
      "Short Angle Serve: 5 serves landing just past the kitchen, wide angles",
      "Topspin Serve: 5 serves with heavy topspin for high bounce",
      "Slice Serve: 5 serves with sidespin to pull opponents wide",
      "Body Serve: 5 serves aimed at opponent's body position",
      "Practice transitioning randomly between all 5 types"
    ],
    tips: [
      "Change grip slightly for spin serves",
      "Disguise your serve type with consistent toss",
      "Practice each variation until it feels natural",
      "Use serve variety based on opponent positioning"
    ],
    commonMistakes: [
      "Telegraph which serve type you're hitting",
      "Sacrifice accuracy for variety",
      "Don't use power serves exclusively"
    ],
    easierVersion: "serve-001",
    harderVersion: "serve-003",
    relatedDrills: ["serve-001", "serve-003", "strategy-002"],
    successMetric: "Can execute all 5 serve types with 60%+ accuracy",
    videoDemos: [
      {
        title: "Weaponize Your Pickleball Serve",
        url: "https://www.playpickleball.com/weaponize-your-pickleball-serve/",
        duration: "8-12 min",
        description: "Learn to weaponize your serve through improved depth and power using wrist lag drills, kneeling hip-drive exercises, and follow-through techniques for maximum effectiveness.",
        skillLevel: "Intermediate-Advanced",
        channel: "PlayPickleball.com"
      },
      {
        title: "Pickleball Serve Tutorial with Federico Staksrud",
        url: "https://www.youtube.com/watch?v=_ew47Dqi-3w",
        duration: "10-15 min",
        description: "Professional player Federico Staksrud demonstrates serve motion, grip techniques, and practice drills for developing a consistent, high-speed serve with proper spin and placement.",
        skillLevel: "Intermediate-Advanced"
      }
    ],
    popularityScore: 8,
    effectivenessRating: 5
  },
  {
    id: "serve-003",
    name: "Pressure Serve Challenge",
    tagline: "Perform when it matters",
    description: "Simulate match pressure scenarios to build mental toughness and consistency under stress.",
    category: "serving",
    difficulty: "advanced",
    skillLevel: "Advanced-Pro",
    duration: 25,
    playerCount: "1",
    equipment: ["full-court", "targets"],
    context: ["solo", "tournament-prep", "mental"],
    focusAreas: ["Mental toughness", "Clutch serving", "Pressure management"],
    benefits: [
      "Confidence in high-pressure situations",
      "Reduced serving errors in matches",
      "Better focus and routine",
      "Mental resilience"
    ],
    setup: [
      "Create a scoring system: Target hit = 1 point, Miss = -1 point",
      "Set a goal score (e.g., +15 points)",
      "Have timer ready for pressure rounds"
    ],
    steps: [
      "Round 1: Serve until you reach +5 points (warm-up)",
      "Round 2: You're down 9-10, need to hold serve - hit 3 perfect serves in a row",
      "Round 3: Tournament finals, match point - single serve must hit deep corner target",
      "Round 4: Must hit alternating corners 10 times without missing twice in a row",
      "Round 5: 60-second speed drill - how many target hits can you get?"
    ],
    tips: [
      "Develop a consistent pre-serve routine",
      "Use visualization before pressure serves",
      "Focus on process, not outcome",
      "Practice your routine exactly as in matches"
    ],
    commonMistakes: [
      "Changing technique under pressure",
      "Not using the same routine as matches",
      "Getting frustrated and rushing"
    ],
    easierVersion: "serve-002",
    relatedDrills: ["serve-001", "serve-002", "mental-001"],
    successMetric: "Complete all 5 rounds without exceeding miss limits",
    videoDemos: [
      {
        title: "Increase Your Serve Accuracy with This Proven Drill",
        url: "https://primetimepickleball.com/increase-your-serve-accuracy-with-this-proven-drill/",
        duration: "5-8 min",
        description: "Proven drill using cones and targets to develop pinpoint serving accuracy under pressure. Mix serve types to simulate match conditions.",
        skillLevel: "All Levels",
        channel: "Prime Time Pickleball"
      }
    ],
    popularityScore: 7,
    effectivenessRating: 5
  },

  // ===== DINKING DRILLS =====
  {
    id: "dink-001",
    name: "Cross-Court Dinking Foundation",
    tagline: "Master the soft game basics",
    description: "Build consistency and control in cross-court dinking through sustained rallies and proper technique.",
    category: "dinking",
    difficulty: "beginner",
    skillLevel: "Beginner-Intermediate",
    duration: 15,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific"],
    focusAreas: ["Dink consistency", "Touch", "Kitchen line play"],
    benefits: [
      "Soft hands development",
      "Consistent unforced dink rallies",
      "Better net positioning",
      "Foundation for advanced dinking"
    ],
    setup: [
      "Both players start at kitchen line",
      "Each player on opposite sides (cross-court setup)",
      "Have several balls ready nearby"
    ],
    steps: [
      "Start with gentle cross-court dinks at slow pace",
      "Goal: Sustain a rally for 20 consecutive dinks",
      "Focus on arc height - ball should clear net by 12+ inches",
      "Keep dinks landing in the kitchen (non-volley zone)",
      "Once comfortable at 20, increase to 30, then 50",
      "Practice both forehand and backhand sides equally"
    ],
    tips: [
      "Stay low with knees bent throughout",
      "Use continental grip for better control",
      "Let the ball come to you before hitting",
      "Aim for opponent's feet/mid-body initially"
    ],
    commonMistakes: [
      "Hitting dinks too hard",
      "Standing up too tall",
      "Not letting ball drop low enough",
      "Pulling paddle up too quickly"
    ],
    harderVersion: "dink-002",
    relatedDrills: ["dink-002", "dink-003"],
    successMetric: "Sustain 30+ consecutive cross-court dinks",
    videoDemos: [
      {
        title: "Dinking Tips with Catherine Parenteau",
        url: "https://www.youtube.com/watch?v=0RW903Wlr5o",
        duration: "8-12 min",
        description: "Professional player Catherine Parenteau covers dinking fundamentals including grip usage, partner drills, and mastering aggressive dinks through controlled practice techniques.",
        skillLevel: "Intermediate-Advanced"
      },
      {
        title: "2 Touch Dink Ball Control Drill",
        url: "https://primetimepickleball.com/2-touch-dink-ball-control-drill/",
        duration: "6-10 min",
        description: "Progressive 4-level drill system building paddle control and soft hands for consistent dinking.",
        skillLevel: "Beginner-Intermediate",
        channel: "Prime Time Pickleball"
      },
      {
        title: "Pickleball Dinking Drills Playlist",
        url: "https://www.youtube.com/playlist?list=PLf5SOZbiy_ZjbXqyI-FaBn0mn4zS_fblZ",
        duration: "Multiple 3-5 min videos",
        description: "Comprehensive playlist including warm-up drills, control exercises, movement drills, and the popular Figure 8 Pickleball Dinking Drill.",
        skillLevel: "All Levels"
      }
    ],
    popularityScore: 10,
    effectivenessRating: 5
  },
  {
    id: "dink-002",
    name: "Advanced Dinking Patterns",
    tagline: "Control the kitchen battle",
    description: "Progress from basic cross-court dinking to complex patterns including straight-ahead and targeting.",
    category: "dinking",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 20,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific"],
    focusAreas: ["Dink variety", "Court coverage", "Strategic dinking"],
    benefits: [
      "Ability to move opponents",
      "Control dink direction",
      "Create offensive opportunities",
      "Better positioning awareness"
    ],
    setup: [
      "Both players at kitchen line",
      "Establish communication about drill patterns",
      "Have multiple balls ready"
    ],
    steps: [
      "Pattern 1: 10 cross-court forehand dinks",
      "Pattern 2: 10 straight-ahead dinks (more aggressive)",
      "Pattern 3: Alternate cross-court and straight (partner calls out)",
      "Pattern 4: Dink to partner's backhand for 10, then forehand for 10",
      "Pattern 5: Free dinking with goal of moving partner side-to-side",
      "Pattern 6: One player attacks wide, other resets to middle"
    ],
    tips: [
      "Use smaller paddle motion for straight dinks",
      "Change dink speed to disrupt rhythm",
      "Practice hitting behind opponent when they move",
      "Work on quick recovery steps between dinks"
    ],
    commonMistakes: [
      "Telegraphing dink direction",
      "Not resetting position after wide dinks",
      "Hitting straight dinks too aggressively"
    ],
    easierVersion: "dink-001",
    harderVersion: "dink-003",
    relatedDrills: ["dink-001", "dink-003", "strategy-001"],
    successMetric: "Complete all 6 patterns with minimal errors",
    videoDemos: [
      {
        title: "2-Person Pickleball Dink Drills",
        url: "https://www.playpickleball.com/2-person-pickleball-dink-drills/",
        duration: "10-15 min",
        description: "Partner-based drills including the Figure 8 Drill (diagonal and straight patterns) and Battleships Drill (targeting cones at opponent's feet with speed-up options).",
        skillLevel: "Intermediate",
        channel: "PlayPickleball.com"
      },
      {
        title: "Dinking Tips with Catherine Parenteau",
        url: "https://www.youtube.com/watch?v=0RW903Wlr5o",
        duration: "8-12 min",
        description: "Advanced dinking techniques including pattern variations and aggressive dinking strategies.",
        skillLevel: "Intermediate-Advanced"
      }
    ],
    popularityScore: 9,
    effectivenessRating: 5
  },
  {
    id: "dink-003",
    name: "Competitive Dinking Games",
    tagline: "Win the dinking battle",
    description: "Turn dinking practice into competitive games that simulate match pressure and tactical decision-making.",
    category: "dinking",
    difficulty: "advanced",
    skillLevel: "Advanced-Pro",
    duration: 25,
    playerCount: "2-4",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "tournament-prep", "strategy"],
    focusAreas: ["Attacking from dinks", "Patience", "Tactical decision-making"],
    benefits: [
      "Learn when to attack vs. reset",
      "Develop patience under pressure",
      "Better shot selection from dinks",
      "Match-like dinking scenarios"
    ],
    setup: [
      "Establish clear game rules and scoring",
      "Both players (or all 4 in doubles) at kitchen line",
      "Play games to 7 or 11 points"
    ],
    steps: [
      "Game 1: 'Patience Dinking' - Rally must reach 10 dinks before anyone can attack",
      "Game 2: 'Target Zones' - Extra points for dinking into designated court areas",
      "Game 3: 'Escalation' - Start slow, gradually increase pace until someone attacks",
      "Game 4: 'Backhand Only' - Force uncomfortable dink situations",
      "Game 5: 'Free Play' - Normal rules, but focus on creating attack opportunities from dinks"
    ],
    tips: [
      "Be patient and wait for the right ball to attack",
      "Create opportunities by moving opponent",
      "Attack middle ball or high balls",
      "Keep attacks controlled, not max power"
    ],
    commonMistakes: [
      "Attacking too early in rallies",
      "Max power attacks instead of controlled aggression",
      "Not recognizing attackable balls"
    ],
    easierVersion: "dink-002",
    relatedDrills: ["dink-001", "dink-002", "strategy-001", "third-shot-003"],
    successMetric: "Win 3 out of 5 games or maintain 60%+ win rate",
    videoDemos: [
      {
        title: "2-Person Pickleball Dink Drills - Competitive Games",
        url: "https://www.playpickleball.com/2-person-pickleball-dink-drills/",
        duration: "10-15 min",
        description: "Competitive partner drills that simulate match pressure including Battleships targeting game and speed-up opportunities.",
        skillLevel: "Intermediate",
        channel: "PlayPickleball.com"
      }
    ],
    popularityScore: 8,
    effectivenessRating: 5
  },

  // ===== THIRD SHOT DRILLS =====
  {
    id: "third-shot-001",
    name: "Third Shot Drop Fundamentals",
    tagline: "The most important shot in pickleball",
    description: "Master the basic third shot drop to safely advance to the net after serving.",
    category: "third-shot",
    difficulty: "beginner",
    skillLevel: "All Levels",
    duration: 20,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific"],
    focusAreas: ["Third shot drop", "Transition game", "Soft touch"],
    benefits: [
      "Safe net advancement",
      "Neutralize opponent advantage",
      "Better transition game",
      "Foundation for strategic play"
    ],
    setup: [
      "One player at baseline (you), one at kitchen line (partner)",
      "Partner has bucket of balls",
      "Clear communication about pace and placement"
    ],
    steps: [
      "Partner feeds ball from kitchen to your baseline",
      "Execute third shot drop aiming for kitchen area",
      "Goal: Land ball in kitchen or just beyond",
      "Focus on arc height (ball should peak above net by 3-4 feet)",
      "Partner evaluates drop quality: Perfect / Good / Attackable",
      "Repeat 20 times, then switch roles",
      "Aim for 15+ 'Perfect' or 'Good' drops out of 20"
    ],
    tips: [
      "Use open paddle face and lift through contact",
      "Generate arc with wrist lag, not arm swing",
      "Imagine you're hitting a rainbow over the net",
      "Keep knees bent and follow through high"
    ],
    commonMistakes: [
      "Hitting drop too flat (attackable)",
      "Using too much arm instead of wrist",
      "Not allowing ball to drop low enough before contact",
      "Aiming for the net instead of the arc"
    ],
    harderVersion: "third-shot-002",
    relatedDrills: ["third-shot-002", "footwork-002"],
    successMetric: "15+ successful drops out of 20 attempts",
    videoDemos: [
      {
        title: "Third Shot Drop Tutorial",
        url: "https://www.youtube.com/watch?v=l8AzqCNxDTI",
        duration: "8-12 min",
        description: "Comprehensive tutorial on third shot drop fundamentals including proper arc height, contact points, and positioning strategies for consistent execution from the baseline.",
        skillLevel: "All Levels"
      },
      {
        title: "Third Shot Drop Breakdown - The Three Ls",
        url: "https://www.youtube.com/watch?v=Bz2wXIKHXcs",
        duration: "10-15 min",
        description: "Detailed breakdown covering contact points, court position, and the 'three Ls' framework (low, loop, and land) for mastering third shot drop technique and strategy.",
        skillLevel: "Intermediate"
      },
      {
        title: "Third Shot Drop - Scientific Method",
        url: "https://www.youtube.com/watch?v=Cw6Iz0nS0ds",
        duration: "12-18 min",
        description: "Scientific approach explaining ball speed (20-30 mph), height calculations (5-6 feet at apex), and spin variations using physics principles.",
        skillLevel: "Advanced"
      }
    ],
    popularityScore: 10,
    effectivenessRating: 5
  },

  // ===== VOLLEY DRILLS =====
  {
    id: "volley-001",
    name: "Kitchen Line Volley Battle",
    tagline: "Lightning-fast reflexes",
    description: "Develop quick hands and net reflexes through rapid-fire volleys at the kitchen line.",
    category: "volley",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 15,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific", "pre-match"],
    focusAreas: ["Volley reflexes", "Quick hands", "Net play"],
    benefits: [
      "Faster reaction time",
      "Better net control",
      "Improved volley consistency",
      "Confidence at the net"
    ],
    setup: [
      "Both players at kitchen line, directly across from each other",
      "Stand about 10-12 feet apart",
      "Multiple balls ready nearby"
    ],
    steps: [
      "Start with moderate pace volleys, staying at net",
      "No dinking allowed - keep ball at volley height",
      "Gradually increase pace as rally continues",
      "Goal: Sustain 20+ consecutive volleys",
      "Practice 1-minute speed rounds with 30-second rest",
      "Repeat 5-7 times"
    ],
    tips: [
      "Keep paddle up and in ready position",
      "Use small, compact paddle motion",
      "Stay on balls of your feet",
      "Aim for opponent's body or paddle side"
    ],
    commonMistakes: [
      "Taking big backswings",
      "Dropping paddle below waist",
      "Standing flat-footed",
      "Trying for winners instead of consistency"
    ],
    harderVersion: "volley-002",
    relatedDrills: ["volley-002", "footwork-001"],
    successMetric: "Sustain 20+ consecutive volleys at high pace",
    videoDemos: [
      {
        title: "Moving Volley Drill at Kitchen Line",
        url: "https://www.youtube.com/watch?v=HG3cE1v24TQ",
        duration: "5-8 min",
        description: "Demonstrates a cooperative moving volley drill that improves volley shots at the kitchen line through dynamic movement, helping players warm up and increase accuracy under motion.",
        skillLevel: "Intermediate"
      },
      {
        title: "Comprehensive Volley Strategy with Drills",
        url: "https://engagepickleball.com/blogs/tips/comprehensive-volley-strategy-in-pickleball-with-drills",
        duration: "10-15 min",
        description: "Integrated approach combining punch volleys (aggressive drives) and block volleys (defensive absorbs) with drills for controlling pace and targeting opponents' weaknesses at the kitchen line.",
        skillLevel: "Intermediate-Advanced",
        channel: "Engage Pickleball"
      }
    ],
    popularityScore: 9,
    effectivenessRating: 5
  },

  // ===== FOOTWORK DRILLS =====
  {
    id: "footwork-001",
    name: "Split-Step Mastery",
    tagline: "Explosive movement fundamentals",
    description: "Perfect your split-step timing to react faster and move more efficiently on the court.",
    category: "footwork",
    difficulty: "beginner",
    skillLevel: "All Levels",
    duration: 10,
    playerCount: "1",
    equipment: ["half-court", "minimal"],
    context: ["solo", "pre-match", "skill-specific"],
    focusAreas: ["Split-step timing", "Court movement", "Agility"],
    benefits: [
      "Faster reactions to opponent shots",
      "Better balance and positioning",
      "More efficient movement",
      "Reduced injury risk"
    ],
    setup: [
      "Stand at the kitchen line",
      "Have timer or partner to call out directions",
      "Clear space around you for movement"
    ],
    steps: [
      "Practice split-step in place: Small hop, land on balls of feet, ready position",
      "Add direction: Split-step, then move right (shuffle steps)",
      "Split-step, move left, return to center",
      "Split-step, move forward, return to kitchen line",
      "Split-step, move backward, return",
      "Combine: Random direction calls for 30 seconds, rest, repeat 5 times"
    ],
    tips: [
      "Time split-step as opponent is about to hit ball",
      "Land in athletic stance with knees bent",
      "Keep weight forward on balls of feet",
      "First step should be explosive"
    ],
    commonMistakes: [
      "Split-step too early or too late",
      "Landing flat-footed",
      "Split-step is too high/wastes energy",
      "Not staying balanced after landing"
    ],
    harderVersion: "footwork-002",
    relatedDrills: ["footwork-002", "footwork-003"],
    successMetric: "Execute 50 consecutive split-steps with proper form",
    videoDemos: [
      {
        title: "6 Essential Footwork Drills",
        url: "https://successfulpickleball.wordpress.com/2023/04/10/6-footwork-drills-2/",
        duration: "10-15 min",
        description: "Comprehensive collection including Split-Step Drill (explosive jumps and lateral movements), Recovery Drill (side-stepping back to center), and Lateral Agility Drill spanning the full court.",
        skillLevel: "All Levels",
        channel: "Successful Pickleball"
      },
      {
        title: "Split Step Timing Drill",
        url: "https://engagepickleball.com/blogs/tips/comprehensive-strategy-for-working-through-the-transition-zone-in-pickleball",
        duration: "6-10 min",
        description: "Players advance forward with partner feeding balls, performing split step just as opponent contacts ball, improving timing and balance under pressure.",
        skillLevel: "Intermediate",
        channel: "Engage Pickleball"
      }
    ],
    popularityScore: 7,
    effectivenessRating: 5
  },
  {
    id: "footwork-002",
    name: "Transition Zone Navigation",
    tagline: "Master the danger zone",
    description: "Learn to move efficiently through the transition zone between baseline and kitchen line.",
    category: "footwork",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 15,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific"],
    focusAreas: ["Transition zone", "Court positioning", "Movement efficiency"],
    benefits: [
      "Safer net advancement",
      "Better positioning awareness",
      "Fewer transition zone errors",
      "More confident forward movement"
    ],
    setup: [
      "Start at baseline",
      "Partner at kitchen line with balls",
      "Cones or markers to indicate transition zone (optional)"
    ],
    steps: [
      "Partner feeds ball to baseline",
      "Hit third shot drop and immediately move forward",
      "Split-step in transition zone as partner hits ball",
      "Continue moving toward kitchen line",
      "Reset to baseline after each rep",
      "Focus on: third shot drop → split-step → continue forward → arrive at kitchen"
    ],
    tips: [
      "Don't rush to the kitchen - move with purpose",
      "Split-step on opponent's contact, not before",
      "Keep paddle up while moving forward",
      "If ball comes to you in transition zone, reset with another drop"
    ],
    commonMistakes: [
      "Running through transition zone without split-stepping",
      "Arriving at kitchen line off-balance",
      "Not prepared for opponent's shot while moving",
      "Taking too many steps (inefficient movement)"
    ],
    easierVersion: "footwork-001",
    harderVersion: "footwork-003",
    relatedDrills: ["third-shot-001", "footwork-001", "footwork-003"],
    successMetric: "Complete 15 successful transitions with split-step timing",
    videoDemos: [
      {
        title: "Pickleball Footwork Improvements",
        url: "https://www.youtube.com/watch?v=_x6KOmTyRGE",
        duration: "8-12 min",
        description: "Visual demonstration of footwork improvements during transitions, focusing on reaction time and agility in the critical transition zone between baseline and kitchen line.",
        skillLevel: "All Levels"
      },
      {
        title: "Split Step Timing Drill - Transition Zone",
        url: "https://engagepickleball.com/blogs/tips/comprehensive-strategy-for-working-through-the-transition-zone-in-pickleball",
        duration: "6-10 min",
        description: "Comprehensive strategy for working through the transition zone including split-step timing and progressive advancement to the NVZ.",
        skillLevel: "Intermediate",
        channel: "Engage Pickleball"
      }
    ],
    popularityScore: 8,
    effectivenessRating: 5
  },

  // ===== WARMUP DRILLS =====
  {
    id: "warmup-001",
    name: "5-Minute Pre-Match Activator",
    tagline: "Get court-ready fast",
    description: "Quick, comprehensive warm-up routine to activate muscles and sharpen focus before matches.",
    category: "warmup",
    difficulty: "beginner",
    skillLevel: "All Levels",
    duration: 5,
    playerCount: "1",
    equipment: ["minimal", "half-court"],
    context: ["solo", "pre-match"],
    focusAreas: ["Muscle activation", "Mental preparation", "Movement prep"],
    benefits: [
      "Injury prevention",
      "Better first-game performance",
      "Mental focus and readiness",
      "Increased blood flow and flexibility"
    ],
    setup: [
      "Clear space near court or on court",
      "Have paddle and ball ready",
      "Timer set for 5 minutes"
    ],
    steps: [
      "Minute 1: Dynamic stretching (arm circles, leg swings, torso twists)",
      "Minute 2: Footwork (shuffle steps, forward/backward, split-steps)",
      "Minute 3: Shadow swings (forehand, backhand, volley, overhead motions)",
      "Minute 4: Ball bounces and paddle drills (control drills)",
      "Minute 5: Visualization of first game and deep breathing"
    ],
    tips: [
      "Keep movements dynamic, not static stretches",
      "Gradually increase intensity throughout 5 minutes",
      "Focus on areas that feel tight",
      "Visualize successful plays during final minute"
    ],
    commonMistakes: [
      "Static stretching instead of dynamic movement",
      "Skipping mental preparation",
      "Going too hard and wasting energy",
      "Not warming up paddle hand/wrist"
    ],
    relatedDrills: ["warmup-002", "footwork-001"],
    successMetric: "Complete all 5 minutes feeling warm, focused, and ready",
    videoDemos: [
      {
        title: "Quick 5-Minute Pickleball Warm-Up",
        url: "https://www.youtube.com/watch?v=_CUYNbcFe-w",
        duration: "5 min",
        description: "Fast, effective pre-match warm-up covering dynamic stretching (arm circles, leg swings, torso twists), footwork activation (shuffle steps, split-steps), shadow swings, ball bounces, and mental visualization for complete readiness.",
        skillLevel: "All Levels"
      }
    ],
    popularityScore: 10,
    effectivenessRating: 5
  },
  {
    id: "warmup-002",
    name: "Partner Pre-Game Routine",
    tagline: "Warm up together, win together",
    description: "Comprehensive 15-minute partner warm-up covering all major shots and scenarios.",
    category: "warmup",
    difficulty: "beginner",
    skillLevel: "All Levels",
    duration: 15,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "pre-match"],
    focusAreas: ["All shots", "Partner coordination", "Match readiness"],
    benefits: [
      "Complete shot warm-up",
      "Partner chemistry building",
      "Mental and physical readiness",
      "Identify any equipment issues early"
    ],
    setup: [
      "Both players on court with paddles and balls",
      "Start at baseline opposite each other"
    ],
    steps: [
      "Minutes 1-3: Gentle baseline rallies (groundstrokes)",
      "Minutes 4-6: Dinking rallies at kitchen line",
      "Minutes 7-9: One player serves, other returns (switch after 1 minute)",
      "Minutes 10-11: Volleys at kitchen line",
      "Minutes 12-13: Practice third shot drops (alternate roles)",
      "Minutes 14-15: Free play - simulate game scenarios"
    ],
    tips: [
      "Start slow and gradually increase pace",
      "Communicate with partner about any adjustments needed",
      "Test different shots to see what's working",
      "End on a positive note (successful shot)"
    ],
    commonMistakes: [
      "Going too hard too early",
      "Skipping shots you'll use in the match",
      "Not communicating with partner",
      "Warming up too long and getting tired"
    ],
    relatedDrills: ["warmup-001"],
    successMetric: "Both players feel ready and all shots have been tested",
    videoDemos: [
      {
        title: "Comprehensive Pickleball Warm-Up Exercises",
        url: "https://www.youtube.com/watch?v=AaGXyk-UVs4",
        duration: "8-10 min",
        description: "Detailed warm-up routine featuring cardiovascular prep (jogging, skipping), lower body exercises (forward/lateral lunges, leg swings, butt kicks), core twists, trunk extensions, and upper body mobility (arm circles, inchworms).",
        skillLevel: "All Levels"
      },
      {
        title: "Partner Warm-Up Drills",
        url: "https://www.youtube.com/watch?v=_CUYNbcFe-w",
        duration: "5 min",
        description: "Quick partner activation drills covering all major shot types for effective pre-match preparation.",
        skillLevel: "All Levels"
      }
    ],
    popularityScore: 9,
    effectivenessRating: 5
  },

  // ===== STRATEGY DRILLS =====
  {
    id: "strategy-001",
    name: "Target the Middle",
    tagline: "Exploit the confusion gap",
    description: "Practice hitting down the middle in doubles to create confusion and force errors.",
    category: "strategy",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 20,
    playerCount: "4",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "strategy", "tournament-prep"],
    focusAreas: ["Doubles strategy", "Shot placement", "Team coordination"],
    benefits: [
      "More opponent errors",
      "Exploit communication breakdowns",
      "Strategic shot placement",
      "Better doubles teamwork"
    ],
    setup: [
      "Full doubles game setup (2 vs 2)",
      "Establish 'middle zone' target (between partners)",
      "Play focused rallies or points"
    ],
    steps: [
      "Rally 1-10: Intentionally hit 70% of shots down the middle",
      "Rally 11-20: Mix middle shots with traditional angles",
      "Points 1-5: Bonus point if opponents miscommunicate on middle shot",
      "Points 6-11: Free play but be conscious of middle opportunities",
      "Debrief: Discuss when middle shots were most effective"
    ],
    tips: [
      "Target the middle especially on dinks and volleys",
      "Watch opponent communication and body language",
      "Hit middle on pace changes (fast to slow)",
      "Use middle shots after moving opponents wide"
    ],
    commonMistakes: [
      "Only hitting middle, becoming predictable",
      "Not recognizing when opponents have middle covered",
      "Forgetting to communicate with your partner about middle strategy"
    ],
    relatedDrills: ["strategy-002", "dink-003"],
    successMetric: "Force 5+ opponent errors or miscommunications from middle shots",
    videoDemos: [
      {
        title: "Advanced Pickleball Doubles Tactics",
        url: "https://www.youtube.com/watch?v=3sxq1_gcOX0",
        duration: "15-20 min",
        description: "Advanced tactics video covering poaching strategies, stacking formations, communication systems, and timing for when to switch positions and take aggressive shots in doubles play.",
        skillLevel: "Advanced"
      },
      {
        title: "Basic Doubles Strategies for New Players",
        url: "https://www.youtube.com/watch?v=JGMLn68RZS8",
        duration: "10-15 min",
        description: "Foundational doubles strategies including court positioning basics, serve and return tactics, when to advance to the net, and simple communication systems for beginners.",
        skillLevel: "Beginner-Intermediate"
      },
      {
        title: "Doubles Warm-Up Practice Drill (4 Players)",
        url: "https://theartofpickleball.net/doubles-warm-up-practice-for-pickleball-with-four-players/",
        duration: "8-10 min",
        description: "Four-player drill where one team dinks straight ahead while the other dinks cross-court, emphasizing touch, placement, and teamwork.",
        skillLevel: "All Levels",
        channel: "The Art of Pickleball"
      }
    ],
    popularityScore: 8,
    effectivenessRating: 5
  },

  // ===== OVERHEAD DRILLS =====
  {
    id: "overhead-001",
    name: "Overhead Smash Fundamentals",
    tagline: "Put away high balls with power",
    description: "Develop consistent overhead technique for finishing points on lobs and high balls.",
    category: "overhead",
    difficulty: "intermediate",
    skillLevel: "Intermediate-Advanced",
    duration: 15,
    playerCount: "2",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "skill-specific"],
    focusAreas: ["Overhead smash", "Power shots", "Point finishing"],
    benefits: [
      "Ability to finish points",
      "Punish weak lobs",
      "More offensive confidence",
      "Better overhead consistency"
    ],
    setup: [
      "You start at kitchen line or mid-court",
      "Partner at baseline with balls",
      "Clear overhead space"
    ],
    steps: [
      "Partner lobs ball 15-20 feet high",
      "Track ball and position yourself underneath",
      "Point paddle at ball while preparing",
      "Execute overhead smash with full extension",
      "Aim for corners or opponent feet (if present)",
      "Repeat 20 times, focusing on technique over power",
      "Progress to moving overheads (partner lobs to different spots)"
    ],
    tips: [
      "Turn sideways and point non-paddle arm at ball",
      "Wait for ball to drop to ideal contact point",
      "Use full extension like a serve motion",
      "Aim for placement, not max power"
    ],
    commonMistakes: [
      "Swinging too early (ball behind you)",
      "Not getting underneath the ball",
      "Trying to kill every overhead",
      "Poor footwork positioning"
    ],
    relatedDrills: ["overhead-002"],
    successMetric: "15+ successful overheads with good placement out of 20",
    videoDemos: [
      {
        title: "Overhead Smash Technique Guide",
        url: "https://www.pickleballmax.com/2023/06/pickleball-overhead-smash/",
        duration: "10-15 min",
        description: "Comprehensive guide covering footwork (side shuffles vs cross-over steps), positioning (getting behind the ball), grip recommendations (western/semi-western), and swing mechanics including the 'trophy pose' and pronation for power.",
        skillLevel: "Intermediate-Advanced",
        channel: "Pickleball MAX"
      },
      {
        title: "Overhead Smash Practice Drills",
        url: "https://blog.controlthet.com/pickleball/the-overhead-smash",
        duration: "8-12 min",
        description: "Drills including warm-up with lateral shuffles, target practice using cones, consistency exercises (feeder returns smashes to continue rallies), and defending smash practice for understanding shot dynamics from both sides.",
        skillLevel: "All Levels",
        channel: "Control The T"
      }
    ],
    popularityScore: 7,
    effectivenessRating: 5
  },

  // ===== MENTAL GAME DRILLS =====
  {
    id: "mental-001",
    name: "Pressure Point Simulation",
    tagline: "Perform when it matters most",
    description: "Create high-pressure scenarios to build mental toughness and clutch performance.",
    category: "mental",
    difficulty: "advanced",
    skillLevel: "Advanced-Pro",
    duration: 20,
    playerCount: "2-4",
    equipment: ["full-court", "minimal"],
    context: ["with-partner", "tournament-prep", "mental"],
    focusAreas: ["Mental toughness", "Pressure management", "Clutch performance"],
    benefits: [
      "Better performance under pressure",
      "Reduced match anxiety",
      "Stronger mental resilience",
      "Confidence in clutch moments"
    ],
    setup: [
      "Full game format with modified rules",
      "Clear consequence for mistakes (burpees, push-ups, etc.)",
      "Partner or self-imposed pressure"
    ],
    steps: [
      "Scenario 1: Start game at 9-9, first to 11 wins (repeat 5 times)",
      "Scenario 2: You're down 5-10, must win 6 straight points",
      "Scenario 3: Championship point - single point must be won twice in a row",
      "Scenario 4: Can't miss serves - any serve error = start point over",
      "Scenario 5: Free play but verbalize positive self-talk between points"
    ],
    tips: [
      "Use same pre-point routine as matches",
      "Practice positive self-talk out loud",
      "Focus on process goals, not outcome",
      "Breathe deeply between points"
    ],
    commonMistakes: [
      "Not taking drill seriously enough",
      "Negative self-talk when things go wrong",
      "Changing technique under pressure",
      "Not using actual match routine"
    ],
    relatedDrills: ["serve-003", "strategy-001"],
    successMetric: "Successfully complete 3 out of 5 pressure scenarios",
    videoDemos: [
      {
        title: "Pickleball Mental Training Techniques",
        url: "https://www.paddletek.com/blogs/news/pickleball-mental-training",
        duration: "10-15 min",
        description: "Comprehensive guide covering visualization exercises (mentally rehearsing perfect shots), breathing techniques (4-7-8 method), pre-match routines for goal-setting, and strategies for building confidence through consistent mental practice.",
        skillLevel: "All Levels",
        channel: "Paddletek"
      },
      {
        title: "The Pickleball Mental Edge",
        url: "https://thepickler.com/learn/the-pickleball-mental-edge/",
        duration: "12-18 min",
        description: "Eight key mental learnings including 'just play pickleball' (avoid overthinking), building confidence from the start, maintaining positivity, focusing on one shot at a time, riding momentum, and conquering critical scores like 10-10.",
        skillLevel: "Intermediate-Advanced",
        channel: "The Pickler"
      },
      {
        title: "3 Steps to Build Mental Strength",
        url: "https://www.dupr.com/post/3-steps-to-build-mental-strength-to-dominate-on-the-pickleball-court",
        duration: "8-12 min",
        description: "DUPR's framework for mental strength: Release-Reset-Refocus (release negative energy with physical cue, reset through breathing, refocus on actionable steps), plus the CLEAR framework for pressure decision-making and the ADAPT framework for learning from setbacks.",
        skillLevel: "All Levels",
        channel: "DUPR"
      }
    ],
    popularityScore: 6,
    effectivenessRating: 5
  }
]

// Helper functions for drill filtering and searching
export function getDrillById(id: string): Drill | undefined {
  return drillsDatabase.find(d => d.id === id)
}

export function getDrillsByCategory(category: DrillCategory): Drill[] {
  return drillsDatabase.filter(d => d.category === category)
}

export function getDrillsByDifficulty(difficulty: DrillDifficulty): Drill[] {
  return drillsDatabase.filter(d => d.difficulty === difficulty)
}

export function getDrillsByDuration(maxMinutes: number): Drill[] {
  return drillsDatabase.filter(d => d.duration <= maxMinutes)
}

export function getDrillsByContext(context: DrillContext): Drill[] {
  return drillsDatabase.filter(d => d.context.includes(context))
}

export function searchDrills(query: string): Drill[] {
  const lowerQuery = query.toLowerCase()
  return drillsDatabase.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.description.toLowerCase().includes(lowerQuery) ||
    d.focusAreas.some(f => f.toLowerCase().includes(lowerQuery)) ||
    d.tagline.toLowerCase().includes(lowerQuery)
  )
}

export function getPopularDrills(limit: number = 10): Drill[] {
  return [...drillsDatabase]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)
}
