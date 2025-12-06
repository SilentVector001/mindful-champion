
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic';

// Intelligent partner matching algorithm
function calculateMatchScore(user: any, partner: any): number {
  let score = 0
  
  // Skill level match (30 points)
  const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']
  const userSkillIndex = skillLevels.indexOf(user.skillLevel || 'BEGINNER')
  const partnerSkillIndex = skillLevels.indexOf(partner.skillLevel || 'BEGINNER')
  const skillDiff = Math.abs(userSkillIndex - partnerSkillIndex)
  
  if (skillDiff === 0) score += 30
  else if (skillDiff === 1) score += 20
  else if (skillDiff === 2) score += 10
  
  // Common goals (25 points)
  const userGoals = Array.isArray(user.primaryGoals) ? user.primaryGoals.map(String) : []
  const partnerGoals = Array.isArray(partner.primaryGoals) ? partner.primaryGoals.map(String) : []
  const commonGoals = userGoals.filter((goal: string) => partnerGoals.includes(goal))
  score += Math.min(commonGoals.length * 8, 25)
  
  // Playing style compatibility (15 points)
  if (user.coachingStylePreference && partner.coachingStylePreference) {
    if (user.coachingStylePreference === partner.coachingStylePreference) {
      score += 15
    }
  }
  
  // Availability match (15 points)
  const userDays = Array.isArray(user.preferredDays) ? user.preferredDays.map(String) : []
  const partnerDays = Array.isArray(partner.preferredDays) ? partner.preferredDays.map(String) : []
  const commonDays = userDays.filter((day: string) => partnerDays.includes(day))
  score += Math.min(commonDays.length * 3, 15)
  
  // Location proximity (15 points) - if both have locations
  if (user.location && partner.location) {
    // Simple match for now - in production, use geolocation
    if (user.location.toLowerCase() === partner.location.toLowerCase()) {
      score += 15
    } else if (user.location.toLowerCase().includes(partner.location.toLowerCase()) || 
               partner.location.toLowerCase().includes(user.location.toLowerCase())) {
      score += 10
    }
  }
  
  return Math.min(score, 100)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user with onboarding data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        skillLevel: true,
        location: true,
        primaryGoals: true,
        coachingStylePreference: true,
        preferredDays: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Find other users (potential partners)
    const potentialPartners = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        onboardingCompleted: true,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        skillLevel: true,
        playerRating: true,
        location: true,
        primaryGoals: true,
        coachingStylePreference: true,
        preferredDays: true,
        lastActiveDate: true,
      },
      take: 50
    })

    // Calculate match scores and transform data
    const partners = potentialPartners.map(partner => {
      const matchScore = calculateMatchScore(user, partner)
      
      // Extract common goals
      const userGoals = Array.isArray(user.primaryGoals) ? user.primaryGoals.map(String) : []
      const partnerGoals = Array.isArray(partner.primaryGoals) ? partner.primaryGoals.map(String) : []
      const commonGoals = userGoals.filter((goal: string) => partnerGoals.includes(goal))
      
      // Extract common days
      const userDays = Array.isArray(user.preferredDays) ? user.preferredDays.map(String) : []
      const partnerDays = Array.isArray(partner.preferredDays) ? partner.preferredDays.map(String) : []
      const commonDays = userDays.filter((day: string) => partnerDays.includes(day))
      
      // Calculate approximate distance (mock for now)
      let distance: number | undefined = undefined
      if (user.location && partner.location) {
        // In production, use actual geolocation calculation
        distance = Math.random() * 20 + 1 // Mock distance 1-21 km
      }
      
      return {
        id: partner.id,
        name: partner.name || `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || 'Anonymous Player',
        rating: parseFloat(partner.playerRating || '2.0'),
        skillLevel: partner.skillLevel || 'BEGINNER',
        location: partner.location,
        distance,
        isAvailable: partner.lastActiveDate ? 
          (Date.now() - new Date(partner.lastActiveDate).getTime()) < 7 * 24 * 60 * 60 * 1000 : 
          true,
        lastSeen: partner.lastActiveDate,
        matchScore,
        commonGoals,
        playingStyle: partner.coachingStylePreference,
        availability: commonDays.length > 0 ? commonDays : partnerDays,
      }
    })

    // Sort by match score
    partners.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      partners,
      message: "Partners loaded successfully"
    })

  } catch (error) {
    console.error("[PARTNERS_FIND_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to find partners" },
      { status: 500 }
    )
  }
}
