
// Coaching Journey Service
// Transforms video watching into comprehensive coaching experiences

import { TrainingStage, CoachingJourney, JourneyMilestone, PracticeChallenge, SkillAssessment, ReflectionPrompt } from '../types/training-stages'

class CoachingJourneyService {
  
  // Generate comprehensive coaching journey from basic program
  static transformProgramToJourney(program: any, userProgram: any, programVideos: any[]): CoachingJourney {
    const stages = this.generateCoachingStages(program, programVideos)
    const milestones = this.generateJourneyMilestones(program, stages)
    const skillProgression = this.generateSkillProgression(program)
    
    const currentStage = userProgram?.currentDay || 1
    const completedStages = stages.filter((_, index) => index < currentStage - 1).length
    const overallProgress = Math.round((completedStages / stages.length) * 100)
    
    return {
      id: `journey_${program.id}_${userProgram?.userId}`,
      programId: program.id,
      userId: userProgram?.userId,
      currentStage,
      totalStages: stages.length,
      overallProgress,
      stages,
      milestones,
      skillProgression,
      nextRecommendation: this.generateNextRecommendation(stages, currentStage)
    }
  }

  // Transform simple day-based videos into multi-stage coaching experiences
  static generateCoachingStages(program: any, programVideos: any[]): TrainingStage[] {
    const stages: TrainingStage[] = []
    const videosByDay = this.groupVideosByDay(programVideos)
    const totalDays = program.durationDays || 7

    for (let day = 1; day <= totalDays; day++) {
      const dayVideos = videosByDay[day] || []
      const stageTypes = this.determineStageTypes(day, totalDays, dayVideos.length)

      stageTypes.forEach((stageType, stageIndex) => {
        const stage = this.createStageForDay(day, stageIndex, stageType, dayVideos, program)
        stages.push(stage)
      })
    }

    return stages
  }

  // Determine what types of stages each day should have
  static determineStageTypes(day: number, totalDays: number, videoCount: number): string[] {
    const stages = ['LEARN'] // Always start with learning
    
    // Add practice after learning content
    if (videoCount > 0) stages.push('PRACTICE')
    
    // Add assessment every few days
    if (day % 3 === 0 || day === totalDays) stages.push('ASSESS')
    
    // Add challenges for intermediate and advanced content
    if (day > 2 && day % 4 === 0) stages.push('CHALLENGE')
    
    // Add reflection on final day and mid-program
    if (day === totalDays || day === Math.ceil(totalDays / 2)) stages.push('REFLECT')
    
    return stages
  }

