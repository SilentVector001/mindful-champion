// @ts-nocheck
/**
 * SPIN & POWER MECHANICS - Complete 14-Day Advanced Training Program
 * Master professional-level spin and power generation
 */

export const spinPowerProgram = {
  programId: 'advanced-spin-control',
  name: 'Spin & Power Mechanics',
  tagline: 'Add professional-level spin to every shot',
  description: 'Master the art of spin and power like professional players. This 14-day advanced program teaches you to generate topspin on drives, backspin drops, and sidespin for deception. You\'ll learn the physics of spin, paddle mechanics, and how to read and counter opponent spin — skills that separate advanced players from intermediates.',
  durationDays: 14,
  skillLevel: 'ADVANCED',
  estimatedTimePerDay: '50-60 minutes',
  whyThisMatters: 'Spin changes everything. It makes your drops stay low, your drives dip at opponents\' feet, and your serves unpredictable. Pros use spin on nearly every shot — this program unlocks that same advantage for you.',
  nextProgram: 'Tournament Preparation',
  keyOutcomes: [
    'Generate heavy topspin on drives and speedups',
    'Execute backspin drops and dinks with control',
    'Add sidespin for deception and difficult bounces',
    'Counter opponent spin effectively with adjustments',
    'Combine spin with power for elite-level shots'
  ],
  dailyStructure: {
    days: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${[
        'Spin Fundamentals & Mechanics',
        'Topspin Forehand Drives',
        'Topspin Backhand Drives',
        'Backspin Drop Shots',
        'Backspin Dinks',
        'Sidespin Serves',
        'Sidespin Groundstrokes',
        'Power Generation Basics',
        'Combining Spin & Power',
        'Countering Topspin',
        'Countering Backspin',
        'Advanced Spin Patterns',
        'Match Speed Integration',
        'Spin Mastery Assessment'
      ][i]}`,
      focus: [
        'Understanding spin physics and paddle mechanics',
        'Generating heavy topspin on forehand',
        'Creating topspin on backhand side',
        'Mastering backspin on drops',
        'Adding backspin to dinks',
        'Developing spin serves',
        'Using sidespin on groundstrokes',
        'Maximizing power through technique',
        'Power with spin control',
        'Defending against topspin',
        'Handling backspin effectively',
        'Complex spin combinations',
        'Game-speed spin execution',
        'Demonstrating all spin skills'
      ][i],
      description: [
        'Learn the physics of spin and how paddle angle, speed, and contact point create different spins.',
        'Master topspin forehand drives that dip and stay low after bounce.',
        'Develop topspin backhand drives for offensive and defensive situations.',
        'Create backspin drops that stay low and are difficult to attack.',
        'Add backspin to dinks for better control and lower bounces.',
        'Develop serves with sidespin that curve and create awkward returns.',
        'Use sidespin on groundstrokes to create deception and difficult angles.',
        'Learn to generate maximum power through kinetic chain and rotation.',
        'Combine spin with power for unstoppable drives and attacks.',
        'Read and counter opponent topspin with proper adjustments.',
        'Handle backspin effectively with correct paddle angle and technique.',
        'Practice advanced spin patterns and combinations that confuse opponents.',
        'Integrate all spin skills at match speed in competitive play.',
        'Final assessment - demonstrate mastery of all spin techniques in competition.'
      ][i],
      duration_minutes: 50 + (i % 4) * 5,
      videoUrl: `https://www.youtube.com/watch?v=${['0k8bUlkjHMo', 'mAKQtndtp5s', 'D6e5EW7ze48', 'vdqy8C0oH-Q', 'SiifS1MLrjg', 'rHTyvjtZT84', '3snvZGTsT9E', 'rD1O3R9B0Sw', '2Vk-c8TdC28', 'P06TNWpWU9k', 'OxNnewWzUC4', 'aiy9c8uR374', 'nXzfAQki67E', '1Nhnz8brZRA'][i]}`,
      videoTitle: [
        'Understanding Spin in Pickleball',
        'Topspin Forehand Technique',
        'Topspin Backhand Mastery',
        'Backspin Drop Shot Technique',
        'Backspin Dinking Strategy',
        'Spin Serve Techniques',
        'Sidespin Groundstroke Guide',
        'Power Generation Mechanics',
        'Spin + Power Combination',
        'Countering Topspin',
        'Handling Backspin Shots',
        'Advanced Spin Patterns',
        'Pro-Level Spin Play',
        'Spin Mastery Showcase'
      ][i],
      warmup: {
        title: 'Spin Training Warm-up',
        exercises: [
          '8-10 minutes cardio and dynamic stretching',
          'Wrist flexibility and strengthening',
          'Forearm activation exercises',
          'Shoulder rotation drills',
          'Core rotation practice',
          'Shadow swings with spin emphasis'
        ],
        duration_minutes: 12 + (i % 3)
      },
      main_drills: [
        {
          name: `Primary Spin Drill - Day ${i + 1}`,
          description: [
            'Practice brushing technique on all shots. Focus on paddle path for spin generation.',
            'Fed ball topspin forehands. Brush up and forward on contact.',
            'Fed ball topspin backhands. Generate spin with full rotation.',
            'Baseline drop shots with backspin. Slice under ball at contact.',
            'Dinking with backspin from kitchen line. Create low, controlled bounces.',
            'Serve practice with sidespin. Brush across ball for curve.',
            'Groundstrokes with sidespin. Create deceptive angles and bounces.',
            'Power drives using legs and core. Maximum speed generation.',
            'Heavy topspin drives with power. Combine rotation with speed.',
            'Return topspin shots. Adjust paddle angle and firm up contact.',
            'Return backspin shots. Open paddle face and lift through contact.',
            'Complex patterns: topspin-backspin-sidespin sequences.',
            'Live match play emphasizing spin on every shot.',
            'Tournament simulation with spin variety throughout.'
          ][i],
          duration_minutes: 22 + (i % 3) * 2,
          reps_or_sets: [
            '60 brush practice shots',
            '5 sets of 15 topspin forehands',
            '5 sets of 15 topspin backhands',
            '60 backspin drops',
            '5 sets of 20 backspin dinks',
            '80 sidespin serves',
            '60 sidespin groundstrokes',
            '5 sets of 12 power drives',
            '60 power + spin drives',
            '50 topspin returns',
            '50 backspin returns',
            '40 pattern sequences',
            '4 competitive games',
            '5 tournament-style games'
          ][i],
          tips: [
            ['Watch contact point closely', 'Feel the brush on ball', 'Paddle speed creates spin', 'Start slow, add speed gradually'],
            ['Brush up back of ball', 'Low to high swing path', 'Follow through high', 'Ball should dip quickly'],
            ['Rotate shoulders fully', 'Brush up on contact', 'Use two hands if needed', 'Generate from core'],
            ['Open paddle face', 'Slice under ball', 'High to low follow through', 'Create backspin rotation'],
            ['Gentle slice motion', 'Minimal paddle movement', 'Backspin keeps ball low', 'Control over power'],
            ['Brush across ball', 'Outside to inside motion', 'Ball curves after bounce', 'Vary amount of spin'],
            ['Disguise sidespin well', 'Normal setup, spin at contact', 'Creates unexpected bounces', 'Use strategically'],
            ['Power from legs and core', 'Not just arm strength', 'Full body rotation', 'Kinetic chain sequence'],
            ['Heavy brush with full power', 'Speed + spin = unstoppable', 'Dips fast, stays low', 'Offensive weapon'],
            ['Close paddle face slightly', 'Firm contact', 'Counter spin with spin', 'Stay balanced'],
            ['Open paddle face more', 'Lift ball up', 'Absorb and redirect', 'Patient contact'],
            ['Mix spins unpredictably', 'Read opponent reactions', 'Create confusion', 'Advanced tactics'],
            ['Full speed execution', 'Spin on every appropriate shot', 'Strategic variety', 'Trust your training'],
            ['Demonstrate all spins', 'Win with spin mastery', 'Showcase improvement', 'Compete with confidence']
          ][i]
        },
        {
          name: `Secondary Drill - Day ${i + 1}`,
          description: [
            'Spin recognition drill. Partner hits various spins, you identify them.',
            'Topspin rally challenge. Keep topspin rally going with partner.',
            'Backhand topspin consistency drill.',
            'Backspin drop accuracy drill with targets.',
            'Backspin dink rally. Both players use backspin.',
            'Sidespin serve target practice.',
            'Combination shots: sidespin + topspin or backspin.',
            'Power measurement drill. Track shot speed.',
            'Power + spin on speedups from kitchen line.',
            'Topspin defense games. Opponent hits heavy topspin.',
            'Backspin challenge points. Opponent uses backspin frequently.',
            'Spin variation games. Must use different spin each shot.',
            'Pressure spin execution. High-stakes scenarios.',
            'Final championship matches. Full skill demonstration.'
          ][i],
          duration_minutes: 15 + (i % 3) * 2,
          reps_or_sets: [
            '40 spin identification attempts',
            '3 attempts at 30+ rally',
            '60 backhand topspin shots',
            '50 accuracy drops to targets',
            '4 rallies of 25+ backspin dinks',
            '50 serves to specific targets',
            '40 combination shots',
            '30 maximum power drives',
            '40 power speedups',
            '25 topspin defense points',
            '25 backspin challenge points',
            '20 spin variation points',
            '30 pressure scenarios',
            '4-5 championship games'
          ][i],
          tips: [
            ['Watch paddle and ball rotation', 'Anticipate bounce', 'Call it out', 'Build recognition speed'],
            ['Consistent brushing motion', 'Keep rally alive', 'Celebrate high numbers', 'Build endurance'],
            ['Focus on mechanics', 'Generate from core', 'Consistent results', 'Build confidence'],
            ['Precision backspin drops', 'Hit targets consistently', 'Low soft bounces', 'Track success rate'],
            ['Both use backspin', 'Ultra-low bounces', 'Tests soft hands', 'Patience battle'],
            ['Curve into targets', 'Vary spin amount', 'Create difficult returns', 'Build accuracy'],
            ['Advanced spin mixing', 'Deception factor high', 'Difficult to read', 'Strategic application'],
            ['Full power generation', 'Measure if possible', 'Track improvement', 'Build confidence'],
            ['Explosive spin speedups', 'From dinking position', 'Put away shots', 'High win percentage'],
            ['Defend vs heavy topspin', 'Stay low and balanced', 'Counter effectively', 'Win points'],
            ['Handle backspin variety', 'Proper adjustments', 'Turn defense to offense', 'Smart play'],
            ['Forced variety', 'Never same spin twice in row', 'Keeps sharp', 'Strategic thinking'],
            ['Execute under pressure', 'Big points require spin', 'Trust your skill', 'Mental toughness'],
            ['Full demonstration', 'All spins in competition', 'Play your best', 'Celebrate mastery']
          ][i]
        }
      ],
      practice_goals: [
        [
          'Identify all spin types consistently',
          'Understand spin mechanics',
          'Generate basic spin on contact'
        ],
        [
          'Create visible topspin on 80% of forehands',
          'Ball dips noticeably',
          'Consistent spin generation'
        ],
        [
          'Generate topspin on 70% of backhands',
          'Confident backhand spin',
          'Offensive backhand weapon'
        ],
        [
          'Execute backspin drops with 60% success',
          'Visible backspin on ball',
          'Low controlled bounces'
        ],
        [
          'Add backspin to 70% of dinks',
          'Ultra-low bounces',
          'Better dink control'
        ],
        [
          'Sidespin serves curve visibly',
          '70% success rate',
          'Awkward returns created'
        ],
        [
          'Execute sidespin groundstrokes',
          'Create deceptive bounces',
          'Strategic sidespin usage'
        ],
        [
          'Generate maximum power consistently',
          'Understand kinetic chain',
          'Powerful drives without sacrificing control'
        ],
        [
          'Combine spin + power on 70% of drives',
          'Unstoppable offensive shots',
          'Mastery of combination'
        ],
        [
          'Counter topspin effectively 80% of time',
          'Proper adjustments automatic',
          'Turn defense to offense'
        ],
        [
          'Handle backspin confidently',
          'Correct adjustments every time',
          'No difficulty with backspin'
        ],
        [
          'Execute 5+ different spin patterns',
          'Keep opponents guessing',
          'Strategic spin mixing'
        ],
        [
          'Use appropriate spin at match speed',
          'Strategic spin selection',
          'Compete effectively'
        ],
        [
          'Demonstrate all spin types in competition',
          'Win using spin advantage',
          'Mastery showcased'
        ]
      ][i],
      success_metrics: [
        ['100% spin identification', 'Clear understanding of mechanics', 'Basic spin generation'],
        ['80% topspin generation', 'Visible ball dip', 'Confident execution'],
        ['70% backhand topspin', 'Offensive capability', 'Strategic weapon'],
        ['60% backspin drop success', 'Visible spin', 'Controlled bounce'],
        ['70% backspin dinks', 'Low bounce maintained', 'Excellent control'],
        ['70% sidespin serve success', 'Visible curve', 'Return difficulty created'],
        ['Sidespin executed on demand', 'Deception achieved', 'Strategic use'],
        ['Maximum power generated', 'Technique-based', 'Consistent results'],
        ['70% power+spin combo', 'Elite-level shots', 'Offensive dominance'],
        ['80% topspin counter success', 'Automatic adjustments', 'Confidence high'],
        ['100% backspin handling', 'Zero difficulty', 'Mastered adjustments'],
        ['Multiple patterns executed', 'Unpredictable play', 'Opponents confused'],
        ['Match-ready spin skills', 'Strategic execution', 'Competitive advantage'],
        ['Complete mastery demonstrated', 'Win with spin', 'Elite level achieved']
      ][i],
      cooldown: [
        'Wrist and forearm stretches - extra time',
        'Shoulder and rotator cuff stretches',
        'Core and lower back stretches',
        'Ice wrists if needed (preventive)',
        '5-minute recovery walk',
        'Mental review and visualization'
      ],
      coach_notes: [
        'Spin is created by paddle speed and angle at contact. Master the feel before adding power!',
        'Topspin forehands are your offensive weapon. Heavy spin makes balls dip and stay low!',
        'Backhand topspin is harder but equally important. Practice builds confidence!',
        'Backspin drops are the key to elite third shots. Low bounces are unattackable!',
        'Backspin dinks give you ultimate control. The ball stays ultra-low!',
        'Sidespin serves create awkward returns. Great addition to your serve arsenal!',
        'Sidespin is your deception tool. Use sparingly for maximum effect!',
        'Power comes from legs and core, not arms. Learn the kinetic chain!',
        'Combining spin with power creates unstoppable shots. This is elite-level pickleball!',
        'Countering topspin requires closed paddle face and firm contact. Redirect the spin!',
        'Handling backspin means opening your paddle and lifting. Don\'t fight it, use it!',
        'Advanced patterns keep opponents guessing and unable to settle into rhythm!',
        'At match speed, spin becomes automatic. Trust your training and execute!',
        'Congratulations! You\'ve mastered professional-level spin mechanics. This skill separates you from 95% of players. Use your spin mastery to dominate!'
      ][i],
      estimated_minutes: 50 + (i % 4) * 5,
      difficulty_level: 6 + Math.floor(i / 5)
    }))
  }
}
