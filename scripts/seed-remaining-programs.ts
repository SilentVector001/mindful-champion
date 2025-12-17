import { prisma } from '../lib/db'

// ========================================
// REMAINING TRAINING PROGRAMS CONTENT
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

// Helper to create days quickly
function createDay(
  day: number,
  title: string,
  focus: string,
  description: string,
  duration_minutes: number,
  drillName: string,
  drillDesc: string,
  tips: string[],
  goals: string[],
  coachNote: string
): DayStructure {
  return {
    day,
    title,
    focus,
    description,
    duration_minutes,
    warmup: {
      title: 'Skill-Specific Warm-Up',
      exercises: ['Light rallying', 'Skill-specific stretches', 'Progressive intensity'],
      duration_minutes: Math.floor(duration_minutes * 0.15)
    },
    main_drills: [
      {
        name: drillName,
        description: drillDesc,
        duration_minutes: Math.floor(duration_minutes * 0.6),
        tips
      }
    ],
    practice_goals: goals,
    success_metrics: goals.map(g => `Achieve: ${g}`),
    cooldown: ['Cool-down stretches', 'Mental review', 'Rest and recover'],
    coach_notes: coachNote,
    age_adaptations: {
      youth: 'Keep it fun and engaging with variety!',
      adult: 'Focus on technical precision and game application.',
      senior: 'Prioritize technique over intensity, listen to your body.'
    },
    gender_tips: {
      general: 'Technique is universal. Focus on mastering the fundamentals.'
    }
  }
}

// ========================================
// INTERMEDIATE: DINKING & KITCHEN PLAY (12 Days)
// ========================================
const dinkingStrategy = {
  programId: 'intermediate-dinking-strategy',
  name: 'Advanced Dinking & Kitchen Play',
  tagline: 'Win the soft game, win the match',
  description: 'Master the art of the dink to control rallies and create opportunities. This 12-day program covers all aspects of kitchen play including patterns, placement, and patience.',
  what_youll_learn: [
    'Dink mechanics and paddle position',
    'Cross-court vs. straight dink strategies',
    'Speed-up recognition and execution',
    'Reset shots from difficult positions',
    'Dink patterns and sequences',
    'Mental patience in dink rallies'
  ],
  who_is_this_for: [
    'Players who rush at the kitchen',
    'Those losing dink rallies',
    'Anyone wanting better soft game'
  ],
  prerequisites: [
    'Can execute basic dinks',
    'Understand kitchen rules',
    '3.0+ skill level'
  ],
  equipment_needed: ['Paddle', 'Balls', 'Court', 'Partner required'],
  dailyStructure: [
    createDay(1, 'Dink Fundamentals Review', 'Paddle position and contact point', 'Reset your dink technique with proper fundamentals.', 35, 'Forehand Dink Perfection', 'Focus on paddle face angle and soft contact.', ['Open paddle face', 'Use legs not arms', 'Watch the ball to paddle'], ['25 controlled forehand dinks'], 'Soft hands, soft results.'),
    createDay(2, 'Backhand Dink Mastery', 'Developing a reliable backhand dink', 'The backhand dink is often weaker. Fix it today.', 35, 'Backhand Focus Drill', 'Exclusive backhand dinking practice.', ['Stable wrist', 'Body rotation', 'Consistent contact'], ['25 controlled backhand dinks'], 'Two-hand backhand is valid!'),
    createDay(3, 'Cross-Court Dinking', 'The high-percentage dink', 'Cross-court dinks have more margin and open angles.', 40, 'Cross-Court Rally', 'Extended cross-court dink rallies with partner.', ['Aim for sideline', 'Higher over the center', 'Create angles'], ['50-ball cross-court rally'], 'Cross-court is your default.'),
    createDay(4, 'Straight-On Dinking', 'Keeping opponents honest', 'Mix in straight dinks to prevent cheating cross-court.', 40, 'Straight Dink Targets', 'Dink straight at targets in front of you.', ['Disguise your intent', 'Quick hands', 'Low over net'], ['20 straight dinks per side'], 'Straight keeps them honest.'),
    createDay(5, 'Dink to Body', 'Jamming opponents', 'Dinks at the body create awkward returns.', 40, 'Body Targeting', 'Aim dinks at the hip and shoulder areas.', ['Hip area is hardest', 'Quick decisions required', 'Mix with wide dinks'], ['Jam opponent 15 times'], 'Make them uncomfortable.'),
    createDay(6, 'The Speed-Up', 'When to attack from dink position', 'Learn to recognize and execute the speed-up.', 45, 'Speed-Up Recognition', 'Identify attackable dinks and fire.', ['High ball = attack', 'Aim at feet', 'Commit fully'], ['10 successful speed-ups'], 'Patience then explosion.'),
    createDay(7, 'Reset Shots', 'Getting out of trouble', 'When attacked, reset back to neutral.', 45, 'Reset Practice', 'Partner attacks, you reset to kitchen.', ['Soft hands absorb pace', 'Deep knee bend', 'Block, dont swing'], ['Reset 20 attacks'], 'Soft beats hard.'),
    createDay(8, 'Dink Patterns', 'Creating sequences', 'Set up your attack with patterns.', 45, 'Pattern Play', 'Practice specific dink sequences.', ['2 cross, 1 straight', 'Move them then attack', 'Read body position'], ['Execute 3 different patterns'], 'Patterns create openings.'),
    createDay(9, 'Patience Training', 'Winning long rallies', 'The patient player usually wins dink rallies.', 50, 'Extended Rallies', '100-ball dink rallies with partner.', ['No unforced errors', 'Wait for the right ball', 'Stay mentally engaged'], ['Complete 100-ball rally'], 'Patience is a weapon.'),
    createDay(10, 'Erne Setup', 'Using dinks to set up Ernes', 'Wide dinks can set up the Erne attack.', 40, 'Erne Setup Drill', 'Dink wide, then jump for Erne.', ['Pull them wide', 'Time your jump', 'Commit to the Erne'], ['5 successful Erne setups'], 'Advanced but devastating.'),
    createDay(11, 'ATP Opportunities', 'Around the Post from dinks', 'Sometimes the angle is there for an ATP.', 40, 'ATP Recognition', 'Identify and execute ATP opportunities.', ['Super wide angle', 'Low is key', 'Rare but effective'], ['3 ATP attempts'], 'The highlight reel shot.'),
    createDay(12, 'Integration Games', 'Full dink game application', 'Play games with kitchen focus.', 55, 'Kitchen Games', 'Games starting from kitchen position.', ['Apply all skills', 'Track your dink winners', 'Notice improvements'], ['Win majority of dink exchanges'], 'Your soft game is transformed!')
  ]
}