  // Create specific stage content
  static createStageForDay(day: number, stageIndex: number, stageType: string, videos: any[], program: any): TrainingStage {
    const stageId = `${program.id}_day${day}_stage${stageIndex}_${stageType.toLowerCase()}`
    
    const stageConfigs = {
      LEARN: {
        name: `Day ${day}: Master the Fundamentals`,
        description: 'Learn key concepts and techniques through expert instruction',
        requirements: videos.map(video => ({
          type: 'VIDEO_WATCH' as const,
          target: video.id,
          progress: 0,
          isCompleted: false
        })),
        rewards: [
          { type: 'POINTS' as const, value: '10', description: 'Knowledge Points' },
          { type: 'NEXT_STAGE' as const, value: 'unlock', description: 'Unlock Practice Stage' }
        ],
        estimatedDuration: videos.reduce((total, v) => total + (parseInt(v.duration) || 5), 0),
        icon: 'BookOpen'
      },
      PRACTICE: {
        name: `Day ${day}: Apply Your Skills`,
        description: 'Practice the techniques you just learned with guided exercises',
        requirements: [
          {
            type: 'PRACTICE_LOG' as const,
            target: 'practice_session',
            progress: 0,
            isCompleted: false
          }
        ],
        rewards: [
          { type: 'POINTS' as const, value: '15', description: 'Practice Points' },
          { type: 'BADGE' as const, value: 'practice_warrior', description: 'Practice Warrior' }
        ],
        estimatedDuration: 20,
        icon: 'Target'
      },
      ASSESS: {
        name: `Day ${day}: Check Your Progress`,
        description: 'Assess your understanding and identify areas for improvement',
        requirements: [
          {
            type: 'SKILL_ASSESSMENT' as const,
            target: `assessment_day${day}`,
            progress: 0,
            isCompleted: false
          }
        ],
        rewards: [
          { type: 'POINTS' as const, value: '25', description: 'Assessment Points' },
          { type: 'SKILL_UNLOCK' as const, value: 'next_level', description: 'Skill Advancement' }
        ],
        estimatedDuration: 10,
        icon: 'CheckCircle'
      },
      CHALLENGE: {
        name: `Day ${day}: Rise to the Challenge`,
        description: 'Test your skills with a focused challenge designed to push your limits',
        requirements: [
          {
            type: 'CHALLENGE_COMPLETE' as const,
            target: `challenge_day${day}`,
            progress: 0,
            isCompleted: false
          }
        ],
        rewards: [
          { type: 'POINTS' as const, value: '50', description: 'Challenge Points' },
          { type: 'BADGE' as const, value: 'challenge_champion', description: 'Challenge Champion' }
        ],
        estimatedDuration: 30,
        icon: 'Trophy'
      },
      REFLECT: {
        name: `Day ${day}: Reflect on Your Journey`,
        description: 'Take time to reflect on your progress and set goals for continued improvement',
        requirements: [
          {
            type: 'REFLECTION_SUBMIT' as const,
            target: `reflection_day${day}`,
            progress: 0,
            isCompleted: false
          }
        ],
        rewards: [
          { type: 'POINTS' as const, value: '20', description: 'Reflection Points' },
          { type: 'BADGE' as const, value: 'mindful_champion', description: 'Mindful Champion' }
        ],
        estimatedDuration: 15,
        icon: 'Brain'
      }
    }

    const config = stageConfigs[stageType as keyof typeof stageConfigs]
    
    return {
      id: stageId,
      name: config.name,
      type: stageType as any,
      description: config.description,
      order: (day - 1) * 10 + stageIndex,
      requirements: config.requirements,
      rewards: config.rewards,
      estimatedDuration: config.estimatedDuration,
      isUnlocked: day === 1 && stageIndex === 0, // Only first stage unlocked initially
      isCompleted: false,
      icon: config.icon
    }
  }

  // Generate meaningful milestones throughout the journey
  static generateJourneyMilestones(program: any, stages: TrainingStage[]): JourneyMilestone[] {
    const totalDays = program.durationDays || 7
    const milestones: JourneyMilestone[] = []

    // Early milestone - Foundation Builder
    milestones.push({
      id: `${program.id}_milestone_foundation`,
      name: 'Foundation Builder',
      description: 'You\'ve mastered the fundamentals and built a solid foundation',
      requiredStages: stages.slice(0, Math.ceil(stages.length * 0.3)).map(s => s.id),
      isAchieved: false,
      badge: 'foundation_builder',
      points: 100
    })

    // Mid-program milestone - Skill Developer
    milestones.push({
      id: `${program.id}_milestone_developer`,
      name: 'Skill Developer',
      description: 'You\'re developing advanced skills and consistent technique',
      requiredStages: stages.slice(0, Math.ceil(stages.length * 0.6)).map(s => s.id),
      isAchieved: false,
      badge: 'skill_developer',
      points: 200
    })

    // Advanced milestone - Technique Master
    milestones.push({
      id: `${program.id}_milestone_master`,
      name: 'Technique Master',
      description: 'You\'ve mastered advanced techniques and are ready for competition',
      requiredStages: stages.slice(0, Math.ceil(stages.length * 0.9)).map(s => s.id),
      isAchieved: false,
      badge: 'technique_master',
      points: 300
    })

    // Final milestone - Program Champion
    milestones.push({
      id: `${program.id}_milestone_champion`,
      name: `${program.name} Champion`,
      description: 'Congratulations! You\'ve completed the entire coaching journey',
      requiredStages: stages.map(s => s.id),
      isAchieved: false,
      badge: 'program_champion',
      points: 500
    })

    return milestones
  }

  // Generate skill progression tracking
  static generateSkillProgression(program: any) {
    const skillAreas = this.getSkillAreasForProgram(program)
    
    return skillAreas.map(skill => ({
      skillName: skill.name,
      currentLevel: 1,
      maxLevel: 5,
      progressPercentage: 0,
      recentImprovement: 0
    }))
  }

