/**
 * ADVANCED DINKING & KITCHEN PLAY - Complete 12-Day Training Program
 * Master the art of patient, strategic dinking and net domination
 */

export const advancedDinkingProgram = {
  programId: 'intermediate-dinking-strategy',
  name: 'Advanced Dinking & Kitchen Play',
  tagline: 'Control the kitchen and win more rallies',
  description: 'Elevate your dinking game to an advanced level with sophisticated techniques and patience strategies.',
  durationDays: 12,
  skillLevel: 'INTERMEDIATE',
  estimatedTimePerDay: '35-45 minutes',
  keyOutcomes: [
    'Master cross-court and straight dinks with precision',
    'Develop patience in long dink rallies (50+ shots)',
    'Create and recognize attackable balls consistently',
    'Improve kitchen line positioning and footwork',
    'Execute the erne shot in match situations'
  ],
  dailyStructure: {
    days: Array.from({ length: 12 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${[
        'Dinking Fundamentals Review',
        'Cross-Court Dinking Mastery',
        'Straight-Ahead Dinking Control',
        'Direction Changes & Angles',
        'Pace Control & Touch',
        'Creating Attackable Balls',
        'Recognizing Attack Opportunities',
        'Kitchen Line Footwork',
        'Erne Shot Introduction',
        'Patience Training',
        'Advanced Patterns',
        'Tournament Dinking'
      ][i]}`,
      focus: [
        'Refining basic dinking technique',
        'Mastering cross-court dinks',
        'Controlling straight dinks',
        'Changing directions smoothly',
        'Varying pace and spin',
        'Setting up attackable balls',
        'Identifying when to speed up',
        'Efficient kitchen movement',
        'Executing erne shots',
        'Building mental patience',
        'Complex dinking patterns',
        'Match-speed dinking'
      ][i],
      description: [
        'Review and refine fundamental dinking technique. Focus on consistency and soft hands.',
        'Master the cross-court dink - the safest and most effective dink in pickleball.',
        'Develop precision on straight-ahead dinks. Control direction and depth.',
        'Practice changing dink direction fluidly. Keep opponents guessing.',
        'Learn to vary pace and add spin to dinks. Create different looks.',
        'Practice intentionally setting up high balls for your partner to attack.',
        'Develop the skill to recognize when balls are attackable vs when to be patient.',
        'Master efficient footwork at the kitchen line. Move without faulting.',
        'Learn the erne shot - the advanced move that surprises opponents.',
        'Build mental patience for 50+ shot rallies. Outlast opponents.',
        'Practice advanced multi-shot patterns and sequences.',
        'Final day - compete at match speed with all dinking skills.'
      ][i],
      duration_minutes: 40 + (i % 3) * 5,
      videoUrl: `https://www.youtube.com/watch?v=${['eD0gCv5hTVE', 'tKKk9p7n_tw', 'sL4vQ3x_9Qk', '8k9fJ3_K4pM', 'pR5zN2_8vQw', '7hK3_pL9mN0', 'qT6_wN5jK8L', 'ZBqxZHHEqog', 'mK9_jN3pQ7w', 'vL8_tP2_hK4', 'xN3_rQ9_mP7', 'gN5_wK8_tL2'][i]}`,
      videoTitle: [
        'Dinking Fundamentals',
        'Cross-Court Dinking Strategy',
        'Straight Dinking Technique',
        'Direction Change Drills',
        'Pace & Spin Variation',
        'Setting Up Attacks',
        'Attack Recognition',
        'Kitchen Line Footwork',
        'How to Hit an Erne',
        'Patience in Dinking',
        'Advanced Dinking Patterns',
        'Tournament Dinking Strategy'
      ][i],
      warmup: {
        title: 'Dinking Warm-up',
        exercises: [
          '5-8 minutes light cardio',
          'Wrist flexibility exercises',
          'Soft hands drills',
          'Kitchen line movement practice',
          'Balance exercises'
        ],
        duration_minutes: 10
      },
      main_drills: [
        {
          name: `Primary Drill - Day ${i + 1}`,
          description: [
            'Practice basic cross-court and straight dinks. Focus on consistency.',
            'Extended cross-court dink rallies. Try for 50+ consecutive dinks.',
            'Straight-ahead dinking with target zones. Hit specific areas.',
            'Alternating direction dinks. Cross-court, straight, repeat.',
            'Add topspin and backspin to dinks. Vary pace intentionally.',
            'Partner drills to create high balls on purpose. Set up attacks.',
            'Dink rallies where you identify attackable balls (signal but do not attack).',
            'Side-to-side movement drills at kitchen line. Stay behind line.',
            'Erne setup and execution drills. Practice the timing and movement.',
            'Extended dink rallies with goal of 75+ shots. Build mental endurance.',
            'Complex patterns: cross-cross-straight-cross, etc.',
            'Competitive match play focusing on winning dink rallies.'
          ][i],
          duration_minutes: 18 + (i % 2) * 3,
          reps_or_sets: [
            '5 sets of 20 dinks each',
            '3 attempts at 50+ consecutive',
            '4 sets of 15 to targets',
            '60 direction changes',
            '4 sets of 20 varied dinks',
            '40 setup sequences',
            '50 dink rallies with signals',
            '30 movement sequences',
            '25 erne attempts',
            '5 attempts at 75+ rally',
            '40 pattern sequences',
            '4 games to 11 points'
          ][i],
          tips: [
            ['Keep dinks low over net', 'Soft hands, minimal backswing', 'Stay patient', 'Focus on consistency'],
            ['Cross-court is safest', 'Aim for opponent\'s kitchen', 'Maintain rhythm', 'Count your streak'],
            ['Control direction with paddle angle', 'Keep ball low', 'Target sidelines', 'Vary depth'],
            ['Signal direction to partner', 'Smooth transitions', 'No telegraphing', 'Stay balanced'],
            ['Topspin: brush up on ball', 'Backspin: slice under ball', 'Vary pace subtly', 'Keep low'],
            ['Set up high balls on purpose', 'Communicate with partner', 'Create attackable chances', 'Be intentional'],
            ['Wait for ball above net', 'Signal "attackable" to partner', 'Don\'t force attacks', 'Be selective'],
            ['Stay behind kitchen line', 'Quick small steps', 'Don\'t overreach', 'Maintain balance'],
            ['Jump around post, not over line', 'Time it perfectly', 'Surprise factor', 'Return to kitchen'],
            ['Stay relaxed and breathing', 'Don\'t speed up prematurely', 'Enjoy the rally', 'Outlast opponent'],
            ['Practice specific sequences', 'Make it automatic', 'Keep opponents guessing', 'Maintain control'],
            ['Execute all skills learned', 'Stay patient in rallies', 'Attack when right', 'Win dink battles']
          ][i]
        },
        {
          name: `Secondary Drill - Day ${i + 1}`,
          description: [
            'Alternating partner dinking. Switch who initiates.',
            'One-ball dinking. Keep same ball in play as long as possible.',
            'Target practice with straight dinks.',
            'Random direction drills. Partner calls direction mid-rally.',
            'Spin recognition. Identify spin type on incoming dinks.',
            'Attack execution. Actually attack the balls you set up.',
            'Live game scenarios with attack decisions.',
            'Erne timing drills without ball.',
            'Erne in live points.',
            'Competitive dink-only games to 11.',
            'Pattern variations and adaptations.',
            'Final tournament simulation.'
          ][i],
          duration_minutes: 12 + (i % 2) * 2,
          reps_or_sets: [
            '30 alternating sequences',
            '5 attempts, track best',
            '40 target dinks',
            '50 random direction dinks',
            '40 spin identification attempts',
            '30 setup and attack sequences',
            '25 live decision points',
            '30 erne movement reps',
            '20 erne attempts in play',
            '3 games to 11',
            '30 pattern variations',
            '3 tournament-style games'
          ][i],
          tips: [
            ['Communicate clearly', 'Smooth transitions', 'Stay engaged', 'Build chemistry'],
            ['Ultimate consistency challenge', 'Stay relaxed', 'Breathe', 'Celebrate high numbers'],
            ['Precision over power', 'Hit targets consistently', 'Track success rate', 'Improve accuracy'],
            ['Quick reactions', 'Trust your instincts', 'Stay balanced', 'Execute cleanly'],
            ['Watch ball rotation', 'Adjust paddle accordingly', 'Anticipate bounce', 'Counter effectively'],
            ['Commit to attacks', 'Attack decisively', 'Good setup = easy putaway', 'Reset if missed'],
            ['Make real-time decisions', 'Trust your training', 'Be patient OR aggressive', 'Read the situation'],
            ['Practice jump timing', 'Don\'t commit early', 'Stay legal', 'Build confidence'],
            ['Look for erne opportunities', 'Surprise opponents', 'Execute cleanly', 'Don\'t overuse'],
            ['Dinking only, no speedups', 'Pure patience battle', 'First to crack loses', 'Mental game'],
            ['Create your own patterns', 'Mix it up constantly', 'Keep opponents guessing', 'Stay creative'],
            ['Full competition mode', 'Execute everything learned', 'Trust your training', 'Dominate the kitchen']
          ][i]
        }
      ],
      practice_goals: [
        [
          'Complete 20+ consecutive dinks',
          'Maintain soft touch throughout',
          'Feel comfortable at kitchen line'
        ],
        [
          'Achieve 50+ consecutive cross-court dinks',
          'Master cross-court angle and depth',
          'Build consistency confidence'
        ],
        [
          'Hit 80% of straight dinks to target',
          'Control direction precisely',
          'Vary depth intentionally'
        ],
        [
          'Smoothly change directions 40+ times',
          'No errors during transitions',
          'Keep opponents off balance'
        ],
        [
          'Add visible spin to 60% of dinks',
          'Vary pace effectively',
          'Create different ball behaviors'
        ],
        [
          'Create 25+ attackable balls on purpose',
          'Recognize setup opportunities',
          'Partner successfully attacks 70%+'
        ],
        [
          'Identify 90% of attackable balls',
          'Make correct attack decisions',
          'Improve shot selection'
        ],
        [
          'Move efficiently without faults',
          'Cover entire kitchen line',
          'Maintain balance and readiness'
        ],
        [
          'Execute 10+ successful ernes',
          'Perfect timing on attempts',
          'Add to match arsenal'
        ],
        [
          'Complete 75+ consecutive dink rally',
          'Maintain patience throughout',
          'Build mental endurance'
        ],
        [
          'Execute 5 different patterns',
          'Apply in live points',
          'Keep opponents guessing'
        ],
        [
          'Win 60%+ of dink battles',
          'Apply all skills in competition',
          'Demonstrate mastery'
        ]
      ][i],
      success_metrics: [
        ['20+ consecutive dinks', '85% consistency', 'Comfortable positioning'],
        ['50+ consecutive cross-court', '90% landing in kitchen', 'Rhythmic rally'],
        ['80% straight dink accuracy', 'Controlled direction', 'Varied depth'],
        ['40+ smooth direction changes', 'Zero transition errors', 'Balanced throughout'],
        ['60% with visible spin', 'Pace variation mastered', 'Opponents challenged'],
        ['25+ attackable balls created', '70% partner attack success', 'Strategic setups'],
        ['90% attack recognition accuracy', 'Correct decisions made', 'Improved IQ'],
        ['Zero kitchen faults', 'Full line coverage', 'Efficient movement'],
        ['10+ successful ernes', 'Perfect timing', 'Match-ready execution'],
        ['75+ consecutive rally', 'Mental patience proven', 'Outlasted opponent'],
        ['5 patterns executed', 'Applied in points', 'Strategic variety'],
        ['60% dink battle win rate', 'All skills integrated', 'Championship level']
      ][i],
      cooldown: [
        'Wrist and forearm stretches',
        'Shoulder stretches',
        'Light walking (5 minutes)',
        'Mental review of progress'
      ],
      coach_notes: [
        'Dinking is the foundation of advanced play. Master the basics before moving to complexity!',
        'The cross-court dink is your safest and most effective weapon. Perfect it!',
        'Straight dinks create pressure but are riskier. Use strategically!',
        'Changing directions keeps opponents off balance. Master this skill!',
        'Pace and spin variation makes you unpredictable and harder to read!',
        'The best attackers are also the best setup players. Create opportunities!',
        'Knowing WHEN to attack is more important than HOW to attack!',
        'Great footwork prevents kitchen faults and improves positioning!',
        'The erne is a surprise weapon. Don\'t overuse it, but have it ready!',
        'Patience wins dink battles. The player who waits longest usually wins!',
        'Patterns create rhythm but also predictability. Know when to break them!',
        'Congratulations! You\'ve mastered advanced dinking. This skill will win you matches!'
      ][i],
      estimated_minutes: 40 + (i % 3) * 5,
      difficulty_level: 4 + Math.floor(i / 4)
    }))
  }
}