// ========================================
// ADVANCED: SPIN CONTROL (14 Days)
// ========================================
const spinControl = {
  programId: 'advanced-spin-control',
  name: 'Spin & Power Mechanics',
  tagline: 'Add another dimension to your game',
  description: 'Master topspin, backspin, and sidespin on all your shots. This 14-day program breaks down spin mechanics and shows you when to use each type.',
  what_youll_learn: [
    'Topspin mechanics on groundstrokes',
    'Backspin/slice on serves and drops',
    'Sidespin for deception',
    'Spin serves that kick and curve',
    'Power generation from kinetic chain',
    'When spin is appropriate vs. flat shots'
  ],
  who_is_this_for: [
    'Players wanting more variety',
    'Those facing flat shot struggles',
    'Anyone ready for advanced techniques'
  ],
  prerequisites: [
    'Solid fundamentals',
    'Consistent flat shots',
    '3.5+ skill level'
  ],
  equipment_needed: ['Paddle', 'Balls', 'Court', 'Partner helpful'],
  dailyStructure: [
    createDay(1, 'Topspin Forehand Intro', 'Low-to-high brush mechanics', 'Learn the basic topspin motion on forehand.', 40, 'Topspin Development', 'Focus on brushing up the back of the ball.', ['Low to high path', 'Wrist stays firm', 'Ball dips after bounce'], ['20 balls with visible topspin'], 'Topspin gives margin.'),
    createDay(2, 'Topspin Forehand Depth', 'Adding power and depth', 'Now add depth to your topspin.', 40, 'Deep Topspin', 'Hit topspin shots past the baseline marker.', ['More acceleration', 'Still low to high', 'Trust the dip'], ['15 deep topspin shots'], 'Spin + depth = pressure.'),
    createDay(3, 'Topspin Backhand', 'Two-hand or one-hand topspin', 'Develop topspin on the backhand side.', 40, 'Backhand Topspin', 'Same brush motion, opposite side.', ['Shoulder rotation key', 'Follow through high', 'Practice both options'], ['15 topspin backhands'], 'Your backhand gets teeth.'),
    createDay(4, 'Slice Forehand', 'Underspin/backspin mechanics', 'The slice stays low and skids.', 40, 'Slice Development', 'High-to-low motion cutting under the ball.', ['Open paddle face', 'Slice under the equator', 'Ball stays low'], ['15 quality slice shots'], 'Slice changes the rally.'),
    createDay(5, 'Slice Backhand', 'The classic slice backhand', 'One-hand slice backhand is elegant and effective.', 40, 'Classic Slice', 'High backswing, cut through low.', ['Shoulder turn', 'Slice through contact', 'Follow through low'], ['15 slice backhands'], 'A beautiful shot to master.'),
    createDay(6, 'Topspin Serve', 'Kick serves that jump', 'Topspin makes serves jump and spin.', 45, 'Kick Serve Practice', 'Brush up on serve contact for topspin.', ['Ball jumps up', 'Harder to return', 'Less speed needed'], ['20 topspin serves'], 'Spin serves are tricky.'),
    createDay(7, 'Slice Serve', 'Curving serves that skid', 'Slice serves curve and stay low.', 45, 'Slice Serve Development', 'Cut across the ball at contact.', ['Ball curves left or right', 'Stays low on bounce', 'Great for wide placement'], ['20 slice serves'], 'Move them wide with slice.'),
    createDay(8, 'Sidespin Basics', 'Creating horizontal spin', 'Sidespin makes the ball curve and kick sideways.', 40, 'Sidespin Introduction', 'Brush the side of the ball.', ['Ball curves in flight', 'Kicks off bounce', 'Great for deception'], ['15 sidespin shots'], 'Add another dimension.'),
    createDay(9, 'Spin Third Shot Drops', 'Adding spin to drops', 'Spin on drops adds unpredictability.', 45, 'Spinning Drops', 'Add backspin or sidespin to your drops.', ['Backspin stops quickly', 'Sidespin moves sideways', 'Harder to attack'], ['20 spin drops'], 'Upgrade your drops.'),
    createDay(10, 'Spin Dinks', 'Varying spin in the kitchen', 'Spin dinks are harder to handle.', 40, 'Dink Spin Variety', 'Mix topspin, backspin, and flat dinks.', ['Topspin dinks dive', 'Backspin dinks stop', 'Mix keeps them guessing'], ['30 dinks with varied spin'], 'Unpredictability wins.'),
    createDay(11, 'Power Generation', 'Kinetic chain mechanics', 'Power comes from ground up, not arm.', 45, 'Power Development', 'Use legs, hips, core, arm in sequence.', ['Start from ground', 'Hip rotation', 'Arm is last link'], ['10 powerful but controlled shots'], 'Effortless power.'),
    createDay(12, 'Spin Under Pressure', 'Executing spin when it counts', 'Practice spin shots in pressure situations.', 45, 'Pressure Spin', 'Execute spin shots in competitive drills.', ['Trust your technique', 'Spin is reliable', 'Breathe and execute'], ['8/10 spin shots under pressure'], 'Reliable under fire.'),
    createDay(13, 'Shot Selection', 'When to use which spin', 'Match the spin to the situation.', 45, 'Spin Decision Making', 'Practice choosing the right spin.', ['Flat for quick shots', 'Topspin for safety', 'Slice to change pace'], ['Make correct spin choices'], 'Smart spin selection.'),
    createDay(14, 'Full Integration', 'Spin in real matches', 'Use all your spin in games.', 55, 'Spin Games', 'Full games using your new spin arsenal.', ['Mix it up', 'Track spin winners', 'Enjoy the variety'], ['Use all spin types effectively'], 'Your game has new dimensions!')
  ]
}

