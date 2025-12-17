/**
 * Goal Tip Generator
 * Generates personalized, context-aware tips for users based on their goals
 * Tips rotate through different categories to keep content fresh and engaging
 */

export interface GoalTip {
  category: 'technique' | 'mental' | 'practice' | 'tracking' | 'motivation'
  title: string
  content: string
  actionable: string
  icon: string
}

interface GoalData {
  title: string
  description?: string
  category: string
  targetDate?: Date | string | null
  progress?: number
  daysIntoGoal?: number
}

/**
 * Technique Tips - Focus on specific skills and form
 */
const techniqueTips = [
  {
    title: "Perfect Your Paddle Grip",
    content: "A proper continental grip gives you control and power. Your paddle should feel like an extension of your arm.",
    actionable: "Practice holding the paddle correctly for 5 minutes before each session. Focus on a relaxed but firm grip.",
    icon: "🎯"
  },
  {
    title: "Master the Ready Position",
    content: "Stay on the balls of your feet with knees slightly bent. This athletic stance helps you react faster.",
    actionable: "Set a timer every 15 minutes during practice to check your ready position. Make it a habit.",
    icon: "⚡"
  },
  {
    title: "Improve Your Follow-Through",
    content: "A complete follow-through ensures accuracy and power. Your paddle should finish high for topspin.",
    actionable: "Film yourself and watch your follow-through. Practice 10 slow-motion swings focusing on the finish.",
    icon: "🎬"
  },
  {
    title: "Work on Paddle Face Control",
    content: "The angle of your paddle face determines where the ball goes. Small adjustments make big differences.",
    actionable: "Practice dinking with a focus on paddle face angle. Try to control the ball's landing spot precisely.",
    icon: "🎪"
  },
  {
    title: "Develop Soft Hands",
    content: "Relaxed hands absorb impact better and give you better touch. Tension is your enemy at the net.",
    actionable: "Practice dropping balls on your paddle face from increasing heights. Focus on cushioning the impact.",
    icon: "🤲"
  }
]

/**
 * Mental Game Tips - Psychological aspects of improvement
 */
const mentalTips = [
  {
    title: "Visualize Success Before Practice",
    content: "Mental rehearsal activates the same neural pathways as physical practice. Your brain can't tell the difference.",
    actionable: "Spend 3 minutes before each session visualizing yourself executing skills perfectly. See it, feel it, believe it.",
    icon: "🧠"
  },
  {
    title: "Embrace the Learning Process",
    content: "Mistakes are data points, not failures. Every error teaches you something valuable about your game.",
    actionable: "After each mistake today, pause and identify one specific lesson. Write down 3 lessons after your session.",
    icon: "📈"
  },
  {
    title: "Stay Present During Play",
    content: "Past mistakes and future worries steal your focus. The only shot that matters is the one you're about to hit.",
    actionable: "Between points, take one deep breath and focus on your next serve or return. Nothing else exists.",
    icon: "🎯"
  },
  {
    title: "Build Positive Self-Talk",
    content: "Your inner dialogue shapes your performance. Replace 'I can't' with 'I'm learning to' and watch what happens.",
    actionable: "Catch yourself when negative thoughts arise. Immediately reframe them positively. Practice this 10 times today.",
    icon: "💭"
  },
  {
    title: "Set Process Goals, Not Just Outcome Goals",
    content: "You can't control winning, but you can control effort, focus, and technique. Focus on what you can control.",
    actionable: "Choose one technical aspect to focus on today. Judge success by how well you executed, not the score.",
    icon: "🎪"
  }
]

/**
 * Practice Tips - Structured practice suggestions
 */
