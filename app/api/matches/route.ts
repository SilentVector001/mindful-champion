
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const matches = await prisma.match.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Failed to fetch matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      opponent, 
      playerScore, 
      opponentScore, 
      score, 
      result, 
      duration, 
      rallies, 
      location, 
      notes 
    } = body

    const match = await prisma.match.create({
      data: {
        userId: session.user.id,
        opponent,
        playerScore,
        opponentScore,
        score,
        result,
        duration,
        rallies,
        location,
        notes
      }
    })

    // Update user stats
    const totalMatches = await prisma.match.count({
      where: { userId: session.user.id }
    })

    const totalWins = await prisma.match.count({
      where: { 
        userId: session.user.id,
        result: 'WIN'
      }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalMatches,
        totalWins,
        lastActiveDate: new Date()
      }
    })

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Failed to create match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}