// ========================================
// ADVANCED: TOURNAMENT PREP (21 Days)
// ========================================
const tournamentPrep = {
  programId: 'advanced-tournament-prep',
  name: 'Tournament Preparation',
  tagline: 'Prepare to compete at your best',
  description: 'A comprehensive 21-day program to peak for tournament play. Covers physical preparation, mental game, strategy, and recovery.',
  what_youll_learn: [
    'Tournament-specific strategies',
    'Mental preparation techniques',
    'Match warm-up routines',
    'Between-game recovery',
    'Partner coordination for doubles',
    'Handling tournament pressure'
  ],
  who_is_this_for: [
    'Players entering tournaments',
    'Competitive recreational players',
    'Anyone wanting to test themselves'
  ],
  prerequisites: [
    'Solid all-around game',
    'Doubles experience',
    '3.5+ skill level'
  ],
  equipment_needed: ['Multiple paddles', 'Extra balls', 'Proper shoes', 'Hydration gear'],
  dailyStructure: [
    // Week 1: Foundation
    createDay(1, 'Tournament Assessment', 'Evaluating your game for competition', 'Identify strengths to leverage and weaknesses to shore up.', 45, 'Self-Assessment', 'Play sets and honestly evaluate each area.', ['Rate serve reliability', 'Rate return depth', 'Rate kitchen game'], ['Complete honest assessment'], 'Know thyself.'),
    createDay(2, 'Serve Reliability', 'Building a tournament-proof serve', 'In tournaments, faults are devastating. Build reliability.', 40, 'Serve Consistency', 'Hit 100 serves, track accuracy.', ['80%+ in court', 'Placement variety', 'No double faults'], ['90+ serves in court'], 'Serve IN first.'),
    createDay(3, 'Return Consistency', 'Returns that start you right', 'A deep return = net position opportunity.', 40, 'Return Drill', 'Return 50 serves, all deep.', ['Depth over everything', 'Move forward after', 'No gifts'], ['40+ deep returns'], 'Deep returns win.'),
    createDay(4, 'Third Shot Options', 'Drop, drive, or lob', 'Have all three options ready.', 45, 'Third Shot Variety', 'Practice all three third shot options.', ['Drop when they\'re up', 'Drive when they\'re back', 'Lob when they\'re close'], ['Execute all three well'], 'Options beat predictability.'),
    createDay(5, 'Kitchen Dominance', 'Winning the soft game', 'Most tournament points end at the kitchen.', 45, 'Kitchen Games', 'Extended kitchen-only play.', ['Patient dinking', 'Speed-up timing', 'Reset ability'], ['Win majority of kitchen exchanges'], 'Kitchen is where it\'s won.'),
    createDay(6, 'Partner Communication', 'Doubles coordination', 'Clear communication prevents confusion.', 40, 'Communication Drill', 'Practice calls and signals.', ['Mine/yours calls', 'Switch signals', 'Encouragement'], ['Zero confusion in play'], 'Partners must communicate.'),
    createDay(7, 'Rest and Review', 'Active recovery day', 'Light activity and mental preparation.', 25, 'Light Play', 'Fun, low-intensity hitting.', ['No pressure', 'Enjoy the game', 'Stay loose'], ['Feel refreshed'], 'Rest is training too.'),
    // Week 2: Strategy and Pressure
    createDay(8, 'Playing Styles', 'Adapting to different opponents', 'Learn to adjust your game to opponents.', 50, 'Style Adjustment', 'Play different styles with partner.', ['Against bangers', 'Against dinkers', 'Against lobbers'], ['Adapt successfully'], 'Flexibility wins matches.'),
    createDay(9, 'Pressure Situations', 'Game point execution', 'Practice high-pressure moments.', 45, 'Pressure Points', 'Simulate game point situations.', ['Stay calm', 'Trust training', 'Breathe'], ['Execute under pressure'], 'Pressure is privilege.'),
    createDay(10, 'Wind and Sun', 'Outdoor tournament conditions', 'Tournaments are often outdoors. Adapt.', 40, 'Elements Practice', 'Practice in challenging conditions.', ['Into the wind = hit lower', 'With wind = add spin', 'Sun = call early'], ['Handle conditions'], 'Conditions affect everyone.'),
    createDay(11, 'Multi-Match Endurance', 'Playing multiple games', 'Tournament days are long.', 50, 'Multiple Games', 'Play 3-4 games with short breaks.', ['Pace yourself', 'Stay hydrated', 'Mental freshness'], ['Complete all games well'], 'Endurance matters.'),
    createDay(12, 'Match Warm-Up', 'Your pre-match routine', 'Develop and practice your warm-up routine.', 35, 'Warm-Up Protocol', 'Practice your tournament warm-up.', ['5-10 minutes', 'All shot types', 'Gradual intensity'], ['Routine established'], 'Routine builds confidence.'),
    createDay(13, 'Between Games', 'Recovery and reset', 'How to recover between tournament games.', 35, 'Recovery Protocol', 'Practice between-game routine.', ['Hydrate', 'Light stretching', 'Mental reset'], ['Recovery routine set'], 'Reset between games.'),
    createDay(14, 'Rest Day', 'Complete rest', 'Your body needs recovery.', 20, 'Active Rest', 'Light walking or stretching only.', ['No pickleball', 'Sleep well', 'Eat well'], ['Feel fully recovered'], 'Rest = performance.'),
    // Week 3: Peak and Taper
    createDay(15, 'Mental Rehearsal', 'Visualization techniques', 'See yourself succeeding.', 40, 'Visualization Practice', 'Mental rehearsal of match scenarios.', ['See successful shots', 'Feel confidence', 'Handle adversity'], ['Visualize a complete match'], 'Mind prepares body.'),
    createDay(16, 'Strategy Review', 'Your game plan', 'Solidify your tournament strategy.', 40, 'Strategy Session', 'Review and practice your go-to plays.', ['Your best serve', 'Your best return', 'Your attack patterns'], ['Strategy is clear'], 'Have a plan.'),
    createDay(17, 'Weaknesses Review', 'Shore up vulnerabilities', 'Last chance to address weaknesses.', 40, 'Weakness Work', 'Focused practice on weak areas.', ['Honest assessment', 'Specific drills', 'Improvement focus'], ['Weaknesses improved'], 'No hiding in tournaments.'),
    createDay(18, 'Confidence Building', 'Play to your strengths', 'Remind yourself what you do well.', 40, 'Strength Showcase', 'Play sets using your best weapons.', ['Your forehand', 'Your dink', 'Your serve'], ['Feel confident'], 'Play your game.'),
    createDay(19, 'Light Sharpening', 'Stay sharp, don\'t overtrain', 'Light practice to stay ready.', 30, 'Tune-Up', 'Light, focused practice.', ['Feel good', 'Don\'t overdo', 'Stay positive'], ['Sharp not tired'], 'Taper begins.'),
    createDay(20, 'Pre-Tournament Rest', 'Rest and prepare', 'The day before the tournament.', 25, 'Light Movement', 'Very light activity only.', ['Pack your bag', 'Know the schedule', 'Get sleep'], ['Ready for tomorrow'], 'Rest and believe.'),
    createDay(21, 'Tournament Day!', 'Execute your preparation', 'Today is what you trained for.', 60, 'Tournament Play', 'Play your tournament!', ['Trust your training', 'Stay in the moment', 'Enjoy competing'], ['Play your best'], 'You are prepared. Go compete!')
  ]
}