const practiceTips = [
  {
    title: "Try the Serve Consistency Drill",
    content: "Consistency beats power. A reliable serve that lands deep every time is more valuable than an ace that misses half the time.",
    actionable: "Hit 20 serves to each side of the court. Track how many land deep in the service box. Aim for 80% consistency.",
    icon: "🏓"
  },
  {
    title: "Practice Your Dinking Game",
    content: "The dink is pickleball's most important shot. Master it and you'll win more points at the net.",
    actionable: "Spend 15 minutes on dinking drills. Focus on consistency, not speed. Try to maintain a 50-dink rally.",
    icon: "🏓"
  },
  {
    title: "Work on Court Positioning",
    content: "Where you stand determines what shots you can make. Good positioning makes hard shots easy.",
    actionable: "During practice, consciously think about your position after each shot. Are you in the optimal spot?",
    icon: "📍"
  },
  {
    title: "Develop Your Third Shot Drop",
    content: "The third shot drop is your ticket to the kitchen. It's challenging but absolutely essential for competitive play.",
    actionable: "Hit 25 third shot drops in practice. Focus on arc and soft landing, not perfection. Track your improvement.",
    icon: "🎯"
  },
  {
    title: "Practice Footwork Fundamentals",
    content: "Quick, balanced footwork gets you to the right position faster. It's the foundation of every good shot.",
    actionable: "Do 10 minutes of footwork drills: shuffle steps, split steps, and quick direction changes. Build muscle memory.",
    icon: "👟"
  }
]

/**
 * Tracking Tips - Emphasize progress monitoring
 */
const trackingTips = [
  {
    title: "Log Your Practice Sessions",
    content: "What gets measured gets improved. Tracking your practice helps you identify patterns and progress.",
    actionable: "After today's session, log what you worked on and how it felt. Note one thing that improved and one to focus on next.",
    icon: "📝"
  },
  {
    title: "Track Your Win Rate by Shot Type",
    content: "Understanding which shots work for you helps you play smarter. Data reveals your strengths and weaknesses.",
    actionable: "During your next match, mental note which shots win you points. Log this data in the app afterward.",
    icon: "📊"
  },
  {
    title: "Monitor Your Consistency",
    content: "Top players aren't always the most powerful—they're the most consistent. Track your unforced errors.",
    actionable: "Count your unforced errors in your next game. Set a goal to reduce them by 20% in your following match.",
    icon: "🎯"
  },
  {
    title: "Review Your Progress Weekly",
    content: "Weekly reviews show you patterns you might miss day-to-day. They help you adjust your training focus.",
    actionable: "This weekend, spend 10 minutes reviewing your week's practice logs. What pattern do you notice?",
    icon: "📈"
  },
  {
    title: "Celebrate Small Wins",
    content: "Progress isn't always linear, but every small improvement deserves recognition. Celebrate the journey.",
    actionable: "Today, identify and celebrate one small improvement from this week. Share it with a practice partner or coach.",
    icon: "🏆"
  }
]

/**
 * Motivation Tips - Inspirational messages
 */
const motivationTips = [
  {
    title: "Every Champion Started as a Beginner",
    content: "The pros you admire were once exactly where you are now. The only difference is they kept going.",
    actionable: "When you feel discouraged today, remember: improvement is inevitable with consistent practice. Show up.",
    icon: "⭐"
  },
  {
    title: "Consistency Beats Intensity",
    content: "Practicing 30 minutes daily beats a 3-hour marathon once a week. Small, regular efforts compound into mastery.",
    actionable: "Commit to just 15 minutes of focused practice today. Tomorrow, do it again. Build the habit first.",
    icon: "🔥"
  },
  {
    title: "Your Only Competition is Yesterday's You",
    content: "Don't compare your progress to others. Compare it to where you were last week, last month, last year.",
    actionable: "Look back at where you started this goal. How far have you come? You're closer than you think.",
    icon: "🚀"
  },
  {
    title: "The Practice Court is Where Champions are Made",
    content: "Games reveal your skill level; practice is where you raise it. Love the process, not just the results.",
    actionable: "Approach today's practice with curiosity and enthusiasm. Make it fun, not a chore.",
    icon: "💪"
  },
  {
    title: "Progress Isn't Always Visible",
    content: "Your skills are improving even when you can't see it. Trust the process—breakthroughs come when you least expect them.",
    actionable: "Keep going even if today feels tough. Tomorrow might be the day something clicks.",
    icon: "🌟"
  }
]

/**
 * Goal-specific tip categories based on goal category
 */