  // Get relevant skill areas based on program focus
  static getSkillAreasForProgram(program: any) {
    const commonSkills = [
      { name: 'Technique', focus: 'Form and execution' },
      { name: 'Strategy', focus: 'Game understanding' },
      { name: 'Consistency', focus: 'Reliable performance' },
      { name: 'Mental Game', focus: 'Focus and confidence' }
    ]

    // Add specific skills based on program name/type
    if (program.name.toLowerCase().includes('serve')) {
      commonSkills.push({ name: 'Serve Power', focus: 'Serving strength' })
      commonSkills.push({ name: 'Serve Placement', focus: 'Serving accuracy' })
    }
    
    if (program.name.toLowerCase().includes('dink')) {
      commonSkills.push({ name: 'Dink Control', focus: 'Soft game mastery' })
      commonSkills.push({ name: 'Kitchen Play', focus: 'Net strategy' })
    }

    return commonSkills
  }

  // Generate smart next recommendation
  static generateNextRecommendation(stages: TrainingStage[], currentStage: number): string {
    const nextStage = stages[currentStage - 1]
    if (!nextStage) return "Complete your current program to unlock new challenges!"

    const recommendations = {
      LEARN: "Ready to learn something new? Watch the expert instruction videos to master key concepts.",
      PRACTICE: "Time to apply what you've learned! Practice the techniques with our guided exercises.",
      ASSESS: "Let's check your progress! Take the skill assessment to see how much you've improved.",
      CHALLENGE: "Ready for a challenge? Test your skills and push your limits!",
      REFLECT: "Take a moment to reflect on your journey and set goals for continued growth."
    }

    return recommendations[nextStage.type] || "Continue your coaching journey to unlock new skills!"
  }

  // Helper methods
  static groupVideosByDay(videos: any[]) {
    return videos.reduce((acc, video) => {
      const day = video.dayNumber || video.day || 1
      if (!acc[day]) acc[day] = []
      acc[day].push(video)
      return acc
    }, {} as Record<number, any[]>)
  }

  // Generate practice challenges
  static generatePracticeChallenge(stageId: string, program: any): PracticeChallenge {
    const challengeTemplates = {
      accuracy: {
        name: 'Precision Challenge',
        description: 'Hit specific targets with consistent accuracy',
        type: 'ACCURACY',
        requirements: ['Set up target zones', 'Perform 20 shots', 'Track accuracy percentage'],
        successCriteria: ['Achieve 70%+ accuracy', 'Maintain consistent form'],
        estimatedAttempts: 3
      },
      consistency: {
        name: 'Consistency Challenge', 
        description: 'Maintain technique over extended practice session',
        type: 'CONSISTENCY',
        requirements: ['Practice for 15 minutes', 'Focus on technique', 'Track performance consistency'],
        successCriteria: ['No major form breakdowns', 'Consistent shot quality'],
        estimatedAttempts: 2
      }
    }

    const template = challengeTemplates.accuracy // Default template
    
    return {
      id: `challenge_${stageId}`,
      name: template.name,
      description: template.description,
      type: template.type as any,
      difficulty: program.skillLevel.toUpperCase() as any,
      requirements: template.requirements,
      successCriteria: template.successCriteria,
      estimatedAttempts: template.estimatedAttempts,
      currentAttempts: 0,
      isCompleted: false
    }
  }

  // Generate skill assessments
  static generateSkillAssessment(stageId: string, program: any): SkillAssessment {
    return {
      id: `assessment_${stageId}`,
      name: `${program.name} - Progress Check`,
      description: 'Assess your understanding and skill development',
      questions: [
        {
          id: '1',
          question: 'How confident do you feel about the techniques covered in this section?',
          type: 'SELF_RATING',
          options: ['1 - Not confident', '2 - Somewhat confident', '3 - Confident', '4 - Very confident', '5 - Extremely confident']
        },
        {
          id: '2', 
          question: 'Which aspect needs the most improvement?',
          type: 'MULTIPLE_CHOICE',
          options: ['Technique', 'Timing', 'Consistency', 'Power', 'Placement']
        }
      ],
      passingScore: 70,
      attempts: 0,
      maxAttempts: 3,
      isCompleted: false
    }
  }

  // Generate reflection prompts
  static generateReflectionPrompt(stageId: string, program: any): ReflectionPrompt {
    const prompts = [
      'What was the most valuable insight you gained from this training session?',
      'Which technique felt most natural to you, and which was most challenging?',
      'How will you apply what you learned in your next game or practice session?',
      'What specific goal do you want to focus on in your continued training?',
      'Rate your overall satisfaction with your progress (1-10) and explain why.'
    ]

    return {
      id: `reflection_${stageId}`,
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      type: 'TEXT',
      isRequired: true
    }
  }
}

export default CoachingJourneyService
