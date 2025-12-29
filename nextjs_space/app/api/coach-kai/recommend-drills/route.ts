// Coach Kai Drill Recommendation API
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { searchDrills, extractSkillArea } from '@/lib/coach-kai/function-tools'

// Goal category to drill category mapping (duplicated for this route)
const GOAL_TO_DRILL_MAP: Record<string, string[]> = {
  'SERVE_IMPROVEMENT': ['serving'],
  'DINK_MASTERY': ['dinking', 'resets'],
  'THIRD_SHOT_DROPS': ['third-shot', 'strategy'],
  'TECHNIQUE': ['serving', 'dinking', 'third-shot', 'volley'],
  'FITNESS': ['footwork', 'conditioning'],
  'MENTAL': ['mental', 'strategy'],
  'COMPETITION': ['strategy', 'mental', 'warmup']
}
import { drillsDatabase } from '@/lib/drills-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { goalCategory, skillArea, query, limit = 5 } = await request.json()

    // Get user's skill level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { skillLevel: true }
    })

    // Determine the search category
    let searchCategory = goalCategory || skillArea
    if (query && !searchCategory) {
      searchCategory = extractSkillArea(query)
    }

    // Search for matching drills
    const drills = searchDrills({
      category: searchCategory,
      skillLevel: user?.skillLevel || 'INTERMEDIATE',
      limit: limit
    })

    return NextResponse.json({
      success: true,
      drills: drills.map(d => ({
        id: d.id,
        name: d.name,
        tagline: d.tagline,
        description: d.description,
        category: d.category,
        difficulty: d.difficulty,
        duration: d.duration,
        focusAreas: d.focusAreas,
        benefits: d.benefits,
        videoDemos: d.videoDemos?.slice(0, 1) || [],
        url: `/train/drills?drill=${d.id}`
      })),
      totalAvailable: drillsDatabase.filter(d => {
        if (!searchCategory) return true
        const categories = GOAL_TO_DRILL_MAP[searchCategory] || [searchCategory.toLowerCase()]
        return categories.includes(d.category as any)
      }).length,
      browseUrl: `/train/drills${searchCategory ? `?category=${searchCategory.toLowerCase()}` : ''}`
    })
  } catch (error: any) {
    console.error('Drill recommendation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to recommend drills' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const goalId = searchParams.get('goalId')

    // Get user's skill level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { skillLevel: true }
    })

    let searchCategory = category

    // If goalId provided, get goal's category
    if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        select: { category: true }
      })
      if (goal) {
        searchCategory = goal.category
      }
    }

    const drills = searchDrills({
      category: searchCategory || undefined,
      skillLevel: user?.skillLevel || 'INTERMEDIATE',
      limit: 10
    })

    return NextResponse.json({
      drills: drills.map(d => ({
        id: d.id,
        name: d.name,
        tagline: d.tagline,
        category: d.category,
        difficulty: d.difficulty,
        duration: d.duration
      }))
    })
  } catch (error: any) {
    console.error('Drill recommendation GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get drills' }, { status: 500 })
  }
}
