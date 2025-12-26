import { PrismaClient, SkillLevel } from '@prisma/client'

const prisma = new PrismaClient()

// Training Video Data
const trainingVideos = [
  // Beginner Level Videos
  {
    videoId: 'vid_bgn_001',
    title: 'Pickleball Grip Fundamentals - Master Your Hold',
    url: 'https://www.youtube.com/watch?v=8GBqCSyGa6k',
    channel: 'Pickleball Kitchen',
    duration: '8:42',
    description: 'Learn the proper pickleball grip for maximum control and power. Essential foundation for all shots.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Grip',
    secondaryTopics: ['Fundamentals', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/2Vk-c8TdC28/maxresdefault.jpg',
  },
  {
    videoId: 'vid_bgn_002',
    title: 'Perfect Pickleball Stance and Ready Position',
    url: 'https://www.youtube.com/watch?v=vGnxT4v6ZW4',
    channel: 'Better Pickleball',
    duration: '6:15',
    description: 'Master the athletic stance and ready position essential for quick reactions and movement.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Stance',
    secondaryTopics: ['Fundamentals', 'Positioning'],
    thumbnailUrl: 'https://i.ytimg.com/vi/7Bx9BXLurfQ/maxresdefault.jpg',
  },
  {
    videoId: 'vid_bgn_003',
    title: 'Forehand Basics for Beginners',
    url: 'https://www.youtube.com/watch?v=F8Vq9O-z7rI',
    channel: 'Pickleball 411',
    duration: '10:30',
    description: 'Step-by-step guide to developing a consistent and powerful forehand groundstroke.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Forehand',
    secondaryTopics: ['Groundstrokes', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/W0HtQpOPtfo/maxresdefault.jpg',
  },
  {
    videoId: 'vid_bgn_004',
    title: 'Backhand Technique Made Easy',
    url: 'https://www.youtube.com/watch?v=qPKKtvkVAjY',
    channel: 'Third Shot Sports',
    duration: '9:45',
    description: 'Build a solid backhand foundation with proper technique and practice drills.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Backhand',
    secondaryTopics: ['Groundstrokes', 'Technique'],
    thumbnailUrl: 'https://img.youtube.com/vi/qPKKtvkVAjY/maxresdefault.jpg',
  },
  {
    videoId: 'vid_bgn_005',
    title: 'Serving Fundamentals - Power and Placement',
    url: 'https://www.youtube.com/watch?v=zW8NKC6xh8I',
    channel: 'PrimeTime Pickleball',
    duration: '12:20',
    description: 'Master the basic serve with proper form, power generation, and strategic placement.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Serve',
    secondaryTopics: ['Fundamentals', 'Strategy'],
    thumbnailUrl: 'https://i.ytimg.com/vi/1R5ZtbGcS5Q/sddefault.jpg',
  },
  {
    videoId: 'vid_bgn_006',
    title: 'Dinking 101 - Soft Game Introduction',
    url: 'https://www.youtube.com/watch?v=E8oUZQE0I4s',
    channel: 'Engage Pickleball',
    duration: '11:15',
    description: 'Learn the art of the dink shot - the most important shot in pickleball for beginners.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Dinking',
    secondaryTopics: ['Soft Game', 'Kitchen Play'],
    thumbnailUrl: 'https://i.ytimg.com/vi/gUWqaikgoz8/mqdefault.jpg',
  },
  {
    videoId: 'vid_bgn_007',
    title: 'Court Positioning for Beginners',
    url: 'https://www.youtube.com/watch?v=t9nz9T4CxcI',
    channel: 'Sarah Ansboury Pickleball',
    duration: '8:50',
    description: 'Understand where to stand and how to move on the court for optimal positioning.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Positioning',
    secondaryTopics: ['Strategy', 'Fundamentals'],
    thumbnailUrl: 'https://i.ytimg.com/vi/5R60Y17nUt8/hqdefault.jpg',
  },
  {
    videoId: 'vid_bgn_008',
    title: 'Pickleball Rules and Scoring Explained',
    url: 'https://www.youtube.com/watch?v=Q0spGP7UKYA',
    channel: 'Pickleball Kitchen',
    duration: '7:30',
    description: 'Complete guide to pickleball rules, scoring, and common situations beginners face.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Rules',
    secondaryTopics: ['Fundamentals', 'Scoring'],
    thumbnailUrl: 'https://i.ytimg.com/vi/pU_wzWOzGoY/sddefault.jpg',
  },
  {
    videoId: 'vid_bgn_009',
    title: 'Volley Basics - Control at the Net',
    url: 'https://www.youtube.com/watch?v=mKPVq8p30J0',
    channel: 'Better Pickleball',
    duration: '9:25',
    description: 'Learn proper volley technique for controlling the net and finishing points.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Volley',
    secondaryTopics: ['Net Play', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/9hYu1As6rEs/maxresdefault.jpg',
  },
  {
    videoId: 'vid_bgn_010',
    title: 'Footwork Fundamentals for Court Coverage',
    url: 'https://www.youtube.com/watch?v=8VfE7pQKxQ8',
    channel: 'Pickleball 411',
    duration: '10:05',
    description: 'Essential footwork patterns and movements for efficient court coverage.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Footwork',
    secondaryTopics: ['Movement', 'Agility'],
    thumbnailUrl: 'https://i.ytimg.com/vi/RcemI7PqeYw/sddefault.jpg',
  },

  // Intermediate Level Videos
  {
    videoId: 'vid_int_001',
    title: 'Third Shot Drop Mastery',
    url: 'https://www.youtube.com/watch?v=GJHJzU7DRww',
    channel: 'Third Shot Sports',
    duration: '13:45',
    description: 'Master the most important shot in pickleball - the third shot drop with advanced techniques.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Third Shot',
    secondaryTopics: ['Strategy', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/4FEuHE2xzZY/maxresdefault.jpg',
  },
  {
    videoId: 'vid_int_002',
    title: 'Advanced Dinking Strategies',
    url: 'https://www.youtube.com/watch?v=K5OZIIlX3Sk',
    channel: 'PrimeTime Pickleball',
    duration: '11:30',
    description: 'Take your dinking to the next level with strategic placement and spin variations.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Dinking',
    secondaryTopics: ['Strategy', 'Spin'],
    thumbnailUrl: 'https://i.ytimg.com/vi/T4oMh5xo8Kg/mqdefault.jpg',
  },
  {
    videoId: 'vid_int_003',
    title: 'Powerful Drive Shots for Offensive Play',
    url: 'https://www.youtube.com/watch?v=7rCfVS5QUqE',
    channel: 'Engage Pickleball',
    duration: '10:15',
    description: 'Learn when and how to use aggressive drive shots to put pressure on opponents.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Drives',
    secondaryTopics: ['Offense', 'Power'],
    thumbnailUrl: 'https://i.ytimg.com/vi/CNcLTTnYRtc/mqdefault.jpg',
  },
  {
    videoId: 'vid_int_004',
    title: 'Doubles Positioning and Movement',
    url: 'https://www.youtube.com/watch?v=Pk9bsE3WKGk',
    channel: 'Sarah Ansboury Pickleball',
    duration: '12:50',
    description: 'Advanced positioning concepts for doubles play - stay in sync with your partner.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Positioning',
    secondaryTopics: ['Doubles', 'Strategy'],
    thumbnailUrl: 'https://i.ytimg.com/vi/6ijn2dyqNps/sddefault.jpg',
  },
  {
    videoId: 'vid_int_005',
    title: 'Return of Serve Tactics',
    url: 'https://www.youtube.com/watch?v=YnM7EEqQG7U',
    channel: 'Pickleball Kitchen',
    duration: '9:40',
    description: 'Strategic return options that put you in control of the point from shot two.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Return',
    secondaryTopics: ['Strategy', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/zvzw_V5eZ74/maxresdefault.jpg',
  },
  {
    videoId: 'vid_int_006',
    title: 'Attacking the Middle in Doubles',
    url: 'https://www.youtube.com/watch?v=wFYDE5dCn_U',
    channel: 'Better Pickleball',
    duration: '8:55',
    description: 'Learn why attacking the middle is effective and how to do it properly.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Doubles', 'Offense'],
    thumbnailUrl: 'https://i.ytimg.com/vi/zMT9UWY7fho/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD5x6wt8tX4C7FnYTjRJR-tDta6Qw',
  },
  {
    videoId: 'vid_int_007',
    title: 'Transition Zone Mastery',
    url: 'https://www.youtube.com/watch?v=6tKJMIXQvSo',
    channel: 'Pickleball 411',
    duration: '11:20',
    description: 'Master the dangerous transition zone and move to the kitchen line safely.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Transition',
    secondaryTopics: ['Movement', 'Positioning'],
    thumbnailUrl: 'https://i.ytimg.com/vi/TGo_QJT2oPM/maxresdefault.jpg',
  },
  {
    videoId: 'vid_int_008',
    title: 'Lob Shots and Overhead Smashes',
    url: 'https://www.youtube.com/watch?v=Kn4r-7qwPOE',
    channel: 'Third Shot Sports',
    duration: '10:35',
    description: 'When to use lobs offensively and how to put away overhead smashes.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Lobs',
    secondaryTopics: ['Overhead', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/PdM6cmb3ef4/sddefault.jpg',
  },
  {
    videoId: 'vid_int_009',
    title: 'Stack Formation Strategy',
    url: 'https://www.youtube.com/watch?v=L0A_aq5CQGQ',
    channel: 'PrimeTime Pickleball',
    duration: '12:10',
    description: 'Learn the stack formation to optimize court positioning in doubles.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Doubles', 'Formation'],
    thumbnailUrl: 'https://i.ytimg.com/vi/cazx9ix_WR4/maxresdefault.jpg',
  },
  {
    videoId: 'vid_int_010',
    title: 'Reading Your Opponents',
    url: 'https://www.youtube.com/watch?v=yF3mE9FJiYk',
    channel: 'Engage Pickleball',
    duration: '9:15',
    description: 'Develop court awareness and learn to anticipate opponent movements.',
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Mental Game', 'Awareness'],
    thumbnailUrl: 'https://i.ytimg.com/vi/Sh_amOjRlOM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBJr0_sjhsE6-DlnLJJ8ecEOZxxpQ',
  },

  // Advanced Level Videos
  {
    videoId: 'vid_adv_001',
    title: 'Topspin and Backspin Mastery',
    url: 'https://www.youtube.com/watch?v=q0M5vQMfqJw',
    channel: 'Sarah Ansboury Pickleball',
    duration: '14:30',
    description: 'Master spin shots to control pace and add unpredictability to your game.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Spin',
    secondaryTopics: ['Technique', 'Advanced'],
    thumbnailUrl: 'https://i.ytimg.com/vi/Z73EHUH88UA/sddefault.jpg',
  },
  {
    videoId: 'vid_adv_002',
    title: 'Erne and ATP Shots',
    url: 'https://www.youtube.com/watch?v=v3fNFGqDCJs',
    channel: 'Pickleball Kitchen',
    duration: '11:45',
    description: 'Learn these flashy yet effective shots that catch opponents off guard.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Advanced Shots',
    secondaryTopics: ['Erne', 'ATP'],
    thumbnailUrl: 'https://i.ytimg.com/vi/ns4Hdc6kPFQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCujk8VbA0Gj4R-5xiuRBY_5MqseQ',
  },
  {
    videoId: 'vid_adv_003',
    title: 'Advanced Serve Variations',
    url: 'https://www.youtube.com/watch?v=3GCwXmQJjIg',
    channel: 'Better Pickleball',
    duration: '13:20',
    description: 'Develop a serve arsenal with power, spin, and deceptive placement.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Serve',
    secondaryTopics: ['Spin', 'Strategy'],
    thumbnailUrl: 'https://i.ytimg.com/vi/XEXXjM8e2Rc/maxresdefault.jpg',
  },
  {
    videoId: 'vid_adv_004',
    title: 'Counter-Attack Strategies',
    url: 'https://www.youtube.com/watch?v=Jxn2FeBYLiU',
    channel: 'Pickleball 411',
    duration: '12:05',
    description: 'Turn defensive positions into offensive opportunities with counter-attacks.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Defense', 'Counter'],
    thumbnailUrl: 'https://i.ytimg.com/vi/-dEF0BiQOEw/maxresdefault.jpg',
  },
  {
    videoId: 'vid_adv_005',
    title: 'Tournament Mental Preparation',
    url: 'https://www.youtube.com/watch?v=fD8pz0vP9v4',
    channel: 'Third Shot Sports',
    duration: '10:50',
    description: 'Mental strategies for peak performance in tournament settings.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Mental Game',
    secondaryTopics: ['Tournament', 'Psychology'],
    thumbnailUrl: 'https://i.ytimg.com/vi/L8RzvL9ijQ8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA2IDbjt4RtOLTGuD2ROoIqKDC24A',
  },
  {
    videoId: 'vid_adv_006',
    title: 'Speed-Up Techniques',
    url: 'https://www.youtube.com/watch?v=kWPGaIH-3fM',
    channel: 'PrimeTime Pickleball',
    duration: '9:35',
    description: 'Master the speed-up shot to change pace and force errors.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Speed-Up',
    secondaryTopics: ['Offense', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/6n9oIJPl6NY/maxresdefault.jpg',
  },
  {
    videoId: 'vid_adv_007',
    title: 'Reset Shot Mastery',
    url: 'https://www.youtube.com/watch?v=Cg6xqB5eCvI',
    channel: 'Engage Pickleball',
    duration: '11:25',
    description: 'Learn to reset points under pressure and neutralize aggressive opponents.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Reset',
    secondaryTopics: ['Defense', 'Control'],
    thumbnailUrl: 'https://i.ytimg.com/vi/eFw06lH2wj0/maxresdefault.jpg',
  },
  {
    videoId: 'vid_adv_008',
    title: 'Wind and Outdoor Strategies',
    url: 'https://www.youtube.com/watch?v=A8h8Q9fYsJw',
    channel: 'Sarah Ansboury Pickleball',
    duration: '8:40',
    description: 'Adapt your game for outdoor conditions and challenging weather.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Outdoor', 'Adaptation'],
    thumbnailUrl: 'https://i.ytimg.com/vi/sqdkNwAqbUs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBGtOqEjInf-ZlIjFIm_HBuYw5sNA',
  },
  {
    videoId: 'vid_adv_009',
    title: 'Pattern Play and Point Construction',
    url: 'https://www.youtube.com/watch?v=NRyGRPmKMrI',
    channel: 'Pickleball Kitchen',
    duration: '13:55',
    description: 'Build points strategically with pattern-based play and tactical awareness.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Strategy',
    secondaryTopics: ['Tactics', 'Patterns'],
    thumbnailUrl: 'https://i.ytimg.com/vi/Subadzlr2lA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCbu6wLRok3HJHwGhN9p1Eu0dYrsg',
  },
  {
    videoId: 'vid_adv_010',
    title: 'Performance Analysis and Self-Coaching',
    url: 'https://www.youtube.com/watch?v=qY6zMkD3JGY',
    channel: 'Better Pickleball',
    duration: '12:30',
    description: 'Learn to analyze your game and identify areas for improvement.',
    skillLevel: 'ADVANCED' as SkillLevel,
    primaryTopic: 'Analysis',
    secondaryTopics: ['Self-Coaching', 'Improvement'],
    thumbnailUrl: 'https://i.ytimg.com/vi/ispqGesTuQg/maxresdefault.jpg',
  },

  // Senior-Friendly Videos
  {
    videoId: 'vid_snr_001',
    title: 'Low-Impact Pickleball for Seniors',
    url: 'https://www.youtube.com/watch?v=pB7K9yNzJ_Q',
    channel: 'Pickleball 411',
    duration: '10:20',
    description: 'Joint-friendly techniques and movement patterns for senior players.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Senior Play',
    secondaryTopics: ['Safety', 'Technique'],
    thumbnailUrl: 'https://i.ytimg.com/vi/j5R90KP5FVw/sddefault.jpg',
  },
  {
    videoId: 'vid_snr_002',
    title: 'Pickleball Warm-Up for 55+',
    url: 'https://www.youtube.com/watch?v=8k7U9YVFxQw',
    channel: 'Third Shot Sports',
    duration: '8:15',
    description: 'Essential warm-up routine to prevent injuries and improve performance.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Warm-Up',
    secondaryTopics: ['Safety', 'Injury Prevention'],
    thumbnailUrl: 'https://i.ytimg.com/vi/OcPs3x1vX1A/hqdefault.jpg',
  },
  {
    videoId: 'vid_snr_003',
    title: 'Smart Court Positioning for Senior Players',
    url: 'https://www.youtube.com/watch?v=HJXz3mVnN9U',
    channel: 'PrimeTime Pickleball',
    duration: '9:30',
    description: 'Efficient positioning that minimizes court coverage and maximizes effectiveness.',
    skillLevel: 'BEGINNER' as SkillLevel,
    primaryTopic: 'Positioning',
    secondaryTopics: ['Strategy', 'Efficiency'],
    thumbnailUrl: 'https://i.ytimg.com/vi/blLyXRrmZuo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCuihQyHToj1MTDgvAkY0-P99hJJA',
  },
]

// Training Programs Data
const trainingProgramsData = [
  {
    programId: 'prog_bgn_fundamentals',
    name: 'Beginner Fundamentals',
    tagline: 'Master the basics and build a solid foundation',
    description: 'A comprehensive 30-day program designed for complete beginners. Learn proper technique, rules, and fundamental strategies to start your pickleball journey with confidence.',
    durationDays: 30,
    skillLevel: 'BEGINNER' as SkillLevel,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: [
      'Master proper grip and stance',
      'Develop consistent groundstrokes',
      'Learn serving fundamentals',
      'Understand court positioning',
      'Know all rules and scoring',
    ],
    dailyStructure: {
      days_1_5: 'Grip, stance, and ready position',
      days_6_10: 'Forehand and backhand basics',
      days_11_15: 'Serving fundamentals',
      days_16_20: 'Dinking introduction',
      days_21_25: 'Court positioning and movement',
      days_26_30: 'Rules, scoring, and game play',
    },
    videos: [
      // Days 1-5: Grip and Stance
      { videoId: 'vid_bgn_001', day: 1, order: 1 },
      { videoId: 'vid_bgn_002', day: 2, order: 1 },
      { videoId: 'vid_bgn_010', day: 3, order: 1 },
      { videoId: 'vid_bgn_001', day: 4, order: 1 },
      { videoId: 'vid_bgn_002', day: 5, order: 1 },
      // Days 6-10: Groundstrokes
      { videoId: 'vid_bgn_003', day: 6, order: 1 },
      { videoId: 'vid_bgn_004', day: 7, order: 1 },
      { videoId: 'vid_bgn_003', day: 8, order: 1 },
      { videoId: 'vid_bgn_004', day: 9, order: 1 },
      { videoId: 'vid_bgn_009', day: 10, order: 1 },
      // Days 11-15: Serving
      { videoId: 'vid_bgn_005', day: 11, order: 1 },
      { videoId: 'vid_bgn_005', day: 12, order: 1 },
      { videoId: 'vid_bgn_005', day: 13, order: 1 },
      { videoId: 'vid_int_005', day: 14, order: 1 },
      { videoId: 'vid_int_005', day: 15, order: 1 },
      // Days 16-20: Dinking
      { videoId: 'vid_bgn_006', day: 16, order: 1 },
      { videoId: 'vid_bgn_006', day: 17, order: 1 },
      { videoId: 'vid_bgn_006', day: 18, order: 1 },
      { videoId: 'vid_int_002', day: 19, order: 1 },
      { videoId: 'vid_int_002', day: 20, order: 1 },
      // Days 21-25: Positioning
      { videoId: 'vid_bgn_007', day: 21, order: 1 },
      { videoId: 'vid_bgn_007', day: 22, order: 1 },
      { videoId: 'vid_int_007', day: 23, order: 1 },
      { videoId: 'vid_int_004', day: 24, order: 1 },
      { videoId: 'vid_int_004', day: 25, order: 1 },
      // Days 26-30: Rules and Game Play
      { videoId: 'vid_bgn_008', day: 26, order: 1 },
      { videoId: 'vid_bgn_008', day: 27, order: 1 },
      { videoId: 'vid_int_010', day: 28, order: 1 },
      { videoId: 'vid_int_006', day: 29, order: 1 },
      { videoId: 'vid_bgn_008', day: 30, order: 1 },
    ],
  },
  {
    programId: 'prog_int_skills',
    name: 'Intermediate Skills',
    tagline: 'Elevate your game with advanced techniques',
    description: 'A 30-day program for intermediate players ready to refine their skills. Master the third shot drop, advanced dinking, and strategic positioning to compete at higher levels.',
    durationDays: 30,
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    estimatedTimePerDay: '20-25 minutes',
    keyOutcomes: [
      'Master third shot drop',
      'Develop advanced dinking skills',
      'Perfect volleys and drives',
      'Advanced court positioning',
      'Strategic match play',
    ],
    dailyStructure: {
      days_1_6: 'Third shot drop mastery',
      days_7_12: 'Dinking excellence',
      days_13_18: 'Volleys and drives',
      days_19_24: 'Court positioning advanced',
      days_25_30: 'Match strategies',
    },
    videos: [
      // Days 1-6: Third Shot Drop
      { videoId: 'vid_int_001', day: 1, order: 1 },
      { videoId: 'vid_int_001', day: 2, order: 1 },
      { videoId: 'vid_int_001', day: 3, order: 1 },
      { videoId: 'vid_int_007', day: 4, order: 1 },
      { videoId: 'vid_int_007', day: 5, order: 1 },
      { videoId: 'vid_int_001', day: 6, order: 1 },
      // Days 7-12: Dinking
      { videoId: 'vid_int_002', day: 7, order: 1 },
      { videoId: 'vid_int_002', day: 8, order: 1 },
      { videoId: 'vid_int_002', day: 9, order: 1 },
      { videoId: 'vid_adv_007', day: 10, order: 1 },
      { videoId: 'vid_adv_007', day: 11, order: 1 },
      { videoId: 'vid_int_002', day: 12, order: 1 },
      // Days 13-18: Volleys and Drives
      { videoId: 'vid_bgn_009', day: 13, order: 1 },
      { videoId: 'vid_int_003', day: 14, order: 1 },
      { videoId: 'vid_int_003', day: 15, order: 1 },
      { videoId: 'vid_adv_006', day: 16, order: 1 },
      { videoId: 'vid_adv_006', day: 17, order: 1 },
      { videoId: 'vid_int_008', day: 18, order: 1 },
      // Days 19-24: Positioning
      { videoId: 'vid_int_004', day: 19, order: 1 },
      { videoId: 'vid_int_004', day: 20, order: 1 },
      { videoId: 'vid_int_009', day: 21, order: 1 },
      { videoId: 'vid_int_009', day: 22, order: 1 },
      { videoId: 'vid_int_007', day: 23, order: 1 },
      { videoId: 'vid_int_004', day: 24, order: 1 },
      // Days 25-30: Strategy
      { videoId: 'vid_int_010', day: 25, order: 1 },
      { videoId: 'vid_int_006', day: 26, order: 1 },
      { videoId: 'vid_int_010', day: 27, order: 1 },
      { videoId: 'vid_adv_004', day: 28, order: 1 },
      { videoId: 'vid_adv_009', day: 29, order: 1 },
      { videoId: 'vid_int_010', day: 30, order: 1 },
    ],
  },
  {
    programId: 'prog_adv_techniques',
    name: 'Advanced Techniques',
    tagline: 'Master pro-level shots and strategies',
    description: 'A 30-day advanced program for competitive players. Learn spin shots, advanced serves, Erne and ATP shots, and tournament-level strategies to dominate at the highest levels.',
    durationDays: 30,
    skillLevel: 'ADVANCED' as SkillLevel,
    estimatedTimePerDay: '25-30 minutes',
    keyOutcomes: [
      'Master spin variations',
      'Execute Erne and ATP shots',
      'Advanced serve arsenal',
      'Tournament preparation',
      'Mental game excellence',
    ],
    dailyStructure: {
      days_1_6: 'Spin shots (topspin, slice, sidespin)',
      days_7_12: 'Advanced serves and returns',
      days_13_18: 'Erne and ATP shots',
      days_19_24: 'Tournament strategies',
      days_25_30: 'Mental game and performance',
    },
    videos: [
      // Days 1-6: Spin Shots
      { videoId: 'vid_adv_001', day: 1, order: 1 },
      { videoId: 'vid_adv_001', day: 2, order: 1 },
      { videoId: 'vid_adv_001', day: 3, order: 1 },
      { videoId: 'vid_adv_006', day: 4, order: 1 },
      { videoId: 'vid_adv_006', day: 5, order: 1 },
      { videoId: 'vid_adv_001', day: 6, order: 1 },
      // Days 7-12: Advanced Serves
      { videoId: 'vid_adv_003', day: 7, order: 1 },
      { videoId: 'vid_adv_003', day: 8, order: 1 },
      { videoId: 'vid_adv_003', day: 9, order: 1 },
      { videoId: 'vid_int_005', day: 10, order: 1 },
      { videoId: 'vid_int_005', day: 11, order: 1 },
      { videoId: 'vid_adv_003', day: 12, order: 1 },
      // Days 13-18: Erne and ATP
      { videoId: 'vid_adv_002', day: 13, order: 1 },
      { videoId: 'vid_adv_002', day: 14, order: 1 },
      { videoId: 'vid_adv_002', day: 15, order: 1 },
      { videoId: 'vid_adv_007', day: 16, order: 1 },
      { videoId: 'vid_adv_007', day: 17, order: 1 },
      { videoId: 'vid_adv_002', day: 18, order: 1 },
      // Days 19-24: Tournament Strategies
      { videoId: 'vid_adv_009', day: 19, order: 1 },
      { videoId: 'vid_adv_009', day: 20, order: 1 },
      { videoId: 'vid_adv_004', day: 21, order: 1 },
      { videoId: 'vid_adv_004', day: 22, order: 1 },
      { videoId: 'vid_adv_008', day: 23, order: 1 },
      { videoId: 'vid_adv_009', day: 24, order: 1 },
      // Days 25-30: Mental Game
      { videoId: 'vid_adv_005', day: 25, order: 1 },
      { videoId: 'vid_adv_005', day: 26, order: 1 },
      { videoId: 'vid_adv_005', day: 27, order: 1 },
      { videoId: 'vid_adv_010', day: 28, order: 1 },
      { videoId: 'vid_adv_010', day: 29, order: 1 },
      { videoId: 'vid_adv_005', day: 30, order: 1 },
    ],
  },
  {
    programId: 'prog_serve_mastery',
    name: 'Serve & Return Mastery',
    tagline: 'Dominate with your serve and return',
    description: 'A focused 21-day program dedicated to mastering the serve and return. Develop a powerful serve arsenal and strategic return options to control every point from the start.',
    durationDays: 21,
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: [
      'Power serve technique',
      'Placement and spin serves',
      'Strategic return positioning',
      'Deep return consistency',
      'Serve and return patterns',
    ],
    dailyStructure: {
      days_1_7: 'Power serves and technique',
      days_8_14: 'Placement and spin serves',
      days_15_21: 'Return strategies and patterns',
    },
    videos: [
      // Days 1-7: Power Serves
      { videoId: 'vid_bgn_005', day: 1, order: 1 },
      { videoId: 'vid_bgn_005', day: 2, order: 1 },
      { videoId: 'vid_adv_003', day: 3, order: 1 },
      { videoId: 'vid_adv_003', day: 4, order: 1 },
      { videoId: 'vid_adv_003', day: 5, order: 1 },
      { videoId: 'vid_bgn_005', day: 6, order: 1 },
      { videoId: 'vid_adv_003', day: 7, order: 1 },
      // Days 8-14: Placement and Spin
      { videoId: 'vid_adv_003', day: 8, order: 1 },
      { videoId: 'vid_adv_001', day: 9, order: 1 },
      { videoId: 'vid_adv_001', day: 10, order: 1 },
      { videoId: 'vid_adv_003', day: 11, order: 1 },
      { videoId: 'vid_adv_001', day: 12, order: 1 },
      { videoId: 'vid_adv_003', day: 13, order: 1 },
      { videoId: 'vid_adv_001', day: 14, order: 1 },
      // Days 15-21: Returns
      { videoId: 'vid_int_005', day: 15, order: 1 },
      { videoId: 'vid_int_005', day: 16, order: 1 },
      { videoId: 'vid_int_005', day: 17, order: 1 },
      { videoId: 'vid_int_001', day: 18, order: 1 },
      { videoId: 'vid_int_001', day: 19, order: 1 },
      { videoId: 'vid_int_005', day: 20, order: 1 },
      { videoId: 'vid_adv_009', day: 21, order: 1 },
    ],
  },
  {
    programId: 'prog_dinking_excellence',
    name: 'Dinking Excellence',
    tagline: 'Master the soft game at the kitchen line',
    description: 'A specialized 21-day program focused entirely on dinking mastery. Learn patience, control, and strategic dinking to dominate at the net and win long rallies.',
    durationDays: 21,
    skillLevel: 'INTERMEDIATE' as SkillLevel,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: [
      'Consistent dink technique',
      'Cross-court dinking mastery',
      'Kitchen line positioning',
      'Dink reset shots',
      'Patience and control',
    ],
    dailyStructure: {
      days_1_7: 'Dinking fundamentals and technique',
      days_8_14: 'Advanced dinking patterns',
      days_15_21: 'Reset shots and kitchen line mastery',
    },
    videos: [
      // Days 1-7: Fundamentals
      { videoId: 'vid_bgn_006', day: 1, order: 1 },
      { videoId: 'vid_bgn_006', day: 2, order: 1 },
      { videoId: 'vid_int_002', day: 3, order: 1 },
      { videoId: 'vid_int_002', day: 4, order: 1 },
      { videoId: 'vid_int_002', day: 5, order: 1 },
      { videoId: 'vid_bgn_006', day: 6, order: 1 },
      { videoId: 'vid_int_002', day: 7, order: 1 },
      // Days 8-14: Advanced Patterns
      { videoId: 'vid_int_002', day: 8, order: 1 },
      { videoId: 'vid_adv_001', day: 9, order: 1 },
      { videoId: 'vid_int_002', day: 10, order: 1 },
      { videoId: 'vid_int_006', day: 11, order: 1 },
      { videoId: 'vid_int_002', day: 12, order: 1 },
      { videoId: 'vid_adv_001', day: 13, order: 1 },
      { videoId: 'vid_int_002', day: 14, order: 1 },
      // Days 15-21: Reset Shots
      { videoId: 'vid_adv_007', day: 15, order: 1 },
      { videoId: 'vid_adv_007', day: 16, order: 1 },
      { videoId: 'vid_adv_007', day: 17, order: 1 },
      { videoId: 'vid_int_004', day: 18, order: 1 },
      { videoId: 'vid_adv_007', day: 19, order: 1 },
      { videoId: 'vid_int_002', day: 20, order: 1 },
      { videoId: 'vid_adv_007', day: 21, order: 1 },
    ],
  },
  {
    programId: 'prog_competitive_edge',
    name: 'Competitive Edge',
    tagline: 'Tournament preparation and mental mastery',
    description: 'A comprehensive 30-day program for competitive players preparing for tournaments. Master the mental game, develop strategic patterns, and optimize your performance under pressure.',
    durationDays: 30,
    skillLevel: 'ADVANCED' as SkillLevel,
    estimatedTimePerDay: '20-25 minutes',
    keyOutcomes: [
      'Mental toughness and focus',
      'Tournament strategies',
      'Performance optimization',
      'Pre-match routines',
      'Competitive mindset',
    ],
    dailyStructure: {
      days_1_10: 'Mental game fundamentals',
      days_11_20: 'Tournament strategies and patterns',
      days_21_30: 'Performance optimization',
    },
    videos: [
      // Days 1-10: Mental Game
      { videoId: 'vid_adv_005', day: 1, order: 1 },
      { videoId: 'vid_adv_005', day: 2, order: 1 },
      { videoId: 'vid_adv_005', day: 3, order: 1 },
      { videoId: 'vid_int_010', day: 4, order: 1 },
      { videoId: 'vid_int_010', day: 5, order: 1 },
      { videoId: 'vid_adv_005', day: 6, order: 1 },
      { videoId: 'vid_adv_010', day: 7, order: 1 },
      { videoId: 'vid_adv_010', day: 8, order: 1 },
      { videoId: 'vid_adv_005', day: 9, order: 1 },
      { videoId: 'vid_int_010', day: 10, order: 1 },
      // Days 11-20: Tournament Strategies
      { videoId: 'vid_adv_009', day: 11, order: 1 },
      { videoId: 'vid_adv_009', day: 12, order: 1 },
      { videoId: 'vid_adv_009', day: 13, order: 1 },
      { videoId: 'vid_adv_004', day: 14, order: 1 },
      { videoId: 'vid_adv_004', day: 15, order: 1 },
      { videoId: 'vid_adv_008', day: 16, order: 1 },
      { videoId: 'vid_adv_008', day: 17, order: 1 },
      { videoId: 'vid_int_009', day: 18, order: 1 },
      { videoId: 'vid_adv_009', day: 19, order: 1 },
      { videoId: 'vid_adv_004', day: 20, order: 1 },
      // Days 21-30: Performance Optimization
      { videoId: 'vid_adv_010', day: 21, order: 1 },
      { videoId: 'vid_adv_010', day: 22, order: 1 },
      { videoId: 'vid_adv_010', day: 23, order: 1 },
      { videoId: 'vid_adv_005', day: 24, order: 1 },
      { videoId: 'vid_adv_009', day: 25, order: 1 },
      { videoId: 'vid_adv_010', day: 26, order: 1 },
      { videoId: 'vid_adv_004', day: 27, order: 1 },
      { videoId: 'vid_adv_010', day: 28, order: 1 },
      { videoId: 'vid_adv_005', day: 29, order: 1 },
      { videoId: 'vid_adv_010', day: 30, order: 1 },
    ],
  },
  {
    programId: 'prog_senior_friendly',
    name: 'Senior-Friendly Program',
    tagline: 'Low-impact, high-reward pickleball for 55+',
    description: 'A specially designed 30-day program for senior players focusing on low-impact techniques, joint-friendly movements, and smart strategies that minimize physical strain while maximizing effectiveness.',
    durationDays: 30,
    skillLevel: 'BEGINNER' as SkillLevel,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: [
      'Low-impact movement patterns',
      'Joint-friendly techniques',
      'Smart court positioning',
      'Injury prevention',
      'Sustainable play strategies',
    ],
    dailyStructure: {
      days_1_10: 'Warm-up and basic techniques',
      days_11_20: 'Smart positioning and movement',
      days_21_30: 'Strategy and injury prevention',
    },
    videos: [
      // Days 1-10: Warm-up and Basics
      { videoId: 'vid_snr_002', day: 1, order: 1 },
      { videoId: 'vid_snr_001', day: 2, order: 1 },
      { videoId: 'vid_bgn_001', day: 3, order: 1 },
      { videoId: 'vid_bgn_002', day: 4, order: 1 },
      { videoId: 'vid_snr_002', day: 5, order: 1 },
      { videoId: 'vid_snr_001', day: 6, order: 1 },
      { videoId: 'vid_bgn_003', day: 7, order: 1 },
      { videoId: 'vid_bgn_004', day: 8, order: 1 },
      { videoId: 'vid_snr_002', day: 9, order: 1 },
      { videoId: 'vid_snr_001', day: 10, order: 1 },
      // Days 11-20: Smart Positioning
      { videoId: 'vid_snr_003', day: 11, order: 1 },
      { videoId: 'vid_snr_003', day: 12, order: 1 },
      { videoId: 'vid_bgn_007', day: 13, order: 1 },
      { videoId: 'vid_bgn_007', day: 14, order: 1 },
      { videoId: 'vid_snr_003', day: 15, order: 1 },
      { videoId: 'vid_bgn_006', day: 16, order: 1 },
      { videoId: 'vid_bgn_006', day: 17, order: 1 },
      { videoId: 'vid_snr_003', day: 18, order: 1 },
      { videoId: 'vid_int_004', day: 19, order: 1 },
      { videoId: 'vid_snr_003', day: 20, order: 1 },
      // Days 21-30: Strategy and Safety
      { videoId: 'vid_snr_002', day: 21, order: 1 },
      { videoId: 'vid_snr_001', day: 22, order: 1 },
      { videoId: 'vid_int_010', day: 23, order: 1 },
      { videoId: 'vid_int_006', day: 24, order: 1 },
      { videoId: 'vid_snr_002', day: 25, order: 1 },
      { videoId: 'vid_snr_001', day: 26, order: 1 },
      { videoId: 'vid_bgn_008', day: 27, order: 1 },
      { videoId: 'vid_snr_003', day: 28, order: 1 },
      { videoId: 'vid_snr_002', day: 29, order: 1 },
      { videoId: 'vid_snr_001', day: 30, order: 1 },
    ],
  },
]

async function main() {
  console.log('\n🌱 Starting Training Programs Database Seed...\n')

  try {
    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing training data...')
    await prisma.programVideo.deleteMany({})
    await prisma.userProgram.deleteMany({})
    await prisma.trainingProgram.deleteMany({})
    await prisma.trainingVideo.deleteMany({})
    console.log('✅ Cleared existing data\n')

    // Step 2: Seed Training Videos
    console.log('📹 Seeding training videos...')
    const videoMap = new Map<string, any>()
    
    for (const videoData of trainingVideos) {
      const video = await prisma.trainingVideo.create({
        data: {
          videoId: videoData.videoId,
          title: videoData.title,
          url: videoData.url,
          channel: videoData.channel,
          duration: videoData.duration,
          description: videoData.description,
          skillLevel: videoData.skillLevel,
          primaryTopic: videoData.primaryTopic,
          secondaryTopics: videoData.secondaryTopics,
          thumbnailUrl: videoData.thumbnailUrl,
        },
      })
      videoMap.set(videoData.videoId, video)
      console.log(`   ✓ ${video.title} (${video.channel})`)
    }
    console.log(`\n✅ Seeded ${trainingVideos.length} training videos\n`)

    // Step 3: Seed Training Programs with Videos
    console.log('📚 Seeding training programs...')
    
    for (const programData of trainingProgramsData) {
      const program = await prisma.trainingProgram.create({
        data: {
          programId: programData.programId,
          name: programData.name,
          tagline: programData.tagline,
          description: programData.description,
          durationDays: programData.durationDays,
          skillLevel: programData.skillLevel,
          estimatedTimePerDay: programData.estimatedTimePerDay,
          keyOutcomes: programData.keyOutcomes,
          dailyStructure: programData.dailyStructure,
          isActive: true,
        },
      })

      // Create program video associations
      for (const videoLink of programData.videos) {
        const video = videoMap.get(videoLink.videoId)
        if (video) {
          await prisma.programVideo.create({
            data: {
              programId: program.id,
              videoId: video.id,
              day: videoLink.day,
              order: videoLink.order,
            },
          })
        }
      }

      console.log(`   ✓ ${program.name} (${program.durationDays} days, ${programData.videos.length} videos)`)
    }
    console.log(`\n✅ Seeded ${trainingProgramsData.length} training programs\n`)

    // Step 4: Summary
    console.log('\n📊 Training Data Summary:')
    console.log('═'.repeat(50))
    
    const videosByLevel = await prisma.trainingVideo.groupBy({
      by: ['skillLevel'],
      _count: true,
    })
    console.log('\n📹 Videos by Skill Level:')
    videosByLevel.forEach(({ skillLevel, _count }) => {
      console.log(`   ${skillLevel}: ${_count} videos`)
    })

    const programsByLevel = await prisma.trainingProgram.groupBy({
      by: ['skillLevel'],
      _count: true,
    })
    console.log('\n📚 Programs by Skill Level:')
    programsByLevel.forEach(({ skillLevel, _count }) => {
      console.log(`   ${skillLevel}: ${_count} programs`)
    })

    const totalDays = trainingProgramsData.reduce((sum, p) => sum + p.durationDays, 0)
    console.log(`\n📅 Total Training Days: ${totalDays} days`)
    console.log(`📹 Total Videos: ${trainingVideos.length}`)
    console.log(`📚 Total Programs: ${trainingProgramsData.length}\n`)
    console.log('═'.repeat(50))

    console.log('\n✨ Training Programs Database Seed Completed Successfully!\n')
  } catch (error) {
    console.error('\n❌ Seed Failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