// ========================================
// PRO: ELITE MASTERY (30 Days)
// ========================================
const eliteMastery = {
  programId: 'pro-elite-mastery',
  name: 'Elite Mastery Program',
  tagline: 'Train like a professional',
  description: 'An intensive 30-day program designed for serious competitive players. Covers advanced techniques, tactical mastery, physical conditioning, and mental performance.',
  what_youll_learn: [
    'Elite-level shot making',
    'Advanced tactical patterns',
    'Physical conditioning for pickleball',
    'Mental performance techniques',
    'Video analysis skills',
    'Competition psychology'
  ],
  who_is_this_for: [
    'Advanced tournament players',
    'Those pursuing competitive rankings',
    'Serious players wanting pro-level training'
  ],
  prerequisites: [
    '4.0+ skill level',
    'Tournament experience',
    'Commitment to intensive training'
  ],
  equipment_needed: ['High-quality paddle', 'Video recording device', 'Training partner', 'Court access'],
  dailyStructure: [
    // Days 1-10: Technical Mastery
    createDay(1, 'Baseline Assessment', 'Comprehensive skill evaluation', 'Record and analyze your current level.', 60, 'Video Analysis', 'Record all shots and analyze technique.', ['Study your form', 'Identify inefficiencies', 'Set goals'], ['Complete analysis'], 'Know your starting point.'),
    createDay(2, 'Elite Serve Development', 'Pro-level serve mechanics', 'Develop serves that create advantage.', 50, 'Advanced Serves', 'Multiple serve types with placement.', ['Topspin', 'Slice', 'Power', 'Placement'], ['Consistent pro serves'], 'The serve is your weapon.'),
    createDay(3, 'Elite Returns', 'Attacking the serve', 'Turn defense into offense.', 50, 'Aggressive Returns', 'Returns that pressure the server.', ['Drive returns', 'Angled returns', 'Attack weak serves'], ['Return as weapon'], 'Attack from the start.'),
    createDay(4, 'Third Shot Mastery', 'Complete third shot arsenal', 'Master every third shot option.', 55, 'Third Shot Excellence', 'Drops, drives, lobs, angles.', ['Read opponent', 'Execute perfectly', 'Follow appropriately'], ['All options reliable'], 'Your transition is elite.'),
    createDay(5, 'Kitchen Warfare', 'Dominating the soft game', 'Control dink rallies completely.', 55, 'Elite Dinking', 'Extended pressure dink sequences.', ['Placement precision', 'Spin variety', 'Speed-up timing'], ['Win 80% of dink exchanges'], 'Kitchen dominance.'),
    createDay(6, 'Power Management', 'Controlled aggression', 'Know when to accelerate and when to wait.', 50, 'Power Control', 'Full power with full control.', ['Controlled power', 'Strategic aggression', 'Target accuracy'], ['Powerful and precise'], 'Power with purpose.'),
    createDay(7, 'Finesse Excellence', 'Touch shot mastery', 'Develop elite touch on all shots.', 50, 'Touch Drills', 'Drops, resets, angles, lobs.', ['Soft hands', 'Perfect placement', 'Deceptive touch'], ['Elite touch shots'], 'Finesse is an art.'),
    createDay(8, 'Transition Zone', 'Moving through no-mans land', 'Master the trickiest zone.', 55, 'Transition Mastery', 'Shots from the transition zone.', ['When to stop', 'When to keep moving', 'Shot selection'], ['Transition excellence'], 'Own the middle.'),
    createDay(9, 'Erne & ATP', 'Specialty shots', 'Master the highlight-reel shots.', 45, 'Specialty Shots', 'Erne and ATP practice.', ['Read the setup', 'Timing', 'Commitment'], ['Execute both reliably'], 'The pro shots.'),
    createDay(10, 'Recovery Day', 'Active rest', 'Essential recovery.', 30, 'Light Activity', 'Stretching and light movement.', ['Foam rolling', 'Yoga', 'Mental rest'], ['Full recovery'], 'Recovery is training.'),
    // Days 11-20: Tactical Excellence
    createDay(11, 'Pattern Recognition', 'Reading opponent patterns', 'See what opponents will do before they do it.', 55, 'Pattern Study', 'Identify and exploit patterns.', ['Watch their habits', 'Predict shots', 'Counter patterns'], ['Read opponents better'], 'Anticipation is elite.'),
    createDay(12, 'Strategic Stacking', 'Advanced doubles positioning', 'Use stacking to create advantages.', 50, 'Stacking Practice', 'All stacking variations.', ['Forehand middle', 'Hide weaknesses', 'Confuse opponents'], ['Stack effectively'], 'Positioning is strategy.'),
    createDay(13, 'Isolating Opponents', 'Target the weaker player', 'Strategically attack weaknesses.', 50, 'Isolation Tactics', 'Patterns that isolate opponents.', ['Middle balls to weaker', 'Pull wide then target', 'Consistent pressure'], ['Isolate effectively'], 'Smart targeting.'),
    createDay(14, 'Changing Tactics Mid-Match', 'Adapting on the fly', 'Adjust when plan A isn\'t working.', 55, 'Tactical Adjustment', 'Practice changing strategies.', ['Read what\'s working', 'Have plan B ready', 'Adjust confidently'], ['Adapt successfully'], 'Flexibility wins.'),
    createDay(15, 'Playing Uphill', 'Competing against better players', 'How to play up and compete.', 50, 'Playing Up', 'Strategies against stronger opponents.', ['Stay patient', 'Limit mistakes', 'Take chances wisely'], ['Compete with better players'], 'Learn from better players.'),
    createDay(16, 'Maintaining Leads', 'Closing out matches', 'Don\'t let leads slip away.', 50, 'Lead Protection', 'Strategies for maintaining leads.', ['Don\'t get conservative', 'Keep doing what works', 'Stay aggressive'], ['Close out matches'], 'Finish strong.'),
    createDay(17, 'Coming from Behind', 'Mounting comebacks', 'Never give up. Learn comeback strategies.', 50, 'Comeback Practice', 'Strategies when trailing.', ['Stay positive', 'One point at a time', 'Increase aggression'], ['Complete comebacks'], 'Never surrender.'),
    createDay(18, 'Handling Pressure', 'Game point execution', 'Thrive in high-pressure moments.', 55, 'Pressure Training', 'Repeated pressure situations.', ['Breathe', 'Trust training', 'Execute'], ['Handle pressure well'], 'Pressure is privilege.'),
    createDay(19, 'Partner Dynamics', 'Elite doubles chemistry', 'Maximize your partnership.', 50, 'Partnership Work', 'Communication and coordination.', ['Clear calls', 'Shared strategy', 'Support each other'], ['Elite partnership'], 'Two as one.'),
    createDay(20, 'Recovery Day', 'Essential rest', 'Mid-program recovery.', 30, 'Rest and Recover', 'Complete physical rest.', ['Sleep', 'Nutrition', 'Mental break'], ['Fully recovered'], 'Rest equals gains.'),
    // Days 21-30: Peak Performance
    createDay(21, 'Mental Conditioning', 'Building mental toughness', 'The mental game separates good from great.', 45, 'Mental Training', 'Visualization, focus, and resilience.', ['Visualization', 'Breath control', 'Positive self-talk'], ['Mental strength improved'], 'Mind is your edge.'),
    createDay(22, 'Physical Conditioning', 'Pickleball-specific fitness', 'Build the body for elite play.', 50, 'Fitness Training', 'Agility, endurance, and strength.', ['Quick feet', 'Core strength', 'Endurance'], ['Improved fitness'], 'Fit body, better play.'),
    createDay(23, 'Speed Drills', 'Quick hands and feet', 'Develop elite reaction speed.', 45, 'Speed Training', 'Reaction and movement speed.', ['First step quickness', 'Hand speed', 'Recovery speed'], ['Faster reactions'], 'Speed wins points.'),
    createDay(24, 'Endurance Building', 'Long match fitness', 'Be strong in the third game.', 50, 'Endurance Work', 'Multiple game simulation.', ['Stay fresh', 'Mental endurance', 'Physical stamina'], ['Complete without fatigue'], 'Outlast opponents.'),
    createDay(25, 'Competition Simulation', 'Tournament-like conditions', 'Practice like you play.', 60, 'Tournament Sim', 'Full competitive matches.', ['Keep score', 'Play to win', 'Handle pressure'], ['Perform in simulation'], 'Practice = play.'),
    createDay(26, 'Video Review', 'Analyze your progress', 'See how far you\'ve come.', 45, 'Progress Review', 'Compare to day 1 video.', ['Notice improvements', 'Identify remaining gaps', 'Adjust plan'], ['Clear progress seen'], 'Measure improvement.'),
    createDay(27, 'Weakness Elimination', 'Final weakness work', 'Address any remaining gaps.', 50, 'Gap Closing', 'Focused weakness practice.', ['Honest assessment', 'Targeted drills', 'Commitment'], ['Weaknesses minimized'], 'No more gaps.'),
    createDay(28, 'Strength Maximization', 'Play to your strengths', 'Remind yourself what makes you elite.', 50, 'Strength Showcase', 'Dominate with your best.', ['Use your weapons', 'Build confidence', 'Trust your game'], ['Confidence high'], 'You are elite.'),
    createDay(29, 'Taper Day', 'Light sharpening', 'Stay sharp, don\'t overtrain.', 30, 'Light Practice', 'Stay ready, stay fresh.', ['Light hitting', 'Feel good', 'Stay positive'], ['Sharp and ready'], 'Peak is coming.'),
    createDay(30, 'Elite Showcase', 'Demonstrate your mastery', 'Show what 30 days of elite training produces.', 60, 'Final Assessment', 'Full competitive play with analysis.', ['Trust your training', 'Execute with confidence', 'Enjoy your progress'], ['Elite performance'], 'You have arrived. Keep growing!')
  ]
}

// ========================================
// SEED FUNCTION
// ========================================
async function seedRemainingPrograms() {
  console.log('🌱 Starting Remaining Programs Seed...')
  
  const programs = [dinkingStrategy, spinControl, tournamentPrep, eliteMastery]
  
  for (const programData of programs) {
    try {
      console.log(`\n📚 Updating: ${programData.name}`)
      
      const existing = await prisma.trainingProgram.findFirst({
        where: { programId: programData.programId }
      })
      
      if (existing) {
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
  
  console.log('\n✅ Remaining Programs Seed Complete!')
}

seedRemainingPrograms()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
