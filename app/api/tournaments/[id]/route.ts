
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { registrations: true }
        },
        registrations: session.user.id ? {
          where: { userId: session.user.id },
          select: {
            id: true,
            status: true,
            skillLevel: true,
            format: true,
            partnerName: true,
            registeredAt: true
          }
        } : false
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const response = {
      ...tournament,
      isRegistered: tournament.registrations && tournament.registrations.length > 0,
      userRegistration: tournament.registrations?.[0] || null,
      spotsAvailable: tournament.maxParticipants 
        ? tournament.maxParticipants - tournament.currentRegistrations 
        : null
    }

    return NextResponse.json({ tournament: response })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}