const goalCategoryTips: Record<string, string[]> = {
  SKILL_IMPROVEMENT: ['technique', 'practice', 'tracking'],
  TOURNAMENT: ['mental', 'technique', 'practice'],
  FITNESS: ['practice', 'tracking', 'motivation'],
  MENTAL_GAME: ['mental', 'motivation', 'tracking'],
  SOCIAL: ['practice', 'motivation', 'tracking']
}

/**
 * Generate a tip based on goal data and day number
 */
export function generateGoalTip(goalData: GoalData, dayNumber: number): GoalTip {
  // Determine preferred tip categories based on goal category
  const preferredCategories = goalCategoryTips[goalData.category] || ['technique', 'practice', 'motivation']
  
  // Rotate through categories to keep things fresh
  const categoryIndex = dayNumber % preferredCategories.length
  const category = preferredCategories[categoryIndex] as GoalTip['category']
  
  // Get tip pool for this category
  let tipPool: typeof techniqueTips = []
  switch (category) {
    case 'technique':
      tipPool = techniqueTips
      break
    case 'mental':
      tipPool = mentalTips
      break
    case 'practice':
      tipPool = practiceTips
      break
    case 'tracking':
      tipPool = trackingTips
      break
    case 'motivation':
      tipPool = motivationTips
      break
  }
  
  // Select tip based on day number (ensures consistency per day)
  const tipIndex = Math.floor(dayNumber / preferredCategories.length) % tipPool.length
  const selectedTip = tipPool[tipIndex]
  
  return {
    category,
    ...selectedTip
  }
}

/**
 * Generate a motivational quote for Coach Kai
 */
export function generateMotivationalQuote(dayNumber: number): string {
  const quotes = [
    "The difference between try and triumph is just a little 'umph'! Keep pushing! 🎯",
    "You don't have to be great to start, but you have to start to be great! 🚀",
    "Every expert was once a beginner. Every master was once a disaster. Keep going! 💪",
    "The only bad practice is the one that didn't happen. You showed up—that's winning! ⭐",
    "Champions aren't made in the moment of victory, but in the hours of preparation! 🏆",
    "Your future self is watching. Make them proud! 🌟",
    "Small daily improvements lead to stunning long-term results! 📈",
    "The court doesn't care about your excuses. It only responds to your effort! 🏓",
    "Confidence comes from discipline and training. You're building both! 💯",
    "The harder you work in practice, the luckier you get in matches! 🍀",
    "Your commitment today determines your performance tomorrow! 🔥",
    "Don't wish it were easier. Wish you were better! 💪",
    "Every ball you hit with purpose is a step toward mastery! 🎯",
    "The best time to start was yesterday. The second best time is right now! ⏰",
    "Your dedication is inspiring. Keep building your legacy, one shot at a time! ⭐"
  ]
  
  return quotes[dayNumber % quotes.length]
}

/**
 * Get a specific tip by category for immediate use
 */
export function getTipByCategory(category: GoalTip['category'], index: number = 0): GoalTip {
  let tipPool: typeof techniqueTips = []
  
  switch (category) {
    case 'technique':
      tipPool = techniqueTips
      break
    case 'mental':
      tipPool = mentalTips
      break
    case 'practice':
      tipPool = practiceTips
      break
    case 'tracking':
      tipPool = trackingTips
      break
    case 'motivation':
      tipPool = motivationTips
      break
  }
  
  const tipIndex = index % tipPool.length
  return {
    category,
    ...tipPool[tipIndex]
  }
}

/**
 * Get all available tip categories
 */
export function getAllTipCategories(): GoalTip['category'][] {
  return ['technique', 'mental', 'practice', 'tracking', 'motivation']
}

/**
 * Count total tips available
 */
export function getTipPoolSize(category?: GoalTip['category']): number {
  if (!category) {
    return techniqueTips.length + mentalTips.length + practiceTips.length + 
           trackingTips.length + motivationTips.length
  }
  
  switch (category) {
    case 'technique':
      return techniqueTips.length
    case 'mental':
      return mentalTips.length
    case 'practice':
      return practiceTips.length
    case 'tracking':
      return trackingTips.length
    case 'motivation':
      return motivationTips.length
    default:
      return 0
  }
}
